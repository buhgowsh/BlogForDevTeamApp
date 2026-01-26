// i dont have a ts interpreter for pm2 so this file stays in javascript instead of typescript

// import { handler } from './build/handler.js'; // this file is exported by the node adapter plugin, but i dont need it currently

// handle imports for cors
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import { setApp } from './api.js';

dotenv.config();
const PORT = process.env.PORT | 3000;

// start up cors
const app = express();
app.use(express.json()); // auto parse json so i can test the endpoints with postman
app.use(cors());

// get the database connected to the api endpoints
try {
    // open up a connection to the database
    const database = new DatabaseSync(process.env.DATABASE_PATH);

    console.log("successfully connected to sqlite database");

    setApp( app, database );
} catch(e) {
    console.error(e);
    console.log('something went wrong') // backup in case e is geeked
}

// set up cors headers for fetch the RESTful API enpoints
app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

// add a route that lives separately from the SvelteKit app 
app.get('/healthcheck', (req, res) => { res.end('ok'); });

// thing from a svelte doc tutorial that im not using, but should probably look into at some point
// let SvelteKit handle everything else, including serving prerendered pages and static assets
// app.use(handler);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`); 
});
