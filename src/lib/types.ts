// types for the lanyard GET fetch
type DiscordResponse = { // this type is so chopped bro
    "data": DiscordResponseInfo,
}
type DiscordResponseInfo = {
    "active_on_discord_desktop": boolean,
    "active_on_discord_mobile": boolean,
    "discord_status": string,
    "discord_user": DiscordUser,
}
type DiscordUser = {
    "username": string,
    // more to add here if i want to include my tag, but for now this is fine
}