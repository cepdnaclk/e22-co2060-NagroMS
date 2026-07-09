import { useState, useMemo, useEffect } from 'react';
import {
    LayoutDashboard, Truck, Ship, Navigation, Car,
    Settings, LogOut, ChevronLeft, ChevronRight,
    TrendingUp, Clock, CheckCircle, Package, Search,
    Plus, Eye, Check, X, Download, MessageSquare, Send,
    Paperclip, Filter, ArrowUpRight, Bell, User, Calendar,
    AlertTriangle, ShieldCheck, MapPin, HelpCircle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { db } from '../../../../utils/firebase.js'; // Firebase integration
import { 
    collection, onSnapshot, doc, updateDoc, addDoc, getDocs, writeBatch 
} from 'firebase/firestore';

const ds = {
    sidebar: 'linear-gradient(170deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)',
    blue: '#2563eb', blueLt: '#eff6ff', blueBd: '#bfdbfe',
    green: '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#f3f4f6', surface: '#ffffff',
    border: '#e5e7eb', borderLt: '#f3f4f6',
    text: '#111827', textSec: '#4b5563', textTer: '#9ca3af',
    shadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fef3c7', amberBd: '#fde68a',
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

const SEED_EXPORTS = [
    { id: 'EXP-0441', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', product: 'Ceylon Cinnamon', destination: 'Germany', qty: '1,200 kg', status: 'Customs Clearance', documents: ['Phytosanitary', 'Origin Cert', 'Invoice'], customs: 'Under Review', price: 285000, date: '2026-07-05' },
    { id: 'EXP-0440', farmer: 'Amara Jayaweera', farmerIcon: '👩‍🌾', product: 'Organic Tea', destination: 'Japan', qty: '800 kg', status: 'Processing', documents: ['Export License', 'Invoice', 'Packing List'], customs: 'Not Started', price: 192000, date: '2026-07-04' },
    { id: 'EXP-0439', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', product: 'Black Pepper', destination: 'UAE', qty: '600 kg', status: 'Exported', documents: ['All Cleared'], customs: 'Approved', price: 168000, date: '2026-07-01' }
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
const expStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Processing: { bg: ds.blueLt, color: '#1e40af', dot: ds.blue },
    'Customs Clearance': { bg: ds.purpleLt, color: '#5b21b6', dot: ds.purple },
    Exported: { bg: ds.greenLt, color: '#166534', dot: ds.green },
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

const TH = ({ children }) => <th style={{ padding: '11px 16px', fontFamily: ds.fontB, fontSize: 11, fontWeight: 600, color: ds.textSec, textAlign: 'left', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${ds.border}`, background: '#f9fafb', whiteSpace: 'nowrap' }}>{children}</th>;
const TD = ({ children, mono }) => <td style={{ padding: '13px 16px', fontFamily: mono ? ds.fontM : ds.fontB, fontSize: 13, color: ds.text, borderBottom: `1px solid ${ds.borderLt}`, verticalAlign: 'middle' }}>{children}</td>;

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }) {
    const NAV = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'delivery', label: 'Delivery Requests', icon: Truck },
        { id: 'export', label: 'Export Requests', icon: Ship },
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
        export: 'Export Logistics',
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

function DashboardHome({ setSection, onQuickAction, deliveries, exports, shipments }) {
    const active = shipments.filter(s => s.status === 'In Transit').length;
    const pending = deliveries.filter(d => d.status === 'Pending').length;
    const completed = deliveries.filter(d => d.status === 'Delivered').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Total Requests" value={String(deliveries.length)} sub="All local deliveries" icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Active Deliveries" value={String(active)} sub="In transit shipments" icon={<Truck style={{ width: 18, height: 18 }} />} iconBg={ds.tealLt} iconColor={ds.teal} />
                <KpiCard label="Pending Orders" value={String(pending)} sub="Requires response" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={ds.amberLt} iconColor={ds.amber} />
                <KpiCard label="Monthly Revenue" value="Rs 651K" sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
            </div>

            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 12px 0' }}>Logistics Quick Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => onQuickAction('add-vehicle')} style={{ padding: '10px 16px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600 }}>+ Add Vehicle</button>
                    <button onClick={() => onQuickAction('assign-driver')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600 }}>Assign Driver</button>
                    <button onClick={() => onQuickAction('update-shipment')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600 }}>Update Shipment</button>
                    <button onClick={() => onQuickAction('create-export')} style={{ padding: '10px 16px', background: '#f3f4f6', color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: ds.fontB, fontSize: 13, fontWeight: 600 }}>Create Export Order</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Monthly Shipping Trends</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={MONTHLY}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="deliveries" stroke={ds.blue} name="Local Deliveries" strokeWidth={2} />
                            <Line type="monotone" dataKey="exports" stroke={ds.purple} name="Exports Processed" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Recent Dispatch Alerts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {deliveries.slice(0, 4).map((d, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                                <span style={{ fontSize: 16 }}>📋</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: ds.text }}>{d.id}: {d.product} ({d.qty})</p>
                                    <p style={{ margin: 0, fontSize: 10, color: ds.textSec }}>Route: {d.pickup} → {d.drop}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeliveryRequests({ deliveries, handleAction }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Pending Farmer Transport Orders</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Order ID</TH>
                            <TH>Farmer</TH>
                            <TH>Customer Drop</TH>
                            <TH>Product</TH>
                            <TH>Weight / Qty</TH>
                            <TH>Price Bid</TH>
                            <TH>Distance</TH>
                            <TH>Submission Date</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.map(d => (
                            <tr key={d.id}>
                                <TD mono>{d.id}</TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>{d.farmerIcon}</span>
                                        <strong>{d.farmer}</strong>
                                    </div>
                                </TD>
                                <TD>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>{d.customer}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: ds.textSec }}>Route: {d.pickup} → {d.drop}</p>
                                    </div>
                                </TD>
                                <TD>{d.product}</TD>
                                <TD mono>{d.qty}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {d.price.toLocaleString()}</TD>
                                <TD mono>{d.distance}</TD>
                                <TD mono>{d.date}</TD>
                                <TD><Badge label={d.status} cfg={delStatusCfg[d.status]} /></TD>
                                <TD>
                                    {d.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleAction(d.id, 'Accepted')} style={{ padding: '4px 8px', background: ds.blue, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Accept</button>
                                            <button onClick={() => handleAction(d.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Accepted & Logged</span>
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

function ExportRequests({ exports, handleAction }) {
    return (
        <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}`, display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>International Export Logistics</h3>
                    <p style={{ margin: 0, fontSize: 11, color: ds.textTer }}>Manage phytosanitary certificates, custom clearance, and export shipments.</p>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Export ID</TH>
                            <TH>Farmer</TH>
                            <TH>Produce</TH>
                            <TH>Destination</TH>
                            <TH>Volume</TH>
                            <TH>Clearing Status</TH>
                            <TH>Uploaded Documents</TH>
                            <TH>Customs Register</TH>
                            <TH>Clearance Desk</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {exports.map(e => (
                            <tr key={e.id}>
                                <TD mono>{e.id}</TD>
                                <TD><strong>{e.farmer}</strong></TD>
                                <TD>{e.product}</TD>
                                <TD>{e.destination}</TD>
                                <TD mono>{e.qty}</TD>
                                <TD><Badge label={e.status} cfg={expStatusCfg[e.status]} /></TD>
                                <TD>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {e.documents.map(d => (
                                            <span key={d} style={{ fontSize: 10, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, border: '1px solid #e5e7eb' }}>{d}</span>
                                        ))}
                                    </div>
                                </TD>
                                <TD><span style={{ fontSize: 12, color: e.customs === 'Approved' ? ds.green : ds.amber, fontWeight: 600 }}>{e.customs}</span></TD>
                                <TD>
                                    {e.status !== 'Exported' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleAction && handleAction(e.id, 'Exported')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Clear for Export</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: ds.textSec }}>Shipped</span>
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

// ─── Live SVG Map of Sri Lanka displaying Driver telemetry coordinates ───────
function LiveSriLankaMap({ shipments, selectedShipment, setSelectedShipment, gpsAccess }) {
    // Map dimensions
    const width = 280;
    const height = 480;

    // Approximate lat/lng to XY projections for Sri Lanka
    // Latitude range: 5.9° N to 9.9° N (bottom to top)
    // Longitude range: 79.5° E to 81.9° E (left to right)
    const project = (lat, lng) => {
        const x = ((lng - 79.5) / (81.9 - 79.5)) * width;
        const y = height - ((lat - 5.9) / (9.9 - 5.9)) * height;
        return { x, y };
    };

    return (
        <div style={{ position: 'relative', background: '#eff6ff', borderRadius: 16, padding: '16px', border: `1px solid ${ds.blueBd}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: ds.blue }}>Island-wide Telemetry Map</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: gpsAccess ? ds.green : ds.red, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 10, color: ds.textSec }}>{gpsAccess ? 'Browser GPS Enabled' : 'GPS Simulation'}</span>
                </div>
            </div>

            {/* Sri Lanka SVG Map representation */}
            <div style={{ position: 'relative', width, height, background: '#e0f2fe', borderRadius: 12, overflow: 'hidden', border: `1px solid ${ds.border}` }}>
                <svg width={width} height={height} style={{ display: 'block' }}>
                    {/* Simplified SVG Outline of Sri Lanka coastline */}
                    <path 
                        d="M 120,20 C 130,25 150,50 160,80 C 170,110 185,150 190,180 C 195,210 210,240 220,280 C 225,320 220,360 200,400 C 180,440 160,460 140,465 C 120,470 100,465 95,455 C 80,440 75,410 70,390 C 65,370 60,330 65,290 C 70,250 80,210 85,180 C 90,150 95,110 100,80 C 105,50 115,25 120,20 Z" 
                        fill="#fef08a" 
                        stroke="#ca8a04" 
                        strokeWidth="1.5"
                    />

                    {/* Major cities indicators */}
                    {[
                        { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
                        { name: 'Anuradhapura', lat: 8.3122, lng: 80.4037 },
                        { name: 'Trincomalee', lat: 8.5775, lng: 81.2335 },
                        { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
                        { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
                        { name: 'Galle', lat: 6.0535, lng: 80.2210 }
                    ].map(city => {
                        const pt = project(city.lat, city.lng);
                        return (
                            <g key={city.name}>
                                <circle cx={pt.x} cy={pt.y} r="3" fill="#ca8a04" opacity="0.6" />
                                <text x={pt.x + 5} y={pt.y + 3} fontSize="8" fontFamily={ds.fontB} fill={ds.textSec} opacity="0.7">{city.name}</text>
                            </g>
                        );
                    })}

                    {/* Active Shipment Routes & Driver dots */}
                    {shipments.map(s => {
                        if (!s.gps) return null;
                        const pickupPt = project(s.gps.pickupLat, s.gps.pickupLng);
                        const dropPt = project(s.gps.dropLat, s.gps.dropLng);
                        const driverPt = project(s.gps.driverLat, s.gps.driverLng);
                        const isSelected = selectedShipment?.id === s.id;

                        return (
                            <g key={s.id} onClick={() => setSelectedShipment(s)} style={{ cursor: 'pointer' }}>
                                {/* Route Line */}
                                <line 
                                    x1={pickupPt.x} y1={pickupPt.y} 
                                    x2={dropPt.x} y2={dropPt.y} 
                                    stroke={isSelected ? ds.blue : ds.textTer} 
                                    strokeWidth={isSelected ? '2' : '1'} 
                                    strokeDasharray="4"
                                />

                                {/* Pickup Marker */}
                                <circle cx={pickupPt.x} cy={pickupPt.y} r="4.5" fill={ds.amber} stroke="#fff" strokeWidth="1" />
                                
                                {/* Drop Marker */}
                                <circle cx={dropPt.x} cy={dropPt.y} r="4.5" fill={ds.green} stroke="#fff" strokeWidth="1" />

                                {/* Driver Dot */}
                                <circle cx={driverPt.x} cy={driverPt.y} r="6" fill={ds.blue} stroke="#fff" strokeWidth="1.5">
                                    <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
                                </circle>

                                {/* Hover tooltip details label */}
                                {isSelected && (
                                    <g>
                                        <rect x={driverPt.x - 35} y={driverPt.y - 24} width="70" height="15" rx="3" fill="#1e293b" opacity="0.9" />
                                        <text x={driverPt.x} y={driverPt.y - 14} fontSize="8.5" fill="#fff" textAnchor="middle" fontWeight="bold">{s.id}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
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

function ShipmentTracking({ shipments, vehicles, handleGpsAccess, gpsAccess, handleUpdateProgress }) {
    const [selectedShipment, setSelectedShipment] = useState(shipments[0] || null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${ds.border}`, padding: 20, boxShadow: ds.shadow, display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
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
                        <div key={s.id} onClick={() => setSelectedShipment(s)} style={{ background: ds.surface, borderRadius: 18, border: `1px solid ${selectedShipment?.id === s.id ? ds.blue : ds.border}`, padding: 20, boxShadow: ds.shadow, cursor: 'pointer' }}>
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

                            {/* Increment/Decrement control to test GPS movement */}
                            {s.status === 'In Transit' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateProgress(s.id, Math.min(100, s.progress + 10)); }} style={{ padding: '4px 8px', background: ds.blueLt, color: ds.blue, border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>Simulate Movement (+10%)</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateProgress(s.id, 100); }} style={{ padding: '4px 8px', background: ds.greenLt, color: ds.green, border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>Complete Delivery</button>
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
                />
            </div>
        </div>
    );
}

function VehiclesDrivers({ vehicles, handleAddVehicle }) {
    const [plate, setPlate] = useState('');
    const [type, setType] = useState('10-Ton Lorry');
    const [capacity, setCapacity] = useState('');
    const [driver, setDriver] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if (!plate || !capacity || !driver) return;
        handleAddVehicle({
            id: 'VH-' + Math.floor(Math.random()*100),
            emoji: '🚚',
            type,
            plate,
            status: 'Available',
            driver,
            capacity,
            lastService: new Date().toISOString().split('T')[0]
        });
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Security Settings</h4>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: ds.textSec, marginBottom: 4 }}>Update Password</label>
                            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: 8, border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <button onClick={() => alert('Password updated.')} style={{ padding: '8px 12px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12, alignSelf: 'flex-start' }}>
                            Update Password
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

    const [deliveries, setDeliveries] = useState([]);
    const [exports, setExports] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [gpsAccess, setGpsAccess] = useState(false);

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

        // 2. Exports Listener
        const unsubExports = onSnapshot(collection(db, 'exports'), (snapshot) => {
            if (snapshot.empty) {
                const batch = writeBatch(db);
                SEED_EXPORTS.forEach(e => {
                    const docRef = doc(collection(db, 'exports'), e.id);
                    batch.set(docRef, e);
                });
                batch.commit();
            } else {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setExports(list);
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
                batch.commit();
            } else {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setVehicles(list);
            }
        });

        return () => {
            unsubDeliveries();
            unsubExports();
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
                await addDoc(collection(db, 'shipments'), newShip);
            }
        }
    };

    const handleAddVehicle = async (newVeh) => {
        await addDoc(collection(db, 'vehicles'), newVeh);
    };

    const handleQuickAction = (action) => {
        if (action === 'add-vehicle') {
            setSection('vehicles');
        } else if (action === 'assign-driver') {
            setSection('vehicles');
            alert('Select vehicle in the directory to assign or change active drivers.');
        } else if (action === 'update-shipment') {
            setSection('tracking');
        } else if (action === 'create-export') {
            setSection('export');
            alert('Click accept on export orders or add a custom export row.');
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
                return <DashboardHome setSection={setSection} onQuickAction={handleQuickAction} deliveries={deliveries} exports={exports} shipments={shipments} />;
            case 'delivery':
                return <DeliveryRequests deliveries={activeDeliveries} handleAction={handleAction} />;
            case 'export':
                return <ExportRequests exports={exports} handleAction={handleAction} />;
            case 'tracking':
                return <ShipmentTracking shipments={shipments} vehicles={vehicles} handleGpsAccess={handleGpsAccess} gpsAccess={gpsAccess} handleUpdateProgress={handleUpdateProgress} />;
            case 'vehicles':
                return <VehiclesDrivers vehicles={vehicles} handleAddVehicle={handleAddVehicle} />;
            case 'history':
                return <DeliveryHistory completedDeliveries={completedDeliveries} />;
            case 'analytics':
                return <LogisticsAnalytics />;
            case 'messages':
                return <LogisticsMessages />;
            case 'settings':
                return <LogisticsSettings />;
            default:
                return <DashboardHome setSection={setSection} onQuickAction={handleQuickAction} deliveries={deliveries} exports={exports} shipments={shipments} />;
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