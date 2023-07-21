//criar uma playlist no spotify passando o usuario
async function createPlaylistSpotify(user_id, namePlaylist, description, status){
    const token = await _getToken();

    const requestBody = {
        name: namePlaylist,
        description: description,
        public: status
    };

    const result = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer ' + token, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await result.json();
    console.log(data);
}
// createPlaylistSpotify("31bjmt4e47poetc3xqmvpv43xhcy", "Teste1", "testedescri",false)


// Pegar dados da conta do spotify do usuário
// async function getUserSpotify(){
//     const token = await _getToken();

//     const result = await fetch(`https://api.spotify.com/v1/me`, {
//         method: 'GET',
//         headers: { 'Authorization': 'Bearer ' + token }
//     });

//     const data = await result.json();

// }