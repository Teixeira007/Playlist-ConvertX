const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const fetch = require('node-fetch');
require('dotenv').config();
const { spotifyClientSecret, spotifyClientId } = require('./spotifyCredentials');

let spotifyAccessToken;

const _getToken = async () => {
    const credentials = `${spotifyClientId}:${spotifyClientSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + encodedCredentials
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

// Configure as credenciais do cliente
const redirectUri = 'http://localhost:5000/oauth2callback';


async function iniciarServidorWeb() {
    return new Promise((resolve, reject) => {
        const porta = 5000;
        const app = express();

        const servidor = app.listen(porta, () => {
            console.log(`> Ouvindo em http://localhost:${porta}`);
            resolve({
                app,
                servidor
            });
        });
    });
}

function createSpotifyClient() {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: redirectUri
    });

    return spotifyApi;
}

function requestUserConsent(spotifyApi) {
    const consentUrl = spotifyApi.createAuthorizeURL(['user-read-playback-state', 'user-read-currently-playing', 'playlist-modify-public'], 'state');
    console.log(`> Por favor, dê seu consentimento: ${consentUrl}`);
}

async function waitForSpotifyCallback(webServer) {
    return new Promise((resolve, reject) => {
        console.log(`> Aguardando consentimento do usuário...`);

        webServer.app.get('/oauth2callback', (req, res) => {
            const codigoAutorizacao = req.query.code;
            console.log(`> Consentimento dado: ${codigoAutorizacao}`);

            const closeScript = '<script>window.close();</script>';

            res.send(`<h1>Thank you!</h1><p>Now close this tab.</p>${closeScript}`);
            resolve(codigoAutorizacao);
        });
    });
}

async function requestSpotifyForAccessTokens(spotifyApi, authorizationCode) {
    const dadosAutenticacao = await spotifyApi.authorizationCodeGrant(authorizationCode);
    console.log('> Tokens de acesso recebidos:');
    
    // Save the access token to the variable
    spotifyAccessToken = dadosAutenticacao.body.access_token;
    
    const refreshToken = dadosAutenticacao.body.refresh_token;
    return spotifyAccessToken;
}

function getSpotifyAccessToken() {
    return spotifyAccessToken;
}

function setGlobalSpotifyAuthentication(spotifyApi) {
    // Agora, você pode usar spotifyApi para fazer solicitações à API do Spotify em nome do usuário.
    // Por exemplo, você pode usar spotifyApi.getMe() para obter informações do usuário.
}

async function stopWebServer(webServer) {
    return new Promise((resolve, reject) => {
        webServer.servidor.close(() => {
            resolve();
        });
    });
}

module.exports = {
    iniciarServidorWeb,
    _getToken,
    redirectUri,
    createSpotifyClient,
    requestUserConsent,
    waitForSpotifyCallback,
    requestSpotifyForAccessTokens,
    getSpotifyAccessToken,
    setGlobalSpotifyAuthentication,
    stopWebServer,
};