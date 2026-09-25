import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
    Menu, Home, MessageSquare, DollarSign, LogOut, Search, Activity
} from 'lucide-react';
import { auth, db } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '../../i18n/LanguageContext';

const INITIAL_FINANCIAL_RATES = [];
const INITIAL_COMPLAINTS = [];

const ds = {
    primary: '#1f2937',   // Dark Slate
    secondary: '#374151', // Lighter Slate
    bg: '#f3f4f6',        // Light Gray
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    white: '#ffffff',
    danger: '#ef4444',
    success: '#10b981',
    blue: '#3b82f6'
};

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', margin: '4px 0', borderRadius: '8px', cursor: 'pointer',
            background: active ? `${ds.primary}10` : 'transparent',
            color: active ? ds.primary : ds.textMuted,
            fontWeight: active ? '600' : '500',
            transition: 'all 0.2s ease',
            borderLeft: active ? `4px solid ${ds.primary}` : '4px solid transparent'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon size={20} color={active ? ds.primary : ds.textMuted} />
            <span>{label}</span>
        </div>
        {badge > 0 && (
            <span style={{
                background: ds.danger, color: '#fff', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'
            }}>
                {badge}
            </span>
        )}
    </div>
);

const Sidebar = ({ active, setActive, onNavigate, pendingComplaints }) => {
    const { t } = useLanguage();
    
    return (
        <div style={{
            width: 280, height: '100%', background: ds.white, borderRight: `1px solid ${ds.border}`,
            display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10
        }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: ds.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={24} color="#fff" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: ds.primary }}>Admin Panel</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: ds.textMuted }}>System Overview</p>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                <NavItem icon={Home} label="Overview" active={active === 'dashboard'} onClick={() => setActive('dashboard')} />
                <NavItem icon={MessageSquare} label="Complaints" active={active === 'complaints'} onClick={() => setActive('complaints')} badge={pendingComplaints} />
                <NavItem icon={DollarSign} label="Financial Providers" active={active === 'providers'} onClick={() => setActive('providers')} />
                <NavItem icon={Activity} label="Financial Dashboard" active={false} onClick={() => {
                    localStorage.setItem('serviceProviderType', 'financial');
                    window.location.href = '/service-provider-dashboard';
                }} />
            </nav>

            <div style={{ padding: '16px', borderTop: `1px solid ${ds.border}` }}>
                <NavItem
                    icon={LogOut}
                    label={t('customer.sidebar.logout') || "Logout"}
                    active={false}
                    onClick={async () => {
                        try { await signOut(auth); onNavigate('landing'); }
                        catch(e) { console.warn('Sign out error:', e); }
                    }}
                />
            </div>
        </div>
    );
};

