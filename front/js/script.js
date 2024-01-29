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

async function converterPlaylist(){
    const loadingIcon = document.getElementById('loadingIcon');
    const youtubeField = document.getElementById('youtubeField');
    const spotifyField = document.getElementById('spotifyField');
    const inputIdPlaylist = document.getElementById('id_playlist').value;

    // Mostra o ícone de carregamento
    loadingIcon.style.display = 'inline-block';

    // Desativa os botões para evitar cliques múltiplos durante o carregamento
    youtubeField.querySelector('button').disabled = true;
    spotifyField.querySelector('button').disabled = true;
    window.location.href = '/auth';

    // try {
    //     // Faz a requisição AJAX para iniciar a conversão
    //     const response = await fetch(`/runRobot/${inputIdPlaylist}`, { 
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json', // Indica que o conteúdo é JSON
    //         },
    //     });
    //     const data = await response.json();

    //     // Exibe mensagem de sucesso ou erro (substitua isso pelo seu feedback real)
    //     if (data.success) {
    //         alert('Conversão iniciada com sucesso!');
    //     } else {
    //         alert('Erro ao iniciar a conversão.');
    //     }
    // } catch (error) {
    //     console.error('Erro durante a conversão:', error);
    // } finally {
    //     // Esconde o ícone de carregamento
    //     loadingIcon.style.display = 'none';

    //     // Reativa os botões após o término da conversão
    //     youtubeField.querySelector('button').disabled = false;
    //     spotifyField.querySelector('button').disabled = false;
    // }
        
}
