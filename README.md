# Spotify API Demo

This project demonstrates the usage of the Spotify API to search for artists and display their top tracks. It includes a secure server-side implementation for handling API requests and protecting sensitive credentials. The frontend is hosted on GitHub Pages, while the backend is deployed on Render.

## Features

- Search for artists using the Spotify API
- Display top 5 tracks for a selected artist
- Secure handling of Spotify API credentials
- Server-side API requests to protect client credentials
- CORS enabled for secure communication between frontend and backend

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed (version 18.x or higher recommended)
- npm (Node Package Manager) installed
- Spotify Developer account and API credentials
- GitHub account (for hosting the frontend)
- Render account (for hosting the backend)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/j-taggart/spotify-api-demo.git
   cd spotify-api-demo
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Spotify API credentials:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   PORT=3000
   ```

## Local Development

1. Start the server:
   ```
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000`

3. Enter an artist name in the search box and click "Search" to see the artist's top tracks.

## Deployment

### Frontend (GitHub Pages)

1. Update the `API_BASE_URL` in `public/script.js` to point to your Render backend URL.
2. Push your changes to the GitHub repository.
3. Go to your repository settings and enable GitHub Pages for the `main` branch.

### Backend (Render)

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Set the following:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add the following environment variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
5. Deploy the service.

## API Endpoints

- `GET /api/search`: Search for artists
  - Query parameters:
    - `q`: Search query (required)
    - `type`: Set to 'artist' (required)
    - `limit`: Number of results to return (optional, default 10)

- `GET /api/artist-top-tracks/:id`: Get top tracks for an artist
  - URL parameters:
    - `id`: Spotify artist ID (required)

- `GET /health`: Health check endpoint

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

If you have any questions or feedback, please open an issue on the GitHub repository.
