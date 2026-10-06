import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { useSearchStore } from '../store/searchStore';
import { Menu, Search, Image as ImageIcon, Sun, Moon, Compass, Library, Star, FileText, Sparkles, X, Check, MessageSquare, Send } from 'lucide-react';

const QUESTION_OPTIONS: Record<string, string[]> = {
  "Who was there?": ["Just me", "2-3 people", "A group", "No one"],
  "What was in the photo?": ["People", "Food", "Place", "Object", "Screenshot", "Document", "Pet"],
  "Where were you?": ["Beach", "Restaurant/Cafe", "Home", "Street", "Nature", "Hotel", "Hospital/Clinic", "Temple"],
  "Indoors or outdoors?": ["Indoors", "Outdoors"],
  "Daylight or evening?": ["Daylight", "Evening/Night"],
  "Special occasion or an ordinary day?": ["Special occasion", "Ordinary day"]
};

export const AppShell: React.FC = () => {
  const { theme, toggleTheme, isDrawerOpen, toggleDrawer } = useUiStore();
  const { 
    query, setQuery, 
    isStruggling, 
    helpMeRememberActive, setHelpMeRememberActive, 
    activeQuestion, answeredQuestions, 
    addAnswer, removeAnswer, skipQuestion,
    isAskMode, toggleAskMode, askConversation, addAskMessage
  } = useSearchStore();

  const [askInputValue, setAskInputValue] = React.useState('');

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInputValue.trim()) return;
    
    const userQuery = askInputValue;
    addAskMessage({ role: 'user', type: 'text', content: userQuery });
    setAskInputValue('');
    
    addAskMessage({ 
      role: 'assistant', 
      type: 'text', 
      content: "I'm looking for photos based on your request..." 
    });

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, history: askConversation })
      });
      const data = await res.json();
      
      addAskMessage({
        role: 'assistant',
        type: data.chips && data.chips.length > 0 ? 'chips' : 'text',
        content: data.response || "Here is what I found.",
        options: data.chips || []
      });
    } catch (err) {
      console.error(err);
      addAskMessage({
        role: 'assistant',
        type: 'text',
        content: "Sorry, I had trouble reaching the Ask Photos service."
      });
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (helpMeRememberActive && !activeQuestion && Object.keys(answeredQuestions).length > 0) {
      const timer = setTimeout(() => {
        setHelpMeRememberActive(false);
      }, 1500); // Wait 1.5 seconds so they can see their last selection before closing
      return () => clearTimeout(timer);
    }
  }, [helpMeRememberActive, activeQuestion, answeredQuestions, setHelpMeRememberActive]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Left Navigation Drawer */}
      <div
        style={{
          width: isDrawerOpen ? 'var(--drawer-width)' : '0',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', height: 'var(--topbar-height)', display: 'flex', alignItems: 'center' }}>
          
        </div>
        <nav style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <NavLink to="/photos" icon={<ImageIcon size={20} />} label="Photos" />
          <NavLink to="/explore" icon={<Compass size={20} />} label="Explore" />
          <NavLink to="/albums" icon={<Library size={20} />} label="Albums" />
          <NavLink to="/utilities" icon={<FileText size={20} />} label="Documents" />
          <NavLink to="/favourites" icon={<Star size={20} />} label="Favourites" />
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top App Bar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <button onClick={toggleDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <Menu size={24} />
            </button>
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAskMode ? "Ask Photos anything..." : "Search your photos..."}
                style={{
                  width: '100%',
                  padding: '10px 100px 10px 45px',
                  borderRadius: '24px',
                  border: '1px solid var(--border-color)',
                  background: isAskMode ? 'rgba(100, 150, 255, 0.1)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '16px',
                }}
              />
              <button 
                onClick={toggleAskMode}
                style={{
                  position: 'absolute',
                  right: query || Object.keys(answeredQuestions).length > 0 ? '110px' : '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: isAskMode ? 'var(--accent-blue)' : 'var(--bg-active)',
                  color: isAskMode ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={16} />
                Ask
              </button>
              {(query || Object.keys(answeredQuestions).length > 0) && (
                <button 
                  onClick={() => {
                    setQuery('');
                    useSearchStore.getState().setHelpMeRememberActive(false);
                    useSearchStore.getState().setSuccess(false);
                    // clear answers
                    Object.keys(answeredQuestions).forEach(q => removeAnswer(q));
                  }}
                  style={{
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--bg-active)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  New Search
                </button>
              )}
            </div>
          </div>
          <div style={{ marginLeft: '20px' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
          </div>
        </header>

        {/* Phase 3: Struggle Banner */}
        {isStruggling && !helpMeRememberActive && (
          <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} />
              <span>Having trouble finding a photo?</span>
            </div>
            <button 
              onClick={() => setHelpMeRememberActive(true)}
              style={{ background: 'white', color: '#1A73E8', border: '1px solid white', padding: '6px 16px', borderRadius: '16px', cursor: 'pointer', fontWeight: 600 }}
            >
              Help me remember
            </button>
          </div>
        )}

        {/* Phase 3: Help Me Remember UI */}
        {helpMeRememberActive && (
          <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '15px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                <Sparkles size={20} />
                Help Me Remember
              </div>
              <button onClick={() => setHelpMeRememberActive(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              {Object.entries(answeredQuestions).map(([q, a]) => (
                <div key={q} style={{ background: 'var(--bg-active)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Check size={14} />
                  <span>{a}</span>
                  <button onClick={() => removeAnswer(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--accent-blue)', padding: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {activeQuestion && (
              <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{activeQuestion}</div>
                  <button
                    onClick={() => skipQuestion(activeQuestion)}
                    style={{ background: 'var(--bg-active)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                  >
                    Skip this question
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(QUESTION_OPTIONS[activeQuestion] || []).map(opt => (
                    <button 
                      key={opt}
                      onClick={() => addAnswer(activeQuestion, opt)}
                      style={{ 
                        background: 'var(--text-primary)', 
                        border: 'none', 
                        color: 'var(--bg-primary)', 
                        padding: '10px 18px', 
                        borderRadius: '24px', 
                        cursor: 'pointer', 
                        fontWeight: 600,
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(answeredQuestions).length > 0 && !activeQuestion && (
              <div style={{ padding: '15px', background: 'var(--bg-active)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <p>We've narrowed down your photos based on your answers.</p>
                <button 
                  onClick={() => setHelpMeRememberActive(false)}
                  style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', marginTop: '10px', cursor: 'pointer' }}
                >
                  View Results
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase 5: Ask Panel */}
        {isAskMode && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {askConversation.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                  <Sparkles size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                  <div>How can I help you find your photos today?</div>
                  <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>Try asking for things like "the blue car in Goa" or "pizza from last month"</div>
                </div>
              ) : (
                askConversation.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-primary)', 
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      padding: '12px 16px', 
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      maxWidth: '80%',
                      border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none'
                    }}>
                      <div>{msg.content}</div>
                      {msg.type === 'chips' && msg.options && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {msg.options.map(opt => (
                            <button 
                              key={opt}
                              onClick={() => {
                                addAskMessage({ role: 'user', type: 'text', content: opt });
                                setTimeout(() => {
                                  addAskMessage({ role: 'assistant', type: 'text', content: "Okay, applying filter..." });
                                }, 500);
                              }}
                              style={{ 
                                background: 'var(--bg-active)', border: '1px solid var(--accent-blue)', 
                                color: 'var(--accent-blue)', padding: '6px 12px', 
                                borderRadius: '16px', cursor: 'pointer', fontSize: '13px' 
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <form onSubmit={handleAskSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={askInputValue}
                  onChange={e => setAskInputValue(e.target.value)}
                  placeholder="Ask a follow up..."
                  style={{ 
                    flex: 1, padding: '10px 15px', borderRadius: '20px', 
                    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', 
                    color: 'var(--text-primary)', outline: 'none' 
                  }}
                />
                <button type="submit" disabled={!askInputValue.trim()} style={{
                  background: 'var(--accent-blue)', color: 'white', border: 'none', 
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', cursor: askInputValue.trim() ? 'pointer' : 'not-allowed',
                  opacity: askInputValue.trim() ? 1 : 0.5
                }}>
                  <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper component for active link styling
const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 20px', 
        textDecoration: 'none', 
        color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)',
        background: isActive ? 'var(--bg-active)' : 'transparent',
        borderRadius: '0 24px 24px 0',
        marginRight: '10px',
        fontWeight: isActive ? 500 : 400
      }}
    >
      <span style={{ marginRight: '15px' }}>{icon}</span>
      {label}
    </Link>
  );
};
