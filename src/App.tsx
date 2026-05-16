import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { signUp, signIn, signOut, resetPassword, getProfile, createCheckout, openBillingPortal, saveApiKey, getSessions, getUsage, getMetrics, getTraces, streamChat, stopChat } from './lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Key, 
  Zap, 
  History, 
  BarChart3, 
  Layout, 
  Globe, 
  ChevronRight, 
  LogIn, 
  Menu, 
  X, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Activity, 
  Cpu, 
  Settings, 
  LogOut, 
  Plus, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Square,
  Clock,
  Code,
  DollarSign,
  AlertTriangle,
  Github,
  Twitter,
  ChevronDown,
  Search
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { cn } from './lib/utils';

// --- Types ---
type Page = 'landing' | 'signup' | 'login' | 'plan-picker' | 'onboarding' | 'dashboard' | 'about' | 'privacy' | 'terms' | 'contact';
type Tab = 'chat' | 'usage' | 'metrics' | 'traces' | 'activity';
type Plan = 'basic' | 'pro';

// --- Mock Data ---
const USAGE_DATA = [
  { name: 'Mon', cost: 0.12, requests: 12 },
  { name: 'Tue', cost: 0.45, requests: 34 },
  { name: 'Wed', cost: 0.32, requests: 28 },
  { name: 'Thu', cost: 0.89, requests: 56 },
  { name: 'Fri', cost: 0.54, requests: 42 },
  { name: 'Sat', cost: 0.21, requests: 18 },
  { name: 'Sun', cost: 0.15, requests: 14 },
];

const METRIC_DATA = Array.from({ length: 30 }, (_, i) => ({
  value: Math.floor(Math.random() * 40) + 40,
}));

// --- Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const variants = {
    primary: 'bg-cl-accent text-white hover:bg-cl-accent-hover',
    secondary: 'bg-cl-interactive hover:bg-cl-interactive-hover text-cl-text border border-cl-border',
    ghost: 'bg-transparent text-cl-muted hover:text-cl-text transition-colors',
    accent: 'bg-cl-accent/10 border border-cl-accent/20 text-cl-accent hover:bg-cl-accent/20',
    danger: 'bg-red-900/20 text-red-400 border border-red-800/40 hover:bg-red-900/40',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider',
    md: 'px-4 py-2 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <button 
      className={cn(
        'rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) => (
  <div className={cn('bg-cl-surface border border-cl-border rounded-xl p-6', className)}>
    {title && <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-cl-muted">{title}</h3>}
    {children}
  </div>
);

// --- Sub-sections ---

const Header = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between',
      scrolled ? 'bg-cl-bg/80 backdrop-blur-md border-b border-cl-border' : 'bg-transparent'
    )}>
      <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
        <span className="text-xl font-bold tracking-tighter text-cl-text">Claudex</span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <button onClick={() => scrollTo('features')} className="text-sm font-medium text-cl-muted hover:text-cl-text transition-colors">Features</button>
        <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-cl-muted hover:text-cl-text transition-colors">Pricing</button>
        <button className="text-sm font-medium text-cl-muted hover:text-cl-text transition-colors">Docs</button>
      </nav>

      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate('login')} className="text-sm font-medium text-cl-text hover:text-cl-accent transition-colors">Log in</button>
        <Button onClick={() => onNavigate('signup')} size="sm">Get Started</Button>
      </div>
    </header>
  );
};

// --- Page Implementations ---

