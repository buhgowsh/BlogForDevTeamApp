<script lang="ts">
  import { onMount } from "svelte";
  import { _getDiscordInfo } from "./+server";
  import "$lib/types";

  var username: string;
  var status: string;

  onMount(async () => {
    const myInfo = await _getDiscordInfo();
    setData(myInfo as DiscordResponseInfo);
  });

  function setData(source: DiscordResponseInfo) {
    // data.active_on_discord_desktop = source.active_on_discord_desktop;
    // data.active_on_discord_mobile = source.active_on_discord_mobile;
    status = source.discord_status;
    username = source.discord_user.username;
  }
</script>

<div style="bg-(image:url('/src/assets/galaxy_glitter.jpg'))">
  <p>hello sno</p>
  <p>{username}</p>
  <p>{status}</p>
</div>
