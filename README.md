# Pokémon Team Builder

Este é um projeto de aplicação web para construir times de Pokémon utilizando a API de Pokémon. A aplicação permite ao usuário selecionar Pokémon, visualizar suas estatísticas e adicionar os Pokémon a times personalizados.

## Funcionalidades

- Listagem dos 100 Pokémon da 2ª geração
- Exibição das estatísticas e tipos de cada Pokémon ao passar o mouse sobre a imagem
- Adição de Pokémon a um time (até 6 Pokémon por time)
- Remoção de Pokémon do time
- Criação de múltiplos times
- Cache das imagens dos Pokémon para uso offline

## Tecnologias Utilizadas

- HTML, CSS e JavaScript
- Dexie.js para IndexedDB
- Service Worker para cache offline

## Configuração do Projeto

### Pré-requisitos

- Navegador web moderno
- Conexão com a internet para a primeira carga

### Passos para Configuração

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/pokemon-team-builder.git
    cd pokemon-team-builder
    ```

2. Abra o arquivo `index.html` no navegador:
    ```bash
    open html/index.html
    ```

3. O Service Worker será registrado automaticamente e irá cachear os recursos necessários, incluindo as imagens dos Pokémon.