const LandingPage = ({ onNavigate }: { onNavigate: (page: Page, plan?: Plan) => void }) => {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cl-accent/10 blur-[120px] -z-10 rounded-full" />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Claude Code. <span className="text-cl-accent">From any browser.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-cl-muted max-w-2xl mx-auto mb-10"
        >
          Claudex gives you a full Claude Code interface on any device. Bring your API key. Start coding in seconds.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button onClick={() => onNavigate('signup')} size="lg" className="w-full sm:w-auto">Get Started</Button>
          <Button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" size="lg" className="w-full sm:w-auto">See how it works</Button>
        </motion.div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-cl-muted mb-12">
          <span>Works on iPhone, Android, tablet, laptop — any browser.</span>
        </div >

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative group lg:w-[1000px] mx-auto overflow-hidden rounded-3xl border border-cl-border bg-cl-surface shadow-2xl"
        >
          <img 
            src={`/claudex_dashboard_preview.png`} 
            alt="Dashboard Preview" 
            className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cl-bg to-transparent" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Everything you need. Nothing you don't.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Key, title: 'Bring Your Own Key', text: 'You connect your Anthropic API key. We never store your conversations on our servers. You\'re always in control.' },
            { icon: Zap, title: 'Real-Time Streaming', text: 'Responses stream token by token as Claude generates them. Stop any response mid-stream with one tap.' },
            { icon: History, title: 'Full Session History', text: 'Every conversation is saved and searchable. Pick up any session exactly where you left off, from any device.' },
            { icon: Layout, title: 'Model Switching', text: 'Switch between Haiku, Sonnet, and Opus from a dropdown. No config files, no restarts, no terminal.' },
            { icon: BarChart3, title: 'Cost Dashboard', text: 'See exactly what you\'re spending per message, per day, per session. Token counts, model used, duration — all tracked live.' },
            { icon: Globe, title: 'Works Everywhere', text: 'Phone, tablet, laptop — if it has a browser it runs Claudex. Touch-optimized, responsive, dark theme throughout.' },
          ].map((f, i) => (
            <Card key={i} className="hover:border-cl-accent/50 transition-colors">
              <f.icon className="text-cl-accent mb-4" size={32} />
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-cl-muted">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-cl-surface py-24">
        <div className="px-6 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Up and running in three steps.</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Create your account', text: 'Sign up with your email. Pick a plan. Done in under a minute.' },
              { step: '2', title: 'Add your API key', text: 'Paste your Anthropic API key in onboarding. We encrypt it. You never touch it again.' },
              { step: '3', title: 'Start coding', text: 'Open the chat. Pick your model. Send your first message. Claude responds in real time.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-cl-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                <p className="text-cl-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Simple pricing. No surprises.</h2>
        <p className="text-cl-muted mb-16">You bring your Anthropic API key. We never charge you for tokens.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic */}
          <Card className="flex flex-col text-left">
            <div className="mb-8">
              <h3 className="text-xl font-bold">Basic</h3>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-bold">$7</span>
                <span className="text-cl-muted">/month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-cl-accent" /> 500 messages per month</li>
              <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-cl-accent" /> Haiku model only</li>
              <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-cl-accent" /> 7-day session history</li>
              <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-cl-accent" /> 1 device</li>
            </ul>
            <Button className="w-full" variant="secondary" onClick={() => onNavigate('signup', 'basic')}>Get Started</Button>
          </Card>

          {/* Pro */}
          <Card className="flex flex-col text-left border-cl-accent ring-1 ring-cl-accent relative">
            <div className="absolute top-4 right-4 bg-cl-accent text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Most Popular</div>
            <div className="mb-8">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-cl-muted">/month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-cl-accent" /> Unlimited messages</li>
              <li className="flex items-center gap-2 text-sm"><Check size={18} className="text-cl-accent" /> Haiku, Sonnet, and Opus</li>
              <li className="flex items-center gap-2 text-sm"><Check size={18} className="text-cl-accent" /> 30-day session history</li>
              <li className="flex items-center gap-2 text-sm"><Check size={18} className="text-cl-accent" /> Unlimited devices</li>
              <li className="flex items-center gap-2 text-sm"><Check size={18} className="text-cl-accent" /> Priority queue</li>
              <li className="flex items-center gap-2 text-sm"><Check size={18} className="text-cl-accent" /> Full cost dashboard</li>
            </ul>
            <Button className="w-full" onClick={() => onNavigate('signup', 'pro')}>Get Started</Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-cl-border bg-cl-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold">Claudex</span>
            </div>
            <p className="text-sm text-cl-muted">Claude Code on any device. Bring your API key.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-2 text-sm text-cl-muted">
              <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cl-text transition-colors">Features</button></li>
              <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cl-text transition-colors">Pricing</button></li>
              <li>Docs</li>
              <li>Changelog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm text-cl-muted">
              <li><button onClick={() => onNavigate('about')} className="hover:text-cl-text transition-colors">About</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-cl-text transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-cl-text transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-cl-text transition-colors">Contact</button></li>
            </ul>
          </div>
          <div>
             <button className="mt-10 text-xs text-cl-muted underline hover:text-cl-accent" onClick={() => alert('Bug report triggered')}>Report a Bug</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-sm text-cl-muted">
          © 2025 Claudex. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const StaticPage = ({ title, children, onNavigate }: { title: string; children: React.ReactNode; onNavigate: (page: Page) => void }) => (
  <div className="bg-cl-bg min-h-screen">
    <Header onNavigate={onNavigate} />
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-cl-text">{title}</h1>
      <div className="text-cl-sub-text leading-relaxed">
        {children}
      </div>
    </main>
    <footer className="px-6 py-12 border-t border-cl-border bg-cl-surface text-center">
       <Button variant="ghost" onClick={() => onNavigate('landing')}>Back to Home</Button>
    </footer>
  </div>
);

const AuthLayout = ({ children, title, logo = true }: { children: React.ReactNode; title?: string; logo?: boolean }) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-cl-bg relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-cl-accent/5 blur-[120px] -z-10" />
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="p-8 shadow-2xl border-cl-border/50">
        {logo && (
          <div className="flex flex-col items-center mb-8">
            <span className="text-2xl font-bold tracking-tight text-cl-text">Claudex</span>
          </div>
        )}
        {title && <h2 className="text-2xl font-bold text-center mb-6 tracking-tight text-cl-text">{title}</h2>}
        {children}
      </Card>
    </motion.div>
  </div>
);

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="space-y-1.5 mb-4">
    <label className="text-xs font-semibold text-cl-muted uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <input 
        className="w-full bg-cl-bg border border-cl-border rounded-lg px-4 py-2.5 text-sm outline-hidden focus:border-cl-accent/50 focus:ring-1 focus:ring-cl-accent/30 transition-all"
        {...props}
      />
    </div>
  </div>
);

