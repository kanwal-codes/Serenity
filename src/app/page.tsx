'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Serenity!</CardTitle>
              <CardDescription>
                Your social music streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Signed in as <span className="font-medium">{user.displayName || user.email}</span>
              </p>
              <p className="text-sm">
                You&apos;re all set! The foundation for your social music streaming platform is ready.
                Features like group listening parties, real-time chat, and synchronized playback
                will be coming soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Serenity</CardTitle>
              <CardDescription>
                Your social music streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in using the &quot;Sign in with Google&quot; button in the header to get started.
              </p>
              <p className="text-sm">
                Once you&apos;re signed in, you&apos;ll be able to create groups, share playlists,
                and enjoy synchronized music listening with friends.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}