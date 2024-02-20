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
const authSpotify = require('./authSpotify');


async function robot(idPlaylist){
    
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

    //buscar uma múscia no spotify e pegar o id, pelo nome da música e pelo author
    // getTracks("Bruno & Marrone - Por um Minuto (Por um Minuto) (Ao Vivo)", "BrunoEMarroneVEVO")
    async function getTracks(nameTracks, authorTracks) {
        const token = await authSpotify._getToken();

        const nameTracksEncode = encodeURIComponent(nameTracks);
        const authorTracksEncode = encodeURIComponent(authorTracks);

        
        const result = await fetch(`https://api.spotify.com/v1/search?query=${nameTracksEncode} artist=${authorTracksEncode}&locale=pt-BR%2Cpt%3Bq%3D0.9%2Cen-US%3Bq%3D0.8%2Cen%3Bq%3D0.7&type=track&limit=20&offset=0`, {
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
        const idTracksStrings = idTracks.map(x => {
            if(x != null){
                return `spotify:track:${x}`
            }
            return null;
        }).filter(x => x !== null)


        const access_token = await authSpotify.getSpotifyAccessToken();
        

        const user = await getUserSpotify(access_token)
        const idPlaylistSpotify = await createPlaylistSpotify(user.id, "Teste14", "testedescr", true, access_token);
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

    const idTracks = await getIdTracks(idPlaylist)
    // console.log(idTracks);
    // getTracks("Mudou a Estação")
    addPlaylistSpotify(idTracks)
    // getPlaylistSongsToList("PLqBi3xrllzWaayMb7JBrB0qOK-0QVpFte")
}

module.exports = robot