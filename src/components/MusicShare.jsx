"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Play, Pause, MoreHorizontal } from 'lucide-react';

export function MusicShare({ music, user, onLike, onComment, onShare }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Integrate with audio player
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(music.id, !isLiked);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(music.id, commentText);
      setCommentText('');
    }
  };

  const handleShare = () => {
    onShare?.(music);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{user?.displayName || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Music Card */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{music.title}</h3>
              <p className="text-sm opacity-90">{music.artist}</p>
              <p className="text-xs opacity-75">{music.album}</p>
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

        {/* Caption */}
        {music.caption && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {music.caption}
          </p>
        )}

        {/* Tags */}
        {music.tags && music.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {music.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : 'text-gray-500'}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="ml-1 text-sm">{music.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1 text-sm">{music.comments?.length || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {/* Existing Comments */}
            {music.comments?.map((comment, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.user.photoURL} />
                  <AvatarFallback className="text-xs">{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-sm font-medium">{comment.user.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="text-xs">{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="text-sm"
                />
                <Button onClick={handleComment} size="sm" disabled={!commentText.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
