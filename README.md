# Playlist-ConvertX

![Playlist-ConvertX](https://github.com/Teixeira007/Playlist-ConvertX/blob/main/front/img/convert_fav-removebg-preview-1-removebg-preview.png) <!-- Insira o logotipo ou uma imagem de apresentação do projeto aqui -->

## Descrição

**Playlist-ConvertX** é uma ferramenta para converter playlists entre os serviços de streaming Spotify e YouTube. Com esta aplicação, você pode migrar suas músicas favoritas entre plataformas de forma prática e rápida.

## Funcionalidades

- **Conversão entre Spotify e YouTube**: Transfira playlists inteiras de uma plataforma para outra em poucos passos.
- **Interface intuitiva**: Interface simples e de fácil utilização.
- **Automação com APIs**: Integra-se com as APIs do Spotify e do YouTube para facilitar o processo de conversão.

## Capturas de Tela

<!-- Inclua aqui imagens das principais telas da aplicação e exemplos de playlists convertidas. Exemplo: -->
![Tela Principal](https://github.com/Teixeira007/Playlist-ConvertX/blob/main/readme/gif_tela.gif)
*Exemplo da tela principal do Playlist-ConvertX.*

## Tecnologias Utilizadas

- **HTML, CSS, JavaScript** para o front-end.
- **Node.js** para o servidor back-end.
- **APIs do YouTube e Spotify** para integração com os serviços de streaming.

## Requisitos

- Node.js v14.0 ou superior
- Conta de desenvolvedor no Spotify e YouTube para obter as chaves da API.

## Como Clonar e Executar o Projeto

1. **Clone o Repositório**:
   ```bash
   git clone https://github.com/Teixeira007/Playlist-ConvertX.git


### Desafios no desenvolvimento
O desenvolvimento da Playlist ConvertX encontrou algumas dificuldades em alcançar 100% de precisão na conversão. Alguns problemas de correspondência entre as músicas foram um grande problema, especialmente quando os nomes das músicas são iguais ou quando os artistas têm variações nos registros entre as plataformas. Esse erro ocorreu principalmente na conversão de Youtube para Spotify, devido a algumas musicas que tem no youtube não serem publicadas no spotify

### Testes Realizados
Para garantir a eficácia da conversão, foram realizados diversos testes, utilizando diferentes abordagens de busca e critérios de correspondência. Abaixo estão os detalhes dos testes realizados e os resultados obtidos:

##### Teste 1 - Busca pelo nome da música

- Descrição: A busca foi realizada apenas pelo nome da música no Spotify.
- Resultado: De 50 músicas, 37 foram corretamente convertidas.
#### Teste 2 - Busca pelo nome da música e nome do cantor

- Descrição: A busca foi realizada pelo nome da música e nome do cantor no Spotify.
- Resultado: De 50 músicas, 38 foram corretamente convertidas.
#### Teste 3 - Busca pelo nome da música, nome do cantor, offset e market

- Descrição: A busca foi realizada pelo nome da música, nome do cantor, além de parâmetros adicionais de "offset" e "market" no Spotify API.
- Resultado: De 50 músicas, 29 foram corretamente convertidas.
#### Teste 4 - Busca pelo nome da música, nome do cantor, offset e locale

- Descrição: A busca foi realizada pelo nome da música, nome do cantor, além de parâmetros adicionais de "offset" e "locale" no Spotify API.
- Resultado: De 50 músicas, 32 foram corretamente convertidas.
#### Teste 5 - Busca pelo nome da música, nome do cantor e locale como PT-BR

- Descrição: A busca foi realizada pelo nome da música, nome do cantor, e com o parâmetro "locale" definido como PT-BR (Português do Brasil) no Spotify API.
- Resultado: De 50 músicas, 37 foram corretamente convertidas.
#### Teste 6 - Busca pelo nome da música, nome do cantor e limite 1

- Descrição: A busca foi realizada pelo nome da música, nome do cantor, e com o parâmetro "limite" definido como 1 (retornando apenas uma correspondência) no Spotify API.
- Resultado: De 50 músicas, 37 foram corretamente convertidas.
#### Teste 7 - Utilização da LevenshteinDistance

- Descrição: Foi utilizada a função LevenshteinDistance para calcular a distância entre as strings do nome da música no YouTube e no - Spotify, com uma sensibilidade de 0.4 (40% de similaridade).
- Resultado: De 50 músicas, 36 foram corretamente convertidas.
  
#### Teste 8 - Encode URI

- Descrição: Foi utilizado a função encodeURIComponent para codificar o nome da música e o nome do autor, antes de mandar a requisição para o spotify.
- Resultad: De 50 músicas, 46 foram corretamente convertidas.
