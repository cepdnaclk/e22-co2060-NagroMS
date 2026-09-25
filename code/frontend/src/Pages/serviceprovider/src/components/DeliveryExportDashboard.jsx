// Trigger rebuild
import { useState, useMemo, useEffect } from 'react';
import {
    LayoutDashboard, Truck, Ship, Navigation, Car,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, Clock, CheckCircle, Package, Search,
    Plus, Eye, Check, X, Download, MessageSquare, Send,
    Paperclip, Filter, ArrowUpRight, Bell, User, Calendar,
    AlertTriangle, ShieldCheck, MapPin, HelpCircle, Menu
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { db, auth } from '../../../../utils/firebase.js'; // Firebase integration
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { 
    collection, onSnapshot, doc, updateDoc, addDoc, getDocs, writeBatch, setDoc, deleteDoc
} from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713311.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 4px 6px rgba(0,0,0,0.1);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const ds = {
    sidebar: 'linear-gradient(170deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)',
    blue: '#2563eb', blueLt: '#eff6ff', blueBd: '#bfdbfe',
    green: '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#f1f5f9', surface: '#ffffff',
    border: '#e2e8f0', borderLt: '#f8fafc',
    text: '#0f172a', textSec: '#475569', textTer: '#94a3b8',
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fffbeb', amberBd: '#fde68a',
    red: '#dc2626', redLt: '#fef2f2', redBd: '#fecaca',
    purple: '#8b5cf6', purpleLt: '#f5f3ff', purpleBd: '#ddd6fe',
    teal: '#0891b2', tealLt: '#ecfeff', tealBd: '#a5f3fc',
};

// Seed Data for initial database load if Firestore collection is empty
const SEED_DELIVERIES = [
    { id: 'DLV-2891', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', customer: 'Manning Market', pickup: 'Anuradhapura', drop: 'Colombo Pettah', product: 'Paddy Rice', qty: '2,000 kg', date: '2026-07-08', status: 'Pending', price: 12000, distance: '185 km' },
    { id: 'DLV-2890', farmer: 'Kamala Silva', farmerIcon: '👩‍🌾', customer: 'Keells Super', pickup: 'Kandy', drop: 'Kandy City', product: 'Tomatoes', qty: '800 kg', date: '2026-07-07', status: 'In Transit', price: 4500, distance: '22 km' },
    { id: 'DLV-2889', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', customer: 'Laugfs Eco Store', pickup: 'Galle', drop: 'Colombo 03', product: 'Organic Spices', qty: '350 kg', date: '2026-07-06', status: 'Delivered', price: 18000, distance: '116 km' },
    { id: 'DLV-2888', farmer: 'Priya Kumar', farmerIcon: '👩‍🌾', customer: 'Local Supermarket', pickup: 'Jaffna', drop: 'Colombo 07', product: 'Fresh Fruits', qty: '600 kg', date: '2026-07-05', status: 'Accepted', price: 22000, distance: '395 km' },
    { id: 'DLV-2887', farmer: 'Rajan Muthu', farmerIcon: '👨‍🌾', customer: 'Wholesale Market', pickup: 'Batticaloa', drop: 'Kandy', product: 'Banana', qty: '1,200 kg', date: '2026-07-04', status: 'Delivered', price: 8500, distance: '174 km' }
];

const SEED_SHIPMENTS = [
    { id: 'DLV-2890', farmer: 'Kamala Silva', driver: 'Asanka Perera', vehicle: 'LT-5892 (Lorry)', from: 'Kandy', to: 'Kandy City Center', progress: 65, status: 'In Transit', eta: '45 min', product: 'Tomatoes (800 kg)', gps: { driverLat: 7.2906, driverLng: 80.6337, pickupLat: 7.3000, pickupLng: 80.6500, dropLat: 7.2800, dropLng: 80.6200 } },
    { id: 'DLV-2888', farmer: 'Priya Kumar', driver: 'Ruwan Silva', vehicle: 'WP-3341 (Van)', from: 'Jaffna', to: 'Colombo 07', progress: 22, status: 'In Transit', eta: '5h 20min', product: 'Fresh Fruits (600 kg)', gps: { driverLat: 9.3000, driverLng: 80.1000, pickupLat: 9.6615, pickupLng: 80.0255, dropLat: 6.9271, dropLng: 79.8612 } }
];

const SEED_VEHICLES = [
    { id: 'VH-01', emoji: '🚚', type: '10-Ton Lorry', plate: 'LT-5892', status: 'In Transit', driver: 'Asanka Perera', capacity: '10,000 kg', lastService: '2026-06-15' },
    { id: 'VH-02', emoji: '🚐', type: 'Mini Van', plate: 'WP-3341', status: 'In Transit', driver: 'Ruwan Silva', capacity: '1,500 kg', lastService: '2026-06-28' },
    { id: 'VH-03', emoji: '🚛', type: 'Refrigerated Truck', plate: 'NW-7721', status: 'Available', driver: 'Chamara Dias', capacity: '8,000 kg', lastService: '2026-07-01' }
];

const MONTHLY = [
    { month: 'Jan', deliveries: 48, revenue: 385 },
    { month: 'Feb', deliveries: 62, revenue: 492 },
    { month: 'Mar', deliveries: 71, revenue: 568 },
    { month: 'Apr', deliveries: 58, revenue: 445 },
    { month: 'May', deliveries: 84, revenue: 672 },
    { month: 'Jun', deliveries: 96, revenue: 782 },
    { month: 'Jul', deliveries: 79, revenue: 651 },
];

const TYPE_DIST = [
    { name: 'Local Delivery', value: 72, color: ds.blue },
    { name: 'Inter-City', value: 28, color: ds.green }
];

const PRODUCT_DIST = [
    { name: 'Paddy Rice', qty: '12,500 kg', pct: 40, color: ds.blue },
    { name: 'Ceylon Tea', qty: '6,200 kg', pct: 25, color: ds.green },
    { name: 'Vegetables', qty: '4,800 kg', pct: 18, color: ds.purple },
    { name: 'Ceylon Cinnamon', qty: '3,000 kg', pct: 10, color: ds.amber },
    { name: 'Other Produce', qty: '2,100 kg', pct: 7, color: ds.teal }
];

const delStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Accepted: { bg: ds.blueLt, color: '#1e40af', dot: ds.blue },
    'In Transit': { bg: ds.tealLt, color: '#164e63', dot: ds.teal },
    Delivered: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Rejected: { bg: ds.redLt, color: '#991b1b', dot: ds.red },
};


function Badge({ label, cfg }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: ds.fontB, padding: '3px 9px', borderRadius: 99, background: cfg?.bg || '#f3f4f6', color: cfg?.color || '#374151', whiteSpace: 'nowrap' }}>
            {cfg?.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}{label}
        </span>
    );
}

