<script lang="ts">
  import type { Post } from "$lib/interfaces";
  import { _addLike } from "./+server";

  export let details: Post;

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

  async function callLike() {
    const newLikes = await _addLike(1, 0, details.PostID);
    if (typeof newLikes === "number") {
      details.Likes = newLikes;
    }
  }

  async function callDislike() {
    const newLikes = await _addLike(-1, 0, details.PostID);
    if (typeof newLikes === "number") {
      details.Likes = newLikes;
    }
  }
</script>

<article
  class="card bg-black-light shadow hover:shadow-md transition-shadow border border-base-300"
>
  <div class="card-body p-4">
    <!-- Post Content -->
    <div class="mb-4">
      <p class="whitespace-pre-line leading-relaxed">
        {details.PostWords}
      </p>
    </div>

    <!-- Post Footer -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between border-t border-base-300 pt-4"
    >
      <div class="mb-2 sm:mb-0">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">
              {details.Author || "Anonymous"}
            </span>
          </div>
          <span class="text-xs opacity-70">•</span>
          <time class="text-xs opacity-70">{formatDate(details.PostDate)}</time>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Like/Dislike -->
        <div class="flex items-center gap-1">
          <button
            onclick={callLike}
            class="btn btn-ghost btn-xs text-success hover:text-success p-1"
            title="Like"
          >
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
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </button>

          <span class="text-sm font-medium px-1">{details.Likes}</span>

          <button
            onclick={callDislike}
            class="btn btn-ghost btn-xs text-error hover:text-error p-1"
            title="Dislike"
          >
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
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m-2 0h-2"
              />
            </svg>
          </button>
        </div>

        <!-- View Comments Button -->
        <a
          href={`/post/${details.PostID}`}
          class="btn btn-primary btn-xs gap-1 bg-purple hover:bg-purple-dark border-purple"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>View Comments</span>
        </a>
      </div>
    </div>
  </div>
</article>
