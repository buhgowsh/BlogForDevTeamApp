// this file contains all the code related to apis in this project
import '$lib/types';
import type { Express, Request, Response } from 'express';
const DISCORD_ID="527717014324903947" // this should probably be an environment variable, but it isnt that important to keep secret

// use lanyard to get all the information i need from my discord profile
export async function _getDiscordInfo() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, {
            method: "GET", // default option, so not really needed but i want it for future reference
            headers: {'Content-Type': 'Application/json'},
            mode: 'cors'
        });

        if(!response.ok) {
            throw new Error(`Respponse status: ${response.status}`);
        }

        const result: Promise<DiscordResponse> = response.json();
        

        return (await result).data;
    } catch(error) {
        console.error(String(error));
    }
}