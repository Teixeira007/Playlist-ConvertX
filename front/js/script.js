let currentOrder = "youtubeFirst"; // Inicia com o YouTube primeiro
let isLoading = false; // Nova variável para controlar o estado de carregamento

document.getElementById('converterIcon').addEventListener('click', function() {
    const fieldsConvert = document.getElementById('fieldsConvert');
    const youtubeField = document.getElementById('youtubeField');
    const spotifyField = document.getElementById('spotifyField');

    // Verifica o estado atual
    if (currentOrder === "youtubeFirst") {
        // Se o YouTube estiver primeiro, troca para o Spotify primeiro
        fieldsConvert.insertAdjacentElement('afterbegin', spotifyField);
        fieldsConvert.insertAdjacentElement('beforeend', youtubeField);

        // Atualiza o estado
        currentOrder = "spotifyFirst";
    } else {
        // Se o Spotify estiver primeiro, troca para o YouTube primeiro
        fieldsConvert.insertAdjacentElement('afterbegin', youtubeField);
        fieldsConvert.insertAdjacentElement('beforeend', spotifyField);

        // Atualiza o estado
        currentOrder = "youtubeFirst";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const converterButton = document.getElementById('converter');
    converterButton.addEventListener('click',   authYoutube);
});

async function authYoutube() {
    try {
        // 1. Autenticar com YouTube
        const responseYoutube = await makeRequest('/authenticate/youtube');
        if (responseYoutube.consentUrl){
            window.open(responseYoutube.consentUrl, '_blank');
            const authToken = await waitForYoutubeAuth()
            if(authToken){
                await authSpotify()
            }
            
        }
    } catch (error) {
        alert('Erro ao autenticar no youtube. Verifique o console para mais detalhes.');
    }
}

async function authSpotify() {
    try{
        // 2. Autenticar com Spotify
        const responseSpotify = await makeRequest('/authenticate/spotify');
        if(responseSpotify.consentUrl){
            window.open(responseSpotify.consentUrl, '_blank');
            const authToken = await waitForSpotifyAuth(responseSpotify.consentUrl)
            if(authToken){
                await converterPlaylist()
            }
        }
    }catch (error) {
        alert('Erro ao autenticar no spotify. Verifique o console para mais detalhes.');
    }
}

async function converterPlaylist() {
    const idPlaylist = document.getElementById('id_playlist').value;
    const namePlaylist = document.getElementById('name_playlist').value;

    const loadingIcon = document.getElementById('loadingIcon');
    // Mostra o ícone de carregamento
    loadingIcon.style.display = 'inline-block';

    try{
         // 3. Executar o robô do YouTube com o ID da playlist
        const  response = await makeRequest(`/run/youtube?playlistId=${idPlaylist}&namePlaylist=${namePlaylist}`);
        if(response.success){
            alert(response.message);
            loadingIcon.style.display = 'none';
        }
    }catch (error) {
        alert('Erro ao converter a playlist. Verifique o console para mais detalhes.');
    }
}


async function waitForYoutubeAuth() {
    return new Promise((resolve) =>{
        const checkAuthInterval = setInterval(async () => {
            const response = await makeRequest('/check/youtube-auth'); // Rota que verifica se o token foi obtido
            if (response.authenticated) {
                clearInterval(checkAuthInterval);
                resolve(response.token); // Retorna o token de autenticação
            }
        }, 2000);
    });
}

async function waitForSpotifyAuth(consentUrl) {
    cont = 0;
    return new Promise((resolve) =>{
        const checkAuthInterval = setInterval(async () => {
            const response = await makeRequest('/check/spotify-auth'); // Rota que verifica se o token foi obtido
            cont +=1;
            if (cont == 7){
                window.open(consentUrl, '_blank');
            }

            if (response.authenticated) {
                clearInterval(checkAuthInterval);
                resolve(response.token); // Retorna o token de autenticação
            }
        }, 2000);
    });
}

async function makeRequest(endpoint) {
    try {
        const response = await fetch(endpoint, { method: 'GET' });
        const data = await response.json();
        return data
    } catch (error) {
        console.log('Erro ao fazer a solicitação:', error);
        throw error;
    }
}
