import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, Coffee, Moon, Zap, Calendar, ArrowUpDown } from 'lucide-react';
import Navigation from './Navigation';
import { Input } from './ui/input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import type { DreamEntry } from '../lib/supabase';

interface AnalyticsPageProps {
  currentUser: { email: string; name: string } | null;
  onNavigate: (page: 'journal' | 'analytics' | 'profile') => void;
  onLogout: () => void;
}

export default function AnalyticsPage({ currentUser, onNavigate, onLogout }: AnalyticsPageProps) {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'sleep_quality' | 'sleep_hours'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error: any) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries.filter(entry => 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = sortBy === 'created_at' ? new Date(a.created_at || '').getTime() : a[sortBy];
      let bVal = sortBy === 'created_at' ? new Date(b.created_at || '').getTime() : b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [entries, searchQuery, sortBy, sortOrder]);

  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
      .slice(-7)
      .map(entry => ({
        date: new Date(entry.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        quality: entry.sleep_quality,
        sleep: entry.sleep_hours,
        caffeine: entry.caffeine_intake,
        stress: entry.stress_level,
      }));
  }, [entries]);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    
    const avgQuality = entries.reduce((sum, e) => sum + e.sleep_quality, 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length;
    const avgCaffeine = entries.reduce((sum, e) => sum + e.caffeine_intake, 0) / entries.length;
    const avgStress = entries.reduce((sum, e) => sum + e.stress_level, 0) / entries.length;

    return {
      avgQuality: avgQuality.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      avgCaffeine: avgCaffeine.toFixed(1),
      avgStress: avgStress.toFixed(1),
      total: entries.length,
    };
  }, [entries]);

  const getSuggestion = () => {
    if (!stats) return "Start tracking your dreams to get personalized suggestions!";
    
    const suggestions = [];
    
    if (parseFloat(stats.avgSleep) < 7) {
      suggestions.push("Try to get more sleep - aim for 7-9 hours per night.");
    }
    if (parseFloat(stats.avgCaffeine) > 2) {
      suggestions.push("Consider reducing caffeine intake, especially in the afternoon.");
    }
    if (parseFloat(stats.avgStress) > 6) {
      suggestions.push("High stress levels detected. Try relaxation techniques before bed.");
    }
    if (parseFloat(stats.avgQuality) < 6) {
      suggestions.push("Your sleep quality could improve. Try maintaining a consistent sleep schedule.");
    }
    
    if (suggestions.length === 0) {
      return "Great job! Your sleep patterns look healthy. Keep it up!";
    }
    
    return suggestions.join(" ");
  };

  const toggleSort = (field: 'created_at' | 'sleep_quality' | 'sleep_hours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation 
          currentPage="analytics"
          onNavigate={onNavigate}
          onLogout={onLogout}
          currentUser={currentUser}
        />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center text-white">Loading your analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        currentPage="analytics"
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-white mb-2">Sleep Analytics</h1>
            <p className="text-purple-200">Track your patterns and improve your sleep quality</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl p-7 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-300" />
                  <span className="text-purple-200">Avg Quality</span>
                </div>
                <div className="text-white">{stats.avgQuality}/10</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-7 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-5 h-5 text-blue-300" />
                  <span className="text-blue-200">Avg Sleep</span>
                </div>
                <div className="text-white">{stats.avgSleep}h</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl rounded-2xl p-7 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <Coffee className="w-5 h-5 text-orange-300" />
                  <span className="text-orange-200">Avg Caffeine</span>
                </div>
                <div className="text-white">{stats.avgCaffeine} cups</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-7 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-red-300" />
                  <span className="text-red-200">Avg Stress</span>
                </div>
                <div className="text-white">{stats.avgStress}/10</div>
              </motion.div>
            </div>
          )}

          {/* AI Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20 mb-8 sm:mb-10"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white mb-2">Sleep Insights</h3>
                <p className="text-purple-200">{getSuggestion()}</p>
              </div>
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
            >
              <h3 className="text-white mb-5">Sleep Quality Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#c4b5fd" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c4b5fd" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 20, 60, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Line type="monotone" dataKey="quality" stroke="#a78bfa" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
            >
              <h3 className="text-white mb-5">Sleep Factors</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#c4b5fd" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c4b5fd" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 20, 60, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="sleep" fill="#60a5fa" name="Sleep (hrs)" />
                  <Bar dataKey="caffeine" fill="#f97316" name="Caffeine" />
                  <Bar dataKey="stress" fill="#ef4444" name="Stress" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Journal Entries List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
              <h2 className="text-white">Dream Journal Entries ({filteredAndSortedEntries.length})</h2>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => toggleSort('created_at')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  sortBy === 'created_at' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Date
                {sortBy === 'created_at' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => toggleSort('sleep_quality')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  sortBy === 'sleep_quality' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Quality
                {sortBy === 'sleep_quality' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => toggleSort('sleep_hours')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  sortBy === 'sleep_hours' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                <Moon className="w-4 h-4" />
                Sleep Hours
                {sortBy === 'sleep_hours' && <ArrowUpDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="space-y-3">
              {filteredAndSortedEntries.length === 0 ? (
                <div className="text-center py-12 text-purple-200">
                  {searchQuery ? 'No entries match your search' : 'No dream entries yet. Start recording your dreams!'}
                </div>
              ) : (
                filteredAndSortedEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white mb-1">{entry.title}</h4>
                        <p className="text-purple-200 line-clamp-2 mb-3">{entry.content}</p>
                        <div className="flex flex-wrap gap-3">
                          <span className="text-purple-300 flex items-center gap-1">
                            <Moon className="w-3 h-3" />
                            {entry.sleep_hours}h
                          </span>
                          <span className="text-purple-300 flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            {entry.caffeine_intake} cups
                          </span>
                          <span className="text-purple-300 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Quality: {entry.sleep_quality}/10
                          </span>
                          <span className="text-purple-300 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Stress: {entry.stress_level}/10
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-200 mb-2">
                          {new Date(entry.created_at || '').toLocaleDateString()}
                        </div>
                        {entry.mood && (
                          <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-white">
                            {entry.mood === 'great' && '😊'}
                            {entry.mood === 'good' && '🙂'}
                            {entry.mood === 'neutral' && '😐'}
                            {entry.mood === 'bad' && '😔'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}