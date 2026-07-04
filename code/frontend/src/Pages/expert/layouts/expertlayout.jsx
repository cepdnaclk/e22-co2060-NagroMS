import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { LayoutDashboard, Calendar, MessageSquare, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { logout } from '../../../utils/firebase.js';
import { colors } from '../../../Styles/expertStyles';
import { RoleSwitcher } from '../../../components/RoleSwitcher.jsx';

const navItems = [
    { to: '/expert-dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/expert-dashboard/consultations', label: 'Consultations', icon: Calendar },
    { to: '/expert-dashboard/qa', label: 'Q&A Forum', icon: MessageSquare },
    { to: '/expert-dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/expert-dashboard/farmers', label: 'Farmers', icon: Users },
    { to: '/expert-dashboard/settings', label: 'Settings', icon: Settings },
];

export default function ExpertLayout() {
    const user = getAuth().currentUser;
    const token = localStorage.getItem('nagroms_token');
    const navigate = useNavigate();

    // Auth guard
    if (!user && !token) return <Navigate to="/login" replace />;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.bg }}>
            {/* Header / Brand */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 flex items-center justify-between px-6 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: '22px', fontWeight: '800', color: colors.text, letterSpacing: '-0.5px', fontFamily: "'Merriweather', Georgia, serif" }}>
                        Nagro<span style={{ color: colors.green }}>MS</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <RoleSwitcher currentRole="expert" />
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflow: 'auto', paddingBottom: '90px', paddingTop: '70px', transition: 'all 0.3s ease' }}>
                <div className="px-4 lg:px-8 py-4">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50 overflow-x-auto pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-green-100 bg-white/90 backdrop-blur-md flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 min-w-max">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center min-w-[72px] px-2 py-2 rounded-xl transition-all
                                ${isActive ? 'text-primary bg-green-50 shadow-inner' : 'text-gray-400 hover:text-primary hover:bg-gray-50'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className="mb-1" />
                                    <span className="text-[10px] font-semibold leading-none whitespace-nowrap tracking-wide">{label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    <div className="w-px h-8 bg-green-200 mx-2 hidden sm:block"></div>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center min-w-[72px] px-2 py-2 rounded-xl transition-all text-red-500 hover:bg-red-50"
                    >
                        <LogOut size={24} strokeWidth={1.5} className="mb-1" />
                        <span className="text-[10px] font-semibold leading-none whitespace-nowrap tracking-wide">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