// --- Dashboard Sub-Views ---

const DashboardSidebar = ({ 
  email, 
  plan, 
  onLogout, 
  onNavigate 
}: { 
  email: string; 
  plan: Plan; 
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}) => (
  <aside className="w-64 bg-cl-surface border-r border-cl-border flex flex-col shrink-0">
    <div className="p-6 flex items-center">
      <span className="text-xl font-bold tracking-tight text-cl-text">Claudex</span>
    </div>
    
    <div className="px-4 mb-6">
      <Button className="w-full py-2.5 bg-cl-interactive border-cl-interactive-hover hover:bg-cl-interactive-hover" variant="secondary" size="md">
        <Plus size={16} /> New Chat
      </Button>
    </div>

    <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
      <div className="text-[10px] uppercase tracking-widest text-cl-muted px-3 mb-2 font-bold">Recent Sessions</div>
      {[
        { name: 'Refactor Auth Middleware', time: '2h ago', active: true },
        { name: 'Optimizing SQL Query for...', time: '3d ago' },
        { name: 'Claude Code Terminal UI', time: '5d ago' },
      ].map((s, i) => (
        <div 
          key={i} 
          className={cn(
            "p-2 rounded-md text-sm border-l-2 transition-all cursor-pointer group",
            s.active 
              ? "bg-cl-interactive border-cl-accent text-cl-text shadow-sm" 
              : "border-transparent text-cl-sub-text hover:bg-cl-interactive hover:text-cl-text"
          )}
        >
          <div className="truncate font-medium">{s.name}</div>
          <div className="text-[10px] text-cl-muted mt-0.5">{s.time}</div>
        </div>
      ))}
    </nav>

    <div className="p-4 mt-auto border-t border-cl-border">
      <button 
        className="w-full py-2 mb-4 text-[11px] font-bold text-cl-accent bg-cl-accent/10 rounded border border-cl-accent/20 hover:bg-cl-accent/20 transition-colors flex items-center justify-center gap-2 uppercase tracking-tight"
        onClick={() => alert('Bug reported!')}
      >
        <AlertTriangle size={12} /> Report Bug
      </button>
      
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-cl-interactive flex items-center justify-center text-[11px] font-bold border border-cl-border">
          {email.split('.')[0].substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-xs font-bold truncate text-cl-text">{email}</div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] px-1.5 rounded-full uppercase font-bold",
              plan === 'pro' ? 'bg-cl-accent text-white' : 'bg-cl-muted/20 text-cl-muted'
            )}>
              {plan}
            </span>
            <span className="text-[10px] text-cl-muted cursor-pointer hover:text-cl-text transition-colors">Settings</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

