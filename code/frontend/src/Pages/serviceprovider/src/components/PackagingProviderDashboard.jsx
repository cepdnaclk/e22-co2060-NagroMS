import { useState, useMemo } from 'react';
import {
    LayoutDashboard, Package, BoxSelect, Tag, FileText,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, CheckCircle, AlertTriangle, Search, Plus,
    Eye, Check, X, Download, Filter, Star, MessageSquare, Send, Paperclip, Bell, ShieldCheck, Clock
} from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#2e1065 0%,#5b21b6 50%,#1e1b4b 100%)',
    primary: '#7c3aed',
    primaryLt: '#f5f3ff',
    primaryBd: '#ddd6fe',
    green: '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#fafaf9', // Beige accent white background
    surface: '#ffffff',
    border: '#e7e5e4', borderLt: '#f5f5f4',
    text: '#1c1917', textSec: '#57534e', textTer: '#a8a29e',
    shadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fef3c7', amberBd: '#fde68a',
    red: '#dc2626', redLt: '#fef2f2', redBd: '#fecaca',
    purple: '#8b5cf6', purpleLt: '#f5f3ff', purpleBd: '#ddd6fe',
    teal: '#0891b2', tealLt: '#ecfeff', tealBd: '#a5f3fc',
    beige: '#f5f5f4', beigeBd: '#e7e5e4'
};

const INITIAL_ORDERS = [
    { id: 'PKG-7731', farmer: 'Sunil Perera', cropType: 'Paddy Rice', qty: '1,500 kg', service: 'Standard Gunny Sacks', date: '2026-07-06', status: 'Pending', fee: 4500, contact: '077 123 4567' },
    { id: 'PKG-7732', farmer: 'Kamala Silva', cropType: 'Tomatoes', qty: '500 kg', service: 'Plastic Crate Packaging', date: '2026-07-07', status: 'Processing', fee: 3000, contact: '081 222 3344' },
    { id: 'PKG-7733', farmer: 'Nimal Fernando', cropType: 'Ceylon Spices', qty: '120 kg', service: 'Vacuum Sealing & Labeling', date: '2026-07-05', status: 'Ready', fee: 6500, contact: '091 333 4455' },
    { id: 'PKG-7730', farmer: 'Priya Kumar', cropType: 'Coconuts', qty: '800 units', service: 'Bulk Mesh Bag Packing', date: '2026-07-03', status: 'Dispatched', fee: 4000, contact: '021 444 5566' },
    { id: 'PKG-7729', farmer: 'Rajan Muthu', cropType: 'Black Pepper', qty: '200 kg', service: 'Export Cartons Packing', date: '2026-07-01', status: 'Dispatched', fee: 8200, contact: '076 555 6677' },
];

const INITIAL_REQUESTS = [
    { id: 'REQ-102', farmer: 'Lasith Mendis', cropType: 'Strawberries', qty: '300 kg', requestedService: 'Vacuum Sealing (Eco Friendly)', date: '2026-07-08', status: 'Pending', note: 'Require biodegradable packaging film.' },
    { id: 'REQ-101', farmer: 'Preethi Herath', cropType: 'Cardamom', qty: '80 kg', requestedService: 'Custom Labeling & Jar Sealing', date: '2026-07-07', status: 'Pending', note: 'Provide nutrition facts stickers.' }
];

const INITIAL_SERVICES = [
    { id: 'srv-01', name: 'Eco Packaging', desc: 'Biodegradable paper and fiber bags for dry grains.', price: 2.50, unit: 'kg', estTime: '1 day', active: true },
    { id: 'srv-02', name: 'Vacuum Packaging', desc: 'Air-tight sealing for spices and high-value perishables.', price: 15.00, unit: 'kg', estTime: '2 hours', active: true },
    { id: 'srv-03', name: 'Bulk Packaging', desc: 'Standard mesh bags and laminated gunny sacks.', price: 1.80, unit: 'kg', estTime: '1 day', active: true },
    { id: 'srv-04', name: 'Export Packaging', desc: 'Double-walled carton boxes and heat-treated pallets.', price: 25.00, unit: 'kg', estTime: '2 days', active: true },
    { id: 'srv-05', name: 'Custom Packaging', desc: 'Tailored labeling, printing, and specific retail containers.', price: 35.00, unit: 'kg', estTime: '3 days', active: false }
];

