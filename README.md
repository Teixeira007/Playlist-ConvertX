# Playlist-ConvertX
Playlist ConvertX: A Ponte Entre YouTube e Spotify" é uma ferramenta que permite aos usuários converterem facilmente suas playlists do YouTube em playlists do Spotify, e vice-versa. Com uma interface amigável e intuitiva, essa solução simplifica o processo de migração de músicas entre as duas plataformas.


### Status de Desenvolvimento
Atualmente, o desenvolvimento da Playlist ConvertX está focado na etapa de converter playlists do YouTube para o Spotify. No entanto, a equipe de desenvolvimento encontrou algumas dificuldades em alcançar 100% de precisão na conversão. Alguns problemas de correspondência entre as músicas têm sido identificados, especialmente quando os nomes das músicas são iguais ou quando os artistas têm variações nos registros entre as plataformas.

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
