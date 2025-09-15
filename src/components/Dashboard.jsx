"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MusicFeed } from './MusicFeed';
import { SimpleMusicSearch } from './SimpleMusicSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Music, Users, Home, Search, MessageCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [activeTab, setActiveTab] = useState('feed');

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    // TODO: Implement group creation with Firestore
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      owner: user.uid,
      members: [user.uid],
      createdAt: new Date().toISOString()
    };
    
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
  };

  const handleJoinGroup = () => {
    if (!joinGroupId.trim()) return;
    
    // TODO: Implement group joining with Firestore
    console.log('Joining group:', joinGroupId);
    setJoinGroupId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Serenity</h1>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === 'feed' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('feed')}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Feed</span>
              </Button>
              <Button
                variant={activeTab === 'discover' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('discover')}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Discover</span>
              </Button>
              <Button
                variant={activeTab === 'groups' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('groups')}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Groups</span>
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('chat')}
                size="sm"
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'feed' && <MusicFeed user={user} />}
        
        {activeTab === 'discover' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Discover Music</h1>
              <p className="text-muted-foreground">
                Find new songs, artists, and connect with music lovers
              </p>
            </div>
            <SimpleMusicSearch />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Serenity</h1>
              <p className="text-muted-foreground">
                Create or join a listening party to start your synchronized music experience
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Create Group */}
              <Card>
                <CardHeader>
                  <CardTitle>Create a Group</CardTitle>
                  <CardDescription>
                    Start a new listening party and invite your friends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Group name (e.g., Friday Chill)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button onClick={handleCreateGroup} className="w-full">
                    Create Group
                  </Button>
                </CardContent>
              </Card>

              {/* Join Group */}
              <Card>
                <CardHeader>
                  <CardTitle>Join a Group</CardTitle>
                  <CardDescription>
                    Enter a group ID to join an existing listening party
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Group ID"
                    value={joinGroupId}
                    onChange={(e) => setJoinGroupId(e.target.value)}
                  />
                  <Button onClick={handleJoinGroup} className="w-full">
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* My Groups */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">My Groups</h2>
              {groups.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      You haven't joined any groups yet. Create or join one to get started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          Enter Group
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Music Chat</h2>
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active conversations</p>
              <p className="text-sm">Start chatting about music with friends</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
