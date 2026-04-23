import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessageSquare, BookOpen, Users, Settings, LogOut, X } from 'lucide-react';
import { logout } from '../utils/firebase';
import { colors } from '../styles/expertStyles';

const navItems = [
    { to: '/expert-dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/expert-dashboard/consultations', label: 'Consultations', icon: Calendar },
    { to: '/expert-dashboard/qa', label: 'Q&A Forum', icon: MessageSquare },
    { to: '/expert-dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/expert-dashboard/farmers', label: 'My Farmers', icon: Users },
    { to: '/expert-dashboard/settings', label: 'Settings', icon: Settings },
];

export default function ExpertSidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside style={{
            ...styles.sidebar,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
            <div style={styles.logoRow}>
                <div style={styles.logo}>
                    <span style={styles.logoText}>Nagro<span style={styles.logoAccent}>MS</span></span>
                </div>
                <button 
                    onClick={() => setIsOpen(false)} 
                    style={styles.closeBtn}
                    aria-label="Close Sidebar"
                >
                    <X size={20} color={colors.textMuted} />
                </button>
            </div>

            <nav style={styles.nav}>
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        style={({ isActive }) => ({
                            ...styles.navItem,
                            ...(isActive ? styles.navItemActive : {}),
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} style={styles.logout}>
                <LogOut size={16} strokeWidth={1.5} />
                <span>Logout</span>
            </button>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: '260px',
        background: colors.white,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        minHeight: '100vh',
        boxShadow: '4px 0 24px rgba(31, 90, 46, 0.08)',
        // Fixed positioning to float over content and slide in/out
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 24px 24px',
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '12px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
    },
    logoText: {
        fontSize: '22px',
        fontWeight: '800',
        color: colors.text,
        letterSpacing: '-0.5px',
        fontFamily: "'Merriweather', Georgia, serif",
    },
    logoAccent: {
        color: colors.green,
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'background 0.2s',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '0 16px',
        flex: 1,
        overflowY: 'auto',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        color: colors.textMuted,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        fontFamily: "'Inter', 'Lato', sans-serif",
    },
    navItemActive: {
        background: colors.greenLight,
        color: colors.green,
        fontWeight: '600',
    },
    logout: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '16px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: colors.textMuted,
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Lato', sans-serif",
        transition: 'all 0.2s ease',
    },
};