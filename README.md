# Serenity

A social music streaming platform built with Next.js 14, Firebase, and real-time features.

## Prerequisites

- Node.js 18+ 
- npm
- Firebase project with Authentication enabled

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication → Sign-in method → Google
   - Go to Project Settings → General → Your apps → Add app → Web
   - Copy the Firebase config values

3. **Create environment file:**
   Create `.env.local` in the root directory with your Firebase config:
   ```env
   NEXT_PUBLIC_FB_API_KEY=your_api_key_here
   NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FB_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FB_APP_ID=your_app_id_here
   ```

4. **Configure Firebase Authentication:**
   - In Firebase Console → Authentication → Settings → Authorized domains
   - Add `localhost` to the list

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Google Sign-In/Sign-Out with Firebase Auth
- ✅ Responsive UI with Tailwind CSS and shadcn/ui
- ✅ User authentication state management
- ✅ Modern React patterns with TypeScript

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** TailwindCSS, shadcn/ui
- **Authentication:** Firebase Auth (Google)
- **Real-time:** WebSockets (coming soon)
- **Database:** Firebase Firestore (coming soon)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Troubleshooting

### Popup Blocked
If the Google sign-in popup is blocked:
- Allow popups for `localhost:3000` in your browser settings

### Environment Variables Not Loading
If your Firebase config isn't being loaded:
- Restart the development server (`npm run dev`)
- Ensure your `.env.local` file is in the root directory
- Check that all environment variables start with `NEXT_PUBLIC_`

### "use client" Errors
All Firebase-related components must be client components:
- Files using Firebase imports should start with `'use client'`
- Server components cannot directly use Firebase

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui components
└── lib/                # Utility functions and Firebase config
```

## Next Steps

This is the foundation for Serenity. Upcoming features include:
- Real-time group listening parties
- Interactive group chats
- Playlist sharing
- Synchronized music playback
- User groups and social features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request