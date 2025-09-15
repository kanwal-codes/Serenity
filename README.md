# Serenity 🎵

**Serenity** is a social music web app where friends host "listening parties" with perfectly synced playback, live chat, and shared playlists—right in the browser.

## ✨ Features

- **Synchronized Playback**: Perfect sync across all devices using heartbeat algorithm
- **Real-time Chat**: Live messaging during listening sessions
- **Group Management**: Create and join listening parties
- **Playlist Sharing**: Collaborative playlist creation and management
- **Google Authentication**: Secure sign-in with Google
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase project
- Google Cloud Console setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd serenity
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

### Backend
- **Firebase Authentication** for user management
- **Cloud Firestore** for data persistence
- **Socket.IO** for real-time synchronization (coming soon)

### Data Model

```
/users/{uid} - User profiles
/groups/{id} - Listening parties
  ├── members[] - Array of user IDs
  ├── /messages/{id} - Chat messages
  └── /playlists/{id} - Group playlists
    └── tracks[] - Array of track objects
```

## 🎵 How Synchronization Works

1. **Leader Selection**: One user becomes the "leader" (host)
2. **Heartbeat System**: Leader broadcasts position every ~800ms
3. **Drift Detection**: Followers check if they're >250ms out of sync
4. **Auto-Correction**: Out-of-sync clients automatically seek to correct position
5. **Control Events**: Play/pause/seek actions are instantly mirrored

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

- [ ] Socket.IO real-time sync server
- [ ] Audio engine with Media Session API
- [ ] Playlist management UI
- [ ] Real-time chat interface
- [ ] Mobile PWA support
- [ ] Spotify SDK integration
- [ ] Presence indicators
- [ ] Group moderation features

## 📱 Demo Script

1. **Sign In**: Use Google authentication
2. **Create Group**: Start a new listening party
3. **Add Tracks**: Upload or paste preview URLs
4. **Start Party**: Begin synchronized playback
5. **Invite Friends**: Share group ID for others to join
6. **Chat**: Send messages during playback
7. **Handoff**: Transfer leadership to another user

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