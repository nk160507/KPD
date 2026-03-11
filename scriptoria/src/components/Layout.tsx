import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Film, FileText, Users, Music, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const [userName, setUserName] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('scriptoria_user');
    if (!storedName) {
      navigate('/');
    } else {
      setUserName(storedName);
    }

    const storedContent = localStorage.getItem('scriptoria_content');
    if (storedContent) {
      setHasContent(true);
    }
  }, [navigate, location.pathname]);

  const navItems = [
    { name: 'Story Line', path: '/dashboard', icon: Film, disabled: false },
    { name: 'Screenplay', path: '/output/screenplay', icon: FileText, disabled: !hasContent },
    { name: 'Characters', path: '/output/characters', icon: Users, disabled: !hasContent },
    { name: 'Sound Design', path: '/output/soundDesign', icon: Music, disabled: !hasContent },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 z-20">
        <div className="flex items-center gap-2 text-indigo-400 font-serif text-xl font-bold">
          <Film className="w-6 h-6" />
          <span>Scriptoria</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 text-indigo-400 font-serif text-2xl font-bold tracking-tight">
          <Film className="w-8 h-8" />
          <span>Scriptoria</span>
        </div>

        <div className="px-6 py-4 border-b border-zinc-800/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Director</p>
          <p className="text-zinc-100 font-medium truncate">{userName || 'Loading...'}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.disabled ? '#' : item.path}
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
                setIsMobileMenuOpen(false);
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${item.disabled 
                  ? 'opacity-40 cursor-not-allowed' 
                  : isActive && !item.disabled
                    ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                    : 'hover:bg-zinc-800/50 hover:text-zinc-100'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${item.disabled ? '' : 'text-current'}`} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => {
              localStorage.removeItem('scriptoria_user');
              localStorage.removeItem('scriptoria_content');
              navigate('/');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit Studio</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ setHasContent }} />
        </div>
      </main>
    </div>
  );
}
