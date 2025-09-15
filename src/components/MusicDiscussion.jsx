"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Flag,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';

export function MusicDiscussion({ discussion, user, onVote, onReply, onBookmark }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleVote = (direction) => {
    onVote?.(discussion.id, direction);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      onReply?.(discussion.id, replyText);
      setReplyText('');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(discussion.id, !isBookmarked);
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Integrate with audio player
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={discussion.user.photoURL} />
              <AvatarFallback className="text-xs">{discussion.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{discussion.user.name}</p>
              <p className="text-xs text-gray-500">r/{discussion.subreddit} • {formatTime(discussion.timestamp)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {discussion.title}
        </h3>

        {/* Music Preview */}
        {discussion.music && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 mb-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{discussion.music.title}</h4>
                <p className="text-sm opacity-90">{discussion.music.artist}</p>
                <p className="text-xs opacity-75">{discussion.music.album}</p>
              </div>
              <Button
                onClick={handlePlay}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
          {discussion.content}
        </p>

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {discussion.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* Voting */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={`p-1 ${discussion.userVote === 'up' ? 'text-orange-500' : 'text-gray-500'}`}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-1 min-w-[20px] text-center">
                {discussion.score}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className={`p-1 ${discussion.userVote === 'down' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">{discussion.replies?.length || 0}</span>
            </Button>

            {/* Share */}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-sm">Share</span>
            </Button>

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`${isBookmarked ? 'text-yellow-500' : 'text-gray-500'} hover:text-gray-700 dark:hover:text-gray-300`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <Flag className="h-4 w-4" />
          </Button>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-4 space-y-3">
            <Separator />
            
            {/* Existing Replies */}
            {discussion.replies?.map((reply, index) => (
              <div key={index} className="ml-4 space-y-2">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.user.photoURL} />
                    <AvatarFallback className="text-xs">{reply.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{reply.user.name}</p>
                      <p className="text-xs text-gray-500">{formatTime(reply.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {reply.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button variant="ghost" size="sm" className="text-xs p-1 h-auto">
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-gray-500">{reply.score}</span>
                      <Button variant="ghost" size="sm" className="text-xs p-1 h-auto">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs p-1 h-auto">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Reply */}
            <div className="ml-4">
              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.photoURL} />
                  <AvatarFallback className="text-xs">{user?.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="What are your thoughts?"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleReply} 
                      size="sm" 
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
