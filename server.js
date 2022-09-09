// npm install express
const express = require('express');
let cors = require('cors')
const querystring = require('node:querystring');
const { access } = require('node:fs');
// npm install dotenv
require('dotenv').config();
// node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
let authorization_code = null;
let access_token = null;
let refresh_token = null;

const server = express();
server.listen(process.env.PORT || 8888, () => {
    // console.log('starting server at https://spotify-playlist-merge.herokuapp.com/');
});

server.use(express.static('public'));
server.use(express.json({ limit: '5mb' }));
server.use(cors());

server.get('/login', (req, res) => {

    var scope = 'user-read-private user-read-email user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-public';

    const api_url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
        }) + '&redirect_uri=' + redirect_uri;
    
    res.redirect(api_url);
});

server.get('/callback', async function (req, res) {
    authorization_code = req.query.code || null;
    let api_url = 'https://accounts.spotify.com/api/token';

    // let form = "grant_type=authorization_code";
    // form += "&code=" + code;
    // form += "&redirect_uri=" + encodeURI(redirect_uri);
    // form += "&client_id=" + client_id;
    // form += "&client_secret=" + client_secret;

    // let authOptions = {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': 'Basic ' + (Buffer.from(
    //             client_id + ':' + client_secret
    //         ).toString('base64')),
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //     },
    //     body: form
    // }

    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(
                client_id + ':' + client_secret
            ).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=authorization_code'
         + '&code=' + authorization_code
         + '&redirect_uri=' + encodeURI(redirect_uri)
         + '&client_id=' + client_id
         + '&client_secret=' + client_secret
    });
    let token = await response.json();
    access_token = token.access_token;
    refresh_token = token.refresh_token;
    // console.log(token);
    // console.log('access_token=' + access_token);
    // console.log('refresh_token=' + refresh_token);
 
    res.redirect('https://spotify-playlist-merge.herokuapp.com/playlist.html' + '?access_token=' + access_token);
});


// if ( this.status == 401 ){
//      refreshAccessToken()
server.get('/refresh', async function (req, res) {
    let api_url = 'https://accounts.spotify.com/api/token';

    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(
                client_id + ':' + client_secret
            ).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=refresh_token'
            + '&refresh_token=' + refresh_token
            + '&client_id=' + client_id
    });
    const new_token = await response.json()
    access_token = new_token.access_token;
    res.redirect('https://spotify-playlist-merge.herokuapp.com/playlist.html' + '?access_token=' + access_token);
});

// merge
// add delete multiple 
// see who liked playlist