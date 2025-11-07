import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coffee, Moon, Sun, Zap, Save, Sparkles } from 'lucide-react';
import Navigation from './Navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface JournalPageProps {
  currentUser: { email: string; name: string } | null;
  onNavigate: (page: 'journal' | 'analytics' | 'profile') => void;
  onLogout: () => void;
}

export default function JournalPage({ currentUser, onNavigate, onLogout }: JournalPageProps) {
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamContent, setDreamContent] = useState('');
  const [sleepHours, setSleepHours] = useState([7]);
  const [caffeineIntake, setCaffeineIntake] = useState([0]);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'bad' | null>(null);
  const [stressLevel, setStressLevel] = useState([5]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEntry = async () => {
    if (!dreamTitle || !dreamContent) {
      toast.error('Please fill in dream title and content');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to save entries');
        setIsLoading(false);
        return;
      }

      const entry = {
        user_id: user.id,
        title: dreamTitle,
        content: dreamContent,
        sleep_hours: sleepHours[0],
        caffeine_intake: caffeineIntake[0],
        sleep_quality: sleepQuality,
        mood,
        stress_level: stressLevel[0],
      };

      console.log('Saving entry:', entry);

      const { data, error } = await supabase
        .from('dream_entries')
        .insert([entry])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Entry saved successfully:', data);
      toast.success('Dream journal entry saved!');
      
      // Reset form
      setDreamTitle('');
      setDreamContent('');
      setSleepHours([7]);
      setCaffeineIntake([0]);
      setSleepQuality(5);
      setMood(null);
      setStressLevel([5]);
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.message.includes('relation "public.dream_entries" does not exist')) {
        toast.error('Database not set up. Please run the SQL queries in Supabase first.');
      } else {
        toast.error(error.message || 'Failed to save entry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const moodOptions = [
    { value: 'great', emoji: '😊', label: 'Great', color: 'from-green-500 to-emerald-500' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'from-blue-500 to-cyan-500' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-yellow-500 to-orange-500' },
    { value: 'bad', emoji: '😔', label: 'Bad', color: 'from-red-500 to-pink-500' },
  ] as const;

  return (
    <div className="min-h-screen">
      <Navigation 
        currentPage="journal"
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
            <h1 className="text-white mb-2">Record Your Dream</h1>
            <p className="text-purple-200">Capture your dreams and track what affects your sleep</p>
          </div>

          <div className="space-y-6">
            {/* Dream Entry and Sleep Metrics - Side by Side on Desktop */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Dream Entry Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  <h2 className="text-white">Dream Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-purple-100">Dream Title</Label>
                    <Input
                      id="title"
                      value={dreamTitle}
                      onChange={(e) => setDreamTitle(e.target.value)}
                      placeholder="Give your dream a title..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-purple-100">Dream Description</Label>
                    <Textarea
                      id="content"
                      value={dreamContent}
                      onChange={(e) => setDreamContent(e.target.value)}
                      placeholder="Describe your dream in detail..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus:border-purple-400 mt-2 min-h-32"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Sleep Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-5 sm:mb-7">
                  <Moon className="w-5 h-5 text-purple-300" />
                  <h2 className="text-white">Sleep Metrics</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label className="text-purple-100 flex items-center justify-between mb-3">
                      <span>Sleep Hours</span>
                      <span className="text-white">{sleepHours[0]}h</span>
                    </Label>
                    <Slider
                      value={sleepHours}
                      onValueChange={setSleepHours}
                      min={0}
                      max={12}
                      step={0.5}
                      className="cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-100 flex items-center justify-between mb-3">
                      <span className="flex items-center gap-2">
                        <Coffee className="w-4 h-4" />
                        Caffeine (cups)
                      </span>
                      <span className="text-white">{caffeineIntake[0]}</span>
                    </Label>
                    <Slider
                      value={caffeineIntake}
                      onValueChange={setCaffeineIntake}
                      min={0}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-100 flex items-center justify-between mb-3">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Stress Level
                      </span>
                      <span className="text-white">{stressLevel[0]}/10</span>
                    </Label>
                    <Slider
                      value={stressLevel}
                      onValueChange={setStressLevel}
                      min={0}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-100 mb-3 block">Sleep Quality</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setSleepQuality(quality)}
                          className={`flex-1 h-12 rounded-lg transition-all flex items-center justify-center ${
                            sleepQuality >= quality
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <span className="text-white">{quality}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mood Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-5">
                <Sun className="w-5 h-5 text-purple-300" />
                <h2 className="text-white">Morning Mood</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {moodOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mood === option.value
                        ? `bg-gradient-to-br ${option.color} border-white shadow-lg`
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="mb-2">{option.emoji}</div>
                    <div className="text-white">{option.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleSaveEntry}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-7 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading ? 'Saving...' : 'Save Journal Entry'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}