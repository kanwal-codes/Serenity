"use client";

import { useState, useEffect } from 'react';
import { MusicShare } from './MusicShare';
import { MusicDiscussion } from './MusicDiscussion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Heart,
  Music,
  Users,
  Star
} from 'lucide-react';

export function MusicFeed({ user }) {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedData, setFeedData] = useState({
    trending: [],
    recent: [],
    discussions: [],
    following: []
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockData = {
      trending: [
        {
          id: '1',
          title: 'Midnight City',
          artist: 'M83',
          album: 'Hurry Up, We\'re Dreaming',
          cover: '/api/placeholder/300/300',
          caption: 'This song hits different at 3 AM 🌙',
          tags: ['electronic', 'ambient', 'nostalgia'],
          likes: 1247,
          comments: [
            {
              id: 'c1',
              user: { name: 'MusicLover23', photoURL: '/api/placeholder/40/40' },
              text: 'This song never gets old!',
              timestamp: '2h'
            }
          ],
          timestamp: '2h',
          user: {
            displayName: 'Alex Chen',
            photoURL: '/api/placeholder/40/40'
          }
        },
        {
          id: '2',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          album: 'A Night at the Opera',
          cover: '/api/placeholder/300/300',
          caption: 'The greatest song ever written? Discuss. 👑',
          tags: ['rock', 'classic', 'queen'],
          likes: 3421,
          comments: [],
          timestamp: '4h',
          user: {
            displayName: 'ClassicRockFan',
            photoURL: '/api/placeholder/40/40'
          }
        }
      ],
      discussions: [
        {
          id: 'd1',
          title: 'What\'s your most underrated album of 2024?',
          content: 'I\'ve been diving deep into some lesser-known releases this year and found some absolute gems. What albums do you think deserve more recognition?',
          music: {
            title: 'Unknown Pleasures',
            artist: 'Joy Division',
            album: 'Unknown Pleasures'
          },
          subreddit: 'indiemusic',
          score: 89,
          userVote: null,
          tags: ['2024', 'underrated', 'discussion'],
          replies: [
            {
              id: 'r1',
              user: { name: 'IndieExplorer', photoURL: '/api/placeholder/40/40' },
              content: 'The new Beach House album is incredible but barely anyone talks about it.',
              score: 12,
              timestamp: '1h'
            }
          ],
          timestamp: '6h',
          user: {
            name: 'MusicCurator',
            photoURL: '/api/placeholder/40/40'
          }
        },
        {
          id: 'd2',
          title: 'Best live performance you\'ve ever seen?',
          content: 'Saw Radiohead at Coachella last year and it completely changed my life. The way they performed "Paranoid Android" live was otherworldly.',
          music: {
            title: 'Paranoid Android',
            artist: 'Radiohead',
            album: 'OK Computer'
          },
          subreddit: 'liveconcerts',
          score: 156,
          userVote: 'up',
          tags: ['live', 'radiohead', 'concerts'],
          replies: [],
          timestamp: '8h',
          user: {
            name: 'ConcertGoer',
            photoURL: '/api/placeholder/40/40'
          }
        }
      ]
    };
    setFeedData(mockData);
  }, []);

  const handleLike = (musicId, isLiked) => {
    // TODO: Implement like functionality
    console.log('Like:', musicId, isLiked);
  };

  const handleComment = (musicId, comment) => {
    // TODO: Implement comment functionality
    console.log('Comment:', musicId, comment);
  };

  const handleShare = (music) => {
    // TODO: Implement share functionality
    console.log('Share:', music);
  };

  const handleVote = (discussionId, direction) => {
    // TODO: Implement voting functionality
    console.log('Vote:', discussionId, direction);
  };

  const handleReply = (discussionId, reply) => {
    // TODO: Implement reply functionality
    console.log('Reply:', discussionId, reply);
  };

  const handleBookmark = (discussionId, isBookmarked) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark:', discussionId, isBookmarked);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Serenity
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover, share, and discuss music with friends
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search songs, artists, or discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Discussions</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Following</span>
          </TabsTrigger>
        </TabsList>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          {feedData.trending.map((music) => (
            <MusicShare
              key={music.id}
              music={music}
              user={user}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="space-y-4">
          {feedData.trending.map((music) => (
            <MusicShare
              key={music.id}
              music={music}
              user={user}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4">
          {feedData.discussions.map((discussion) => (
            <MusicDiscussion
              key={discussion.id}
              discussion={discussion}
              user={user}
              onVote={handleVote}
              onReply={handleReply}
              onBookmark={handleBookmark}
            />
          ))}
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Follow your favorite music curators to see their posts here</p>
            <Button className="mt-4">Discover People</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
