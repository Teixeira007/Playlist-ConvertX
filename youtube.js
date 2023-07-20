const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
// const state = require('./state.js')


async function robot(){
    // await authenticateWithOAuth()
    

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
            console.log('Response:', nameSongs);

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
    //FIM DA AUTENTICAÇÃO SPOTIFY



    




    


    getTracks("Mudou a Estação")
    
    // getPlaylistSongsToList("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
}

module.exports = robot