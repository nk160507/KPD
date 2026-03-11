import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileDown, FileText, Download, File, FileCode } from 'lucide-react';
import Markdown from 'react-markdown';

export default function Output() {
  const { type } = useParams<{ type: string }>();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedContent = localStorage.getItem('scriptoria_content');
    if (storedContent) {
      try {
        setContent(JSON.parse(storedContent));
      } catch (e) {
        setError('Failed to parse content');
      }
    } else {
      setError('No content found');
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-zinc-400">Loading scene...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!content) return null;

  const displayContent = content[type as keyof typeof content] || 'Content not found.';
  
  const titles: Record<string, string> = {
    screenplay: 'Screenplay',
    characters: 'Character Profiles',
    soundDesign: 'Sound Design Notes',
  };

  const currentTitle = titles[type || ''] || 'Output';

  const handleDownload = async (format: string) => {
    try {
      const response = await fetch(`/api/download/${format}?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `export_${type || 'all'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={type}
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            {currentTitle}
          </h1>
          <p className="text-zinc-400 text-lg">
            Generated from your story idea.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-sm font-medium"
            title="Download TXT"
          >
            <FileCode className="w-4 h-4" />
            <span>TXT</span>
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-sm font-medium"
            title="Download PDF"
          >
            <File className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleDownload('docx')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            title="Download DOCX"
          >
            <FileDown className="w-4 h-4" />
            <span>DOCX</span>
          </button>
        </div>
      </header>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 z-10"></div>
        
        <div className="p-8 md:p-12 overflow-y-auto flex-1 prose prose-invert prose-indigo max-w-none font-serif text-zinc-300 leading-relaxed">
          <div className="markdown-body">
            <Markdown>{displayContent}</Markdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
