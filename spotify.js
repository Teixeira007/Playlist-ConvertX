const { log } = require('console')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const { request } = require('http')
const authSpotify = require('./authSpotify');
const BASE_URL = 'https://api.spotify.com/v1/'

async function robot(idPlaylist, namePlaylist){


    // Pegar todas as músicas da playlist do spotify e colocar em uma lista
    async function getPlaylistSongsToList(idPlaylistSpotify){
        const token = await authSpotify._getToken();
        try{
            const result = await fetch(`${BASE_URL}playlists/${idPlaylistSpotify}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });
    
            const data = await result.json();
            console.log(data);
            
            
            const listMusics  = data.tracks.items
            
            const listSongs = [];
            listMusics.forEach(song => {
                const titleSong = song.track.name;
                const authorSong = song.track.artists[0].name;

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


    //buscar uma múscia no youtube e pegar o id, pelo nome da música e pelo author
    async function getTracks(nameTracks, authorTracks) {        
        try{
            const response = await youtube.search.list({
                part: ['snippet'],
                q: `${nameTracks} - ${authorTracks}` 
            })
    
            return response.data.items[0].id.videoId
        } catch (error) {
            console.error('Error:', error);
        }  
    }


    // pega todas as musicas da playlist do spotify e trasnformar em ids das mesmas musicas
    // no youtube
    async function getIdTracks(idPlaylistSpotify){
        let tracksList = await getPlaylistSongsToList(idPlaylistSpotify)
        try {
            const results = [];
            for (const song of tracksList) {
              const data = await getTracks(song.titleSong, song.authorSong);
              results.push(data);
            }
            
            return results;
          } catch (error) {
            console.error('Ocorreu um erro:', error);
          }
    }


    //criar uma playlist no spotify
    async function createPlaylistYoutube(namePlaylist, description){
        try {
            const result = await youtube.playlists.insert({
                part: ['snippet'],
                resource: {
                    snippet: {
                        title: namePlaylist,
                        description: description,
                    }
                }
            })
            
            return result.data.id

        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }


    //adicionar itens a playlist do youtube
    async function addPlaylistYoutube(idTracks, namePlaylist){
        const idPlaylistYoutube = await createPlaylistYoutube(namePlaylist, "descrição");
        
        try {
            for (const videoId of idTracks) {
                const result = await youtube.playlistItems.insert({
                    part: ['snippet'],
                    resource: {
                        snippet: {
                            playlistId: idPlaylistYoutube,
                            posotion: 0,
                            resourceId:{
                                kind:  "youtube#video",
                                videoId: videoId
                            }
                        }
                    }
                })
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    const idTracks = await getIdTracks(idPlaylist)
    addPlaylistYoutube(idTracks, namePlaylist)
}

module.exports = robot