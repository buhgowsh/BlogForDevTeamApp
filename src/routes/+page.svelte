<script lang="ts">
  import { onMount } from "svelte";
  import { _getDiscordInfo, _getPosts, _addPost } from "./+server";
  import type { DiscordResponseInfo } from "$lib/types";
  import type { Post } from "$lib/interfaces";
  import PostComponent from "./Post.svelte";

  const pfp: string = "/buhgurt.png";
  let discordData: DiscordResponseInfo | null = null;
  let posts: Post[] = [];
  let isLoading = true;
  let error: string | null = null;

  let showPostForm = false;
  let newPostContent = "";
  let newPostAuthor = "";
  let isCreatingPost = false;
  let createPostError: string | null = null;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      const [discordInfo, postsData] = await Promise.all([
        _getDiscordInfo(),
        _getPosts(),
      ]);

      if (discordInfo) discordData = discordInfo;
      if (postsData) posts = postsData;
    } catch (err) {
      error = "Failed to load data. Please try again later.";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case "online":
        return "Online";
      case "idle":
        return "Idle";
      case "dnd":
        return "Do Not Disturb";
      default:
        return "Offline";
    }
  }

  async function handleCreatePost() {
    if (!newPostContent.trim()) {
      createPostError = "Please enter some content for your post";
      return;
    }

    isCreatingPost = true;
    createPostError = null;

    try {
      const newPostId = await _addPost(
        newPostContent,
        newPostAuthor.trim() || undefined,
      );

      if (newPostId) {
        showPostForm = false;
        newPostContent = "";
        newPostAuthor = "";
        await loadData();
      }
    } catch (err) {
      createPostError = "An error occurred while creating the post.";
      console.error(err);
    } finally {
      isCreatingPost = false;
    }
  }
</script>