function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend, trendUp = true }) {
    return (
        <div className="hover-3d glass-card" style={{ 
            borderRadius: 20, 
            padding: '22px 20px', 
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
        }}>
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

const TH = ({ children }) => <th style={{ padding: '11px 16px', fontFamily: ds.fontB, fontSize: 11, fontWeight: 600, color: ds.textSec, textAlign: 'left', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${ds.border}`, background: '#f9fafb', whiteSpace: 'nowrap' }}>{children}</th>;
const TD = ({ children, mono }) => <td style={{ padding: '13px 16px', fontFamily: mono ? ds.fontM : ds.fontB, fontSize: 13, color: ds.text, borderBottom: `1px solid ${ds.borderLt}`, verticalAlign: 'middle' }}>{children}</td>;

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }) {
    const NAV = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'delivery', label: 'Delivery Requests', icon: Truck },
        { id: 'tracking', label: 'Shipment Tracking', icon: Navigation },
        { id: 'vehicles', label: 'Vehicles & Drivers', icon: Car },
        { id: 'history', label: 'Delivery History', icon: Calendar },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚚</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Logistics & Export</p></div>}
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
        delivery: 'Delivery Requests',
        tracking: 'Shipment Tracking Telemetry',
        vehicles: 'Fleet Management',
        history: 'Delivery History Log',
        analytics: 'Logistics Analytics',
        messages: 'Customer Messages',
        settings: 'Configuration Settings'
    };
    const businessName = localStorage.getItem('businessName') || 'Agro Logistics Hub';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Logistics & Export Portal · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>🚛</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection, onQuickAction, deliveries, shipments }) {
    const active = shipments.filter(s => s.status === 'In Transit').length;
    const pending = deliveries.filter(d => d.status === 'Pending').length;
    const completed = deliveries.filter(d => d.status === 'Delivered').length;
    const totalRevenue = deliveries.reduce((sum, d) => sum + (d.price || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Total Requests" value={String(deliveries.length)} sub={`${completed} completed`} icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} trend="+12%" />
                <KpiCard label="Active in Transit" value={String(active)} sub="Live GPS tracking" icon={<Truck style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} trend="+2 today" />
                <KpiCard label="Pending Dispatch" value={String(pending)} sub="Awaiting acceptance" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} trend={pending > 0 ? `${pending} urgent` : 'All clear'} trendUp={pending === 0} />
                <KpiCard label="Monthly Revenue" value={`Rs ${(totalRevenue/1000).toFixed(0)}K`} sub="Current month total" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} trend="+8.3%" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div className="hover-3d glass-card" style={{ borderRadius: 18, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: '0 0 4px 0' }}>Monthly Shipping Trends</h3>
                            <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>Deliveries over the last 7 months</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={MONTHLY} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: ds.textTer }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: ds.textTer }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${ds.border}`, boxShadow: ds.shadowMd, fontFamily: ds.fontB, fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12, fontFamily: ds.fontB }} />
                            <Bar dataKey="deliveries" fill={ds.blue} name="Local Deliveries" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="hover-3d glass-card" style={{ borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: 0 }}>Pending Dispatch</h3>
                        <span style={{ background: ds.amberLt, color: ds.amber, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, border: `1px solid ${ds.amberBd}` }}>{pending} urgent</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                        {deliveries.filter(d => d.status === 'Pending').slice(0, 4).map((d) => (
                            <div key={d.id} style={{ display: 'flex', gap: 12, padding: '12px', background: ds.bg, borderRadius: 12, border: `1px solid ${ds.border}`, alignItems: 'flex-start' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: ds.amberLt, color: ds.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package size={18} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: '0 0 2px 0', fontSize: 12, fontWeight: 600, color: ds.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.product} <span style={{ color: ds.textTer, fontWeight: 400 }}>({d.qty})</span></p>
                                    <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>{d.pickup} → {d.drop}</p>
                                </div>
                            </div>
                        ))}
                        {pending === 0 && <p style={{ fontSize: 13, color: ds.textSec, textAlign: 'center', marginTop: 40 }}>No pending dispatch alerts. ✅</p>}
                    </div>
                    <button onClick={() => setSection('delivery')} style={{ width: '100%', padding: '10px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontFamily: ds.fontB, fontSize: 13, marginTop: 16, cursor: 'pointer' }}>View All Requests</button>
                </div>
            </div>

            <div className="glass-card" style={{ borderRadius: 18, padding: '20px' }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 700, color: ds.text, margin: '0 0 14px 0' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn-3d" onClick={() => onQuickAction('add-vehicle')} style={{ padding: '10px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: ds.fontB }}><Plus size={16} /> Add Vehicle</button>
                    <button className="btn-3d" onClick={() => onQuickAction('assign-driver')} style={{ padding: '10px 16px', background: ds.surface, color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: ds.fontB }}><User size={16} /> Assign Drivers</button>
                    <button className="btn-3d" onClick={() => onQuickAction('update-shipment')} style={{ padding: '10px 16px', background: ds.surface, color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: ds.fontB }}><CheckCircle size={16} /> Update Shipment</button>
                </div>
            </div>
        </div>
    );
}

function DeliveryRequests({ deliveries, handleAction }) {
    const [dispatching, setDispatching] = useState(null);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: '0 0 2px 0' }}>Pending Farmer Transport Orders</h3>
                        <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>Accept or reject incoming delivery requests from farmers</p>
                    </div>
                    <span style={{ background: ds.amberLt, color: ds.amber, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, border: `1px solid ${ds.amberBd}` }}>{deliveries.filter(d => d.status === 'Pending').length} Pending</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <TH>Order ID</TH>
                                <TH>Farmer</TH>
                                <TH>Route</TH>
                                <TH>Cargo</TH>
                                <TH>Price Bid</TH>
                                <TH>Date</TH>
                                <TH>Status</TH>
                                <TH>Actions</TH>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(d => (
                                <tr key={d.id} className="table-row-3d" style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                                    <TD mono>{d.id}</TD>
                                    <TD>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: ds.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{d.farmerIcon}</div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{d.farmer}</p>
                                            </div>
                                        </div>
                                    </TD>
                                    <TD>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>{d.pickup}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>→ {d.drop} <span style={{ color: ds.textTer }}>({d.distance})</span></p>
                                        </div>
                                    </TD>
                                    <TD>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{d.product}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>{d.qty}</p>
                                    </TD>
                                    <TD><span style={{ fontFamily: ds.fontM, fontWeight: 700, color: ds.blue }}>Rs {d.price.toLocaleString()}</span></TD>
                                    <TD><span style={{ fontFamily: ds.fontM, fontSize: 12 }}>{d.date}</span></TD>
                                    <TD><Badge label={d.status} cfg={delStatusCfg[d.status]} /></TD>
                                    <TD>
                                        {d.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setDispatching(d)} style={{ padding: '6px 12px', background: ds.blue, border: 'none', color: '#fff', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Accept & Assign</button>
                                                <button onClick={() => handleAction(d.id, 'Rejected')} style={{ padding: '6px 10px', background: ds.redLt, border: `1px solid ${ds.redBd}`, color: ds.red, borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Reject</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: ds.textTer, fontStyle: 'italic' }}>Logged</span>
                                        )}
                                    </TD>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dispatch Modal */}
            {dispatching && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDispatching(null)}>
                    <div className="glass-card" style={{ borderRadius: 24, padding: 32, width: 480, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: `1px solid rgba(255,255,255,0.8)` }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontFamily: ds.fontD, fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: ds.text }}>Assign & Dispatch</h2>
                                <p style={{ margin: 0, fontSize: 13, color: ds.textSec }}>Select a driver for order {dispatching.id}</p>
                            </div>
                            <button onClick={() => setDispatching(null)} style={{ background: ds.bg, border: `1px solid ${ds.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: ds.textSec }}><X size={16} /></button>
                        </div>

                        <div style={{ background: ds.bg, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${ds.border}` }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: 11, fontWeight: 600, color: ds.textTer, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Details</p>
                            <p style={{ margin: '0 0 2px 0', fontWeight: 700, fontSize: 15, color: ds.text }}>{dispatching.product} — {dispatching.qty}</p>
                            <p style={{ margin: 0, fontSize: 13, color: ds.textSec }}>{dispatching.pickup} → {dispatching.drop} ({dispatching.distance})</p>
                        </div>

                        <p style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 600, color: ds.text }}>Available Fleet</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                            {SEED_VEHICLES.filter(v => v.status === 'Available').map(v => (
                                <div key={v.id} className="hover-3d glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 16, marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: ds.blueLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{v.emoji}</div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: ds.text }}>{v.driver}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>{v.type} · {v.plate} · {v.capacity}</p>
                                        </div>
                                    </div>
                                    <button className="btn-3d" onClick={() => { handleAction(dispatching.id, 'Accepted'); setDispatching(null); }} style={{ padding: '8px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Assign</button>
                                </div>
                            ))}
                            {SEED_VEHICLES.filter(v => v.status === 'Available').length === 0 && (
                                <p style={{ textAlign: 'center', color: ds.textSec, fontSize: 13, padding: 20 }}>No vehicles available right now.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



function MapRecenter({ location }) {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo([location.lat, location.lng], 11, { animate: true, duration: 1.2 });
        }
    }, [location, map]);
    return null;
}

// ─── Real Leaflet Map displaying Driver telemetry coordinates ───────
function LiveSriLankaMap({ shipments, selectedShipment, setSelectedShipment, gpsAccess, userLocation }) {
    return (
        <div style={{ position: 'relative', background: '#eff6ff', borderRadius: 16, padding: '16px', border: `1px solid ${ds.blueBd}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: ds.blue }}>Island-wide Telemetry Map</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: gpsAccess ? ds.green : ds.amber, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 10, color: ds.textSec }}>{gpsAccess ? 'Browser GPS Enabled' : 'Simulating GPS'}</span>
                </div>
            </div>

            <div style={{ width: '100%', height: 480, borderRadius: 12, overflow: 'hidden', border: `1px solid ${ds.border}` }}>
                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ width: '100%', height: '100%' }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {selectedShipment?.gps && (
                        <MapRecenter location={{ lat: selectedShipment.gps.driverLat, lng: selectedShipment.gps.driverLng }} />
                    )}

                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                            <Popup><strong>Your Location</strong></Popup>
                        </Marker>
                    )}

                    {shipments.map(s => {
                        if (!s.gps) return null;
                        const isSelected = selectedShipment?.id === s.id;
                        return (
                            <div key={s.id}>
                                {/* Route lines */}
                                <Polyline 
                                    positions={[
                                        [s.gps.pickupLat, s.gps.pickupLng], 
                                        [s.gps.driverLat, s.gps.driverLng]
                                    ]} 
                                    pathOptions={{ color: ds.blue, weight: 4 }} 
                                />
                                <Polyline 
                                    positions={[
                                        [s.gps.driverLat, s.gps.driverLng], 
                                        [s.gps.dropLat, s.gps.dropLng]
                                    ]} 
                                    pathOptions={{ color: ds.textTer, weight: 4, dashArray: '5, 5' }} 
                                />

                                {/* Pickup marker */}
                                <Marker position={[s.gps.pickupLat, s.gps.pickupLng]}>
                                    <Popup><strong>Pickup</strong><br/>{s.from}</Popup>
                                </Marker>

                                {/* Drop marker */}
                                <Marker position={[s.gps.dropLat, s.gps.dropLng]}>
                                    <Popup><strong>Drop-off</strong><br/>{s.to}</Popup>
                                </Marker>

                                {/* Driver marker */}
                                <Marker position={[s.gps.driverLat, s.gps.driverLng]} icon={truckIcon} eventHandlers={{ click: () => setSelectedShipment(s) }}>
                                    <Popup>
                                        <strong>{s.id}</strong><br/>
                                        Driver: {s.driver}<br/>
                                        Progress: {s.progress}%
                                    </Popup>
                                </Marker>
                            </div>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Selected shipment overlay card */}
            <div style={{ marginTop: 12, width: '100%', background: '#fff', border: `1px solid ${ds.border}`, borderRadius: 8, padding: 8, fontSize: 11 }}>
                {selectedShipment ? (
                    <div>
                        <div style={{ display: 'flex', justify: 'space-between', marginBottom: 4 }}>
                            <strong>{selectedShipment.id} ({selectedShipment.product})</strong>
                            <span style={{ color: ds.blue, fontWeight: 700 }}>{selectedShipment.progress}%</span>
                        </div>
                        <p style={{ margin: '0 0 2px 0' }}>📍 Driver: {selectedShipment.driver}</p>
                        <p style={{ margin: 0, color: ds.textSec }}>Route: {selectedShipment.from} → {selectedShipment.to}</p>
                    </div>
                ) : (
                    <p style={{ margin: 0, color: ds.textTer, textAlign: 'center' }}>Click any driver pin on the map to review live GPS coordinates.</p>
                )}
            </div>
        </div>
    );
}

function ShipmentTracking({ shipments, vehicles, handleGpsAccess, gpsAccess, handleUpdateProgress, userLocation }) {
    const [selectedShipment, setSelectedShipment] = useState(shipments[0] || null);
    const [simulating, setSimulating] = useState({});

    // 5-second automatic simulation
    useEffect(() => {
        const interval = setInterval(() => {
            shipments.forEach(s => {
                if (simulating[s.id] && s.progress < 100 && s.status === 'In Transit') {
                    handleUpdateProgress(s.id, Math.min(100, s.progress + 3));
                }
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [simulating, shipments, handleUpdateProgress]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card" style={{ borderRadius: 18, padding: 20, display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, marginBottom: 4 }}>Active Shipments Transit Progress</h3>
                    <p style={{ fontSize: 12, color: ds.textSec, margin: 0 }}>Real-time GPS delivery tracking logs.</p>
                </div>
                <button onClick={handleGpsAccess} style={{ padding: '8px 14px', background: gpsAccess ? ds.green : ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Navigation style={{ width: 14, height: 14 }} /> 
                    {gpsAccess ? 'Revoke GPS Access' : 'Allow Device GPS Tracking'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {shipments.map(s => (
                        <div key={s.id} className="hover-3d glass-card" onClick={() => setSelectedShipment(s)} style={{ borderRadius: 18, border: `2px solid ${selectedShipment?.id === s.id ? ds.blue : 'transparent'}`, padding: 20, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justify: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontFamily: ds.fontM, fontSize: 14, fontWeight: 700, color: ds.text }}>{s.id}</span>
                                    <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>{s.product}</p>
                                </div>
                                <Badge label={s.status} cfg={delStatusCfg[s.status]} />
                            </div>
                            <div style={{ fontSize: 12, color: ds.textSec, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <p style={{ margin: 0 }}>📍 <strong>Pickup:</strong> {s.from}</p>
                                <p style={{ margin: 0 }}>🏁 <strong>Drop:</strong> {s.to}</p>
                                <p style={{ margin: 0 }}>🧑‍✈️ <strong>Driver Assigned:</strong> {s.driver}</p>
                                <p style={{ margin: 0 }}>🚚 <strong>Vehicle Plate:</strong> {s.vehicle}</p>
                            </div>
                            
                            {s.gps && (
                                <div style={{ background: ds.borderLt, borderRadius: 6, padding: 8, fontSize: 11, marginBottom: 10, fontFamily: ds.fontM }}>
                                    📡 GPS Coordinate: Lat {s.gps.driverLat.toFixed(4)}° / Lng {s.gps.driverLng.toFixed(4)}°
                                </div>
                            )}

                            <div>
                                <div style={{ display: 'flex', justify: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                    <span>Transit progress</span>
                                    <span style={{ fontWeight: 600 }}>{s.progress}% (ETA: {s.eta})</span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${s.progress}%`, height: '100%', background: ds.blue, borderRadius: 3 }} />
                                </div>
                            </div>

                            {/* Increment/Decrement control to test GPS movement and Driver Link */}
                            {s.status !== 'Delivered' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                    {s.status === 'In Transit' && (
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setSimulating(prev => ({ ...prev, [s.id]: !prev[s.id] })); 
                                            }} 
                                            style={{ padding: '6px 12px', background: simulating[s.id] ? ds.amberLt : ds.blueLt, color: simulating[s.id] ? ds.amber : ds.blue, border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            {simulating[s.id] ? '⏸ Pause Transit' : '🚚 Start Transit (GPS On)'}
                                        </button>
                                    )}
                                    {s.status === 'In Transit' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateProgress(s.id, 100); }} style={{ padding: '6px 12px', background: ds.greenLt, color: ds.green, border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Complete Delivery</button>
                                    )}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            navigator.clipboard.writeText(`${window.location.origin}/company-driver/${s.id}`);
                                            alert(`Driver Magic Link Copied!\n\n${window.location.origin}/company-driver/${s.id}`);
                                        }} 
                                        style={{ padding: '6px 12px', background: ds.purpleLt, color: ds.purple, border: `1px solid ${ds.purpleBd}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        🔗 Copy Driver Link
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <LiveSriLankaMap 
                    shipments={shipments} 
                    selectedShipment={selectedShipment} 
                    setSelectedShipment={setSelectedShipment} 
                    gpsAccess={gpsAccess} 
                    userLocation={userLocation}
                />
            </div>
        </div>
    );
}

function VehiclesDrivers({ vehicles, handleAddVehicle, handleDeleteVehicle, handleUpdateVehicleDriver }) {
    const [editingDriverId, setEditingDriverId] = useState(null);
    const [editDriverName, setEditDriverName] = useState('');
    const [plate, setPlate] = useState('');
    const [type, setType] = useState('10-Ton Lorry');
    const [capacity, setCapacity] = useState('');
    const [driver, setDriver] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if (!plate || !capacity || !driver) {
            alert('Please fill out all fields: License Plate, Capacity, and Driver Name.');
            return;
        }
        
        let emoji = '🚚';
        if (type === 'Mini Van') emoji = '🚐';
        else if (type === 'Refrigerated Truck') emoji = '🚛';

        handleAddVehicle({
            id: 'VH-' + Math.floor(Math.random()*100),
            emoji,
            type,
            plate,
            status: 'Available',
            driver,
            capacity,
            lastService: new Date().toISOString().split('T')[0]
        });
        
        alert('Vehicle successfully registered!');
        setPlate('');
        setCapacity('');
        setDriver('');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 16 }}>
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                <SectionHeader title="Active Logistics Fleet Registry" subtitle="Manage vehicles, operating limits and dispatch slots." />
                <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <TH>Vehicle</TH>
                                <TH>License Plate</TH>
                                <TH>Assigned Driver</TH>
                                <TH>Hauling Capacity</TH>
                                <TH>Last Inspection</TH>
                                <TH>Status</TH>
                                <TH>Actions</TH>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id}>
                                    <TD>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 18 }}>{v.emoji}</span>
                                            <div>
                                                <strong>{v.type}</strong>
                                                <p style={{ margin: 0, fontSize: 10, color: ds.textTer }}>{v.id}</p>
                                            </div>
                                        </div>
                                    </TD>
                                    <TD mono>{v.plate}</TD>
                                    <TD><strong>{v.driver}</strong></TD>
                                    <TD mono>{v.capacity}</TD>
                                    <TD mono>{v.lastService}</TD>
                                    <TD><Badge label={v.status} cfg={v.status === 'Available' ? delStatusCfg.Delivered : delStatusCfg['In Transit']} /></TD>
                                    <TD>
                                        {editingDriverId === v.id ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <input value={editDriverName} onChange={e => setEditDriverName(e.target.value)} style={{ padding: '4px 6px', width: 120, fontSize: 12, border: `1px solid ${ds.border}`, borderRadius: 4 }} />
                                                <button onClick={() => { handleUpdateVehicleDriver(v.id, editDriverName); setEditingDriverId(null); }} style={{ padding: '4px 8px', background: ds.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Save</button>
                                                <button onClick={() => setEditingDriverId(null)} style={{ padding: '4px 8px', background: ds.surface, color: ds.textSec, border: `1px solid ${ds.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => { setEditingDriverId(v.id); setEditDriverName(v.driver); }} style={{ padding: '4px 8px', background: ds.blueLt, color: ds.blue, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Edit Driver</button>
                                                <button onClick={() => handleDeleteVehicle(v.id)} style={{ padding: '4px 8px', background: ds.redLt, color: ds.red, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Delete</button>
                                            </div>
                                        )}
                                    </TD>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow, height: 'fit-content' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 700 }}>Register New Fleet Vehicle</h4>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Vehicle Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }}>
                            <option value="10-Ton Lorry">10-Ton Lorry</option>
                            <option value="Mini Van">Mini Van</option>
                            <option value="Refrigerated Truck">Refrigerated Truck</option>
                            <option value="Flatbed Lorry">Flatbed Lorry</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>License Plate Number</label>
                        <input type="text" placeholder="e.g. WP LH-8902" value={plate} onChange={e => setPlate(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Hauling Capacity (kg)</label>
                        <input type="text" placeholder="e.g. 5,000 kg" value={capacity} onChange={e => setCapacity(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Assigned Driver Name</label>
                        <input type="text" placeholder="e.g. Chamara Silva" value={driver} onChange={e => setDriver(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginTop: 6 }}>Register Vehicle</button>
                </form>
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle, action }) {
    return (
        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ margin: 0, fontSize: 11, color: ds.textSec }}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function DeliveryHistory({ completedDeliveries }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const handleCSVExport = () => {
        const headers = ['Order ID', 'Farmer', 'Customer', 'Product', 'Qty/Weight', 'Price Paid', 'Distance', 'Date Delivered', 'Status'];
        const csvRows = completedDeliveries.map(d => [
            d.id, d.farmer, d.customer, d.product, d.qty, d.price, d.distance, d.date, d.status
        ]);
        const content = [headers.join(','), ...csvRows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `NagroMS_Deliveries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = useMemo(() => {
        return completedDeliveries.filter(d => {
            const matchesSearch = d.id.toLowerCase().includes(search.toLowerCase()) || d.farmer.toLowerCase().includes(search.toLowerCase()) || d.product.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === 'All' || d.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [completedDeliveries, search, typeFilter]);

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
            <SectionHeader 
                title="Delivery Transactions Archive" 
                subtitle="Historical audit files of successfully dispatched shipments."
                action={
                    <button onClick={handleCSVExport} style={{ padding: '8px 14px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Download style={{ width: 14, height: 14 }} /> Download CSV
                    </button>
                }
            />
            <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
                <input type="text" placeholder="Search archive by ID, farmer or crop..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13, background: '#fff' }}>
                    <option value="All">All Deliveries</option>
                    <option value="Local">Local Delivery</option>
                    <option value="Export">Export Shipment</option>
                </select>
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Order ID</TH>
                            <TH>Farmer</TH>
                            <TH>Destination Drop</TH>
                            <TH>Produce Type</TH>
                            <TH>Quantity</TH>
                            <TH>Price Paid</TH>
                            <TH>Transit Dist</TH>
                            <TH>Date Logged</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d.id}>
                                <TD mono>{d.id}</TD>
                                <TD><strong>{d.farmer}</strong></TD>
                                <TD>{d.customer}</TD>
                                <TD>{d.product}</TD>
                                <TD mono>{d.qty}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {d.price.toLocaleString()}</TD>
                                <TD mono>{d.distance}</TD>
                                <TD mono>{d.date}</TD>
                                <TD><Badge label={d.status} cfg={delStatusCfg[d.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LogisticsAnalytics() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <KpiCard label="On-Time Delivery Success" value="98.2%" sub="Transit schedules met" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Average Transit Duration" value="2.4 Hours" sub="From pickup to central hub" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Fleet Capacity Utilization" value="82.5%" sub="Average load ratio" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 16 }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Logistics Channel Split</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={TYPE_DIST} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                                {TYPE_DIST.map((d, index) => <Cell key={index} fill={d.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Heaviest Delivered Commodities (Kg)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                        {PRODUCT_DIST.map(p => (
                            <div key={p.name}>
                                <div style={{ display: 'flex', justify: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                                    <span>{p.qty} ({p.pct}%)</span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                                    <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogisticsMessages() {
    const [conversations, setConversations] = useState([
        { id: 'c1', name: 'Sunil Perera', role: 'Paddy Farmer', lastMessage: 'Is the Anuradhapura dispatch ready?', unread: 1, online: true },
        { id: 'c2', name: 'Ruwan Silva', role: 'Fleet Driver', lastMessage: 'Reached Colombo Port custom desk.', unread: 0, online: false }
    ]);
    const [activeChat, setActiveChat] = useState('c1');
    const [messages, setMessages] = useState({
        c1: [
            { id: 1, sender: 'them', text: 'Hi, I need transport for 2,000 kg paddy rice from Anuradhapura.', time: '09:12 AM' },
            { id: 2, sender: 'me', text: 'Good morning Sunil. Yes, we have a 10-Ton Lorry scheduled.', time: '09:20 AM' },
            { id: 3, sender: 'them', text: 'Great. Is the Anuradhapura dispatch ready?', time: '09:22 AM' }
        ],
        c2: [
            { id: 1, sender: 'them', text: 'Documents verified. Reached Colombo Port custom desk.', time: 'Yesterday' }
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
                    <input type="text" placeholder="Search chats..." style={{ width: '100%', padding: '6px 10px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 12 }} />
                </div>
                <div style={{ overflowY: 'auto' }}>
                    {conversations.map(conv => (
                        <div key={conv.id} onClick={() => { setActiveChat(conv.id); conv.unread = 0; }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, cursor: 'pointer', background: activeChat === conv.id ? ds.blueLt : 'transparent', borderBottom: `1px solid ${ds.borderLt}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚛</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{conv.name}</span>
                                <p style={{ margin: 0, fontSize: 10, color: ds.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${ds.border}`, background: '#f8fafc' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{conversations.find(c => c.id === activeChat)?.name}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                    {messages[activeChat]?.map(m => {
                        const isMe = m.sender === 'me';
                        return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '70%', background: isMe ? ds.blue : '#fff', color: isMe ? '#fff' : ds.text, padding: '10px 14px', borderRadius: 12, border: isMe ? 'none' : `1px solid ${ds.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4 }}>{m.text}</p>
                                    <span style={{ display: 'block', textAlign: 'right', fontSize: 9, color: isMe ? 'rgba(255,255,255,0.7)' : ds.textTer, marginTop: 4 }}>{m.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <form onSubmit={handleSend} style={{ padding: 12, borderTop: `1px solid ${ds.border}`, display: 'flex', gap: 8 }}>
                    <input type="text" placeholder="Type secure message..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                    <button type="submit" style={{ padding: '8px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                </form>
            </div>
        </div>
    );
}

function LogisticsSettings() {
    const [bizName, setBizName] = useState(localStorage.getItem('businessName') || 'Agro Logistics Hub');
    const [tab, setTab] = useState('profile');
    const [existingPassword, setExistingPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('businessName', bizName);
        alert('Configurations saved successfully!');
    };

    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 24, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, boxShadow: ds.shadow }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderRight: `1px solid ${ds.border}`, paddingRight: 16 }}>
                {['profile', 'notifications', 'security', 'account', 'theme'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ textAlign: 'left', padding: '8px 12px', border: 'none', background: tab === t ? ds.blueLt : 'transparent', color: tab === t ? ds.blue : ds.textSec, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {t === 'profile' ? 'Business Profile' : t + ' settings'}
                    </button>
                ))}
            </div>

            <div>
                {tab === 'profile' && (
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Company Profile</h4>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Registered Business Name</label>
                            <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Corporate Address</label>
                            <input type="text" defaultValue="No 45, Baseline Road, Colombo 09" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <button type="submit" style={{ padding: '8px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, alignSelf: 'flex-start' }}>Save Config</button>
                    </form>
                )}

                {tab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Notification Preferences</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <input type="checkbox" defaultChecked /> SMS alerts to farmers on vehicle departure
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <input type="checkbox" defaultChecked /> Email invoices on successful delivery confirmation
                            </label>
                        </div>
                    </div>
                )}

                {tab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Security Settings</h4>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Existing Password</label>
                            <input type="password" placeholder="••••••••" value={existingPassword} onChange={e => setExistingPassword(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>New Password</label>
                            <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Re-enter New Password</label>
                            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>

                        <button 
                            disabled={loading}
                            onClick={async () => {
                                if (!existingPassword || !newPassword || !confirmPassword) {
                                    alert('Please fill out all password fields.');
                                    return;
                                }
                                if (newPassword !== confirmPassword) {
                                    alert('New passwords do not match. Please try again.');
                                    return;
                                }
                                if (newPassword.length < 6) {
                                    alert('New password must be at least 6 characters long.');
                                    return;
                                }

                                setLoading(true);
                                try {
                                    const user = auth.currentUser;
                                    if (user && user.email) {
                                        // Re-authenticate user before changing password
                                        const credential = EmailAuthProvider.credential(user.email, existingPassword);
                                        await reauthenticateWithCredential(user, credential);
                                        // Update to new password
                                        await updatePassword(user, newPassword);
                                        alert('Security alert: Your password has been successfully updated in Firebase!');
                                    } else {
                                        // Fallback for simulated dashboard environment where user is not logged into Firebase Auth
                                        console.warn('Simulating password update because no Firebase user is currently logged in.');
                                        alert('Security alert: Your password has been updated successfully! (Simulation mode)');
                                    }
                                    setExistingPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                } catch (error) {
                                    console.error('Password update failed:', error);
                                    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                                        alert('The existing password you entered is incorrect.');
                                    } else {
                                        alert(`Failed to update password: ${error.message}`);
                                    }
                                } finally {
                                    setLoading(false);
                                }
                            }} 
                            style={{ padding: '8px 12px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12, alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                )}

                {tab === 'account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Logistics Business Tier</h4>
                        <div style={{ background: ds.blueLt, border: `1px solid ${ds.blueBd}`, borderRadius: 8, padding: 16 }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ds.blue }}>NagroMS Logistics Enterprise</p>
                            <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>Access to export manifests, custom clearances, and multi-lorry tracking telemetry.</p>
                        </div>
                    </div>
                )}

                {tab === 'theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Portal Appearance</h4>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => alert('Default Slate Blue Theme preserved')} style={{ padding: '10px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                Logistical Slate Blue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DeliveryExportDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSetSection = (s) => {
        setSection(s);
        if (window.innerWidth <= 768) setIsMobileOpen(false);
    };

    const [deliveries, setDeliveries] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [gpsAccess, setGpsAccess] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: '<div style="background: #2563eb; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    // ── Real-time Database Synchronization via Firestore ───────────────────────
    useEffect(() => {
        // 1. Deliveries Listener
        const unsubDeliveries = onSnapshot(collection(db, 'deliveries'), (snapshot) => {
            if (snapshot.empty) {
                // Seed database initially
                const batch = writeBatch(db);
                SEED_DELIVERIES.forEach(d => {
                    const docRef = doc(collection(db, 'deliveries'), d.id);
                    batch.set(docRef, d);
                });
                batch.commit();
            } else {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDeliveries(list);
            }
        });

        // 3. Shipments Listener
        const unsubShipments = onSnapshot(collection(db, 'shipments'), (snapshot) => {
            if (snapshot.empty) {
                const batch = writeBatch(db);
                SEED_SHIPMENTS.forEach(s => {
                    const docRef = doc(collection(db, 'shipments'), s.id);
                    batch.set(docRef, s);
                });
                batch.commit();
            } else {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setShipments(list);
            }
        });

        // 4. Vehicles Listener
        const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
            if (snapshot.empty) {
                const batch = writeBatch(db);
                SEED_VEHICLES.forEach(v => {
                    const docRef = doc(collection(db, 'vehicles'), v.id);
                    batch.set(docRef, v);
                });
                batch.commit().catch(e => {
                    console.error('Batch commit failed', e);
                    setVehicles(SEED_VEHICLES);
                });
            } else {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setVehicles(list);
            }
        }, (error) => {
            console.error('Firebase vehicles listener failed:', error);
            // Fallback to seed data if permissions are missing
            setVehicles(SEED_VEHICLES);
        });

        return () => {
            unsubDeliveries();
            unsubShipments();
            unsubVehicles();
        };
    }, []);

    // ── Geolocation API Browser access handler ──────────────────────────────────
    const handleGpsAccess = () => {
        if (!gpsAccess) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setGpsAccess(true);
                        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                        alert(`GPS access granted! Your coordinates: Lat ${position.coords.latitude.toFixed(4)} / Lng ${position.coords.longitude.toFixed(4)}. Simulating nearby fleet driver tracking.`);
                        // Move one in-transit driver close to user coordinates
                        const activeTransit = shipments.find(s => s.status === 'In Transit');
                        if (activeTransit) {
                            const sfDoc = doc(db, 'shipments', activeTransit.id);
                            updateDoc(sfDoc, {
                                'gps.driverLat': position.coords.latitude,
                                'gps.driverLng': position.coords.longitude
                            });
                        }
                    },
                    (error) => {
                        console.error('GPS permission failed:', error);
                        alert('Could not retrieve device location. Check browser settings to enable real-time GPS telemetry.');
                    }
                );
            } else {
                alert('Geolocation API not supported by this browser.');
            }
        } else {
            setGpsAccess(false);
            setUserLocation(null);
            alert('GPS device location feed disabled.');
        }
    };

    // ── Update Shipment status and simulate vehicle coordinate movements ───────
    const handleUpdateProgress = async (id, newProgress) => {
        const sfDoc = doc(db, 'shipments', id);
        const updates = { progress: newProgress };
        
        if (newProgress === 100) {
            updates.status = 'Delivered';
            updates.eta = '0 min';
            // Also update main deliveries collection status
            const delDoc = doc(db, 'deliveries', id);
            await updateDoc(delDoc, { status: 'Delivered' });
        } else {
            // Adjust coordinates closer to drop location
            const s = shipments.find(x => x.id === id);
            if (s && s.gps) {
                const ratio = newProgress / 100;
                const newLat = s.gps.pickupLat + (s.gps.dropLat - s.gps.pickupLat) * ratio;
                const newLng = s.gps.pickupLng + (s.gps.dropLng - s.gps.pickupLng) * ratio;
                updates['gps.driverLat'] = newLat;
                updates['gps.driverLng'] = newLng;
            }
        }
        await updateDoc(sfDoc, updates);
    };

    const handleAction = async (id, newStatus) => {
        const delDoc = doc(db, 'deliveries', id);
        await updateDoc(delDoc, { status: newStatus });

        if (newStatus === 'Accepted') {
            const d = deliveries.find(x => x.id === id);
            if (d) {
                // Geocode coordinates simulation (Anuradhapura -> Colombo coordinates)
                let pickupLat = 8.3122, pickupLng = 80.4037;
                let dropLat = 6.9271, dropLng = 79.8612;

                if (d.pickup.includes('Kandy')) { pickupLat = 7.2906; pickupLng = 80.6337; }
                if (d.pickup.includes('Jaffna')) { pickupLat = 9.6615; pickupLng = 80.0255; }
                if (d.pickup.includes('Galle')) { pickupLat = 6.0535; pickupLng = 80.2210; }
                if (d.pickup.includes('Batticaloa')) { pickupLat = 7.7170; pickupLng = 81.7010; }

                if (d.drop.includes('Kandy')) { dropLat = 7.2906; dropLng = 80.6337; }
                if (d.drop.includes('Jaffna')) { dropLat = 9.6615; dropLng = 80.0255; }
                if (d.drop.includes('Galle')) { dropLat = 6.0535; dropLng = 80.2210; }
                
                const newShip = {
                    id: d.id,
                    farmer: d.farmer,
                    driver: 'Asanka Perera',
                    vehicle: 'LT-5892',
                    from: d.pickup,
                    to: d.drop,
                    progress: 0,
                    status: 'In Transit',
                    eta: '3 hours',
                    product: `${d.product} (${d.qty})`,
                    gps: {
                        pickupLat, pickupLng,
                        dropLat, dropLng,
                        driverLat: pickupLat,
                        driverLng: pickupLng
                    }
                };
                // Save shipment document
                await setDoc(doc(db, 'shipments', d.id), newShip);
            }
        }
    };

    const handleAddVehicle = async (newVeh) => {
        try {
            await addDoc(collection(db, 'vehicles'), newVeh);
        } catch (error) {
            console.error('Failed to add vehicle to Firebase:', error);
            // Fallback to local state so the UI still updates
            setVehicles(prev => [...prev, newVeh]);
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this vehicle from the fleet?")) return;
        try {
            await deleteDoc(doc(db, 'vehicles', id));
            // Also remove it from local state in case the listener doesn't catch it immediately or if it's a mock
            setVehicles(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            alert('Failed to delete from database. It might be a mock object or lacking permissions.');
            setVehicles(prev => prev.filter(v => v.id !== id));
        }
    };

    const handleUpdateVehicleDriver = async (id, newDriver) => {
        if (!newDriver.trim()) {
            alert('Driver name cannot be empty.');
            return;
        }
        try {
            await updateDoc(doc(db, 'vehicles', id), { driver: newDriver });
            setVehicles(prev => prev.map(v => v.id === id ? { ...v, driver: newDriver } : v));
        } catch (error) {
            console.error('Failed to update driver:', error);
            alert('Failed to update in database. Updating locally instead.');
            setVehicles(prev => prev.map(v => v.id === id ? { ...v, driver: newDriver } : v));
        }
    };

    const handleQuickAction = (action) => {
        if (action === 'add-vehicle') {
            setSection('vehicles');
        } else if (action === 'assign-driver') {
            setSection('vehicles');
            alert('Select vehicle in the directory to assign or change active drivers.');
        } else if (action === 'update-shipment') {
            setSection('tracking');
        }
    };

    const completedDeliveries = useMemo(() => {
        return deliveries.filter(d => d.status === 'Delivered' || d.status === 'Rejected');
    }, [deliveries]);

    const activeDeliveries = useMemo(() => {
        return deliveries.filter(d => d.status !== 'Delivered' && d.status !== 'Rejected');
    }, [deliveries]);

    const renderSection = () => {
        switch (section) {
            case 'dashboard':
                return <DashboardHome setSection={setSection} onQuickAction={handleQuickAction} deliveries={deliveries} shipments={shipments} />;
            case 'delivery':
                return <DeliveryRequests deliveries={activeDeliveries} handleAction={handleAction} />;
            case 'tracking':
                return <ShipmentTracking shipments={shipments} vehicles={vehicles} handleGpsAccess={handleGpsAccess} gpsAccess={gpsAccess} handleUpdateProgress={handleUpdateProgress} userLocation={userLocation} />;
            case 'vehicles':
                return <VehiclesDrivers vehicles={vehicles} handleAddVehicle={handleAddVehicle} handleDeleteVehicle={handleDeleteVehicle} handleUpdateVehicleDriver={handleUpdateVehicleDriver} />;
            case 'history':
                return <DeliveryHistory completedDeliveries={completedDeliveries} />;
            case 'analytics':
                return <LogisticsAnalytics />;
            case 'messages':
                return <LogisticsMessages />;
            case 'settings':
                return <LogisticsSettings />;
            default:
                return <DashboardHome setSection={setSection} onQuickAction={handleQuickAction} deliveries={deliveries} shipments={shipments} />;
        }
    };

    return (
        <div className="mobile-dash-wrapper" style={{ display: 'flex', background: ds.bg, minHeight: '100vh', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.65);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }
                .hover-3d {
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-color 0.4s ease;
                }
                .hover-3d:hover {
                    transform: translateY(-8px) scale(1.015);
                    box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.1), 0 15px 15px -5px rgba(0, 0, 0, 0.04);
                    border-color: rgba(255, 255, 255, 1);
                    z-index: 10;
                }
                .btn-3d {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-3d:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
                }
                .btn-3d:active {
                    transform: translateY(1px);
                    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
                }
                .table-row-3d {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .table-row-3d:hover {
                    background: #f8fafc !important;
                    transform: scale(1.005) translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
                    z-index: 20;
                    position: relative;
                }
                
                @media (max-width: 768px) {
                    .mobile-dash-wrapper { flex-direction: column !important; }
                    .mobile-sidebar { 
                        position: fixed !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        height: 100vh !important; 
                        width: 260px !important; 
                        z-index: 200 !important; 
                        transition: transform 0.3s ease !important;
                    }
                    .mobile-sidebar.closed { transform: translateX(-100%) !important; }
                    .mobile-sidebar.open { transform: translateX(0) !important; }
                    
                    .mobile-main { padding: 12px !important; padding-top: 64px !important; }
                    .hamburger-btn { display: block !important; }
                }
                .hamburger-btn { display: none; }
            `}</style>
            
            <button 
                className="hamburger-btn"
                onClick={() => setIsMobileOpen(true)}
                style={{ position: 'absolute', top: 16, left: 16, zIndex: 100, background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}
            >
                <Menu style={{ width: 24, height: 24 }} />
            </button>

            <div className={`mobile-sidebar ${isMobileOpen ? 'open' : 'closed'}`} style={{ zIndex: 10 }}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={handleSetSection} onNavigate={onNavigate} />
            </div>
            
            <div className="mobile-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} />
                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}