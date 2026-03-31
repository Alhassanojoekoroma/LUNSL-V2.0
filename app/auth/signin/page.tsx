'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Mail, Chrome } from 'lucide-react';

export default function SignInPage() {
  const [isDevMode, setIsDevMode] = useState(true);
  const [email, setEmail] = useState('test@example.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  const handleDemoSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Choose a sign-in method to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDevMode && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email (Development Mode)
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Enter any email to create a demo account
                </p>
              </div>
              <form onSubmit={handleDemoSubmit} className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Demo Login'}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-blue-50 dark:bg-blue-950 text-slate-500">Or</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => handleSignIn('google')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>

          <Button
            onClick={() => handleSignIn('github')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>

          <Button
            onClick={() => handleSignIn('azure-ad')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Mail className="mr-2 h-4 w-4" />
            Sign in with Azure AD
          </Button>

          <Button
            onClick={() => handleSignIn('email')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Mail className="mr-2 h-4 w-4" />
            Sign in with Email
          </Button>

          <p className="text-xs text-slate-500 text-center pt-4">
            By signing in, you accept our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
