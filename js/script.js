if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('../js/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.error('Falha ao registrar o Service Worker:', error);
        });
    });
  }
  
// Restante do código existente
const db = new Dexie("PokemonDB");
db.version(2).stores({
    pokemon: '++id,name,imageUrl,types,stats',
    teams: '++id,name,pokemons'
});

const apiURL = 'https://pokeapi.co/api/v2/pokemon';
const startId = 152; 
const endId = 251; 
const maxTeamSize = 6;
let selectedTeamId = null;

async function fetchAndCachePokemon() {
    for (let id = startId; id <= endId; id++) {
        const response = await fetch(`${apiURL}/${id}`);
        const data = await response.json();
        const pokemon = {
            name: data.name,
            imageUrl: data.sprites.front_default,
            types: data.types.map(t => t.type.name),
            stats: data.stats.map(s => ({ name: s.stat.name, base_stat: s.base_stat }))
        };
        await db.pokemon.add(pokemon);
    }
}

// Carregar Pokémon do IndexedDB
async function loadPokemon() {
    const pokemonList = await db.pokemon.toArray();
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon');
        pokemonDiv.innerHTML = `<img src="${pokemon.imageUrl}" alt="${pokemon.name}">`;
        pokemonDiv.addEventListener('click', () => addToTeam(pokemon));
        pokemonDiv.addEventListener('mouseover', () => showPokemonDetails(pokemon));
        pokemonDiv.addEventListener('mouseout', () => clearPokemonDetails());
        grid.appendChild(pokemonDiv);
    });
}

function showPokemonDetails(pokemon) {
    document.getElementById('pokemon-name').innerText = pokemon.name;
    document.getElementById('pokemon-image').src = pokemon.imageUrl;
    document.getElementById('pokemon-type').innerHTML = `Tipo: ${pokemon.types.join(', ')}`;
    const statsDiv = document.getElementById('pokemon-stats');
    statsDiv.innerHTML = '';
    pokemon.stats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.classList.add('progress-bar');
        statDiv.innerHTML = `
            <div style="width: ${stat.base_stat}%;">${stat.name}: ${stat.base_stat}</div>
        `;
        statsDiv.appendChild(statDiv);
    });
}

function clearPokemonDetails() {
    document.getElementById('pokemon-name').innerText = '';
    document.getElementById('pokemon-image').src = '';
    document.getElementById('pokemon-type').innerHTML = '';
    document.getElementById('pokemon-stats').innerHTML = '';
}

// Adicionar pokemon no time
async function addToTeam(pokemon) {
    if (selectedTeamId === null) {
        alert("Por favor, selecione um time para editar.");
        return;
    }

    const team = await db.teams.get(selectedTeamId);
    if (team.pokemons.length < maxTeamSize) {
        team.pokemons.push(pokemon);
        await db.teams.put(team);
        updateTeamDisplay();
    } else {
        alert("Seu time está cheio!");
    }
}

// Remover pokemon do time
async function removeFromTeam(pokemonIndex) {
    if (selectedTeamId === null) {
        alert("Por favor, selecione um time para editar.");
        return;
    }

    const team = await db.teams.get(selectedTeamId);
    team.pokemons.splice(pokemonIndex, 1);
    await db.teams.put(team);
    updateTeamDisplay();
}

// Atualizar time
async function updateTeamDisplay() {
    const teamsDiv = document.getElementById('teams');
    const teams = await db.teams.toArray();
    teamsDiv.innerHTML = '';
    teams.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');
        if (team.id === selectedTeamId) {
            teamDiv.classList.add('selected-team');
        }
        teamDiv.innerHTML = `<h3>${team.name}</h3>`;
        team.pokemons.forEach((pokemon, index) => {
            const memberDiv = document.createElement('div');
            memberDiv.classList.add('team-member');
            memberDiv.innerHTML = `<img src="${pokemon.imageUrl}" alt="${pokemon.name}">`;
            memberDiv.addEventListener('click', () => removeFromTeam(index));
            teamDiv.appendChild(memberDiv);
        });
        for (let i = team.pokemons.length; i < maxTeamSize; i++) {
            const memberDiv = document.createElement('div');
            memberDiv.classList.add('team-member');
            teamDiv.appendChild(memberDiv);
        }
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('team-controls');
        controlsDiv.innerHTML = `
            <button class="update-team" onclick="selectTeam(${team.id})">Selecionar</button>
            <button class="delete-team" onclick="deleteTeam(${team.id})">Deletar</button>
        `;
        teamDiv.appendChild(controlsDiv);
        teamsDiv.appendChild(teamDiv);
    });
}

// Selecionar time para editar
function selectTeam(teamId) {
    selectedTeamId = teamId;
    updateTeamDisplay();
}

// Criar um novo time
async function createTeam() {
    const teamCount = await db.teams.count();
    const newTeam = { name: `Time ${teamCount + 1}`, pokemons: [] };
    const teamId = await db.teams.add(newTeam);
    selectTeam(teamId);
}

// Deletar time
async function deleteTeam(teamId) {
    await db.teams.delete(teamId);
    if (selectedTeamId === teamId) {
        selectedTeamId = null;
    }
    updateTeamDisplay();
}

async function init() {
    const pokemonCount = await db.pokemon.count();
    if (pokemonCount === 0) {
        await fetchAndCachePokemon();
    }
    await loadPokemon();
    await updateTeamDisplay();
}

document.getElementById('create-team-btn').addEventListener('click', createTeam);

init();
