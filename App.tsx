
import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Navigation as NavIcon, MessageCircle, Settings, User, Search, Bell, Menu, X, ArrowRight, Clock, MapPin, ChevronRight, Zap, LogIn, LogOut, ShieldCheck, UserCircle, Coffee } from 'lucide-react';
import { AppView, Building, CampusEvent, UserRole } from './types';
import { BUILDINGS, EVENTS, COLLEGE_LOGO } from './constants';
import MapComponent from './components/MapComponent';
import { askCampusAssistant } from './services/geminiService';
import { findShortestPath } from './services/routeService';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userIdentifier, setUserIdentifier] = useState('');

  // App Navigation State
  const [view, setView] = useState<AppView>('home');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | undefined>();
  const [routeFrom, setRouteFrom] = useState<string>('block_a');
  const [routeTo, setRouteTo] = useState<string>('block_d');
  const [navigationPath, setNavigationPath] = useState<string[] | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Assistant State
  const [assistantMessages, setAssistantMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessages = [...assistantMessages, { role: 'user' as const, text: userInput }];
    setAssistantMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const response = await askCampusAssistant(userInput);
    setAssistantMessages([...newMessages, { role: 'bot' as const, text: response }]);
    setIsLoading(false);
  };

  const handleFindRoute = () => {
    const result = findShortestPath(routeFrom, routeTo);
    if (result) {
      setNavigationPath(result.path);
      setView('map');
      setSelectedBuildingId(routeTo);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserIdentifier('');
    setView('home');
  };

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-indigo-600 z-50">
        <div className="relative animate-pulse mb-8">
          <img src={COLLEGE_LOGO} alt="Centurion University Logo" className="w-56 h-auto" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center px-4 text-gray-800">Centurion University<br/>Campus Navigator</h1>
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={(role, id) => {
          setIsAuthenticated(true);
          setUserRole(role);
          setUserIdentifier(id);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="bg-white p-1 rounded-lg">
            <img src={COLLEGE_LOGO} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-xl font-extrabold text-indigo-900 tracking-tight leading-none">CUTM<br/><span className="text-xs font-semibold text-gray-400 tracking-normal uppercase">Navigator</span></span>
        </div>

        <div className="p-4 mx-4 my-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase shrink-0">
              {userRole === 'student' ? userIdentifier.charAt(0) : 'G'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-tighter">
                {userRole === 'student' ? 'Student' : 'Visitor'}
              </p>
              <p className="text-[10px] text-indigo-700 truncate font-medium">
                {userIdentifier || 'Anonymous'}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2">
          <NavItem icon={<Home size={20}/>} label="Dashboard" active={view === 'home'} onClick={() => setView('home')} />
          <NavItem icon={<MapIcon size={20}/>} label="Campus Map" active={view === 'map'} onClick={() => { setView('map'); setNavigationPath(undefined); }} />
          <NavItem icon={<NavIcon size={20}/>} label="Navigation" active={view === 'navigation'} onClick={() => setView('navigation')} />
          <NavItem icon={<MessageCircle size={20}/>} label="AI Assistant" active={view === 'assistant'} onClick={() => setView('assistant')} />
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => setView('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${view === 'admin' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings size={18} />
            <span>Admin Control</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search CUTM Blocks..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer hover:bg-indigo-700 transition-colors">
              {userRole === 'student' ? userIdentifier.charAt(0) : 'G'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {view === 'home' && <HomeView setView={setView} setSelectedBuildingId={setSelectedBuildingId} setRouteTo={setRouteTo} />}
          {view === 'map' && (
            <div className="h-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Centurion Interactive Map</h2>
                {navigationPath && (
                  <button 
                    onClick={() => setNavigationPath(undefined)}
                    className="text-sm text-red-600 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear Route
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-[500px] relative">
                <MapComponent 
                  buildings={BUILDINGS} 
                  selectedBuildingId={selectedBuildingId} 
                  onSelectBuilding={setSelectedBuildingId}
                  routePath={navigationPath}
                />
                
                {selectedBuildingId && (
                  <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-5 rounded-2xl shadow-2xl z-[1000] border border-gray-100 transform transition-all animate-slide-up">
                    <button 
                      className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                      onClick={() => setSelectedBuildingId(undefined)}
                    >
                      <X size={18} />
                    </button>
                    {(() => {
                      const b = BUILDINGS.find(x => x.id === selectedBuildingId);
                      if (!b) return null;
                      return (
                        <>
                          <img src={b.image} alt={b.name} className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm" />
                          <h3 className="font-bold text-xl text-gray-900">{b.name}</h3>
                          <p className="text-xs text-indigo-600 font-bold mb-3 uppercase tracking-wider">{b.type}</p>
                          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{b.description}</p>
                          <button 
                            onClick={() => {
                              setRouteTo(b.id);
                              setView('navigation');
                            }}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                          >
                            <NavIcon size={18} />
                            Get Directions
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
          {view === 'navigation' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Plan Your Trip</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Point</label>
                    <select 
                      value={routeFrom} 
                      onChange={(e) => setRouteFrom(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                      {BUILDINGS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-center -my-3">
                    <div className="bg-indigo-600 p-3 rounded-full text-white z-10 shadow-lg border-4 border-white">
                      <ArrowRight className="rotate-90" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Destination</label>
                    <select 
                      value={routeTo} 
                      onChange={(e) => setRouteTo(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                      {BUILDINGS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={handleFindRoute}
                    className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <NavIcon size={20} />
                    Find Shortest Path
                  </button>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                <div className="bg-indigo-200 p-3 rounded-2xl text-indigo-700">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-lg">CUTM Smart Routing</h3>
                  <p className="text-indigo-700 text-sm mt-1 leading-relaxed opacity-90">Our system utilizes real-time pathfinding to calculate the most efficient walking distance between campus blocks.</p>
                </div>
              </div>
            </div>
          )}
          {view === 'assistant' && (
            <div className="h-full max-w-4xl mx-auto flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Campus AI Assistant</h2>
                    <p className="text-indigo-100 text-xs font-medium opacity-80">Connected to CUTM Intelligence</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold uppercase tracking-wider">Online</span>
                   </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {assistantMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-gray-100">
                      <Zap size={40} className="text-indigo-600" />
                    </div>
                    <div className="max-w-xs">
                      <p className="font-bold text-gray-700 text-lg">Welcome to CUTM AI</p>
                      <p className="text-sm text-gray-500 mt-2">I can help you find classrooms, labs, or even the best spots for a quick snack!</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {['How to reach Block D?', 'Where is the Girls Mess?', 'Tell me about the Rooftop Cafe'].map((suggestion, i) => (
                          <button 
                            key={i} 
                            onClick={() => setUserInput(suggestion)}
                            className="bg-white text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 shadow-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {assistantMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                <div className="relative flex items-center max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask anything about the campus..." 
                    className="w-full pl-6 pr-16 py-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 font-medium placeholder:text-gray-400"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="absolute right-2 p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 transition-all shadow-md active:scale-95"
                  >
                    <NavIcon size={20} className="rotate-45" />
                  </button>
                </div>
              </div>
            </div>
          )}
          {view === 'admin' && <AdminView />}
        </div>
      </main>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (role: UserRole, id: string) => void }> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'guest'>('student');
  const [idInput, setIdInput] = useState('');
  const [error, setError] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = '@cutmap.ac.in';
    if (idInput.endsWith(domain) && idInput.length > domain.length) {
      onLogin('student', idInput);
    } else {
      setError(`Please use your official email (e.g., studentID${domain})`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white -z-10"></div>
      
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-100/50 relative animate-scale-in border border-white">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6">
            <img src={COLLEGE_LOGO} alt="Centurion University Logo" className="w-40 h-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight">Campus Navigator</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Smart Navigation System</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => { setActiveTab('student'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'student' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Student Login
          </button>
          <button 
            onClick={() => { setActiveTab('guest'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'guest' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Guest Visitor
          </button>
        </div>

        {activeTab === 'student' ? (
          <form onSubmit={handleStudentLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Official ID</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="email" 
                  value={idInput}
                  onChange={(e) => { setIdInput(e.target.value); setError(''); }}
                  placeholder="231801380028@cutmap.ac.in"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${error ? 'border-red-100 focus:border-red-400 focus:ring-red-50' : 'border-gray-50 focus:border-indigo-100 focus:ring-indigo-50'} rounded-2xl outline-none focus:ring-4 transition-all text-sm font-medium`}
                  required
                />
              </div>
              {error && <p className="mt-3 text-xs text-red-500 font-semibold flex items-center gap-1.5 ml-1 animate-fade-in"><X size={14} /> {error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transform hover:-translate-y-1 active:translate-y-0"
            >
              <LogIn size={20} />
              Sign in as Student
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm text-indigo-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                Visitors have instant access to our public interactive map and cafeteria menus without needing an ID.
              </p>
            </div>
            <button 
              onClick={() => onLogin('guest', 'Visitor')}
              className="w-full py-5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
            >
              <UserCircle size={20} />
              Continue as Visitor
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] font-extrabold">
            Powered by Centurion University
          </p>
        </div>
      </div>
    </div>
  );
};

const HomeView: React.FC<{ 
  setView: (v: AppView) => void, 
  setSelectedBuildingId: (id: string) => void,
  setRouteTo: (id: string) => void 
}> = ({ setView, setSelectedBuildingId, setRouteTo }) => {
  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      <section 
        className="relative overflow-hidden bg-indigo-600 rounded-[40px] p-10 md:p-16 text-white shadow-2xl shadow-indigo-100"
        style={{
          backgroundImage: `url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcutmap.ac.in%2Fwp-content%2Fuploads%2F2025%2F02%2Fcutmap.jpg&f=1&nofb=1&ipt=1fd15b32b72c52fd74182a12f629fc31303660954707b2b42ca25aac6a6ac084')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-6 backdrop-blur-md">
             <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-wider">Campus Live</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">Centurion University<br/><span className="text-indigo-200">Explorer</span></h1>
          <p className="text-indigo-50 text-lg mb-10 opacity-90 leading-relaxed font-medium">Your complete guide to everything on campus. From finding lecture halls to the new Skyline Rooftop Restaurant.</p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setView('map')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-lg transform hover:scale-105 active:scale-95"
            >
              <MapIcon size={20} />
              Open Interactive Map
            </button>
            <button 
              onClick={() => setView('assistant')}
              className="bg-indigo-500/50 backdrop-blur-md text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Talk to AI Assistant
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10 transform rotate-12 pointer-events-none">
           <img src={COLLEGE_LOGO} alt="" className="w-96 h-auto grayscale invert" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Discover Campus Spots</h2>
            <button className="text-indigo-600 font-bold flex items-center gap-1 hover:underline transition-all text-sm" onClick={() => setView('map')}>
              View all blocks <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BUILDINGS.map(b => (
              <div 
                key={b.id} 
                className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-50 transition-all cursor-pointer transform hover:-translate-y-2"
                onClick={() => {
                  setSelectedBuildingId(b.id);
                  setView('map');
                }}
              >
                <div className="h-52 overflow-hidden relative">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {b.id === 'block_b_restaurant' && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xl border border-white/20 backdrop-blur-md">
                      <Zap size={12} className="fill-current" /> TRENDING NOW
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full ${b.type === 'academic' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {b.type}
                    </span>
                    <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin size={12} className="mr-1 text-indigo-400" />
                      Live Location
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{b.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-3 leading-relaxed font-medium">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-indigo-100 shadow-xl shadow-indigo-100/20 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                   <Coffee size={28} />
                 </div>
                 <h3 className="font-bold text-xl text-gray-900 leading-tight">Hungry?<br/><span className="text-indigo-600 text-sm">Suggested Spot</span></h3>
               </div>
               <p className="text-sm text-gray-600 leading-relaxed mb-8 font-medium">
                 Experience the stunning mountain views at our <span className="font-bold text-indigo-700 underline decoration-indigo-200 decoration-4">Skyline Rooftop</span> in Block B!
               </p>
               <button 
                onClick={() => {
                  setRouteTo('block_b_restaurant');
                  setView('navigation');
                }}
                className="w-full py-4 bg-gray-50 text-indigo-600 rounded-2xl text-xs font-extrabold hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 border border-indigo-100 shadow-sm"
               >
                 Navigate There Now
               </button>
             </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Today's Events</h2>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
               <Clock size={16} className="text-indigo-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {EVENTS.map(e => (
              <div key={e.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-lg transition-all flex gap-4 items-center group cursor-pointer">
                <div className="bg-gray-50 p-4 rounded-2xl text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{e.title}</h4>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                    <MapPin size={12} className="mr-1 text-indigo-400" />
                    {BUILDINGS.find(b => b.id === e.locationId)?.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-tighter">
                    {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Management Portal</h2>
          <p className="text-gray-400 font-medium mt-1">Campus System Administration</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Add POI</button>
          <button className="flex-1 sm:flex-none bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Logs</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Campus Blocks', value: '5 Active', icon: <MapIcon />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Students', value: '1,248', icon: <User />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Nav Requests', value: '4,812', icon: <NavIcon />, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((stat, i) => (stat &&
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              {/* Fix: Use React.ReactElement<any> to avoid size prop mismatch error when cloning Lucide icons */}
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 28 })}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-4xl font-black mt-2 text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-xl text-gray-900">Points of Interest Database</h3>
          <Search size={20} className="text-gray-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Building Name</th>
                <th className="px-8 py-5">Coordinates</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {BUILDINGS.map(b => (
                <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <img src={b.image} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                       <div>
                         <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{b.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{b.type}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-mono tracking-tighter">{b.lat.toFixed(6)}, {b.lng.toFixed(6)}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Live</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline px-4 py-2 hover:bg-indigo-100 rounded-xl transition-all">Configure</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
  >
    <span className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600 transition-colors'} ${active ? 'scale-110' : ''}`}>
      {icon}
    </span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm"></div>}
  </button>
);

export default App;
