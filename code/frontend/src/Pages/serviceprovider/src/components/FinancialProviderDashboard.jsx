import { useState, useMemo } from 'react';
import {
    LayoutDashboard, Landmark, FileText, Settings, LogOut,
    ChevronLeft, ChevronRight, Bell, Search, Plus, Eye,
    Check, X, Download, TrendingUp, Clock, CheckCircle,
    ArrowUpRight, AlertTriangle, ShieldCheck, Tag,
    MessageSquare, Send, Paperclip, Filter, User, Users
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#0a1d37 0%,#1e3a8a 50%,#0f172a 100%)',
    primary: '#1d4ed8',
    primaryLt: '#eff6ff',
    primaryBd: '#bfdbfe',
    green: '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#f8fafc', surface: '#ffffff',
    border: '#e2e8f0', borderLt: '#f1f5f9',
    text: '#0f172a', textSec: '#475569', textTer: '#94a3b8',
    shadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fef3c7', amberBd: '#fde68a',
    red: '#dc2626', redLt: '#fef2f2', redBd: '#fecaca',
    purple: '#8b5cf6', purpleLt: '#f5f3ff', purpleBd: '#ddd6fe',
    teal: '#0891b2', tealLt: '#ecfeff', tealBd: '#a5f3fc',
};

const INITIAL_SCHEMES = [
    { id: 'SCH-001', name: 'Crop Development Loan', type: 'Seasonal', interestRate: 7.5, minAmount: 25000, maxAmount: 500000, repaymentPeriod: '6–18 months', eligibility: 'Registered farmers with NIC', status: 'Active', applications: 42 },
    { id: 'SCH-002', name: 'Equipment Purchase Loan', type: 'Asset Finance', interestRate: 8.0, minAmount: 50000, maxAmount: 2000000, repaymentPeriod: '12–60 months', eligibility: 'Farmers with >2 acres land', status: 'Active', applications: 28 },
    { id: 'SCH-003', name: 'Greenhouse Setup Loan', type: 'Investment', interestRate: 6.5, minAmount: 100000, maxAmount: 5000000, repaymentPeriod: '24–84 months', eligibility: 'Commercial agri businesses', status: 'Active', applications: 15 },
    { id: 'SCH-004', name: 'Organic Farming Loan', type: 'Subsidised', interestRate: 5.0, minAmount: 15000, maxAmount: 300000, repaymentPeriod: '12–36 months', eligibility: 'Certified organic farmers', status: 'Active', applications: 31 },
];

const INITIAL_APPLICATIONS = [
    { id: 'APP-3841', farmer: 'Sunil Perera', cropType: 'Paddy Rice', farmSize: '4.5 acres', purpose: 'Seasonal paddy funding', requestedAmount: 85000, applicationDate: '2026-07-04', status: 'Pending', district: 'Anuradhapura', contact: '077 123 4567' },
    { id: 'APP-3840', farmer: 'Kamala Silva', cropType: 'Vegetables', farmSize: '2.0 acres', purpose: 'Drip irrigation setup', requestedAmount: 145000, applicationDate: '2026-07-03', status: 'Under Review', district: 'Kandy', contact: '081 222 3344' },
    { id: 'APP-3839', farmer: 'Nimal Fernando', cropType: 'Cinnamon', farmSize: '6.0 acres', purpose: 'Greenhouse construction', requestedAmount: 480000, applicationDate: '2026-07-02', status: 'Approved', district: 'Galle', contact: '091 333 4455' },
    { id: 'APP-3836', farmer: 'Amara Jayaweera', cropType: 'Banana', farmSize: '5.0 acres', purpose: 'Fertiliser bulk purchase', requestedAmount: 55000, applicationDate: '2026-06-28', status: 'Rejected', district: 'Kurunegala', contact: '070 666 7788' },
];

