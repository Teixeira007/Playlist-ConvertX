const express = require('express');
const authYoutube = require('./authYoutube');
const authSpotify = require('./authSpotify');
const youtube = require('./youtube.js');
const session = require('express-session');
const bodyParser = require('body-parser');

let path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.use('/css', express.static(path.join(__dirname, 'front/css')))
app.use('/js', express.static(path.join(__dirname, 'front/js')))
app.use('/img', express.static(path.join(__dirname, 'front/img')))
app.use('/icon', express.static(path.join(__dirname, 'front/img')))
app.set('views', path.join(__dirname, 'front/views'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/front/views/index.html'));
  });

let isAuthenticatedYoutube = false;
let youtubeToken = null;
let isAuthenticatedSpotify = false;
let spotifyToken = null;

// autenticação do youtube
app.get('/authenticate/youtube', async (req, res) => {
    try {
        const {webServer, OAuthClient, consentUrl} = await authenticateWithYoutube();
        res.status(200).json({ consentUrl });
        const authorizationToken = await authYoutube.waitForGoogleCallback(webServer);
        await authYoutube.requestGoogleForAccessTokens(OAuthClient, authorizationToken);
        authYoutube.setGlobalGoogleAuthentication(OAuthClient);

        isAuthenticatedYoutube = true;
        youtubeToken = OAuthClient.credentials

        await authYoutube.stopWebServer(webServer);
    } catch (error) {
        console.log('Error authenticating with YouTube:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// autenticação do spotify
app.get('/authenticate/spotify', async (req, res) => {
    try {
        const {webServer, spotifyApi, consentUrl} = await authenticateWithSpotify();        
        res.status(200).json({ consentUrl});
        const authorizationCode = await authSpotify.waitForSpotifyCallback(webServer);
        const accessToken = await authSpotify.requestSpotifyForAccessTokens(spotifyApi, authorizationCode);
        
        isAuthenticatedSpotify = true;
        spotifyToken = accessToken

        authSpotify.setGlobalSpotifyAuthentication(spotifyApi);
        await authSpotify.stopWebServer(webServer);
    } catch (error) {
        console.log('Error authenticating with Spotify:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//checar autenticação
app.get('/check/youtube-auth', (req, res) => {
    res.json({authenticated: isAuthenticatedYoutube, token: youtubeToken})
});

app.get('/check/spotify-auth', (req, res) => {
    res.json({ authenticated: isAuthenticatedSpotify, token: spotifyToken });
});

// Rota para execução do robô do YouTube
app.get('/run/youtube', async (req, res) => {
    const idPlaylist = req.query.playlistId;
    const namePlaylist =  req.query.namePlaylist

    try {
        await youtube(idPlaylist, namePlaylist)
        res.json({ success: true, message: 'Playlist convertida com Sucesso!' });
    } catch (error) {
        console.error('Erro ao executar o robô do YouTube:', error);
        res.status(500).json({ success: false, message: 'Erro ao executar o robô do YouTube.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function authenticateWithYoutube() {
    const webServer = await authYoutube.startWebServer();
    const OAuthClient = await authYoutube.createOAuthClient();
    const consentUrl = authYoutube.requestUserConsent(OAuthClient);    
    return {webServer, OAuthClient, consentUrl}
}

async function authenticateWithSpotify() {
    const webServer = await authSpotify.iniciarServidorWeb();
    const spotifyApi = authSpotify.createSpotifyClient();
    const consentUrl =  authSpotify.requestUserConsent(spotifyApi);
    return {webServer, spotifyApi, consentUrl}
}
