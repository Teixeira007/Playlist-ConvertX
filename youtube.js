const { log } = require('console')
const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
const natural = require('natural');
const stringSimilarity = require('string-similarity');
// const state = require('./state.js')
const SpotifyWebApi = require('spotify-web-api-node');
const authModuloYoutube = require('./auth2Youtube')

async function authenticateWithOAuth(res){
    const webServer = await authModuloYoutube.startWebServer()
    const OAuthClient = await authModuloYoutube.createOAuthCliente()
    const requestUser = authModuloYoutube.requestUserConsent(OAuthClient, res)
    const authorizationToken = await authModuloYoutube.waitForGoogleCallback(webServer)
    await authModuloYoutube.requestGoogleForAccessTokens(OAuthClient, authorizationToken)
    await authModuloYoutube.setGlobalGoogleAuthentication(OAuthClient)
    await authModuloYoutube.stopWebServer(webServer)
}

async function robot(inputIdPlaylist){
    // await authenticateWithOAuth()
    

    // INICIO DA AUTENTICAÇÃO OAUTH2 YOUTUBE

    // async function authenticateWithOAuth(){
    //     const webServer = await authModuloYoutube.startWebServer()
    //     const OAuthClient = await authModuloYoutube.createOAuthCliente()
    //     const requestUser = authModuloYoutube.requestUserConsent(OAuthClient)
    //     const authorizationToken = await authModuloYoutube.waitForGoogleCallback(webServer)
    //     await authModuloYoutube.requestGoogleForAccessTokens(OAuthClient, authorizationToken)
    //     await authModuloYoutube.setGlobalGoogleAuthentication(OAuthClient)
    //     await authModuloYoutube.stopWebServer(webServer)
    // }
        // async function startWebServer(){
        //     return new Promise((resolve, reject) => {
        //         const port = 5000
        //         const app = express()

        //         const server = app.listen(port, () => {
        //             console.log(`> Listening on http://localhost:${port}`)

        //             resolve({
        //                 app,
        //                 server
        //             })
        //         })
        //     })
        // }

        // async function createOAuthCliente(){
        //     const credentials = require('./credenciais/client_secret_209134491777-vq09gbtqepsfm052e3upqhqvm1on7g6h.apps.googleusercontent.com.json')

        //     const OAuthClient = new OAuth2(
        //         credentials.web.client_id,
        //         credentials.web.client_secret,
        //         credentials.web.redirect_uris[0]
        //     )

        //     return OAuthClient
        // }

        // function requestUserConsent(OAuthClient){
        //     const consentUrl = OAuthClient.generateAuthUrl({
        //         access_type: 'offline',
        //         scope: ['https://www.googleapis.com/auth/youtube']
        //     })

        //     console.log(`> Please give your consent: ${consentUrl}`)
        // }

        // async function waitForGoogleCallback(webServer){
        //     return new Promise((resolve, reject) => {
        //         console.log(`> Waiting for use consent...`)

        //         webServer.app.get('/oauth2callback', (req, res) => {
        //             const authCode = req.query.code 
        //             console.log(`> Consent given: ${authCode}`)

        //             res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
        //             resolve(authCode)
        //         })
        //     })
        // }

        // async function requestGoogleForAccessTokens(OAuthClient, authorizationToken){
        //     return new Promise((resolve, reject) => {
        //         OAuthClient.getToken(authorizationToken, (error, tokens) => {
        //             if (error){
        //                 return reject(error)
        //             }

        //             console.log('> Access tokens received:')
                   

        //             OAuthClient.setCredentials(tokens)
        //             resolve()
        //         })
        //     })
        // }

        // function setGlobalGoogleAuthentication(OAuthClient){
        //     google.options({
        //         auth: OAuthClient
        //     })
        // }

        // async function stopWebServer(webServer){
        //     return new Promise((resolve, reject) => {
        //         webServer.server.close(() => {
        //             resolve()
        //         })
        //     })
        // }
    // }teste

    // FIM DA AUTENTICAÇÃO OAUTH2 YOUTUBE


    

    // Pegar todas as músicas da playlist do youtube e colocar em uma lista
    async function getPlaylistSongsToList(idPlaylistYoutube){
        try{
            const response = await youtube.playlistItems.list({
                part: ['snippet'],
                playlistId: idPlaylistYoutube,
                maxResults: 100,
            });

            const nameSongs = response.data.items.map( x => x.snippet.title)
            const authorSongs = response.data.items.map(x => x.snippet.videoOwnerChannelTitle)
            // console.log('Response:', authorSongs);

            const listSongs = [];
            response.data.items.forEach(song => {
                const titleSong = song.snippet.title;
                const authorSong = song.snippet.videoOwnerChannelTitle;

                const songObject = new createObjectSong(titleSong, authorSong);
                listSongs.push(songObject)
            })


            return listSongs;

        } catch (error) {
            console.error('Error:', error);
        }         
    }

    function createObjectSong(titleSong, authorSong){
       this.titleSong = titleSong;
       this.authorSong = authorSong;
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

        
        // createPlaylistSpotify(idUser.id, "Teste1", "testedescri",true, accessToken)
        return accessToken
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
    // autenticarComOAuthSpotify();


    //FIM DA AUTENTICAÇÃO SPOTIFY OAUTH2
    

    //buscar uma múscia no spotify e pegar o id, pelo nome da música e pelo author
    // getTracks("Bruno & Marrone - Por um Minuto (Por um Minuto) (Ao Vivo)", "BrunoEMarroneVEVO")
    async function getTracks(nameTracks, authorTracks) {
        // console.log("teste2");
        const token = await _getToken();

        const nameTracksEncode = encodeURIComponent(nameTracks);
        const authorTracksEncode = encodeURIComponent(authorTracks);

        
        const result = await fetch(`https://api.spotify.com/v1/search?query=${nameTracksEncode} artist=${authorTracksEncode}&locale=pt-BR%2Cpt%3Bq%3D0.9%2Cen-US%3Bq%3D0.8%2Cen%3Bq%3D0.7&type=track&limit=20&offset=0`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        // console.log(data.tracks.items);

        console.log("Musicas: ",nameTracks, " ", authorTracks);
        // console.log(data);
        // const threshold = 0.7; // Ajuste este valor conforme necessário para controlar a sensibilidade da correspondência
        // const thresholdUnder = 0.8;
        // let foundTrackId = null;

        // // for (let i = 0; i < data.tracks.items.length; i++) {
        //     let title = data.tracks.items[i].name;
        //     let author = data.tracks.items[i].artists[0].name;
        //     const similarityScoreTitle = cosineSimilarity(title, nameTracks);
        //     const similarityScoreAuthor = cosineSimilarity(author, authorTracks);
        //     if(similarityScoreTitle > 0.4 && similarityScoreAuthor > 0.7){
        //         foundTrackId = data.tracks.items[i].id;
        //     }
        // }

        // if(foundTrackId == null){
        //     foundTrackId = data.tracks.items[0].id;
        // }
        
            
        // return foundTrackId;
        return data.tracks.items[0].id;
    }

    function cosineSimilarity(str1, str2) {
        const similarity = stringSimilarity.compareTwoStrings(str1, str2);
        return similarity;
    }
    
    // pega todas as musicas da playlist do youtube e trasnforma em ids das mesmas musicas
    // no spotify
    async function getIdTracks(idPlaylistYoutube){
        let tracksList = await getPlaylistSongsToList(idPlaylistYoutube)
        // console.log(tracksList)
        try {
            const results = [];
            for (const song of tracksList) {
              const data = await getTracks(song.titleSong, song.authorSong);
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


    //adicionar itens a playlist do spotify
    async function addPlaylistSpotify(idTracks){
        console.log(idTracks);
        const idTracksStrings = idTracks.map(x => {
            if(x != null){
                return `spotify:track:${x}`
            }
            return null;
        }).filter(x => x !== null)

        console.log(idTracksStrings);
        console.log(idTracksStrings.length);

        const access_token = await autenticarComOAuthSpotify();
        

        const user = await getUserSpotify(access_token)
        const idPlaylistSpotify = await createPlaylistSpotify(user.id, "Teste12", "testedescr", true, access_token);
        // console.log(idPlaylistSpotify);
        // console.log(idTracksStrings);

        const requestBody = {
            uris: idTracksStrings,
            position: 0
        };

        try {
            const result = await fetch(`https://api.spotify.com/v1/playlists/${idPlaylistSpotify}/tracks`, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Bearer ' + access_token, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            const data = await result.json();
            // console.log(data);
            // return data.id

        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    // console.log("teste1")
    console.log(inputIdPlaylist);
    const idTracks = await getIdTracks(inputIdPlaylist)
    // console.log(idTracks);
    // getTracks("Mudou a Estação")
    addPlaylistSpotify(idTracks)
    // getPlaylistSongsToList("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
}

module.exports = {
    authenticateWithOAuth,
    robot
}