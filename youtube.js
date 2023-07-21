const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
// const state = require('./state.js')
const SpotifyWebApi = require('spotify-web-api-node');


async function robot(){
    await authenticateWithOAuth()
    await authenticateWithOAuthSpotify();
    

    // INICIO DA AUTENTICAÇÃO OAUTH2 YOUTUBE

    async function authenticateWithOAuth(){
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthCliente()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer(){
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`> Listening on http://localhost:${port}`)

                    resolve({
                        app,
                        server
                    })
                })
            })
        }

        async function createOAuthCliente(){
            const credentials = require('./credenciais/client_secret_209134491777-vq09gbtqepsfm052e3upqhqvm1on7g6h.apps.googleusercontent.com.json')

            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        function requestUserConsent(OAuthClient){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube']
            })

            console.log(`> Please give your consent: ${consentUrl}`)
        }

        async function waitForGoogleCallback(webServer){
            return new Promise((resolve, reject) => {
                console.log(`> Waiting for use consent...`)

                webServer.app.get('/oauth2callback', (req, res) => {
                    const authCode = req.query.code 
                    console.log(`> Consent given: ${authCode}`)

                    res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
                    resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken){
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error){
                        return reject(error)
                    }

                    console.log('> Access tokens received:')
                   

                    OAuthClient.setCredentials(tokens)
                    resolve()
                })
            })
        }

        function setGlobalGoogleAuthentication(OAuthClient){
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(webServer){
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }
    }

    //FIM DA AUTENTICAÇÃO OAUTH2 YOUTUBE


    

    // Pegar todas as músicas da playlist do youtube e colocar em uma lista
    async function getPlaylistSongsToList(idPlaylistYoutube){
        try{
            const response = await youtube.playlistItems.list({
                part: ['snippet'],
                playlistId: idPlaylistYoutube,
                maxResults: 100,
            });

            const nameSongs = response.data.items.map( x => x.snippet.title)
            // console.log('Response:', nameSongs);

            return nameSongs;

        } catch (error) {
            console.error('Error:', error);
        }         
    }

    // INICIO DA AUTENTICAÇÃO SPOTIFY

    const path = require('path');
    const fetch = require('node-fetch');
    require('dotenv').config({ path: path.join(__dirname, 'credenciais', 'secret.env') });

    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;

    //pegar o token do spotify com minhas credenciais
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

    // INICIO DA AUTENTICAÇÃO SPOTIFY OAUTH2
    const redirectUri = 'http://localhost:5000/oauth2callback';

    async function authenticateWithOAuthSpotify() {
        const webServer = await startWebServer();
        const spotifyApi = createSpotifyClient();
        requestUserConsent(spotifyApi);
        const authorizationCode = await waitForSpotifyCallback(webServer);
        await requestSpotifyAccessTokens(spotifyApi, authorizationCode);
        await setGlobalSpotifyAuthentication(spotifyApi);
        await stopWebServer(webServer);
    }

    async function startWebServer() {
        return new Promise((resolve, reject) => {
            const port = 5000;
            const app = express();

            const server = app.listen(port, () => {
                console.log(`> Listening on http://localhost:${port}`);
                resolve({
                    app,
                    server
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
        const consentUrl = spotifyApi.createAuthorizeURL(['user-read-playback-state', 'user-read-currently-playing'], 'state');
        console.log(`> Please give your consent: ${consentUrl}`);
    }

    async function waitForSpotifyCallback(webServer) {
        return new Promise((resolve, reject) => {
            console.log(`> Waiting for user consent...`);

            webServer.app.get('/oauth2callback', (req, res) => {
                const authorizationCode = req.query.code;
                console.log(`> Consent given: ${authorizationCode}`);

                res.send('<h1>Thank you!</h1><p>Now close this tab.</p>');
                resolve(authorizationCode);
            });
        });
    }

    async function requestSpotifyAccessTokens(spotifyApi, authorizationCode) {
        const authenticationData = await spotifyApi.authorizationCodeGrant(authorizationCode);
        console.log('> Access tokens received:');
        console.log(authenticationData.body);

        // Save the access and refresh tokens if needed
        const accessToken = authenticationData.body.access_token;
        const refreshToken = authenticationData.body.refresh_token;
    }

    function setGlobalSpotifyAuthentication(spotifyApi) {
        // You can now use spotifyApi to make requests to the Spotify API on behalf of the user.
        // For example, you can use spotifyApi.getMe() to get user information.
    }

    async function stopWebServer(webServer) {
        return new Promise((resolve, reject) => {
            webServer.server.close(() => {
                resolve();
            });
        });
    }

    // Call the authentication function to start the process
   

    //FIM DA AUTENTICAÇÃO SPOTIFY OAUTH2
    

    //buscar uma múscia no spotify e pegar o id, pelo nome da música
    async function getTracks(nameTracks) {
        const token = await _getToken();
        const result = await fetch(`https://api.spotify.com/v1/search?query=${nameTracks}&type=track`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        
        return data.tracks.items[0].id;
    }

    // pega todas as musicas da playlist do youtube e trasnforma em ids das mesmas musicas
    // no spotify
    async function getIdTracks(idPlaylistYoutube){
        let tracksList = await getPlaylistSongsToList(idPlaylistYoutube)

        try {
            const results = [];
            for (const name of tracksList) {
              const data = await getTracks(name);
              results.push(data);
            }
            
            // O array 'results' conterá os resultados das chamadas assíncronas para getTracks
            return results;
          } catch (error) {
            console.error('Ocorreu um erro:', error);
          }
    }

    
    // const idTracks = await getIdTracks("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
    // getTracks("Mudou a Estação")
    
    // getPlaylistSongsToList("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
}

module.exports = robot