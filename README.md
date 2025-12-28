# Spotify Guess Who (Web Edition)

A real-time party game where players listen to music and guess which friend added the song to the playlist.

## Features
- **Real-time Synchronization**: Powered by Firebase Firestore.
- **Spotify Integration**: Login with Spotify to host games.
- **Mobile First**: Fully responsive design for party play on phones.
- **Easy Joining**: 6-digit room codes for instant access.

## Prerequisites
1.  **Node.js**: Version 18.x or higher.
2.  **Spotify Developer Account**: Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
    - Add `http://localhost:3000/api/auth/callback/spotify` as a Redirect URI.
3.  **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/).
    - Enable **Firestore Database**.
    - Set Firestore rules to "Test Mode" or allow public read/write for development.

## Installation

1.  Clone the repository or download the files.
2.  Install dependencies:
    