const { log } = require('console')
const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
// const state = require('./state.js')
const SpotifyWebApi = require('spotify-web-api-node');

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

    // Configure as credenciais do cliente
    const redirectUri = 'http://localhost:5000/oauth2callback';

    

    async function autenticarComOAuthSpotify() {
        const webServer = await iniciarServidorWeb();
        const spotifyApi = criarClienteSpotify();
        solicitarConsentimentoDoUsuario(spotifyApi);
        const codigoAutorizacao = await aguardarCallbackDoSpotify(webServer);
        const accessToken = await solicitarTokensDeAcessoDoSpotify(spotifyApi, codigoAutorizacao);
        await setGlobalSpotifyAuthentication(spotifyApi);
        await pararServidorWeb(webServer);

        const idUser = await getUserSpotify(accessToken)
        createPlaylistSpotify(idUser.id, "Teste1", "testedescri",true, accessToken)

    }

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

    function criarClienteSpotify() {
        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: redirectUri
        });

        return spotifyApi;
    }

    function solicitarConsentimentoDoUsuario(spotifyApi) {
        const consentUrl = spotifyApi.createAuthorizeURL(['user-read-playback-state', 'user-read-currently-playing', 'playlist-modify-public'], 'state');
        console.log(`> Por favor, dê seu consentimento: ${consentUrl}`);
    }

    async function aguardarCallbackDoSpotify(webServer) {
        return new Promise((resolve, reject) => {
            console.log(`> Aguardando consentimento do usuário...`);

            webServer.app.get('/oauth2callback', (req, res) => {
                const codigoAutorizacao = req.query.code;
                console.log(`> Consentimento dado: ${codigoAutorizacao}`);

                res.send('<h1>Obrigado!</h1><p>Agora feche esta aba.</p>');
                resolve(codigoAutorizacao);
            });
        });
    }

    async function solicitarTokensDeAcessoDoSpotify(spotifyApi, codigoAutorizacao) {
        const dadosAutenticacao = await spotifyApi.authorizationCodeGrant(codigoAutorizacao);
        console.log('> Tokens de acesso recebidos:');
        // console.log(dadosAutenticacao.body);

        // Salve os tokens de acesso e atualização, se necessário
        const accessToken = dadosAutenticacao.body.access_token;
        const refreshToken = dadosAutenticacao.body.refresh_token;
        return accessToken;
    }

    function setGlobalSpotifyAuthentication(spotifyApi) {
        // Agora, você pode usar spotifyApi para fazer solicitações à API do Spotify em nome do usuário.
        // Por exemplo, você pode usar spotifyApi.getMe() para obter informações do usuário.
    }

    async function pararServidorWeb(webServer) {
        return new Promise((resolve, reject) => {
            webServer.servidor.close(() => {
                resolve();
            });
        });
    }

    // Chame a função de autenticação para iniciar o processo
    autenticarComOAuthSpotify();


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

    // Pegar dados da conta do spotify do usuário
    async function getUserSpotify(token){
        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data
    }

    //criar uma playlist no spotify
    async function createPlaylistSpotify(user_id, namePlaylist, description, status, token){

        const requestBody = {
            name: namePlaylist,
            description: description,
            public: status
        };

        try {
            const result = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Bearer ' + token, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            const data = await result.json();
            return data.id
            
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    
    // const idTracks = await getIdTracks("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
    // getTracks("Mudou a Estação")
    
    // getPlaylistSongsToList("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
}

module.exports = robot