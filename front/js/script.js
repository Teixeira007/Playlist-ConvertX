let currentOrder = "youtubeFirst"; // Inicia com o YouTube primeiro
let isLoading = false; // Nova variável para controlar o estado de carregamento

let isSpotifyToYoutube = true;
let conversionDirection = localStorage.getItem('conversionDirection') || 'spotify-youtube';

function switchDirection() {
    isSpotifyToYoutube = !isSpotifyToYoutube;
    const directionText = document.getElementById('directionText');
    const convertButton = document.getElementById('convertButton');
    const firstPlatform = document.getElementById('firstPlatform');
    const secondPlatform = document.getElementById('secondPlatform');
    
    if (isSpotifyToYoutube) {
      directionText.textContent = 'Spotify → YouTube';
      convertButton.style.background = 'var(--spotify-green)';
      firstPlatform.innerHTML = '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>';
      secondPlatform.innerHTML = '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>';
      localStorage.setItem('conversionDirection', 'spotify-youtube');
    } else {
      directionText.textContent = 'YouTube → Spotify';
      convertButton.style.background = 'var(--youtube-red)';
      firstPlatform.innerHTML = '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>';
      secondPlatform.innerHTML = '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>';
      localStorage.setItem('conversionDirection', 'youtube-spotify');
    }
  }
  
  // Initialize direction from localStorage
  window.onload = function() {
    if (localStorage.getItem('conversionDirection') === 'youtube-spotify') {
      isSpotifyToYoutube = true;
      switchDirection();
    }
  }
  

const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const statusMessage = document.getElementById('conversionStatus');
const playlistId = ""
const newPlaylistName = ""


function startConversion() {
    
    
    const playlistId = document.getElementById('playlistId').value.trim();
    const newPlaylistName = document.getElementById('newPlaylistName').value.trim();

    if (!playlistId || !newPlaylistName) {
        statusMessage.textContent = 'Please fill in all fields';
      return;
    }else{
        
        authYoutube(playlistId, newPlaylistName, isSpotifyToYoutube)
        statusMessage.textContent = 'Converting playlist...';
        progressBar.style.display = 'block';
        
    }
  
    
}

async function authYoutube(playlistId, newPlaylistName, isSpotifyToYoutube) {
    try {
        // 1. Autenticar com YouTube
        const responseYoutube = await makeRequest('/authenticate/youtube');
        if (responseYoutube.consentUrl){
            window.open(responseYoutube.consentUrl, '_blank');
            const authToken = await waitForYoutubeAuth()
            if(authToken){
                await authSpotify(playlistId, newPlaylistName, isSpotifyToYoutube)
            }
        }
    } catch (error) {
        alert('Erro ao autenticar no youtube. Verifique o console para mais detalhes.');
    }
}

async function authSpotify(playlistId, newPlaylistName, isSpotifyToYoutube) {
    try{
        // 2. Autenticar com Spotify
        const responseSpotify = await makeRequest('/authenticate/spotify');
        if(responseSpotify.consentUrl){
            window.open(responseSpotify.consentUrl, '_blank');
            const authToken = await waitForSpotifyAuth(responseSpotify.consentUrl)
            if(authToken){
                await converterPlaylist(playlistId, newPlaylistName, isSpotifyToYoutube)
            }
        }
    }catch (error) {
        console.log('Erro ao fazer a solicitação:', error);
        alert('Erro ao autenticar no spotify 1. Verifique o console para mais detalhes');
    }
}

async function converterPlaylist(playlistId, newPlaylistName, isSpotifyToYoutube) {
    try{
         // 3. Executar o robô do YouTube com o ID da playlist
        if(!isSpotifyToYoutube){
            const  response = await makeRequest(`/run/youtube?playlistId=${playlistId}&namePlaylist=${newPlaylistName}`);
            if(response.success){
                let width = 0;
                const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    statusMessage.textContent = 'Conversion completed! Your new playlist is ready.';
                    setTimeout(() => {
                    progressBar.style.display = 'none';
                    progress.style.width = '0%';
                    }, 2000);
                } else {
                    width += 2;
                    progress.style.width = width + '%';
                }
                }, 10); // intervalo de 10ms para completar em 1 segundo (1000ms / 10ms = 100 incrementos de 2%)
            }
        }else{
            const  response = await makeRequest(`/run/spotify?playlistId=${playlistId}&namePlaylist=${newPlaylistName}`);
            if(response.success){
                let width = 0;
                const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    statusMessage.textContent = 'Conversion completed! Your new playlist is ready.';
                    setTimeout(() => {
                    progressBar.style.display = 'none';
                    progress.style.width = '0%';
                    }, 2000);
                } else {
                    width += 2;
                    progress.style.width = width + '%';
                }
                }, 10); // intervalo de 10ms para completar em 1 segundo (1000ms / 10ms = 100 incrementos de 2%)
            }
        }
    }catch (error) {
        alert('Erro ao converter a playlist 00. Verifique o console para mais detalhes.');
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