const INITIAL_INTEREST_RATES = [
    { id: 'IR-01', loanType: 'Seasonal Crop Loan', rate: 7.5, period: '6–18 months' },
    { id: 'IR-02', loanType: 'Asset Finance Loan', rate: 8.0, period: '12–60 months' },
    { id: 'IR-03', loanType: 'Investment Loan', rate: 6.5, period: '24–84 months' },
    { id: 'IR-04', loanType: 'Subsidised Agri Loan', rate: 5.0, period: '12–36 months' },
];

const INITIAL_DOCUMENTS = [
    { id: 'DOC-101', farmer: 'Sunil Perera', appId: 'APP-3841', name: 'NIC Card Copy', status: 'Verified', date: '2026-07-04' },
    { id: 'DOC-102', farmer: 'Sunil Perera', appId: 'APP-3841', name: 'Land Registry Deed', status: 'Verification Pending', date: '2026-07-04' },
    { id: 'DOC-103', farmer: 'Kamala Silva', appId: 'APP-3840', name: 'Tax Returns Ledger', status: 'Verified', date: '2026-07-03' },
    { id: 'DOC-104', farmer: 'Kamala Silva', appId: 'APP-3840', name: 'NIC Card Copy', status: 'Verified', date: '2026-07-03' },
    { id: 'DOC-105', farmer: 'Nimal Fernando', appId: 'APP-3839', name: 'Crop Valuation Sheet', status: 'Verified', date: '2026-07-02' },
];

const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'alert', text: 'NIC Verification expired for farmer Sunil Perera', date: '2026-07-08', status: 'unread' },
    { id: 2, type: 'update', text: 'Application APP-3839 approved for disbursement contract dispatch', date: '2026-07-07', status: 'read' },
    { id: 3, type: 'reminder', text: 'Review outstanding interest ledger for seasonal schemes by July 15', date: '2026-07-05', status: 'read' },
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

function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend, trendUp = true }) {
    return (
        <div style={{ 
            background: `linear-gradient(135deg, ${ds.surface} 0%, ${iconBg}15 100%)`, 
            borderRadius: 20, 
            border: `1px solid ${ds.border}`, 
            padding: '22px 20px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255,255,255,0.6)', 
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255,255,255,0.6)';
        }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: iconBg }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)' }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: trendUp ? '#15803d' : '#b91c1c', 
                        background: trendUp ? '#f0fdf4' : '#fef2f2', 
                        padding: '4px 8px', 
                        borderRadius: 99, 
                        border: `1px solid ${trendUp ? '#bbf7d0' : '#fecaca'}`,
                        fontFamily: ds.fontB
                    }}>
                        {trend}
                    </span>
                )}
            </div>
            <p style={{ fontFamily: ds.fontM, fontSize: 26, fontWeight: 800, color: ds.text, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{value}</p>
            <p style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 700, color: ds.textSec, margin: '0 0 2px 0', letterSpacing: '0.02em' }}>{label}</p>
            <p style={{ fontFamily: ds.fontB, fontSize: 12, color: ds.textTer, margin: 0 }}>{sub}</p>
        </div>
    );
}

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }) {
    const NAV = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'schemes', label: 'Loan Schemes', icon: Landmark },
        { id: 'applications', label: 'Loan Applications', icon: FileText },
        { id: 'rates', label: 'Interest Rates', icon: Tag },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'messages', label: 'Customer Messages', icon: MessageSquare },
        { id: 'documents', label: 'Documents', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💳</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Credit Portal</p></div>}
            </div>

            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
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

