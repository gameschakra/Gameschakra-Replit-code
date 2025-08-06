import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

export default function AuthTest() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<string>('');

  useEffect(() => {
    // Get cookie info
    setCookieInfo(document.cookie);
  }, [user]);

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkDebugSession = async () => {
    try {
      const data = await apiRequest('GET', '/api/auth/debug-session', null);
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug session error:', error);
      setDebugInfo({ error: (error as Error).message });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user and authentication information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading authentication status...</div>
            ) : (
              <div className="space-y-2">
                <div>
                  <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
                </div>
                {user && (
                  <div className="space-y-2">
                    <div>
                      <strong>User ID:</strong> {user.id}
                    </div>
                    <div>
                      <strong>Username:</strong> {user.username}
                    </div>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleLogout} variant="outline" disabled={!isAuthenticated}>
              Logout
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
            <CardDescription>Test login functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogin} disabled={isAuthenticated}>
              Login
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Check session and cookie information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Cookies</h3>
                <pre className="p-2 bg-secondary rounded-md mt-2 overflow-auto max-h-24">
                  {cookieInfo || 'No cookies found'}
                </pre>
              </div>
              {debugInfo && (
                <div>
                  <h3 className="text-lg font-medium">Session Debug</h3>
                  <pre className="p-2 bg-secondary rounded-md mt-2 overflow-auto max-h-48 text-sm">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={checkDebugSession} variant="secondary">
              Check Session Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}