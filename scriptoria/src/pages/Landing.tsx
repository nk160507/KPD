import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Film, User } from 'lucide-react';

export default function Landing() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      localStorage.setItem('scriptoria_user', name);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save name:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 opacity-80" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-2xl px-6"
      >
        <div className="flex justify-center mb-6">
          <Film className="w-20 h-20 text-indigo-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 font-serif">
          Scriptoria
        </h1>
        <p className="text-xl text-zinc-400 mb-10 font-light">
          Transform your story ideas into professional screenplays, character profiles, and sound design notes in seconds.
        </p>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
        >
          Begin Production
        </button>
      </motion.div>

      {/* Name Capture Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">Welcome, Director</h2>
            <p className="text-zinc-400 mb-6">Please enter your name for the clapperboard.</p>
            
            <form onSubmit={handleStart}>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Your Name"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Action!
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
