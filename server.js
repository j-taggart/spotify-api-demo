const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for GitHub Pages
app.use(cors({
    origin: ['https://j-taggart.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use(express.static('public'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Spotify API endpoints
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

// Function to get Spotify access token
async function getSpotifyToken() {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error('Spotify credentials are not configured');
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error(`Failed to get Spotify token: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
        throw new Error('Invalid token response from Spotify');
    }

    return data.access_token;
}

// Endpoint to search for artists
app.get('/api/search', async (req, res) => {
    try {
        const { q, type, limit } = req.query;
        
        if (!q || !type) {
            return res.status(400).json({ error: 'Missing required parameters: q (query) and type' });
        }

        const token = await getSpotifyToken();
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit || 10}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.artists || !data.artists.items) {
            throw new Error('Invalid response format from Spotify API');
        }

        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(error.message.includes('parameters') ? 400 : 500)
           .json({ error: error.message || 'An error occurred while searching Spotify' });
    }
});

// Endpoint to get artist's top tracks
app.get('/api/artist-top-tracks/:id', async (req, res) => {
    try {
        const artistId = req.params.id;
        
        if (!artistId) {
            return res.status(400).json({ error: 'Artist ID is required' });
        }

        const token = await getSpotifyToken();
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/artists/${artistId}/top-tracks?market=US`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.tracks || !Array.isArray(data.tracks)) {
            throw new Error('Invalid response format from Spotify API');
        }

        res.json(data.tracks.slice(0, 5)); // Return only top 5 tracks
    } catch (error) {
        console.error('Error:', error);
        res.status(error.message.includes('required') ? 400 : 500)
           .json({ error: error.message || 'An error occurred while fetching data from Spotify API' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
