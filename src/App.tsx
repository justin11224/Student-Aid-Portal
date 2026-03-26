import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Bell, 
  DollarSign, 
  MessageSquare, 
  Megaphone, 
  Settings, 
  LogOut, 
  Plus, 
  AlertTriangle,
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Mail,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Search,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  Menu,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Users,
  Send,
  X,
  FileText,
  LayoutDashboard,
  Camera,
  Upload,
  Download,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { isSupabaseConfigured, updateSupabaseConfig, supabase } from './lib/supabase';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Role = 'student' | 'faculty' | 'staff' | 'admin';

interface UserData {
  id: string;
  surname: string;
  name: string;
  role: Role;
  status?: 'pending' | 'approved' | 'rejected';
  course?: string;
  yearLevel?: string;
  balance?: number;
  grades?: any[];
  schedule?: any[];
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  profilePic?: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<string>('landing');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regData, setRegData] = useState({ 
    id: '', 
    surname: '', 
    name: '', 
    role: 'student' as Role, 
    course: 'BSIT', 
    yearLevel: '1st Year',
    password: '',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: ''
  });
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [financialAid, setFinancialAid] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: UserData[], announcements: any[], applications: any[] } | null>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchAnnouncements();
      fetchUsers();
      fetchMessages();
      fetchFinancialAid();
      fetchScholarships();
      fetchRecommendations();
      fetchNotifications();
      fetchPolicies();
    }
  }, [user]);

  // Generate ID for registration
  useEffect(() => {
    const generateSequentialId = async () => {
      if (isRegistering && !regData.id) {
        try {
          const year = new Date().getFullYear().toString().slice(-2);
          
          // Fetch the total count of users to determine the next sequence number
          const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

          if (error) throw error;

          const nextNumber = (count || 0) + 1;
          const paddedNumber = nextNumber.toString().padStart(8, '0');
          const generatedId = `SCC-${year}-${paddedNumber}`;
          
          setRegData(prev => ({ ...prev, id: generatedId }));
        } catch (err) {
          console.error('Error generating sequential ID:', err);
          // Fallback to random if count fails
          const year = new Date().getFullYear().toString().slice(-2);
          const random = Math.floor(10000000 + Math.random() * 90000000);
          setRegData(prev => ({ ...prev, id: `SCC-${year}-${random}` }));
        }
      }
    };

    generateSequentialId();
  }, [isRegistering, regData.id]);

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*');
    if (!error && data) {
      setPolicies(data[0] || null);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', user.id)
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', user.id);
    
    fetchNotifications();
  };

  const fetchScholarships = async () => {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*');
    
    if (!error && data) {
      setScholarships(data);
    }
  };

  const fetchRecommendations = async () => {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*');
    
    if (!error && data) {
      setRecommendations(data);
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (!error && data) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const q = query.toLowerCase();
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.id.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    );
    const filteredAnnouncements = announcements.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q)
    );
    const filteredApplications = financialAid.filter(f => 
      f.studentName?.toLowerCase().includes(q) || 
      f.program?.toLowerCase().includes(q) || 
      f.status?.toLowerCase().includes(q)
    );

    setSearchResults({
      users: filteredUsers,
      announcements: filteredAnnouncements,
      applications: filteredApplications
    });
    setView('search');
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`to.eq.${user.id},from.eq.${user.id}`)
      .order('timestamp', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
    }
  };

  const fetchFinancialAid = async () => {
    const { data, error } = await supabase
      .from('financial_aid')
      .select('*');
    
    if (!error && data) {
      setFinancialAid(data);
    }
  };

  const updateFinancialAidStatus = async (id: number, status: string) => {
    await supabase
      .from('financial_aid')
      .update({ status })
      .eq('id', id);
    
    // Create notification for student
    const app = financialAid.find(a => a.id === id);
    if (app) {
      await supabase.from('notifications').insert({
        userId: app.studentId,
        title: "Application Update",
        message: `Your application for ${app.program} has been ${status}`,
        type: status === 'approved' ? 'success' : 'error',
        read: false,
        timestamp: new Date().toISOString()
      });
    }

    fetchFinancialAid();
  };

  const assignFaculty = async (applicationId: number, facultyId: string) => {
    await supabase
      .from('financial_aid')
      .update({ facultyId })
      .eq('id', applicationId);
    
    // Create notification for faculty
    await supabase.from('notifications').insert({
      userId: facultyId,
      title: "New Assignment",
      message: `You have been assigned to review an application.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    });

    fetchFinancialAid();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginId)
        .eq('password', loginPassword)
        .single();

      if (error || !data) {
        setError('Invalid ID or password');
        return;
      }

      if (data.status === 'pending') {
        setError('Your account is pending approval');
        return;
      }

      if (data.status === 'rejected') {
        setError('Your account has been rejected');
        return;
      }

      setUser(data);
      setView('dashboard');
      
      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'LOGIN',
        userId: data.id,
        timestamp: new Date().toISOString(),
        details: `User ${data.id} logged in`
      });

    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Please check your internet.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const newUser = {
        ...regData,
        status: regData.role === 'admin' ? 'approved' : 'pending',
        balance: 0,
        grades: [],
        schedule: []
      };

      const { error } = await supabase
        .from('users')
        .insert(newUser);

      if (error) {
        setError(error.message);
        return;
      }

      const registeredId = regData.id;
      setIsRegistering(false);
      setLoginId(registeredId);
      setLoginPassword(regData.password);
      setError(`Registration successful! Your School ID is: ${registeredId}. Please login once approved. (Much better to screenshot this!)`);
      setView('login');

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'REGISTER',
        userId: registeredId,
        timestamp: new Date().toISOString(),
        details: `New user ${registeredId} registered as ${regData.role}`
      });

      // Reset registration data for next time
      setRegData({ 
        id: '', 
        surname: '', 
        name: '', 
        role: 'student' as Role, 
        course: 'BSIT', 
        yearLevel: '1st Year',
        password: '',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: ''
      });

    } catch (err) {
      console.error('Register error:', err);
      setError('Registration failed. Connection error.');
    }
  };

  const handleLogout = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Logout Confirmation',
      message: 'Are you sure you want to log out of your account? Any unsaved changes may be lost.',
      type: 'warning',
      onConfirm: () => {
        setUser(null);
        setView('landing');
        setLoginId('');
        setLoginPassword('');
        setIsRegistering(false);
        setIsForgotPassword(false);
        setRegData({ 
          id: '', 
          surname: '', 
          name: '', 
          role: 'student' as Role, 
          course: 'BSIT', 
          yearLevel: '1st Year',
          password: '',
          securityQuestion: 'What is your favorite color?',
          securityAnswer: ''
        });
      }
    });
  };

  if (!user && view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} onRegister={() => { setView('login'); setIsRegistering(true); }} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col font-sans">
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-stone-900 font-bold text-xl">
            <Shield className="w-6 h-6" />
            Student Aid Portal
          </button>
        </nav>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-stone-200"
          >
            {error && (
              <div className={cn(
                "p-3 rounded-xl mb-4 text-sm text-center",
                error.includes('successful') ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {error}
              </div>
            )}

            {isForgotPassword ? (
              <ForgotPassword 
                onBack={() => setIsForgotPassword(false)} 
                isDarkMode={isDarkMode} 
                setError={setError}
              />
            ) : !isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1a2b4b]">Welcome Back</h1>
                  <p className="text-stone-500 mt-2">Sign in to Student Aid Portal</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">School ID Number</label>
                  <input 
                    type="text" 
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="SCC-00-00000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
                
                <div className="pt-6 border-t border-stone-100">
                  <p className="text-center text-sm text-stone-500">
                    Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-red-600 font-bold hover:underline">Register here</button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>

                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1a2b4b]">Create Account</h1>
                  <p className="text-stone-500 mt-2">Join the Student Aid Portal</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-6">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Assigned School ID</label>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-black text-red-600">{regData.id || 'Generating...'}</p>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Read Only</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2 italic">Please remember this ID. You will use it to log in once your account is approved. (Much better to screenshot this!)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={regData.name}
                      onChange={(e) => setRegData({...regData, name: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Surname</label>
                    <input 
                      type="text" 
                      value={regData.surname}
                      onChange={(e) => setRegData({...regData, surname: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={regData.password}
                    onChange={(e) => setRegData({...regData, password: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Security Question</label>
                  <select 
                    value={regData.securityQuestion}
                    onChange={(e) => setRegData({...regData, securityQuestion: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none"
                  >
                    <option>What is your favorite color?</option>
                    <option>What was your first pet's name?</option>
                    <option>What is your mother's maiden name?</option>
                    <option>What city were you born in?</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Security Answer</label>
                  <input 
                    type="text" 
                    value={regData.securityAnswer}
                    onChange={(e) => setRegData({...regData, securityAnswer: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="Your answer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                  <select 
                    value={regData.role}
                    onChange={(e) => setRegData({...regData, role: e.target.value as Role})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {regData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Course</label>
                      <select 
                        value={regData.course}
                        onChange={(e) => setRegData({...regData, course: e.target.value})}
                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none"
                      >
                        <option value="BSIT">BSIT</option>
                        <option value="BSBA">BSBA</option>
                        <option value="BSHM">BSHM</option>
                        <option value="BSED">BSED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Year Level</label>
                      <select 
                        value={regData.yearLevel}
                        onChange={(e) => setRegData({...regData, yearLevel: e.target.value})}
                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </>
                )}

                <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                  <UserPlus className="w-5 h-5" />
                  Register
                </button>
                <p className="text-center text-sm text-stone-500 mt-4">
                  Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-red-600 font-bold hover:underline">Login here</button>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex transition-colors duration-300",
      isDarkMode ? "bg-[#0A0A0A] text-white" : "bg-[#F8FAFC] text-slate-900",
      "font-sans"
    )}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 h-screen transition-all duration-300 border-r",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200",
        isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h2 className={cn(
              "font-black tracking-tighter flex items-center gap-3 transition-all",
              isSidebarOpen ? "text-2xl opacity-100" : "text-0 opacity-0"
            )}>
              <Shield className="w-8 h-8 text-red-600 shrink-0" />
              <span className="truncate">PORTAL</span>
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              {isSidebarOpen ? <ArrowLeft className="w-5 h-5" /> : <LogIn className="w-5 h-5 rotate-180" />}
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
            
            {user.role === 'student' && (
              <>
                <NavItem icon={<User />} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Award />} label="Scholarships" active={view === 'scholarships'} onClick={() => setView('scholarships')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Plus />} label="Apply for Aid" active={view === 'finance'} onClick={() => setView('finance')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<FileText />} label="My Applications" active={view === 'applications'} onClick={() => setView('applications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MapPin />} label="Documents" active={view === 'documents'} onClick={() => setView('documents')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Bell />} label="Notifications" active={view === 'notifications'} onClick={() => setView('notifications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MessageSquare />} label="Inquiries" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Shield />} label="Policies & Guide" active={view === 'policies'} onClick={() => setView('policies')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <NavItem icon={<Users />} label="Student Directory" active={view === 'students'} onClick={() => setView('students')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<FileText />} label="Student Applications" active={view === 'applications'} onClick={() => setView('applications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<CheckCircle />} label="Recommendations" active={view === 'recommendations'} onClick={() => setView('recommendations')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Award />} label="Scholarship Info" active={view === 'scholarships'} onClick={() => setView('scholarships')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<TrendingUp />} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MessageSquare />} label="Messages" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Shield />} label="Policies & Guide" active={view === 'policies'} onClick={() => setView('policies')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
              </>
            )}

            {user.role === 'staff' && (
              <>
                <NavItem icon={<FileText />} label="Applications" active={view === 'applications'} onClick={() => setView('applications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MapPin />} label="Documents" active={view === 'documents'} onClick={() => setView('documents')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Award />} label="Scholarships" active={view === 'scholarships'} onClick={() => setView('scholarships')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MessageSquare />} label="Student Inquiries" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<TrendingUp />} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Shield />} label="Policies & Guide" active={view === 'policies'} onClick={() => setView('policies')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavItem icon={<Users />} label="User Accounts" active={view === 'admin'} onClick={() => setView('admin')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Award />} label="Scholarship Programs" active={view === 'programs'} onClick={() => setView('programs')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<FileText />} label="All Applications" active={view === 'applications'} onClick={() => setView('applications')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<MessageSquare />} label="Messages" active={view === 'messages'} onClick={() => setView('messages')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<TrendingUp />} label="Reports & Analytics" active={view === 'reports'} onClick={() => setView('reports')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Megaphone />} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Clock />} label="System Activity" active={view === 'activity'} onClick={() => setView('activity')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
                <NavItem icon={<Shield />} label="Policies & Guide" active={view === 'policies'} onClick={() => setView('policies')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium",
                isDarkMode ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isSidebarOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-red-500",
                isDarkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"
              )}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-8 shrink-0 transition-colors",
          isDarkMode ? "bg-[#0A0A0A] border-white/5" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className={cn(
              "relative w-full group",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything (users, announcements, applications)..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-2xl outline-none border transition-all",
                  isDarkMode 
                    ? "bg-white/5 border-white/10 focus:border-red-600/50" 
                    : "bg-slate-50 border-slate-200 focus:border-red-600 focus:ring-4 focus:ring-red-600/5"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsRead();
                }}
                className={cn(
                  "p-3 rounded-2xl relative transition-all",
                  isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-[#0A0A0A]"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 mt-4 w-80 rounded-[2rem] border shadow-2xl z-50 overflow-hidden",
                      isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
                    )}
                  >
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h3 className="font-black tracking-tight">Notifications</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        {notifications.filter(n => !n.read).length} New
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400 italic">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice().reverse().map((n, i) => (
                          <div key={i} className={cn(
                            "p-4 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors",
                            !n.read && (isDarkMode ? "bg-white/5" : "bg-red-50/30")
                          )}>
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                n.type === 'success' ? "bg-emerald-500" : n.type === 'error' ? "bg-red-500" : "bg-blue-500"
                              )} />
                              <div>
                                <h4 className="text-sm font-black mb-1">{n.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                  {new Date(n.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold truncate max-w-[150px]">{user.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/20 overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name[0]
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              user.role === 'admin' ? <AdminDashboard user={user} isDarkMode={isDarkMode} users={users} financialAid={financialAid} scholarships={scholarships} announcements={announcements} updateFinancialAidStatus={updateFinancialAidStatus} /> :
              user.role === 'faculty' ? <FacultyDashboard user={user} isDarkMode={isDarkMode} financialAid={financialAid} scholarships={scholarships} recommendations={recommendations} fetchRecommendations={fetchRecommendations} users={users} /> :
              user.role === 'staff' ? <StaffDashboard user={user} isDarkMode={isDarkMode} financialAid={financialAid} scholarships={scholarships} announcements={announcements} updateFinancialAidStatus={updateFinancialAidStatus} /> :
              <StudentDashboard user={user} isDarkMode={isDarkMode} setView={setView} announcements={announcements} scholarships={scholarships} financialAid={financialAid} />
            )}
            {view === 'search' && <SearchResults results={searchResults} query={searchQuery} isDarkMode={isDarkMode} />}
            {view === 'profile' && <Profile user={user} setUser={setUser} isDarkMode={isDarkMode} />}
            {view === 'grades' && <Grades user={user} isDarkMode={isDarkMode} />}
            {view === 'schedule' && <Schedule user={user} isDarkMode={isDarkMode} />}
            {view === 'finance' && <FinancialAid user={user} financialAid={financialAid} fetchFinancialAid={fetchFinancialAid} isDarkMode={isDarkMode} />}
            {view === 'messages' && <Messages user={user} messages={messages} fetchMessages={fetchMessages} users={users} isDarkMode={isDarkMode} />}
            {view === 'documents' && <Documents user={user} isDarkMode={isDarkMode} />}
            {view === 'announcements' && <Announcements announcements={announcements} user={user} isDarkMode={isDarkMode} fetchAnnouncements={fetchAnnouncements} setConfirmConfig={setConfirmConfig} />}
            {view === 'admin' && <AdminPanel users={users} fetchUsers={fetchUsers} isDarkMode={isDarkMode} setConfirmConfig={setConfirmConfig} />}
            {view === 'students' && <StudentsView users={users} isDarkMode={isDarkMode} />}
            {view === 'policies' && <PoliciesView policies={policies} isDarkMode={isDarkMode} />}
            {view === 'scholarships' && <ScholarshipsView scholarships={scholarships} user={user} isDarkMode={isDarkMode} setView={setView} />}
            {view === 'programs' && <ScholarshipsView scholarships={scholarships} user={user} isDarkMode={isDarkMode} isAdmin={true} fetchScholarships={fetchScholarships} setView={setView} />}
            {view === 'applications' && <ApplicationsView financialAid={financialAid} user={user} isDarkMode={isDarkMode} updateFinancialAidStatus={updateFinancialAidStatus} users={users} assignFaculty={assignFaculty} />}
            {view === 'reports' && <ReportsView financialAid={financialAid} scholarships={scholarships} isDarkMode={isDarkMode} user={user} />}
            {view === 'activity' && <ActivityView isDarkMode={isDarkMode} />}
            {view === 'recommendations' && <RecommendationsView recommendations={recommendations} user={user} isDarkMode={isDarkMode} fetchRecommendations={fetchRecommendations} users={users} />}
            {view === 'notifications' && <NotificationsView notifications={notifications} isDarkMode={isDarkMode} />}
          </AnimatePresence>
        </main>
      </div>

      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, type, isDarkMode }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[1000]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className={cn(
          "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
          isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
          type === 'danger' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
        )}>
          {type === 'danger' ? <Trash2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4">{title}</h2>
        <p className={cn("mb-8 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
          {message}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className={cn(
              "py-4 rounded-2xl font-bold transition-all",
              isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
            )}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={cn(
              "py-4 rounded-2xl text-white font-black shadow-xl transition-all",
              type === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
            )}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function LandingPage({ onGetStarted, onRegister }: { onGetStarted: () => void, onRegister: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span>Student Aid Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onRegister} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors">
            Get Started
          </button>
          <button onClick={onGetStarted} className="text-stone-600 font-medium hover:text-stone-900">Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-8">
              ST. CECILIA'S <br />
              <span className="text-red-600">COLLEGE</span> - CEBU, <br />
              INC.
            </h1>
            <p className="text-xl text-stone-500 max-w-xl mb-10 leading-relaxed">
              Official Student Aid Portal. Empowering students through 
              seamless financial aid management and academic 
              tracking.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onRegister}
                className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200"
              >
                Register Now
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            {/* Red box removed */}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#F8FBFF] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6">System Summary</h2>
            <p className="text-stone-500 text-lg">Everything you need to manage your academic journey in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<DollarSign className="text-emerald-500" />} 
              title="Financial Aid Management" 
              description="Apply for scholarships, grants, and loans, with real-time status tracking and automated balance updates."
            />
            <FeatureCard 
              icon={<BookOpen className="text-red-500" />} 
              title="Academic Tracking" 
              description="View your grades, calculate your GPA, and monitor your progress across semesters."
            />
            <FeatureCard 
              icon={<BookOpen className="text-amber-500" />} 
              title="Course Catalog" 
              description="Browse available courses across departments like BSIT, BSBA, and more. View prerequisites and credits."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-pink-500" />} 
              title="Internal Messaging" 
              description="Communicate directly with faculty and administration through our secure internal messaging system."
            />
            <FeatureCard 
              icon={<Bell className="text-red-400" />} 
              title="Real-time Notifications" 
              description="Stay updated with instant alerts for application approvals, new grades, and campus announcements."
            />
            <FeatureCard 
              icon={<Shield className="text-emerald-400" />} 
              title="Admin Control" 
              description="Powerful tools for administration to manage users, approve aid, and broadcast campus-wide news."
            />
            <FeatureCard 
              icon={<Shield className="text-stone-400" />} 
              title="Secure Authentication" 
              description="Multi-layered security protocols to ensure your academic and financial data remains private."
            />
            <FeatureCard 
              icon={<Calendar className="text-red-500" />} 
              title="Mobile Responsive" 
              description="Access your portal from any device, anywhere. Optimized for smartphones and tablets."
            />
            <FeatureCard 
              icon={<Shield className="text-amber-600" />} 
              title="Campus Integration" 
              description="Seamlessly connected with university systems for real-time data synchronization."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-6xl font-bold leading-tight mb-16 uppercase tracking-tighter">
              WHY CHOOSE THE <span className="text-red-600">STUDENT AID PORTAL?</span>
            </h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="p-4 bg-red-50 rounded-2xl h-fit"><User className="text-red-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Student-Centric Design</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">Built with the student experience in mind, making complex processes simple and intuitive.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="p-4 bg-amber-50 rounded-2xl h-fit"><Shield className="text-amber-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Instant Processing</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">No more waiting in long lines. Submit applications and get feedback in record time.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="p-4 bg-emerald-50 rounded-2xl h-fit"><MessageSquare className="text-emerald-600 w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-2xl mb-3">Dedicated Support</h4>
                  <p className="text-stone-500 text-lg leading-relaxed">Our team is always ready to help you navigate your financial aid journey.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full"></div>
            <h3 className="text-4xl font-bold mb-8">Ready to start?</h3>
            <p className="text-stone-400 mb-12 text-xl leading-relaxed">Join thousands of students who have already simplified their academic life.</p>
            <button onClick={onRegister} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all">
              Create Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 font-bold opacity-80">
            <Shield className="w-6 h-6 text-red-600" />
            <span>Student Aid Portal</span>
          </div>
          <p className="text-stone-400 text-sm">© 2026 Student Aid Portal. All rights reserved.</p>
          <div className="flex gap-10 text-sm text-stone-400">
            <a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-stone-100 hover:shadow-xl transition-all group">
      <div className="p-4 bg-stone-50 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-stone-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed, isDarkMode }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed?: boolean, isDarkMode?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium relative group",
        active 
          ? (isDarkMode ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-slate-900 text-white shadow-lg shadow-slate-200") 
          : (isDarkMode ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"),
        collapsed && "justify-center"
      )}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 shrink-0" })}
      {!collapsed && <span className="truncate">{label}</span>}
      
      {collapsed && (
        <div className={cn(
          "absolute left-full ml-4 px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap",
          isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
        )}>
          {label}
        </div>
      )}
    </button>
  );
}

function StudentDashboard({ 
  user, 
  isDarkMode, 
  setView, 
  financialAid = [], 
  scholarships = [], 
  announcements = [] 
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  setView: (v: string) => void, 
  financialAid?: any[], 
  scholarships?: any[], 
  announcements?: any[] 
}) {
  const myApplications = financialAid.filter(a => a.studentId === user.id);
  const approvedAid = myApplications.filter(a => a.status === 'approved').reduce((acc, curr) => acc + (parseInt(curr.amount?.replace(/[^0-9]/g, '') || '0')), 0);
  const pendingApps = myApplications.filter(a => a.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Here's your financial aid overview for AY 2024-2025</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText />} label="Applications" value={myApplications.length.toString()} trend="Active" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<CheckCircle />} label="Approved" value={myApplications.filter(a => a.status === 'approved').length.toString()} trend="Disbursement ready" color="emerald" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending" value={pendingApps.toString()} trend="No pending items" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<DollarSign />} label="Aid Received" value={`₱${approvedAid.toLocaleString()}`} trend="Total disbursed" color="blue" isDarkMode={isDarkMode} />
      </div>

      {myApplications.some(a => a.status === 'approved') && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 font-bold text-sm">
          <CheckCircle className="w-5 h-5" />
          <span>Your application has been approved! Disbursement is being processed.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">My Applications</h3>
            <div className="space-y-4">
              {myApplications.length > 0 ? myApplications.map((app, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border flex flex-col gap-4",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black">{app.program}</h4>
                      <p className="text-xs text-slate-400">{app.id.toString().slice(-8)} • {new Date(app.date).toLocaleDateString()}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setView('documents')}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Documents
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 font-bold italic">
                  No active applications found.
                </div>
              )}
              <button 
                onClick={() => setView('finance')}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Apply for More Aid
              </button>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Document Checklist</h3>
              <button 
                onClick={() => setView('documents')}
                className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
              >
                Manage All →
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Valid School ID', status: 'Uploaded', color: 'text-emerald-500', icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Report Card (Grades)', status: 'Uploaded', color: 'text-emerald-500', icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Income Certificate', status: 'Uploaded', color: 'text-emerald-500', icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Barangay Certificate', status: 'Pending', color: 'text-amber-500', icon: <Clock className="w-4 h-4" /> },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={doc.color}>{doc.icon}</span>
                    <span className="font-bold text-sm">{doc.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", doc.color)}>{doc.status}</span>
                    {doc.status === 'Pending' && (
                      <button 
                        onClick={() => setView('documents')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Announcements</h3>
            <div className="space-y-6">
              {announcements.slice(0, 3).map((a, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 group cursor-pointer hover:border-red-600/30 transition-all" onClick={() => setView('announcements')}>
                  <h4 className="font-black text-sm group-hover:text-red-600 transition-colors">{a.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] font-bold text-slate-500">{a.date} • {a.author}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Available Scholarships</h3>
            <div className="space-y-6">
              {scholarships.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => setView('finance')}>
                  <div>
                    <h4 className="font-black text-sm group-hover:text-red-600 transition-colors">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deadline: {s.deadline} • GPA {s.gpa}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-500">{s.amount}</span>
                </div>
              ))}
              <button 
                onClick={() => setView('finance')}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FacultyDashboard({ 
  user, 
  isDarkMode, 
  financialAid = [], 
  scholarships = [], 
  recommendations = [], 
  fetchRecommendations,
  users = []
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  financialAid?: any[], 
  scholarships?: any[], 
  recommendations?: any[], 
  fetchRecommendations: () => void,
  users?: UserData[]
}) {
  const [showRecModal, setShowRecModal] = useState(false);
  const [recData, setRecData] = useState({ studentId: '', studentName: '', content: '' });

  const students = users.filter(u => u.role === 'student');

  const handleRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('recommendations')
      .insert({ 
        ...recData, 
        facultyId: user.id, 
        facultyName: user.name,
        date: new Date().toISOString()
      });
    
    if (!error) {
      setShowRecModal(false);
      setRecData({ studentId: '', studentName: '', content: '' });
      fetchRecommendations();
    }
  };

  const handleStudentSelect = (studentName: string) => {
    const selectedStudent = students.find(s => s.name === studentName);
    if (selectedStudent) {
      setRecData({ ...recData, studentName, studentId: selectedStudent.id });
    } else {
      setRecData({ ...recData, studentName, studentId: '' });
    }
  };

  const myRecommendations = recommendations.filter((r: any) => r.facultyId === user.id);

  const assignedApplications = financialAid.filter(app => app.facultyId === user.id || app.status === 'pending').slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Faculty Dashboard</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage student recommendations and evaluations</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText />} label="Assigned" value={assignedApplications.length.toString()} trend="Pending review" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending Review" value={assignedApplications.filter(a => a.status === 'pending').length.toString()} trend="Action required" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<CheckCircle />} label="Recommended" value={myRecommendations.length.toString()} trend="Completed" color="emerald" isDarkMode={isDarkMode} />
        <StatCard icon={<Users />} label="My Students" value="12" trend="Active list" color="blue" isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-8">Applications Assigned to Me</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {assignedApplications.map((app, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black">{app.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{app.studentId}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Scholarship Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scholarships.map((s, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <h4 className="font-black text-red-600 mb-1">{s.name}</h4>
                  <p className="text-xs text-slate-400 mb-4">{s.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Coverage: {s.coverage}</span>
                    <span className="text-emerald-500">Deadline: {s.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">My Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="font-bold text-sm">{r.studentName}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{r.content}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{new Date(r.date).toLocaleDateString()}</p>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">No recommendations written yet.</p>
              )}
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowRecModal(true)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                Write Recommendations
              </button>
              <button className="w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-black hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm">
                <FileText className="w-5 h-5" />
                View All Assigned
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRecModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-full max-w-lg p-8 rounded-[2.5rem] border shadow-2xl",
              isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black tracking-tight">New Recommendation</h3>
              <button onClick={() => setShowRecModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleRecommendation} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student Name</label>
                <select 
                  value={recData.studentName}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student ID</label>
                <input 
                  type="text" 
                  value={recData.studentId}
                  readOnly
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none transition-all font-bold opacity-70",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Student ID"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Recommendation Content</label>
                <textarea 
                  value={recData.content}
                  onChange={e => setRecData({...recData, content: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold h-32 resize-none",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Write your recommendation here..."
                  required
                />
              </div>
              <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                Submit Recommendation
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function StaffDashboard({ 
  user, 
  isDarkMode, 
  financialAid = [], 
  scholarships = [], 
  announcements = [],
  updateFinancialAidStatus
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  financialAid?: any[], 
  scholarships?: any[], 
  announcements?: any[],
  updateFinancialAidStatus: (id: number, status: string) => void
}) {
  const recentApplications = financialAid.slice(-5).reverse();
  const pendingApps = financialAid.filter(a => a.status === 'pending').length;
  const reviewApps = financialAid.filter(a => a.status === 'review').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Staff Dashboard</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Financial Aid Office • Document & Application Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText />} label="Total Applications" value={financialAid.length.toString()} trend="Active" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending" value={pendingApps.toString()} trend="Action required" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<Search />} label="Under Review" value={reviewApps.toString()} trend="In progress" color="indigo" isDarkMode={isDarkMode} />
        <StatCard icon={<XCircle />} label="Incomplete Docs" value="2" trend="Need follow-up" color="red" isDarkMode={isDarkMode} />
      </div>

      <div className={cn(
        "p-8 rounded-[2.5rem] border transition-all overflow-hidden",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Recent Applications</h3>
          <button className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
          )}>View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">App ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {recentApplications.map((app, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{app.id.toString().slice(-8)}</td>
                  <td className="px-6 py-4 text-sm font-black">{app.studentName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {app.docs === 'Complete' ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          <XCircle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      app.status === 'review' ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {app.status}
                    </span>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'review')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'approved')}
                          className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" /> Application Summary
          </h3>
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-bold italic">
            Chart Visualization Placeholder
          </div>
        </div>
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" /> Recent Inquiries
          </h3>
          <div className="space-y-4">
            {[
              { from: 'John Doe', subject: 'Scholarship Status', time: '2h ago' },
              { from: 'Maria Reyes', subject: 'Document Verification', time: '5h ago' },
            ].map((msg, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm">{msg.from}</h4>
                  <p className="text-xs text-slate-400">{msg.subject}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{msg.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard({ user, announcements, isDarkMode }: { user: UserData, announcements: any[], isDarkMode?: boolean }) {
  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Here's what's happening with your academic profile today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={cn(
            "px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2",
            isDarkMode ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
          )}>
            <Plus className="w-5 h-5" />
            Quick Action
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<DollarSign />} 
          label="Current Balance" 
          value={`₱${user.balance?.toLocaleString() || '0'}`} 
          trend="+12% from last month"
          color="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<BookOpen />} 
          label="GPA" 
          value="3.8" 
          trend="Top 5% of class"
          color="red"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<Calendar />} 
          label="Next Class" 
          value="IT 311" 
          trend="Starts in 45 mins"
          color="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          icon={<Bell />} 
          label="Notifications" 
          value="4" 
          trend="2 urgent alerts"
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Academic Performance</h3>
            <select className={cn(
              "bg-transparent border-none outline-none font-bold text-sm",
              isDarkMode ? "text-slate-400" : "text-slate-500"
            )}>
              <option>This Semester</option>
              <option>Last Semester</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff', 
                    borderRadius: '16px', 
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#dc2626" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6">Recent Announcements</h3>
          <div className="space-y-6">
            {announcements.slice(0, 3).map((a, i) => (
              <div key={i} className="group cursor-pointer">
                <p className={cn(
                  "text-[10px] uppercase tracking-widest font-bold mb-1",
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                )}>{a.date}</p>
                <h4 className="font-bold group-hover:text-red-600 transition-colors">{a.title}</h4>
                <p className={cn(
                  "text-sm line-clamp-2 mt-1",
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                )}>{a.content}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 font-bold text-sm hover:border-red-600 hover:text-red-600 transition-all">
            View All Announcements
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AdminDashboard({ 
  user, 
  isDarkMode, 
  users = [], 
  financialAid = [], 
  scholarships = [], 
  announcements = [],
  updateFinancialAidStatus
}: { 
  user: UserData, 
  isDarkMode?: boolean, 
  users?: UserData[], 
  financialAid?: any[], 
  scholarships?: any[], 
  announcements?: any[],
  updateFinancialAidStatus: (id: number, status: string) => void
}) {
  const barData = [
    { name: 'Nov 8', value: 35 },
    { name: 'Nov 10', value: 52 },
    { name: 'Nov 12', value: 41 },
    { name: 'Nov 14', value: 68 },
    { name: 'Nov 16', value: 80 },
    { name: 'Nov 18', value: 55 },
    { name: 'Nov 20', value: 72 },
    { name: 'Nov 22', value: 90 },
    { name: 'Nov 24', value: 63 },
    { name: 'Nov 26', value: 48 },
    { name: 'Nov 28', value: 75 },
    { name: 'Nov 30', value: 88 },
    { name: 'Dec 2', value: 60 },
    { name: 'Dec 4', value: 95 },
    { name: 'Dec 6', value: 70 },
  ];

  const recentApplications = financialAid.slice(-5).reverse();
  const pendingApps = financialAid.filter(a => a.status === 'pending').length;
  const totalAid = financialAid.reduce((acc, curr) => acc + (parseInt(curr.amount?.replace(/[^0-9]/g, '') || '0')), 0);

  const studentCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const totalUsers = users.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>System-wide overview and management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard icon={<Users />} label="Total Users" value={totalUsers.toString()} trend="+2 this week" color="purple" isDarkMode={isDarkMode} />
        <StatCard icon={<FileText />} label="Applications" value={financialAid.length.toString()} trend={`${pendingApps} pending`} color="blue" isDarkMode={isDarkMode} />
        <StatCard icon={<Award />} label="Programs" value={scholarships.length.toString()} trend="Active" color="amber" isDarkMode={isDarkMode} />
        <StatCard icon={<Clock />} label="Pending Review" value={pendingApps.toString()} trend="Action required" color="indigo" isDarkMode={isDarkMode} />
        <StatCard icon={<CheckCircle />} label="Aid Disbursed" value={`₱${totalAid.toLocaleString()}`} trend="Total this year" color="emerald" isDarkMode={isDarkMode} />
        <StatCard icon={<TrendingUp />} label="System Uptime" value="99.9%" trend="Optimal" color="red" isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-8">Application Trend (Nov 2024)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#fff', borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-8">User Distribution</h3>
          <div className="space-y-6">
            {[
              { label: 'Students', count: studentCount, color: 'bg-blue-500', percent: totalUsers ? (studentCount / totalUsers) * 100 : 0 },
              { label: 'Faculty', count: facultyCount, color: 'bg-emerald-500', percent: totalUsers ? (facultyCount / totalUsers) * 100 : 0 },
              { label: 'Staff', count: staffCount, color: 'bg-amber-500', percent: totalUsers ? (staffCount / totalUsers) * 100 : 0 },
              { label: 'Admins', count: adminCount, color: 'bg-red-500', percent: totalUsers ? (adminCount / totalUsers) * 100 : 0 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{item.label}</span>
                  <span className="text-red-600">{item.count} accounts</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.percent}%` }} 
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className={cn(
              "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
            )}>Manage Users</button>
            <button className={cn(
              "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
            )}>Manage Programs</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Scholarship Impact Report</h3>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={cn("p-6 rounded-3xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Programs</p>
              <p className="text-3xl font-black">{scholarships.length}</p>
            </div>
            <div className={cn("p-6 rounded-3xl", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Disbursement</p>
              <p className="text-3xl font-black">
                ₱{financialAid.filter(a => a.status === 'approved').length > 0 
                  ? Math.round(financialAid.filter(a => a.status === 'approved').reduce((acc, curr) => acc + (parseInt(curr.amount?.replace(/[^0-9]/g, '') || '0')), 0) / financialAid.filter(a => a.status === 'approved').length).toLocaleString()
                  : '0'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-500 mb-2">Applications per Program</p>
            {scholarships.map(s => {
              const count = financialAid.filter(a => a.program === s.name).length;
              const total = financialAid.length || 1;
              const percent = (count / total) * 100;
              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-bold">{count} apps</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {recentApplications.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                    {app.studentName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{app.studentName}</p>
                    <p className="text-xs text-slate-500">{app.program}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{app.amount}</p>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    app.status === 'approved' ? "text-emerald-500" : app.status === 'rejected' ? "text-red-500" : "text-amber-500"
                  )}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(
        "p-8 rounded-[2.5rem] border transition-all overflow-hidden",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Recent Applications</h3>
          <button className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
          )}>View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {recentApplications.map((app, i) => (
                <tr key={i} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{app.id.toString().slice(-8)}</td>
                  <td className="px-6 py-4 text-sm font-black">{app.studentName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">{app.program}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-500">{app.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {app.status}
                    </span>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'approved')}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateFinancialAidStatus(app.id, 'rejected')}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function PoliciesView({ policies, isDarkMode }: { policies: any, isDarkMode: boolean }) {
  if (!policies) return <div className="p-12 text-center font-bold text-slate-400">Loading policies...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-4 text-red-600">Policies & User Guide</h1>
        <p className="text-slate-500 font-medium">Everything you need to know about the Student Aid Portal</p>
      </div>

      <div className="grid gap-6">
        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-50 rounded-2xl">
              <UserPlus className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Registration Policy</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.registration}</p>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Roles & Permissions</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.roles}</p>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">User Guide</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">{policies.guide}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ForgotPassword({ onBack, isDarkMode, setError }: { onBack: () => void, isDarkMode: boolean, setError: (msg: string) => void }) {
  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState('');

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('securityQuestion')
        .eq('id', schoolId)
        .single();

      if (error || !data) {
        setError('User not found');
        return;
      }

      setQuestion(data.securityQuestion || 'No security question set');
      setStep(2);
    } catch (err) {
      setError('Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('securityAnswer')
        .eq('id', schoolId)
        .single();

      if (fetchError || !user) {
        setError('User not found');
        return;
      }

      if (user.securityAnswer !== answer) {
        setError('Incorrect security answer');
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', schoolId);

      if (updateError) {
        setError('Failed to update password');
        return;
      }

      setError('Password reset successful! Please login.');
      onBack();
    } catch (err) {
      setError('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdmin = async () => {
    if (!requestName) return;

    try {
      const { error } = await supabase
        .from('reset_requests')
        .insert({ 
          schoolId, 
          name: requestName, 
          status: 'pending',
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      setError('Request sent to admin. Please wait for approval.');
      setShowRequestModal(false);
      onBack();
    } catch (err) {
      setError('Failed to send request');
    }
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>

      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1a2b4b]">Account Recovery</h1>
        <p className="text-stone-500 mt-3 font-medium">Follow the steps to reset your password</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleGetQuestion} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-black text-stone-700 uppercase tracking-widest">School ID Number</label>
            <input 
              type="text" 
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full p-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold"
              placeholder="SCC-XX-XXXXXXXX"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
          >
            {loading ? 'Searching Account...' : 'Continue Recovery'}
          </button>
          
          <div className="pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-500 text-center mb-4">Forgot your security question?</p>
            <button 
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="w-full py-4 border-2 border-stone-200 text-stone-700 rounded-2xl font-bold hover:bg-stone-50 transition-all"
            >
              Request Admin Reset
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security Question</p>
            <p className="text-xl font-black text-stone-900 leading-tight">{question}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-stone-700 uppercase tracking-widest">Your Answer</label>
            <input 
              type="text" 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold"
              placeholder="Type your answer here"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-black text-stone-700 uppercase tracking-widest">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-stone-700 uppercase tracking-widest">Confirm</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Request Admin Reset Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-stone-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-stone-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <h3 className="text-2xl font-black text-[#1a2b4b] mb-2">Verification Required</h3>
            <p className="text-stone-500 mb-6 font-medium">Please enter your full name as registered in the system to request a password reset from the administrator.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestAdmin}
                  disabled={!requestName.trim()}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, query, isDarkMode }: { results: any, query: string, isDarkMode: boolean }) {
  if (!results) return null;

  const hasResults = results.users.length > 0 || results.announcements.length > 0 || results.applications.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Search Results</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
          Showing results for "<span className="text-red-600 font-bold">{query}</span>"
        </p>
      </header>

      {!hasResults ? (
        <div className="py-20 text-center">
          <div className="inline-block p-6 bg-slate-100 dark:bg-white/5 rounded-full mb-6">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No results found</h3>
          <p className="text-slate-500">Try searching for something else or check your spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users ({results.users.length})
            </h3>
            <div className="space-y-3">
              {results.users.map((u: any) => (
                <div key={u.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold overflow-hidden">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{u.role} • {u.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements ({results.announcements.length})
            </h3>
            <div className="space-y-3">
              {results.announcements.map((a: any) => (
                <div key={a.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-widest">{a.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Applications ({results.applications.length})
            </h3>
            <div className="space-y-3">
              {results.applications.map((app: any) => (
                <div key={app.id} className={cn(
                  "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm">{app.program}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                      app.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{app.studentName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(app.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, color, isDarkMode }: { icon: any, label: string, value: string, trend: string, color: string, isDarkMode?: boolean }) {
  const colors: any = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    red: "bg-red-500/10 text-red-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    indigo: "bg-indigo-500/10 text-indigo-500"
  };

  return (
    <div className={cn(
      "p-6 rounded-[2rem] border transition-all hover:scale-[1.02]",
      isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
    )}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-400")}>{label}</p>
      <h4 className="text-2xl font-black tracking-tight mb-2">{value}</h4>
      <p className="text-[10px] font-bold text-emerald-500">{trend}</p>
    </div>
  );
}

function Profile({ user, setUser, isDarkMode }: { user: UserData, setUser: any, isDarkMode?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    const { data, error } = await supabase
      .from('users')
      .update(formData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (!error && data) {
      setUser(data);
      setEditing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ profilePic: base64String })
          .eq('id', user.id)
          .select()
          .single();
        
        if (!error && data) {
          setUser(data);
        }
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className={cn(
        "rounded-[3rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className={cn("h-48 relative", isDarkMode ? "bg-red-900/20" : "bg-slate-900")}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        </div>
        <div className="px-12 pb-12">
          <div className="relative -mt-16 mb-8 flex items-end justify-between gap-6">
            <div className={cn(
              "w-32 h-32 p-1.5 rounded-[2.5rem] shadow-2xl relative z-10 group cursor-pointer",
              isDarkMode ? "bg-[#111111]" : "bg-white"
            )}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                id="profile-upload"
              />
              <label htmlFor="profile-upload" className="cursor-pointer">
                <div className={cn(
                  "w-full h-full rounded-[2rem] flex items-center justify-center text-4xl font-black overflow-hidden relative",
                  isDarkMode ? "bg-white/5 text-red-500" : "bg-slate-100 text-slate-400"
                )}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.name[0]
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <button 
              onClick={() => editing ? handleUpdate() : setEditing(true)}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all mb-2",
                isDarkMode ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
              )}
            >
              <Edit className="w-5 h-5" />
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">{user.name}</h1>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  user.role === 'admin' ? "bg-red-500/10 text-red-500" : (user.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")
                )}>
                  {user.role}
                </span>
                <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Member since 2024</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">School ID Number</label>
                  <p className="text-xl font-mono font-bold text-red-600">{user.id}</p>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Full Name</label>
                  {editing ? (
                    <input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className={cn(
                        "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      )}
                    />
                  ) : (
                    <p className="text-xl font-bold">{user.name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Surname</label>
                  {editing ? (
                    <input 
                      value={formData.surname} 
                      onChange={e => setFormData({...formData, surname: e.target.value})} 
                      className={cn(
                        "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      )}
                    />
                  ) : (
                    <p className="text-xl font-bold">{user.surname}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Account Status</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="font-bold text-emerald-500">Active Account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Grades({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Academic Records</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Your official grades and academic performance history.</p>
      </header>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Instructor</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Grade</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {user.grades?.map((g, i) => (
                <tr key={i} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6">
                    <p className="font-bold text-lg">{g.subject}</p>
                    <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>Semester 1, 2024</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-xs">
                        {g.instructor.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>{g.instructor}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="font-mono font-black text-xl">{g.grade}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function Schedule({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Class Schedule</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Your personalized weekly academic timetable.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {user.schedule?.map((s, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:scale-[1.01]",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center gap-8">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex flex-col items-center justify-center shrink-0",
                isDarkMode ? "bg-white/5" : "bg-slate-50"
              )}>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{s.day.slice(0, 3)}</span>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-2xl tracking-tight">{s.subject}</h4>
                  <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">Lecture</span>
                </div>
                <p className={cn("font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {s.instructor} • <span className="text-red-600">{s.location}</span>
                </p>
              </div>
            </div>
            <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <p className="font-black text-2xl tracking-tight">{s.time}</p>
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>Live Session</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FinancialAid({ user, financialAid, fetchFinancialAid, isDarkMode }: { user: UserData, financialAid: any[], fetchFinancialAid: any, isDarkMode?: boolean }) {
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({ type: 'Scholarship', amount: '', reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('financial_aid')
      .insert({ 
        program: formData.type, 
        amount: parseFloat(formData.amount), 
        reason: formData.reason, 
        studentId: user.id, 
        studentName: user.name,
        date: new Date().toISOString(),
        status: 'pending'
      });
    
    if (!error) {
      setShowApply(false);
      fetchFinancialAid();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Financial Aid</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage your scholarships, grants, and academic funding.</p>
        </div>
        <button 
          onClick={() => setShowApply(true)}
          className={cn(
            "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black transition-all",
            isDarkMode ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
          )}
        >
          <Plus className="w-5 h-5" />
          New Application
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-1 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]",
          isDarkMode ? "bg-red-600" : "bg-slate-900"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Outstanding Balance</p>
            <h2 className="text-6xl font-black tracking-tighter">₱{user.balance?.toLocaleString()}</h2>
          </div>
          <div className="relative z-10 pt-10 border-t border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/60 font-bold">Next Payment Due</p>
              <p className="text-sm font-black">April 01, 2024</p>
            </div>
            <button className={cn(
              "w-full py-4 rounded-2xl font-black text-sm transition-all",
              isDarkMode ? "bg-white text-red-600 hover:bg-slate-100" : "bg-white text-slate-900 hover:bg-slate-100"
            )}>Pay Now</button>
          </div>
        </div>

        <div className={cn(
          "lg:col-span-2 p-10 rounded-[3rem] border transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-2xl font-black tracking-tight mb-8">Application History</h3>
          <div className="space-y-4">
            {financialAid.filter(f => f.userId === user.id).length > 0 ? (
              financialAid.filter(f => f.userId === user.id).map(f => (
                <div key={f.id} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl transition-all",
                  isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                )}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg">{f.program}</p>
                      <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                        ₱{f.amount} • {new Date(f.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    f.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {f.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold">No applications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApply && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Apply for Aid</h2>
              <button onClick={() => setShowApply(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aid Category</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <option>Scholarship</option>
                  <option>Grant</option>
                  <option>Student Loan</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requested Amount (₱)</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Justification</label>
                <textarea 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all h-32 resize-none",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Explain your financial situation..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowApply(false)} className="flex-1 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Submit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Messages({ user, messages, fetchMessages, users, isDarkMode }: { user: UserData, messages: any[], fetchMessages: any, users: UserData[], isDarkMode?: boolean }) {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [text, setText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !text) return;
    const { error } = await supabase
      .from('messages')
      .insert({ 
        from: user.id, 
        to: selectedUser.id, 
        content: text,
        timestamp: new Date().toISOString()
      });
    
    if (!error) {
      setText('');
      fetchMessages();
    }
  };

  const filteredMessages = messages.filter(m => 
    selectedUser && ((m.from === selectedUser.id && m.to === user.id) || (m.from === user.id && m.to === selectedUser.id))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-12rem)] flex gap-4 md:gap-8">
      <div className={cn(
        "w-full md:w-80 rounded-[2.5rem] border overflow-hidden flex flex-col transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
        <div className={cn("p-6 md:p-8 border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
          <h3 className="text-xl font-black tracking-tight">Contacts</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {users.filter(u => u.id !== user.id).map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-3xl transition-all group",
                selectedUser?.id === u.id 
                  ? (isDarkMode ? "bg-red-600 text-white" : "bg-slate-900 text-white shadow-lg shadow-slate-200") 
                  : (isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 overflow-hidden",
                selectedUser?.id === u.id ? "bg-white/20" : (isDarkMode ? "bg-white/5" : "bg-slate-100")
              )}>
                {u.profilePic ? (
                  <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  u.name[0]
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-bold truncate">{u.name}</p>
                <p className={cn(
                  "text-[10px] uppercase tracking-widest font-black opacity-60",
                  selectedUser?.id === u.id ? "text-white" : (isDarkMode ? "text-slate-400" : "text-slate-500")
                )}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={cn(
        "flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
        !selectedUser ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            <div className={cn("p-6 md:p-8 border-b flex items-center gap-4", isDarkMode ? "border-white/5" : "border-slate-100")}>
              <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center font-black text-red-500 text-xl">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{selectedUser.name}</h3>
                <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Online • {selectedUser.role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {filteredMessages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%] md:max-w-[80%]",
                  m.from === user.id ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-sm font-medium",
                    m.from === user.id 
                      ? (isDarkMode ? "bg-red-600 text-white rounded-tr-none" : "bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-200") 
                      : (isDarkMode ? "bg-white/5 text-slate-300 rounded-tl-none" : "bg-slate-100 text-slate-700 rounded-tl-none")
                  )}>
                    {m.content}
                  </div>
                  <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-widest", isDarkMode ? "text-slate-600" : "text-slate-400")}>
                    {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className={cn("p-6 md:p-8 border-t", isDarkMode ? "border-white/5" : "border-slate-100")}>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className={cn(
                    "flex-1 p-4 md:p-5 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="Type a message..."
                />
                <button type="submit" className={cn(
                  "p-4 md:p-5 rounded-2xl font-black transition-all",
                  isDarkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-900 text-white hover:bg-slate-800"
                )}>
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <MessageSquare className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Select a Contact</h3>
            <p className={cn("max-w-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>Choose a student or faculty member to start a secure conversation.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Documents({ user, isDarkMode }: { user: UserData, isDarkMode?: boolean }) {
  const [docs, setDocs] = useState([
    { id: 1, name: 'School_ID_2024.pdf', type: 'PDF', size: '1.2 MB', date: '2024-11-10', category: 'Identification' },
    { id: 2, name: 'Report_Card_Q1.pdf', type: 'PDF', size: '2.4 MB', date: '2024-11-10', category: 'Academic' },
    { id: 3, name: 'Income_Tax_Return.pdf', type: 'PDF', size: '3.1 MB', date: '2024-11-10', category: 'Financial' },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: new Date().toISOString().split('T')[0],
        category: 'General'
      };
      setDocs([newDoc, ...docs]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My Documents</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage and upload your required documents for scholarship applications.</p>
        </div>
        <label className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2 cursor-pointer">
          <Upload className="w-5 h-5" />
          Upload New
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map(doc => (
          <motion.div 
            key={doc.id}
            whileHover={{ y: -5 }}
            className={cn(
              "p-6 rounded-[2rem] border transition-all group",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-red-500/30" : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isDarkMode ? "bg-white/5" : "bg-slate-50"
              )}>
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-xl text-red-500">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-black text-lg mb-1 truncate">{doc.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{doc.category} • {doc.type}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-bold text-slate-500">{doc.size}</span>
              <span className="text-xs font-bold text-slate-500">{doc.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Announcements({ announcements, user, isDarkMode, fetchAnnouncements, setConfirmConfig }: { announcements: any[], user: UserData, isDarkMode?: boolean, fetchAnnouncements: () => void, setConfirmConfig: any }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', role: 'all' });

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);
        
        if (!error) {
          fetchAnnouncements();
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('announcements')
      .insert({ 
        ...formData, 
        date: new Date().toISOString() 
      });
    
    if (!error) {
      setShowForm(false);
      setFormData({ title: '', content: '', role: 'all' });
      fetchAnnouncements();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Campus Announcements</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Stay updated with the latest news and events from St. Cecilia's College.</p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Close Form' : 'Create New'}
          </button>
        )}
      </header>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            "p-10 rounded-[3rem] border",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Announcement Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className={cn(
                    "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  placeholder="e.g., Final Exams Schedule"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Audience</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className={cn(
                    "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold",
                    isDarkMode ? "bg-[#1A1A1A] border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Content</label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className={cn(
                  "w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold h-40 resize-none",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}
                placeholder="Write the details of your announcement here..."
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Publish Announcement</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {announcements.filter(a => a.role === 'all' || a.role === user.role).map(a => (
          <motion.div 
            key={a.id} 
            whileHover={{ y: -5 }}
            className={cn(
              "p-10 rounded-[3rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-red-500/30" : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200"
            )}
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"
              )}>
                {a.role === 'all' ? 'Everyone' : a.role}
              </span>
              <div className={cn("w-1.5 h-1.5 rounded-full", isDarkMode ? "bg-white/10" : "bg-slate-300")}></div>
              <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                {new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-4">{a.title}</h3>
            <p className={cn("text-lg leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>{a.content}</p>
            <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black">SC</div>
                <span className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>Official Administration</span>
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const StudentsView = ({ users, isDarkMode }: { users: UserData[], isDarkMode: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const students = users.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Student Directory</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Search and view student profiles.</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by name, ID, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
            isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
          )}
        />
      </div>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Course & Year</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {filteredStudents.map(s => (
                <tr key={s.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                        {s.profilePic ? (
                          <img src={s.profilePic} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          s.name[0]
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{s.name} {s.surname}</p>
                        <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold">{s.course}</p>
                    <p className="text-xs text-slate-400">{s.yearLevel}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      s.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

function AdminPanel({ users, fetchUsers, isDarkMode, setConfirmConfig }: { users: UserData[], fetchUsers: any, isDarkMode?: boolean, setConfirmConfig: any }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', surname: '', role: 'student' as Role, password: 'password', securityQuestion: 'What is your favorite color?', securityAnswer: 'blue' });
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'resets' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [approveReset, setApproveReset] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (activeTab === 'resets') {
      fetchResetRequests();
    } else if (activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleApproveUser = async (userId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);
    
    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'USER_APPROVAL',
        details: `${status.toUpperCase()} user ${userId}`,
        timestamp: new Date().toISOString()
      });
      fetchUsers();
    }
  };

  const fetchResetRequests = async () => {
    const { data, error } = await supabase
      .from('reset_requests')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setResetRequests(data);
    }
  };

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setAuditLogs(data);
    }
  };

  const handleApproveReset = async () => {
    if (!newPassword || !approveReset) return;

    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', approveReset.schoolId);

    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'PASSWORD_RESET_ADMIN',
        details: `Reset password for user ${approveReset.schoolId}`,
        timestamp: new Date().toISOString()
      });
      await supabase.from('reset_requests').delete().eq('id', approveReset.id);
      setApproveReset(null);
      setNewPassword('');
      fetchResetRequests();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Generate ID if not provided
    let finalId = formData.id;
    if (!finalId) {
      const year = new Date().getFullYear().toString().slice(-2);
      const random = Math.floor(10000000 + Math.random() * 90000000);
      finalId = `SCC-${year}-${random}`;
    }

    const { error } = await supabase
      .from('users')
      .insert({ ...formData, id: finalId, status: 'approved', balance: 0, grades: [], schedule: [] });
    
    if (!error) {
      await supabase.from('audit_logs').insert({
        userId: 'ADMIN',
        action: 'USER_CREATED',
        details: `Created ${formData.role} account: ${finalId}`,
        timestamp: new Date().toISOString()
      });
      setShowAdd(false);
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate user ${userId}? This action cannot be undone and will remove their access to the system.`,
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (!error) {
          await supabase.from('audit_logs').insert({
            userId: 'ADMIN',
            action: 'USER_DELETED',
            details: `Deleted user ${userId}`,
            timestamp: new Date().toISOString()
          });
          fetchUsers();
        }
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Admin Panel</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Manage accounts and system requests.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'users' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all relative",
              activeTab === 'approvals' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Approvals
            {users.filter(u => u.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]">
                {users.filter(u => u.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('resets')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all relative",
              activeTab === 'resets' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Reset Requests
            {resetRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]">
                {resetRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'logs' 
                ? (isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white")
                : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
            )}
          >
            Audit Logs
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </header>

      {(activeTab === 'users' || activeTab === 'approvals') && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
              isDarkMode ? "bg-white/5 border-white/10 focus:border-red-600/50" : "bg-white border-slate-200 focus:border-red-600"
            )}
          />
        </div>
      )}

      {activeTab === 'users' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {users.filter(u => 
                  u.status !== 'pending' && 
                  (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (u.course && u.course.toLowerCase().includes(searchTerm.toLowerCase())))
                ).map(u => (
                  <tr key={u.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            u.name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{u.name}</p>
                          <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.role === 'admin' ? "bg-red-500/10 text-red-500" : u.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {u.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="p-3 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'approvals' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {users.filter(u => 
                  u.status === 'pending' && 
                  (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (u.course && u.course.toLowerCase().includes(searchTerm.toLowerCase())))
                ).map(u => (
                  <tr key={u.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xl overflow-hidden">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{u.name}</p>
                          <p className={cn("text-xs font-mono", isDarkMode ? "text-red-400" : "text-red-600")}>{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.role === 'admin' ? "bg-red-500/10 text-red-500" : u.role === 'faculty' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleApproveUser(u.id, 'rejected')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveUser(u.id, 'approved')}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400">
                      No pending registrations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'resets' ? (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Requested</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {resetRequests.map(r => (
                  <tr key={r.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6">
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.schoolId}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        r.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => setApproveReset(r)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                        >
                          Reset Password
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {resetRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                      No reset requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={cn(
          "rounded-[2.5rem] border overflow-hidden transition-all",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User ID</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
                {auditLogs.map(log => (
                  <tr key={log.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                    <td className="px-8 py-6 text-xs font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 font-bold text-sm">
                      {log.userId}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                        log.action === 'LOGIN' ? "bg-blue-500/10 text-blue-500" :
                        log.action === 'REGISTER' ? "bg-emerald-500/10 text-emerald-500" :
                        log.action === 'PASSWORD_RESET' ? "bg-red-500/10 text-red-500" :
                        "bg-slate-500/10 text-slate-500"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500">
                      {log.details}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Create Account</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID Number</label>
                  <input 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})} 
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as Role})} 
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Surname</label>
                <input 
                  value={formData.surname} 
                  onChange={e => setFormData({...formData, surname: e.target.value})} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 font-black text-slate-500 hover:text-red-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">Create User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {approveReset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn(
            "p-10 rounded-[3rem] w-full max-w-md shadow-2xl border",
            isDarkMode ? "bg-[#111111] border-white/10 text-white" : "bg-white border-slate-200"
          )}>
            <h2 className="text-3xl font-black tracking-tighter mb-4">Reset Password</h2>
            <p className={cn("mb-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              Enter a new password for <span className="font-bold text-emerald-500">{approveReset.name}</span>.
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-emerald-600 transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setApproveReset(null); setNewPassword(''); }}
                  className={cn(
                    "py-4 rounded-2xl font-bold transition-all",
                    isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApproveReset}
                  className="py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all"
                >
                  Approve Reset
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const ScholarshipsView = ({ scholarships, user, isDarkMode, isAdmin = false, fetchScholarships, setView }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newScholarship, setNewScholarship] = useState({
    name: '',
    description: '',
    criteria: '',
    deadline: '',
    amount: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('scholarships')
        .insert({
          ...newScholarship,
          amount: newScholarship.amount
        });
      
      if (!error) {
        setIsAdding(false);
        setNewScholarship({ name: '', description: '', criteria: '', deadline: '', amount: '' });
        fetchScholarships?.();
      }
    } catch (error) {
      console.error('Error adding scholarship:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Scholarship Programs</h2>
          <p className="text-slate-500">Available financial assistance and academic grants.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Program
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 rounded-[2.5rem] border",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-xl"
          )}
        >
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Program Name</label>
                <input
                  required
                  value={newScholarship.name}
                  onChange={e => setNewScholarship({ ...newScholarship, name: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount/Grant</label>
                <input
                  required
                  value={newScholarship.amount}
                  onChange={e => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <textarea
                required
                value={newScholarship.description}
                onChange={e => setNewScholarship({ ...newScholarship, description: e.target.value })}
                className={cn(
                  "w-full px-6 py-4 rounded-2xl border transition-all outline-none min-h-[100px]",
                  isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Criteria</label>
                <input
                  required
                  value={newScholarship.criteria}
                  onChange={e => setNewScholarship({ ...newScholarship, criteria: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deadline</label>
                <input
                  required
                  type="date"
                  value={newScholarship.deadline}
                  onChange={e => setNewScholarship({ ...newScholarship, deadline: e.target.value })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                Save Program
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scholarships.map((s: any) => (
          <motion.div
            key={s.id}
            whileHover={{ y: -5 }}
            className={cn(
              "p-8 rounded-[2.5rem] border flex flex-col transition-all",
              isDarkMode ? "bg-[#111111] border-white/5 hover:border-white/10" : "bg-white border-slate-200 shadow-sm hover:shadow-xl"
            )}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">{s.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-3">{s.description}</p>
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Grant Amount</span>
                <span className="font-bold text-emerald-500">{s.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Deadline</span>
                <span className="font-bold">{new Date(s.deadline).toLocaleDateString()}</span>
              </div>
              
              {!isAdmin && user.role === 'student' && (
                <button 
                  onClick={() => setView('finance')}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Apply Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ApplicationsView = ({ financialAid, user, isDarkMode, updateFinancialAidStatus, users = [], assignFaculty }: any) => {
  const filteredApplications = user.role === 'student' 
    ? financialAid.filter((a: any) => a.studentId === user.id)
    : financialAid;

  const facultyMembers = users.filter((u: any) => u.role === 'faculty');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">
          {user.role === 'student' ? 'My Applications' : 'All Applications'}
        </h2>
        <p className="text-slate-500">Track and manage financial aid requests.</p>
      </div>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Faculty</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                {(user.role === 'admin' || user.role === 'staff') && (
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {filteredApplications.map((a: any) => (
                <tr key={a.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6">
                    <p className="font-bold">{a.studentName}</p>
                    <p className="text-xs text-slate-400">{a.studentId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium">{a.program}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    {(user.role === 'admin' || user.role === 'staff') ? (
                      <select
                        value={a.facultyId || ''}
                        onChange={(e) => assignFaculty(a.id, e.target.value)}
                        className={cn(
                          "text-xs font-bold p-2 rounded-xl border outline-none",
                          isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <option value="">Unassigned</option>
                        {facultyMembers.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {users.find((u: any) => u.id === a.facultyId)?.name || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      a.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      a.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {a.status}
                    </span>
                  </td>
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <td className="px-8 py-6 text-right">
                      {a.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateFinancialAidStatus(a.id, 'approved')}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateFinancialAidStatus(a.id, 'rejected')}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const ReportsView = ({ financialAid, scholarships, isDarkMode, user }: any) => {
  const isAdmin = user.role === 'admin';
  const isFaculty = user.role === 'faculty';

  const filteredAid = isFaculty 
    ? financialAid.filter((a: any) => a.facultyId === user.id)
    : financialAid;

  const stats = [
    { label: isAdmin ? 'Total Applications' : 'My Assigned Applications', value: filteredAid.length, icon: <FileText className="w-6 h-6" />, color: 'blue' },
    { label: isAdmin ? 'Approved Aid' : 'My Approved Reviews', value: filteredAid.filter((a: any) => a.status === 'approved').length, icon: <CheckCircle className="w-6 h-6" />, color: 'emerald' },
    { label: 'Active Scholarships', value: scholarships.length, icon: <Award className="w-6 h-6" />, color: 'amber' },
    { label: isAdmin ? 'Pending Reviews' : 'My Pending Reviews', value: filteredAid.filter((a: any) => a.status === 'pending').length, icon: <Clock className="w-6 h-6" />, color: 'indigo' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">
          {isAdmin ? 'Admin Reports & Analytics' : 'Faculty Reports & Analytics'}
        </h2>
        <p className="text-slate-500">
          {isAdmin ? 'Overview of global scholarship and financial aid performance.' : 'Overview of your assigned scholarship and financial aid reviews.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
              stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
              stat.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
              "bg-indigo-500/10 text-indigo-500"
            )}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-black tracking-tight mb-6">Application Status Distribution</h3>
          <div className="h-[300px] flex items-end justify-around gap-4 pt-10">
            {['pending', 'approved', 'rejected'].map((status) => {
              const count = filteredAid.filter((a: any) => a.status === status).length;
              const percentage = filteredAid.length > 0 ? (count / filteredAid.length) * 100 : 0;
              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-full relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      className={cn(
                        "w-full rounded-t-2xl transition-all",
                        status === 'pending' ? "bg-amber-500" :
                        status === 'approved' ? "bg-emerald-500" :
                        "bg-red-500"
                      )}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                      {count}
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border",
          isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-black tracking-tight mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {financialAid.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  a.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                  a.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                  "bg-amber-500/10 text-amber-500"
                )}>
                  {a.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : a.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.studentName}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{a.type} - {a.status}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityView = ({ isDarkMode }: any) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        setLogs(data);
      }
    };
    fetchAuditLogs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">System Activity</h2>
        <p className="text-slate-500">Real-time audit logs and security events.</p>
      </div>

      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all",
        isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? "bg-white/5" : "bg-slate-50"}>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User ID</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDarkMode ? "divide-white/5" : "divide-slate-100")}>
              {logs.map((log: any) => (
                <tr key={log.id} className={cn("transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-8 py-6 text-xs font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 font-bold text-sm">
                    {log.userId}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                      log.action === 'LOGIN' ? "bg-blue-500/10 text-blue-500" :
                      log.action === 'REGISTER' ? "bg-emerald-500/10 text-emerald-500" :
                      log.action === 'PASSWORD_RESET' ? "bg-red-500/10 text-red-500" :
                      "bg-slate-500/10 text-slate-500"
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-500">
                    {log.details}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const RecommendationsView = ({ recommendations, user, isDarkMode, fetchRecommendations, users = [] }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRec, setNewRec] = useState({
    studentName: '',
    studentId: '',
    content: ''
  });

  const students = users.filter((u: any) => u.role === 'student');

  const handleStudentSelect = (studentName: string) => {
    const selectedStudent = students.find((s: any) => s.name === studentName);
    if (selectedStudent) {
      setNewRec({ ...newRec, studentName, studentId: selectedStudent.id });
    } else {
      setNewRec({ ...newRec, studentName, studentId: '' });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('recommendations')
        .insert({ 
          ...newRec, 
          facultyId: user.id, 
          facultyName: user.name,
          date: new Date().toISOString()
        });
      
      if (!error) {
        setIsAdding(false);
        setNewRec({ studentName: '', studentId: '', content: '' });
        fetchRecommendations?.();
      }
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  };

  const filteredRecs = user.role === 'faculty' 
    ? recommendations.filter((r: any) => r.facultyId === user.id)
    : recommendations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Faculty Recommendations</h2>
          <p className="text-slate-500">Manage and submit student scholarship recommendations.</p>
        </div>
        {user.role === 'faculty' && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Recommendation
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 rounded-[2.5rem] border",
            isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-xl"
          )}
        >
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student Name</label>
                <select
                  required
                  value={newRec.studentName}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none font-bold",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                >
                  <option value="">Select Student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID</label>
                <input
                  required
                  value={newRec.studentId}
                  readOnly
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border transition-all outline-none font-bold opacity-70",
                    isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                  )}
                  placeholder="Student ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recommendation Content</label>
              <textarea
                required
                value={newRec.content}
                onChange={e => setNewRec({ ...newRec, content: e.target.value })}
                className={cn(
                  "w-full px-6 py-4 rounded-2xl border transition-all outline-none min-h-[150px]",
                  isDarkMode ? "bg-white/5 border-white/10 focus:border-white/20" : "bg-slate-50 border-slate-200 focus:border-slate-900"
                )}
                placeholder="Describe why this student deserves the scholarship..."
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                Submit Recommendation
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredRecs.map((r: any) => (
          <motion.div
            key={r.id}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{r.studentName}</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Student ID: {r.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">Recommended by {r.facultyName}</p>
                <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={cn(
              "p-6 rounded-2xl italic text-slate-500",
              isDarkMode ? "bg-white/5" : "bg-slate-50"
            )}>
              "{r.content}"
            </div>
          </motion.div>
        ))}
        {filteredRecs.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            No recommendations found.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const NotificationsView = ({ notifications, isDarkMode }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-2">Notifications</h2>
        <p className="text-slate-500">Stay updated with the latest activities and alerts.</p>
      </div>

      <div className="space-y-4">
        {notifications.map((n: any) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-6 rounded-3xl border flex items-start gap-6 transition-all",
              isDarkMode ? "bg-[#111111] border-white/5" : "bg-white border-slate-200 shadow-sm",
              !n.read && (isDarkMode ? "border-blue-500/30 bg-blue-500/5" : "border-blue-500/30 bg-blue-50/50")
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              n.type === 'registration' ? "bg-emerald-500/10 text-emerald-500" :
              n.type === 'message' ? "bg-blue-500/10 text-blue-500" :
              "bg-amber-500/10 text-amber-500"
            )}>
              {n.type === 'registration' ? <User className="w-6 h-6" /> :
               n.type === 'message' ? <MessageSquare className="w-6 h-6" /> :
               <Bell className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-500">{n.message}</p>
            </div>
            {!n.read && (
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 shrink-0" />
            )}
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            No notifications yet.
          </div>
        )}
      </div>
    </motion.div>
  );
};
