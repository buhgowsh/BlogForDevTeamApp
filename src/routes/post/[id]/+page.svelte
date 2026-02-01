<script lang="ts">
  import { onMount } from "svelte";
  import {
    _getPosts,
    _getComments,
    _addComment,
    _addLike,
  } from "../../+server";
  import type { Post, Comment } from "$lib/interfaces";
  import CommentComponent from "./Comment.svelte";
  import { _getDiscordInfo } from "../../+server";
  import type { DiscordResponseInfo } from "$lib/types";

  // Use $state for reactive variables in Svelte 5
  let post: Post | null = $state(null);
  let comments: Comment[] = $state([]);
  let isLoading = $state(true);
  let error: string | null = $state(null);

  // Discord data
  const pfp: string = "/buhgurt.png";
  let discordData: DiscordResponseInfo | null = $state(null);

  // variables for adding a new comment
  let newComment = $state("");
  let commentAuthor = $state("");
  let isSubmitting = $state(false);
  let submitError: string | unknown = $state("");

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      const [discordInfo] = await Promise.all([
        _getDiscordInfo(),
        loadPostData(),
      ]);

      if (discordInfo) discordData = discordInfo;
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPostData() {
    isLoading = true;
    error = null;

    try {
      // Get the post ID from the URL using window.location
      const path = window.location.pathname;
      const postId = parseInt(path.split("/").pop() || "");

      if (isNaN(postId)) {
        throw new Error("Invalid post ID");
      }

      // Load the post and comments
      const [postsData, commentsData] = await Promise.all([
        _getPosts(),
        _getComments(postId),
      ]);

      if (postsData) {
        // Find the specific post
        const foundPost = postsData.find((p) => p.PostID === postId);
        if (foundPost) {
          post = foundPost;
        } else {
          throw new Error("Post not found");
        }
      }

      if (commentsData) {
        comments = commentsData;
      }
    } catch (err) {
      error = "Failed to load post data. Please try again later.";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  async function handleSubmit() {
    if (!newComment.trim()) {
      submitError = "Please enter a comment";
      return;
    }

    if (!post) {
      submitError = "Cannot comment on an invalid post";
      return;
    }

    isSubmitting = true;
    submitError = "";

    try {
      const result = await _addComment(
        newComment,
        post.PostID,
        commentAuthor.trim() || undefined,
      );

      if (result === "") {
        // Success - reload comments
        const commentsData = await _getComments(post.PostID);
        if (commentsData) {
          comments = commentsData;
        }
        newComment = "";
        commentAuthor = "";
      } else {
        submitError = result;
      }
    } catch (err) {
      submitError = "Failed to submit comment";
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }

  async function handlePostLike() {
    if (!post) return;

    const newLikes = await _addLike(1, 0, post.PostID);
    if (typeof newLikes === "number") {
      post.Likes = newLikes;
    }
  }

  async function handlePostDislike() {
    if (!post) return;

    const newLikes = await _addLike(-1, 0, post.PostID);
    if (typeof newLikes === "number") {
      post.Likes = newLikes;
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

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/,/g, "");
  }
</script>

<div class="min-h-screen bg-black text-base-content">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Left Sidebar -->
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

          <!-- Back to Posts Button -->
          <div class="card bg-black-light shadow-xl border border-base-300">
            <div class="card-body p-6">
              <a
                href="/"
                class="btn btn-primary w-full gap-2 bg-purple hover:bg-purple-dark border-purple"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Posts</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:w-2/3">
        {#if isLoading}
          <!-- Loading State -->
          <div class="space-y-6">
            <!-- Loading skeleton for post -->
            <div class="card bg-black-light shadow-xl border border-base-300">
              <div class="card-body p-6">
                <div class="skeleton h-8 w-3/4 mb-4"></div>
                <div class="space-y-3 mb-6">
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-5/6"></div>
                  <div class="skeleton h-4 w-4/6"></div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="skeleton h-6 w-32"></div>
                  <div class="skeleton h-6 w-24"></div>
                </div>
              </div>
            </div>

            <!-- Loading skeleton for comments -->
            <div class="card bg-black-light shadow-xl border border-base-300">
              <div class="card-body p-6">
                <div class="skeleton h-6 w-32 mb-6"></div>
                <div class="space-y-4">
                  {#each Array(3) as _, i}
                    <div class="flex items-start gap-3">
                      <div class="skeleton h-10 w-10 rounded-full"></div>
                      <div class="flex-1 space-y-2">
                        <div class="skeleton h-4 w-24"></div>
                        <div class="skeleton h-4 w-full"></div>
                        <div class="skeleton h-4 w-3/4"></div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {:else if error || !post}
          <!-- Error State -->
          <div class="card bg-black-light shadow-xl border border-base-300">
            <div class="card-body">
              <div class="alert alert-error">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 class="font-bold">Post Not Found</h3>
                  <p class="text-sm">
                    {error || "The requested post could not be found."}
                  </p>
                </div>
                <a
                  href="/"
                  class="btn btn-sm btn-primary bg-purple hover:bg-purple-dark border-purple"
                >
                  Return to Home
                </a>
              </div>
            </div>
          </div>
        {:else}
          <!-- Post Content -->
          <div class="space-y-6">
            <!-- Post Card -->
            <article
              class="card bg-black-light shadow-2xl border border-base-300"
            >
              <div class="card-body p-6">
                <!-- Post Content -->
                <div class="mb-6">
                  <p class="whitespace-pre-line leading-relaxed text-lg">
                    {post.PostWords}
                  </p>
                </div>

                <!-- Post Meta -->
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between border-t border-base-300 pt-6"
                >
                  <div class="mb-4 sm:mb-0">
                    <div class="flex items-center gap-3">
                      <div>
                        <p class="font-semibold">
                          {post.Author || "Anonymous"}
                        </p>
                        <time class="text-sm opacity-70"
                          >{formatDate(post.PostDate)}</time
                        >
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <!-- Like/Dislike Buttons -->
                    <div class="flex items-center gap-2">
                      <button
                        onclick={handlePostLike}
                        class="btn btn-ghost btn-sm text-success hover:text-success"
                        aria-label="Like this post"
                        title="Like"
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
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      </button>

                      <!-- Likes Count -->
                      <div
                        class="badge badge-primary gap-2 p-3 bg-purple border-purple"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"
                          />
                        </svg>
                        <span class="font-bold">{post.Likes}</span>
                        <span class="opacity-80 text-xs">likes</span>
                      </div>

                      <button
                        onclick={handlePostDislike}
                        class="btn btn-ghost btn-sm text-error hover:text-error"
                        aria-label="Dislike this post"
                        title="Dislike"
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
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m-2 0h-2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Comments Section -->
            <div class="card bg-black-light shadow-2xl border border-base-300">
              <div class="card-body p-6">
                <h2
                  class="card-title text-xl mb-6 pb-4 border-b border-base-300"
                >
                  Comments ({comments.length})
                </h2>

                <!-- Add Comment Form -->
                <div class="mb-8">
                  <h3 class="text-lg font-semibold mb-4">Add a Comment</h3>

                  {#if submitError}
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
                      <span>{submitError}</span>
                    </div>
                  {/if}

                  <form onsubmit={handleSubmit} class="space-y-4">
                    <!-- Author Input (Optional) -->
                    <div class="form-control">
                      <label for="comment-author" class="label">
                        <span class="label-text">Name (optional)</span>
                      </label>
                      <input
                        type="text"
                        id="comment-author"
                        bind:value={commentAuthor}
                        class="input input-bordered bg-base-300 border-base-300"
                        placeholder="Your name (or leave anonymous)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <!-- Comment Input -->
                    <div class="form-control">
                      <label for="comment-text" class="label">
                        <span class="label-text">Comment *</span>
                        <span class="label-text-alt opacity-70">
                          {newComment.length}/2000
                        </span>
                      </label>
                      <textarea
                        id="comment-text"
                        bind:value={newComment}
                        rows={3}
                        class="textarea textarea-bordered resize-none bg-base-300 border-base-300"
                        placeholder="Write your comment here..."
                        required
                        disabled={isSubmitting}
                        maxlength="2000"
                      ></textarea>
                    </div>

                    <!-- Submit Button -->
                    <button
                      type="submit"
                      class="btn btn-primary gap-2 bg-purple hover:bg-purple-dark border-purple"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {#if isSubmitting}
                        <span class="loading loading-spinner loading-sm"></span>
                        Posting...
                      {:else}
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
                        <span>Post Comment</span>
                      {/if}
                    </button>
                  </form>
                </div>

                <!-- Comments List -->
                <div class="space-y-4">
                  {#if comments.length > 0}
                    {#each comments as comment}
                      <CommentComponent details={comment} />
                    {/each}
                  {:else}
                    <div class="text-center py-8">
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p class="opacity-80">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </main>
    </div>
  </div>
</div>
