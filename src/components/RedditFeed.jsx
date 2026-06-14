"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Flag,
  MoreHorizontal,
  Play,
  Pause,
  Music,
  Clock,
  Users,
  Award
} from 'lucide-react';

export function RedditFeed() {
  const [votedPosts, setVotedPosts] = useState({});

  const posts = [
    {
      id: 1,
      title: "What's your most underrated album of 2024?",
      content: "I've been diving deep into some lesser-known releases this year and found some absolute gems. What albums do you think deserve more recognition?",
      music: {
        title: "Unknown Pleasures",
        artist: "Joy Division",
        album: "Unknown Pleasures"
      },
      subreddit: "indiemusic",
      author: {
        name: "MusicCurator",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      score: 89,
      comments: 23,
      timeAgo: "6h",
      tags: ["2024", "underrated", "discussion"],
      awards: ["🥇", "🔥"]
    },
    {
      id: 2,
      title: "Best live performance you've ever seen?",
      content: "Saw Radiohead at Coachella last year and it completely changed my life. The way they performed 'Paranoid Android' live was otherworldly.",
      music: {
        title: "Paranoid Android",
        artist: "Radiohead",
        album: "OK Computer"
      },
      subreddit: "liveconcerts",
      author: {
        name: "ConcertGoer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        verified: false
      },
      score: 156,
      comments: 45,
      timeAgo: "8h",
      tags: ["live", "radiohead", "concerts"],
      awards: ["🥇", "🏆", "💎"]
    },
    {
      id: 3,
      title: "New artist discovery: This band is incredible!",
      content: "Just found this band called 'The Midnight' and I can't stop listening. Their synthwave sound is perfect for late night drives.",
      music: {
        title: "Sunset",
        artist: "The Midnight",
        album: "Endless Summer"
      },
      subreddit: "newmusic",
      author: {
        name: "SynthWaveFan",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      score: 67,
      comments: 12,
      timeAgo: "12h",
      tags: ["discovery", "synthwave", "newmusic"],
      awards: ["🔥"]
    }
  ];

  const handleVote = (postId, direction) => {
    setVotedPosts(prev => ({
      ...prev,
      [postId]: prev[postId] === direction ? null : direction
    }));
  };

  const formatTime = (timeAgo) => {
    return timeAgo;
  };

  const getScoreColor = (score) => {
    if (score > 100) return "text-orange-500";
    if (score > 50) return "text-yellow-500";
    return "text-gray-400";
  };

  return (
    <div className="page-scroll">
      <div className="page-content space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold text-primary">
          r/Music
        </h1>
        <p className="text-muted-foreground">The place for music lovers to share and discuss</p>
      </div>

      {/* Sort Options */}
      <div className="mb-6 flex items-center space-x-2">
        <Button variant="outline" size="sm" className="border-border bg-card text-foreground hover:bg-[var(--surface-container-high)]">
          Hot
        </Button>
        <Button variant="outline" size="sm" className="border-border bg-card text-muted-foreground hover:bg-[var(--surface-container-high)] hover:text-foreground">
          New
        </Button>
        <Button variant="outline" size="sm" className="border-border bg-card text-muted-foreground hover:bg-[var(--surface-container-high)] hover:text-foreground">
          Top
        </Button>
        <Button variant="outline" size="sm" className="border-border bg-card text-muted-foreground hover:bg-[var(--surface-container-high)] hover:text-foreground">
          Rising
        </Button>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="border-border bg-card transition-colors hover:border-primary/20">
          <CardContent className="p-0">
            <div className="flex">
              {/* Voting Sidebar */}
              <div className="flex flex-col items-center p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(post.id, 'up')}
                  className={`p-1 h-8 w-8 ${
                    votedPosts[post.id] === 'up' 
                      ? 'text-orange-500 bg-orange-500/10' 
                      : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
                  }`}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className={`text-sm font-medium px-1 min-w-[20px] text-center ${getScoreColor(post.score)}`}>
                  {post.score}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(post.id, 'down')}
                  className={`p-1 h-8 w-8 ${
                    votedPosts[post.id] === 'down' 
                      ? 'text-blue-500 bg-blue-500/10' 
                      : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="flex-1 p-4">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{post.author.name}</span>
                  {post.author.verified && (
                    <span className="text-xs bg-blue-500 text-white px-1 rounded">✓</span>
                  )}
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">r/{post.subreddit}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 text-white hover:text-orange-400 cursor-pointer">
                  {post.title}
                </h3>

                {/* Music Preview */}
                {post.music && (
                  <div className="mb-3 rounded-lg bg-primary/80 p-3 text-primary-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{post.music.title}</h4>
                        <p className="text-sm opacity-90">{post.music.artist}</p>
                        <p className="text-xs opacity-75">{post.music.album}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-[var(--surface-container-high)] text-muted-foreground px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Awards */}
                {post.awards && post.awards.length > 0 && (
                  <div className="flex items-center space-x-1 mb-3">
                    {post.awards.map((award, index) => (
                      <span key={index} className="text-lg">{award}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-[var(--surface-container-high)]"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-[var(--surface-container-high)]"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-[var(--surface-container-high)]"
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span className="text-sm">Save</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-[var(--surface-container-high)]"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    <span className="text-sm">Award</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-[var(--surface-container-high)] ml-auto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center py-8">
        <Button 
          variant="outline" 
          className="border-border bg-card text-foreground hover:bg-[var(--surface-container-high)]"
        >
          Load More Posts
        </Button>
      </div>
      </div>
    </div>
  );
}
