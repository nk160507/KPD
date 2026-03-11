import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wand2, Loader2, Sparkles, Film } from 'lucide-react';

export default function Dashboard() {
  const [storyIdea, setStoryIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setHasContent } = useOutletContext<{ setHasContent: (val: boolean) => void }>();

  const handleGenerate = async () => {
    if (!storyIdea.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyIdea }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('scriptoria_content', JSON.stringify(data.data));
        setHasContent(true);
        navigate('/output/screenplay');
      } else {
        setError(data.error || 'Failed to generate content');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          The Writer's Room
        </h1>
        <p className="text-zinc-400 text-lg">
          Describe your scene, characters, or general plot. The AI will handle the rest.
        </p>
      </header>

      <div className="flex-1 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Textarea Container */}
        <div className="flex-1 p-6 relative">
          <textarea
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            disabled={isGenerating}
            placeholder="A detective sits in a neon-lit diner at 3 AM. A stranger slides into the booth across from him, sliding a mysterious envelope across the table..."
            className="w-full h-full bg-transparent text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none text-lg leading-relaxed font-serif"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="text-sm text-zinc-500 font-mono">
            {storyIdea.length} characters
          </div>
          
          <div className="flex items-center gap-4">
            {error && <span className="text-red-400 text-sm">{error}</span>}
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !storyIdea.trim()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${isGenerating || !storyIdea.trim() 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Writing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              <Film className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">Directing the Scene</h3>
            <p className="text-zinc-400 animate-pulse">This usually takes 15-30 seconds...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
