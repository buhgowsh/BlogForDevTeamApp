import type { Post, Comment } from "./interfaces"

// types for the lanyard GET fetch to get my discord info
export type DiscordResponse = { // this type is so chopped bro
    data: DiscordResponseInfo,
}

export type DiscordResponseInfo = {
    active_on_discord_desktop: boolean,
    active_on_discord_mobile: boolean,
    discord_status: string,
    discord_user: DiscordUser,
}

export type DiscordUser = {
    username: string,
    // more to add here if i want to include my tag, but for now this is fine
}

// types for the database query responses
export type GetPostResponse = {
    posts: Post[],
    error: string | unknown
}

export type GetCommentResponse = {
    comments: Comment[],
    error: string | unknown
}

export type AddPostResponse = {
    id: number,
    error: string | unknown
}

export type AddCommentResponse = {
    error: string | unknown
}

export type LikeResponse = {
    newLikes?: number,
    error: string | unknown
}