function TopNav({ section, accountType, setAccountType }) {
    const labels = {
        dashboard: 'Dashboard Overview',
        schemes: 'Agri Loan Schemes',
        applications: 'Farmer Credit Applications',
        rates: 'Interest Rates Matrix',
        analytics: 'Credit Metrics & Demand',
        messages: 'Customer Secure Messages',
        documents: 'Document Checking Desk',
        notifications: 'Credit Alerts',
        settings: 'Configuration Settings'
    };

    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Financial Services Management · NagroMS</p>
            </div>
            
            {/* Adaptive Profile Switcher Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: `1px solid ${ds.border}` }}>
                    <button onClick={() => setAccountType('individual')} style={{ padding: '6px 12px', background: accountType === 'individual' ? '#fff' : 'transparent', color: accountType === 'individual' ? ds.primary : ds.textSec, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, boxShadow: accountType === 'individual' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                        <User style={{ width: 12, height: 12 }} /> Individual Lender
                    </button>
                    <button onClick={() => setAccountType('business')} style={{ padding: '6px 12px', background: accountType === 'business' ? '#fff' : 'transparent', color: accountType === 'business' ? ds.primary : ds.textSec, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, boxShadow: accountType === 'business' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                        <Users style={{ width: 12, height: 12 }} /> Institution
                    </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: `1px solid ${ds.primaryBd}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>🏦</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.primary }}>
                        {accountType === 'business' ? 'Central Commercial Bank' : 'Nimal Fernando (Lender)'}
                    </span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection, schemes, applications, accountType }) {
    const activeSchemes = schemes.filter(s => s.status === 'Active').length;
    const pendingApps = applications.filter(a => a.status === 'Pending').length;
    const approvedApps = applications.filter(a => a.status === 'Approved').length;

    // Adapt statistics based on user account type
    const totalDisbursed = accountType === 'business' ? 'Rs 28.5M' : 'Rs 2.4M';
    const activeBorrowers = accountType === 'business' ? '128 Farmers' : '14 Farmers';
    const applicationsCount = accountType === 'business' ? '55 Apps' : '6 Requests';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label={accountType === 'business' ? 'Active Bank Loan Schemes' : 'Personal Loan Schemes'} value={String(activeSchemes)} sub="Listed on farmer market" icon={<Landmark style={{ width: 18, height: 18 }} />} iconBg={ds.primaryLt} iconColor={ds.primary} />
                <KpiCard label="Pending Applications" value={String(pendingApps)} sub="Requires credit review" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} />
                <KpiCard label={accountType === 'business' ? 'Total Branch Disbursed' : 'Personal Lending Portfolio'} value={totalDisbursed} sub={`Allocated to ${activeBorrowers}`} icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Application Intake" value={applicationsCount} sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
            </div>

            {/* Quick Actions Panel */}
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 12px 0' }}>Lending Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => setSection('schemes')} style={{ padding: '10px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus style={{ width: 16, height: 16 }} /> Add Scheme
                    </button>
                    <button onClick={() => setSection('rates')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag style={{ width: 16, height: 16 }} /> Update Rates
                    </button>
                    <button onClick={() => setSection('applications')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText style={{ width: 16, height: 16 }} /> Review Applications
                    </button>
                    <button onClick={() => setSection('analytics')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Download style={{ width: 16, height: 16 }} /> Monthly Report
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Applications Intake & Approvals</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY_APPS}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="applications" stroke={ds.primary} name="Applications Intake" strokeWidth={2} />
                            <Line type="monotone" dataKey="approved" stroke={ds.green} name="Approved Loans" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
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

function LoanSchemes({ schemes, accountType }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>
                        {accountType === 'business' ? 'Offered Bank Loan Schemes' : 'Personal Loan Products'}
                    </h3>
                    <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Manage listed financial packages visible to farming cooperatives.</p>
                </div>
                <button style={{ padding: '6px 12px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Scheme</button>
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
                        {schemes.map(s => (
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

function LoanApplications({ apps, handleAction, accountType }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>
                    {accountType === 'business' ? 'Organization Credit Applications' : 'Individual Borrower Requests'}
                </h3>
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
                                            <button onClick={() => handleAction(a.id, 'Approved')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve for Contact</button>
                                            <button onClick={() => handleAction(a.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                            <button onClick={() => alert(`Requesting additional collateral registry for ${a.farmer}`)} style={{ padding: '4px 8px', background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Req Info</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Logged Status</span>
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

function InterestRates({ rates, handleRateChange }) {
    const [editId, setEditId] = useState(null);
    const [tempRate, setTempRate] = useState('');

    const saveRate = (id) => {
        const parsed = parseFloat(tempRate);
        if (isNaN(parsed)) return;
        handleRateChange(id, parsed);
        setEditId(null);
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: 0 }}>Interest Rate Matrix</h3>
                <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Manage current annual interest charges for micro-financing.</p>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Loan Category</TH>
                            <TH>Annual Percentage Rate (APR)</TH>
                            <TH>Repayment Period</TH>
                            <TH>Last Updated</TH>
                            <TH>Action</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {rates.map(r => (
                            <tr key={r.id}>
                                <TD><strong>{r.loanType}</strong></TD>
                                <TD mono>
                                    {editId === r.id ? (
                                        <input type="number" step="0.1" value={tempRate} onChange={e => setTempRate(e.target.value)} style={{ width: 80, padding: 4 }} />
                                    ) : (
                                        `${r.rate.toFixed(2)}%`
                                    )}
                                </TD>
                                <TD>{r.period}</TD>
                                <TD mono>{new Date().toISOString().split('T')[0]}</TD>
                                <TD>
                                    {editId === r.id ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => saveRate(r.id)} style={{ padding: '4px 8px', background: ds.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Save</button>
                                            <button onClick={() => setEditId(null)} style={{ padding: '4px 8px', background: '#e5e7eb', color: ds.text, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setEditId(r.id); setTempRate(r.rate); }} style={{ padding: '4px 8px', background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Edit</button>
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

function FinancialAnalytics() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <KpiCard label="Average Credit Score" value="710" sub="Verified farmers benchmark" icon={<ShieldCheck style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Loan Approval Ratio" value="78.2%" sub="Approved / total application ratio" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Total Applications Received" value="382" sub="All-time farmer demand" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Popular Loan Scheme Distribution</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={LOAN_TYPE_DIST} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                                {LOAN_TYPE_DIST.map((d, index) => <Cell key={index} fill={d.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Intake Demand by Crop Category</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                        {[
                            { name: 'Paddy Rice Funding', demand: '42%', color: ds.primary },
                            { name: 'Vegetables Micro Loans', demand: '28%', color: ds.green },
                            { name: 'Spices Setup Loans', demand: '18%', color: ds.purple },
                            { name: 'Floriculture / Tea setup', demand: '12%', color: ds.amber }
                        ].map(c => (
                            <div key={c.name}>
                                <div style={{ display: 'flex', justify: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                                    <span>{c.demand}</span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                                    <div style={{ width: c.demand, height: '100%', background: c.color, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomerMessages() {
    const [conversations, setConversations] = useState([
        { id: 'c1', name: 'Sunil Perera', role: 'Farmer borrower', lastMessage: 'Sent crop registry copies.', unread: 1, online: true },
        { id: 'c2', name: 'Kamala Silva', role: 'Vegetable Farmer', lastMessage: 'Need extension on Seasonal Crop loan.', unread: 0, online: false }
    ]);
    const [activeChat, setActiveChat] = useState('c1');
    const [messages, setMessages] = useState({
        c1: [
            { id: 1, sender: 'them', text: 'Hi, is my Paddy loan APP-3841 approved yet?', time: '08:45 AM' },
            { id: 2, sender: 'me', text: 'Good morning Sunil. We verified your NIC, but are waiting on the Land registry deed copy.', time: '09:00 AM' },
            { id: 3, sender: 'them', text: 'Sent crop registry copies via the documents tab just now.', time: '09:02 AM' }
        ],
        c2: [
            { id: 1, sender: 'them', text: 'Hello, due to floods in Kandy, need extension on Seasonal Crop loan.', time: 'Yesterday' },
            { id: 2, sender: 'me', text: 'Understood Kamala. Please submit a written request with flood details under support tickets.', time: 'Yesterday' }
        ]
    });
    const [text, setText] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const msg = {
            id: Date.now(),
            sender: 'me',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({ ...prev, [activeChat]: [...prev[activeChat], msg] }));
        setConversations(prev => prev.map(c => c.id === activeChat ? { ...c, lastMessage: text } : c));
        setText('');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', height: 'calc(100vh - 140px)', boxShadow: ds.shadow }}>
            <div style={{ borderRight: `1px solid ${ds.border}`, background: '#f8fafc' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${ds.border}` }}>
                    <input type="text" placeholder="Search secure chats..." style={{ width: '100%', padding: '6px 10px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 12 }} />
                </div>
                <div style={{ overflowY: 'auto' }}>
                    {conversations.map(c => (
                        <div key={c.id} onClick={() => { setActiveChat(c.id); c.unread = 0; }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, cursor: 'pointer', background: activeChat === c.id ? '#eff6ff' : 'transparent', borderBottom: `1px solid ${ds.borderLt}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>👨‍🌾</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
                                <p style={{ margin: 0, fontSize: 10, color: ds.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${ds.border}`, background: '#f8fafc', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{conversations.find(c => c.id === activeChat)?.name}</span>
                    <span style={{ fontSize: 10, background: ds.greenLt, color: ds.green, padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>🔒 Bank Encrypted Connection</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                    {messages[activeChat]?.map(m => {
                        const isMe = m.sender === 'me';
                        return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '70%', background: isMe ? ds.primary : '#fff', color: isMe ? '#fff' : ds.text, padding: '10px 14px', borderRadius: 12, border: isMe ? 'none' : `1px solid ${ds.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4 }}>{m.text}</p>
                                    <span style={{ display: 'block', textAlign: 'right', fontSize: 9, color: isMe ? 'rgba(255,255,255,0.7)' : ds.textTer, marginTop: 4 }}>{m.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <form onSubmit={handleSend} style={{ padding: 12, borderTop: `1px solid ${ds.border}`, display: 'flex', gap: 8 }}>
                    <input type="text" placeholder="Type secure message..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    <button type="submit" style={{ padding: '8px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                </form>
            </div>
        </div>
    );
}

function DocumentsVerification({ docs, handleDocVerify }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Farmer Collateral Documents Verification</h3>
                <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Approve identity deeds and crop sheets submitted for loan security.</p>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Document ID</TH>
                            <TH>Farmer Name</TH>
                            <TH>Application Link</TH>
                            <TH>Document Name</TH>
                            <TH>Date Uploaded</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {docs.map(doc => (
                            <tr key={doc.id}>
                                <TD mono>{doc.id}</TD>
                                <TD>{doc.farmer}</TD>
                                <TD mono>{doc.appId}</TD>
                                <TD><strong>{doc.name}</strong></TD>
                                <TD mono>{doc.date}</TD>
                                <TD><Badge label={doc.status} cfg={doc.status === 'Verified' ? appStatusCfg.Approved : appStatusCfg.Pending} /></TD>
                                <TD>
                                    {doc.status !== 'Verified' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleDocVerify(doc.id, 'Verified')} style={{ padding: '4px 8px', background: ds.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Approve</button>
                                            <button onClick={() => handleDocVerify(doc.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Reject</button>
                                            <button onClick={() => alert(`Showing Document Preview for ${doc.name} (ID: ${doc.id})`)} style={{ padding: '4px 8px', background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Preview</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => alert('Document already marked as verified')} style={{ padding: '4px 8px', background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Review Check</button>
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

function NotificationsDesk({ notifications }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Agri Loan Notification Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: 12, padding: 14, background: n.status === 'unread' ? ds.primaryLt : '#f8fafc', borderLeft: `4px solid ${n.type === 'alert' ? ds.red : n.type === 'reminder' ? ds.amber : ds.primary}`, borderRadius: 8 }}>
                        <div style={{ fontSize: 18 }}>{n.type === 'alert' ? '🚨' : n.type === 'reminder' ? '⏳' : 'ℹ️'}</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, color: ds.text, fontWeight: n.status === 'unread' ? 700 : 500 }}>{n.text}</p>
                            <span style={{ fontSize: 10, color: ds.textTer, display: 'block', marginTop: 4 }}>Date: {n.date} · Status: {n.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FinancialSettings({ accountType }) {
    const [bizName, setBizName] = useState(localStorage.getItem('businessName') || 'Agri Financial Services');

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('businessName', bizName);
        alert('Configurations saved successfully!');
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 24, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderRight: `1px solid ${ds.border}`, paddingRight: 16 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 10, fontWeight: 'bold', color: ds.textTer, letterSpacing: '0.05em' }}>PREFERENCES</p>
                <button style={{ textAlign: 'left', padding: '8px 12px', border: 'none', background: ds.primaryLt, color: ds.primary, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    {accountType === 'business' ? 'Financial Institution Profile' : 'Individual Lender Profile'}
                </button>
                <button onClick={() => alert('Change Password page mockup')} style={{ textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', color: ds.textSec, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Security Settings</button>
                <button onClick={() => alert('Access log registers')} style={{ textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', color: ds.textSec, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Audits & Logs</button>
            </div>

            <div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                        {accountType === 'business' ? 'Branch Details Profile' : 'Lender Personal Profile'}
                    </h4>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Institution / Lender Name</label>
                        <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    </div>
                    {accountType === 'business' ? (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Branch ID</label>
                                <input type="text" defaultValue="BR-COL-8902" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Compliance Registry Stamp</label>
                                <input type="text" defaultValue="CBSL-REG/2026/99" readOnly style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13, background: '#f1f5f9' }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Lender NIC Card Number</label>
                                <input type="text" defaultValue="1985023901V" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Personal Escrow Bank Account</label>
                                <input type="text" defaultValue="77100299839-CommercialBank" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                            </div>
                        </>
                    )}
                    <button type="submit" style={{ padding: '8px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, alignSelf: 'flex-start' }}>Save Configuration</button>
                </form>
            </div>
        </div>
    );
}

export default function FinancialProviderDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');
    const [accountType, setAccountType] = useState('business'); // business (Institution) or individual (Lender)

    const [schemes, setSchemes] = useState(INITIAL_SCHEMES);
    const [apps, setApps] = useState(INITIAL_APPLICATIONS);
    const [rates, setRates] = useState(INITIAL_INTEREST_RATES);
    const [docs, setDocs] = useState(INITIAL_DOCUMENTS);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const handleAction = (id, newStatus) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        alert(`Credit Application ${id} has been marked as ${newStatus}. Contacting farmer shortly.`);
    };

    const handleRateChange = (id, newRate) => {
        setRates(prev => prev.map(r => r.id === id ? { ...r, rate: newRate } : r));
        alert('Interest rate matrix updated successfully!');
    };

    const handleDocVerify = (id, newStatus) => {
        setDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: newStatus } : doc));
        alert(`Document ID ${id} verification state changed to: ${newStatus}`);
    };

    const renderSection = () => {
        switch (section) {
            case 'dashboard':
                return <DashboardHome setSection={setSection} schemes={schemes} applications={apps} accountType={accountType} />;
            case 'schemes':
                return <LoanSchemes schemes={schemes} accountType={accountType} />;
            case 'applications':
                return <LoanApplications apps={apps} handleAction={handleAction} accountType={accountType} />;
            case 'rates':
                return <InterestRates rates={rates} handleRateChange={handleRateChange} />;
            case 'analytics':
                return <FinancialAnalytics />;
            case 'messages':
                return <CustomerMessages />;
            case 'documents':
                return <DocumentsVerification docs={docs} handleDocVerify={handleDocVerify} />;
            case 'notifications':
                return <NotificationsDesk notifications={notifications} />;
            case 'settings':
                return <FinancialSettings accountType={accountType} />;
            default:
                return <DashboardHome setSection={setSection} schemes={schemes} applications={apps} accountType={accountType} />;
        }
    };

    return (
        <div style={{ display: 'flex', background: ds.bg, minHeight: '100vh', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={setSection} onNavigate={onNavigate} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} accountType={accountType} setAccountType={setAccountType} />
                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}