const express = require('express');
const robot = require('./youtube');
const session = require('express-session');
const bodyParser = require('body-parser');
const auth2Youtube = require('./auth2Youtube')

const port = 3000;
let path = require('path');
const app = express();

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

app.post('/runRobot/:idPlaylist', async (req, res) => {
    const idPlaylist = req.params.idPlaylist;
   
    try {
        await robot.authenticateWithOAuth();
        // await robot(idPlaylist);
        res.json({ success: true, message: 'Robot executed successfully' });
    } catch (error) {
        console.error('Error running robot:', error);
        res.status(500).json({ success: false, message: 'Error running robot' });
    }
});

app.get('/auth', async (req, res) => {
    try {
        robot.authenticateWithOAuth(res)
    } catch (error) {
        console.error('Error initiating OAuth2 authentication:', error);
        res.status(500).json({ success: false, message: 'Error initiating OAuth2 authentication' });
    }
});

// app.get('/oauth2callback', async (req, res) => {
//     try {
//         const startWebServer = await auth2Youtube.startWebServer();
//         const OAuthClient = await auth2Youtube.createOAuthCliente();
//         const authorizationToken = req.query.code;
        
//         console.log(`> Consent given: ${authorizationToken}`);
//         await auth2Youtube.requestGoogleForAccessTokens(OAuthClient, authorizationToken);
//     } catch (error) {
//         console.error('Error handling OAuth2 callback:', error);
//         res.status(500).json({ success: false, message: 'Error handling OAuth2 callback' });
//     }
// });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});