const INITIAL_PRICING = [
    { type: 'Standard Sacks', materialCost: 1.00, serviceCost: 0.80, finalPrice: 1.80, estTime: '12 hrs' },
    { type: 'Eco Paper Bags', materialCost: 1.50, serviceCost: 1.00, finalPrice: 2.50, estTime: '24 hrs' },
    { type: 'Vacuum Sealed Pouches', materialCost: 8.00, serviceCost: 7.00, finalPrice: 15.00, estTime: '2 hrs' },
    { type: 'Export Cardboards', materialCost: 15.00, serviceCost: 10.00, finalPrice: 25.00, estTime: '48 hrs' },
];

const MATERIALS_STOCK = [
    { id: 'MAT-01', name: 'Standard Laminated Sacks (50kg)', type: 'Sacks', stock: 450, unit: 'pcs', status: 'In Stock', threshold: 100 },
    { id: 'MAT-02', name: 'Reusable Plastic Crates (Large)', type: 'Crates', stock: 35, unit: 'pcs', status: 'Low Stock', threshold: 50 },
    { id: 'MAT-03', name: 'Vacuum Sealing Pouches (1kg)', type: 'Pouches', stock: 1200, unit: 'pcs', status: 'In Stock', threshold: 200 },
    { id: 'MAT-04', name: 'Thermal Export Shipping Labels', type: 'Labels', stock: 80, unit: 'rolls', status: 'Low Stock', threshold: 100 },
];

const MONTHLY_PACKAGES = [
    { month: 'Jan', orders: 35, volume: 15, revenue: 45 },
    { month: 'Feb', orders: 42, volume: 18, revenue: 52 },
    { month: 'Mar', orders: 58, volume: 25, revenue: 78 },
    { month: 'Apr', orders: 49, volume: 22, revenue: 64 },
    { month: 'May', orders: 64, volume: 28, revenue: 85 },
    { month: 'Jun', orders: 75, volume: 34, revenue: 99 },
    { month: 'Jul', orders: 68, volume: 31, revenue: 88 },
];

const MATERIAL_TYPE_DIST = [
    { name: 'Gunny Sacks', value: 45, color: '#16a34a' },
    { name: 'Plastic Crates', value: 25, color: '#7c3aed' },
    { name: 'Vacuum Pouches', value: 20, color: '#8b5cf6' },
    { name: 'Other Materials', value: 10, color: '#0891b2' },
];

const INITIAL_REVIEWS = [
    { id: 1, author: 'Sunil Perera', rating: 5, comment: 'Laminated gunny sacks were high quality. Paddy Rice preserved nicely.', date: '2026-07-06' },
    { id: 2, author: 'Kamala Silva', rating: 4, comment: 'Crate packaging was done on time, but plastic crates were slightly dusty.', date: '2026-07-05' },
    { id: 3, author: 'Nimal Fernando', rating: 5, comment: 'Excellent vacuum sealing for my spices! Export custom cleared without issues.', date: '2026-06-28' }
];

const orderStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Processing: { bg: ds.primaryLt, color: '#5b21b6', dot: ds.primary },
    Ready: { bg: ds.tealLt, color: '#0891b2', dot: ds.teal },
    Dispatched: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Rejected: { bg: ds.redLt, color: '#991b1b', dot: ds.red }
};
const stockStatusCfg = {
    'In Stock': { bg: ds.greenLt, color: '#166534', dot: ds.green },
    'Low Stock': { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    'Out of Stock': { bg: ds.redLt, color: '#991b1b', dot: ds.red },
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
        { id: 'orders', label: 'Packaging Orders', icon: Package },
        { id: 'services', label: 'Packaging Services', icon: BoxSelect },
        { id: 'requests', label: 'Customer Requests', icon: FileText },
        { id: 'pricing', label: 'Pricing', icon: Tag },
        { id: 'history', label: 'Order History', icon: Clock },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Packaging Portal</p></div>}
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

function TopNav({ section }) {
    const labels = {
        dashboard: 'Dashboard Overview',
        orders: 'Packaging Orders',
        services: 'Packaging Services List',
        requests: 'Customer Packaging Requests',
        pricing: 'Pricing Management',
        history: 'Order History Log',
        analytics: 'Analytics & Earnings',
        reviews: 'Customer Feedback Reviews',
        messages: 'Packaging Inbox Messages',
        settings: 'Configuration Settings'
    };
    const businessName = localStorage.getItem('businessName') || 'Agri Packaging Services';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Packaging & Labeling Services · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f4', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>📦</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection, orders, materials }) {
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const lowStockAlerts = materials.filter(m => m.status === 'Low Stock').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Active Orders" value={String(pending + processing)} sub="Currently in progress" icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.primaryLt} iconColor={ds.primary} />
                <KpiCard label="Completed Orders" value="142" sub="All-time processed" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Low Stock Materials" value={String(lowStockAlerts)} sub="Needs immediate reorder" icon={<AlertTriangle style={{ width: 18, height: 18 }} />} iconBg={ds.redLt} iconColor={ds.red} />
                <KpiCard label="Monthly Revenue" value="Rs 88.5K" sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
            </div>

            {/* Quick Actions Panel */}
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 12px 0' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => setSection('services')} style={{ padding: '10px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus style={{ width: 16, height: 16 }} /> Add Service
                    </button>
                    <button onClick={() => setSection('pricing')} style={{ padding: '10px 16px', background: '#f5f5f4', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag style={{ width: 16, height: 16 }} /> Update Pricing
                    </button>
                    <button onClick={() => setSection('orders')} style={{ padding: '10px 16px', background: '#f5f5f4', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Package style={{ width: 16, height: 16 }} /> Manage Orders
                    </button>
                    <button onClick={() => setSection('analytics')} style={{ padding: '10px 16px', background: '#f5f5f4', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Download style={{ width: 16, height: 16 }} /> Invoice Reports
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Packaging Orders & Bulk Volume</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY_PACKAGES}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke={ds.primary} name="Orders Processed" strokeWidth={2} />
                            <Line type="monotone" dataKey="volume" stroke={ds.teal} name="Tonnage Volume (Tons)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Material Allocation</h3>
                    <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie data={MATERIAL_TYPE_DIST} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">
                                {MATERIAL_TYPE_DIST.map((d, index) => <Cell key={index} fill={d.color} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                        {MATERIAL_TYPE_DIST.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                    <span style={{ color: ds.textSec }}>{d.name}</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderQueue({ orders, handleStatus }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Packaging Order Queue</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Order ID</TH>
                            <TH>Farmer Name</TH>
                            <TH>Crop Type</TH>
                            <TH>Quantity</TH>
                            <TH>Packing Service Type</TH>
                            <TH>Date Submitted</TH>
                            <TH>Estimated Fee</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <TD mono>{o.id}</TD>
                                <TD>{o.farmer}</TD>
                                <TD>{o.cropType}</TD>
                                <TD mono>{o.qty}</TD>
                                <TD>{o.service}</TD>
                                <TD mono>{o.date}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {o.fee.toLocaleString()}</TD>
                                <TD><Badge label={o.status} cfg={orderStatusCfg[o.status]} /></TD>
                                <TD>
                                    {o.status === 'Pending' ? (
                                        <button onClick={() => handleStatus(o.id, 'Processing')} style={{ padding: '4px 8px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Start packing</button>
                                    ) : o.status === 'Processing' ? (
                                        <button onClick={() => handleStatus(o.id, 'Ready')} style={{ padding: '4px 8px', background: ds.teal, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Mark Ready</button>
                                    ) : o.status === 'Ready' ? (
                                        <button onClick={() => handleStatus(o.id, 'Dispatched')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Dispatch</button>
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

function PackagingServices({ services, toggleService }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, marginBottom: 4 }}>Packaging Services Management</h3>
                <p style={{ fontSize: 12, color: ds.textSec, margin: 0 }}>Configure which packaging capabilities are active for farmer order bookings.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {services.map(s => (
                    <div key={s.id} style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, opacity: s.active ? 1 : 0.7, boxShadow: ds.shadow, display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontSize: 20 }}>📦</span>
                                <Badge label={s.active ? 'Active' : 'Inactive'} cfg={s.active ? orderStatusCfg.Dispatched : orderStatusCfg.Rejected} />
                            </div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700 }}>{s.name}</h4>
                            <p style={{ margin: '0 0 12px 0', fontSize: 12, color: ds.textSec, height: 36, overflow: 'hidden' }}>{s.desc}</p>
                        </div>
                        <div style={{ borderTop: `1px solid ${ds.borderLt}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: 10, color: ds.textTer }}>BASE RATE</span>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Rs {s.price.toFixed(2)} / {s.unit}</p>
                            </div>
                            <button onClick={() => toggleService(s.id)} style={{ padding: '6px 10px', background: s.active ? ds.redLt : ds.primary, color: s.active ? ds.red : '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                                {s.active ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CustomerRequests({ requests, handleRequest }) {
    const [filterCrop, setFilterCrop] = useState('All');

    const filtered = useMemo(() => {
        return requests.filter(r => filterCrop === 'All' || r.cropType === filterCrop);
    }, [requests, filterCrop]);

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: 0 }}>Custom Packaging Inbound Requests</h3>
                    <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Approve customized packages requested by farmers.</p>
                </div>
                <select value={filterCrop} onChange={e => setFilterCrop(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${ds.border}`, borderRadius: 8, fontSize: 12, background: '#fff' }}>
                    <option value="All">All Crops</option>
                    <option value="Strawberries">Strawberries</option>
                    <option value="Cardamom">Cardamom</option>
                </select>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Request ID</TH>
                            <TH>Farmer</TH>
                            <TH>Crop</TH>
                            <TH>Quantity</TH>
                            <TH>Requested Packaging</TH>
                            <TH>Date Submitted</TH>
                            <TH>Special Note</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id}>
                                <TD mono>{r.id}</TD>
                                <TD>{r.farmer}</TD>
                                <TD>{r.cropType}</TD>
                                <TD mono>{r.qty}</TD>
                                <TD>{r.requestedService}</TD>
                                <TD mono>{r.date}</TD>
                                <TD style={{ fontSize: 11, color: ds.textSec }}>{r.note}</TD>
                                <TD>
                                    {r.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleRequest(r.id, 'Approved')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Accept</button>
                                            <button onClick={() => handleRequest(r.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                        </div>
                                    ) : (
                                        <Badge label={r.status} cfg={r.status === 'Approved' ? orderStatusCfg.Dispatched : orderStatusCfg.Rejected} />
                                    )}
                                </TD>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: ds.textTer, fontSize: 13 }}>No pending customer requests.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PricingManagement({ pricing, updatePrice }) {
    const [editIdx, setEditIdx] = useState(null);
    const [mCost, setMCost] = useState('');
    const [sCost, setSCost] = useState('');

    const startEdit = (idx, item) => {
        setEditIdx(idx);
        setMCost(item.materialCost);
        setSCost(item.serviceCost);
    };

    const saveEdit = (idx) => {
        const mc = parseFloat(mCost);
        const sc = parseFloat(sCost);
        if (isNaN(mc) || isNaN(sc)) return;
        updatePrice(idx, mc, sc);
        setEditIdx(null);
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: 0 }}>Editable Pricing Sheet</h3>
                <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Manage cost margins for different packaging categories.</p>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Packaging Type</TH>
                            <TH>Material Cost (Rs/kg)</TH>
                            <TH>Service Labor Cost (Rs/kg)</TH>
                            <TH>Final Price (Rs/kg)</TH>
                            <TH>Est. Completion Time</TH>
                            <TH>Action</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {pricing.map((item, idx) => (
                            <tr key={idx}>
                                <TD><strong>{item.type}</strong></TD>
                                <TD mono>
                                    {editIdx === idx ? (
                                        <input type="number" step="0.1" value={mCost} onChange={e => setMCost(e.target.value)} style={{ width: 80, padding: 4, border: `1px solid ${ds.border}` }} />
                                    ) : (
                                        `Rs ${item.materialCost.toFixed(2)}`
                                    )}
                                </TD>
                                <TD mono>
                                    {editIdx === idx ? (
                                        <input type="number" step="0.1" value={sCost} onChange={e => setSCost(e.target.value)} style={{ width: 80, padding: 4, border: `1px solid ${ds.border}` }} />
                                    ) : (
                                        `Rs ${item.serviceCost.toFixed(2)}`
                                    )}
                                </TD>
                                <TD mono style={{ fontWeight: 700, color: ds.primary }}>Rs {(item.materialCost + item.serviceCost).toFixed(2)}</TD>
                                <TD mono>{item.estTime}</TD>
                                <TD>
                                    {editIdx === idx ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => saveEdit(idx)} style={{ padding: '4px 8px', background: ds.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Save</button>
                                            <button onClick={() => setEditIdx(null)} style={{ padding: '4px 8px', background: '#e5e7eb', color: ds.text, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEdit(idx, item)} style={{ padding: '4px 8px', background: '#f5f5f4', border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Edit Pricing</button>
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

function OrderHistory({ completedOrders }) {
    const exportCSV = () => {
        const headers = ['Order ID', 'Farmer Name', 'Crop Type', 'Quantity', 'Packing Service', 'Estimated Fee', 'Date Processed', 'Status'];
        const rows = completedOrders.map(o => [
            o.id, o.farmer, o.cropType, o.qty, o.service, o.fee, o.date, o.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "packaging_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: 0 }}>Completed Packaging Log</h3>
                    <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Archived records of packaged crop boxes and bags.</p>
                </div>
                <button onClick={exportCSV} style={{ padding: '8px 14px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download style={{ width: 14, height: 14 }} /> Export History
                </button>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Order ID</TH>
                            <TH>Farmer Name</TH>
                            <TH>Crop Type</TH>
                            <TH>Quantity</TH>
                            <TH>Packaging Type</TH>
                            <TH>Processing Date</TH>
                            <TH>Total Price</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {completedOrders.map(o => (
                            <tr key={o.id}>
                                <TD mono>{o.id}</TD>
                                <TD>{o.farmer}</TD>
                                <TD>{o.cropType}</TD>
                                <TD mono>{o.qty}</TD>
                                <TD>{o.service}</TD>
                                <TD mono>{o.date}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {o.fee.toLocaleString()}</TD>
                                <TD><Badge label={o.status} cfg={orderStatusCfg[o.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PackagingAnalytics() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <KpiCard label="Eco Packaging Share" value="45%" sub="Preferred organic pack" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Average Completion" value="1.8 Hours" sub="For vacuum seals" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.primaryLt} iconColor={ds.primary} />
                <KpiCard label="Customer Satisfaction" value="4.8 / 5" sub="Based on reviews" icon={<Star style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} />
                <KpiCard label="Revenue growth" value="+22.4%" sub="Month-over-month" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Monthly Packaging Orders</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={MONTHLY_PACKAGES}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="orders" fill={ds.primary} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Monthly Revenue Growth (Rs K)</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY_PACKAGES}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke={ds.green} strokeWidth={2.5} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function ReviewsManagement({ reviews, handleReply }) {
    const [replyIdx, setReplyIdx] = useState(null);
    const [replyText, setReplyText] = useState('');

    const submitReply = (id) => {
        if (!replyText.trim()) return;
        handleReply(id, replyText);
        setReplyIdx(null);
        setReplyText('');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(r => (
                    <div key={r.id} style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 18, boxShadow: ds.shadow }}>
                        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: ds.text }}>{r.author}</span>
                                <p style={{ margin: 0, fontSize: 10, color: ds.textTer }}>Farmer Profile · {r.date}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} style={{ width: 14, height: 14, fill: i < r.rating ? ds.amber : 'none', stroke: i < r.rating ? ds.amber : ds.textTer }} />
                                ))}
                            </div>
                        </div>
                        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: ds.textSec, lineHeight: 1.4 }}>{r.comment}</p>
                        
                        {r.reply ? (
                            <div style={{ background: '#f5f5f4', padding: '10px 14px', borderRadius: 8, fontSize: 12, borderLeft: `3px solid ${ds.primary}`, marginTop: 8 }}>
                                <strong style={{ color: ds.text }}>Your response:</strong>
                                <p style={{ margin: '4px 0 0 0', color: ds.textSec }}>{r.reply}</p>
                            </div>
                        ) : (
                            <div>
                                {replyIdx === r.id ? (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <input type="text" placeholder="Type review response..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 12 }} />
                                        <button onClick={() => submitReply(r.id)} style={{ padding: '6px 12px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Reply</button>
                                        <button onClick={() => setReplyIdx(null)} style={{ padding: '6px 12px', background: '#e5e7eb', color: ds.text, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setReplyIdx(r.id)} style={{ padding: '6px 12px', background: '#f5f5f4', border: `1px solid ${ds.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                                        Write Response
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow, height: 'fit-content' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Ratings Breakdown</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                    <span style={{ fontSize: 32, fontWeight: 800 }}>4.8</span>
                    <span style={{ fontSize: 12, color: ds.textTer }}>out of 5 stars</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { stars: 5, pct: 85 },
                        { stars: 4, pct: 10 },
                        { stars: 3, pct: 5 },
                        { stars: 2, pct: 0 },
                        { stars: 1, pct: 0 },
                    ].map(b => (
                        <div key={b.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                            <span style={{ width: 12, textAlign: 'right' }}>{b.stars}</span>
                            <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${b.pct}%`, height: '100%', background: ds.amber, borderRadius: 3 }} />
                            </div>
                            <span style={{ width: 26, textAlign: 'right', color: ds.textTer }}>{b.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PackagingMessages() {
    const [conversations, setConversations] = useState([
        { id: 'c1', name: 'Sunil Perera', role: 'Farmer', lastMessage: 'Use extra padding for rice sacks.', unread: 1, online: true, icon: '👨‍🌾' },
        { id: 'c2', name: 'Nimal Fernando', role: 'Exporter Representative', lastMessage: 'Label printing is finished.', unread: 0, online: false, icon: '👨‍🌾' }
    ]);
    const [activeChat, setActiveChat] = useState('c1');
    const [messages, setMessages] = useState({
        c1: [
            { id: 1, sender: 'them', text: 'Hi, is eco-sacks wrapping done for standard paddy?', time: '10:00 AM' },
            { id: 2, sender: 'me', text: 'Yes, Sunil. We started packing standard gunny bags.', time: '10:05 AM' },
            { id: 3, sender: 'them', text: 'Great, please use extra padding for rice sacks to avoid damage.', time: '10:06 AM' }
        ],
        c2: [
            { id: 1, sender: 'me', text: 'Nimal, are the custom export labels verified?', time: 'Yesterday' },
            { id: 2, sender: 'them', text: 'Yes, the label printing is finished and ready to apply.', time: 'Yesterday' }
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
            <div style={{ borderRight: `1px solid ${ds.border}`, background: '#fcfcfb' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${ds.border}` }}>
                    <input type="text" placeholder="Search farmer chats..." style={{ width: '100%', padding: '6px 10px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 12 }} />
                </div>
                <div style={{ overflowY: 'auto' }}>
                    {conversations.map(c => (
                        <div key={c.id} onClick={() => { setActiveChat(c.id); c.unread = 0; }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, cursor: 'pointer', background: activeChat === c.id ? '#f5f3ff' : 'transparent', borderBottom: `1px solid ${ds.borderLt}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                                {c.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 10, color: ds.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${ds.border}`, background: '#fafaf9' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{conversations.find(c => c.id === activeChat)?.name}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#fafaf9' }}>
                    {messages[activeChat]?.map(m => {
                        const isMe = m.sender === 'me';
                        return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '70%', background: isMe ? ds.primary : '#fff', color: isMe ? '#fff' : ds.text, padding: '10px 14px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: isMe ? 'none' : `1px solid ${ds.border}` }}>
                                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4 }}>{m.text}</p>
                                    <span style={{ display: 'block', textAlign: 'right', fontSize: 9, color: isMe ? 'rgba(255,255,255,0.7)' : ds.textTer, marginTop: 4 }}>{m.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <form onSubmit={handleSend} style={{ padding: 12, borderTop: `1px solid ${ds.border}`, display: 'flex', gap: 8, background: '#fff' }}>
                    <input type="text" placeholder="Type packaging instructions..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    <button type="submit" style={{ padding: '8px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                </form>
            </div>
        </div>
    );
}

function PackagingSettings() {
    const [tab, setTab] = useState('profile');
    const [bizName, setBizName] = useState(localStorage.getItem('businessName') || 'Agri Packaging Services');

    const saveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('businessName', bizName);
        alert('Packaging provider configurations saved!');
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 24, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderRight: `1px solid ${ds.border}`, paddingRight: 16 }}>
                {[
                    { id: 'profile', label: 'Company Profile' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'security', label: 'Security' },
                    { id: 'account', label: 'Account Tier' },
                    { id: 'theme', label: 'Theme Toggles' }
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ textAlign: 'left', padding: '8px 12px', border: 'none', background: tab === t.id ? ds.primaryLt : 'transparent', color: tab === t.id ? ds.primary : ds.textSec, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div>
                {tab === 'profile' && (
                    <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Company Profile</h4>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Packaging Facility Name</label>
                            <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Business License Number</label>
                            <input type="text" defaultValue="PKG-LK-9982" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <button type="submit" style={{ padding: '8px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, alignSelf: 'flex-start' }}>Save Config</button>
                    </form>
                )}

                {tab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Notification Preferences</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <input type="checkbox" defaultChecked /> SMS alerts on material inventory warnings
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <input type="checkbox" defaultChecked /> Push notification for new customer requests
                            </label>
                        </div>
                    </div>
                )}

                {tab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Security Settings</h4>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Passphrase</label>
                            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <button onClick={() => alert('Password saved')} style={{ padding: '8px 12px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, alignSelf: 'flex-start' }}>Update Password</button>
                    </div>
                )}

                {tab === 'account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Account Tier</h4>
                        <div style={{ background: ds.primaryLt, border: `1px solid ${ds.primaryBd}`, borderRadius: 8, padding: 16 }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ds.primary }}>Standard Packaging Partner</p>
                            <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>Verified partner for organic grains and spice export packing.</p>
                        </div>
                    </div>
                )}

                {tab === 'theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Color Theme Toggles</h4>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => alert('Theme set to warm beige')} style={{ padding: '10px 16px', background: ds.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Warm Beige & Purple</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PackagingProviderDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [requests, setRequests] = useState(INITIAL_REQUESTS);
    const [services, setServices] = useState(INITIAL_SERVICES);
    const [pricing, setPricing] = useState(INITIAL_PRICING);
    const [materials, setMaterials] = useState(MATERIALS_STOCK);
    const [reviews, setReviews] = useState(INITIAL_REVIEWS);

    const handleStatus = (id, newStatus) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const toggleService = (id) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    };

    const handleRequest = (id, newStatus) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        if (newStatus === 'Approved') {
            const req = requests.find(r => r.id === id);
            if (req) {
                const newOrder = {
                    id: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
                    farmer: req.farmer,
                    cropType: req.cropType,
                    qty: req.qty,
                    service: req.requestedService,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending',
                    fee: parseFloat(req.qty) * 15,
                    contact: '077 000 0000'
                };
                setOrders(prev => [newOrder, ...prev]);
                alert(`Approved custom request! New packaging order ${newOrder.id} has been added to queue.`);
            }
        }
    };

    const updatePrice = (idx, mc, sc) => {
        setPricing(prev => prev.map((p, i) => i === idx ? { ...p, materialCost: mc, serviceCost: sc, finalPrice: mc + sc } : p));
        alert('Pricing worksheet saved successfully.');
    };

    const handleReply = (id, text) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: text } : r));
        alert('Your response to the review has been published.');
    };

    const completedOrders = useMemo(() => {
        return orders.filter(o => o.status === 'Dispatched' || o.status === 'Rejected');
    }, [orders]);

    const activeOrders = useMemo(() => {
        return orders.filter(o => o.status !== 'Dispatched' && o.status !== 'Rejected');
    }, [orders]);

    const renderSection = () => {
        switch (section) {
            case 'dashboard':
                return <DashboardHome setSection={setSection} orders={orders} materials={materials} />;
            case 'orders':
                return <OrderQueue orders={activeOrders} handleStatus={handleStatus} />;
            case 'services':
                return <PackagingServices services={services} toggleService={toggleService} />;
            case 'requests':
                return <CustomerRequests requests={requests} handleRequest={handleRequest} />;
            case 'pricing':
                return <PricingManagement pricing={pricing} updatePrice={updatePrice} />;
            case 'history':
                return <OrderHistory completedOrders={completedOrders} />;
            case 'analytics':
                return <PackagingAnalytics />;
            case 'reviews':
                return <ReviewsManagement reviews={reviews} handleReply={handleReply} />;
            case 'messages':
                return <PackagingMessages />;
            case 'settings':
                return <PackagingSettings />;
            default:
                return <DashboardHome setSection={setSection} orders={orders} materials={materials} />;
        }
    };

    return (
        <div style={{ display: 'flex', background: ds.bg, minHeight: '100vh', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
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