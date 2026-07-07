import { useState } from 'react';
import {
    LayoutDashboard, Landmark, FileText,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, Clock, CheckCircle,
} from 'lucide-react';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#0a1d37 0%,#1e3a8a 50%,#0f172a 100%)',
    primary: '#1d4ed8',
    primaryLt: '#eff6ff',
    primaryBd: '#bfdbfe',
    green: '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#f3f4f6', surface: '#ffffff',
    border: '#e5e7eb', borderLt: '#f3f4f6',
    text: '#111827', textSec: '#4b5563', textTer: '#9ca3af',
    shadow: '0 1px 3px rgba(0,0,0,0.05)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fef3c7', amberBd: '#fde68a',
    red: '#dc2626', redLt: '#fef2f2', redBd: '#fecaca',
    purple: '#8b5cf6', purpleLt: '#f5f3ff', purpleBd: '#ddd6fe',
    teal: '#0891b2', tealLt: '#ecfeff', tealBd: '#a5f3fc',
};

const SCHEMES = [
    { id: 'SCH-001', name: 'Crop Development Loan', type: 'Seasonal', interestRate: 7.5, minAmount: 25000, maxAmount: 500000, repaymentPeriod: '6–18 months', eligibility: 'Registered farmers with NIC', status: 'Active', applications: 42 },
    { id: 'SCH-002', name: 'Equipment Purchase Loan', type: 'Asset Finance', interestRate: 8.0, minAmount: 50000, maxAmount: 2000000, repaymentPeriod: '12–60 months', eligibility: 'Farmers with >2 acres land', status: 'Active', applications: 28 },
    { id: 'SCH-003', name: 'Greenhouse Setup Loan', type: 'Investment', interestRate: 6.5, minAmount: 100000, maxAmount: 5000000, repaymentPeriod: '24–84 months', eligibility: 'Commercial agri businesses', status: 'Active', applications: 15 },
    { id: 'SCH-004', name: 'Organic Farming Loan', type: 'Subsidised', interestRate: 5.0, minAmount: 15000, maxAmount: 300000, repaymentPeriod: '12–36 months', eligibility: 'Certified organic farmers', status: 'Active', applications: 31 },
];

const APPLICATIONS = [
    { id: 'APP-3841', farmer: 'Sunil Perera', cropType: 'Paddy Rice', farmSize: '4.5 acres', purpose: 'Seasonal paddy funding', requestedAmount: 85000, applicationDate: '2026-07-04', status: 'Pending', district: 'Anuradhapura', contact: '077 123 4567' },
    { id: 'APP-3840', farmer: 'Kamala Silva', cropType: 'Vegetables', farmSize: '2.0 acres', purpose: 'Drip irrigation setup', requestedAmount: 145000, applicationDate: '2026-07-03', status: 'Under Review', district: 'Kandy', contact: '081 222 3344' },
    { id: 'APP-3839', farmer: 'Nimal Fernando', cropType: 'Cinnamon', farmSize: '6.0 acres', purpose: 'Greenhouse construction', requestedAmount: 480000, applicationDate: '2026-07-02', status: 'Approved', district: 'Galle', contact: '091 333 4455' },
    { id: 'APP-3836', farmer: 'Amara Jayaweera', cropType: 'Banana', farmSize: '5.0 acres', purpose: 'Fertiliser bulk purchase', requestedAmount: 55000, applicationDate: '2026-06-28', status: 'Rejected', district: 'Kurunegala', contact: '070 666 7788' },
];

const INTEREST_RATES = [
    { id: 'IR-01', loanType: 'Seasonal Crop Loan', rate: 7.5, period: '6–18 months' },
    { id: 'IR-02', loanType: 'Asset Finance Loan', rate: 8.0, period: '12–60 months' },
    { id: 'IR-03', loanType: 'Investment Loan', rate: 6.5, period: '24–84 months' },
    { id: 'IR-04', loanType: 'Subsidised Agri Loan', rate: 5.0, period: '12–36 months' },
];

const MONTHLY_APPS = [
    { month: 'Jan', applications: 24, approved: 18 },
    { month: 'Feb', applications: 31, approved: 22 },
    { month: 'Mar', applications: 44, approved: 35 },
    { month: 'Apr', applications: 38, approved: 28 },
    { month: 'May', applications: 52, approved: 41 },
    { month: 'Jun', applications: 61, approved: 48 },
    { month: 'Jul', applications: 55, approved: 43 },
];

