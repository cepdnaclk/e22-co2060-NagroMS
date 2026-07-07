import { useState } from 'react';
import {
    LayoutDashboard, Truck, Ship, Navigation, Car,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, Clock, CheckCircle, Package,
} from 'lucide-react';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)',
    blue: '#2563eb', blueLt: '#eff6ff', blueBd: '#bfdbfe',
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

const DELIVERIES = [
    { id: 'DLV-2891', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', customer: 'Manning Market, Colombo', pickup: 'Anuradhapura', drop: 'Colombo Pettah', product: 'Paddy Rice', qty: '2,000 kg', date: '2026-07-08', status: 'Pending', price: 12000, distance: '185 km' },
    { id: 'DLV-2890', farmer: 'Kamala Silva', farmerIcon: '👩‍🌾', customer: 'Keells Super, Kandy', pickup: 'Kandy', drop: 'Kandy City', product: 'Vegetables', qty: '800 kg', date: '2026-07-07', status: 'In Transit', price: 4500, distance: '22 km' },
    { id: 'DLV-2889', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', customer: 'Laugfs Eco Store', pickup: 'Galle', drop: 'Colombo 03', product: 'Organic Spices', qty: '350 kg', date: '2026-07-06', status: 'Delivered', price: 18000, distance: '116 km' },
    { id: 'DLV-2888', farmer: 'Priya Kumar', farmerIcon: '👩‍🌾', customer: 'Local Supermarket', pickup: 'Jaffna', drop: 'Colombo 07', product: 'Fresh Fruits', qty: '600 kg', date: '2026-07-05', status: 'Accepted', price: 22000, distance: '395 km' },
    { id: 'DLV-2887', farmer: 'Rajan Muthu', farmerIcon: '👨‍🌾', customer: 'Wholesale Market', pickup: 'Batticaloa', drop: 'Kandy', product: 'Banana', qty: '1,200 kg', date: '2026-07-04', status: 'Delivered', price: 8500, distance: '174 km' },
];

const EXPORTS = [
    { id: 'EXP-0441', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', product: 'Ceylon Cinnamon', destination: 'Germany', qty: '1,200 kg', status: 'Customs Clearance', documents: ['Phytosanitary', 'Origin Cert', 'Commercial Invoice'], customs: 'Under Review', price: 285000, date: '2026-07-05' },
    { id: 'EXP-0440', farmer: 'Amara Jayaweera', farmerIcon: '👩‍🌾', product: 'Organic Tea', destination: 'Japan', qty: '800 kg', status: 'Processing', documents: ['Export License', 'Invoice', 'Packing List'], customs: 'Not Started', price: 192000, date: '2026-07-04' },
    { id: 'EXP-0439', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', product: 'Black Pepper', destination: 'UAE', qty: '600 kg', status: 'Exported', documents: ['All Cleared'], customs: 'Approved', price: 168000, date: '2026-07-01' },
];

const SHIPMENTS = [
    { id: 'DLV-2890', farmer: 'Kamala Silva', driver: 'Asanka Perera', vehicle: 'LT-5892 (Lorry)', from: 'Kandy', to: 'Kandy City Center', progress: 65, status: 'In Transit', eta: '45 min', product: 'Vegetables (800 kg)' },
    { id: 'DLV-2888', farmer: 'Priya Kumar', driver: 'Ruwan Silva', vehicle: 'WP-3341 (Van)', from: 'Jaffna', to: 'Colombo 07', progress: 22, status: 'In Transit', eta: '5h 20min', product: 'Fruits (600 kg)' },
];

const VEHICLES = [
    { id: 'VH-01', emoji: '🚚', type: '10-Ton Lorry', plate: 'LT-5892', status: 'In Transit', driver: 'Asanka Perera', capacity: '10,000 kg', lastService: '2026-06-15' },
    { id: 'VH-02', emoji: 'van', type: 'Mini Van', plate: 'WP-3341', status: 'In Transit', driver: 'Ruwan Silva', capacity: '1,500 kg', lastService: '2026-06-28' },
    { id: 'VH-03', emoji: '🚛', type: 'Refrigerated Truck', plate: 'NW-7721', status: 'Available', driver: 'Chamara Dias', capacity: '8,000 kg', lastService: '2026-07-01' },
    { id: 'VH-04', emoji: '🚜', type: 'Flatbed Truck', plate: 'SG-4412', status: 'Available', driver: 'Unassigned', capacity: '12,000 kg', lastService: '2026-06-20' },
];

const MONTHLY = [
    { month: 'Jan', deliveries: 48, exports: 12, revenue: 385 },
    { month: 'Feb', deliveries: 62, exports: 15, revenue: 492 },
    { month: 'Mar', deliveries: 71, exports: 18, revenue: 568 },
    { month: 'Apr', deliveries: 58, exports: 14, revenue: 445 },
    { month: 'May', deliveries: 84, exports: 22, revenue: 672 },
    { month: 'Jun', deliveries: 96, exports: 28, revenue: 782 },
    { month: 'Jul', deliveries: 79, exports: 24, revenue: 651 },
];

const TYPE_DIST = [
    { name: 'Local Delivery', value: 52, color: ds.blue },
    { name: 'Inter-City', value: 28, color: ds.green },
    { name: 'Export Logistics', value: 20, color: ds.purple },
];

const ACTIVITIES = [
    { time: '10 min ago', icon: '📋', text: 'New delivery request DLV-2891 from Sunil Perera — Paddy Rice, Anuradhapura → Colombo', color: ds.blue },
    { time: '1 hr ago', icon: '🚚', text: 'Shipment DLV-2890 dispatched — Driver Asanka Perera, Kandy route', color: ds.teal },
    { time: '2 hr ago', icon: '✅', text: 'Delivery DLV-2889 completed — Organic Spices delivered to Laugfs Eco Store', color: ds.green },
    { time: '3 hr ago', icon: '✈️', text: 'Export EXP-0439 approved — Black Pepper, 600 kg shipped to UAE', color: ds.purple },
];

const delStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Accepted: { bg: ds.blueLt, color: '#1e40af', dot: ds.blue },
    'In Transit': { bg: ds.tealLt, color: '#164e63', dot: ds.teal },
    Delivered: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Rejected: { bg: ds.redLt, color: '#991b1b', dot: ds.red },
};
const expStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Processing: { bg: ds.blueLt, color: '#1e40af', dot: ds.blue },
    'Customs Clearance': { bg: ds.purpleLt, color: '#5b21b6', dot: ds.purple },
    Exported: { bg: ds.greenLt, color: '#166534', dot: ds.green },
};
const vehStatusCfg = {
    Available: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    'In Transit': { bg: ds.tealLt, color: '#164e63', dot: ds.teal },
    Maintenance: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
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
        { id: 'delivery', label: 'Delivery Requests', icon: Truck },
        { id: 'export', label: 'Export Requests', icon: Ship },
        { id: 'tracking', label: 'Shipment Tracking', icon: Navigation },
        { id: 'vehicles', label: 'Fleet Management', icon: Car },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚚</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Logistics Portal</p></div>}
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
    const labels = { dashboard: 'Dashboard Overview', delivery: 'Delivery Requests', export: 'Export Requests', tracking: 'Shipment Tracking', vehicles: 'Fleet Management', settings: 'Settings' };
    const businessName = localStorage.getItem('businessName') || 'Agri Delivery Logistics';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Delivery & Export Logistics · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>🚚</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection }) {
    const active = DELIVERIES.filter(d => d.status === 'In Transit').length;
    const pending = DELIVERIES.filter(d => d.status === 'Pending').length;
    const completed = DELIVERIES.filter(d => d.status === 'Delivered').length;
    const rev = MONTHLY[MONTHLY.length - 1].revenue;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Total Requests" value={String(DELIVERIES.length)} sub="All local deliveries" icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Active Deliveries" value={String(active)} sub="In transit shipments" icon={<Truck style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
                <KpiCard label="Pending Orders" value={String(pending)} sub="Requires response" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} />
                <KpiCard label="Monthly Revenue" value={`Rs ${rev}K`} sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Monthly Shipping Trends</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="deliveries" stroke={ds.blue} name="Local Deliveries" strokeWidth={2} />
                            <Line type="monotone" dataKey="exports" stroke={ds.purple} name="Exports" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Logistics Activity</h3>
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

function DeliveryRequests() {
    const [deliveries, setDeliveries] = useState(DELIVERIES);
    const handleAction = (id, newStatus) => {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    };
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Local Delivery Requests</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>ID</TH>
                            <TH>Farmer</TH>
                            <TH>Product</TH>
                            <TH>Quantity</TH>
                            <TH>Pickup</TH>
                            <TH>Dropoff</TH>
                            <TH>Distance</TH>
                            <TH>Estimated Cost</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.map(d => (
                            <tr key={d.id}>
                                <TD mono>{d.id}</TD>
                                <TD>{d.farmer}</TD>
                                <TD>{d.product}</TD>
                                <TD mono>{d.qty}</TD>
                                <TD>{d.pickup}</TD>
                                <TD>{d.drop}</TD>
                                <TD mono>{d.distance}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {d.price.toLocaleString()}</TD>
                                <TD><Badge label={d.status} cfg={delStatusCfg[d.status]} /></TD>
                                <TD>
                                    {d.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleAction(d.id, 'Accepted')} style={{ padding: '4px 8px', background: ds.blue, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Accept</button>
                                            <button onClick={() => handleAction(d.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Logged</span>
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

function ExportRequests() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>International Export Requests</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Export ID</TH>
                            <TH>Farmer</TH>
                            <TH>Product</TH>
                            <TH>Quantity</TH>
                            <TH>Destination</TH>
                            <TH>Customs Stage</TH>
                            <TH>Required Docs</TH>
                            <TH>Total Fee</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {EXPORTS.map(e => (
                            <tr key={e.id}>
                                <TD mono>{e.id}</TD>
                                <TD>{e.farmer}</TD>
                                <TD>{e.product}</TD>
                                <TD mono>{e.qty}</TD>
                                <TD>{e.destination}</TD>
                                <TD>{e.customs}</TD>
                                <TD>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {e.documents.map(d => (
                                            <span key={d} style={{ fontSize: 10, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, border: '1px solid #e5e7eb' }}>{d}</span>
                                        ))}
                                    </div>
                                </TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {e.price.toLocaleString()}</TD>
                                <TD><Badge label={e.status} cfg={expStatusCfg[e.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ShipmentTracking() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, marginBottom: 4 }}>Active Shipments Transit Progress</h3>
                <p style={{ fontSize: 12, color: ds.textSec, margin: 0 }}>Real-time GPS delivery logging.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {SHIPMENTS.map(s => (
                    <div key={s.id} style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                        <div style={{ display: 'flex', justify: 'space-between', marginBottom: 12 }}>
                            <div>
                                <span style={{ fontFamily: ds.fontM, fontSize: 14, fontWeight: 700, color: ds.text }}>{s.id}</span>
                                <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>{s.product}</p>
                            </div>
                            <Badge label={s.status} cfg={delStatusCfg[s.status]} />
                        </div>
                        <div style={{ fontSize: 12, color: ds.textSec, marginBottom: 14 }}>
                            <p style={{ margin: '2px 0' }}>📍 <strong>Pickup:</strong> {s.from}</p>
                            <p style={{ margin: '2px 0' }}>🏁 <strong>Drop:</strong> {s.to}</p>
                            <p style={{ margin: '2px 0' }}>🧑‍✈️ <strong>Driver / Vehicle:</strong> {s.driver} · {s.vehicle}</p>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justify: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                <span>Transit progress</span>
                                <span style={{ fontWeight: 600 }}>{s.progress}% (ETA: {s.eta})</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${s.progress}%`, height: '100%', background: ds.blue, borderRadius: 3 }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VehiclesDrivers() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justify: 'space-between', align: 'center' }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Fleet & Drivers Directory</h3>
                <button style={{ padding: '4px 10px', background: ds.blue, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Fleet</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Vehicle ID</TH>
                            <TH>Type</TH>
                            <TH>Plate Number</TH>
                            <TH>Capacity</TH>
                            <TH>Assigned Driver</TH>
                            <TH>Last Serviced</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {VEHICLES.map(v => (
                            <tr key={v.id}>
                                <TD mono>{v.id}</TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>🚚</span>
                                        <span>{v.type}</span>
                                    </div>
                                </TD>
                                <TD mono>{v.plate}</TD>
                                <TD mono>{v.capacity}</TD>
                                <TD>{v.driver}</TD>
                                <TD mono>{v.lastService}</TD>
                                <TD><Badge label={v.status} cfg={vehStatusCfg[v.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LogisticsSettings() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 24, maxWidth: 600, boxShadow: ds.shadow }}>
            <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 750, color: ds.text, marginBottom: 16 }}>Logistics Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Logistics Company Name</label>
                    <input type="text" defaultValue={localStorage.getItem('businessName') || 'Agri Delivery Logistics'} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Service Coverage Range</label>
                    <select style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }}>
                        <option>Island-wide Sri Lanka</option>
                        <option>Province-level Only</option>
                        <option>District-level Only</option>
                    </select>
                </div>
                <div>
                    <button style={{ padding: '8px 16px', background: ds.blue, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save Logistics Profile</button>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryExportDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const renderSection = () => {
        switch (section) {
            case 'dashboard': return <DashboardHome setSection={setSection} />;
            case 'delivery': return <DeliveryRequests />;
            case 'export': return <ExportRequests />;
            case 'tracking': return <ShipmentTracking />;
            case 'vehicles': return <VehiclesDrivers />;
            case 'settings': return <LogisticsSettings />;
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