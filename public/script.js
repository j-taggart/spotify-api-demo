// API configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' // Local development URL
    : 'https://spotify-api-demo-backend.onrender.com'; // Render backend URL

// Function to handle API responses
async function handleApiResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    return response.json();
}

// Function to search for an artist
async function searchArtist(artistName) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`);
        const data = await handleApiResponse(response);
        if (!data.artists || !data.artists.items) {
            throw new Error('Invalid response format from server');
        }
        return data.artists.items;
    } catch (error) {
        console.error('Error searching for artist:', error);
        throw new Error('Failed to search for artist. Please try again.');
    }
}

// Function to get artist's top tracks
async function getTopTracks(artistId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/artist-top-tracks/${artistId}`);
        const tracks = await handleApiResponse(response);
        if (!Array.isArray(tracks)) {
            throw new Error('Invalid response format from server');
        }
        return tracks;
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        throw new Error('Failed to fetch top tracks. Please try again.');
    }
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
    const artistInput = document.getElementById('artist-input');
    const resultContainer = document.getElementById('result-container');

    searchButton.addEventListener('click', async () => {
        const artistName = artistInput.value.trim();
        if (artistName) {
            resultContainer.innerHTML = 'Searching...';
            try {
                const artists = await searchArtist(artistName);
                await displayResults(artists, artistName);
            } catch (error) {
                resultContainer.innerHTML = `Error: ${error.message}`;
            }
        } else {
            resultContainer.innerHTML = 'Please enter an artist name.';
        }
    });

    artistInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    resultContainer.innerHTML = 'Enter an artist name to see their top tracks.';
});
