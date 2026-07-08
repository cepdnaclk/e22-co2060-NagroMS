import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    LayoutDashboard, Calendar, MessageSquare, BookOpen,
    Users, Settings, LogOut, GraduationCap, UserPlus
} from 'lucide-react';
import { logout } from '../../../utils/firebase.js';
import { RoleSwitcher } from '../../../components/RoleSwitcher.jsx';
import { useExpertData } from '../hooks/useExpertData';
import '../expertLayout.css';

const navItems = [
    { to: '/expert-dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/expert-dashboard/connections', label: 'Connections', icon: UserPlus },
    { to: '/expert-dashboard/consultations', label: 'Consultations', icon: Calendar },
    { to: '/expert-dashboard/qa', label: 'Q&A Forum', icon: MessageSquare },
    { to: '/expert-dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/expert-dashboard/farmers', label: 'My Network', icon: Users },
];

const pageTitles = {
    '/expert-dashboard': 'Overview',
    '/expert-dashboard/connections': 'Connections',
    '/expert-dashboard/consultations': 'Consultations',
    '/expert-dashboard/qa': 'Q&A Forum',
    '/expert-dashboard/knowledge': 'Knowledge Base',
    '/expert-dashboard/farmers': 'My Network',
    '/expert-dashboard/settings': 'Settings',
};

export default function ExpertLayout() {
    const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
    const token = localStorage.getItem('nagroms_token');
    const navigate = useNavigate();
    const location = useLocation();
    const { data: overviewData } = useExpertData('overview');

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsub();
    }, []);

    // Still loading auth state — show nothing to avoid flash
    if (user === undefined) {
        return (
            <div className="exp-dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="exp-spinner" />
            </div>
        );
    }

    if (!user && !token) return <Navigate to="/login" replace />;

    const pendingCount = overviewData?.stats?.pendingConnections ?? 0;
    const profileName = overviewData?.profile?.name || localStorage.getItem('userName') || 'Expert';
    const pageTitle = pageTitles[location.pathname] || 'Expert Dashboard';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="exp-dashboard-container">
            {/* Sidebar — matches farmer dashboard */}
            <div className="exp-sidebar">
                <div className="exp-sidebar-brand">
                    <div className="exp-sidebar-logo">
                        <GraduationCap size={24} />
                    </div>
                    <h1>NagroMS</h1>
                </div>

                <nav className="exp-sidebar-nav">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `exp-sidebar-item${isActive ? ' exp-sidebar-item-active' : ''}`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                            {to.includes('connections') && pendingCount > 0 && (
                                <span className="exp-sidebar-badge">{pendingCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="exp-sidebar-bottom">
                    <NavLink
                        to="/expert-dashboard/settings"
                        className={({ isActive }) =>
                            `exp-sidebar-item${isActive ? ' exp-sidebar-item-active' : ''}`
                        }
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </NavLink>
                    <button className="exp-sidebar-item exp-sidebar-logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="exp-main-content" style={{ backgroundColor: '#f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 32px 0' }}>
                    <RoleSwitcher currentRole="expert" />
                </div>

                <div className="exp-content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
