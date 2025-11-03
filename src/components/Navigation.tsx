import { BookOpen, BarChart3, User, LogOut, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentPage: 'journal' | 'analytics' | 'profile';
  onNavigate: (page: 'journal' | 'analytics' | 'profile') => void;
  onLogout: () => void;
  currentUser: { email: string; name: string } | null;
}

export default function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'journal' as const, icon: BookOpen, label: 'Journal' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white">DreamTracker</span>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative px-4 py-2 text-purple-200 hover:text-white transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/20 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="ml-2 px-4 py-2 text-purple-200 hover:text-white transition-colors rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}