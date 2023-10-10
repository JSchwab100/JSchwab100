// List of AFL teams
const teams = ["Adelaide Crows", "Brisbane Bears", "Brisbane Lions", "Collingwood Magpies", "Carlton Blues", "Essendon", 
"Fitzroy", "Fremantle Dockers","Geelong Cats", "Gold Coast Suns", "GWS Giants", "Hawthorn Hawks", "Melbourne Demons", "North Melbourne Kangaroos", 
"Port Adelaide Power", "Richmond Tigers", "St Kilda Saints", "Sydney Swans", "West Coast Eagles", "Western Bulldogs"];

/**
 * Populates the dropdown lists with team names.
 */
function populateDropdowns() {
    const team1Dropdown = document.getElementById('team1');
    const team2Dropdown = document.getElementById('team2');

    // Loop over each team and add it as an option to both dropdowns
    teams.forEach(team => {
        team1Dropdown.innerHTML += `<option value="${team}">${team}</option>`;
        team2Dropdown.innerHTML += `<option value="${team}">${team}</option>`;
    });
};

// Object to store player data for each team
let playerData = {};

/**
 * Fetches player data for all teams from their respective JSON files.
 */
function fetchPlayerData() {
    // Generate fetch promises for all teams
    const fetchPromises = teams.map(team => 
        fetch(`data-clubplayers/${team.toLowerCase().replace(/\s+/g, '')}.json`).then(response => {
            // If fetching data for a team fails, log the error
            if (!response.ok) {
                console.error(`Failed to fetch data for team: ${team}`);
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
    );

    // Once all promises resolve, populate the playerData object
    Promise.all(fetchPromises)
    .then(dataArray => {
        dataArray.forEach((teamData, index) => {
            playerData[teams[index]] = teamData;
        });
        populateDropdowns();
    })
    .catch(error => console.error("Error fetching player data:", error));
}

/**
 * Identifies and lists players who played for both selected teams.
 */
function findPlayers() {
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;

    const team1Players = playerData[team1] ? playerData[team1].map(player => ({ id: `${player["Player"]}-${player["DOB"]}`, data: player })) : [];
    const team2Players = playerData[team2] ? playerData[team2].map(player => ({ id: `${player["Player"]}-${player["DOB"]}`, data: player })) : [];

    const matchingPlayers = team1Players.filter(player1 => 
        team2Players.some(player2 => player1.id === player2.id)
    ).map(player1 => {
        // Convert "DOB" string to a Date object
        const convertedDOB = new Date(player1.data["DOB"].split("/")[2], player1.data["DOB"].split("/")[1] - 1, player1.data["DOB"].split("/")[0]);

        // Log the conversion result to ensure it's correct
        console.log(player1.data["Player"], convertedDOB); 

        return {
            name: player1.data["Player"].split(', ').reverse().join(' '),
            team1Seasons: player1.data["Seasons"],
            team2Seasons: team2Players.find(player2 => player1.id === player2.id).data["Seasons"],
            dob: convertedDOB
        };        
    });

    // Sort the matching players by their DOB (most recently born to least recently)
    matchingPlayers.sort((a, b) => b.dob - a.dob);

    // Log the sorted players to ensure the sorting worked
    console.log(matchingPlayers);

    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    matchingPlayers.forEach(player => {
        const li = document.createElement('li');
        
        const playerName = document.createElement('div');
        playerName.textContent = player.name;
        li.appendChild(playerName);
        
        const team1Seasons = document.createElement('div');
        team1Seasons.textContent = `${team1}: ${player.team1Seasons}`;
        li.appendChild(team1Seasons);
        
        const team2Seasons = document.createElement('div');
        team2Seasons.textContent = `${team2}: ${player.team2Seasons}`;
        li.appendChild(team2Seasons);
        
        playerList.appendChild(li);
    });
    
}

function updateTeamImage(teamSelectId) {
    const selectedTeam = document.getElementById(teamSelectId).value;
    
    // Assuming the images are named exactly as the team names but in lowercase and without spaces, and they're in an "images" directory
    const imageUrl = `images/${selectedTeam.toLowerCase().replace(/\s+/g, '')}.png`;

    const imageElement = document.getElementById(teamSelectId + 'Image');
    imageElement.src = imageUrl;
    imageElement.style.display = "block"; // Make the image visible
}



/**
 * Search and list players based on a given query.
 */
function searchPlayers() {
    const query = document.getElementById('searchInput').value.toLowerCase(); // User input in lowercase
    const searchResults = document.getElementById('searchResults');

    // Clear previous search results
    searchResults.innerHTML = '';

    // Check each team's data for matching players
    for (const team in playerData) {
        const matchingPlayers = playerData[team].filter(player => 
            player["Player"].toLowerCase().includes(query)
        );

        matchingPlayers.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player["Player"]} (${team}, Seasons: ${player["Seasons"]})`;
            searchResults.appendChild(li);
        });
    }
}

// Load player data upon page initialization
fetchPlayerData();