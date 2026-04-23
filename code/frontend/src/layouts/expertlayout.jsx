import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Menu } from 'lucide-react';
import ExpertSidebar from '../components/expertsidebar';
import { colors, shadows } from '../styles/expertStyles';

export default function ExpertLayout() {
    const user = getAuth().currentUser;
    const token = localStorage.getItem('nagroms_token');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth guard
    if (!user && !token) return <Navigate to="/login" replace />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
            {/* Top-left Hamburger Menu (Floating) */}
            <div style={styles.header}>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    style={styles.menuBtn}
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} color={colors.text} />
                </button>
            </div>

            <ExpertSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main content area pushes to the right when sidebar is open */}
            <main style={{
                ...styles.main,
                marginLeft: sidebarOpen ? '260px' : '0px',
                paddingLeft: sidebarOpen ? '48px' : '84px', // Space for the floating button when closed
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <Outlet />
            </main>
        </div>
    );
}

const styles = {
    header: {
        position: 'fixed',
        top: '24px', // Match main content top padding
        left: '24px',
        zIndex: 50,
    },
    menuBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        background: colors.white,
        boxShadow: shadows.sm,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 90,
        backdropFilter: 'blur(2px)',
    },
    main: {
        flex: 1, 
        overflow: 'auto',
    }
};