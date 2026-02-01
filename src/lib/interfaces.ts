// interfaces for posts and comments
export interface Post {
    PostID: number,
    PostWords: string,
    Author: string,
    PostDate: string, // the date is stored in the database as a string, so I can't use the Date type
    Likes: number
}

export interface Comment {
    CommentID: number,
    PostID: number,
    CommentWords: string,
    Author: string,
    Likes: number,
    CommentDate: string // the date is stored in the database as a string, so I can't use the Date type
}