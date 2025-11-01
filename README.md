# Serenity 🎵

**Serenity** is a modern music discovery and social platform that combines the best features from popular music and social apps. Experience Spotify-inspired music browsing, Apple Music-style discovery, Reddit-like community discussions, and Instagram-style messaging—all in one beautiful, cohesive interface.

## ✨ Features

### 🏠 **Spotify-Inspired Home**
- Collapsible sidebar navigation with playlists
- Recently played tracks with hover-to-play
- Made for you recommendations
- Persistent music player with full controls
- User profile integration

### 🔍 **Apple Music-Style Discover**
- Featured content with large, immersive cards
- New releases section with album artwork
- Trending songs with play controls
- Browse by genre with visual categories
- Curated playlists and recommendations

### 📱 **Reddit-Inspired Community Feed**
- Music discussion posts with voting system
- Embedded music previews in posts
- Comments, sharing, and bookmarking
- Tags and awards system
- Sort options (Hot, New, Top, Rising)

### 💬 **Instagram-Style Chat**
- Real-time messaging interface
- Music sharing in conversations
- Online status indicators
- Typing indicators and media sharing
- Group and direct messaging

### 🎨 **Unified Design System**
- Consistent dark theme throughout
- Smooth animations and transitions
- Responsive design for all devices
- Modern UI with Tailwind CSS
- Material Design-inspired interface with purple/pink gradients

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Backend**: Firebase Authentication, Cloud Firestore
- **Music API**: Spotify Web API (PKCE Authentication)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icon library
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication)
- Spotify Developer account (for music features)

### 1. Clone and Install

```bash
git clone https://github.com/kanwal-codes/Serenity.git
cd Serenity
npm install
```

### 2. Environment Variables Setup

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable **Authentication** (Google provider)
4. Enable **Cloud Firestore Database**
5. Add a web app and copy your Firebase config
6. Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 4. Spotify API Setup

**Important:** Spotify no longer supports the implicit grant flow. This app uses **PKCE (Proof Key for Code Exchange)** for secure authentication.

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your **Client ID**
4. Add redirect URI: `http://127.0.0.1:3000/callback` (or `http://localhost:3000/callback`)
5. Update `.env.local`:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

**Note:** The redirect URI must match exactly what you set in the Spotify Dashboard. For production, add your production URL to both the dashboard and environment variables.

See [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) for detailed Spotify setup instructions.

### 5. Firestore Security Rules

