"use client";

import { useState } from "react";
import { MainNavigation } from "@/components/MainNavigation";
import { SpotifyHome } from "@/components/SpotifyHome";
import { RedditFeed } from "@/components/RedditFeed";
import { InstagramChat } from "@/components/InstagramChat";
import { SearchExplore } from "@/components/SearchExplore";
import { PlaylistView } from "@/components/PlaylistView";
import { ArtistView } from "@/components/ArtistView";
import { AlbumView } from "@/components/AlbumView";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
import { PlayerProvider } from "@/contexts/PlayerContext";

function HomeContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [librarySelection, setLibrarySelection] = useState(null);
  const [artistSelection, setArtistSelection] = useState(null);
  const [albumSelection, setAlbumSelection] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLibrarySelection(null);
    setArtistSelection(null);
    setAlbumSelection(null);
  };

  const handleSelectLibrary = (selection) => {
    setLibrarySelection(selection);
    setArtistSelection(null);
    setAlbumSelection(null);
    if (selection.type !== "explore") {
      setCurrentPage("library");
    }
  };

  const handleSelectExplore = (collection) => {
    handleSelectLibrary(collection);
  };

  const handleSelectArtist = (artist) => {
    setArtistSelection(artist);
    setLibrarySelection(null);
    setAlbumSelection(null);
  };

  const handleSelectAlbum = (album) => {
    setAlbumSelection(album);
  };

  const renderPage = () => {
    if (albumSelection) {
      return (
        <AlbumView
          album={albumSelection}
          onBack={() => setAlbumSelection(null)}
          onSelectArtist={handleSelectArtist}
        />
      );
    }

    if (artistSelection) {
      return (
        <ArtistView
          artist={artistSelection}
          onBack={() => setArtistSelection(null)}
          onSelectAlbum={handleSelectAlbum}
        />
      );
    }

    if (librarySelection) {
      return (
        <PlaylistView
          selection={librarySelection}
          onBack={() => {
            setLibrarySelection(null);
            if (librarySelection.type !== "explore") {
              setCurrentPage("home");
            }
          }}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return <SpotifyHome onSelectArtist={handleSelectArtist} />;
      case "search":
      case "discover":
        return (
          <SearchExplore
            onSelectLibrary={handleSelectLibrary}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
            onSelectExplore={handleSelectExplore}
          />
        );
      case "feed":
        return <RedditFeed />;
      case "chat":
        return <InstagramChat />;
      default:
        return <SpotifyHome />;
    }
  };

  return (
    <MainNavigation
      currentPage={
        albumSelection
          ? "album"
          : artistSelection
            ? "artist"
            : librarySelection?.type === "explore"
              ? "search"
              : librarySelection
                ? "library"
                : currentPage
      }
      onPageChange={handlePageChange}
      librarySelection={librarySelection}
      onSelectLibrary={handleSelectLibrary}
    >
      {renderPage()}
    </MainNavigation>
  );
}

export default function Home() {
  return (
    <SpotifyProvider>
      <PlayerProvider>
        <HomeContent />
      </PlayerProvider>
    </SpotifyProvider>
  );
}
