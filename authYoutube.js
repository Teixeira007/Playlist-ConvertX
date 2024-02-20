const express = require('express');
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;

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

async function createOAuthClient(){
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

            const closeScript = '<script>window.close();</script>';

            // Envie a resposta com o script
            res.send(`<h1>Thank you!</h1><p>Now close this tab.</p>${closeScript}`);
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

module.exports = {
    startWebServer,
    createOAuthClient,
    requestUserConsent,
    waitForGoogleCallback,
    requestGoogleForAccessTokens,
    setGlobalGoogleAuthentication,
    stopWebServer,
};