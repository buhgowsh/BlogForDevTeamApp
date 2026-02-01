<script lang="ts">
  import type { Comment } from "$lib/interfaces";
  import { _addLike } from "../../+server";

  export let details: Comment;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  async function callLike() {
    const newLikes = await _addLike(1, 1, details.CommentID);
    if (typeof newLikes === "number") {
      details.Likes = newLikes;
    }
  }

  async function callDislike() {
    const newLikes = await _addLike(-1, 1, details.CommentID);
    if (typeof newLikes === "number") {
      details.Likes = newLikes;
    }
  }
</script>

<div class="card bg-base-300 shadow-sm hover:bg-base-300/80 transition-colors">
  <div class="card-body p-4">
    <!-- Comment Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div>
          <h4 class="font-semibold">
            {details.Author || "Anonymous"}
          </h4>
          <p class="text-xs opacity-70">
            {formatDate(details.CommentDate)}
          </p>
        </div>
      </div>

      <!-- Like/Dislike Buttons -->
      <div class="flex items-center gap-1">
        <div class="badge badge-outline badge-sm gap-1">
          {details.Likes}
          <button class="hover:text-success" onclick={callLike} title="Like">
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
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </button>
          <button
            class="hover:text-error"
            onclick={callDislike}
            title="Dislike"
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
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m-2 0h-2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Comment Content -->
    <p class="whitespace-pre-line">
      {details.CommentWords}
    </p>
  </div>
</div>
