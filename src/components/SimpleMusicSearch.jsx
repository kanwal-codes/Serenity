"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Play, Music } from 'lucide-react';

export function SimpleMusicSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock search results
  const mockSongs = [
    {
      id: '1',
      name: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      duration: '5:55'
    },
    {
      id: '2',
      name: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      duration: '4:04'
    },
    {
      id: '3',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: '3:20'
    },
    {
      id: '4',
      name: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷ (Divide)',
      duration: '3:53'
    },
    {
      id: '5',
      name: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: '3:23'
    }
  ];

  const handleSearch = () => {
    console.log('Search clicked! Query:', searchQuery);
    
    if (!searchQuery.trim()) {
      console.log('Empty query, clearing results');
      setSearchResults([]);
      return;
    }

    setLoading(true);
    console.log('Starting search...');
    
    // Simulate search delay
    setTimeout(() => {
      console.log('Filtering songs...');
      const filtered = mockSongs.filter(song => 
        song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      console.log('Filtered results:', filtered);
      setSearchResults(filtered);
      setLoading(false);
    }, 500);
  };

  const handlePlay = (song) => {
    console.log('Playing:', song.name);
    // TODO: Implement actual playback
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Music</span>
          </CardTitle>
          <CardDescription>
            Find songs, artists, or albums to play and share
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length})
          </h3>
          
          {searchResults.map((song) => (
            <Card key={song.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Album Art Placeholder */}
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Music className="h-8 w-8 text-white" />
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{song.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {song.artist} • {song.album}
                    </p>
                    <p className="text-sm text-gray-500">{song.duration}</p>
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={() => handlePlay(song)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No songs found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-1">
              Try searching for: Queen, M83, The Weeknd, Ed Sheeran, or Dua Lipa
            </p>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Debug Info</h4>
            <p className="text-sm text-yellow-700">
              Query: "{searchQuery}" | Results: {searchResults.length} | Loading: {loading.toString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {!searchQuery && searchResults.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Searches</CardTitle>
            <CardDescription>
              Try searching for these popular songs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Bohemian Rhapsody', 'Midnight City', 'Blinding Lights', 'Shape of You', 'Levitating'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch();
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
