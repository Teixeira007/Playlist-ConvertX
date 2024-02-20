const authYoutube = require('./authYoutube');
const authSpotify = require('./authSpotify');
const youtube = require('./youtube.js');

async function robot() {
    await authenticateWithYoutube();
    await authenticateWithSpotify();
    await youtube();
}

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

robot()
module.exports = robot;