const TopNav = ({ section }) => {
    return (
        <div style={{
            height: 72, background: ds.white, borderBottom: `1px solid ${ds.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'relative', zIndex: 5
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 40 }} className="mobile-hidden"></div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: ds.text, textTransform: 'capitalize' }}>
                    {section === 'dashboard' ? 'Overview' : section}
                </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: `${ds.primary}10`, borderRadius: '24px', color: ds.primary }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ds.success }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Admin Active</span>
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------
// Sub-Components
// -----------------------------------------

const DashboardHome = ({ complaints, rates }) => {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: `1px solid ${ds.border}` }}>
                    <p style={{ color: ds.textMuted, margin: '0 0 8px 0', fontSize: 14 }}>Total Complaints</p>
                    <h3 style={{ margin: 0, fontSize: 32, color: ds.primary }}>{complaints.length}</h3>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: `1px solid ${ds.border}` }}>
                    <p style={{ color: ds.textMuted, margin: '0 0 8px 0', fontSize: 14 }}>Pending Complaints</p>
                    <h3 style={{ margin: 0, fontSize: 32, color: ds.danger }}>{complaints.filter(c => c.status === 'Pending').length}</h3>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: `1px solid ${ds.border}` }}>
                    <p style={{ color: ds.textMuted, margin: '0 0 8px 0', fontSize: 14 }}>Bank Rates Tracked</p>
                    <h3 style={{ margin: 0, fontSize: 32, color: ds.blue }}>{rates.length}</h3>
                </div>
            </div>
        </div>
    );
};

const ComplaintsManager = ({ complaints, orders = [] }) => {
    const [replyText, setReplyText] = useState({});

    const handleReply = async (id) => {
        if (!replyText[id]) return;
        try {
            await updateDoc(doc(db, 'complaints', id), {
                reply: replyText[id],
                status: 'Resolved',
                updatedAt: serverTimestamp()
            });
            setReplyText(prev => ({...prev, [id]: ''}));
        } catch(e) { console.error(e); }
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <h2 style={{ marginTop: 0 }}>User Complaints</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {complaints.length === 0 ? <p>No complaints filed yet.</p> : complaints.map(c => {
                    const relatedOrder = orders.find(o => o.id === c.orderId);
                    
                    return (
                    <div key={c.id} style={{ background: '#fff', padding: 24, borderRadius: 12, border: `1px solid ${ds.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                                <span style={{ fontSize: 12, color: '#fff', background: c.status === 'Pending' ? ds.danger : ds.success, padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                                    {c.status}
                                </span>
                                <span style={{ fontSize: 14, color: ds.textMuted, marginLeft: 12 }}>Role: {c.role}</span>
                            </div>
                            <span style={{ fontSize: 12, color: ds.textMuted }}>{c.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</span>
                        </div>
                        
                        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {c.orderId && <span style={{ fontSize: 13, color: ds.textMuted }}><strong>Order ID:</strong> {c.orderId}</span>}
                            {c.customerId && <span style={{ fontSize: 13, color: ds.textMuted }}><strong>Customer ID:</strong> {c.customerId}</span>}
                        </div>

                        {relatedOrder && (
                            <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#f8fafc', border: `1px solid ${ds.border}` }}>
                                <h4 style={{ margin: '0 0 8px 0', color: ds.primary, fontSize: 14 }}>Order Details</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 13, color: ds.text }}>
                                    <div><strong>Status:</strong> {relatedOrder.status}</div>
                                    <div><strong>Total:</strong> Rs. {relatedOrder.totalAmount || relatedOrder.total || 0}</div>
                                    <div><strong>Date:</strong> {relatedOrder.date || (relatedOrder.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown')}</div>
                                    <div><strong>Payment:</strong> {relatedOrder.paymentMethod}</div>
                                </div>
                                {(relatedOrder.products || relatedOrder.items) && (
                                    <div style={{ marginTop: 8, fontSize: 12, color: ds.textMuted }}>
                                        <strong>Items:</strong> {(relatedOrder.products || relatedOrder.items).map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                    </div>
                                )}
                            </div>
                        )}

                        <p style={{ margin: '0 0 16px 0', color: ds.text, whiteSpace: 'pre-wrap', background: `${ds.primary}05`, padding: 12, borderRadius: 8 }}>{c.content}</p>
                        
                        {c.reply ? (
                            <div style={{ background: `${ds.success}10`, padding: 16, borderRadius: 8, borderLeft: `4px solid ${ds.success}` }}>
                                <p style={{ margin: 0, fontSize: 14, color: ds.text }}><strong>Admin Reply:</strong> {c.reply}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <input 
                                    type="text" 
                                    value={replyText[c.id] || ''}
                                    onChange={e => setReplyText({...replyText, [c.id]: e.target.value})}
                                    placeholder="Type your reply to resolve this complaint..."
                                    style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: `1px solid ${ds.border}` }}
                                />
                                <button onClick={() => handleReply(c.id)} style={{ padding: '10px 24px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                    Reply & Resolve
                                </button>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

const FinancialManager = ({ rates }) => {
    const [bankName, setBankName] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [description, setDescription] = useState('');

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'financialRates'), {
                bankName,
                interestRate,
                description,
                updatedAt: serverTimestamp()
            });
            setBankName(''); setInterestRate(''); setDescription('');
        } catch(e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Remove this bank rate?')) {
            try { await deleteDoc(doc(db, 'financialRates', id)); } catch(e) { console.error(e); }
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', background: '#fff', padding: 24, borderRadius: 12, border: `1px solid ${ds.border}`, height: 'fit-content' }}>
                <h3 style={{ marginTop: 0 }}>Add Bank Rate</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input required placeholder="Bank Name (e.g., BOC)" value={bankName} onChange={e => setBankName(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${ds.border}` }} />
                    <input required placeholder="Interest Rate (e.g., 8.5%)" value={interestRate} onChange={e => setInterestRate(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${ds.border}` }} />
                    <textarea placeholder="Description or requirements..." value={description} onChange={e => setDescription(e.target.value)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${ds.border}` }} rows={3} />
                    <button type="submit" style={{ padding: 12, background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                        Publish Rate
                    </button>
                </form>
            </div>
            
            <div style={{ flex: '2 1 400px' }}>
                <div style={{ display: 'grid', gap: 16 }}>
                    {rates.map(rate => (
                        <div key={rate.id} style={{ background: '#fff', padding: 20, borderRadius: 12, border: `1px solid ${ds.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', color: ds.primary }}>{rate.bankName}</h3>
                                <p style={{ margin: 0, fontSize: 14, color: ds.textMuted }}>{rate.description}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontSize: 24, fontWeight: 'bold', color: ds.success }}>{rate.interestRate}</span>
                                <button onClick={() => handleDelete(rate.id)} style={{ padding: '6px 12px', background: ds.danger, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FinancialProvidersManager = ({ providers }) => {
    const [selectedProvider, setSelectedProvider] = useState(null);

    const handleTerminate = async (id, isActive) => {
        const action = isActive !== false ? 'terminate' : 'reactivate';
        if(window.confirm(`Are you sure you want to ${action} this provider?`)) {
            try { 
                await updateDoc(doc(db, 'users', id), { isActive: isActive === false }); 
            } catch(e) { console.error(e); }
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <h2 style={{ marginTop: 0 }}>Financial Service Providers</h2>
            <div style={{ display: 'grid', gap: 16 }}>
                {providers.length === 0 ? <p>No financial providers found.</p> : providers.map(p => (
                    <div key={p.id} style={{ background: '#fff', padding: 20, borderRadius: 12, border: `1px solid ${ds.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', color: ds.primary }}>{p.businessName || p.fullName}</h3>
                            <p style={{ margin: 0, fontSize: 14, color: ds.textMuted }}>
                                Email: {p.email} | Contact: {p.contactPersonName || p.phone} | Status: <span style={{color: p.isActive !== false ? ds.success : ds.danger, fontWeight: 'bold'}}>{p.isActive !== false ? 'Active' : 'Terminated'}</span>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                onClick={() => setSelectedProvider(p)} 
                                style={{ padding: '8px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Oversee Activities
                            </button>
                            <button 
                                onClick={() => handleTerminate(p.id, p.isActive)} 
                                style={{ padding: '8px 16px', background: p.isActive !== false ? ds.danger : ds.success, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {p.isActive !== false ? 'Terminate' : 'Reactivate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProvider && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: 600, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: ds.primary }}>Activity Log: {selectedProvider.businessName || selectedProvider.fullName}</h2>
                            <button onClick={() => setSelectedProvider(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: ds.textMuted }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <p style={{ margin: '0 0 16px 0', fontWeight: 'bold', color: ds.textMuted }}>Recent Actions (Simulated)</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ borderLeft: `4px solid ${ds.success}`, paddingLeft: 12 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Approved Loan Application #APP-3839</p>
                                    <p style={{ margin: 0, fontSize: 13, color: ds.textMuted }}>Today at 10:45 AM • For farmer Nimal Fernando (Rs 480,000)</p>
                                </div>
                                <div style={{ borderLeft: `4px solid ${ds.blue}`, paddingLeft: 12 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Created New Loan Scheme</p>
                                    <p style={{ margin: 0, fontSize: 13, color: ds.textMuted }}>Yesterday at 2:15 PM • "Subsidised Agri Loan" at 5.0% interest</p>
                                </div>
                                <div style={{ borderLeft: `4px solid ${ds.danger}`, paddingLeft: 12 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Rejected Loan Application #APP-3836</p>
                                    <p style={{ margin: 0, fontSize: 13, color: ds.textMuted }}>Yesterday at 11:30 AM • For farmer Amara Jayaweera</p>
                                </div>
                                <div style={{ borderLeft: `4px solid ${ds.textMuted}`, paddingLeft: 12 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Logged in to system</p>
                                    <p style={{ margin: 0, fontSize: 13, color: ds.textMuted }}>Oct 12 at 8:00 AM</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${ds.border}`, background: '#f9fafb' }}>
                            <button onClick={() => setSelectedProvider(null)} style={{ width: '100%', padding: 12, background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// -----------------------------------------
// Main Layout
// -----------------------------------------

export default function AdminDashboard({ onNavigate }) {
    const [section, setSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
    const [rates, setRates] = useState(INITIAL_FINANCIAL_RATES);
    const [providers, setProviders] = useState([]);
    const [orders, setOrders] = useState([]);

    const handleSetSection = (s) => {
        setSection(s);
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };

    useEffect(() => {
        let uC;
        let uR;
        let uUsers;
        let uOrders;

        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (!user) {
                onNavigate('login');
            } else {
                const qC = query(collection(db, 'complaints'));
                uC = onSnapshot(qC, snap => {
                    const arr = [];
                    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
                    arr.sort((a,b) => {
                        if(a.status === 'Pending' && b.status !== 'Pending') return -1;
                        if(b.status === 'Pending' && a.status !== 'Pending') return 1;
                        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
                    });
                    setComplaints(arr);
                }, err => console.error("Admin complaints fetch error:", err));

                const qR = query(collection(db, 'financialRates'));
                uR = onSnapshot(qR, snap => {
                    const arr = [];
                    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
                    setRates(arr);
                });

                const qUsers = query(collection(db, 'users'));
                uUsers = onSnapshot(qUsers, snap => {
                    const arr = [];
                    snap.forEach(d => {
                        const data = d.data();
                        if (data.roles?.includes('service-provider') && data.serviceCategories?.includes('financial')) {
                            arr.push({ id: d.id, ...data });
                        }
                    });
                    setProviders(arr);
                });

                const qOrders = query(collection(db, 'orders'));
                uOrders = onSnapshot(qOrders, snap => {
                    const arr = [];
                    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
                    setOrders(arr);
                }, err => console.error("Admin orders fetch error:", err));
            }
        });

        return () => { 
            unsubscribeAuth(); 
            if (uC) uC(); 
            if (uR) uR(); 
            if (uUsers) uUsers(); 
            if (uOrders) uOrders();
        };
    }, [onNavigate]);

    const renderSection = () => {
        switch (section) {
            case 'dashboard': return <DashboardHome complaints={complaints} rates={rates} />;
            case 'complaints': return <ComplaintsManager complaints={complaints} orders={orders} />;
            case 'providers': return <FinancialProvidersManager providers={providers} />;
            default: return <DashboardHome complaints={complaints} rates={rates} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: ds.bg, overflow: 'hidden' }}>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-sidebar {
                        position: fixed !important;
                        top: 0; left: 0; bottom: 0;
                        transition: transform 0.3s ease-in-out;
                    }
                    .mobile-sidebar.closed { transform: translateX(-100%) !important; }
                    .mobile-sidebar.open { transform: translateX(0) !important; }
                    .mobile-hidden { display: none !important; }
                    .hamburger-btn { display: block !important; }
                }
                .hamburger-btn { display: none; }
            `}</style>
            
            <button 
                className="hamburger-btn"
                onClick={() => setIsSidebarOpen(true)}
                style={{ position: 'absolute', top: 16, left: 16, zIndex: 100, background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}
            >
                <Menu style={{ width: 24, height: 24 }} />
            </button>

            <div className={`mobile-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} style={{ zIndex: 10 }}>
                <Sidebar active={section} setActive={handleSetSection} onNavigate={onNavigate} pendingComplaints={complaints.filter(c => c.status === 'Pending').length} />
            </div>
            
            <div className="mobile-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} />
                <main className="mobile-main" style={{ flex: 1, padding: '24px', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
                    {renderSection()}
                </main>
            </div>

            {isSidebarOpen && window.innerWidth <= 768 && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9 }}
                />
            )}
        </div>
    );
}
