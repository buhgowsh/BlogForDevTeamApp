// this file contains all the code related to apis in this project
import type { AddCommentResponse, AddPostResponse, DiscordResponse, GetCommentResponse, GetPostResponse, LikeResponse } from '$lib/types';
const DISCORD_ID="527717014324903947" // this should probably be an environment variable, but this gets loaded in the client so i would need to encrypt it and i dont care enough to ngl

// use lanyard to get all the information i need from my discord profile
// either returns some data about my discord status or nothing/error
export async function _getDiscordInfo() {

    // attempt to gather the data using a GET request
    try {

        // make the GET request
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, {
            method: "GET", // default option, so not really needed but i want it for future reference
            mode: 'cors'
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Lanyard respponse status: ${response.status}`);
        }

        // convert the response into something a little easier to use with the front-end, then return it
        const result = await response.json() as DiscordResponse;
        return result.data;

    } catch(error) {
        console.error(error);
    }
}

// call the API endpoint to gather all of the posts
// either returns an array of all posts or nothing/error
export async function _getPosts() {

    // attempt to gather posts using a GET request
    try {

        // make the GET request
        const response = await fetch('http://localhost:3000/api/getposts/', {
            method: "GET",
            mode: "cors"
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Get Posts API response status: ${response.status}`);
        }

        // simplify the returned data and return it
        const result = await response.json() as GetPostResponse;
        return result.posts;

    } catch(error) {
        console.error(error);
    }
}

// call API endpoint to gather all comments for a specific post
// either returns those comments or nothing/error
export async function _getComments(pid: number) {

    // attempt to gather comments using a GET request
    try {

        // make the GET request
        const response = await fetch(`http://localhost:3000/api/getcomments/${pid}`, {
            method: "GET",
            mode: "cors"
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Get Comments API response status: ${response.status}`);
        }

        // simplify the returned data and return it
        const result = await response.json() as GetCommentResponse;
        return result.comments;

    } catch (error) {
        console.error(error);
    }
}

// call API endpoint to add a post to the blog
// either returns the PostID of the new post or an error
export async function _addPost(words: string, author?: string) {

    // attempt to add the post to the database using a POST request
    try {

        // format the body depending on if an author was named or not
        var body;
        if(author) {
            body = JSON.stringify({ words: words, author: author });
        } else {
            body = JSON.stringify({ words: words });
        }

        // send the POST request
        const response = await fetch('http://localhost:3000/api/insertpost/', {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            mode: "cors",
            body: body
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Add Post API response status: ${response.status}`);
        }

        // simplify the data and return it
        const result = await response.json() as AddPostResponse;
        return result.id;

    } catch(e) {
        console.error(e);
    }
}

// call API endpoint to add a comment to a post
// returns only an error key that is an empty string on success and an actual error on failure
export async function _addComment(words: string, pid: number, author?: string) {

    // attempt to add the comment to the database using a POST request
    try {

        // format the body depending on if an author was named or not
        var body;
        if(author) {
            body = JSON.stringify({ words: words, pid: pid, author: author});
        } else {
            body = JSON.stringify({ words: words, pid: pid });
        }

        // send the POST request
        const response = await fetch('http://localhost:3000/api/insertcomment/', {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            mode: "cors",
            body: body
            
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Add Comment API response status: ${response.status}`);
        }

        // simplify the data and return it
        const result = await response.json() as AddCommentResponse;
        return result.error;

    } catch(e) {
        console.error(e);
    }
}

// call API endpoint to add either a like or a dislike to a post or comment
// returns the new number of total likes
export async function _addLike(engagement: number, type: number, id: number) {

    // attempt to modify the number of likes on the post/comment using a POST request
    try {

        // send the POST request
        const response = await fetch('http://localhost:3000/api/like/', {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            mode: "cors",
            body: JSON.stringify({ engagement: engagement, type: type, id: id})
        });

        // ensure a proper response was given
        if(!response.ok) {
            throw new Error(`Like API response status: ${response.status}`);
        }

        // simplify the data
        const result = await response.json() as LikeResponse;

        // make sure the query was executed
        if(result.error) {
            return result.error;
        }

        // return new number of likes/dislikes
        return result.newLikes

    } catch (e) {
        console.error(e);
    }
}