"use client";

import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { SpotifyHome } from '@/components/SpotifyHome';
import { AppleMusicDiscover } from '@/components/AppleMusicDiscover';
import { RedditFeed } from '@/components/RedditFeed';
import { InstagramChat } from '@/components/InstagramChat';
import { SpotifyDiscovery } from '@/components/SpotifyDiscovery';
import { MusicSearch } from '@/components/MusicSearch';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    name: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: "5:55",
    currentTime: "2:30"
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <SpotifyHome />;
      case 'search':
        return <MusicSearch />;
      case 'discover':
        return <SpotifyDiscovery />;
      case 'feed':
        return <RedditFeed />;
      case 'chat':
        return <InstagramChat />;
      default:
        return <SpotifyHome />;
    }
  };

  return (
    <MainNavigation
      currentPage={currentPage}
      onPageChange={handlePageChange}
      currentTrack={currentTrack}
      onPlayPause={handlePlayPause}
      isPlaying={isPlaying}
    >
      {renderPage()}
    </MainNavigation>
  );
}