const Dashboard = ({ user, onLogout }: { user: { email: string, plan: Plan }, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, metrics?: any }[]>([
    { role: 'assistant', content: "I've refactored the middleware to use JWT. Here's the updated implementation using the jose library for high-performance signed tokens." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Refactored auth for project... Switched sessions to JWT successfully.`,
        metrics: { tokens: '4,128 in / 512 out', cost: '$0.0084', model: 'Sonnet 3.5', duration: '1.8s' }
      }]);
    }, 1500);
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'usage', label: 'Usage' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'traces', label: 'Traces' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="h-screen flex bg-cl-bg overflow-hidden text-[#faf9f5]">
      <DashboardSidebar email={user.email} plan={user.plan} onLogout={onLogout} onNavigate={() => {}} />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* HEADER / TAB BAR */}
        <header className="h-14 bg-cl-surface border-b border-cl-border flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-8 h-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-full flex items-center border-b-2 text-sm font-semibold transition-all cursor-pointer relative",
                  activeTab === tab.id 
                    ? "border-cl-accent text-cl-text" 
                    : "border-transparent text-cl-muted hover:text-cl-sub-text"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cl-bg border border-cl-border rounded text-[11px] text-cl-muted font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse" />
              SSE: Connected
            </div>
          </div>
        </header>

        {/* ACTION BAR */}
        <div className="p-3 bg-cl-bg flex items-center justify-between gap-4 border-b border-cl-surface">
          <div className="flex items-center gap-3">
            <select className="bg-cl-surface text-[11px] px-3 py-1.5 rounded border border-cl-border font-medium outline-hidden focus:border-cl-accent">
              <option>Claude 3.5 Sonnet</option>
              <option>Claude 3.5 Haiku</option>
              <option>Claude 3 Opus</option>
            </select>
            <select className="bg-cl-surface text-[11px] px-3 py-1.5 rounded border border-cl-border font-medium outline-hidden">
              <option>Permission: Bypass</option>
              <option>Permission: Default</option>
            </select>
            <select className="bg-cl-surface text-[11px] px-3 py-1.5 rounded border border-cl-border font-medium outline-hidden">
              <option>Effort: Medium</option>
              <option>Effort: High</option>
            </select>
          </div>
          {isTyping && <Button variant="danger" size="sm" className="h-7"><Square size={12} className="fill-current" /> Stop</Button>}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col gap-4", m.role === 'user' ? 'items-end' : 'items-start')}>
                      {m.role === 'user' ? (
                        <div className="max-w-xl bg-cl-accent/10 border border-cl-accent/20 rounded-2xl px-6 py-4 shadow-sm">
                          <p className="text-[15px] leading-relaxed">{m.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-3xl flex gap-4">
                          <div className="shrink-0 w-8 h-8 rounded bg-cl-surface border border-cl-accent/40 flex items-center justify-center shadow-inner">
                            <div className="w-4 h-4 bg-cl-accent rounded-[1px]" />
                          </div>
                          <div className="flex-1">
                            {/* Tool Badges */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-2 px-3 py-1 bg-cl-surface border border-cl-border rounded-full text-[11px] text-cl-sub-text shadow-xs">
                                <Code size={12} className="text-cl-accent" />
                                Analyzing <span className="font-mono opacity-80">src/middleware/auth.ts</span>
                              </div>
                            </div>
                            
                            <div className="text-[15px] leading-relaxed space-y-4">
                              <p>{m.content}</p>
                              {m.content.includes("JWT") && (
                                <div className="bg-cl-surface border border-cl-border rounded-lg overflow-hidden font-mono text-[13px] shadow-lg">
                                  <div className="px-4 py-2 bg-[#23221f] border-b border-cl-border flex justify-between">
                                    <span className="text-cl-muted">auth.ts</span>
                                    <span className="text-cl-accent uppercase text-[10px] font-bold tracking-widest">typescript</span>
                                  </div>
                                  <div className="p-4 text-cl-sub-text space-y-1">
                                    <div className="flex gap-4"><span className="opacity-20 select-none">01</span><span className="text-cl-text">import</span> &#123; jwtVerify &#125; <span className="text-cl-text">from</span> <span className="text-cl-accent">'jose'</span>;</div>
                                    <div className="flex gap-4"><span className="opacity-20 select-none">02</span><span className="text-cl-text">export const</span> auth = <span className="text-cl-text">async</span> (req, res) =&gt; &#123;</div>
                                    <div className="flex gap-4"><span className="opacity-20 select-none">03</span>  <span className="text-cl-text">const</span> token = req.headers[<span className="text-cl-accent">'authorization'</span>];</div>
                                    <div className="flex gap-4"><span className="opacity-20 select-none">04</span>  <span className="text-cl-text">if</span> (!token) <span className="text-cl-text">throw new</span> Error(<span className="text-cl-accent">'Unauthorized'</span>);</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Token Footer */}
                            {m.metrics && (
                              <div className="mt-4 flex items-center gap-4 text-[10px] text-cl-muted font-mono border-t border-cl-surface pt-3">
                                <span>{m.metrics.tokens}</span>
                                <span className="text-cl-accent">{m.metrics.cost}</span>
                                <span>{m.metrics.model}</span>
                                <span>{m.metrics.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-6 shrink-0">
                  <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -top-6 left-2 text-[10px] text-cl-muted font-bold uppercase tracking-wide">
                      <span className="text-cl-accent">312</span> / 500 messages used this month
                    </div>
                    <div className="bg-cl-surface border border-cl-border group-focus-within:border-cl-accent/50 rounded-xl shadow-2xl flex flex-col p-2 transition-all">
                      <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="What are we building next?"
                        className="w-full bg-transparent border-none focus:ring-0 text-cl-text text-[15px] p-2 min-h-[64px] resize-none scrollbar-hide"
                      />
                      <div className="flex items-center justify-between px-2 pb-1">
                        <button className="p-2 hover:bg-cl-interactive rounded-md text-cl-muted transition-colors"><Paperclip size={20} /></button>
                        <Button 
                          onClick={handleSend} 
                          className={cn("px-6 py-1.5 font-bold rounded-lg text-sm transition-all", input.trim() ? "opacity-100" : "opacity-30")}
                          disabled={!input.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'usage' && <motion.div key="usage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 h-full overflow-y-auto overflow-x-hidden"><UsageTabContent /></motion.div>}

            {activeTab === 'metrics' && (
              <motion.div key="metrics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 space-y-8 overflow-y-auto h-full overflow-x-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                  {['Memory Usage', 'CPU Utilization', 'Event Loop Lag', 'Active Sessions'].map((m) => (
                    <Card key={m} className="h-64 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold opacity-60 uppercase tracking-widest">{m}</span>
                        <div className="text-xs font-mono bg-cl-bg px-2 py-1 rounded border border-cl-border">LIVE</div>
                      </div>
                      <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={METRIC_DATA}>
                            <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97757" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d97757" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#d97757" fillOpacity={1} fill="url(#colorVal)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-xs font-mono text-cl-muted">
                         <span>AVG: 56%</span>
                         <span>MAX: 82%</span>
                         <span>MIN: 34%</span>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                    <AlertTriangle className="text-red-500" />
                    <div>
                      <div className="text-sm font-bold uppercase text-red-500">Alert Detected</div>
                      <div className="text-xs text-cl-muted">CPU usage is consistently above 80% for the last 5 minutes.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 overflow-y-auto h-full overflow-x-hidden">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between p-2 border-b border-cl-border">
                    <h2 className="text-lg font-bold">Live Activity Feed</h2>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-cl-accent animate-pulse" />
                       <span className="text-[10px] font-bold text-cl-muted uppercase tracking-widest">Active Connection</span>
                    </div>
                  </div>
                  
                  {[
                    { type: 'Chat started', icon: Plus, model: 'Sonnet', time: 'Just now' },
                    { type: 'Alert triggered', icon: AlertTriangle, model: 'System', time: '2m ago' },
                    { type: 'Chat completed', icon: Check, model: 'Haiku', time: '5m ago' },
                    { type: 'Session indexed', icon: Search, model: 'Global', time: '14m ago' },
                    { type: 'Cleanup completed', icon: Settings, model: 'Worker', time: '1h ago' },
                  ].map((e, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex gap-4 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-cl-surface border border-cl-border flex items-center justify-center group-hover:border-cl-accent transition-colors">
                          <e.icon size={16} className="text-cl-muted group-hover:text-cl-accent" />
                        </div>
                        <div className="w-px h-full bg-cl-border my-2" />
                      </div>
                      <div className="flex-grow pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{e.type}</span>
                          <span className="text-[10px] text-cl-muted font-mono">{e.time}</span>
                        </div>
                        <div className="text-xs text-cl-muted bg-cl-surface/50 p-2 rounded-lg border border-cl-border border-dashed">
                          Details: Model={e.model}, UserID=u_7892, Latency=142ms
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Helper for Usage Tab to maintain consistency
const UsageTabContent = () => (
  <div className="space-y-8 max-w-5xl mx-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Today's Cost", value: '$0.43', detail: '14,200 tokens' },
        { label: "Today's Requests", value: '28', detail: '3.2s avg' },
        { label: "Total Sessions", value: '142', detail: '30% growth' },
        { label: "Credits Rem.", value: '$12.40', detail: 'Auto-refill OFF' },
      ].map((stat, i) => (
        <Card key={i} className="bg-cl-surface/50 border-cl-border/50">
          <div className="text-[10px] text-cl-muted uppercase font-bold tracking-widest mb-1">{stat.label}</div>
          <div className="text-2xl font-bold mb-1 tracking-tight">{stat.value}</div>
          <div className="text-[10px] text-cl-accent font-mono">{stat.detail}</div>
        </Card>
      ))}
    </div>
    
    <Card title="Engagement Metrics">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={USAGE_DATA}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97757" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#d97757" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2926" vertical={false} />
            <XAxis dataKey="name" stroke="#6b6a65" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis stroke="#6b6a65" fontSize={11} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1917', border: '1px solid #2a2926', borderRadius: '8px' }}
              itemStyle={{ color: '#d97757' }}
            />
            <Area type="monotone" dataKey="requests" stroke="#d97757" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </div>
);


// ── Real form components ───────────────────────────────────────

const SignupForm = ({ selectedPlan, onSubmit, onLogin, onNavigate, error, loading }: {
  selectedPlan: Plan | null;
  onSubmit: (email: string, password: string) => void;
  onLogin: () => void;
  onNavigate: (page: Page) => void;
  error: string | null;
  loading: boolean;
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);
  
  // Standard email validation - accepts common email formats
  const isValidEmail = (email: string): boolean => {
    // Simple, permissive validation that accepts standard email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const submit = () => {
    setLocalError(null);
    if (!email || !password) { setLocalError('Email and password are required'); return; }
    if (!isValidEmail(email)) { setLocalError('Please enter a valid email address'); return; }
    if (password !== confirm) { setLocalError('Passwords do not match'); return; }
    if (password.length < 8) { setLocalError('Password must be at least 8 characters'); return; }
    onSubmit(email, password);
  };
  return (
    <>
      {selectedPlan && (
        <div className="mb-6 p-3 rounded-lg bg-cl-accent/10 border border-cl-accent/20 text-center text-xs font-bold text-cl-accent uppercase tracking-wide">
          You're signing up for {selectedPlan} — ${selectedPlan === 'pro' ? '15' : '7'}/month
        </div>
      )}
      {(error || localError) && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">{localError || error}</div>
      )}
      <Input label="Email address" type="text" placeholder="you@example.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
      <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      <Input label="Confirm password" type="password" placeholder="••••••••" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} />
      <Button className="w-full py-3 mt-4" onClick={submit} disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
      <p className="mt-6 text-center text-sm text-cl-muted">
        Already have an account? <button onClick={onLogin} className="text-cl-accent hover:underline font-semibold">Log in</button>
      </p>
      <p className="mt-8 text-[10px] text-center text-cl-muted leading-relaxed">
        By signing up you agree to our <button onClick={() => onNavigate('terms')} className="underline hover:text-cl-accent transition-colors">Terms of Service</button> and <button onClick={() => onNavigate('privacy')} className="underline hover:text-cl-accent transition-colors">Privacy Policy</button>.
      </p>
    </>
  );
};

const LoginForm = ({ onSubmit, onSignup, error, loading }: {
  onSubmit: (email: string, password: string) => void;
  onSignup: () => void;
  error: string | null;
  loading: boolean;
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">{error}</div>
      )}
      <Input label="Email address" type="text" placeholder="you@example.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
      <div className="relative">
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        <button className="absolute top-0 right-0 text-[10px] font-bold text-cl-accent hover:underline uppercase tracking-widest">Forgot password?</button>
      </div>
      <Button className="w-full py-3 mt-4" onClick={() => onSubmit(email, password)} disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</Button>
      <p className="mt-6 text-center text-sm text-cl-muted">
        Don't have an account? <button onClick={onSignup} className="text-cl-accent hover:underline font-semibold">Sign up</button>
      </p>
    </>
  );
};

const OnboardingForm = ({ onSubmit, error, loading }: {
  onSubmit: (apiKey: string) => void;
  error: string | null;
  loading: boolean;
}) => {
  const [apiKey, setApiKey] = React.useState('');
  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">{error}</div>
      )}
      <Input label="Anthropic API Key" type="password" placeholder="sk-ant-..." value={apiKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)} />
      <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-cl-accent hover:underline mb-8 text-center font-bold uppercase tracking-widest">
        Get your API key at console.anthropic.com
      </a>
      <Button className="w-full py-4 text-base" onClick={() => onSubmit(apiKey)} disabled={loading || !apiKey}>
        {loading ? 'Saving...' : <>Start using Claudex <ArrowRight size={20} /></>}
      </Button>
    </>
  );
};

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<{ email: string, plan: Plan } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Restore session on load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        try {
          const profile = await getProfile();
          setUser({ email: profile.email, plan: profile.plan });
          if (!profile.onboarding_complete) {
            setPage('onboarding');
          } else {
            setPage('dashboard');
          }
        } catch {}
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setPage('landing');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navigateTo = (newPage: Page, plan?: Plan) => {
    if (plan) setSelectedPlan(plan);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAuth = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) { setAuthError(error.message); return; }
      // After signup, redirect to Stripe checkout
      if (selectedPlan) {
        try {
          const { url } = await createCheckout(selectedPlan);
          window.location.href = url;
        } catch (e: any) {
          alert('Checkout error: ' + (e?.error || e?.message || JSON.stringify(e)));
        }
      } else {
        setPage('plan-picker');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) { setAuthError(error.message); return; }
      const profile = await getProfile();
      setUser({ email: profile.email, plan: profile.plan });
      if (!profile.onboarding_complete) {
        setPage('onboarding');
      } else {
        setPage('dashboard');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch (e: any) {
      const msg = e?.error || e?.message || JSON.stringify(e);
      console.error('Checkout error details:', e);
      alert('Checkout error: ' + msg + ' | Plan: ' + plan + ' | URL: ' + import.meta.env.VITE_BACKEND_URL + '/api/checkout');
    }
  };

  const handleOnboarding = async (apiKey: string) => {
    setOnboardingError(null);
    setOnboardingLoading(true);
    try {
      await saveApiKey(apiKey);
      const profile = await getProfile();
      setUser({ email: profile.email, plan: profile.plan });
      setPage('dashboard');
    } catch (e: any) {
      setOnboardingError(e?.error || 'Invalid API key');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setPage('landing');
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Header onNavigate={navigateTo} />
            <LandingPage onNavigate={navigateTo} />
          </motion.div>
        )}

        {page === 'signup' && (
          <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthLayout 
              title="Create your account"
              children={
                <SignupForm
                  selectedPlan={selectedPlan}
                  onSubmit={handleAuth}
                  onLogin={() => setPage('login')}
                  onNavigate={navigateTo}
                  error={authError}
                  loading={authLoading}
                />
              }
            />
          </motion.div>
        )}

        {page === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthLayout 
              title="Welcome back"
              children={
                <LoginForm
                  onSubmit={handleLogin}
                  onSignup={() => setPage('signup')}
                  error={authError}
                  loading={authLoading}
                />
              }
            />
          </motion.div>
        )}

        {page === 'plan-picker' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div className="min-h-screen bg-cl-bg pt-20 px-6">
                <h2 className="text-4xl font-bold text-center mb-12">Choose your plan</h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                   <Card className="flex flex-col">
                      <h3 className="text-xl font-bold mb-2">Basic</h3>
                      <div className="text-3xl font-bold mb-6">$7<span className="text-sm font-normal text-cl-muted">/mo</span></div>
                      <ul className="space-y-4 mb-8 flex-grow text-sm text-cl-muted">
                         <li>• 500 messages per month</li>
                         <li>• Haiku model only</li>
                         <li>• 7-day history</li>
                      </ul>
                      <Button variant="secondary" onClick={() => handlePlanSelect('basic')}>Choose Basic</Button>
                   </Card>
                   <Card className="flex flex-col border-cl-accent ring-1 ring-cl-accent">
                      <h3 className="text-xl font-bold mb-2">Pro</h3>
                      <div className="text-3xl font-bold mb-6">$15<span className="text-sm font-normal text-cl-muted">/mo</span></div>
                      <ul className="space-y-4 mb-8 flex-grow text-sm text-cl-muted">
                         <li>• Unlimited messages</li>
                         <li>• All models (Haiku, Sonnet, Opus)</li>
                         <li>• 30-day history</li>
                         <li>• Priority support</li>
                      </ul>
                      <Button onClick={() => handlePlanSelect('pro')}>Choose Pro</Button>
                   </Card>
                </div>
             </div>
          </motion.div>
        )}

        {page === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <AuthLayout logo title="One last thing.">
                <div className="flex items-center justify-center gap-3 mb-8">
                   {[
                     { label: 'Account', active: true },
                     { label: 'Payment', active: true },
                     { label: 'Setup', active: true, current: true },
                   ].map((s, i) => (
                     <React.Fragment key={i}>
                       <div className={cn("w-2 h-2 rounded-full", s.current ? "bg-cl-accent shadow-[0_0_10px_#d97757]" : "bg-cl-border")} />
                       {i < 2 && <div className="w-8 h-px bg-cl-border" />}
                     </React.Fragment>
                   ))}
                </div>
                <p className="text-sm text-cl-muted mb-8 text-center leading-relaxed">
                  Paste your Anthropic API key below. We encrypt it and store it securely. You can update it anytime from settings.
                </p>
                <OnboardingForm
                  onSubmit={handleOnboarding}
                  error={onboardingError}
                  loading={onboardingLoading}
                />
             </AuthLayout>
          </motion.div>
        )}

        {page === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard 
              user={user || { email: 'user@example.com', plan: 'pro' }} 
              onLogout={handleLogout} 
            />
          </motion.div>
        )}

        {page === 'about' && (
          <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StaticPage title="About" onNavigate={navigateTo}>
              <div className="space-y-6">
                <p>Claudex gives developers the power of Claude Code from any browser – no terminal, no SSH, no setup.</p>
                <p>We remove the friction of “doom coding” setups (SSH, tmux, mosh) and replace them with a clean, touch‑optimized web interface. Bring your own Anthropic API key, pick a plan, and start coding from your phone, tablet, or laptop.</p>
                <p>Built on TailClaude and the iii engine, we focus on one thing: making Claude Code accessible everywhere.</p>
              </div>
            </StaticPage>
          </motion.div>
        )}

        {page === 'privacy' && (
          <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StaticPage title="Privacy Policy" onNavigate={navigateTo}>
              <div className="space-y-8 font-sans">
                <p className="text-sm opacity-60">Last updated: May 2026</p>
                <p className="text-lg">We respect your privacy.</p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text border-b border-cl-border pb-2">What we collect:</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li><span className="font-bold text-cl-text">Account info:</span> email, name (if you provide it)</li>
                    <li><span className="font-bold text-cl-text">Billing info:</span> handled by Stripe (we never see your full card details)</li>
                    <li><span className="font-bold text-cl-text">Usage:</span> message counts, session metadata (timestamps, model used)</li>
                    <li><span className="font-bold text-cl-text">Your Anthropic API key:</span> stored encrypted, used only to call Claude on your behalf</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text border-b border-cl-border pb-2">What we do not collect:</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>The content of your conversations with Claude (they go directly from our servers to Anthropic using your key)</li>
                    <li>Your IP address beyond standard server logs (retained for 30 days for security)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text border-b border-cl-border pb-2">Data storage:</h3>
                  <p>Sessions and usage stats are stored in encrypted cloud storage (S3). You can delete your account to remove all data.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text border-b border-cl-border pb-2">Third parties:</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Stripe (payments)</li>
                    <li>Anthropic (AI processing – using your key)</li>
                    <li>Cloud provider (e.g., AWS for hosting)</li>
                  </ul>
                </div>
                
                <p className="pt-8 border-t border-cl-border">Your rights: Export or delete your data by contacting us.</p>
              </div>
            </StaticPage>
          </motion.div>
        )}

        {page === 'terms' && (
          <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StaticPage title="Terms of Service" onNavigate={navigateTo}>
              <div className="space-y-10">
                <p className="text-sm opacity-60">Last updated: May 2026</p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">1. Acceptance</h3>
                  <p>By using Claudex, you agree to these terms.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">2. BYOK (Bring Your Own Key)</h3>
                  <p>You must provide a valid Anthropic API key. You are responsible for all usage and charges from Anthropic. We are not liable for any costs, errors, or output from Claude.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">3. Payments</h3>
                  <p>Subscriptions are monthly, auto‑renewing. No refunds for partial months. You can cancel anytime.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">4. Acceptable Use</h3>
                  <p>Do not use our service for illegal activity, harassment, or to generate harmful content. We reserve the right to suspend accounts that abuse the platform.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">5. Limitations</h3>
                  <p>We provide the service “as is.” No warranty of uninterrupted or error‑free service. Our liability is limited to the amount you paid us in the past 12 months.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">6. Changes</h3>
                  <p>We may update these terms. Continued use means acceptance.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">7. Termination</h3>
                  <p>You can delete your account anytime. We may terminate for violation of these terms.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cl-text">8. Governing Law</h3>
                  <p>Delaware, USA</p>
                </div>
              </div>
            </StaticPage>
          </motion.div>
        )}

        {page === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StaticPage title="Contact" onNavigate={navigateTo}>
              <div className="space-y-12">
                <div className="p-8 bg-cl-surface border border-cl-border rounded-2xl shadow-xl">
                  <div className="text-[10px] font-bold text-cl-muted uppercase tracking-[0.2em] mb-4">Email Support</div>
                  <div className="text-2xl md:text-3xl font-bold text-cl-accent mb-6 select-all">support.claudex@gmail.com</div>
                  <p className="text-sm text-cl-muted">Response time: Within 48 hours (business days)</p>
                </div>
                
                <div className="p-6 border-l-2 border-cl-accent bg-cl-accent/5">
                  <p className="text-cl-sub-text italic leading-relaxed">
                    For urgent billing or security issues, please email us directly with "URGENT" in the subject line.
                  </p>
                </div>
              </div>
            </StaticPage>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
