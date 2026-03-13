import React, { useState, useEffect, ReactNode, FC, useRef } from 'react';
import { 
    ArrowUpRight, ArrowDownLeft, BarChart2, MessageSquare, 
    HandCoins, Landmark, PiggyBank, Award, 
    UserPlus, HelpCircle, ArrowLeft, CheckCircle, ArrowRight,
    Receipt, X, Zap, Briefcase, Droplets, Tv,
    TrendingUp, RefreshCw, Eye, EyeOff, Settings, Sun, Moon, 
    PieChart, Sparkles, CreditCard, Shield, Lock, Copy, Palette,
    LogOut, User, Edit3, Shuffle, AlertCircle,
    Wallet, Activity, History, ArrowDown, Mail, Smartphone, AtSign, ChevronRight, Globe,
    Clock, 
    Camera, Upload, Image as ImageIcon, MoreVertical, Check, DollarSign, Send, Search, Plus,
    QrCode, Nfc, Scan
} from 'lucide-react';
import { ThemeMap, ThemeColor, Transaction, UserProfile, AvatarPreset } from './types';
import { supabase, SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './supabaseClient';
import { uploadAvatar } from './upload';
import { Html5Qrcode } from "html5-qrcode";
import { parsePaymentIntent } from './src/utils/ai';
import { QRCodeCanvas } from 'qrcode.react';

// --- Theme & Color Configuration ---
const themes: ThemeMap = {
    green: { base: '#00d554', bg: 'bg-[#00d554]', text: 'text-[#00d554]', accent: 'accent-[#00d554]' },
    pink: { base: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500', accent: 'accent-pink-500' },
    blue: { base: '#0ea5e9', bg: 'bg-sky-500', text: 'text-sky-500', accent: 'accent-sky-500' },
    purple: { base: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500', accent: 'accent-purple-500' },
    orange: { base: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500', accent: 'accent-orange-500' },
    cyan: { base: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', accent: 'accent-cyan-500' },
};

// --- Helper: Icon Mapping ---
const getIconForCategory = (category: string) => {
    switch (category) {
        case 'send': return <ArrowUpRight size={18} className="text-gray-800 dark:text-white"/>;
        case 'receive': 
        case 'deposit': return <ArrowDownLeft size={18} className="text-gray-800 dark:text-white"/>;
        case 'withdraw': return <ArrowDown size={18} className="text-gray-800 dark:text-white"/>;
        case 'bill': return <Receipt size={18} className="text-gray-800 dark:text-white"/>;
        case 'loan': return <HandCoins size={18} className="text-gray-800 dark:text-white"/>;
        case 'savings': return <PiggyBank size={18} className="text-gray-800 dark:text-white"/>;
        case 'card': return <CreditCard size={18} className="text-gray-800 dark:text-white"/>;
        default: return <Activity size={18} className="text-gray-800 dark:text-white"/>;
    }
};

// --- Helper: Date Formatting ---
const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return 'Just now';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
        return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- Avatar Configuration ---
const AVATAR_CONFIG = {
    skinColors: [
        { name: 'pale', hex: '#ffdbb4', apiValue: 'ffdbb4' },
        { name: 'light', hex: '#edb98a', apiValue: 'edb98a' },
        { name: 'yellow', hex: '#f8d25c', apiValue: 'f8d25c' },
        { name: 'tanned', hex: '#fd9841', apiValue: 'fd9841' },
        { name: 'brown', hex: '#d08b5b', apiValue: 'd08b5b' },
        { name: 'darkBrown', hex: '#ae5d29', apiValue: 'ae5d29' },
        { name: 'black', hex: '#614335', apiValue: '614335' }
    ],
    presets: [
        { id: 1, name: 'Dipper', seed: 'Dipper', style: 'avataaars', color: 'edb98a', gender: 'masculine', fixedHair: 'theCaesarAndSidePart' },
        { id: 2, name: 'Mabel', seed: 'Mabel', style: 'avataaars', color: 'edb98a', gender: 'feminine', fixedHair: 'straightStrand' },
        { id: 3, name: 'Stan', seed: 'Stanley', style: 'avataaars', color: 'd08b5b', gender: 'masculine', fixedHair: 'sides', noBeard: false },
        { id: 4, name: 'Wendy', seed: 'Wendy', style: 'avataaars', color: 'edb98a', gender: 'feminine', fixedHair: 'curvy' },
        { id: 5, name: 'Soos', seed: 'Soos', style: 'avataaars', color: 'edb98a', gender: 'masculine', fixedHair: 'shortFlat' },
        { id: 6, name: 'Ford', seed: 'Stanford', style: 'avataaars', color: 'edb98a', gender: 'masculine', fixedHair: 'theCaesar' },
        { id: 7, name: 'Pacifica', seed: 'Pacifica', style: 'avataaars', color: 'edb98a', gender: 'feminine', fixedHair: 'straight01' },
        { id: 8, name: 'Gideon', seed: 'Gideon', style: 'avataaars', color: 'ffdbb4', gender: 'masculine', fixedHair: 'frizzle' },
        { id: 9, name: 'Robbie', seed: 'Robbie', style: 'avataaars', color: 'edb98a', gender: 'masculine', fixedHair: 'shortWaved' },
        { id: 10, name: 'Candy', seed: 'Candy', style: 'avataaars', color: 'f8d25c', gender: 'feminine', fixedHair: 'bob' },
        { id: 11, name: 'Grenda', seed: 'Grenda', style: 'avataaars', color: 'd08b5b', gender: 'feminine', fixedHair: 'bun' },
        { id: 12, name: 'Bill', seed: 'BillCipher', style: 'avataaars', color: 'f8d25c', gender: 'masculine', fixedHair: 'shavedSides', noBeard: true },
    ] as AvatarPreset[],
    hairStyles: {
        masculine: ['shortFlat', 'theCaesar', 'shortDreads1', 'frizzle', 'shortWaved', 'sides', 'theCaesarAndSidePart', 'shortCurly'],
        feminine: ['bob', 'straight01', 'curly', 'miaWallace', 'frida', 'straightStrand', 'bun', 'longButNotTooLong']
    }
};

// --- Brand Icons ---
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
    </svg>
);

const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.0729 14.6579C15.0975 12.1818 17.1528 10.8711 17.2514 10.8143C16.143 9.20667 14.4178 8.96109 13.823 8.93796C12.3533 8.78854 10.9328 9.80287 10.1901 9.80287C9.43167 9.80287 8.25686 8.94931 7.40328 8.96495C6.30567 8.97964 5.29528 9.59962 4.73359 10.5735C3.56514 12.5995 4.43703 15.6133 5.57718 17.2588C6.13609 18.0628 6.79796 18.9664 7.69765 18.936C8.56843 18.9038 8.89203 18.3756 9.96203 18.3756C11.0166 18.3756 11.3164 18.936 12.2131 18.9038C13.1417 18.8726 13.733 18.077 14.2828 17.275C14.9255 16.3377 15.1953 15.4241 15.2076 15.3805C15.1972 15.3758 13.1362 14.5954 13.1362 12.3295M12.9298 7.37395C13.5283 6.64964 13.9317 5.64509 13.823 4.63672C12.9497 4.67177 11.8941 5.2185 11.2689 5.94689C10.7109 6.59281 10.207 7.61803 10.3348 8.60802C11.3106 8.68378 12.3323 8.09361 12.9298 7.37395Z" />
    </svg>
);

// --- Reusable Components ---
interface ActionButtonProps {
    icon?: ReactNode;
    label: string;
    onClick: () => void;
    large?: boolean;
    accentColor: ThemeColor;
}

const ActionButton: FC<ActionButtonProps> = ({ icon, label, onClick, large = false, accentColor }) => {
    if (large) {
        return (
            <button onClick={onClick} className={`flex-1 ${themes[accentColor].bg} text-black font-bold py-4 rounded-full text-lg hover:opacity-90 transition-opacity`}>
                {label}
            </button>
        );
    }
    return (
        <div className="flex flex-col items-center space-y-2">
            <button onClick={onClick} className="bg-gray-200 dark:bg-[#2c2c2e] text-gray-700 dark:text-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-300 dark:hover:bg-[#3a3a3c] transition-all transform hover:scale-105 focus:outline-none focus:ring-2" style={{'--tw-ring-color': themes[accentColor].base} as React.CSSProperties}>
                {icon}
            </button>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">{label}</p>
        </div>
    );
};

interface TransactionItemProps extends Transaction {
    accentColor: ThemeColor;
    currency: string;
    conversionRate: number;
}

const TransactionItem: FC<TransactionItemProps> = ({ icon, type, date, amount, isCredit, accentColor, currency, conversionRate, fee }) => {
    const symbol = currency === 'USD' ? '$' : 'K';
    const displayedAmount = (currency === 'ZMW' ? parseFloat(amount) * conversionRate : parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2 });
    
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-[#2c2c2e] p-3 rounded-full">{icon}</div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${isCredit ? themes[accentColor].text : 'text-gray-900 dark:text-white'}`}>
                    {isCredit ? '+' : '-'}{symbol}{displayedAmount}
                </p>
                {fee && fee > 0 && (
                     <p className="text-[10px] text-gray-400">Fee: {symbol}{(fee * (currency === 'ZMW' ? conversionRate : 1)).toFixed(2)}</p>
                )}
            </div>
        </div>
    );
};

const ScreenHeader: FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="flex items-center p-4 bg-gray-50 dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-[#3a3a3c] sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2c2c2e] mr-2"><ArrowLeft size={24} className="text-gray-800 dark:text-white" /></button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
    </div>
);

interface TransactionStatusScreenProps {
    status: 'success' | 'failure';
    title: string;
    message: string;
    onDone: () => void;
    accentColor: ThemeColor;
    children?: ReactNode;
}

const TransactionStatusScreen: FC<TransactionStatusScreenProps> = ({ status, title, message, onDone, accentColor, children }) => {
    const isSuccess = status === 'success';
    // Use red for failure
    const bgColor = isSuccess ? themes[accentColor].bg : 'bg-[#ff3b30]';
    
    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center ${bgColor} animate-in fade-in zoom-in duration-300`}>
            {isSuccess 
                ? <CheckCircle size={80} className="text-white mb-6" /> 
                : <X size={80} className="text-white mb-6 border-4 rounded-full p-2" />
            }
            <h2 className="text-3xl font-black mb-2 text-white tracking-tight">{title}</h2>
            <p className="text-white/90 font-medium mb-8 text-lg max-w-xs mx-auto leading-relaxed">{message}</p>
            {children}
            <button 
                onClick={onDone} 
                className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl mt-6"
            >
                {isSuccess ? 'Done' : 'Try Again'}
            </button>
        </div>
    );
};

interface FormInputProps {
    label: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    accentColor: ThemeColor;
    maxLength?: number;
    className?: string;
    step?: string;
    max?: number | string;
    error?: string;
}

const FormInput: FC<FormInputProps> = ({ label, type, value, onChange, placeholder, required, accentColor, maxLength, className = '', step, max, error }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            required={required} 
            maxLength={maxLength} 
            step={step}
            max={max}
            className={`w-full px-4 py-3 bg-white dark:bg-[#1c1c1e] text-black dark:text-white border ${error ? 'border-red-500' : 'border-gray-300 dark:border-[#3a3a3c]'} rounded-lg focus:ring-2 ${className}`}
            style={{'--tw-ring-color': themes[accentColor].base} as React.CSSProperties} 
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// --- Auth Screen (Login/Signup) ---
const AuthScreen: FC<{ onLogin: () => void; accentColor: ThemeColor }> = ({ onLogin, accentColor }) => {
    // States: 'landing', 'login', 'signup-input', 'signup-tag'
    const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup-input' | 'signup-tag'>('landing');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Form States
    const [identifier, setIdentifier] = useState(''); // Phone or Email
    const [password, setPassword] = useState('');
    const [ipayTag, setIpayTag] = useState('');

    const handleSignIn = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: identifier,
                password,
            });
            if (error) throw error;
            if (data.session) {
                onLogin();
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);
        try {
            // Save ipayTag and initial balance to user metadata
            const { data, error } = await supabase.auth.signUp({
                email: identifier,
                password,
                options: { data: { ipayTag, balance: 1250.75 } }
            });
            if (error) throw error;
            
            if (data.user) {
                // Attempt to create profile record for P2P lookups
                // We ignore errors here to not block signup if table is missing/different
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    username: ipayTag,
                    updated_at: new Date().toISOString()
                });
                if (profileError) console.warn('Profile creation failed', profileError);
            }

            if (data.session) {
                // If session exists (e.g. email confirmation disabled), login
                onLogin();
            } else {
                // Email confirmation required - Redirect to Login with Success Message
                setSuccessMsg("Your account has been created. Please check your email and verify your address before logging in.");
                setPassword(''); // Clear password for security/UX
                setAuthMode('login'); 
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const SocialButton: FC<{ icon: ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-black py-3.5 rounded-full font-bold flex items-center justify-center gap-3 transition-colors active:scale-95 shadow-sm">
            {icon}
            <span className="text-sm tracking-wide">{label}</span>
        </button>
    );

    // --- LANDING VIEW ---
    if (authMode === 'landing') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white text-black p-6 overflow-hidden justify-between">
                 {/* Aesthetic Backgrounds */}
                <div className={`absolute top-[-10%] right-[-10%] w-[80%] h-[50%] ${themes[accentColor].bg} rounded-full opacity-5 blur-[100px] animate-pulse`}></div>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[80%] h-[50%] bg-blue-600 rounded-full opacity-5 blur-[100px]`}></div>

                <div className="flex-1 flex flex-col items-center justify-center z-10">
                    <div className="relative mb-8">
                        <div className={`absolute inset-0 ${themes[accentColor].bg} blur-2xl opacity-20`}></div>
                        <Zap size={80} className={`${themes[accentColor].text} relative z-10`} fill="currentColor" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">iPAY</h1>
                    <p className="text-gray-500 font-medium">The future of money is here.</p>
                </div>

                <div className="w-full space-y-4 mb-8 z-10">
                    <button 
                        onClick={() => { setAuthMode('signup-input'); setSuccessMsg(null); setErrorMsg(null); }} 
                        className={`w-full py-4 rounded-full font-black uppercase tracking-widest ${themes[accentColor].bg} text-black shadow-lg shadow-${accentColor}-500/10 hover:brightness-110 active:scale-95 transition-all`}
                    >
                        Sign Up
                    </button>
                    <button 
                        onClick={() => { setAuthMode('login'); setSuccessMsg(null); setErrorMsg(null); }} 
                        className="w-full py-4 rounded-full font-bold bg-black text-white hover:bg-gray-900 active:scale-95 transition-all shadow-lg shadow-black/10"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    // --- LOGIN VIEW ---
    if (authMode === 'login') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white text-black p-6">
                 <button onClick={() => { setAuthMode('landing'); setSuccessMsg(null); setErrorMsg(null); }} className="absolute top-6 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"><ArrowLeft size={24} className="text-black" /></button>
                
                <div className="mt-20 mb-8">
                    <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
                    <p className="text-gray-500">Enter your details to access your account.</p>
                </div>

                <div className="space-y-4">
                     {successMsg && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-center">
                            <p className="text-sm font-bold">{successMsg}</p>
                        </div>
                     )}

                     <div className="space-y-2">
                        <input 
                            type="text" 
                            value={identifier} 
                            onChange={(e) => setIdentifier(e.target.value)} 
                            className={`w-full bg-transparent border-b-2 border-gray-200 focus:border-${accentColor}-500 py-4 text-2xl font-medium placeholder-gray-300 outline-none transition-colors`}
                            placeholder="Email"
                            style={{borderColor: identifier ? themes[accentColor].base : ''}}
                        />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={`w-full bg-transparent border-b-2 border-gray-200 focus:border-${accentColor}-500 py-4 text-2xl font-medium placeholder-gray-300 outline-none transition-colors`}
                            placeholder="Password"
                        />
                     </div>
                     
                    {errorMsg && (
                        <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
                    )}

                    <button 
                        onClick={handleSignIn} 
                        disabled={loading}
                        className={`w-full py-4 rounded-full font-bold ${themes[accentColor].bg} text-black mt-6 hover:opacity-90 transition-opacity shadow-lg shadow-${accentColor}-500/10 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="space-y-3">
                        <SocialButton icon={<GoogleIcon />} label="Continue with Google" onClick={onLogin} />
                        <SocialButton icon={<AppleIcon />} label="Continue with Apple" onClick={onLogin} />
                    </div>
                </div>
            </div>
        );
    }

    // --- SIGN UP: INPUT VIEW ---
    if (authMode === 'signup-input') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white text-black p-6">
                <button onClick={() => { setAuthMode('landing'); setSuccessMsg(null); setErrorMsg(null); }} className="absolute top-6 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"><X size={24} className="text-black" /></button>
                
                <div className="mt-20 mb-8">
                    <h2 className="text-3xl font-black mb-2">Create Account</h2>
                    <p className="text-gray-500">Enter your email and create a password.</p>
                </div>

                <div className="space-y-6">
                    <input 
                        type="text" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        className={`w-full bg-transparent border-b-2 border-gray-200 focus:border-${accentColor}-500 py-4 text-2xl font-medium placeholder-gray-300 outline-none transition-colors`}
                        placeholder="Email"
                        autoFocus
                    />
                    
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className={`w-full bg-transparent border-b-2 border-gray-200 focus:border-${accentColor}-500 py-4 text-2xl font-medium placeholder-gray-300 outline-none transition-colors`}
                        placeholder="Password"
                    />

                    <button 
                        onClick={() => { if(identifier && password) setAuthMode('signup-tag'); }} 
                        disabled={!identifier || !password}
                        className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 ${identifier && password ? themes[accentColor].bg + ' text-black shadow-lg shadow-' + accentColor + '-500/10' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-all`}
                    >
                        Next <ChevronRight size={20} />
                    </button>

                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or sign up with</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                     <div className="space-y-3">
                        <SocialButton icon={<GoogleIcon />} label="Continue with Google" onClick={() => setAuthMode('signup-tag')} />
                        <SocialButton icon={<AppleIcon />} label="Continue with Apple" onClick={() => setAuthMode('signup-tag')} />
                    </div>
                </div>
            </div>
        );
    }

    // --- SIGN UP: TAG CREATION VIEW ---
    if (authMode === 'signup-tag') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white text-black p-6">
                 <button onClick={() => setAuthMode('signup-input')} className="absolute top-6 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"><ArrowLeft size={24} className="text-black" /></button>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-4xl font-black mb-2">Choose your <span className={themes[accentColor].text}>@ipayTag</span></h2>
                        <p className="text-gray-500">Your unique name for getting paid by anyone.</p>
                    </div>

                    <div className="relative">
                        <AtSign className={`absolute left-0 top-1/2 -translate-y-1/2 ${themes[accentColor].text}`} size={32} />
                        <input 
                            type="text" 
                            value={ipayTag} 
                            onChange={(e) => setIpayTag(e.target.value.replace(/\s/g, ''))} 
                            className={`w-full bg-transparent pl-10 border-b-2 border-gray-200 py-4 text-4xl font-bold placeholder-gray-200 outline-none focus:border-${themes[accentColor].base} transition-colors`}
                            placeholder="yourname"
                            autoFocus
                        />
                    </div>
                    {ipayTag.length > 3 && (
                        <div className="mt-4 flex items-center gap-2 text-green-500">
                            <CheckCircle size={16} />
                            <span className="text-sm font-bold">@ipay{ipayTag} is available!</span>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                     {errorMsg && (
                        <p className="text-red-500 text-sm font-medium mb-4 text-center">{errorMsg}</p>
                    )}
                    <button 
                        onClick={handleSignUp} 
                        disabled={loading || ipayTag.length < 3}
                        className={`w-full py-4 rounded-full font-black uppercase tracking-widest ${ipayTag.length >= 3 ? themes[accentColor].bg + ' text-black shadow-lg shadow-' + accentColor + '-500/10' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} transition-all`}
                    >
                        {loading ? 'Creating Account...' : 'Create @ipayTag'}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">By continuing, you agree to our Terms of Service.</p>
                </div>
            </div>
        );
    }

    return null;
}

// --- Profile Editor Screen ---
interface ProfileEditorProps {
    onBack: () => void;
    profile: UserProfile;
    setProfile: (p: UserProfile) => void;
    accentColor: ThemeColor;
}

const ProfileEditorScreen: FC<ProfileEditorProps> = ({ onBack, profile, setProfile, accentColor }) => {
    const [localName, setLocalName] = useState(profile.name);
    const [localGender, setLocalGender] = useState(profile.gender || 'feminine');
    const [localSkin, setLocalSkin] = useState(profile.skinTone || 'edb98a'); 
    const [localSeed, setLocalSeed] = useState(profile.seed || 'Alex');
    const [avatarStyle, setAvatarStyle] = useState(profile.style || 'avataaars'); 
    const [localFixedHair, setLocalFixedHair] = useState<string | null>(profile.fixedHair || null);
    const [localNoBeard, setLocalNoBeard] = useState(profile.noBeard || false);
    
    // Image Upload State
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const randomize = () => { setLocalSeed(Math.random().toString(36).substring(7)); setLocalFixedHair(null); setLocalNoBeard(false); setLocalAvatarUrl(undefined); };
    
    const handleSave = () => {
        setProfile({ 
            ...profile, 
            name: localName, 
            gender: localGender, 
            skinTone: localSkin, 
            seed: localSeed, 
            style: avatarStyle, 
            fixedHair: localFixedHair, 
            noBeard: localNoBeard,
            avatarUrl: localAvatarUrl
        });
        onBack();
    };

    const getAvatarUrl = (seed?: string, skin?: string, style?: string, gender?: 'masculine' | 'feminine', fixedHair?: string | null, noBeard?: boolean) => {
        // 1. If arguments are provided (e.g. for preset list), generate URL based on them.
        if (seed) {
            const currentStyle = style || 'avataaars';
            let url = `https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${seed}`;
            if (currentStyle === 'micah') { 
                url += `&backgroundColor=b6e3f4,c0aede,d1d4f9`; 
            } else {
                let hair = fixedHair;
                if (!hair) {
                     const hairList = gender === 'masculine' ? AVATAR_CONFIG.hairStyles.masculine : AVATAR_CONFIG.hairStyles.feminine;
                     const hairIndex = Math.floor(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % hairList.length);
                     hair = hairList[hairIndex];
                }
                if (!hair) hair = 'longHairBob';
                url += `&skinColor=${skin}&top=${hair}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                if (gender === 'feminine' || noBeard) { url += `&facialHairProbability=0`; }
            }
            return url;
        }

        // 2. If no arguments (main preview), prioritize uploaded image.
        if (localAvatarUrl) return localAvatarUrl;

        // 3. Fallback to current local state configuration.
        const currentSeed = localSeed;
        const currentSkin = localSkin;
        const currentStyle = avatarStyle;
        const currentGender = localGender;
        const currentFixedHair = localFixedHair;
        const currentNoBeard = localNoBeard;

        let url = `https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${currentSeed}`;
        if (currentStyle === 'micah') { url += `&backgroundColor=b6e3f4,c0aede,d1d4f9`; } 
        else {
            let hair = currentFixedHair;
            if (!hair) {
                 const hairList = currentGender === 'masculine' ? AVATAR_CONFIG.hairStyles.masculine : AVATAR_CONFIG.hairStyles.feminine;
                 const hairIndex = Math.floor(currentSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % hairList.length);
                 hair = hairList[hairIndex];
            }
            if (!hair) hair = 'longHairBob';
            url += `&skinColor=${currentSkin}&top=${hair}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            if (currentGender === 'feminine' || currentNoBeard) { url += `&facialHairProbability=0`; }
        }
        return url;
    };

    const applyPreset = (preset: AvatarPreset) => {
        setLocalSeed(preset.seed); setAvatarStyle(preset.style); setLocalSkin(preset.color); setLocalGender(preset.gender); 
        setLocalFixedHair(preset.fixedHair || null); setLocalNoBeard(preset.noBeard || false);
        setLocalAvatarUrl(undefined); // Reset upload if preset selected
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        
        try {
            // Optimistic preview
            const objectUrl = URL.createObjectURL(file);
            setLocalAvatarUrl(objectUrl);

            // Get User ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");
            const userId = user.id;

            const { url } = await uploadAvatar({
                fileBlobOrBase64: file,
                userId,
                filename: file.name
            });

            // Success
            setLocalAvatarUrl(url);

        } catch (error) {
            console.error("Error handling file upload:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="Edit Profile" onBack={onBack} />
            <div className="flex-grow p-6 overflow-y-auto space-y-8 no-scrollbar">
                <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full border-4 border-white dark:border-[#333] shadow-2xl overflow-hidden bg-gray-200 mb-4 relative group">
                        <img 
                            src={getAvatarUrl()} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${localName}`; }} 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button onClick={randomize} className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors" title="Randomize Avatar">
                                <Shuffle size={24} />
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors" title="Upload Photo">
                                {uploading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={24} />}
                            </button>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-2">
                        <Upload size={16}/> Upload Photo
                    </button>
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">Choose your Character</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {AVATAR_CONFIG.presets.map(preset => (
                            <button key={preset.id} onClick={() => applyPreset(preset)} className={`flex flex-col items-center gap-2 flex-shrink-0 transition-transform ${localSeed === preset.seed && !localAvatarUrl ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}>
                                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${localSeed === preset.seed && !localAvatarUrl ? `border-${accentColor}-500 shadow-lg` : 'border-transparent'}`} style={{borderColor: localSeed === preset.seed && !localAvatarUrl ? themes[accentColor].base : 'transparent'}}>
                                    <img src={getAvatarUrl(preset.seed, preset.color, preset.style, preset.gender, preset.fixedHair, preset.noBeard)} alt={preset.name} className="w-full h-full object-cover"/>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gamertag / Name</label>
                    <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] text-black dark:text-white p-4 rounded-xl text-lg font-bold border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2" style={{'--tw-ring-color': themes[accentColor].base} as React.CSSProperties} />
                </div>
                <button onClick={handleSave} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest ${themes[accentColor].bg} text-black shadow-lg active:scale-95 transition-all mt-4`}>Save Changes</button>
            </div>
        </div>
    );
};

// --- Virtual Card Screen ---
interface VirtualCardScreenProps {
    onBack: () => void;
    accentColor: ThemeColor;
    clientName: string;
    cardSkin: { background: string; pattern: string | null; id: string };
    onSaveSkin: (skin: { background: string; pattern: string | null; id: string }) => void;
}

const VirtualCardScreen: FC<VirtualCardScreenProps> = ({ onBack, accentColor, clientName, cardSkin, onSaveSkin }) => {
    const [isFrozen, setIsFrozen] = useState(false);
    const [showNumber, setShowNumber] = useState(false);
    
    // Local state for previewing skins before saving
    const [previewSkin, setPreviewSkin] = useState(cardSkin);
    
    const [isFlipped, setIsFlipped] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const cardNumber = "4829 1029 4819 2938";

    // Update preview when prop changes (initial load)
    useEffect(() => {
        setPreviewSkin(cardSkin);
    }, [cardSkin]);

    const generateRandomSkin = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', 
            '#000000', '#1c1c1e', '#ffffff', '#2dd4bf', '#a3e635', '#fbbf24', '#60a5fa', '#818cf8', '#c084fc'
        ];
        
        const patterns = [
            null, // None
            `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h2v2H1V1zm4 4h2v2H5V5zm4 4h2v2H9V9zm4 4h2v2h-2v-2zm4 4h2v2h-2v-2z' fill='%23ffffff10' fill-rule='evenodd'/%3E%3C/svg%3E")`, // Dots
            `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff10' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`, // Stripes
            `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff15' font-family='monospace' font-weight='bold' font-size='14'%3E$%3C/text%3E%3C/svg%3E")`, // Dollar Signs
            `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='%23ffffff10'/%3E%3C/svg%3E")`, // Diamonds
            `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17l-5-5h10l-5 5z' fill='%23ffffff10'/%3E%3C/svg%3E")`, // Triangles
            `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff10'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, // Circles
            `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff10'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` // Waves
        ];

        // 20% Chance for "Lightning Dollar" (Orange/Black + Dollar Pattern)
        if (Math.random() < 0.2) {
             setPreviewSkin({
                background: `linear-gradient(135deg, #f97316 0%, #000000 100%)`,
                pattern: patterns[3], // Dollar
                id: 'lightning-dollar'
            });
            return;
        }

        // 15% Chance for "Matrix" (Black/Green + Dots)
        if (Math.random() < 0.15) {
             setPreviewSkin({
                background: `linear-gradient(180deg, #000000 0%, #064e3b 100%)`,
                pattern: patterns[1], // Dots
                id: 'matrix'
            });
            return;
        }
        
        // 15% Chance for "Cyberpunk" (Pink/Cyan + Stripes)
        if (Math.random() < 0.15) {
             setPreviewSkin({
                background: `linear-gradient(45deg, #ec4899 0%, #06b6d4 100%)`,
                pattern: patterns[2], // Stripes
                id: 'cyberpunk'
            });
            return;
        }

        const c1 = colors[Math.floor(Math.random() * colors.length)];
        const c2 = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.floor(Math.random() * 360);
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        setPreviewSkin({
            background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
            pattern: pattern,
            id: 'random-' + Date.now()
        });
    };

    const handleSave = () => {
        onSaveSkin(previewSkin);
        setShowSettings(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black relative">
            <ScreenHeader title="Virtual Card" onBack={onBack} />
            <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
                <div className="w-full aspect-[1.586/1] mb-8 cursor-pointer group perspective-1000" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-700`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        {/* Front */}
                        <div className={`absolute w-full h-full rounded-2xl p-6 text-white shadow-2xl ${isFrozen ? 'grayscale' : ''} overflow-hidden`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: previewSkin.background }}>
                            {previewSkin.pattern && <div className="absolute inset-0 opacity-50" style={{ backgroundImage: previewSkin.pattern }}></div>}
                            <div className="relative z-10 flex justify-between items-start mb-8"><Landmark size={32} className="opacity-80" /><span className="font-bold italic text-xl opacity-80">VISA</span></div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between"><p className="font-mono text-xl tracking-widest text-shadow">{showNumber ? cardNumber : "**** **** **** " + cardNumber.slice(-4)}</p><button onClick={(e) => { e.stopPropagation(); setShowNumber(!showNumber); }} className="opacity-70 hover:opacity-100 p-2">{showNumber ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div>
                                <div className="flex justify-between items-end"><div><p className="text-xs opacity-70 uppercase mb-1">Card Holder</p><p className="font-medium tracking-wide uppercase">{clientName}</p></div><div><p className="text-xs opacity-70 uppercase mb-1">Expires</p><p className="font-medium">12/28</p></div></div>
                            </div>
                        </div>
                        {/* Back */}
                        <div className={`absolute w-full h-full rounded-2xl p-6 text-white shadow-2xl ${isFrozen ? 'grayscale' : ''} overflow-hidden`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: previewSkin.background }}>
                            {previewSkin.pattern && <div className="absolute inset-0 opacity-50" style={{ backgroundImage: previewSkin.pattern }}></div>}
                            <div className="relative z-10">
                                <div className="bg-black h-10 w-[calc(100%+3rem)] -mx-6 mb-6 mt-4 opacity-80"></div>
                                <div className="flex items-center justify-between mb-4"><div className="text-xs opacity-70 uppercase">Authorized Signature</div><div className="bg-white text-black px-3 py-1 font-mono font-bold text-lg rounded shadow-inner transform -rotate-1">482</div></div>
                                <div className="absolute bottom-6 right-6 opacity-50"><Landmark size={24} /></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button onClick={() => setIsFrozen(!isFrozen)} className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors shadow-sm"><div className={`p-3 rounded-full ${isFrozen ? 'bg-red-100 text-red-500' : 'bg-gray-100 dark:bg-[#2c2c2e] text-gray-600 dark:text-gray-300'}`}>{isFrozen ? <Lock size={24} /> : <Shield size={24} />}</div><span className="text-xs font-bold text-gray-700 dark:text-gray-300">{isFrozen ? 'Unfreeze' : 'Freeze'}</span></button>
                    <button className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors shadow-sm"><div className="bg-gray-100 dark:bg-[#2c2c2e] p-3 rounded-full text-gray-600 dark:text-gray-300"><Copy size={24} /></div><span className="text-xs font-bold text-gray-700 dark:text-gray-300">Copy Info</span></button>
                     <button onClick={() => setShowSettings(true)} className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors shadow-sm"><div className="bg-gray-100 dark:bg-[#2c2c2e] p-3 rounded-full text-gray-600 dark:text-gray-300"><Palette size={24} /></div><span className="text-xs font-bold text-gray-700 dark:text-gray-300">Skin</span></button>
                </div>
            </div>
            {showSettings && (
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
                    <div className="bg-white dark:bg-[#1c1c1e] w-full p-6 rounded-t-3xl border-t border-gray-200 dark:border-[#333] transform transition-transform duration-300 ease-out" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6"><div className="flex items-center space-x-2"><Sparkles className={`${themes[accentColor].text}`} size={20} /><h3 className="text-xl font-bold text-gray-800 dark:text-white">Card Skins</h3></div><button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full"><X size={20} className="text-gray-600 dark:text-gray-300" /></button></div>
                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {(Object.keys(themes) as ThemeColor[]).map(color => (
                                <button key={color} onClick={() => setPreviewSkin({ background: `linear-gradient(135deg, ${themes[color].base} 0%, #000000 100%)`, pattern: null, id: color })} className={`w-14 h-14 rounded-full ${themes[color].bg} border-4 transition-transform transform hover:scale-110 active:scale-95 flex items-center justify-center ${previewSkin.id === color ? 'border-white dark:border-gray-400 scale-110 shadow-lg' : 'border-transparent'}`}>{previewSkin.id === color && <CheckCircle size={20} className="text-black/50" />}</button>
                            ))}
                            <button onClick={generateRandomSkin} className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#2c2c2e] border-4 border-transparent flex items-center justify-center hover:scale-110 transition-transform hover:bg-gray-200 dark:hover:bg-[#3a3a3c]" title="Randomize">
                                <Shuffle size={24} className="text-black dark:text-white" />
                            </button>
                        </div>
                        <button onClick={handleSave} className={`w-full py-4 rounded-xl font-bold text-black ${themes[accentColor].bg} shadow-lg active:scale-95 transition-transform`}>Save Aesthetic</button>
                    </div>
                </div>
            )}
        </div>
    )
};

