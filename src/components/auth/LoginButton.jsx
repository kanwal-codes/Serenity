"use client";

import { useState } from 'react';
import { signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGoogleSignIn} 
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
};
