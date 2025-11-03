import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoginPage from './components/LoginPage';
import JournalPage from './components/JournalPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'journal' | 'analytics' | 'profile'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id, session.user.email || '');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setCurrentPage('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    setCurrentUser({ 
      email, 
      name: profile?.name || email.split('@')[0] 
    });
    setIsLoggedIn(true);
    setCurrentPage('journal');
  };

  const handleLogin = (email: string, name: string) => {
    setCurrentUser({ email, name });
    setIsLoggedIn(true);
    setCurrentPage('journal');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <Toaster />
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {currentPage === 'journal' && (
              <JournalPage 
                currentUser={currentUser}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
              />
            )}
            {currentPage === 'analytics' && (
              <AnalyticsPage 
                currentUser={currentUser}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
              />
            )}
            {currentPage === 'profile' && (
              <ProfilePage 
                currentUser={currentUser}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}