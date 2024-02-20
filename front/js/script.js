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
    converterButton.addEventListener('click', converterPlaylist);
});

async function converterPlaylist() {
    const idPlaylist = document.getElementById('id_playlist').value;
    const loadingIcon = document.getElementById('loadingIcon');
    // Mostra o ícone de carregamento
    // loadingIcon.style.display = 'inline-block';

    try {
        // 1. Autenticar com YouTube
        await makeRequest('/authenticate/youtube');

        // 2. Autenticar com Spotify
        await makeRequest('/authenticate/spotify');

        // 3. Executar o robô do YouTube com o ID da playlist
        await makeRequest(`/run/youtube?playlistId=${idPlaylist}`);

        alert('Playlist convertida com sucesso!');
    } catch (error) {
        console.error('Erro ao converter a playlist:', error);
        alert('Erro ao converter a playlist. Verifique o console para mais detalhes.');
    }
}

async function makeRequest(endpoint) {
    try {
        const response = await fetch(endpoint, { method: 'GET' });
        const data = await response.json();
        console.log(data); // Você pode lidar com os dados da resposta conforme necessário
    } catch (error) {
        console.error('Erro ao fazer a solicitação:', error);
        throw error;
    }
}
