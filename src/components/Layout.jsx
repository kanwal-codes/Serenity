"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserProfile } from '@/components/auth/UserProfile';

export const Layout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Serenity</h1>
            <p className="text-muted-foreground mb-8">
              Listen together, anywhere. Perfectly in sync.
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Serenity</h1>
            <span className="text-sm text-muted-foreground">
              Welcome back, {user.displayName?.split(' ')[0] || 'User'}
            </span>
          </div>
          <UserProfile user={user} />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