Add these rules to your Firestore database in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Groups: members can read, owners can write
    match /groups/{groupId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      
      // Messages: group members can read/write
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;
      }
      
      // Playlists: group members can read/write
      match /playlists/{playlistId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;
      }
    }
  }
}
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:3000](http://127.0.0.1:3000) to see the app.

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── spotify/
│   │       └── token/
│   │           └── route.js          # Server-side token exchange (PKCE)
│   ├── callback/
│   │   └── page.jsx                  # Spotify OAuth callback handler
│   ├── page.jsx                       # Main app page with routing
│   ├── layout.jsx                     # Root layout with providers
│   └── globals.css                    # Global styles and animations
├── components/
│   ├── MainNavigation.jsx             # Sidebar navigation component
│   ├── SpotifyHome.jsx                # Home page component
│   ├── MusicSearch.jsx                # Music search component
│   ├── SpotifyDiscovery.jsx           # Discovery page component
│   ├── RedditFeed.jsx                 # Community feed component
│   ├── InstagramChat.jsx            # Chat component
│   └── ui/                            # Reusable UI components (shadcn/ui)
├── contexts/
│   └── AuthContext.js                 # Firebase authentication context
└── lib/
    ├── firebase.js                    # Firebase configuration
    ├── spotify.js                     # Spotify API client (PKCE implementation)
    ├── auth.js                        # Authentication helpers
    └── firestore.js                   # Firestore operations
```

### Authentication Flow

#### Firebase Authentication
- Uses Firebase Auth with Google provider
- Context-based state management via `AuthContext`
- Protected routes via authentication checks

#### Spotify Authentication (PKCE)
**Why PKCE?** Spotify deprecated the implicit grant flow. PKCE is more secure and is now the recommended approach for single-page applications.

1. **Client-side:** Generate PKCE code verifier and challenge
2. **Redirect:** User authorizes on Spotify with code challenge
3. **Callback:** Spotify redirects with authorization code
4. **Server-side:** Exchange code for token (keeps client secret secure)
5. **Storage:** Token stored in localStorage with expiration

See `src/lib/spotify.js` for detailed implementation comments.

### Key Design Decisions

#### 1. Server-Side Token Exchange
**Location:** `src/app/api/spotify/token/route.js`

**Why:** The authorization code must be exchanged server-side to keep the client secret secure. Even though PKCE doesn't require a client secret, we use a server endpoint to:
- Keep token exchange logic centralized
- Enable future refresh token handling
- Follow OAuth 2.0 best practices

#### 2. Session Storage for Code Verifier
**Location:** `src/lib/spotify.js` - `authorize()` method

**Why:** The code verifier must persist between the authorization request and the callback. We use `sessionStorage` instead of `localStorage` because:
- It's more secure (cleared on tab close)
- It's only needed during the OAuth flow
- Prevents accidental reuse of verifiers

#### 3. Async Token Retrieval
**Location:** `src/lib/spotify.js` - `getAccessToken()` method

**Why:** The method is async because it may need to exchange an authorization code for a token on first load. This allows the callback page to seamlessly handle the OAuth flow.

## 🎵 How It Works

### Navigation
- **Unified Sidebar**: Single navigation that works across all pages
- **Page Switching**: Seamless transitions between different app sections
- **Persistent Player**: Music controls stay visible while browsing

### Music Integration
- **Spotify API**: Search, browse, and discover music
- **Preview Playback**: 30-second previews using HTML5 Audio
- **Music Sharing**: Share tracks in chat and community posts
- **Playlist Management**: Create and manage personal playlists

### Social Features
- **Community Posts**: Share music discoveries and discussions
- **Voting System**: Upvote/downvote posts and comments
- **Real-time Chat**: Instant messaging with music sharing (planned)
- **User Profiles**: Personalized experience with authentication

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **Components**: Functional components with React hooks
- **Styling**: Tailwind CSS utility classes
- **State Management**: React Context API for global state, useState for local
- **File Naming**: PascalCase for components, camelCase for utilities

### Important Notes

1. **Environment Variables**: All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets there.
2. **Spotify Redirect URI**: Must match exactly between environment variables and Spotify Dashboard.
3. **Token Storage**: Access tokens are stored in localStorage. Consider implementing refresh token flow for production.
4. **Firebase Rules**: Always test Firestore security rules in Firebase Console.

## 🚧 Current Status & Roadmap

### ✅ Completed
- [x] Firebase Authentication integration
- [x] Spotify Web API integration with PKCE
- [x] Music search and discovery
- [x] Modern Material Design UI
- [x] Responsive navigation and layout

### 🚧 In Progress / Planned
- [ ] Real-time chat functionality with Socket.IO
- [ ] Full Spotify playback control (requires Premium API)
- [ ] User-generated content and posts
- [ ] Advanced playlist management
- [ ] Mobile PWA support
- [ ] Push notifications
- [ ] Music recommendation engine
- [ ] Social features (following, friends)

## 📱 Usage Guide

### First Time Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Firebase**: Create project, enable Auth and Firestore
4. **Set up Spotify**: Create app in Developer Dashboard
5. **Configure environment**: Copy `env.example` to `.env.local` and fill in values
6. **Run the app**: `npm run dev`

### Using the App

1. **Sign In**: Click "Sign In" to authenticate with Firebase (Google)
2. **Connect Spotify**: Navigate to Search or Discover page, click "Connect Spotify"
3. **Search Music**: Use the Search page to find songs, artists, or albums
4. **Discover**: Browse featured playlists and new releases
5. **Play Previews**: Click play button on any track for 30-second preview
6. **Open in Spotify**: Click "Open in Spotify" for full playback (requires Spotify app)

## 🐛 Troubleshooting

### Spotify Authentication Issues

**Problem:** "unsupported_response_type" error
- **Solution:** Ensure you're using the latest code. This app uses PKCE, not implicit grant.

**Problem:** Redirect URI mismatch
- **Solution:** Verify the redirect URI in `.env.local` exactly matches the one in Spotify Dashboard (including `http://` vs `https://`, `localhost` vs `127.0.0.1`)

**Problem:** Token not persisting
- **Solution:** Check browser console for errors. Ensure localStorage is enabled.

### Firebase Issues

**Problem:** Authentication not working
- **Solution:** Verify Firebase config in `.env.local`. Check that Google provider is enabled in Firebase Console.

**Problem:** Firestore permission denied
- **Solution:** Check Firestore security rules. Ensure they match the rules in this README.

### Build Issues

**Problem:** Build fails
- **Solution:** Clear `.next` folder and `node_modules`, then reinstall:
  ```bash
  rm -rf .next node_modules
  npm install
  npm run dev
  ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Contribution Guidelines

- Follow existing code style and patterns
- Add comments for complex logic or unusual implementations
- Update documentation if adding new features
- Test your changes locally before submitting PR

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Firebase](https://firebase.google.com/)
- Music API by [Spotify](https://developer.spotify.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Need Help?** Check the [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) for detailed Spotify configuration, or open an issue on GitHub.
