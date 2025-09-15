"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Heart, 
  MoreHorizontal, 
  Phone, 
  Video, 
  Search,
  Plus,
  Camera,
  Mic,
  Smile,
  Image as ImageIcon,
  Music,
  Play
} from 'lucide-react';

export function InstagramChat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chats = [
    {
      id: 1,
      name: "Music Lovers",
      lastMessage: "Check out this new track!",
      time: "2m",
      unread: 3,
      avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop",
      isOnline: true,
      isGroup: true
    },
    {
      id: 2,
      name: "Sarah Wilson",
      lastMessage: "Thanks for the recommendation!",
      time: "1h",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
      isOnline: true,
      isGroup: false
    },
    {
      id: 3,
      name: "Indie Music",
      lastMessage: "New album drop tomorrow",
      time: "3h",
      unread: 1,
      avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=50&h=50&fit=crop",
      isOnline: false,
      isGroup: true
    },
    {
      id: 4,
      name: "Mike Chen",
      lastMessage: "That concert was amazing!",
      time: "1d",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      isOnline: false,
      isGroup: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Alex",
      content: "Hey everyone! Check out this new track I found",
      time: "2:30 PM",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      music: {
        title: "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming"
      }
    },
    {
      id: 2,
      sender: "You",
      content: "This is incredible! Where did you find this?",
      time: "2:32 PM",
      isMe: true,
      avatar: null
    },
    {
      id: 3,
      sender: "Sarah",
      content: "Love the synthwave vibes! 🎵",
      time: "2:35 PM",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      sender: "Alex",
      content: "It's from their 2011 album, but it's having a revival",
      time: "2:36 PM",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 5,
      sender: "You",
      content: "Thanks for sharing! Added to my playlist",
      time: "2:38 PM",
      isMe: true,
      avatar: null
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Send message logic
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <div className="w-80 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                <Plus className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <Input
              placeholder="Search messages"
              className="pl-10 bg-[#2a2a2a] border-[#404040] text-white placeholder-[#6b7280] focus:border-[#1db954]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`flex items-center space-x-3 p-4 hover:bg-[#2a2a2a] cursor-pointer transition-colors ${
                selectedChat === chat.id ? 'bg-[#2a2a2a] border-r-2 border-[#1db954]' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {chat.name[0]}
                  </AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1db954] rounded-full border-2 border-[#1a1a1a]"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-[#6b7280]">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#b3b3b3] truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="bg-[#1db954] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={chats.find(c => c.id === selectedChat)?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {chats.find(c => c.id === selectedChat)?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{chats.find(c => c.id === selectedChat)?.name}</h2>
                    <p className="text-sm text-[#b3b3b3]">
                      {chats.find(c => c.id === selectedChat)?.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[70%] ${message.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!message.isMe && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {message.sender[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`space-y-1 ${message.isMe ? 'items-end' : 'items-start'}`}>
                      {!message.isMe && (
                        <p className="text-xs text-[#6b7280] px-2">{message.sender}</p>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.isMe
                            ? 'bg-[#1db954] text-white'
                            : 'bg-[#2a2a2a] text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Music Preview */}
                        {message.music && (
                          <div className="mt-2 bg-black/20 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">{message.music.title}</h4>
                                <p className="text-xs opacity-90">{message.music.artist}</p>
                                <p className="text-xs opacity-75">{message.music.album}</p>
                              </div>
                              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-[#6b7280] px-2">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                        A
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-[#2a2a2a] px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Camera className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-[#b3b3b3] hover:text-white">
                  <Music className="w-5 h-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message..."
                    className="bg-[#2a2a2a] border-[#404040] text-white placeholder-[#6b7280] focus:border-[#1db954] pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] hover:text-white"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-white disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
              <p className="text-[#b3b3b3]">Send and receive messages about music</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


