import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/providers/AuthProvider';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email format. Please enter a valid email address (e.g., user@example.com)'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format. Please enter a valid phone number with country code (e.g., +1234567890)'),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useRouter();
  const [location] = useLocation();
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Check for auth errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const error = urlParams.get('error');
    
    if (error === 'google_auth_failed') {
      toast({
        title: 'Google Sign-in Failed',
        description: 'There was a problem signing in with Google. Please try again.',
        variant: 'destructive',
      });
    } else if (error === 'apple_auth_failed') {
      toast({
        title: 'Apple Sign-in Failed', 
        description: 'There was a problem signing in with Apple. Please try again.',
        variant: 'destructive',
      });
    }
    
    const success = urlParams.get('auth');
    if (success === 'success') {
      toast({
        title: 'Sign-up Successful',
        description: 'Your account has been created successfully.',
      });
      navigate('/');
    }
  }, [location, toast, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.name, data.phone, data.username, data.city, data.country);
      toast({
        title: 'Registration Successful',
        description: 'Welcome to GamesChakra! Your account has been created.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please check your information and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if feature is disabled
  const featureAuthUI = import.meta.env.VITE_FEATURE_AUTH_UI !== '0';
  if (!featureAuthUI) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join GamesChakra to play and track your favorite games
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SocialButtons variant="register" disabled={isLoading} />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                disabled={isLoading}
                {...register('name')}
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.name.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username (e.g., player123)"
                disabled={isLoading}
                {...register('username')}
              />
              {errors.username && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.username.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email (e.g., user@example.com)"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number with country code (e.g., +919876543210)"
                disabled={isLoading}
                {...register('phone')}
              />
              {errors.phone && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.phone.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter your city"
                  disabled={isLoading}
                  {...register('city')}
                />
                {errors.city && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.city.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country (Optional)</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Enter your country"
                  disabled={isLoading}
                  {...register('country')}
                />
                {errors.country && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.country.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.password.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.confirmPassword.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login">
              <a className="text-primary hover:underline font-medium">Sign in</a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}