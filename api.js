// this module contains all the api endpoints that are connected to the sqlite database
export const setApp = function (app, db) {
    
    // adding a new user
    app.post('/api/insert', async (req, res) => {

        if(!req.body) {
            return res.status(400).json({ error: "No body provided" });
        }

        // get the data sent to the endpoint
        const { firstname, lastname } = req.body;

        // verify data was actually sent
        if(!firstname || !lastname) {
            console.log("data was not given");
            return res.status(409).json({ id: -1, error: 'data was not given' });
        }

        // attempt to add it to the database (currently this code assumes that the values are not already in the database, which is bad)
        try {
            const insert = db.prepare('INSERT INTO Users (FirstName, LastName) VALUES (?, ?)');
            insert.run(firstname, lastname);

            const query = db.prepare('SELECT UserID FROM Users WHERE FirstName=? AND LastName=?');
            const id = query.run(firstname, lastname);

            res.status(200).json({ UserID: id.UserID, error: ''});
        } catch(e) {
            console.error('Registration error:', e);
            res.status(500).json({ id: -1, error: e});
        }
    });
}