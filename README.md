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
- Accessible and intuitive navigation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Backend**: Firebase Authentication, Cloud Firestore
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icon library
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase project
- Google Cloud Console setup

### 1. Clone and Install

```bash
git clone https://github.com/kanwal-codes/Serenity.git
cd Serenity
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Add a web app to your project
4. Copy the Firebase config

### 3. Environment Variables

Copy `env.example` to `.env.local` and fill in your Firebase config:

```bash
cp env.example .env.local
```

Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Add these rules to your Firestore database:

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

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **React 19** with hooks and context
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide React** for icons
- **Radix UI** for accessible components

### Backend
- **Firebase Authentication** for user management
- **Cloud Firestore** for data persistence
- **Real-time updates** for chat and interactions

### Key Components

```
src/
├── app/
│   ├── page.jsx              # Main app with navigation
│   └── layout.jsx            # Root layout with AuthProvider
├── components/
│   ├── MainNavigation.jsx    # Unified sidebar navigation
│   ├── SpotifyHome.jsx       # Spotify-inspired home page
│   ├── AppleMusicDiscover.jsx # Apple Music-style discover
│   ├── RedditFeed.jsx        # Reddit-inspired community feed
│   ├── InstagramChat.jsx     # Instagram-style messaging
│   └── ui/                   # Reusable UI components
├── contexts/
│   └── AuthContext.js        # Authentication context
└── lib/
    ├── firebase.js           # Firebase configuration
    ├── auth.js               # Authentication functions
    └── utils.js              # Utility functions
```

## 🎵 How It Works

### Navigation
- **Unified Sidebar**: Single navigation that works across all pages
- **Page Switching**: Seamless transitions between different app sections
- **Persistent Player**: Music controls stay visible while browsing

### Music Integration
- **Preview Playback**: Hover-to-play functionality on tracks
- **Music Sharing**: Share tracks in chat and community posts
- **Playlist Management**: Create and manage personal playlists

### Social Features
- **Community Posts**: Share music discoveries and discussions
- **Voting System**: Upvote/downvote posts and comments
- **Real-time Chat**: Instant messaging with music sharing
- **User Profiles**: Personalized experience with authentication

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── lib/                # Utilities and configurations
│   ├── firebase.js     # Firebase config
│   ├── auth.js         # Auth functions
│   └── firestore.js    # Firestore operations
└── hooks/              # Custom React hooks
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚧 Roadmap

- [ ] Real-time chat functionality with Socket.IO
- [ ] Spotify Web API integration for actual music streaming
- [ ] User-generated content and posts
- [ ] Advanced playlist management
- [ ] Mobile PWA support
- [ ] Push notifications
- [ ] Music recommendation engine
- [ ] Social features (following, friends)

## 📱 Demo Script

1. **Sign In**: Use Google authentication to access the app
2. **Explore Home**: Browse your music library with Spotify-style interface
3. **Discover Music**: Check out new releases and trending tracks
4. **Join Community**: Read and interact with music discussion posts
5. **Chat with Friends**: Send messages and share music in real-time
6. **Create Playlists**: Build your personal music collections
7. **Vote & Engage**: Participate in community discussions and voting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Firebase](https://firebase.google.com/)
- Icons by [Lucide](https://lucide.dev/)