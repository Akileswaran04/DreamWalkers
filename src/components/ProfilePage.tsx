import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Download, Trash2, Save, FileText } from 'lucide-react';
import Navigation from './Navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ProfilePageProps {
  currentUser: { email: string; name: string } | null;
  onNavigate: (page: 'journal' | 'analytics' | 'profile') => void;
  onLogout: () => void;
}

export default function ProfilePage({ currentUser, onNavigate, onLogout }: ProfilePageProps) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEntryCount();
  }, []);

  const loadEntryCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { count, error } = await supabase
        .from('dream_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setEntryCount(count || 0);
    } catch (error: any) {
      console.error('Error loading entry count:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!name || !email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ name, email })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { data: entries, error } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!entries || entries.length === 0) {
        toast.error('No data to export');
        return;
      }

      const dataStr = JSON.stringify(entries, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dreamtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    }
  };

  const handleClearData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { error } = await supabase
        .from('dream_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setEntryCount(0);
      toast.success('All data cleared successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear data');
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        currentPage="profile"
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-white mb-2">Profile Settings</h1>
            <p className="text-purple-200">Manage your account and export your data</p>
          </div>

          <div className="space-y-6">
            {/* Profile Info and Data Management - Side by Side on Desktop */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-7">
                  <User className="w-5 h-5 text-purple-300" />
                  <h2 className="text-white">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-purple-100">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-purple-100">Email Address</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-3 rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </motion.div>

              {/* Data Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-7">
                  <FileText className="w-5 h-5 text-purple-300" />
                  <h2 className="text-white">Data Management</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-200">Total Entries</span>
                      <span className="text-white">{entryCount}</span>
                    </div>
                    <p className="text-purple-300">
                      You have {entryCount} dream journal {entryCount === 1 ? 'entry' : 'entries'} stored
                    </p>
                  </div>

                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 py-3 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data (JSON)
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10 hover:text-red-200 py-3 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-indigo-950 border-white/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-purple-200">
                          This action cannot be undone. This will permanently delete all your dream journal entries and sleep data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearData}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            </div>

            {/* App Info and Privacy - Side by Side on Desktop */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* App Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
              >
                <h3 className="text-white mb-5">About DreamTracker</h3>
                <div className="space-y-2 text-purple-200">
                  <p>Version 1.0.0</p>
                  <p>Track your dreams and improve your sleep quality with personalized insights.</p>
                  <p className="mt-4 text-purple-300">
                    💡 Tip: Export your data regularly to keep a backup of your dream journal entries.
                  </p>
                </div>
              </motion.div>

              {/* Privacy Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-yellow-500/30"
              >
                <h3 className="text-white mb-2">Privacy & Data Security</h3>
                <p className="text-yellow-100">
                  This app is designed for prototyping and learning purposes. For production use with sensitive health data, 
                  ensure you implement proper security measures and comply with healthcare data regulations.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}