<div class="min-h-screen bg-black text-base-content">
  <div class="container mx-auto px-4 py-8">
    <!-- Main layout with sidebar on left -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Left Sidebar (Discord Profile) -->
      <aside class="lg:w-1/3 lg:sticky lg:top-8 self-start">
        <div class="space-y-6">
          <!-- Discord Profile Card -->
          <div class="card bg-black-light shadow-xl border border-base-300">
            <div class="card-body p-6">
              {#if discordData}
                <!-- Profile Header -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <div class="avatar">
                      <div
                        class="w-16 h-16 rounded-full ring-2 ring-purple ring-offset-2 ring-offset-black"
                      >
                        <img
                          src={pfp}
                          alt="Discord Avatar"
                          class="rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div class="absolute bottom-0 right-0">
                      <div
                        class={`w-4 h-4 rounded-full border-2 border-black ${getStatusColor(discordData.discord_status)}`}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold">
                      <span class="text-purple">#</span>{discordData
                        .discord_user.username}
                    </h2>
                    <div class="flex items-center gap-2 mt-1">
                      <div
                        class={`w-2 h-2 rounded-full ${getStatusColor(discordData.discord_status)}`}
                      ></div>
                      <span class="text-sm opacity-80"
                        >{getStatusText(discordData.discord_status)}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Active Status -->
                <div class="space-y-4">
                  <h3 class="text-sm font-semibold uppercase opacity-70">
                    ACTIVE ON
                  </h3>
                  <div class="space-y-3">
                    <div
                      class="flex items-center justify-between p-3 bg-base-300 rounded-lg"
                    >
                      <span class="text-sm font-medium">Desktop</span>
                      <div>
                        {#if discordData.active_on_discord_desktop}
                          <span class="badge badge-success badge-sm"
                            >Active</span
                          >
                        {:else}
                          <span class="badge badge-neutral badge-sm"
                            >Inactive</span
                          >
                        {/if}
                      </div>
                    </div>
                    <div
                      class="flex items-center justify-between p-3 bg-base-300 rounded-lg"
                    >
                      <span class="text-sm font-medium">Mobile</span>
                      <div>
                        {#if discordData.active_on_discord_mobile}
                          <span class="badge badge-success badge-sm"
                            >Active</span
                          >
                        {:else}
                          <span class="badge badge-neutral badge-sm"
                            >Inactive</span
                          >
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {:else}
                <!-- Loading skeleton -->
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="skeleton h-16 w-16 rounded-full"></div>
                    <div class="space-y-2">
                      <div class="skeleton h-4 w-32"></div>
                      <div class="skeleton h-3 w-24"></div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="skeleton h-4 w-24"></div>
                    <div class="skeleton h-12 w-full rounded"></div>
                    <div class="skeleton h-12 w-full rounded"></div>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- About Me Card -->
          <div class="card bg-black-light shadow-xl border border-base-300">
            <div class="card-body p-6">
              <h3 class="text-lg font-semibold mb-4">
                About <span class="text-purple">Me</span>
              </h3>
              <p class="opacity-90 leading-relaxed">
                Developer, gamer, and content creator. Sharing thoughts,
                projects, and whatever else comes to mind.
              </p>
              <div class="mt-4 pt-4 border-t border-base-300">
                <div class="flex items-center gap-2 text-sm opacity-80">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Always open to chat!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content (Posts) -->
      <main class="lg:w-2/3">
        <!-- Header with Create Post button -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-4xl font-bold mb-2">
                Blog<span class="text-purple">owsh</span>
              </h1>
              <p class="opacity-80">
                Thoughts, ideas, and updates from my corner of the internet.
              </p>
            </div>

            <button
              onclick={() => (showPostForm = true)}
              class="btn btn-primary gap-2 bg-purple hover:bg-purple-dark border-purple"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Post</span>
            </button>
          </div>
        </div>

        <!-- Create Post Modal -->
        {#if showPostForm}
          <div
            class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <div
              class="card bg-black-light shadow-2xl w-full max-w-2xl border border-base-300"
            >
              <div class="card-body p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="card-title text-xl">Create New Post</h2>
                  <button
                    onclick={() => (showPostForm = false)}
                    class="btn btn-ghost btn-sm"
                    disabled={isCreatingPost}
                    aria-label="Create New Post"
                  >
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {#if createPostError}
                  <div class="alert alert-error mb-4">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{createPostError}</span>
                  </div>
                {/if}

                <form onsubmit={handleCreatePost} class="space-y-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Author Name (optional)</span>
                    </label>
                    <input
                      type="text"
                      bind:value={newPostAuthor}
                      class="input input-bordered bg-base-300 border-base-300"
                      placeholder="Your name (or leave blank for anonymous)"
                      disabled={isCreatingPost}
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Post Content *</span>
                      <span class="label-text-alt opacity-70"
                        >{newPostContent.length}/5000</span
                      >
                    </label>
                    <textarea
                      bind:value={newPostContent}
                      rows={4}
                      class="textarea textarea-bordered resize-none bg-base-300 border-base-300"
                      placeholder="Imk your thoughts twin..."
                      required
                      disabled={isCreatingPost}
                      maxlength="5000"
                    ></textarea>
                  </div>

                  <div
                    class="flex items-center justify-end gap-2 pt-4 border-t border-base-300"
                  >
                    <button
                      type="button"
                      onclick={() => (showPostForm = false)}
                      class="btn btn-ghost"
                      disabled={isCreatingPost}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary bg-purple hover:bg-purple-dark border-purple"
                      disabled={isCreatingPost || !newPostContent.trim()}
                    >
                      {#if isCreatingPost}
                        <span class="loading loading-spinner loading-sm"></span>
                        Posting...
                      {:else}
                        Post
                      {/if}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        {/if}

        <!-- Posts List -->
        {#if isLoading}
          <div class="space-y-4">
            {#each Array(3) as _, i}
              <div class="card bg-black-light shadow border border-base-300">
                <div class="card-body p-4">
                  <div class="skeleton h-4 w-3/4 mb-3"></div>
                  <div class="skeleton h-4 w-full mb-2"></div>
                  <div class="skeleton h-4 w-2/3 mb-2"></div>
                  <div class="flex items-center mt-4">
                    <div class="skeleton h-4 w-20 mr-4"></div>
                    <div class="skeleton h-4 w-16"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if error}
          <div class="card bg-black-light shadow border border-base-300">
            <div class="card-body">
              <div class="alert alert-error">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p>{error}</p>
                </div>
                <button onclick={loadData} class="btn btn-ghost btn-sm"
                  >Try Again</button
                >
              </div>
            </div>
          </div>
        {:else if posts.length === 0}
          <div class="card bg-black-light shadow border border-base-300">
            <div class="card-body text-center py-8">
              <svg
                class="w-12 h-12 opacity-50 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 class="text-lg font-semibold mb-2">No posts yet</h3>
              <p class="opacity-80 mb-4">Be the first to share something!</p>
              <button
                onclick={() => (showPostForm = true)}
                class="btn btn-primary btn-sm bg-purple hover:bg-purple-dark border-purple"
              >
                Create Your First Post
              </button>
            </div>
          </div>
        {:else}
          <div class="space-y-4">
            {#each posts as post}
              <PostComponent details={post} />
            {/each}
          </div>
        {/if}
      </main>
    </div>
  </div>
</div>
