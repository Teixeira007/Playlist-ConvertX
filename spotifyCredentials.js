const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config({ path: path.join(__dirname, 'credenciais', 'secret.env') });

const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;

module.exports = {
    spotifyClientSecret,
    spotifyClientId,
};
