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

// Define routes
app.get('/authenticate/youtube', async (req, res) => {
    try {
        await authenticateWithYoutube();
        res.status(200).json({ message: 'YouTube authentication successful' });
    } catch (error) {
        console.error('Error authenticating with YouTube:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/authenticate/spotify', async (req, res) => {
    try {
        await authenticateWithSpotify();
        res.status(200).json({ message: 'Spotify authentication successful' });
    } catch (error) {
        console.error('Error authenticating with Spotify:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rota para execução do robô do YouTube
app.get('/run/youtube', async (req, res) => {
    const idPlaylist = req.query.playlistId;

    try {
        // Coloque aqui a lógica para executar o robô do YouTube com o idPlaylist
        await youtube(idPlaylist)
        res.json({ success: true, message: 'Robô do YouTube executado com sucesso!' });
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
    authYoutube.requestUserConsent(OAuthClient);
    const authorizationToken = await authYoutube.waitForGoogleCallback(webServer);
    await authYoutube.requestGoogleForAccessTokens(OAuthClient, authorizationToken);
    authYoutube.setGlobalGoogleAuthentication(OAuthClient);
    await authYoutube.stopWebServer(webServer);
}

async function authenticateWithSpotify() {
    const webServer = await authSpotify.iniciarServidorWeb();
    const spotifyApi = authSpotify.createSpotifyClient();
    authSpotify.requestUserConsent(spotifyApi);
    const authorizationCode = await authSpotify.waitForSpotifyCallback(webServer);
    const accessToken = await authSpotify.requestSpotifyForAccessTokens(spotifyApi, authorizationCode);
    authSpotify.setGlobalSpotifyAuthentication(spotifyApi);
    await authSpotify.stopWebServer(webServer);
}
