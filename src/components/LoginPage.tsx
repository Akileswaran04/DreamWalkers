import { useState } from 'react';
import { Eye, EyeOff, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (email: string, name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignup && !name)) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Account created successfully!');
          onLogin(email, name);
        }
      } else {
        // Login existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', data.user.id)
            .single();

          toast.success('Welcome back!');
          onLogin(email, profile?.name || email.split('@')[0]);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setEmail('test@dreamtracker.com');
    setPassword('testpass123');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@dreamtracker.com',
        password: 'testpass123',
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.user.id)
          .single();

        toast.success('Logged in with test account!');
        onLogin('test@dreamtracker.com', profile?.name || 'Test User');
      }
    } catch (error: any) {
      toast.error('Test account not set up yet. Please create it in Supabase Dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl mb-4 shadow-xl">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white mb-2">DreamTracker</h1>
          <p className="text-purple-200">Track your dreams, improve your sleep</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                !isSignup 
                  ? 'bg-white/20 text-white' 
                  : 'text-purple-200 hover:bg-white/5'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                isSignup 
                  ? 'bg-white/20 text-white' 
                  : 'text-purple-200 hover:bg-white/5'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-purple-100">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-purple-100">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-purple-100">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : (isSignup ? 'Create Account' : 'Login to DreamTracker')}
            </Button>
          </form>

          {!isSignup && (
            <div className="mt-4">
              <Button
                type="button"
                onClick={handleTestLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full border-white/20 text-purple-200 hover:bg-white/10 py-3 rounded-xl"
              >
                Try Test Account
              </Button>
            </div>
          )}

          <p className="text-center text-purple-200 mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-white underline hover:text-purple-300 transition-colors"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}