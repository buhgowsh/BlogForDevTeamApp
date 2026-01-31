// this module contains all the api endpoints that are connected to the sqlite database
export const setApp = function (app, db) {

    /*
        There is no API endpoint to delete or modify posts or comments
        since i don't implement a method to verify who the poster is
    */
    
    // adding a new post to the blog
    app.post('/api/insertpost', async (req, res) => {

        // make sure something was passed to the endpoint
        if(!req.body) {
            return res.status(400).json({ error: "Post API called but no body provided" }); // using return to end early
        }

        // get the data sent from the request body
        const { words, author } = req.body;
        // author is allowed to be left empty

        // verify data was actually sent
        if(!words) {
            return res.status(400).json({ id: -1, error: "Post API called but data was not given" }); // using return to end early
        }

        // attempt to add the post to the database
        try {

            // get the current date
            const date = new Date();

            // check if an author was named
            if(!author) {
                db.prepare('INSERT INTO Posts (PostWords, PostDate) VALUES (?, ?)').run(words, String(date));
            } else {
                db.prepare('INSERT INTO Posts (PostWords, PostDate, Author) VALUES (?, ?, ?)').run(words, String(date), author);
            }
            /*
                the lines above are two commands put into one, the following lines are equivalent:
                const insert = db.prepare('INSERT INTO Users (Words)) VALUES (?)').run(words); // prepares the statement, good for preventing SQL injection
                insert.run(words...); // runs the prepared statement with the given arguments
                "datetime('now', 'localtime')" specifies the current date and time using the local time zone
            */

            const pid = db.prepare('SELECT rowid FROM Posts WHERE PostWords=?').get(words); // there are a couple situations in which this would return the wrong PID, but i don't really have the time to deal with it rn
            // the .get() method returns the first record (that results from executing the prepared statement) as an object
            // the object's properties are the fields of the record

            // return the id of the post/comment
            res.status(200).json({ id: pid.PostID, error: '' });
        } catch(e) {
            console.log("Error with Posts API")
            res.status(500).json({ id: -1, error: e });
        }
    });

    // add a new comment to a post
    app.post('/api/insertcomment', async (req, res) => {

        // make sure something was passed to the endpoint
        if(!req.body) {
            return res.status(400).json({ error: "Comment API called but no body provided" }); // using return to end early
        }

        // get the data passed from the request body
        const { words, pid, author } = req.body;
        // author is allowed to be left empty

        // verify the needed data was sent
        if(!words || typeof pid !== "number") {
            return res.status(400).json({ error: "Comment API called but not enough data was given" }); // using return to end early
        }

        // attempt to add the comment to the database
        try {

            // get the current date
            const date = new Date();

            // check if the author was named
            if(!author) {
                db.prepare('INSERT INTO Comments (CommentWords, PostID, CommentDate) VALUES (?, ?, ?)').run(words, pid, String(date));
            } else {
                db.prepare('INSERT INTO Comments (CommentWords, PostID, CommentDate, Author) VALUES (?, ?, ?, ?)').run(words, pid, String(date), author);
            }

            // return empty error to indicate success (no real need to return anything from here)
            res.status(200).json({ error: '' });
        } catch(e) {
            console.log("Error with Comment API");
            res.status(500).json({ error: e });
        }
    });

    // add a like or dislike to a post/comment
    app.post('/api/like', async (req, res) => {

        // make sure something was passed to the endpoint
        if(!req.body) {
            return res.status(400).json({ error: "Like API called but no body provided" }); // using return to end early
        }

        // get the value (either 1 or -1, depending on like or dislike) from the request body
        const { engagement, type, id } = req.body;
        // type specified either as a post (0) or a comment (1)
        // id specifies the id of the post/comment

        // ensure all the needed data was given
        if(typeof engagement !== "number" || typeof type !== "number" || typeof id !== "number") {
            return res.status(400).json({ error: "Like API called but not enough values given" }); // using return to end early
        }

        try {
            // change the values of likes on either the post or the comment
            if(type) {
                // get the current number of likes on the post/comment
                const likes = db.prepare('SELECT Likes FROM Posts WHERE PostID=?').get(id);
                const newLikes = likes.Likes + engagement;

                // update the record to have the new value
                const pid = db.prepare('UPDATE Posts SET Likes=? WHERE PostID=?').get(newLikes, id);

                // return the id of the post/comment
                res.status(200).json({ id:pid.PostID, newLikes: newLikes, error: '' });
            } else {
                // get the current number of likes on the post
                const likes = db.prepare('SELECT Likes FROM Comments WHERE CommentID=?').get(id);
                const newLikes = likes.Likes + engagement;

                // update the record to have the new value
                const cid = db.prepare('UPDATE Comments SET Likes=? WHERE CommentID=?').get(newLikes, id);

                // return the id of the comment
                res.status(200).json({ id:cid.CommentID, newLikes: newLikes, error: '' });
            }
            
            
        } catch(e) {
            console.log("Error with Like API");
            res.status(500).json({ error: e });
        }
    });

    // retrieve all posts
    app.get('/api/getposts/', async (req, res) => {
        
        // attempt to query the database for all posts
        try {

            const posts = db.prepare('SELECT * FROM Posts').all();

            res.status(200).json({ posts: posts, error: '' });
        } catch(e) {
            res.status(500).json({ error: e });
        }
    });

    // retrieve all comments for a specific post
    app.get('/api/getcomments/:pid', async (req, res) => {
        
        // get the postid from the request
        var { pid } = req.params; // this will be a string, but we need it as a number

        // type cast pid into a number
        const id = Number(pid);

        // make sure a number was passed through
        if(typeof id !== "number") {
            console.log("Get Comments API called but no PostID given");
            return res.status(500).json({ error: "Get Comments API called but no PostID given" });
        }

        // attempt to query the database for all comments on a post
        try {
            
            const comments = db.prepare('SELECT * FROM Comments WHERE PostID=?').all(id);

            res.status(200).json({ comments: comments, error: '' });
        } catch(e) {
            console.log("Error with Get Comments API")
            res.status(500).json({ error: e });
        }
    });
}