// --- Client Screens ---
interface SendMoneyScreenProps {
    onBack: () => void;
    addTransaction: (tx: Transaction, fee?: number) => void;
    balanceUSD: number;
    accentColor: ThemeColor;
    currency: string;
    conversionRate: number;
}

const SendMoneyScreen: FC<SendMoneyScreenProps> = ({ onBack, addTransaction, balanceUSD, accentColor, currency, conversionRate }) => {
    const [status, setStatus] = useState<'success' | 'failure' | null>(null);
    const [sendMethod, setSendMethod] = useState<'phone' | 'tag' | 'nfc' | 'qr'>('phone');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');

    // Fee Logic: 0.5% Charge for P2P
    const FEE_PERCENT = 0.005;

    const handleScanResult = async (decodedText: string) => {
        setIsScanning(false);
        
        // Local Parsing for App QR Codes
        if (decodedText.startsWith('ipay:')) {
            const recipient = decodedText.replace('ipay:', '');
            setRecipient(recipient);
            return;
        }

        // AI Parsing Fallback
        try {
            const result = await parsePaymentIntent(decodedText);
            if (result.recipient) {
                setRecipient(result.recipient);
            }
            if (result.amount) {
                setAmount(result.amount.toString());
            }
            if (result.error) {
                setScanError("Could not understand the scanned data.");
            }
        } catch (error) {
             console.error("AI Parsing failed", error);
             // Fallback: just use the raw text if it looks like a phone/username
             if (decodedText.length < 20) {
                 setRecipient(decodedText);
             } else {
                 setScanError("Could not process QR code.");
             }
        }
    };

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        
        if (isScanning && sendMethod === 'qr') {
             // Small delay to ensure DOM element exists
             setTimeout(() => {
                 if (document.getElementById('qr-reader-send')) {
                     scanner = new Html5Qrcode("qr-reader-send");
                     scanner.start(
                         { facingMode: "environment" },
                         { fps: 10, qrbox: 250 },
                         (text) => {
                             handleScanResult(text);
                             scanner?.stop().catch(console.error);
                             scanner?.clear();
                         },
                         (err) => {
                             // ignore errors for better UX
                         }
                     ).catch(err => {
                         console.error("Error starting scanner:", err);
                         setScanError("Camera permission denied or error starting camera.");
                     });
                 }
             }, 100);
        }

        if (isScanning && sendMethod === 'nfc') {
            if ('NDEFReader' in window) {
                // @ts-ignore
                const ndef = new NDEFReader();
                ndef.scan().then(() => {
                    ndef.onreading = (event: any) => {
                        const decoder = new TextDecoder();
                        for (const record of event.message.records) {
                            const text = decoder.decode(record.data);
                            handleScanResult(text);
                        }
                    };
                }).catch((err: any) => {
                    console.error("NFC Error:", err);
                    setScanError("NFC not supported or permission denied.");
                });
            } else {
                setScanError("NFC not supported on this device.");
            }
        }

        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => scanner?.clear()).catch(console.error);
            }
        };
    }, [isScanning, sendMethod]);

    const handleSend = (e: React.FormEvent) => { 
        e.preventDefault(); 
        let amountNum = parseFloat(amount);
        if (recipient && amountNum > 0) { 
            const amountUSD = currency === 'ZMW' ? amountNum / conversionRate : amountNum;
            const feeUSD = amountUSD * FEE_PERCENT;
            const totalDeduction = amountUSD + feeUSD;

            if (totalDeduction > balanceUSD) { 
                setStatus('failure');
            } else { 
                // We pass the fee so the main dashboard can deduct it properly
                addTransaction({ 
                    icon: <ArrowUpRight size={18} className="text-gray-800 dark:text-white"/>, 
                    type: `Sent to ${recipient}`, 
                    date: 'Just now', 
                    amount: amountUSD.toFixed(2), 
                    isCredit: false,
                    fee: feeUSD,
                    category: 'send'
                }, feeUSD); // Pass fee to deduction logic
                setStatus('success');
            }
        } 
    };

    const handleScan = () => {
        setIsScanning(true);
        setScanError('');
    };

    const resetAndBack = () => { setStatus(null); onBack(); };
    if (status) {
        const symbol = currency === 'USD' ? '$' : 'K';
        const displayedAmount = parseFloat(amount).toFixed(2);
        return <div className="flex flex-col h-full bg-gray-50 dark:bg-black"><ScreenHeader title="Send Money" onBack={resetAndBack} /><TransactionStatusScreen status={status} title={status === 'success' ? 'Success!' : 'Transaction Failed'} message={status === 'success' ? `You have successfully sent ${symbol}${displayedAmount} to ${recipient}.` : 'Amount + Fee exceeds your available balance.'} onDone={resetAndBack} accentColor={accentColor} /></div>;
    }
    
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
            <ScreenHeader title="Send Money" onBack={onBack} />
            
            {/* Method Toggle */}
            <div className="px-6 pt-4">
                <div className="flex bg-gray-200 dark:bg-[#1c1c1e] p-1 rounded-xl">
                    <button onClick={() => { setSendMethod('phone'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${sendMethod === 'phone' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <Smartphone size={20} />
                    </button>
                    <button onClick={() => { setSendMethod('tag'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${sendMethod === 'tag' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <AtSign size={20} />
                    </button>
                    <button onClick={() => { setSendMethod('nfc'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${sendMethod === 'nfc' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <Nfc size={20} />
                    </button>
                    <button onClick={() => { setSendMethod('qr'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${sendMethod === 'qr' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <QrCode size={20} />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">
                    {sendMethod === 'phone' && 'Send to Phone Number'}
                    {sendMethod === 'tag' && 'Send to iPayTag'}
                    {sendMethod === 'nfc' && 'Tap to Pay (NFC)'}
                    {sendMethod === 'qr' && 'Scan QR Code'}
                </p>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-6 flex-grow">
                {sendMethod === 'phone' && (
                    <FormInput label="Recipient's Phone" type="tel" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="+260 9..." required accentColor={accentColor} />
                )}
                
                {sendMethod === 'tag' && (
                    <FormInput label="Recipient's iPayTag" type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="@username" required accentColor={accentColor} />
                )}

                {(sendMethod === 'nfc' || sendMethod === 'qr') && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#333] min-h-[300px]">
                        {isScanning ? (
                            sendMethod === 'qr' ? (
                                <div id="qr-reader-send" className="w-full max-w-xs"></div>
                            ) : (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full ${themes[accentColor].bg} flex items-center justify-center mb-4`}>
                                        <Nfc size={32} className="animate-spin" />
                                    </div>
                                    <p className="text-sm font-bold">Listening for NFC...</p>
                                    <p className="text-xs text-gray-500 mt-2">Bring device close</p>
                                </div>
                            )
                        ) : recipient ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                                    <CheckCircle size={32} />
                                </div>
                                <p className="text-sm font-bold text-green-600">Recipient Found</p>
                                <p className="text-xs text-gray-500">{recipient}</p>
                                <button type="button" onClick={() => setRecipient('')} className="text-xs text-red-500 mt-2 underline">Clear</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <button type="button" onClick={handleScan} className="flex flex-col items-center group">
                                    <div className={`w-20 h-20 rounded-full bg-white dark:bg-[#2c2c2e] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4`}>
                                        {sendMethod === 'nfc' ? <Nfc size={40} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" /> : <QrCode size={40} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" />}
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 group-hover:text-black dark:group-hover:text-white">Tap to Scan</p>
                                </button>
                                {scanError && <p className="text-xs text-red-500 mt-4">{scanError}</p>}
                            </div>
                        )}
                    </div>
                )}

                <FormInput label={`Amount (${currency === 'USD' ? '$' : 'K'})`} type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required accentColor={accentColor} />
                
                <div className="pt-4">
                    <p className="text-xs text-gray-500 mb-2 text-center">Transaction Fee: 0.5%</p>
                    <button type="submit" disabled={!recipient || !amount} className={`w-full ${themes[accentColor].bg} text-black font-bold py-3 px-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}>Send Money</button>
                </div>
            </form>
        </div>
    );
};

const ClientWithdrawScreen: FC<{ onBack: () => void; accentColor: ThemeColor; currency: string; addTransaction: any; balanceUSD: number; conversionRate: number }> = ({ onBack, accentColor, currency, addTransaction, balanceUSD, conversionRate }) => {
    const [status, setStatus] = useState<'success' | 'failure' | null>(null);
    const [withdrawMethod, setWithdrawMethod] = useState<'agent' | 'nfc' | 'qr' | 'phone'>('agent');
    const [amount, setAmount] = useState('');
    const [target, setTarget] = useState(''); // Agent ID, Phone, etc.
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    
    // Fee Logic: 5% Charge for Withdrawal
    const FEE_PERCENT = 0.05;

    const handleScanResult = async (decodedText: string) => {
        setIsScanning(false);
        
        // Local Parsing for App QR Codes
        if (decodedText.startsWith('ipay:')) {
            const recipient = decodedText.replace('ipay:', '');
            setTarget(recipient);
            return;
        }

        // AI Parsing Fallback
        try {
            const result = await parsePaymentIntent(decodedText);
            if (result.recipient) {
                setTarget(result.recipient);
            }
            if (result.amount) {
                setAmount(result.amount.toString());
            }
            if (result.error) {
                setScanError("Could not understand the scanned data.");
            }
        } catch (error) {
             console.error("AI Parsing failed", error);
             // Fallback
             if (decodedText.length < 20) {
                 setTarget(decodedText);
             } else {
                 setScanError("Could not process QR code.");
             }
        }
    };

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        
        if (isScanning && withdrawMethod === 'qr') {
             // Small delay to ensure DOM element exists
             setTimeout(() => {
                 if (document.getElementById('qr-reader-withdraw')) {
                     scanner = new Html5Qrcode("qr-reader-withdraw");
                     scanner.start(
                         { facingMode: "environment" },
                         { fps: 10, qrbox: 250 },
                         (text) => {
                             handleScanResult(text);
                             scanner?.stop().catch(console.error);
                             scanner?.clear();
                         },
                         (err) => {
                             // ignore errors
                         }
                     ).catch(err => {
                         console.error("Error starting scanner:", err);
                         setScanError("Camera permission denied or error starting camera.");
                     });
                 }
             }, 100);
        }

        if (isScanning && withdrawMethod === 'nfc') {
            if ('NDEFReader' in window) {
                // @ts-ignore
                const ndef = new NDEFReader();
                ndef.scan().then(() => {
                    ndef.onreading = (event: any) => {
                        const decoder = new TextDecoder();
                        for (const record of event.message.records) {
                            const text = decoder.decode(record.data);
                            handleScanResult(text);
                        }
                    };
                }).catch((err: any) => {
                    console.error("NFC Error:", err);
                    setScanError("NFC not supported or permission denied.");
                });
            } else {
                setScanError("NFC not supported on this device.");
            }
        }

        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => scanner?.clear()).catch(console.error);
            }
        };
    }, [isScanning, withdrawMethod]);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        let amountNum = parseFloat(amount);
        
        if (amountNum > 0) {
            const amountUSD = currency === 'ZMW' ? amountNum / conversionRate : amountNum;
            const feeUSD = amountUSD * FEE_PERCENT;
            const totalDeduction = amountUSD + feeUSD;

            if (totalDeduction > balanceUSD) {
                setStatus('failure');
            } else {
                 addTransaction({
                    icon: <ArrowDown size={18} className="text-gray-800 dark:text-white" />,
                    type: "Cash Withdrawal",
                    date: 'Just now',
                    amount: amountUSD.toFixed(2),
                    isCredit: false,
                    fee: feeUSD,
                    category: 'withdraw'
                 }, feeUSD);
                 setStatus('success');
            }
        }
    };

    const handleScan = () => {
        setIsScanning(true);
        setScanError('');
    };

    const resetAndBack = () => { setStatus(null); onBack(); };

    if (status) {
         return (
             <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
                 <ScreenHeader title="Withdraw" onBack={resetAndBack} />
                 <TransactionStatusScreen 
                    status={status} 
                    title={status === 'success' ? 'Success!' : 'Insufficient Funds'} 
                    message={status === 'success' ? `You have withdrawn ${currency === 'USD' ? '$' : 'K'}${parseFloat(amount).toFixed(2)}.` : 'Your balance cannot cover the withdrawal + 5% fee.'} 
                    onDone={resetAndBack} 
                    accentColor={accentColor} 
                />
             </div>
         );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
            <ScreenHeader title="Withdraw Cash" onBack={onBack} />
            
            {/* Method Toggle */}
            <div className="px-6 pt-4">
                <div className="flex bg-gray-200 dark:bg-[#1c1c1e] p-1 rounded-xl">
                    <button onClick={() => { setWithdrawMethod('agent'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${withdrawMethod === 'agent' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <User size={20} />
                    </button>
                    <button onClick={() => { setWithdrawMethod('nfc'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${withdrawMethod === 'nfc' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <Nfc size={20} />
                    </button>
                    <button onClick={() => { setWithdrawMethod('qr'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${withdrawMethod === 'qr' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <QrCode size={20} />
                    </button>
                    <button onClick={() => { setWithdrawMethod('phone'); setIsScanning(false); }} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${withdrawMethod === 'phone' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                        <Smartphone size={20} />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">
                    {withdrawMethod === 'agent' && 'Withdraw via Agent iPayTag'}
                    {withdrawMethod === 'nfc' && 'Withdraw via NFC (ATM/Agent)'}
                    {withdrawMethod === 'qr' && 'Withdraw via QR Code'}
                    {withdrawMethod === 'phone' && 'Withdraw to Mobile Money'}
                </p>
            </div>

            <form onSubmit={handleWithdraw} className="p-6 space-y-6 flex-grow">
                {withdrawMethod === 'agent' && (
                    <FormInput label="Agent iPayTag" type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder="@agentname" required accentColor={accentColor} />
                )}

                {withdrawMethod === 'phone' && (
                    <FormInput label="Mobile Money Number" type="tel" value={target} onChange={e => setTarget(e.target.value)} placeholder="+260 9..." required accentColor={accentColor} />
                )}

                {(withdrawMethod === 'nfc' || withdrawMethod === 'qr') && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#333] min-h-[300px]">
                        {isScanning ? (
                            withdrawMethod === 'qr' ? (
                                <div id="qr-reader-withdraw" className="w-full max-w-xs"></div>
                            ) : (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full ${themes[accentColor].bg} flex items-center justify-center mb-4`}>
                                        <Nfc size={32} className="animate-spin" />
                                    </div>
                                    <p className="text-sm font-bold">Listening for NFC...</p>
                                    <p className="text-xs text-gray-500 mt-2">Bring device close</p>
                                </div>
                            )
                        ) : target ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                                    <CheckCircle size={32} />
                                </div>
                                <p className="text-sm font-bold text-green-600">Source Verified</p>
                                <p className="text-xs text-gray-500">{target}</p>
                                <button type="button" onClick={() => setTarget('')} className="text-xs text-red-500 mt-2 underline">Clear</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <button type="button" onClick={handleScan} className="flex flex-col items-center group">
                                    <div className={`w-20 h-20 rounded-full bg-white dark:bg-[#2c2c2e] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4`}>
                                        {withdrawMethod === 'nfc' ? <Nfc size={40} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" /> : <QrCode size={40} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" />}
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 group-hover:text-black dark:group-hover:text-white">Tap to Scan</p>
                                </button>
                                {scanError && <p className="text-xs text-red-500 mt-4">{scanError}</p>}
                            </div>
                        )}
                    </div>
                )}

                <FormInput label={`Amount to Withdraw (${currency === 'USD' ? '$' : 'K'})`} type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required accentColor={accentColor} />
                
                <div className="pt-4">
                    <p className="text-xs text-gray-500 mb-2 text-center">Transaction Fee: 5%</p>
                    <button type="submit" disabled={!amount || (withdrawMethod !== 'nfc' && withdrawMethod !== 'qr' && !target)} className={`w-full ${themes[accentColor].bg} text-black font-bold py-3 px-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}>Withdraw Now</button>
                </div>
            </form>
        </div>
    );
};

const ClientHistoryScreen: FC<{ onBack: () => void; transactions: Transaction[]; accentColor: ThemeColor; currency: string; conversionRate: number }> = ({ onBack, transactions, accentColor, currency, conversionRate }) => (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
        <ScreenHeader title="All Transactions" onBack={onBack} />
        <div className="flex-grow p-4 overflow-y-auto no-scrollbar">
            <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl divide-y divide-gray-200 dark:divide-[#3a3a3c]">
                {transactions.length > 0 ? transactions.map((t, i) => (
                    <TransactionItem key={i} {...t} accentColor={accentColor} currency={currency} conversionRate={conversionRate}/>
                )) : <div className="text-center text-gray-500 py-8">No history yet</div>}
            </div>
        </div>
    </div>
);


// --- Agent Specific Screens (Updated for Interactivity) ---
interface AgentActionScreenProps {
    onBack: () => void;
    title: string;
    type: string;
    accentColor: ThemeColor;
    onConfirm: (type: string, amount: number, phone: string) => Promise<boolean> | boolean;
    agentBalance: number;
    currency: string;
    conversionRate: number;
}

const AgentActionScreen: FC<AgentActionScreenProps> = ({ onBack, title, type, accentColor, onConfirm, agentBalance, currency, conversionRate }) => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [failureMessage, setFailureMessage] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');

    const handleScanResult = (decodedText: string) => {
        setIsScanning(false);
        // Simple parsing for ipay:username or raw text
        const cleanText = decodedText.replace('ipay:', '');
        setPhone(cleanText);
    };

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        if (isScanning) {
             setTimeout(() => {
                 if (document.getElementById('qr-reader-agent')) {
                     scanner = new Html5Qrcode("qr-reader-agent");
                     scanner.start(
                         { facingMode: "environment" },
                         { fps: 10, qrbox: 250 },
                         (text) => {
                             handleScanResult(text);
                             scanner?.stop().catch(console.error);
                             scanner?.clear();
                         },
                         (err) => { }
                     ).catch(err => {
                         console.error("Error starting scanner:", err);
                         setScanError("Camera permission denied.");
                     });
                 }
             }, 100);
        }
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => scanner?.clear()).catch(console.error);
            }
        };
    }, [isScanning]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let amt = parseFloat(amount);
        
        // Convert input to USD if currency is ZMW
        if (currency === 'ZMW') {
            amt = amt / conversionRate;
        }
        
        // Validation Logic (Pre-check)
        if (type === 'Deposit') {
            if (amt > agentBalance) {
                setFailureMessage('Insufficient Float Balance');
                setStep(3); // Go to Failure Screen
                return;
            }
        }
        
        // Execute Transaction
        const success = await onConfirm(type, amt, phone);
        if (success) {
             setStep(2); // Success state
        } else {
            // Determine error message based on type to prevent confusion
            if (type === 'Withdrawal') {
                 setFailureMessage('Transaction Declined: Low Client Funds');
            } else {
                 setFailureMessage('Transaction Failed'); 
            }
            setStep(3); // Go to Failure Screen
        }
    };

    const handleRetry = () => {
        setStep(1);
        setFailureMessage('');
    }

    // Determine display symbol and converted balance for UI
    const symbol = currency === 'ZMW' ? 'K' : '$';
    const displayedBalance = currency === 'ZMW' ? agentBalance * conversionRate : agentBalance;

    if (step === 2) {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
                <ScreenHeader title={title} onBack={onBack} />
                <TransactionStatusScreen status="success" title="Processing Complete" message={`Successfully processed ${type} of ${symbol}${amount} for ${phone}. Commission earned.`} onDone={onBack} accentColor={accentColor} />
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
                <ScreenHeader title={title} onBack={handleRetry} />
                <TransactionStatusScreen status="failure" title="Transaction Failed" message={failureMessage} onDone={handleRetry} accentColor={accentColor} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
            <ScreenHeader title={title} onBack={onBack} />
            <div className="p-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 mb-2">
                    <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Agent Float Available</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{symbol}{displayedBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow pt-2">
                {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#333] min-h-[300px]">
                        <div id="qr-reader-agent" className="w-full max-w-xs"></div>
                        <button type="button" onClick={() => setIsScanning(false)} className="text-red-500 font-bold mt-4">Cancel Scan</button>
                        {scanError && <p className="text-xs text-red-500 mt-2">{scanError}</p>}
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <FormInput label="Client Phone / Tag" type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+260 9... or @tag" required accentColor={accentColor} />
                            <button type="button" onClick={() => setIsScanning(true)} className="absolute right-0 top-0 text-blue-500 text-xs font-bold flex items-center gap-1 p-1">
                                <QrCode size={14} /> Scan QR
                            </button>
                        </div>
                        {type !== 'Registration' && (
                            <FormInput 
                                label={`Amount (${symbol})`} 
                                type="number" 
                        step="0.01" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="0.00" 
                        required 
                        accentColor={accentColor} 
                    />
                )}
                <div className="pt-4">
                    <button type="submit" className={`w-full ${themes[accentColor].bg} text-black font-bold py-3 px-4 rounded-full hover:opacity-90 transition-opacity`}>
                        Process {type}
                    </button>
                </div>
                </>
            )}
            </form>
        </div>
    );
};

// --- Agent Reports Screen (Advanced Analytics) ---
interface ReportsScreenProps {
    onBack: () => void;
    accentColor: ThemeColor;
    agentTransactions: Transaction[];
    commissionUSD: number;
    currency: string;
    conversionRate: number;
    onWithdrawCommission: () => void;
}

const ReportsScreen: FC<ReportsScreenProps> = ({ onBack, accentColor, agentTransactions, commissionUSD, currency, conversionRate, onWithdrawCommission }) => {
    // 1. Calculate Analytics
    const totalTransactions = agentTransactions.length;
    const depositVolumeUSD = agentTransactions.filter(t => t.type.includes('Deposit')).reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const withdrawVolumeUSD = agentTransactions.filter(t => t.type.includes('Withdraw')).reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const totalVolumeUSD = depositVolumeUSD + withdrawVolumeUSD;
    const avgTicketUSD = totalTransactions > 0 ? totalVolumeUSD / totalTransactions : 0;

    const symbol = currency === 'ZMW' ? 'K' : '$';

    // Display Values
    const displayedTotalVolume = currency === 'ZMW' ? totalVolumeUSD * conversionRate : totalVolumeUSD;
    const displayedAvgTicket = currency === 'ZMW' ? avgTicketUSD * conversionRate : avgTicketUSD;
    const displayedCommission = currency === 'ZMW' ? commissionUSD * conversionRate : commissionUSD;
    
    // Bar Chart Calculation (Volume Split)
    const depositPercent = totalVolumeUSD > 0 ? (depositVolumeUSD / totalVolumeUSD) * 100 : 50;
    const withdrawPercent = totalVolumeUSD > 0 ? (withdrawVolumeUSD / totalVolumeUSD) * 100 : 50;

    // --- Mock Data for Visual Demo of "Volume vs Date" ---
    const trendData = [
        { label: 'M', value: 1200 },
        { label: 'T', value: 1900 },
        { label: 'W', value: 1500 },
        { label: 'T', value: 2800 },
        { label: 'F', value: 2100 },
        { label: 'S', value: 3500 },
        { label: 'S', value: totalVolumeUSD > 0 ? totalVolumeUSD : 4200 } // Use current volume for today if available
    ];
    
    // Scale data for SVG
    const maxVal = Math.max(...trendData.map(d => d.value));
    
    // Generate SVG Points
    const points = trendData.map((d, i) => {
        const x = (i / (trendData.length - 1)) * 100; // X percentage
        const y = 100 - ((d.value / maxVal) * 80); // Y percentage (leave 20% padding at top)
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `${points} 100,100 0,100`;

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="Agent Reports" onBack={onBack} />
            <div className="p-6 flex-grow overflow-y-auto space-y-6 no-scrollbar">
                
                {/* Commission Withdrawal Card */}
                <div className={`${themes[accentColor].bg} p-6 rounded-2xl shadow-lg relative overflow-hidden`}>
                    <div className="relative z-10 text-black">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Unclaimed Commission</p>
                                <h2 className="text-4xl font-black mt-1">
                                    {symbol}{displayedCommission.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </h2>
                            </div>
                            <Award size={32} className="opacity-80" />
                        </div>
                        <button 
                            onClick={onWithdrawCommission}
                            disabled={commissionUSD <= 0}
                            className={`mt-4 w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${commissionUSD <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Wallet size={18} /> Cash Out to Float
                        </button>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                            <Activity size={16} /> <span className="text-xs font-bold uppercase">Volume</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{symbol}{displayedTotalVolume.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                            <BarChart2 size={16} /> <span className="text-xs font-bold uppercase">Avg Ticket</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{symbol}{displayedAvgTicket.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    </div>
                </div>

                {/* Volume vs Date Trend Chart */}
                <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Volume Trend (7 Days)</h3>
                        <TrendingUp size={16} className={themes[accentColor].text} />
                    </div>
                    
                    <div className="h-32 w-full relative">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                            {/* Gradient Definition */}
                            <defs>
                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={themes[accentColor].base} stopOpacity="0.2" />
                                    <stop offset="100%" stopColor={themes[accentColor].base} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Area Fill */}
                            <polygon points={fillPath} fill="url(#trendGradient)" />
                            
                            {/* Line */}
                            <polyline 
                                fill="none" 
                                stroke={themes[accentColor].base} 
                                strokeWidth="3" 
                                points={points} 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                            
                            {/* Dots */}
                            {trendData.map((d, i) => {
                                const x = (i / (trendData.length - 1)) * 100;
                                const y = 100 - ((d.value / maxVal) * 80);
                                return (
                                    <circle key={i} cx={x} cy={y} r="2" fill="white" stroke={themes[accentColor].base} strokeWidth="2" />
                                );
                            })}
                        </svg>
                        
                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                            {trendData.map((d, i) => (
                                <span key={i}>{d.label}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Charts (CSS Based) */}
                <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Volume Split</h3>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div className={`h-full ${themes[accentColor].bg}`} style={{width: `${depositPercent}%`}}></div>
                        <div className="h-full bg-blue-500" style={{width: `${withdrawPercent}%`}}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium">
                        <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${themes[accentColor].bg}`}></div> Deposits ({depositPercent.toFixed(0)}%)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Withdrawals ({withdrawPercent.toFixed(0)}%)</div>
                    </div>
                </div>

                {/* Detailed Commission Ledger */}
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Commission Ledger</h3>
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-[#2c2c2e]">
                        {agentTransactions.length > 0 ? agentTransactions.map((t, i) => {
                            const txAmountUSD = parseFloat(t.amount);
                            const displayedTxAmount = currency === 'ZMW' ? txAmountUSD * conversionRate : txAmountUSD;
                            const comm = t.commission || 0;
                            const displayedComm = currency === 'ZMW' ? comm * conversionRate : comm;

                            return (
                                <div key={i} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{t.type}</p>
                                        <p className="text-xs text-gray-500">{t.date} • Vol: {symbol}{displayedTxAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${themes[accentColor].text}`}>+{symbol}{displayedComm.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Comm.</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-8 text-center text-gray-500">No transactions recorded yet.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};


// --- Agent Registration Screen ---
const AgentRegistrationScreen: FC<{ onBack: () => void; onRegister: () => void; accentColor: ThemeColor }> = ({ onBack, onRegister, accentColor }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        businessName: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API call / Verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, we would save this to Supabase 'agent_applications' table
        // For now, we call the onRegister callback which should update the profile status
        onRegister();
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="Become an Agent" onBack={onBack} />
            <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm mb-6">
                    <div className={`w-16 h-16 rounded-full ${themes[accentColor].bg} flex items-center justify-center mb-4 mx-auto`}>
                        <Briefcase size={32} className="text-black" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">Join the Agency</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Earn commissions by helping clients deposit and withdraw cash.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput label="Full Legal Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="As on ID" required accentColor={accentColor} />
                    <FormInput label="ID / Passport Number" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} placeholder="XXXX-XXXX-XXXX" required accentColor={accentColor} />
                    <FormInput label="Business Name (Optional)" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="e.g. Lusaka Trading" accentColor={accentColor} />
                    <FormInput label="Physical Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City" required accentColor={accentColor} />
                    
                    <div className="pt-4">
                        <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest ${themes[accentColor].bg} text-black shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Settings Screen ---
const SettingsScreen: FC<{ 
    onBack: () => void; 
    theme: string; 
    setTheme: (t: string) => void; 
    accentColor: ThemeColor; 
    setAccentColor: (c: ThemeColor) => void; 
    onLogout: () => void; 
    setScreen: (s: string) => void;
    view: 'client' | 'agent';
    setView: (v: 'client' | 'agent') => void;
    profile: UserProfile;
}> = ({ onBack, theme, setTheme, accentColor, setAccentColor, onLogout, setScreen, view, setView, profile }) => (
    <div className="flex flex-col flex-1 min-h-full bg-gray-100 dark:bg-black">
        <ScreenHeader title="Settings" onBack={onBack} />
        <div className="p-6 space-y-8 overflow-y-auto no-scrollbar flex-grow">
            {/* Mode Switcher - Prominent */}
            {profile.agentStatus === 'approved' ? (
                <div className={`${themes[accentColor].bg} p-6 rounded-2xl shadow-lg relative overflow-hidden`}>
                    <div className="relative z-10 text-black">
                        <h3 className="text-lg font-black uppercase tracking-wider mb-1">Current Mode</h3>
                        <div className="flex items-center gap-2 mb-4">
                            {view === 'client' ? <User size={32} /> : <Briefcase size={32} />}
                            <span className="text-3xl font-black">{view === 'client' ? 'Client' : 'Agent'}</span>
                        </div>
                        <button 
                            onClick={() => { 
                                const newView = view === 'client' ? 'agent' : 'client';
                                setView(newView);
                                setScreen('home');
                            }}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <RefreshCw size={18} /> Switch to {view === 'client' ? 'Agent' : 'Client'} View
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm relative overflow-hidden border border-gray-200 dark:border-[#333]">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Become an Agent</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Earn commissions by facilitating transactions for others.</p>
                        {profile.agentStatus === 'pending' ? (
                            <div className="w-full py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Clock size={18} /> Application Pending
                            </div>
                        ) : (
                            <button 
                                onClick={() => setScreen('agentRegistration')}
                                className={`w-full py-3 ${themes[accentColor].bg} text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                            >
                                <Briefcase size={18} /> Register as Agent
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div>
                 <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Profile</h3>
                 <button onClick={() => setScreen('profileEditor')} className="w-full bg-white dark:bg-[#1c1c1e] p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User size={20} /></div><div className="text-left"><p className="font-bold text-gray-800 dark:text-white">Edit Profile</p><p className="text-xs text-gray-500">Name, Avatar & Vibe</p></div></div><Edit3 size={18} className="text-gray-400" />
                 </button>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Appearance</h3>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 dark:text-white">Theme</p>
                        <div className="flex items-center bg-gray-200 dark:bg-[#2c2c2e] rounded-full p-1">
                            <button onClick={() => setTheme('light')} className={`px-3 py-1 text-sm font-bold rounded-full transition-colors flex items-center gap-2 ${theme === 'light' ? `${themes[accentColor].bg} text-black` : 'text-gray-600 dark:text-gray-300'}`}><Sun size={16}/> Light</button>
                            <button onClick={() => setTheme('dark')} className={`px-3 py-1 text-sm font-bold rounded-full transition-colors flex items-center gap-2 ${theme === 'dark' ? `${themes[accentColor].bg} text-black` : 'text-gray-300'}`}><Moon size={16}/> Dark</button>
                        </div>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Accent Color</h3>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4">
                    <div className="flex flex-wrap justify-around gap-2">
                        {(Object.keys(themes) as ThemeColor[]).map(color => (
                            <button key={color} onClick={() => setAccentColor(color)} className={`w-10 h-10 rounded-full ${themes[color].bg} transition-transform transform hover:scale-110 ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1c1c1e]' : ''}`} style={{'--tw-ring-color': themes[accentColor].base} as React.CSSProperties} />
                        ))}
                    </div>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Account</h3>
                 <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-red-500/20"><LogOut size={20} /> Log Out</button>
            </div>
        </div>
    </div>
);


// --- Client Dashboard & Tools ---
const ClientToolsScreen: FC<{ onBack: () => void; accentColor: ThemeColor; setScreen: (s: string) => void }> = ({ onBack, accentColor, setScreen }) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const previousMonth = date.toLocaleString('default', { month: 'long' });

    return (
    <div className="flex flex-col flex-1 min-h-full bg-gray-100 dark:bg-black">
        <ScreenHeader title="Dashboard & Tools" onBack={onBack} />
        <div className="p-6 space-y-6 flex-grow">
            <div onClick={() => setScreen('spendingStory')} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors text-center">
                <div className="flex justify-center items-center"><Sparkles size={32} className={`${themes[accentColor].text} mb-3`} /></div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Your {previousMonth} Story</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See a visual breakdown of your spending habits.</p>
            </div>
            <div onClick={() => setScreen('savingsQuest')} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors text-center">
                <div className="flex justify-center items-center"><PiggyBank size={32} className={`${themes[accentColor].text} mb-3`} /></div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Savings Quest: Level Up Your Funds</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See your savings grow with fun challenges and rewards.</p>
            </div>
            <div onClick={() => setScreen('clientQRCode')} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors text-center">
                <div className="flex justify-center items-center"><QrCode size={32} className={`${themes[accentColor].text} mb-3`} /></div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">My QR Code</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share your code for quick transactions.</p>
            </div>
        </div>
    </div>
    );
};

const ClientQRCodeScreen: FC<{ onBack: () => void; accentColor: ThemeColor; profile: UserProfile }> = ({ onBack, accentColor, profile }) => {
    const qrValue = `ipay:${profile.name.replace('@', '')}`; // e.g., ipay:username

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="My QR Code" onBack={onBack} />
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 relative w-full max-w-xs">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                         <img src={profile.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${profile.name}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                        <p className="text-gray-500 text-sm font-medium">Scan to pay or withdraw</p>
                    </div>
                    <div className="flex justify-center">
                        <QRCodeCanvas value={qrValue} size={200} level={"H"} />
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs font-medium">
                    Show this code to an agent to withdraw cash or receive a deposit.
                </p>
            </div>
        </div>
    );
};

const AgentToolsScreen: FC<{ onBack: () => void; accentColor: ThemeColor; setScreen: (s: string) => void }> = ({ onBack, accentColor, setScreen }) => {
    return (
    <div className="flex flex-col flex-1 min-h-full bg-gray-100 dark:bg-black">
        <ScreenHeader title="Agent Tools" onBack={onBack} />
        <div className="p-6 space-y-6 flex-grow">
            <div onClick={() => setScreen('agentReports')} className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors text-center">
                <div className="flex justify-center items-center"><BarChart2 size={32} className={`${themes[accentColor].text} mb-3`} /></div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Performance Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Detailed breakdown of your commissions and volume.</p>
            </div>
             <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors text-center opacity-50">
                <div className="flex justify-center items-center"><Briefcase size={32} className={`${themes[accentColor].text} mb-3`} /></div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Agent Resources</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Training materials and marketing assets (Coming Soon).</p>
            </div>
        </div>
    </div>
    );
};


interface ClientDashboardProps {
    transactions: Transaction[];
    balanceUSD: number;
    setScreen: (s: string) => void;
    accentColor: ThemeColor;
    currency: string;
    toggleCurrency: () => void;
    conversionRate: number;
    profile: UserProfile;
}

const ClientDashboard: FC<ClientDashboardProps> = ({ transactions, balanceUSD, setScreen, accentColor, currency, toggleCurrency, conversionRate, profile }) => {
    const [balanceVisible, setBalanceVisible] = useState(true);
    const balanceZMW = balanceUSD * conversionRate;
    
    // Welcome message animation state
    const [welcomeVisible, setWelcomeVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setWelcomeVisible(false);
        }, 3000); // Disappear after 3 seconds
        return () => clearTimeout(timer);
    }, []);

    const getAvatarUrl = () => {
        if (profile.avatarUrl) return profile.avatarUrl;

        const currentStyle = profile.style || 'avataaars';
        let hair = profile.fixedHair; 
        if (!hair && currentStyle === 'avataaars') {
             const hairList = profile.gender === 'masculine' ? AVATAR_CONFIG.hairStyles.masculine : AVATAR_CONFIG.hairStyles.feminine;
             const hairIndex = Math.floor(profile.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % hairList.length);
             hair = hairList[hairIndex];
        }
        let url = `https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${profile.seed}`;
        if (currentStyle === 'micah') {
             url += `&backgroundColor=b6e3f4,c0aede,d1d4f9`;
        } else {
            url += `&skinColor=${profile.skinTone}&top=${hair}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            if (profile.gender === 'feminine' || profile.noBeard) {
                url += `&facialHairProbability=0`;
            }
        }
        return url;
    };
    
    const loansIcon = <HandCoins size={24} />; 
    const billsIcon = <Receipt size={24} />; 
    
    return (
        <div className="p-6 flex flex-col h-full bg-gray-100 dark:bg-black text-black dark:text-white">
            <div className="flex justify-between items-center mb-6 h-12 relative">
                <div className="flex items-center gap-3 absolute left-0 top-0 h-full">
                    <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white dark:border-[#333] overflow-hidden">
                        <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${profile.name}`;}}/>
                    </div>
                    
                    <div className={`transition-all duration-1000 ease-in-out flex flex-col justify-center ${welcomeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Welcome back,</p>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight whitespace-nowrap">{profile.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3 absolute right-0 top-1/2 -translate-y-1/2">
                    <button onClick={() => setScreen('clientTools')} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white bg-white dark:bg-[#1c1c1e] p-2 rounded-xl shadow-sm"><PieChart size={20}/></button>
                    <button onClick={() => setScreen('settings')} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white bg-white dark:bg-[#1c1c1e] p-2 rounded-xl shadow-sm"><Settings size={20}/></button>
                </div>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                 <div onClick={toggleCurrency} className="cursor-pointer group flex items-center justify-center space-x-2"><h1 className={`text-6xl font-bold transition-opacity duration-300 ${balanceVisible ? '' : 'blur-lg'}`}>{currency === 'USD' ? `$${balanceUSD.toLocaleString('en-US', {minimumFractionDigits: 2})}` : `K${balanceZMW.toLocaleString('en-US', {minimumFractionDigits: 2})}`}</h1><RefreshCw size={20} className="text-gray-500 group-hover:text-black dark:group-hover:text-white group-hover:rotate-180 transition-all duration-300"/></div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Equivalent: {currency === 'ZMW' ? `$${balanceUSD.toLocaleString('en-US', {minimumFractionDigits: 2})}` : `K${balanceZMW.toLocaleString('en-US', {minimumFractionDigits: 2})}`}</p>
                 <button onClick={() => setBalanceVisible(!balanceVisible)} className="mt-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">{balanceVisible ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
            </div>
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <ActionButton icon={<MessageSquare size={24} />} label="Chat" onClick={() => setScreen('chat')} accentColor={accentColor} />
                    <ActionButton icon={billsIcon} label="Pay Bills" onClick={() => setScreen('bills')} accentColor={accentColor} />
                    <ActionButton icon={loansIcon} label="Loans" onClick={() => setScreen('microloans')} accentColor={accentColor} />
                    <ActionButton icon={<CreditCard size={24}/>} label="Card" onClick={() => setScreen('card')} accentColor={accentColor} />
                </div>
                 <div className="flex space-x-4">
                    <ActionButton large label="Withdraw" onClick={() => setScreen('withdraw')} accentColor={accentColor} />
                    <ActionButton large label="Send" onClick={() => setScreen('send')} accentColor={accentColor} />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">History</h3>
                <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-xl divide-y divide-gray-200 dark:divide-[#3a3a3c] h-48 overflow-y-auto no-scrollbar">
                    {transactions.length > 0 ? (
                        <>
                            {transactions.slice(0, 5).map((t, i) => <TransactionItem key={i} {...t} accentColor={accentColor} currency={currency} conversionRate={conversionRate}/>)}
                            {transactions.length > 5 && (
                                <button onClick={() => setScreen('history')} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white transition-colors">View More</button>
                            )}
                        </>
                    ) : <div className="text-center text-gray-500 py-8">No history yet</div>}
                </div>
            </div>
        </div>
    );
};

// --- Agent Dashboard ---
interface AgentDashboardProps {
    transactions: Transaction[];
    balanceUSD: number;
    commissionUSD: number;
    setScreen: (s: string) => void;
    accentColor: ThemeColor;
    currency: string;
    toggleCurrency: () => void;
    conversionRate: number;
}

const AgentDashboard: FC<AgentDashboardProps> = ({ transactions, balanceUSD, commissionUSD, setScreen, accentColor, currency, toggleCurrency, conversionRate }) => {
    const balanceZMW = balanceUSD * conversionRate;
    const commissionZMW = commissionUSD * conversionRate;
    const [balanceVisible, setBalanceVisible] = useState(true);

    return (
        <div className="p-6 flex flex-col h-full bg-gray-100 dark:bg-black text-black dark:text-white">
            {/* Header - Matching Client Layout */}
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${themes[accentColor].bg} flex items-center justify-center text-black font-bold text-xl shadow-lg border-2 border-white dark:border-[#333]`}>AG</div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Agent Portal</p>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">ID: 4829-10</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setScreen('agentTools')} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white bg-white dark:bg-[#1c1c1e] p-2 rounded-xl shadow-sm transition-colors">
                        <PieChart size={20}/>
                    </button>
                    <button onClick={() => setScreen('settings')} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white bg-white dark:bg-[#1c1c1e] p-2 rounded-xl shadow-sm transition-colors">
                        <Settings size={20}/>
                    </button>
                </div>
            </div>

            {/* Main Balance Display - Professional & Central */}
            <div className="flex-grow flex flex-col items-center justify-center text-center mb-6">
                 <div onClick={toggleCurrency} className="cursor-pointer group flex items-center justify-center space-x-2">
                    <h1 className={`text-5xl font-black tracking-tight transition-opacity duration-300 ${balanceVisible ? '' : 'blur-lg'}`}>
                        {currency === 'USD' ? `$${balanceUSD.toLocaleString('en-US', {minimumFractionDigits: 2})}` : `K${balanceZMW.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                    </h1>
                    <RefreshCw size={20} className="text-gray-500 group-hover:text-black dark:group-hover:text-white group-hover:rotate-180 transition-all duration-300"/>
                 </div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide uppercase">Total Float Balance</p>
                 <div className="mt-4 bg-white dark:bg-[#1c1c1e] px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors" onClick={() => setScreen('agentReports')}>
                    <div className={`w-2 h-2 rounded-full ${themes[accentColor].bg} animate-pulse`}></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Commission: {currency === 'USD' ? `$${commissionUSD.toLocaleString('en-US', {minimumFractionDigits: 2})}` : `K${commissionZMW.toLocaleString('en-US', {minimumFractionDigits: 2})}`} &rarr;</span>
                 </div>
            </div>

            {/* Quick Actions Grid - Using ActionButton for consistency */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                 <ActionButton icon={<ArrowDownLeft size={24}/>} label="Deposit" onClick={() => setScreen('agentDeposit')} accentColor={accentColor} />
                 <ActionButton icon={<ArrowUpRight size={24}/>} label="Withdraw" onClick={() => setScreen('agentWithdraw')} accentColor={accentColor} />
                 <ActionButton icon={<UserPlus size={24}/>} label="Register" onClick={() => setScreen('agentRegister')} accentColor={accentColor} />
                 <ActionButton icon={<BarChart2 size={24}/>} label="Reports" onClick={() => setScreen('agentReports')} accentColor={accentColor} /> 
            </div>

            {/* Recent Activity Section */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Recent Activity</h3>
                    <button className={`text-xs font-bold ${themes[accentColor].text}`}>View All</button>
                </div>
                 <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl divide-y divide-gray-100 dark:divide-[#2c2c2e] shadow-sm flex-grow overflow-y-auto no-scrollbar">
                     {transactions.length > 0 ? transactions.map((t, i) => (
                         <TransactionItem key={i} {...t} accentColor={accentColor} currency={currency} conversionRate={conversionRate} />
                     )) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <Receipt size={40} strokeWidth={1.5} />
                            <p className="text-sm">No recent transactions</p>
                        </div>
                     )}
                 </div>
            </div>
         </div>
    )
}

// --- Placeholder Screens for Missing Features ---

const BillIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="12" y="17" textAnchor="middle" fontSize="5" fontWeight="900" fill="currentColor" style={{ fontFamily: 'sans-serif' }}>BILL</text>
    </svg>
);

// --- Advanced Chat Screen ---
interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'other';
    type: 'text' | 'payment' | 'payment_failed';
    amount?: number;
    timestamp: Date;
}

interface ChatContact {
    id: string;
    name: string;
    tag: string;
    avatar: string;
    lastMessage: string;
    lastTime: string;
}

const ChatScreen: FC<{ 
    onBack: () => void; 
    accentColor: ThemeColor; 
    addTransaction?: (t: any) => void; 
    balanceUSD?: number; 
    currency?: string; 
    conversionRate?: number; 
}> = ({ onBack, accentColor, addTransaction, balanceUSD = 0, currency = 'USD', conversionRate = 1 }) => {
    const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
        '1': [
            { id: '1', text: 'Hey! Thanks for covering dinner last night.', sender: 'other', type: 'text', timestamp: new Date(Date.now() - 86400000) },
            { id: '2', text: 'No worries! It was fun.', sender: 'me', type: 'text', timestamp: new Date(Date.now() - 86000000) },
        ],
        '2': [
            { id: '1', text: 'Can you send me the rent share?', sender: 'other', type: 'text', timestamp: new Date(Date.now() - 100000) },
        ]
    });
    const [inputText, setInputText] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitAmount, setSplitAmount] = useState('');
    const [selectedSplitFriends, setSelectedSplitFriends] = useState<string[]>([]);

    const contacts: ChatContact[] = [
        { id: '1', name: 'Sarah Jenkins', tag: '$sarahj', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4', lastMessage: 'No worries! It was fun.', lastTime: 'Yesterday' },
        { id: '2', name: 'Mike Ross', tag: '$miker', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mike&backgroundColor=c0aede', lastMessage: 'Can you send me the rent share?', lastTime: '10:42 AM' },
        { id: '3', name: 'Jessica Pearson', tag: '$jessp', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jessica&backgroundColor=ffdfbf', lastMessage: 'Meeting at 2?', lastTime: 'Mon' },
    ];

    const handleSplitBill = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(splitAmount);
        if (isNaN(amount) || amount <= 0 || selectedSplitFriends.length === 0) return;

        const splitCount = selectedSplitFriends.length + 1; // +1 for yourself
        const amountPerPerson = amount / splitCount;
        
        setMessages(prev => {
            const next = { ...prev };
            selectedSplitFriends.forEach(friendId => {
                const splitMsg: ChatMessage = {
                    id: Date.now().toString() + Math.random().toString(),
                    text: `📄 Split Bill Request: ${currency === 'USD' ? '$' : 'K'}${amountPerPerson.toFixed(2)} (Total: ${currency === 'USD' ? '$' : 'K'}${amount.toFixed(2)})`,
                    sender: 'me',
                    type: 'text',
                    timestamp: new Date()
                };
                next[friendId] = [...(next[friendId] || []), splitMsg];
            });
            return next;
        });

        setShowSplitModal(false);
        setSplitAmount('');
        setSelectedSplitFriends([]);
    };

    const toggleSplitFriend = (id: string) => {
        setSelectedSplitFriends(prev => 
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !activeChat) return;
        
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            type: 'text',
            timestamp: new Date()
        };

        setMessages(prev => ({
            ...prev,
            [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
        }));
        setInputText('');

        // Simulate reply
        setTimeout(() => {
            const reply: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Got it!',
                sender: 'other',
                type: 'text',
                timestamp: new Date()
            };
            setMessages(prev => ({
                ...prev,
                [activeChat.id]: [...(prev[activeChat.id] || []), reply]
            }));
        }, 2000);
    };

    const handleSendPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || !addTransaction) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        // Check balance (convert if needed, assuming balanceUSD is always USD)
        // For simplicity, we'll assume the input amount matches the current currency view
        // But internally we store/transact in USD usually. 
        // Let's assume input is in displayed currency.
        
        const amountInUSD = currency === 'ZMW' ? amount / conversionRate : amount;
        const feeInUSD = amountInUSD * 0.005; // 0.5% fee
        const totalDeduction = amountInUSD + feeInUSD;

        if (totalDeduction > balanceUSD) {
            // Add Payment Failed Message
            const failedMessage: ChatMessage = {
                id: Date.now().toString(),
                text: `Failed ${currency === 'USD' ? '$' : 'K'}${amount.toFixed(2)}`,
                sender: 'me',
                type: 'payment_failed',
                amount: amountInUSD,
                timestamp: new Date()
            };

            setMessages(prev => ({
                ...prev,
                [activeChat.id]: [...(prev[activeChat.id] || []), failedMessage]
            }));
            
            setShowPaymentModal(false);
            setPaymentAmount('');
            return;
        }

        // 1. Deduct Balance
        addTransaction({
            icon: <Send size={18} />,
            type: `Sent to ${activeChat.name}`,
            date: 'Just now',
            amount: amountInUSD.toFixed(2),
            isCredit: false,
            category: 'transfer',
            fee: feeInUSD
        }, feeInUSD);

        // 2. Add Payment Message
        const payMessage: ChatMessage = {
            id: Date.now().toString(),
            text: `Sent ${currency === 'USD' ? '$' : 'K'}${amount.toFixed(2)}`,
            sender: 'me',
            type: 'payment',
            amount: amountInUSD, // Store normalized amount or display amount? Let's store normalized for logic, but text has display.
            timestamp: new Date()
        };

        setMessages(prev => ({
            ...prev,
            [activeChat.id]: [...(prev[activeChat.id] || []), payMessage]
        }));

        setShowPaymentModal(false);
        setPaymentAmount('');
    };

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Sub-components for Chat ---

    if (activeChat) {
        const chatMsgs = messages[activeChat.id] || [];
        
        return (
            <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
                {/* Chat Header */}
                <div className="bg-white dark:bg-[#1c1c1e] p-4 flex items-center gap-3 shadow-sm z-10">
                    <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] rounded-full"><ArrowLeft size={20} className="text-gray-600 dark:text-white"/></button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white leading-tight">{activeChat.name}</h3>
                        <p className="text-xs text-gray-500">{activeChat.tag}</p>
                    </div>
                    <button className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full text-gray-600 dark:text-white"><MoreVertical size={20}/></button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-black">
                    {chatMsgs.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl ${
                                msg.sender === 'me' 
                                    ? msg.type === 'payment_failed' ? 'bg-red-500 text-white rounded-tr-none' : `${themes[accentColor].bg} text-black rounded-tr-none` 
                                    : 'bg-white dark:bg-[#1c1c1e] text-gray-800 dark:text-white rounded-tl-none shadow-sm'
                            }`}>
                                {msg.type === 'payment' ? (
                                    <div className="flex flex-col items-center min-w-[120px]">
                                        <p className="text-xs font-bold opacity-70 mb-1 uppercase">Payment Sent</p>
                                        <h2 className="text-2xl font-black">{msg.text.replace('Sent ', '')}</h2>
                                        <div className="mt-2 bg-black/10 dark:bg-white/10 p-1 rounded-full"><Check size={12}/></div>
                                    </div>
                                ) : msg.type === 'payment_failed' ? (
                                    <div className="flex flex-col items-center min-w-[120px]">
                                        <p className="text-xs font-bold opacity-70 mb-1 uppercase">Payment Failed</p>
                                        <h2 className="text-2xl font-black">{msg.text.replace('Failed ', '')}</h2>
                                        <div className="mt-2 bg-white/20 p-1 rounded-full"><X size={12}/></div>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.text}</p>
                                )}
                                <p className="text-[10px] opacity-50 text-right mt-1">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-[#1c1c1e] border-t border-gray-200 dark:border-[#2c2c2e] flex items-center gap-2">
                    <button onClick={() => setShowPaymentModal(true)} className={`w-12 h-12 flex-shrink-0 rounded-full ${themes[accentColor].bg} text-black flex items-center justify-center transition-transform hover:scale-105 font-black text-2xl shadow-md`}>
                        {currency === 'USD' ? '$' : 'K'}
                    </button>
                    <button onClick={() => { setShowSplitModal(true); setSelectedSplitFriends([activeChat.id]); }} className="w-12 h-12 flex-shrink-0 rounded-full bg-[#00d554] text-black flex items-center justify-center transition-transform hover:scale-105 shadow-md" title="Split Bill">
                        <BillIcon size={20} />
                    </button>
                    <div className="flex-1 bg-gray-100 dark:bg-[#2c2c2e] rounded-full px-4 py-2 flex items-center">
                        <input 
                            type="text" 
                            value={inputText} 
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Message..." 
                            className="bg-transparent flex-1 outline-none text-sm text-gray-800 dark:text-white placeholder-gray-500"
                        />
                    </div>
                    <button onClick={handleSendMessage} disabled={!inputText.trim()} className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md ${inputText.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-[#2c2c2e] text-gray-400'}`}>
                        <Send size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Split Bill Modal */}
                {showSplitModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white">Split the Bill</h3>
                                <button onClick={() => setShowSplitModal(false)} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full"><X size={20} className="text-gray-600 dark:text-white"/></button>
                            </div>
                            
                            <form onSubmit={handleSplitBill}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Total Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">{currency === 'USD' ? '$' : 'K'}</span>
                                        <input 
                                            type="number" 
                                            value={splitAmount}
                                            onChange={e => setSplitAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-100 dark:bg-[#2c2c2e] rounded-xl py-3 pl-10 pr-4 text-2xl font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Split with</label>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                        {contacts.map(contact => (
                                            <div key={contact.id} onClick={() => toggleSplitFriend(contact.id)} className={`flex items-center p-2 rounded-xl cursor-pointer border ${selectedSplitFriends.includes(contact.id) ? '' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#2c2c2e]'}`} style={{ backgroundColor: selectedSplitFriends.includes(contact.id) ? themes[accentColor].base + '20' : 'transparent', borderColor: selectedSplitFriends.includes(contact.id) ? themes[accentColor].base : 'transparent' }}>
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                                                    <img src={contact.avatar} alt={contact.name} className="w-full h-full" />
                                                </div>
                                                <span className="flex-1 font-medium text-gray-800 dark:text-white">{contact.name}</span>
                                                {selectedSplitFriends.includes(contact.id) && <CheckCircle size={18} className={themes[accentColor].text} fill="currentColor" color="white" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {splitAmount && selectedSplitFriends.length > 0 && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-[#2c2c2e] rounded-xl flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Per person</span>
                                        <span className="text-xl font-bold text-gray-800 dark:text-white">
                                            {currency === 'USD' ? '$' : 'K'}{(parseFloat(splitAmount) / (selectedSplitFriends.length + 1)).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <button type="submit" disabled={!splitAmount || selectedSplitFriends.length === 0} className={`w-full ${themes[accentColor].bg} text-black font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    Send Requests
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white">Send Money</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full"><X size={20} className="text-gray-600 dark:text-white"/></button>
                            </div>
                            
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden">
                                    <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Sending to</p>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{activeChat.name}</h4>
                                <p className={`text-sm font-bold ${themes[accentColor].text}`}>{activeChat.tag}</p>
                            </div>

                            <form onSubmit={handleSendPayment}>
                                <div className="relative mb-6">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">{currency === 'USD' ? '$' : 'K'}</span>
                                    <input 
                                        type="number" 
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className={`w-full ${themes[accentColor].bg} text-black font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity`}>
                                    Send Now
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Main List View ---
    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="Chat" onBack={onBack} />
            
            {/* Search Bar */}
            <div className="px-4 pb-2">
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center px-4 py-3 shadow-sm">
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input 
                        type="text" 
                        placeholder="Search people or tags..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent flex-1 outline-none text-gray-800 dark:text-white placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-grow p-4 space-y-2 overflow-y-auto no-scrollbar">
                {filteredContacts.map((contact) => (
                    <div key={contact.id} onClick={() => setActiveChat(contact)} className="flex items-center gap-4 bg-white dark:bg-[#1c1c1e] p-4 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                <img src={contact.avatar} alt={contact.name} className="w-full h-full" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1c1c1e]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800 dark:text-white truncate">{contact.name}</h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{contact.lastTime}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                {messages[contact.id] && messages[contact.id][messages[contact.id].length-1]?.sender === 'me' && <span className="text-xs">You: </span>}
                                {messages[contact.id] ? messages[contact.id][messages[contact.id].length-1]?.text : contact.lastMessage}
                            </p>
                        </div>
                    </div>
                ))}
                
                {filteredContacts.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No users found.</p>
                        <p className="text-sm mt-2">Try searching for an iPay tag.</p>
                    </div>
                )}
            </div>

            {/* FAB for New Chat with Menu */}
            <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-3">
                {showPlusMenu && (
                    <div className="flex flex-col items-end space-y-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        <button className="flex items-center gap-2 bg-white dark:bg-[#1c1c1e] px-4 py-2 rounded-full shadow-lg text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-[#2c2c2e]">
                            <span className="text-sm">Request</span>
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><ArrowDownLeft size={16}/></div>
                        </button>
                         <button className="flex items-center gap-2 bg-white dark:bg-[#1c1c1e] px-4 py-2 rounded-full shadow-lg text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-[#2c2c2e]">
                            <span className="text-sm">Contact</span>
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><User size={16}/></div>
                        </button>
                    </div>
                )}
                <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={`w-14 h-14 rounded-full ${themes[accentColor].bg} text-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`}>
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
};

const BillsScreen: FC<{ onBack: () => void; accentColor: ThemeColor; addTransaction: any; balanceUSD: number; currency: string; conversionRate: number }> = ({ onBack, accentColor, addTransaction, balanceUSD, currency, conversionRate }) => {
    const [status, setStatus] = useState<'success' | 'failure' | null>(null);
    const FEE_PERCENT = 0.005;

    const handlePayBill = (billName: string, amount: number) => {
        const fee = amount * FEE_PERCENT;
        const total = amount + fee;

        if (total > balanceUSD) {
            setStatus('failure');
            return;
        }

        addTransaction({
            icon: <Receipt size={18} />,
            type: `Paid ${billName}`,
            date: 'Just now',
            amount: amount.toFixed(2),
            isCredit: false,
            fee: fee,
            category: 'bill'
        }, fee);
        setStatus('success');
    }

    if (status) {
         return <div className="flex flex-col h-full bg-gray-50 dark:bg-black"><ScreenHeader title="Pay Bills" onBack={() => setStatus(null)} /><TransactionStatusScreen status={status} title={status === 'success' ? 'Success!' : 'Payment Failed'} message={status === 'success' ? `Bill paid successfully.` : 'Insufficient funds for bill + fee.'} onDone={() => setStatus(null)} accentColor={accentColor} /></div>;
    }

    const bills = [
        { name: 'Zesco', icon: <Zap size={24} />, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500', amount: 50.00 },
        { name: 'Water', icon: <Droplets size={24} />, color: 'bg-blue-500', gradient: 'from-blue-400 to-cyan-500', amount: 35.00 },
        { name: 'Internet', icon: <Globe size={24} />, color: 'bg-purple-500', gradient: 'from-purple-400 to-pink-500', amount: 80.00 },
        { name: 'DSTV', icon: <Tv size={24} />, color: 'bg-red-500', gradient: 'from-red-400 to-pink-600', amount: 45.00 },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
            <ScreenHeader title="Pay Bills" onBack={onBack} />
            <div className="p-6 overflow-y-auto no-scrollbar space-y-8">
                 {/* Hero Card */}
                 <div className={`relative overflow-hidden p-8 rounded-[2rem] shadow-2xl ${themes[accentColor].bg} text-black`}>
                    <div className="relative z-10">
                        <p className="text-sm font-bold opacity-70 uppercase tracking-widest mb-1">Total Due</p>
                        <h2 className="text-5xl font-black tracking-tighter">$210.00</h2>
                        <div className="mt-4 flex items-center gap-2 bg-black/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                            <AlertCircle size={14} />
                            <p className="text-xs font-bold">Due by Feb 28</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                 </div>

                 {/* Categories Grid */}
                 <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 px-2">Select Category</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {bills.map((bill, i) => (
                            <div key={i} onClick={() => handlePayBill(bill.name, bill.amount)} className="relative overflow-hidden bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group active:scale-95 border border-transparent hover:border-gray-100 dark:hover:border-[#333]">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bill.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {bill.icon}
                                </div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{bill.name}</h4>
                                <p className="text-sm text-gray-400 font-medium mt-1">${bill.amount.toFixed(2)}</p>
                                
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                    <div className="bg-gray-100 dark:bg-[#2c2c2e] p-2 rounded-full">
                                        <ArrowUpRight size={16} className="text-gray-800 dark:text-white"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 {/* Quick Pay Section */}
                 <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">Quick Pay</h3>
                        <button className={`text-xs font-bold ${themes[accentColor].text}`}>View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {[1,2,3].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#2c2c2e] flex items-center justify-center text-gray-400">
                                    <Plus size={20} />
                                </div>
                                <div className="w-12 h-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full"></div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};

const MicroloansScreen: FC<{ onBack: () => void; accentColor: ThemeColor }> = ({ onBack, accentColor }) => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
        <ScreenHeader title="Microloans" onBack={onBack} />
        <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
             {/* Credit Score Card */}
             <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-50"></div>
                
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Credit Score</p>
                        <p className="text-xs text-gray-300 mt-1">Updated just now</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>+12 pts</span>
                    </div>
                </div>
                
                <div className="relative w-64 h-32 mx-auto mb-2">
                    {/* SVG Gauge */}
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                        {/* Background Track */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-gray-100 dark:text-[#2c2c2e]" />
                        
                        {/* Progress Arc (720/850 approx 85%) */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#scoreGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="60" className="transition-all duration-1000 ease-out" />
                        
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="50%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    {/* Score Text */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 flex flex-col items-center">
                        <h2 className="text-6xl font-black text-gray-800 dark:text-white tracking-tighter">720</h2>
                        <p className="text-green-500 font-bold text-sm mt-1">Excellent</p>
                    </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-8 max-w-xs mx-auto leading-relaxed">
                    Your credit score is in the top 15% of users! You qualify for premium rates.
                </p>
             </div>

             {/* Loan Offers */}
             <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">Available Offers</h3>
                    <button className={`text-xs font-bold ${themes[accentColor].text}`}>See All</button>
                </div>

                {/* Hero Offer */}
                <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-lg ${themes[accentColor].bg} text-black mb-4 group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-sm">
                            <Zap size={24} className="text-black" />
                        </div>
                        <span className="bg-black/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-black/5">Instant Approval</span>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-sm font-bold opacity-70 mb-1 uppercase tracking-wider">Payday Advance</p>
                        <h4 className="text-4xl font-black mb-6 tracking-tight">$500.00</h4>
                        
                        <div className="flex items-center justify-between text-sm font-bold bg-white/40 p-1 pl-4 rounded-xl backdrop-blur-md border border-white/20">
                            <span>Repay in 30 days</span>
                            <div className="bg-black text-white p-3 rounded-lg">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Offer */}
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-[#2c2c2e] flex items-center justify-between group cursor-not-allowed opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-5">
                        <div className="bg-gray-50 dark:bg-[#2c2c2e] p-4 rounded-2xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-lg">Business Loan</h4>
                            <p className="text-sm text-gray-500">Unlock at 750 score</p>
                        </div>
                    </div>
                    <Lock size={20} className="text-gray-300 dark:text-gray-600" />
                </div>
             </div>

             {/* Active Loans */}
             <div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 px-2">Active Loans</h3>
                <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2rem] flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-[#2c2c2e]">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-lg">Debt Free!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">You don't have any active loans at the moment.</p>
                </div>
             </div>
        </div>
    </div>
);

const SpendingStoryScreen: FC<{ onBack: () => void; accentColor: ThemeColor }> = ({ onBack, accentColor }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const previousMonth = date.toLocaleString('default', { month: 'long' });

    const slides = [
        {
            bg: "bg-gradient-to-br from-purple-600 to-blue-600",
            content: (
                <>
                    <h1 className="text-6xl font-black mb-4 tracking-tighter">Your {previousMonth}</h1>
                    <h2 className="text-4xl font-bold opacity-90">Wrapped 🎁</h2>
                    <p className="mt-8 text-lg font-medium">It was a vibe. Let's recap.</p>
                </>
            )
        },
        {
            bg: "bg-[#1DB954]", // Spotify Green-ish
            content: (
                <>
                    <span className="text-8xl mb-6 animate-bounce">🎧</span>
                    <h2 className="text-3xl font-bold mb-2">Main Character Energy</h2>
                    <p className="text-xl font-medium opacity-90">$12.99 on Spotify</p>
                    <p className="mt-8 text-sm opacity-75">That's a lot of sad girl music.</p>
                </>
            )
        },
        {
            bg: "bg-orange-500",
            content: (
                <>
                    <span className="text-8xl mb-6">🍔</span>
                    <h2 className="text-3xl font-bold mb-2">Foodie Alert</h2>
                    <p className="text-xl font-medium opacity-90">$145.50 on UberEats</p>
                    <p className="mt-8 text-sm opacity-75">Cooking? Never heard of her.</p>
                </>
            )
        },
        {
            bg: "bg-pink-500",
            content: (
                <>
                    <span className="text-8xl mb-6">💅</span>
                    <h2 className="text-3xl font-bold mb-2">Glow Up</h2>
                    <p className="text-xl font-medium opacity-90">$95.00 on Self Care</p>
                    <p className="mt-8 text-sm opacity-75">Worth every penny.</p>
                </>
            )
        },
        {
            bg: "bg-black",
            content: (
                <>
                    <h2 className="text-2xl font-bold mb-6 uppercase tracking-widest text-gray-400">Your Money Mood</h2>
                    <span className="text-9xl mb-6 block">💸</span>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">Material Gworl</h1>
                    <p className="mt-8 text-lg text-gray-300">"I see it, I like it, I want it, I got it."</p>
                </>
            )
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentSlide < slides.length - 1) {
                setCurrentSlide(c => c + 1);
            } else {
                // Optional: Auto-close on finish? 
                // onBack(); 
            }
        }, 4000);
        return () => clearTimeout(timer);
    }, [currentSlide]);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(c => c + 1);
        else onBack();
    };

    const handlePrev = () => {
        if (currentSlide > 0) setCurrentSlide(c => c - 1);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col text-white transition-colors duration-500 ease-in-out ${slides[currentSlide].bg}`} onClick={handleNext}>
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full flex gap-1 p-2 z-50 safe-top">
                {slides.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-white ${i < currentSlide ? 'w-full' : 'w-0'}`}
                            style={i === currentSlide ? { animation: 'progress 4s linear forwards' } : {}}
                        />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>

            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="absolute top-6 right-4 z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 backdrop-blur-sm"><X size={24}/></button>
            
            {/* Navigation Zones */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500 key={currentSlide}">
                {slides[currentSlide].content}
            </div>
            
            <div className="absolute bottom-8 w-full text-center text-xs font-bold uppercase tracking-widest opacity-50">
                Tap to continue
            </div>
        </div>
    );
};

// --- Savings Quest Screen (GAMIFIED) ---
const SavingsQuestScreen: FC<{ onBack: () => void; accentColor: ThemeColor; addTransaction: any; balanceUSD: number; currency: string }> = ({ onBack, accentColor, addTransaction, balanceUSD, currency }) => {
    const [goal, setGoal] = useState({ 
        name: 'The Next Level Laptop', 
        target: 1500, 
        saved: 850, 
        level: 3 
    });
    const [depositAmount, setDepositAmount] = useState('');
    const [status, setStatus] = useState<'deposit' | 'complete' | 'failure' | null>(null);

    const progressPercent = Math.min(100, (goal.saved / goal.target) * 100);
    const remaining = goal.target - goal.saved;

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(depositAmount);
        if (amountNum > 0) {
            if (amountNum > balanceUSD) {
                setStatus('failure');
                return;
            }

            const newSaved = goal.saved + amountNum;
            const isGoalComplete = newSaved >= goal.target;

            addTransaction({ 
                icon: <PiggyBank size={18}/>, 
                type: `Savings Deposit: ${goal.name}`, 
                date: 'Just now', 
                amount: amountNum.toFixed(2), 
                isCredit: false,
                category: 'savings'
            }); 
            
            setGoal(prev => ({
                ...prev,
                saved: newSaved,
                level: isGoalComplete ? prev.level + 1 : prev.level // Level up on completion
            }));
            
            setStatus(isGoalComplete ? 'complete' : 'deposit');
            setDepositAmount('');
        }
    };

    const resetAndBack = () => { setStatus(null); onBack(); };

    if (status === 'deposit' || status === 'complete' || status === 'failure') {
        const title = status === 'complete' ? 'GOAL CONQUERED!' : (status === 'failure' ? 'Transaction Failed' : 'Deposit Successful!');
        const message = status === 'complete' 
            ? `You hit your target of $${goal.target}! Time to claim your reward and set a new quest.`
            : (status === 'failure' 
                ? 'Insufficient funds to complete this deposit.' 
                : `You added $${depositAmount} to your quest and earned 100 XP! ${remaining > 0 ? `$${remaining.toFixed(2)} to go!` : 'Goal Complete!'}`);

        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
                <ScreenHeader title="Savings Quest" onBack={resetAndBack} />
                <TransactionStatusScreen 
                    status={status === 'failure' ? 'failure' : 'success'} 
                    title={title} 
                    message={message} 
                    onDone={resetAndBack} 
                    accentColor={accentColor} 
                >
                    {status === 'complete' && (
                        <Award size={60} className="text-white mb-4 animate-bounce" />
                    )}
                </TransactionStatusScreen>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            <ScreenHeader title="Savings Quest" onBack={onBack} />
            <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
                {/* Gamified Header */}
                <div className={`bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-xl flex justify-between items-center mb-6 border-b-4`} style={{borderColor: themes[accentColor].base}}>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Current Level</p>
                        <p className={`text-4xl font-extrabold ${themes[accentColor].text}`}>Level {goal.level}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <PiggyBank size={48} className={`${themes[accentColor].text}`} />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Quest Master</p>
                    </div>
                </div>

                {/* Goal Details */}
                <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{goal.name}</h3>
                    
                    <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-600 dark:text-gray-400">Target: ${goal.target.toFixed(2)}</span>
                        <span className={`${themes[accentColor].text}`}>Saved: ${goal.saved.toFixed(2)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-[#2c2c2e] rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-500`} 
                            style={{ width: `${progressPercent}%`, backgroundColor: themes[accentColor].base }}
                        />
                    </div>
                    
                    <div className="text-center pt-2">
                        {remaining > 0 ? (
                            <p className="text-xl font-extrabold text-gray-800 dark:text-white">${remaining.toFixed(2)} left!</p>
                        ) : (
                            <p className={`text-xl font-extrabold ${themes[accentColor].text}`}>Goal Achieved!</p>
                        )}
                    </div>
                </div>

                {/* Deposit Form */}
                <form onSubmit={handleDeposit} className="mt-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Quick Deposit</h3>
                    <FormInput 
                        label={`Amount to Save (${currency === 'USD' ? '$' : 'K'})`}
                        type="number" 
                        step="1.00" 
                        value={depositAmount} 
                        onChange={e => setDepositAmount(e.target.value)} 
                        placeholder="e.g., 50.00" 
                        required 
                        accentColor={accentColor} 
                        className="text-lg"
                    />
                    <button 
                        type="submit" 
                        className={`w-full ${themes[accentColor].bg} text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity`}
                        disabled={remaining <= 0}
                    >
                        {remaining <= 0 ? 'Goal Complete - Set New Quest' : 'Deposit Now & Earn XP'}
                    </button>
                </form>

            </div>
        </div>
    );
};

// --- Main App ---
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth State
    const [view, setView] = useState<'client' | 'agent'>('client');
    const [screen, setScreen] = useState('home');
    const [theme, setTheme] = useState('dark');
    const [accentColor, setAccentColor] = useState<ThemeColor>('green'); // Default to Green for Cash App style
    
    const [currency, setCurrency] = useState('USD');
    const conversionRate = 25.0; 
    const toggleCurrency = () => { setCurrency(c => c === 'USD' ? 'ZMW' : 'USD'); };
    
    const [userProfile, setUserProfile] = useState<UserProfile>({ 
        name: "Alex Morgan", 
        skinTone: "edb98a", 
        gender: "feminine", 
        seed: "Alex", 
        style: "avataaars", 
        fixedHair: null, 
        noBeard: false,
        cardSkin: {
            background: `linear-gradient(135deg, #10b981 0%, #000000 100%)`, // Default Green
            pattern: null,
            id: 'green'
        }
    });

    // Client State
    const [clientBalanceUSD, setClientBalanceUSD] = useState(1000.00);
    const [clientTransactions, setClientTransactions] = useState<Transaction[]>([]);
    
    // Agent State
    const [agentBalanceUSD, setAgentBalanceUSD] = useState(5000.00);
    const [agentCommissionUSD, setAgentCommissionUSD] = useState(145.50);
    const [agentTransactions, setAgentTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                initializeUser(session.user);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                initializeUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const initializeUser = async (user: any) => {
        const meta = user.user_metadata;
        if (meta) {
            if (meta.ipayTag) {
                setUserProfile(prev => ({ ...prev, name: `@${meta.ipayTag}` }));
                
                // Ensure profile exists for P2P lookups (Self-healing for existing users)
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    username: meta.ipayTag,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                if (profileError) console.warn('Profile sync failed', profileError);
            }
            if (meta.balance !== undefined) {
                // We use calculated balance from transactions as source of truth now, 
                // but this is a good fallback for initial render
                setClientBalanceUSD(meta.balance);
            }
            if (meta.avatarUrl) {
                setUserProfile(prev => ({ ...prev, avatarUrl: meta.avatarUrl }));
            }
            // Add persistence loading for theme and accentColor
            if (meta.theme) {
                setTheme(meta.theme);
            }
            if (meta.accentColor) {
                setAccentColor(meta.accentColor);
            }
            // Load Card Skin
            if (meta.cardSkin) {
                setUserProfile(prev => ({ ...prev, cardSkin: meta.cardSkin }));
            }
        }
        await fetchTransactions(user.id);

        // Subscribe to real-time changes for this user's transactions
        const channel = supabase
            .channel('realtime-transactions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // When a new transaction comes in (e.g. received money), refresh
                    fetchTransactions(user.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    const fetchTransactions = async (userId: string) => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const fetchedClientTx: Transaction[] = [];
            const fetchedAgentTx: Transaction[] = [];
            
            // Calculate balances (Base + Transactions)
            let calculatedClientBalance = 1250.75; 

            data.forEach((row: any) => {
                const tx: Transaction = {
                    id: row.id,
                    icon: getIconForCategory(row.category || 'activity'),
                    type: row.type,
                    date: formatDate(row.created_at),
                    amount: row.amount.toString(),
                    isCredit: row.is_credit,
                    fee: row.fee,
                    commission: row.commission,
                    category: row.category,
                    role: row.role
                };
                
                const amt = parseFloat(tx.amount);

                if (row.role === 'agent') {
                    fetchedAgentTx.push(tx);
                } else {
                    fetchedClientTx.push(tx);
                    // Update calculated balance
                    if (tx.isCredit) {
                        calculatedClientBalance += amt;
                    } else {
                        calculatedClientBalance -= (amt + (tx.fee || 0));
                    }
                }
            });
            setClientTransactions(fetchedClientTx);
            setAgentTransactions(fetchedAgentTx);
            
            // Override metadata balance with calculated balance to include P2P receipts
            setClientBalanceUSD(calculatedClientBalance);
        }
    };

    const updateSupabaseBalance = async (newBalance: number) => {
        await supabase.auth.updateUser({ data: { balance: newBalance } });
    }

    // New handlers for persisting settings
    const updateTheme = async (newTheme: string) => {
        setTheme(newTheme);
        if (isAuthenticated) {
            await supabase.auth.updateUser({ data: { theme: newTheme } });
        }
    }

    const updateAccentColor = async (newColor: ThemeColor) => {
        setAccentColor(newColor);
        if (isAuthenticated) {
            await supabase.auth.updateUser({ data: { accentColor: newColor } });
        }
    }

    // Function to handle full profile updates including avatarUrl persistence
    const handleProfileUpdate = async (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        if (isAuthenticated) {
            await supabase.auth.updateUser({
                data: {
                    ipayTag: updatedProfile.name.replace('@', ''),
                    skinTone: updatedProfile.skinTone,
                    gender: updatedProfile.gender,
                    seed: updatedProfile.seed,
                    style: updatedProfile.style,
                    fixedHair: updatedProfile.fixedHair,
                    noBeard: updatedProfile.noBeard,
                    avatarUrl: updatedProfile.avatarUrl,
                    cardSkin: updatedProfile.cardSkin
                }
            });
        }
    };

    const handleCardSkinUpdate = async (newSkin: { background: string; pattern: string | null; id: string }) => {
        const updatedProfile = { ...userProfile, cardSkin: newSkin };
        setUserProfile(updatedProfile);
        if (isAuthenticated) {
            await supabase.auth.updateUser({
                data: {
                    cardSkin: newSkin
                }
            });
        }
    };

    const addClientTransaction = async (tx: Transaction, fee = 0) => { 
        let newBalance = clientBalanceUSD;
        if (!tx.isCredit) { 
            // Deduct total (Amount + Fee)
            newBalance = clientBalanceUSD - (parseFloat(tx.amount) + fee);
        } else { 
            newBalance = clientBalanceUSD + parseFloat(tx.amount);
        }
        
        setClientBalanceUSD(newBalance);
        setClientTransactions(prev => [tx, ...prev]); 
        
        // Persist to Supabase if authenticated
        if (isAuthenticated) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await updateSupabaseBalance(newBalance);
                await supabase.from('transactions').insert({
                    user_id: user.id,
                    type: tx.type,
                    amount: parseFloat(tx.amount),
                    is_credit: tx.isCredit,
                    category: tx.category || 'activity',
                    fee: fee,
                    role: 'client'
                });

                // P2P Transfer Logic: If sending money, try to credit the recipient
                if (!tx.isCredit && tx.type.startsWith('Sent to ')) {
                    const recipientTag = tx.type.replace('Sent to ', '').trim();
                    // 1. Find recipient ID from profiles
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('username', recipientTag)
                        .limit(1);
                    
                    if (profiles && profiles.length > 0) {
                        const recipientId = profiles[0].id;
                        // 2. Insert credit transaction for recipient
                        await supabase.from('transactions').insert({
                            user_id: recipientId,
                            type: `Received from ${userProfile.name}`,
                            amount: parseFloat(tx.amount),
                            is_credit: true,
                            category: 'receive',
                            role: 'client'
                        });
                    }
                }
            }
        }
    };

    // --- AGENT LOGIC: INTERACTIVE HANDLER ---
    const handleAgentAction = async (type: string, amount: number, phone: string) => {
        if (type === 'Deposit') {
            const commission = amount * 0.001;
            if (agentBalanceUSD < amount) return false;

            // Local State Update
            setAgentBalanceUSD(prev => prev - amount); 
            setAgentCommissionUSD(prev => prev + commission);
            
            setAgentTransactions(prev => [{ icon: <ArrowDownLeft size={18}/>, type: `Deposit to ${phone}`, date: 'Just now', amount: amount.toFixed(2), isCredit: false, commission: commission, category: 'deposit', role: 'agent' }, ...prev]);
            
            // DB Persistence
            if (isAuthenticated) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // 1. Agent Log
                    await supabase.from('transactions').insert({
                        user_id: user.id,
                        type: `Deposit to ${phone}`,
                        amount: amount,
                        is_credit: false, // Float decreases
                        category: 'deposit',
                        commission: commission,
                        role: 'agent'
                    });
                }
            }
            return true;

        } else if (type === 'Withdrawal') {
            const fee = amount * 0.05;
            const agentCommission = fee * 0.60;

            // Local State Update
            setAgentBalanceUSD(prev => prev + amount); 
            setAgentCommissionUSD(prev => prev + agentCommission);
            
            setAgentTransactions(prev => [{ icon: <ArrowUpRight size={18}/>, type: `Withdraw from ${phone}`, date: 'Just now', amount: amount.toFixed(2), isCredit: true, commission: agentCommission, category: 'withdraw', role: 'agent' }, ...prev]);
            
            // DB Persistence
            if (isAuthenticated) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // 1. Agent Log
                    await supabase.from('transactions').insert({
                        user_id: user.id,
                        type: `Withdraw from ${phone}`,
                        amount: amount,
                        is_credit: true, // Float increases
                        category: 'withdraw',
                        commission: agentCommission,
                        role: 'agent'
                    });
                }
            }
            return true;
        }
        return false;
    };

    const handleWithdrawCommission = () => {
        if (agentCommissionUSD > 0) {
            setAgentBalanceUSD(prev => prev + agentCommissionUSD);
            setAgentCommissionUSD(0);
            return true; // Return boolean to match expectations if needed
        }
        return false;
    };

    const handleLogin = () => setIsAuthenticated(true);
    const handleLogout = async () => { 
        await supabase.auth.signOut();
        setIsAuthenticated(false); 
        setScreen('home'); 
    };
    
    const handleAgentRegistration = () => {
        // Update profile to approved status
        const updatedProfile = { ...userProfile, agentStatus: 'approved' as const };
        handleProfileUpdate(updatedProfile);
        setScreen('settings');
    };

    // Type checking for screen map - using ReactNode
    const screenMap: Record<string, ReactNode> = { 
        'auth': <AuthScreen onLogin={handleLogin} accentColor={accentColor} />,
        'settings': <SettingsScreen onBack={() => setScreen('home')} theme={theme} setTheme={updateTheme} accentColor={accentColor} setAccentColor={updateAccentColor} onLogout={handleLogout} setScreen={setScreen} view={view} setView={setView} profile={userProfile} />,
        'agentRegistration': <AgentRegistrationScreen onBack={() => setScreen('settings')} onRegister={handleAgentRegistration} accentColor={accentColor} />,
        'profileEditor': <ProfileEditorScreen onBack={() => setScreen('settings')} profile={userProfile} setProfile={handleProfileUpdate} accentColor={accentColor} />,
        'send': <SendMoneyScreen onBack={() => setScreen('home')} addTransaction={addClientTransaction} balanceUSD={clientBalanceUSD} accentColor={accentColor} currency={currency} conversionRate={conversionRate} />, 
        'withdraw': <ClientWithdrawScreen onBack={() => setScreen('home')} addTransaction={addClientTransaction} balanceUSD={clientBalanceUSD} accentColor={accentColor} currency={currency} conversionRate={conversionRate} />,
        'history': <ClientHistoryScreen onBack={() => setScreen('home')} transactions={clientTransactions} accentColor={accentColor} currency={currency} conversionRate={conversionRate} />,
        'clientTools': <ClientToolsScreen onBack={() => setScreen('home')} accentColor={accentColor} setScreen={setScreen} />,
        'clientQRCode': <ClientQRCodeScreen onBack={() => setScreen('clientTools')} accentColor={accentColor} profile={userProfile} />,
        'spendingStory': <SpendingStoryScreen onBack={() => setScreen('clientTools')} accentColor={accentColor} />,
        'savingsQuest': <SavingsQuestScreen onBack={() => setScreen('clientTools')} accentColor={accentColor} addTransaction={addClientTransaction} balanceUSD={clientBalanceUSD} currency={currency} />,
        'card': <VirtualCardScreen onBack={() => setScreen('home')} accentColor={accentColor} clientName={userProfile.name} cardSkin={userProfile.cardSkin || { background: `linear-gradient(135deg, ${themes[accentColor].base} 0%, #000000 100%)`, pattern: null, id: 'default' }} onSaveSkin={handleCardSkinUpdate} />,
        'chat': <ChatScreen onBack={() => setScreen('home')} accentColor={accentColor} addTransaction={addClientTransaction} balanceUSD={clientBalanceUSD} currency={currency} conversionRate={conversionRate} />,
        'bills': <BillsScreen onBack={() => setScreen('home')} accentColor={accentColor} addTransaction={addClientTransaction} balanceUSD={clientBalanceUSD} currency={currency} conversionRate={conversionRate} />,
        'microloans': <MicroloansScreen onBack={() => setScreen('home')} accentColor={accentColor} />,
        // Agent Screens - Pass handler
        'agentDeposit': <AgentActionScreen onBack={() => setScreen('home')} title="Deposit to Client" type="Deposit" accentColor={accentColor} onConfirm={handleAgentAction} agentBalance={agentBalanceUSD} currency={currency} conversionRate={conversionRate} />,
        'agentWithdraw': <AgentActionScreen onBack={() => setScreen('home')} title="Client Withdrawal" type="Withdrawal" accentColor={accentColor} onConfirm={handleAgentAction} agentBalance={agentBalanceUSD} currency={currency} conversionRate={conversionRate} />,
        'agentRegister': <AgentActionScreen onBack={() => setScreen('home')} title="Register New User" type="Registration" accentColor={accentColor} onConfirm={() => true} agentBalance={agentBalanceUSD} currency={currency} conversionRate={conversionRate} />,
        'agentReports': <ReportsScreen onBack={() => setScreen('home')} accentColor={accentColor} agentTransactions={agentTransactions} commissionUSD={agentCommissionUSD} currency={currency} conversionRate={conversionRate} onWithdrawCommission={handleWithdrawCommission} />,
        'agentTools': <AgentToolsScreen onBack={() => setScreen('home')} accentColor={accentColor} setScreen={setScreen} />,
    };

    const homeScreen = view === 'client' 
        ? <ClientDashboard transactions={clientTransactions} balanceUSD={clientBalanceUSD} setScreen={setScreen} accentColor={accentColor} currency={currency} toggleCurrency={toggleCurrency} conversionRate={conversionRate} profile={userProfile}/> 
        : <AgentDashboard transactions={agentTransactions} balanceUSD={agentBalanceUSD} commissionUSD={agentCommissionUSD} setScreen={setScreen} accentColor={accentColor} currency={currency} toggleCurrency={toggleCurrency} conversionRate={conversionRate} />;

    const currentScreenComponent = !isAuthenticated ? screenMap['auth'] : (screen === 'home' ? homeScreen : (screenMap[screen] || homeScreen));

    useEffect(() => {
        // Update body background color based on theme
        document.body.style.backgroundColor = theme === 'dark' ? '#000000' : '#f3f4f6'; // black or gray-100
    }, [theme]);

    return (
        <div className={`${theme} min-h-screen font-sans bg-gray-100 dark:bg-black text-black dark:text-white flex flex-col`}>
            <div className="flex-grow overflow-y-auto no-scrollbar relative flex flex-col bg-gray-100 dark:bg-black">
                {currentScreenComponent}
            </div>
        </div>
    );
}