const LOAN_TYPE_DIST = [
    { name: 'Seasonal', value: 34, color: ds.green },
    { name: 'Asset Finance', value: 22, color: ds.primary },
    { name: 'Investment', value: 18, color: ds.purple },
    { name: 'Subsidised', value: 26, color: ds.amber },
];

const AMOUNT_DIST = [
    { range: 'Rs 10K–50K', count: 28 },
    { range: 'Rs 50K–100K', count: 41 },
    { range: 'Rs 100K–500K', count: 32 },
    { range: 'Rs 500K+', count: 12 },
];

const ACTIVITIES = [
    { time: '8 min ago', icon: '📋', text: 'New application APP-3841 from Sunil Perera — Paddy Rice, Rs 85,000', color: ds.primary },
    { time: '45 min ago', icon: '✅', text: 'Application APP-3839 marked approved — Nimal Fernando', color: ds.green },
    { time: '2 hr ago', icon: '📊', text: 'Interest rate updated for Subsidised Agri Loan: 5.0% effective today', color: ds.amber },
];

const appStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    'Under Review': { bg: ds.primaryLt, color: '#1e40af', dot: ds.primary },
    Approved: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Rejected: { bg: ds.redLt, color: '#991b1b', dot: ds.red },
};

const Badge = ({ label, cfg }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: ds.fontB, padding: '3px 9px', borderRadius: 99, background: cfg?.bg || '#f3f4f6', color: cfg?.color || '#374151', whiteSpace: 'nowrap' }}>
        {cfg?.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}{label}
    </span>
);
const TH = ({ children }) => <th style={{ padding: '11px 16px', fontFamily: ds.fontB, fontSize: 11, fontWeight: 600, color: ds.textSec, textAlign: 'left', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${ds.border}`, background: '#f9fafb', whiteSpace: 'nowrap' }}>{children}</th>;
const TD = ({ children, mono }) => <td style={{ padding: '13px 16px', fontFamily: mono ? ds.fontM : ds.fontB, fontSize: 13, color: ds.text, borderBottom: `1px solid ${ds.borderLt}`, verticalAlign: 'middle' }}>{children}</td>;

function KpiCard({ label, value, sub, icon, iconBg, iconColor }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>{icon}</div>
            </div>
            <p style={{ fontFamily: ds.fontM, fontSize: 24, fontWeight: 700, color: ds.text, margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontFamily: ds.fontB, fontSize: 11, fontWeight: 600, color: ds.textTer, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontFamily: ds.fontB, fontSize: 12, color: ds.textSec, margin: 0 }}>{sub}</p>
        </div>
    );
}

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }) {
    const NAV = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'schemes', label: 'Loan Schemes', icon: Landmark },
        { id: 'applications', label: 'Loan Applications', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💳</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Credit Portal</p></div>}
            </div>

            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV.map(item => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                        <button key={item.id} onClick={() => setActive(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', fontFamily: ds.fontB, fontSize: 13, fontWeight: isActive ? 600 : 500 }}>
                            <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => onNavigate('landing')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: ds.fontB, fontSize: 12 }}>
                    <LogOut style={{ width: 14, height: 14 }} />
                    {!collapsed && <span>Logout</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 11 }}>
                    {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <><ChevronLeft style={{ width: 14, height: 14 }} /><span>Collapse</span></>}
                </button>
            </div>
        </aside>
    );
}

function TopNav({ section }) {
    const labels = { dashboard: 'Dashboard Overview', schemes: 'Loan Schemes', applications: 'Loan Applications', settings: 'Settings' };
    const businessName = localStorage.getItem('businessName') || 'Agri Financial Services';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Financial Services Management · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>🏦</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection }) {
    const activeSchemes = SCHEMES.filter(s => s.status === 'Active').length;
    const pendingApps = APPLICATIONS.filter(a => a.status === 'Pending').length;
    const approvedApps = APPLICATIONS.filter(a => a.status === 'Approved').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Active Loan Schemes" value={String(activeSchemes)} sub="Available for farmers" icon={<Landmark style={{ width: 18, height: 18 }} />} iconBg={ds.primaryLt} iconColor={ds.primary} />
                <KpiCard label="Pending Applications" value={String(pendingApps)} sub="Awaiting credit review" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} />
                <KpiCard label="Approved Loans" value={String(approvedApps)} sub="Approved this month" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Monthly Application Volume" value="55 Apps" sub="July 2026" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Applications Intake & Approvals</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY_APPS}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="applications" stroke={ds.primary} name="Applications" strokeWidth={2} />
                            <Line type="monotone" dataKey="approved" stroke={ds.green} name="Approved Loans" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Recent Financial Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {ACTIVITIES.map((a, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                                <span style={{ fontSize: 16 }}>{a.icon}</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500, color: ds.text }}>{a.text}</p>
                                    <p style={{ margin: 0, fontSize: 10, color: ds.textTer }}>{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoanSchemes() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justify: 'space-between', align: 'center' }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Offered Loan Products</h3>
                <button style={{ padding: '4px 10px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Scheme</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Scheme ID</TH>
                            <TH>Scheme Name</TH>
                            <TH>Type</TH>
                            <TH>Interest Rate</TH>
                            <TH>Min Amount</TH>
                            <TH>Max Amount</TH>
                            <TH>Repayment Period</TH>
                            <TH>Eligibility</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {SCHEMES.map(s => (
                            <tr key={s.id}>
                                <TD mono>{s.id}</TD>
                                <TD><strong>{s.name}</strong></TD>
                                <TD>{s.type}</TD>
                                <TD mono style={{ fontWeight: 600 }}>{s.interestRate}%</TD>
                                <TD mono>Rs {s.minAmount.toLocaleString()}</TD>
                                <TD mono>Rs {s.maxAmount.toLocaleString()}</TD>
                                <TD>{s.repaymentPeriod}</TD>
                                <TD style={{ fontSize: 11 }}>{s.eligibility}</TD>
                                <TD><Badge label={s.status} cfg={{ bg: ds.greenLt, color: ds.green, dot: ds.green }} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LoanApplications() {
    const [apps, setApps] = useState(APPLICATIONS);
    const handleAction = (id, newStatus) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Farmer Loan Applications</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>App ID</TH>
                            <TH>Farmer Name</TH>
                            <TH>Crop Type</TH>
                            <TH>Farm Size</TH>
                            <TH>Purpose</TH>
                            <TH>Requested Funding</TH>
                            <TH>Submitted Date</TH>
                            <TH>District</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(a => (
                            <tr key={a.id}>
                                <TD mono>{a.id}</TD>
                                <TD>{a.farmer}</TD>
                                <TD>{a.cropType}</TD>
                                <TD mono>{a.farmSize}</TD>
                                <TD>{a.purpose}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {a.requestedAmount.toLocaleString()}</TD>
                                <TD mono>{a.applicationDate}</TD>
                                <TD>{a.district}</TD>
                                <TD><Badge label={a.status} cfg={appStatusCfg[a.status]} /></TD>
                                <TD>
                                    {a.status === 'Pending' || a.status === 'Under Review' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleAction(a.id, 'Approved')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
                                            <button onClick={() => handleAction(a.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Completed</span>
                                    )}
                                </TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FinancialSettings() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 24, maxWidth: 600, boxShadow: ds.shadow }}>
            <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 750, color: ds.text, marginBottom: 16 }}>Financial Profile Configurations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Financial Institution Name</label>
                    <input type="text" defaultValue={localStorage.getItem('businessName') || 'Agri Financial Bank'} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Minimum Credit Score Required</label>
                    <select style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }}>
                        <option>No Minimum</option>
                        <option>Fair (580+)</option>
                        <option>Good (670+)</option>
                        <option>Excellent (740+)</option>
                    </select>
                </div>
                <div>
                    <button style={{ padding: '8px 16px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Update Profile</button>
                </div>
            </div>
        </div>
    );
}

export default function FinancialProviderDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const renderSection = () => {
        switch (section) {
            case 'dashboard': return <DashboardHome setSection={setSection} />;
            case 'schemes': return <LoanSchemes />;
            case 'applications': return <LoanApplications />;
            case 'settings': return <FinancialSettings />;
            default: return <DashboardHome setSection={setSection} />;
        }
    };

    return (
        <div style={{ display: 'flex', background: ds.bg, minHeight: '100vh', width: '100%' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={setSection} onNavigate={onNavigate} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} />
                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}