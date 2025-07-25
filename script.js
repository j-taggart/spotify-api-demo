// Spotify API credentials
const clientId = '52a138d0240e4d7eb273c4f4b9f2c65e';
const clientSecret = '98c3e1815bd14cd3b3a6327e12431719';

// Function to get the access token
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Function to make API requests
async function makeSpotifyRequest(endpoint, params = {}) {
    try {
        const token = await getAccessToken();
        const url = new URL(`https://api.spotify.com/v1${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error making Spotify request:', error);
        document.getElementById('result-container').innerHTML = 'Error: ' + error.message;
    }
}

// Function to get random popular songs
async function getRandomPopularSongs() {
    try {
        console.log('Starting getRandomPopularSongs...');
        const currentYear = new Date().getFullYear();
        const startYear = 1980;
        const endYear = currentYear - 10;
        const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const randomOffset = Math.floor(Math.random() * 1000); // Spotify allows max offset of 1000

        console.log(`Searching for songs from year: ${randomYear}, with offset: ${randomOffset}`);

        const params = {
            q: `year:${randomYear} genre:pop genre:rock genre:hip-hop genre:r-b genre:dance`,
            type: 'track',
            limit: 50,
            offset: randomOffset,
            market: 'US'
        };

        const data = await makeSpotifyRequest('/search', params);
        
        if (!data || !data.tracks || !data.tracks.items) {
            console.error('Invalid API response:', data);
            throw new Error('Invalid API response format');
        }

        console.log(`Retrieved ${data.tracks.items.length} tracks from API`);

        // Start with high popularity threshold and gradually lower it if needed
        let popularityThreshold = 70;
        let popularTracks = [];

        while (popularityThreshold >= 50 && popularTracks.length < 5) {
            popularTracks = data.tracks.items.filter(track => track.popularity >= popularityThreshold);
            console.log(`Found ${popularTracks.length} tracks with popularity >= ${popularityThreshold}`);
            popularityThreshold -= 5;
        }

        if (popularTracks.length === 0) {
            console.log('No tracks found after lowering threshold, using all available tracks');
            popularTracks = data.tracks.items;
        }

        const randomPopularTracks = popularTracks
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        console.log(`Returning ${randomPopularTracks.length} random tracks`);
        return randomPopularTracks;
    } catch (error) {
        console.error('Error in getRandomPopularSongs:', error);
        throw error;
    }
}

// Function to display random popular songs
function displayRandomSongs(songs) {
    let html = '<h2>5 Random Popular Songs:</h2>';
    songs.forEach((song, index) => {
        html += `
            <div class="track-item">
                <span class="track-rank">#${index + 1}</span>
                <div class="track-info">
                    <span class="track-title">${song.name}</span>
                    <span class="track-details">
                        Artist: ${song.artists.map(artist => artist.name).join(', ')}
                        | Album: ${song.album.name} (${formatReleaseDate(song.album.release_date)})
                    </span>
                </div>
            </div>
        `;
    });
    document.getElementById('result-container').innerHTML = html;
}

// Function to search for an artist
async function searchArtist(artistName) {
    const endpoint = `/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`;
    const data = await makeSpotifyRequest(endpoint);
    return data.artists.items;
}

// Function to get artist's top tracks
async function getTopTracks(artistId) {
    const endpoint = `/artists/${artistId}/top-tracks?market=US`;
    const data = await makeSpotifyRequest(endpoint);
    return data.tracks
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5);
}

// Function to format release date
function formatReleaseDate(date) {
    return date.split('-')[0]; // Get just the year
}

// Function to display top tracks
function displayTopTracks(tracks) {
    let html = '<h2>Top 5 Tracks:</h2>';
    tracks.forEach((track, index) => {
        html += `
            <div class="track-item">
                <span class="track-rank">#${index + 1}</span>
                <div class="track-info">
                    <span class="track-title">${track.name}</span>
                    <span class="track-details">
                        Album: ${track.album.name} (${formatReleaseDate(track.album.release_date)})
                    </span>
                </div>
            </div>
        `;
    });
    return html;
}

// Function to display search results
async function displayResults(artists, searchQuery) {
    const resultContainer = document.getElementById('result-container');
    if (artists.length === 0) {
        resultContainer.innerHTML = 'No artists found.';
        return;
    }

    // Check for exact match (case-insensitive)
    const exactMatch = artists.find(artist => artist.name.toLowerCase() === searchQuery.toLowerCase());
    
    let html = '<h2>Search Results:</h2>';
    if (exactMatch) {
        // If exact match found, display artist and their top tracks
        html += `
            <div class="artist-item">
                <span>${exactMatch.name}</span>
            </div>
        `;
        
        try {
            resultContainer.innerHTML = html + '<div class="loading">Loading top tracks...</div>';
            const topTracks = await getTopTracks(exactMatch.id);
            html += displayTopTracks(topTracks);
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            html += '<div class="error">Error loading top tracks.</div>';
        }
    } else {
        // If no exact match, show all results
        artists.forEach(artist => {
            html += `
                <div class="artist-item">
                    <span>${artist.name}</span>
                    <span>ID: ${artist.id}</span>
                </div>
            `;
        });
    }
    resultContainer.innerHTML = html;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const randomHitsButton = document.getElementById('random-hits-button');
    const artistInput = document.getElementById('artist-input');
    const resultContainer = document.getElementById('result-container');

    searchButton.addEventListener('click', async () => {
        const artistName = artistInput.value.trim();
        if (artistName) {
            resultContainer.innerHTML = 'Searching...';
            const artists = await searchArtist(artistName);
            displayResults(artists, artistName);
        } else {
            resultContainer.innerHTML = 'Please enter an artist name.';
        }
    });

    randomHitsButton.addEventListener('click', async () => {
        try {
            resultContainer.innerHTML = 'Fetching random popular songs...';
            const songs = await getRandomPopularSongs();
            if (songs.length === 0) {
                resultContainer.innerHTML = 'No songs found. Please try again.';
                return;
            }
            displayRandomSongs(songs);
        } catch (error) {
            console.error('Error fetching random songs:', error);
            resultContainer.innerHTML = 'Error fetching songs. Please try again.';
        }
    });

    artistInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    resultContainer.innerHTML = 'Enter an artist name and click Search, or click Get Random Hits.';
});
