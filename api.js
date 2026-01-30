// this module contains all the api endpoints that are connected to the sqlite database
export const setApp = function (app, db) {
    
    // adding a new post to the blog
    app.post('/api/insert', async (req, res) => {

        if(!req.body) {
            return res.status(400).json({ error: "Create post API called but no body provided" });
        }

        // get the data sent to the endpoint
        const { words, author } = req.body;
        // author is allowed to be left empty

        // verify data was actually sent
        if(!words) {
            return res.status(409).json({ id: -1, error: "Create post API called but data was not given" });
        }

        // attempt to add it to the database (currently this code assumes that the values are not already in the database, which is bad)
        try {

            // check if an author was named
            if(!author) {
                db.prepare('INSERT INTO Posts (Words) VALUES (?)').run(words);
            } else {
                db.prepare('INSERT INTO Posts (Words, Author) VALUES (?, ?)').run(words, author);
            }
            /*
                the line above is two commands put into one, the following lines are equivalent:
                const insert = db.prepare('INSERT INTO Users (Words)) VALUES (?)').run(words); // prepares the statement, good for preventing SQL injection
                insert.run(words); // runs the prepared statement with the given arguments
            */

            // const query = db.prepare('SELECT UserID FROM Users WHERE FirstName=? AND LastName=?');
            // const id = query.run(firstname, lastname);

            const pid = db.prepare('SELECT PostID FROM Posts WHERE Words=?').get(words); // there are a couple situations in which this would return the wrong PID, but i don't really have the time to deal with it rn
            // the .get() method returns the first record (that results from executing the prepared statement) as an object
            // the object's properties are the fields of the record

            res.status(200).json({ id: pid.PostID, error: ''});
        } catch(e) {
            res.status(500).json({ id: -1, error: e});
        }
    });

    app.post('/api/like', async (req, res) => {
        // adds the like or dislike to the value of the post's like counter

        if(!req.body) {
            return res.status(400).json({ error: "Like API called but no body provided"});
        }

        // get the value (either -1 or 1, depending on like or dislike) from the body
        const { like } = req.body;

        if(!like) {
            return res.status(400).json({ error: "Like API called but no value given"});
        }

        try {
            //

            res.status(200).json({ success: 1, error: '' });
        } catch(e) {
            res.status(500).json({ error: e });
        }
    });
}