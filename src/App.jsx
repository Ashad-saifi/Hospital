import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Layers, 
  Shield, 
  Cpu, 
  MessageSquare, 
  Activity, 
  CheckCircle, 
  Trash2, 
  Terminal, 
  Settings, 
  Sun, 
  Moon, 
  Check, 
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Send,
  Zap,
  Globe,
  TrendingUp,
  Database,
  ArrowRight,
  Sparkles,
  FileCode,
  AlertCircle,
  Code,
  Copy,
  BarChart3,
  Menu,
  X
} from 'lucide-react';

function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);
  
  // Navigation: 'landing' or 'admin'
  const [view, setView] = useState('landing');
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  
  // Admin Panel State
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'System initialized successfully.' },
    { time: new Date().toLocaleTimeString(), type: 'success', msg: 'Vite & React components loaded.' }
  ]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Preview Config State (Customizer Panel)
  const [previewConfig, setPreviewConfig] = useState({
    themeColor: 'indigo', // indigo, violet, emerald, orange
    template: 'saas', // saas, agency, enterprise
    siteName: 'WebSolution Pro',
    heroTitle: 'Professional Web Solutions for Your Business',
    showFeatures: {
      responsive: true,
      performance: true,
      seo: true,
      security: true
    },
    deviceMode: 'desktop' // desktop, tablet, mobile
  });

  // Extended Custom States for enhanced interactive functions
  const [previewPage, setPreviewPage] = useState('home'); // home, features, contact
  const [activeMobileTab, setActiveMobileTab] = useState('customizer'); // customizer, viewport, leads, logs
  const [centerViewMode, setCenterViewMode] = useState('preview'); // preview, code
  const [terminalInput, setTerminalInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock data backup in case backend is offline
  const mockLeads = [
    {
      id: '1',
      name: 'Sarah Jenkins',
      email: 'sarah@alphatech.io',
      message: 'Looking for a custom dashboard development project. Can you integrate with Stripe?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'unread'
    },
    {
      id: '2',
      name: 'David Chen',
      email: 'd.chen@novasolutions.com',
      message: 'Interested in upgrading our marketing landing page. Need high performance and Framer animations.',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'resolved'
    }
  ];

  // Load leads from backend
  const fetchLeads = async () => {
    try {
      addLog('info', 'Fetching inquiries from backend API...');
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        setBackendStatus('connected');
        addLog('success', `Loaded ${data.length} messages from local storage.`);
      } else {
        throw new Error('API response error');
      }
    } catch (err) {
      console.warn('Backend server not connected, using offline mock data.', err);
      setLeads(mockLeads);
      setBackendStatus('disconnected');
      addLog('warning', 'Backend disconnected. Using offline simulated state.');
    }
  };

  // Add system console log
  const addLog = (type, msg) => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), type, msg },
      ...prev.slice(0, 15)
    ]);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    addLog('info', `Sending message from ${contactForm.email}...`);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubmitStatus('success');
        addLog('success', `Message successfully stored for ${contactForm.name}.`);
        setContactForm({ name: '', email: '', message: '' });
        fetchLeads(); // refresh
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err) {
      // Simulate submission offline
      setTimeout(() => {
        const fakeMessage = {
          id: Date.now().toString(),
          ...contactForm,
          timestamp: new Date().toISOString(),
          status: 'unread'
        };
        setLeads(prev => [fakeMessage, ...prev]);
        setSubmitStatus('success');
        addLog('success', `Offline Mode: Message simulated and logged for ${contactForm.name}.`);
        setContactForm({ name: '', email: '', message: '' });
        setIsSubmitting(false);
      }, 800);
      return;
    }
    setIsSubmitting(false);
  };

  // Delete message
  const handleDeleteLead = async (id) => {
    addLog('info', `Deleting inquiry index: ${id}`);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addLog('success', 'Lead removed from server database.');
        fetchLeads();
      } else {
        throw new Error('Delete API failed');
      }
    } catch (err) {
      setLeads(prev => prev.filter(item => item.id !== id));
      addLog('success', 'Offline Mode: Lead removed from local memory.');
    }
  };

  // Toggle lead status (resolved/unread)
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'unread' ? 'resolved' : 'unread';
    addLog('info', `Updating status of inquiry ${id} to ${nextStatus}...`);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        addLog('success', 'Status saved to database.');
        fetchLeads();
      } else {
        throw new Error('Patch API failed');
      }
    } catch (err) {
      setLeads(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
      addLog('success', 'Offline Mode: Updated status in local memory.');
    }
  };

  // Handle Terminal Commands
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    addLog('info', `Executing: ${cmd}`);
    setTerminalInput('');

    // Basic command parser
    const command = cmd.toLowerCase().trim();
    if (command === '/help') {
      addLog('success', 'Workspace Terminal Help Menu:\n  /help - Show commands list\n  /clear - Clear screen logs\n  /mock - Inject random test lead\n  /leads - Get leads db status\n  /theme <color> - Set accent theme (indigo, violet, emerald, orange)\n  /status - System environment dump');
    } else if (command === '/clear') {
      setLogs([{ time: new Date().toLocaleTimeString(), type: 'info', msg: 'System logs cleared.' }]);
    } else if (command === '/mock') {
      const mockNames = ['Alice Vance', 'Liam Harrison', 'Aria Chen', 'Marcus Vance', 'Sofia Rodriguez'];
      const mockEmails = ['alice@vance.io', 'liam@harrison.org', 'aria.chen@nova.net', 'marcus@vance.io', 'sofia.r@techcorp.co'];
      const mockMessages = [
        'Looking to integrate Stripe checkout subscription plans into our SaaS.',
        'Interested in standard responsive layouts and custom styling options.',
        'Could we arrange a meeting next week to discuss scaffolding configurations?',
        'Hi, we need to spin up a high-performance web agency prototype.',
        'Is it possible to add PostgreSQL support in the backend adaptors?'
      ];
      const index = Math.floor(Math.random() * mockNames.length);
      const fakeLead = {
        id: Date.now().toString(),
        name: mockNames[index],
        email: mockEmails[index],
        message: mockMessages[index],
        timestamp: new Date().toISOString(),
        status: 'unread'
      };
      setLeads(prev => [fakeLead, ...prev]);
      addLog('success', `Simulated inquiry created for ${mockNames[index]}.`);
    } else if (command === '/leads') {
      const openLeads = leads.filter(l => l.status === 'unread').length;
      const resolvedLeads = leads.filter(l => l.status === 'resolved').length;
      addLog('success', `DB Summary: ${leads.length} total messages (${openLeads} open, ${resolvedLeads} resolved).`);
    } else if (command.startsWith('/theme ')) {
      const color = command.replace('/theme ', '').trim();
      const validColors = ['indigo', 'violet', 'emerald', 'orange'];
      if (validColors.includes(color)) {
        setPreviewConfig(prev => ({ ...prev, themeColor: color }));
        addLog('success', `Accent theme dynamically changed to: ${color}.`);
      } else {
        addLog('error', `Invalid theme accent color. Try: ${validColors.join(', ')}`);
      }
    } else if (command === '/status') {
      addLog('success', `Environment status: Dev-Port:5173 | API-Status:${backendStatus === 'connected' ? 'Port 5000' : 'Offline simulated'} | Active-Theme:${previewConfig.themeColor} | DarkMode: ${darkMode}`);
    } else {
      addLog('error', `Unknown command: "${cmd}". Type /help for assistance.`);
    }
  };

  // Submit simulated lead from within the preview mockup
  const submitMockLeadFromPreview = () => {
    addLog('info', 'Submitting contact inquiry from mock preview viewport...');
    setTimeout(() => {
      const names = ['Emma Watson', 'James Bond', 'Tony Stark', 'Bruce Wayne', 'Selena Gomez'];
      const messages = [
        'Hi, I love the templates. Let\'s schedule a call to build our corporate portal.',
        'Can you support custom layouts on tablets?',
        'Do you provide backend Express hosting options?',
        'Need to set up a secure gateway.',
        'I need a high-performance web agency prototype.'
      ];
      const r = Math.floor(Math.random() * names.length);
      const name = names[r];
      const email = `${name.toLowerCase().replace(' ', '')}@preview.io`;
      const message = messages[r];
      
      const fakeLead = {
        id: Date.now().toString(),
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
        status: 'unread'
      };
      setLeads(prev => [fakeLead, ...prev]);
      addLog('success', `Preview Mockup: Message logged dynamically in leads database for ${name}.`);
      addLog('info', 'Check the Leads panel to view the entry.');
    }, 600);
  };

  // Generate React Tailwind component code
  const getGeneratedCode = () => {
    const colorClasses = {
      indigo: { bg: 'from-indigo-600 to-purple-650', text: 'text-indigo-400' },
      violet: { bg: 'from-purple-600 to-pink-650', text: 'text-purple-400' },
      emerald: { bg: 'from-emerald-600 to-teal-650', text: 'text-emerald-400' },
      orange: { bg: 'from-orange-650 to-amber-600', text: 'text-orange-400' }
    };
    const current = colorClasses[previewConfig.themeColor] || colorClasses.indigo;

    return `import React from 'react';
import { Sparkles, ArrowRight, Laptop, Zap, TrendingUp, Shield } from 'lucide-react';

export default function ScaffoldingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Dynamic glow overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none opacity-20 blur-[130px] bg-gradient-to-b from-indigo-500/20 to-transparent" />

      {/* Nav Section */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <span className="font-extrabold text-xl tracking-tight text-white">${previewConfig.siteName}</span>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-all">
          Launch Application
        </button>
      </nav>

      {/* Hero Block */}
      <header className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Web Scaffolding Platform</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-none text-white">
          ${previewConfig.heroTitle}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
          CURATED DESIGNS AND LIGHTNING FAST RENDERS POWERED BY REACT & VITE.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${current.bg} hover:brightness-110 shadow-lg shadow-indigo-500/10 transition-all flex items-center space-x-2">
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Features Module */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${previewConfig.showFeatures.responsive ? `
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-850 space-y-4">
          <Laptop className="w-6 h-6 ${current.text}" />
          <h3 className="text-lg font-bold">Responsive Grids</h3>
          <p className="text-sm text-slate-400">Seamless scaling layouts optimized for phones, tablets, and wide screens.</p>
        </div>` : ''}
        ${previewConfig.showFeatures.performance ? `
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-850 space-y-4">
          <Zap className="w-6 h-6 ${current.text}" />
          <h3 className="text-lg font-bold">Fast Loading</h3>
          <p className="text-sm text-slate-400">Vite compilation delivers high page speeds, minimal assets, and hot reload cycles.</p>
        </div>` : ''}
        ${previewConfig.showFeatures.seo ? `
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-850 space-y-4">
          <TrendingUp className="w-6 h-6 ${current.text}" />
          <h3 className="text-lg font-bold">SEO Metadata</h3>
          <p className="text-sm text-slate-400">Optimized semantic HTML headers and schemas to rank search indexes.</p>
        </div>` : ''}
        ${previewConfig.showFeatures.security ? `
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-850 space-y-4">
          <Shield className="w-6 h-6 ${current.text}" />
          <h3 className="text-lg font-bold">Secure Pipelines</h3>
          <p className="text-sm text-slate-400">Route guards, endpoint filters, and data validator modules active.</p>
        </div>` : ''}
      </section>
    </div>
  );
}`;
  };

  // Color theme mapper
  const getThemeClass = (color) => {
    switch(color) {
      case 'violet': return {
        text: 'text-purple-400',
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        border: 'border-purple-500/30',
        gradient: 'from-purple-500 to-indigo-500',
        accentGlow: 'rgba(168, 85, 247, 0.15)',
        ring: 'focus:ring-purple-500'
      };
      case 'emerald': return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-500',
        accentGlow: 'rgba(16, 185, 129, 0.15)',
        ring: 'focus:ring-emerald-500'
      };
      case 'orange': return {
        text: 'text-orange-400',
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-700',
        border: 'border-orange-500/30',
        gradient: 'from-orange-500 to-amber-500',
        accentGlow: 'rgba(249, 115, 22, 0.15)',
        ring: 'focus:ring-orange-500'
      };
      default: return { // indigo default
        text: 'text-indigo-400',
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        border: 'border-indigo-500/30',
        gradient: 'from-indigo-500 to-purple-500',
        accentGlow: 'rgba(99, 102, 241, 0.15)',
        ring: 'focus:ring-indigo-500'
      };
    }
  };

  const currentTheme = getThemeClass(previewConfig.themeColor);

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-300`}>
      
      {/* Dynamic radial glow at the top for rich developer/SaaS aesthetics */}
      {darkMode && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30 blur-[130px] transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${currentTheme.accentGlow} 0%, transparent 70%)`
          }}
        />
      )}

      {/* FLOATING HEADER */}
      <nav className={`sticky top-0 z-50 px-4 py-3 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-tr ${currentTheme.gradient} text-white shadow-md shadow-indigo-500/10`}>
              <Cpu className="w-4 h-4 sm:w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 dark:from-white dark:to-slate-300 truncate max-w-[120px] sm:max-w-none">
              {previewConfig.siteName}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setView('landing')} 
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                view === 'landing' 
                  ? (darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-200 text-slate-950')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Landing
            </button>
            <button 
              onClick={() => {
                setView('admin');
                addLog('info', 'Switched view to Developer Workspace.');
              }} 
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                view === 'admin' 
                  ? `bg-gradient-to-r ${currentTheme.gradient} text-white shadow-md`
                  : (darkMode ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>

            <span className="h-5 w-[1px] bg-slate-800/40 dark:bg-slate-850" />

            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-full border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 text-yellow-500 hover:bg-slate-850' : 'bg-slate-100 border-slate-200 text-slate-750 hover:bg-slate-200'
              }`}
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* LANDING PAGE VIEW */}
      {view === 'landing' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-24 overflow-hidden">
          
          {/* HERO SECTION */}
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold glass-panel border border-slate-750/50 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Web Scaffolding Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
                Build Beautiful and{' '}
                <span className={`bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}>
                  Premium Interfaces
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Elevate your digital project with curated themes, responsive grids, custom panels, and an integrated Express database. Configure and test in real time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setView('admin')}
                  className={`px-6 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 shadow-indigo-500/25`}
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a 
                  href="#contact"
                  className={`px-6 py-3.5 rounded-xl font-bold border transition-all text-center ${
                    darkMode ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800' : 'border-slate-350 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Get Quote
                </a>
              </div>
            </motion.div>

            {/* Premium Dashboard Mockup Graphic (Dynamic based on settings) */}
            <motion.div 
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="md:col-span-6"
            >
              <div className="relative rounded-2xl overflow-hidden glass-panel shadow-2xl shadow-indigo-500/5 border border-slate-800/80 animate-float">
                
                {/* Mockup header */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 tracking-wider">PREVIEW: {previewConfig.siteName.toUpperCase()}</span>
                  <div className="w-12 h-1 bg-slate-800 rounded" />
                </div>

                {/* Mockup Body */}
                <div className="p-6 space-y-6 text-left bg-slate-950/90 min-h-[300px]">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentTheme.text}`}>{previewConfig.template} template</span>
                    <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">v1.2.0</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white">{previewConfig.heroTitle}</h3>
                    <p className="text-xs text-slate-400">Dynamic UI powered by React state, customized using our control panel settings.</p>
                  </div>

                  {/* Active features preview flags */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {previewConfig.showFeatures.responsive && (
                      <div className="flex items-center space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                        <Laptop className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-slate-300">Responsive Active</span>
                      </div>
                    )}
                    {previewConfig.showFeatures.performance && (
                      <div className="flex items-center space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                        <Zap className="w-4 h-4 text-emerald-450" />
                        <span className="text-xs text-slate-300">Fast Loading (SSR)</span>
                      </div>
                    )}
                    {previewConfig.showFeatures.seo && (
                      <div className="flex items-center space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-300">SEO Schema Meta</span>
                      </div>
                    )}
                    {previewConfig.showFeatures.security && (
                      <div className="flex items-center space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                        <Shield className="w-4 h-4 text-amber-450" />
                        <span className="text-xs text-slate-300">SSL SSL-256 Enabled</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-6">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                      <Database className="w-3.5 h-3.5" />
                      <span>Database: <strong className="text-emerald-500">Online</strong></span>
                    </div>
                    <button 
                      onClick={() => setView('admin')}
                      className={`text-xs flex items-center space-x-1 ${currentTheme.text} font-bold hover:underline`}
                    >
                      <span>Modify layout</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* SYSTEM STATS OR FLOATING BENCHMARKS */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl ${darkMode ? 'bg-slate-900/30 border border-slate-900' : 'bg-slate-100 border border-slate-200'}`}
          >
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-slate-400">Total Leads Saved</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white flex items-center space-x-1.5">
                <span>{leads.length}</span>
                <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">Live</span>
              </p>
            </div>
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-slate-400">Selected Color</span>
              <p className="text-2xl font-black capitalize text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <span className={`w-3.5 h-3.5 rounded-full`} style={{backgroundColor: previewConfig.themeColor === 'indigo' ? '#4f46e5' : previewConfig.themeColor === 'violet' ? '#7c3aed' : previewConfig.themeColor === 'emerald' ? '#059669' : '#ea580c'}} />
                <span>{previewConfig.themeColor}</span>
              </p>
            </div>
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-slate-400">Active Template</span>
              <p className="text-2xl font-black uppercase text-slate-800 dark:text-slate-100">{previewConfig.template}</p>
            </div>
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-slate-400">Server API State</span>
              <p className="text-2xl font-black flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : backendStatus === 'disconnected' ? 'bg-rose-500' : 'bg-yellow-500'}`} />
                <span className="text-lg text-slate-700 dark:text-slate-300">{backendStatus === 'connected' ? 'Connected (5000)' : backendStatus === 'disconnected' ? 'Offline (Demo)' : 'Verifying...'}</span>
              </p>
            </div>
          </motion.div>

          {/* CORE FEATURES LIST */}
          <div className="space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Engineered for Performance</h2>
              <p className="text-sm text-slate-400">All features of WebSolution Pro are modular, structured, and reactive.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {[
                { icon: <Laptop className="w-6 h-6" />, title: 'Responsive Design', desc: 'Grid system automatically adapts to mobiles, tablets, and wide screens with smooth media breaking.', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
                { icon: <Zap className="w-6 h-6" />, title: 'Fast Loading', desc: 'Scaffolded with Vite to deliver lightning fast page speed, minimal package sizes, and instant updates.', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
                { icon: <TrendingUp className="w-6 h-6" />, title: 'SEO Friendly', desc: 'Built-in Semantic HTML5 layout tags, clean headings hierarchical schemas, and metadata optimization.', bg: 'bg-purple-500/10', text: 'text-purple-400' },
                { icon: <Shield className="w-6 h-6" />, title: 'Secure Hosting', desc: 'Fully validated JSON validation mechanisms and route filtering to protect against malicious input.', bg: 'bg-amber-500/10', text: 'text-amber-400' },
                { icon: <Layers className="w-6 h-6" />, title: 'Custom Solutions', desc: 'Fully component-based structure. Re-order components and blocks dynamically using React state.', bg: 'bg-pink-500/10', text: 'text-pink-400' },
                { icon: <MessageSquare className="w-6 h-6" />, title: '24/7 Service Support', desc: 'A live workspace and logs console allows developers and clients to debug projects smoothly.', bg: 'bg-teal-500/10', text: 'text-teal-400' }
              ].map((feat, idx) => (
                <motion.div 
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="glass-panel p-6 rounded-xl space-y-4 hover:border-indigo-500/30 transition duration-300 text-left"
                >
                  <div className={`p-3 ${feat.bg} ${feat.text} rounded-lg w-fit`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* DYNAMIC CONTACT FORM SECTION */}
          <div id="contact" className="grid md:grid-cols-12 gap-12 items-stretch py-8">
            
            <div className="md:col-span-5 flex flex-col justify-between text-left space-y-8 bg-slate-900/20 p-8 rounded-2xl border border-slate-900">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Connect with our Devs</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Get in Touch Today</h2>
                <p className="text-sm text-slate-400">
                  Submit a query to test the database pipeline. We save messages locally in the node workspace database (`backend/data/messages.json`).
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span>Serving Clients Globally</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <FileCode className="w-5 h-5 text-emerald-450" />
                  <span>React-Vite-Express Stack</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center space-x-3">
                <Database className="w-5 h-5 text-purple-400" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-350">Express Endpoint</p>
                  <p className="font-mono text-slate-500">POST /api/contact</p>
                </div>
              </div>
            </div>

            {/* FORM CARD */}
            <div className="md:col-span-7 glass-panel p-8 rounded-2xl text-left">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe"
                      className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 ${currentTheme.ring} transition-all`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="johndoe@email.com"
                      className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 ${currentTheme.ring} transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Message</label>
                  <textarea 
                    id="message" 
                    rows="4"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your web solutions project..."
                    className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 ${currentTheme.ring} transition-all`}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 shadow-lg cursor-pointer disabled:opacity-60 transition duration-300`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Inquiry Message'}</span>
                </button>
              </form>

              {/* Status Alert Modals */}
              {submitStatus === 'success' && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">Submission Successful!</h4>
                    <p className="text-xs text-slate-400 mt-1">Your query was logged into the backend. Head over to the Workspace Console to view it live.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-400">Fields Missing</h4>
                    <p className="text-xs text-slate-400 mt-1">Please fill in all inputs (name, email, and message) before submitting.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* DEVELOPER / CREATOR WORKSPACE PANEL (THREE PANEL SYSTEM) */}
      {view === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          <div className="flex flex-col md:flex-row items-start justify-between border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>WebSolution Panel System</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Interactive Workspace Console</h2>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <span className="text-xs text-slate-500">Database Connection:</span>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                backendStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <Database className="w-3 h-3" />
                <span>{backendStatus === 'connected' ? 'Express Active' : 'Offline Demo'}</span>
              </span>
            </div>
          </div>

          {/* Mobile Tab Navigator (visible only on mobile) */}
          <div className="flex lg:hidden bg-slate-900/80 border border-slate-800/50 p-1 rounded-xl mb-6 justify-around items-center sticky top-[64px] z-40 backdrop-blur-md">
            {[
              { id: 'customizer', label: 'Customize', icon: <Settings className="w-4 h-4" /> },
              { id: 'viewport', label: 'Preview', icon: <Smartphone className="w-4 h-4" /> },
              { id: 'leads', label: 'Leads', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'logs', label: 'Logs', icon: <Terminal className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMobileTab(tab.id);
                  addLog('info', `Swapped active mobile view to: ${tab.label}`);
                }}
                className={`flex-1 py-2 px-1 text-center rounded-lg flex flex-col items-center justify-center space-y-1 transition-all ${
                  (tab.id === 'leads' || tab.id === 'logs') 
                    ? (activeMobileTab === tab.id ? `bg-gradient-to-r ${currentTheme.gradient} text-white font-bold shadow-md` : 'text-slate-400 hover:text-slate-200')
                    : (activeMobileTab === tab.id ? `bg-gradient-to-r ${currentTheme.gradient} text-white font-bold shadow-md` : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* THREE PANEL GRID */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            
            {/* PANEL 1: CONTROL PANEL & SCAFFOLDING CUSTOMIZER (Left) */}
            <div className={`lg:col-span-3 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl text-left flex-col space-y-6 ${activeMobileTab === 'customizer' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Settings className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-200">Layout Controller</h3>
              </div>

              {/* Title & Brand inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase mb-1.5 font-mono">Brand Logo Name</label>
                  <input 
                    type="text" 
                    value={previewConfig.siteName}
                    onChange={(e) => setPreviewConfig({ ...previewConfig, siteName: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase mb-1.5 font-mono">Hero Headline Title</label>
                  <textarea 
                    rows="2"
                    value={previewConfig.heroTitle}
                    onChange={(e) => setPreviewConfig({ ...previewConfig, heroTitle: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Theme selections */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase font-mono">Accent Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {['indigo', 'violet', 'emerald', 'orange'].map((color) => {
                    const mapped = getThemeClass(color);
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setPreviewConfig({ ...previewConfig, themeColor: color });
                          addLog('info', `Changed layout theme color to: ${color}`);
                        }}
                        className={`py-2 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                          previewConfig.themeColor === color 
                            ? `bg-slate-800 text-white ${mapped.border}` 
                            : 'bg-slate-950/80 border-slate-900 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{backgroundColor: color === 'indigo' ? '#4f46e5' : color === 'violet' ? '#7c3aed' : color === 'emerald' ? '#059669' : '#ea580c'}} />
                        {color.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template settings */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase font-mono">Preset Template Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {['saas', 'agency', 'enterprise'].map((tmpl) => (
                    <button
                      key={tmpl}
                      onClick={() => {
                        setPreviewConfig({ ...previewConfig, template: tmpl });
                        addLog('info', `Loaded project template layout preset: ${tmpl.toUpperCase()}`);
                      }}
                      className={`py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        previewConfig.template === tmpl 
                          ? 'bg-indigo-650 border-indigo-500 text-white shadow-md' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature flags */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase font-mono">Features Visibility</label>
                <div className="space-y-2.5">
                  {Object.keys(previewConfig.showFeatures).map((key) => (
                    <label key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-900 cursor-pointer select-none">
                      <span className="text-xs text-slate-300 capitalize font-medium">{key} module</span>
                      <input 
                        type="checkbox" 
                        checked={previewConfig.showFeatures[key]}
                        onChange={(e) => {
                          setPreviewConfig({
                            ...previewConfig,
                            showFeatures: {
                              ...previewConfig.showFeatures,
                              [key]: e.target.checked
                            }
                          });
                          addLog('info', `Toggled module state for: [${key}] to ${e.target.checked}`);
                        }}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-3 leading-relaxed">
                <p>Properties bind dynamically to React states and reflect reactively in the workspace preview and export codes.</p>
              </div>
            </div>

            {/* PANEL 2: LIVE INTERACTIVE MOCKUP & EXPORTER VIEWPORT (Center) */}
            <div className={`lg:col-span-5 flex-col space-y-4 ${activeMobileTab === 'viewport' ? 'flex' : 'hidden lg:flex'}`}>
              
              {/* Tool bar (Device simulator & Exporter Mode switcher) */}
              <div className="bg-slate-900/60 border border-slate-850 px-4 py-2 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex space-x-1.5">
                  {[
                    { mode: 'desktop', icon: <Monitor className="w-3.5 h-3.5" /> },
                    { mode: 'tablet', icon: <Tablet className="w-3.5 h-3.5" /> },
                    { mode: 'mobile', icon: <Smartphone className="w-3.5 h-3.5" /> }
                  ].map((dev) => (
                    <button
                      key={dev.mode}
                      onClick={() => setPreviewConfig({ ...previewConfig, deviceMode: dev.mode })}
                      className={`p-1.5 rounded-lg border transition-all ${
                        previewConfig.deviceMode === dev.mode 
                          ? `bg-slate-800 border-slate-750 text-white` 
                          : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'
                      }`}
                      title={`${dev.mode.toUpperCase()} simulator`}
                    >
                      {dev.icon}
                    </button>
                  ))}
                </div>

                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 shrink-0">
                  <button
                    onClick={() => setCenterViewMode('preview')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 ${
                      centerViewMode === 'preview' 
                        ? `bg-indigo-600 text-white shadow-sm` 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setCenterViewMode('code')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 ${
                      centerViewMode === 'code' 
                        ? `bg-indigo-600 text-white shadow-sm` 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Export Code</span>
                  </button>
                </div>
              </div>

              {/* Dynamic content rendering depending on Preview or Code mode */}
              <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-2xl flex items-center justify-center p-3 sm:p-4 min-h-[500px]">
                
                {centerViewMode === 'preview' ? (
                  <div 
                    className={`glass-panel rounded-xl overflow-hidden border border-slate-750/80 shadow-2xl transition-all duration-300 flex flex-col ${
                      previewConfig.deviceMode === 'mobile' 
                        ? 'w-[280px] h-[480px]' 
                        : previewConfig.deviceMode === 'tablet' 
                          ? 'w-[450px] h-[550px]' 
                          : 'w-full min-h-[480px] max-h-[580px]'
                    }`}
                  >
                    
                    {/* Browser simulated chrome */}
                    <div className="bg-slate-900 border-b border-slate-850 px-3 py-2 flex items-center justify-between space-x-2 shrink-0">
                      <div className="flex space-x-1 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="bg-slate-950/80 text-[8px] text-slate-500 px-3 py-0.5 rounded flex items-center space-x-1.5 w-full mx-2 font-mono truncate">
                        <Globe className="w-2.5 h-2.5 text-slate-600" />
                        <span>https://mockup.websolutionpro.io/{previewConfig.template}/{previewPage}</span>
                      </div>
                    </div>

                    {/* Browser viewport area */}
                    <div className="flex-1 bg-slate-950 text-left p-4 overflow-y-auto space-y-4">
                      
                      {/* Interactive mockup site navbar */}
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 flex-wrap gap-2 shrink-0">
                        <span className="text-xs font-black text-white">{previewConfig.siteName}</span>
                        <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-450 dark:text-slate-400">
                          <button onClick={() => setPreviewPage('home')} className={`hover:text-slate-100 transition ${previewPage === 'home' ? 'text-indigo-400 underline' : ''}`}>Home</button>
                          <button onClick={() => setPreviewPage('features')} className={`hover:text-slate-100 transition ${previewPage === 'features' ? 'text-indigo-400 underline' : ''}`}>Modules</button>
                          <button onClick={() => setPreviewPage('contact')} className={`hover:text-slate-100 transition ${previewPage === 'contact' ? 'text-indigo-400 underline' : ''}`}>Inquire</button>
                        </div>
                      </div>

                      {/* Mockup sub-page contents */}
                      {previewPage === 'home' && (
                        <div className="space-y-4">
                          <div className="space-y-2 py-2">
                            <h4 className="text-sm font-black text-slate-100 leading-tight">{previewConfig.heroTitle}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Providing responsive layouts, database pipelines, and high performance servers designed using modern styling configurations.
                            </p>
                          </div>

                          {/* Dynamic Preset Content */}
                          {previewConfig.template === 'saas' && (
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 space-y-2 text-xs">
                              <p className="font-bold text-slate-200">SaaS Metrics Dashboard</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-950 p-2 rounded border border-slate-900">
                                  <p className="text-[8px] text-slate-500">API Latency</p>
                                  <p className="font-bold text-emerald-450">14ms</p>
                                </div>
                                <div className="bg-slate-950 p-2 rounded border border-slate-900">
                                  <p className="text-[8px] text-slate-500">Active Nodes</p>
                                  <p className="font-bold text-indigo-400">28 active</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {previewConfig.template === 'agency' && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase text-slate-400">Our Creative Portfolios</p>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="h-10 bg-gradient-to-tr from-indigo-500 to-indigo-900 rounded opacity-80 hover:opacity-100 transition duration-300 cursor-pointer" />
                                <div className="h-10 bg-gradient-to-tr from-purple-500 to-purple-900 rounded opacity-80 hover:opacity-100 transition duration-300 cursor-pointer" />
                                <div className="h-10 bg-gradient-to-tr from-emerald-500 to-emerald-900 rounded opacity-80 hover:opacity-100 transition duration-300 cursor-pointer" />
                              </div>
                            </div>
                          )}

                          {previewConfig.template === 'enterprise' && (
                            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-300 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Enterprise SLA Guarantee</span>
                                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">99.9%</span>
                              </div>
                              <p className="text-[9px] text-slate-500">SLA terms backed by certified cloud engineers and monitored dynamically via our logs dashboard.</p>
                            </div>
                          )}

                          {/* Quick Summary Feature Module Toggles */}
                          <div className="space-y-1 pt-1">
                            <p className="text-[8px] font-bold uppercase text-slate-550 tracking-wider">Scaffolding Modules:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(previewConfig.showFeatures).map((key) => {
                                if (!previewConfig.showFeatures[key]) return null;
                                return (
                                  <span key={key} className="text-[8px] bg-indigo-950/40 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded capitalize font-semibold">
                                    {key}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {previewPage === 'features' && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-extrabold text-slate-200 uppercase tracking-wide">Configured Feature Modules</p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {previewConfig.showFeatures.responsive && (
                              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-850 text-[9px] text-slate-350">
                                <span className="flex items-center space-x-1.5">
                                  <Laptop className="w-3 h-3 text-indigo-400" />
                                  <span>Responsive Grid Adaptor</span>
                                </span>
                                <Check className="w-3.5 h-3.5 text-indigo-400" />
                              </div>
                            )}
                            {previewConfig.showFeatures.performance && (
                              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-850 text-[9px] text-slate-350">
                                <span className="flex items-center space-x-1.5">
                                  <Zap className="w-3 h-3 text-emerald-400" />
                                  <span>Vite Hot Compilation</span>
                                </span>
                                <Check className="w-3.5 h-3.5 text-emerald-450" />
                              </div>
                            )}
                            {previewConfig.showFeatures.seo && (
                              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-850 text-[9px] text-slate-350">
                                <span className="flex items-center space-x-1.5">
                                  <TrendingUp className="w-3 h-3 text-purple-400" />
                                  <span>SEO Semantic Layouts</span>
                                </span>
                                <Check className="w-3.5 h-3.5 text-purple-400" />
                              </div>
                            )}
                            {previewConfig.showFeatures.security && (
                              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-850 text-[9px] text-slate-350">
                                <span className="flex items-center space-x-1.5">
                                  <Shield className="w-3 h-3 text-amber-400" />
                                  <span>SSL encryption modules</span>
                                </span>
                                <Check className="w-3.5 h-3.5 text-amber-450" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {previewPage === 'contact' && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-extrabold text-slate-200 uppercase tracking-wide">Test Database Pipeline</p>
                          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850 space-y-3">
                            <p className="text-[9px] text-slate-450 leading-relaxed">
                              Clicking below will inject a simulated contact lead. This verifies the reactive database listener pipeline.
                            </p>
                            
                            <button
                              onClick={() => {
                                submitMockLeadFromPreview();
                                addLog('info', 'Mock Form: Simulated click registered.');
                              }}
                              className={`w-full py-2 px-3 rounded text-[9px] font-black text-white bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 active:scale-95 transition-all shadow-md`}
                            >
                              Submit Simulated Test Lead
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                ) : (
                  <div className="w-full bg-slate-950 rounded-xl border border-slate-850 p-4 relative overflow-hidden flex flex-col h-[480px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Generated Component Code</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getGeneratedCode());
                          setIsCopied(true);
                          addLog('success', 'React component code copied to clipboard.');
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="py-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white transition-all flex items-center space-x-1"
                        title="Copy Code"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-450" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto pr-1">
                      <pre className="text-left font-mono text-[9px] text-indigo-300 whitespace-pre leading-relaxed select-all">
                        {getGeneratedCode()}
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* PANEL 3: LEADS MONITOR & CONSOLE LOGS (Right) */}
            <div className={`lg:col-span-4 bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl text-left flex-col space-y-6 ${activeMobileTab === 'leads' || activeMobileTab === 'logs' ? 'flex' : 'hidden lg:flex'}`}>
              
              {/* Leads manager section container */}
              <div className={`${activeMobileTab === 'leads' ? 'flex flex-col space-y-3 flex-1' : 'hidden lg:flex lg:flex-col lg:space-y-3 lg:flex-1'}`}>
                {/* Lead Manager Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-200">Database Leads Manager</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {leads.length} Active
                  </span>
                </div>

                {/* SVG sparkline analytics chart */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold flex items-center space-x-1">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>7-Day Inquiry Analytics</span>
                    </span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-450 px-1.5 py-0.2 rounded font-bold">
                      +15% Growth
                    </span>
                  </div>
                  
                  {/* SVG Chart Plot */}
                  <svg viewBox="0 0 300 80" className="w-full h-12 text-indigo-400 overflow-visible mt-1">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.45)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    
                    {/* Simulated Path */}
                    <path 
                      d={`M 0,${80 - (leads.length * 2 + 10)} 
                         L 50,${80 - (leads.length * 3 + 20)} 
                         L 100,35 
                         L 150,55 
                         L 200,${80 - (leads.length * 4 + 15)} 
                         L 250,25 
                         L 300,${80 - (leads.length * 5 + 30)}`} 
                      fill="none" 
                      stroke={previewConfig.themeColor === 'indigo' ? '#6366f1' : previewConfig.themeColor === 'violet' ? '#8b5cf6' : previewConfig.themeColor === 'emerald' ? '#10b981' : '#f97316'} 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Gradient Area Fill */}
                    <path 
                      d={`M 0,${80 - (leads.length * 2 + 10)} 
                         L 50,${80 - (leads.length * 3 + 20)} 
                         L 100,35 
                         L 150,55 
                         L 200,${80 - (leads.length * 4 + 15)} 
                         L 250,25 
                         L 300,${80 - (leads.length * 5 + 30)}
                         L 300,80 L 0,80 Z`} 
                      fill="url(#chartGrad)"
                    />
                    
                    <circle cx="100" cy="35" r="3" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
                    <circle cx="250" cy="25" r="3" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
                    <circle cx="300" cy={80 - (leads.length * 5 + 30)} r="4" fill={previewConfig.themeColor === 'indigo' ? '#6366f1' : previewConfig.themeColor === 'violet' ? '#8b5cf6' : previewConfig.themeColor === 'emerald' ? '#10b981' : '#f97316'} />
                  </svg>
                  
                  <div className="flex justify-between text-[8px] text-slate-500 px-1">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Today ({leads.length} leads)</span>
                  </div>
                </div>

                {/* Leads List Container */}
                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 flex-1">
                  {leads.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-650 mx-auto" />
                      <p className="text-xs text-slate-500">No inquiries stored in DB yet.</p>
                      <p className="text-[9px] text-slate-600">Submit a query in the form or preview.</p>
                    </div>
                  ) : (
                    leads.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                          item.status === 'resolved' 
                            ? 'bg-slate-950/40 border-slate-900 text-slate-500' 
                            : 'bg-slate-950 border-slate-850 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate max-w-[120px]">{item.name}</span>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition ${
                                item.status === 'resolved' 
                                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350' 
                                  : 'bg-emerald-950/30 border-emerald-900 text-emerald-400 hover:bg-emerald-900/50'
                              }`}
                              title={item.status === 'resolved' ? 'Mark Unread' : 'Mark Resolved'}
                            >
                              {item.status === 'resolved' ? 'Resolved' : 'Open'}
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteLead(item.id)}
                              className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="font-mono text-[9px] text-slate-500 break-all">{item.email}</p>
                        <p className="bg-slate-900/50 p-2 rounded text-[10px] leading-relaxed border border-slate-900/80">
                          {item.message}
                        </p>
                        
                        <p className="text-[8px] text-slate-500 text-right">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Console log list and CLI terminal */}
              <div className={`${activeMobileTab === 'logs' ? 'flex flex-col space-y-2 flex-1 mt-4' : 'hidden lg:flex lg:flex-col lg:space-y-2 lg:flex-1 lg:border-t lg:border-slate-800 lg:pt-4'}`}>
                <div className="flex items-center justify-between pb-1 shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-300">Live Console Output Logs</span>
                  </div>
                  <button 
                    onClick={() => {
                      setLogs([{ time: new Date().toLocaleTimeString(), type: 'info', msg: 'System logs cleared.' }]);
                    }}
                    className="text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-850 p-3 h-[170px] overflow-y-auto font-mono text-[9px] space-y-1.5 flex-1 max-h-[220px]">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-1.5 leading-tight">
                      <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                      <span className={`${
                        log.type === 'success' 
                          ? 'text-emerald-450' 
                          : log.type === 'warning' 
                            ? 'text-yellow-500' 
                            : log.type === 'error' 
                              ? 'text-rose-500' 
                              : 'text-indigo-300'
                      } shrink-0 uppercase select-none`}>
                        {log.type}:
                      </span>
                      <span className="text-slate-350 whitespace-pre-wrap">{log.msg}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive CLI terminal input prompt */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center bg-slate-950 border border-slate-850 rounded-lg p-1.5 mt-2 shrink-0">
                  <span className="text-[8px] text-slate-500 font-mono select-none px-1">sys@workspace:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type command... (e.g. /help)"
                    className="flex-1 bg-transparent text-[9px] text-slate-200 font-mono focus:outline-none border-none placeholder-slate-600 px-1 py-0.5"
                  />
                  <button type="submit" className="p-1 rounded hover:bg-slate-900 text-indigo-400 transition" title="Execute command">
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER */}
      <footer className={`border-t py-8 px-6 mt-16 transition-colors ${darkMode ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-slate-300 dark:text-slate-200">{previewConfig.siteName}</span>
            <span>© 2026 WebSolution Pro System. All rights reserved.</span>
          </div>

          <div className="flex space-x-6">
            <button onClick={() => setView('landing')} className="hover:text-slate-300">Home</button>
            <button onClick={() => setView('admin')} className="hover:text-slate-300">Developer Tools</button>
            <a href="#contact" className="hover:text-slate-300">Contact Database</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
