import { useState } from 'react';
import {
    LayoutDashboard, Package, BoxSelect,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, CheckCircle, AlertTriangle,
} from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#2e1065 0%,#5b21b6 50%,#1e1b4b 100%)',
    primary: '#7c3aed',
    primaryLt: '#f5f3ff',
    primaryBd: '#ddd6fe',
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

const PACKAGING_ORDERS = [
    { id: 'PKG-7731', farmer: 'Sunil Perera', cropType: 'Paddy Rice', qty: '1,500 kg', service: 'Standard Gunny Sacks', date: '2026-07-06', status: 'Pending', fee: 4500, contact: '077 123 4567' },
    { id: 'PKG-7732', farmer: 'Kamala Silva', cropType: 'Tomatoes', qty: '500 kg', service: 'Plastic Crate Packaging', date: '2026-07-07', status: 'Processing', fee: 3000, contact: '081 222 3344' },
    { id: 'PKG-7733', farmer: 'Nimal Fernando', cropType: 'Ceylon Spices', qty: '120 kg', service: 'Vacuum Sealing & Labeling', date: '2026-07-05', status: 'Ready', fee: 6500, contact: '091 333 4455' },
    { id: 'PKG-7730', farmer: 'Priya Kumar', cropType: 'Coconuts', qty: '800 units', service: 'Bulk Mesh Bag Packing', date: '2026-07-03', status: 'Dispatched', fee: 4000, contact: '021 444 5566' },
];

const MATERIALS_STOCK = [
    { id: 'MAT-01', name: 'Standard Laminated Sacks (50kg)', type: 'Sacks', stock: 450, unit: 'pcs', status: 'In Stock', threshold: 100 },
    { id: 'MAT-02', name: 'Reusable Plastic Crates (Large)', type: 'Crates', stock: 35, unit: 'pcs', status: 'Low Stock', threshold: 50 },
    { id: 'MAT-03', name: 'Vacuum Sealing Pouches (1kg)', type: 'Pouches', stock: 1200, unit: 'pcs', status: 'In Stock', threshold: 200 },
    { id: 'MAT-04', name: 'Thermal Export Shipping Labels', type: 'Labels', stock: 80, unit: 'rolls', status: 'Low Stock', threshold: 100 },
];

const MONTHLY_PACKAGES = [
    { month: 'Jan', orders: 35, volume: 15 },
    { month: 'Feb', orders: 42, volume: 18 },
    { month: 'Mar', orders: 58, volume: 25 },
    { month: 'Apr', orders: 49, volume: 22 },
    { month: 'May', orders: 64, volume: 28 },
    { month: 'Jun', orders: 75, volume: 34 },
    { month: 'Jul', orders: 68, volume: 31 },
];

const MATERIAL_TYPE_DIST = [
    { name: 'Gunny Sacks', value: 45, color: ds.green },
    { name: 'Plastic Crates', value: 25, color: ds.primary },
    { name: 'Vacuum Pouches', value: 20, color: ds.purple },
    { name: 'Other Materials', value: 10, color: ds.teal },
];

const ACTIVITIES = [
    { time: '15 min ago', icon: '📦', text: 'New packaging request PKG-7731 from Sunil Perera — Paddy Rice, 1,500 kg', color: ds.primary },
    { time: '2 hr ago', icon: '🏷️', text: 'Order PKG-7733 marked Ready — Ceylon Spices vacuum packed and labeled', color: ds.green },
    { time: '5 hr ago', icon: '🚨', text: 'Material Stock alert: Reusable Plastic Crates fell below threshold (35 left)', color: ds.red },
];

const orderStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Processing: { bg: ds.primaryLt, color: '#5b21b6', dot: ds.primary },
    Ready: { bg: ds.tealLt, color: '#0891b2', dot: ds.teal },
    Dispatched: { bg: ds.greenLt, color: '#166534', dot: ds.green },
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
        { id: 'orders', label: 'Order Queue', icon: Package },
        { id: 'materials', label: 'Materials Stock', icon: BoxSelect },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Packing Portal</p></div>}
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
    const labels = { dashboard: 'Dashboard Overview', orders: 'Packaging Orders', materials: 'Materials Stock', settings: 'Settings' };
    const businessName = localStorage.getItem('businessName') || 'Agri Packaging Services';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Packaging & Labeling Services · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>📦</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection }) {
    const pending = PACKAGING_ORDERS.filter(o => o.status === 'Pending').length;
    const processing = PACKAGING_ORDERS.filter(o => o.status === 'Processing').length;
    const lowStockAlerts = MATERIALS_STOCK.filter(m => m.status === 'Low Stock').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Active Orders" value={String(pending + processing)} sub="Currently in progress" icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.primaryLt} iconColor={ds.primary} />
                <KpiCard label="Completed Orders" value="142" sub="All-time processed" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Low Stock Materials" value={String(lowStockAlerts)} sub="Needs immediate reorder" icon={<AlertTriangle style={{ width: 18, height: 18 }} />} iconBg={ds.redLt} iconColor={ds.red} />
                <KpiCard label="Monthly Revenue" value="Rs 88.5K" sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
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

                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
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
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: 11 }}>
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

function OrderQueue() {
    const [orders, setOrders] = useState(PACKAGING_ORDERS);
    const handleStatus = (id, newStatus) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
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
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Dispatched</span>
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

function MaterialsInventory() {
    const [stock, setStock] = useState(MATERIALS_STOCK);
    const handleReorder = (id) => {
        setStock(prev => prev.map(m => m.id === id ? { ...m, stock: m.stock + 500, status: 'In Stock' } : m));
    };
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justify: 'space-between', align: 'center' }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Materials Inventory</h3>
                <button style={{ padding: '4px 10px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Material</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Material ID</TH>
                            <TH>Material Name</TH>
                            <TH>Type</TH>
                            <TH>Current Stock</TH>
                            <TH>Threshold Limit</TH>
                            <TH>Status</TH>
                            <TH>Action</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.map(m => (
                            <tr key={m.id}>
                                <TD mono>{m.id}</TD>
                                <TD><strong>{m.name}</strong></TD>
                                <TD>{m.type}</TD>
                                <TD mono>{m.stock} {m.unit}</TD>
                                <TD mono style={{ color: ds.red }}>{m.threshold} {m.unit}</TD>
                                <TD><Badge label={m.status} cfg={stockStatusCfg[m.status]} /></TD>
                                <TD>
                                    {m.status === 'Low Stock' || m.status === 'Out of Stock' ? (
                                        <button onClick={() => handleReorder(m.id)} style={{ padding: '4px 8px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Quick Reorder (+500)</button>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Sufficient</span>
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

function PackagingSettings() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 24, maxWidth: 600, boxShadow: ds.shadow }}>
            <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 750, color: ds.text, marginBottom: 16 }}>Packaging Provider Configurations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Packaging Center Name</label>
                    <input type="text" defaultValue={localStorage.getItem('businessName') || 'Agri Packaging Facility'} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Primary Packaging Services</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                        {['Standard Sacks', 'Vacuum Sealing', 'Cardboard Box Pack', 'Labels Printing'].map(srv => (
                            <label key={srv} style={{ display: 'flex', items: 'center', gap: 6, fontSize: 12 }}>
                                <input type="checkbox" defaultChecked />
                                {srv}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <button style={{ padding: '8px 16px', background: ds.primary, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save Packaging Configurations</button>
                </div>
            </div>
        </div>
    );
}

export default function PackagingProviderDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const renderSection = () => {
        switch (section) {
            case 'dashboard': return <DashboardHome setSection={setSection} />;
            case 'orders': return <OrderQueue />;
            case 'materials': return <MaterialsInventory />;
            case 'settings': return <PackagingSettings />;
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