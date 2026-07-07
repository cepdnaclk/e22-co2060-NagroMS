import { useState, useMemo } from 'react';
import {
    LayoutDashboard, Archive, Thermometer, Calendar,
    BarChart2, MessageSquare, Settings, LogOut,
    ChevronLeft, ChevronRight, Bell, Search, Plus,
    Eye, Check, X, Download, TrendingUp, Clock,
    CheckCircle, ArrowUpRight, AlertTriangle, Droplets,
    Package, ShieldCheck, MapPin, info, Info,
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const ds = {
    sidebar: 'linear-gradient(170deg,#064e3b 0%,#0f766e 50%,#042f2e 100%)',
    green: '#16a34a', greenDk: '#15803d', greenLt: '#f0fdf4', greenBd: '#dcfce7',
    bg: '#f3f4f6', surface: '#ffffff',
    border: '#e5e7eb', borderLt: '#f3f4f6',
    text: '#111827', textSec: '#4b5563', textTer: '#9ca3af',
    shadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    fontD: "'Plus Jakarta Sans',sans-serif",
    fontB: "'Inter',sans-serif",
    fontM: "'JetBrains Mono',monospace",
    amber: '#d97706', amberLt: '#fef3c7', amberBd: '#fde68a',
    red: '#dc2626', redLt: '#fef2f2', redBd: '#fecaca',
    blue: '#2563eb', blueLt: '#eff6ff', blueBd: '#bfdbfe',
};

const UNITS = [
    { id: 'U-A1', zone: 'A', type: 'Dry Storage', size: 'L', status: 'Occupied', capacity: '500 bags', contents: 'Paddy Rice (120 bags)', customer: 'Sunil Perera', daysLeft: 12 },
    { id: 'U-A2', zone: 'A', type: 'Dry Storage', size: 'L', status: 'Occupied', capacity: '500 bags', contents: 'Maize (240 bags)', customer: 'Kamala Silva', daysLeft: 5 },
    { id: 'U-A3', zone: 'A', type: 'Dry Storage', size: 'L', status: 'Available', capacity: '500 bags' },
    { id: 'U-A4', zone: 'A', type: 'Dry Storage', size: 'L', status: 'Reserved', capacity: '500 bags', customer: 'Nimal Fernando' },
    { id: 'U-B1', zone: 'B', type: 'Cold Room 1', size: 'M', status: 'Occupied', capacity: '200 crates', contents: 'Tomatoes (45 crates)', customer: 'Priya Kumar', daysLeft: 3 },
    { id: 'U-B2', zone: 'B', type: 'Cold Room 1', size: 'M', status: 'Occupied', capacity: '200 crates', contents: 'Carrots (80 crates)', customer: 'Amara Jayaweera', daysLeft: 8 },
    { id: 'U-B3', zone: 'B', type: 'Cold Room 1', size: 'M', status: 'Available', capacity: '200 crates' },
    { id: 'U-B4', zone: 'B', type: 'Cold Room 1', size: 'M', status: 'Maintenance', capacity: '200 crates' },
    { id: 'U-C1', zone: 'C', type: 'Cold Room 2', size: 'M', status: 'Occupied', capacity: '200 crates', contents: 'Leeks (60 crates)', customer: 'Rajan Muthu', daysLeft: 6 },
    { id: 'U-C2', zone: 'C', type: 'Cold Room 2', size: 'M', status: 'Available', capacity: '200 crates' },
    { id: 'U-D1', zone: 'D', type: 'Deep Freezer', size: 'S', status: 'Occupied', capacity: '50 crates', contents: 'Seafood (20 crates)', customer: 'Sea Foods Ltd', daysLeft: 22 },
    { id: 'U-D2', zone: 'D', type: 'Deep Freezer', size: 'S', status: 'Available', capacity: '50 crates' },
];

const ZONE_READINGS = [
    { zone: 'A', name: 'Dry Warehouse', emoji: '🏠', currentTemp: 27, targetMin: 25, targetMax: 30, humidity: 55, targetHumMin: 50, targetHumMax: 60 },
    { zone: 'B', name: 'Cold Room 1', emoji: '🧊', currentTemp: 9.2, targetMin: 5, targetMax: 8, humidity: 87, targetHumMin: 85, targetHumMax: 90 }, // Trigger warning
    { zone: 'C', name: 'Cold Room 2', emoji: '❄️', currentTemp: 10.1, targetMin: 8, targetMax: 12, humidity: 82, targetHumMin: 80, targetHumMax: 85 },
    { zone: 'D', name: 'Freezer', emoji: '🥶', currentTemp: -16.8, targetMin: -18, targetMax: -15, humidity: 72, targetHumMin: 70, targetHumMax: 75 },
];

const REQUESTS = [
    { id: 'SR-1024', farmer: 'Ranjith Bandara', space: '100 bags', type: 'Dry Storage', crop: 'Paddy Rice', duration: '3 Months', price: 15000, date: '2026-07-06', status: 'Pending' },
    { id: 'SR-1025', farmer: 'Preethi Herath', space: '30 crates', type: 'Cold Storage', crop: 'Tomatoes', duration: '1 Month', price: 8000, date: '2026-07-07', status: 'Pending' },
    { id: 'SR-1022', farmer: 'Lasith Mendis', space: '25 crates', type: 'Deep Freezer', crop: 'Strawberries', duration: '2 Months', price: 12000, date: '2026-07-05', status: 'Accepted' },
    { id: 'SR-1021', farmer: 'Chamari Sena', space: '150 bags', type: 'Dry Storage', crop: 'Maize', duration: '6 Months', price: 30000, date: '2026-07-04', status: 'Rejected' },
];

const OCCUPANCY_DATA = [
    { month: 'Jan', occupied: 65, revenue: 85 },
    { month: 'Feb', occupied: 70, revenue: 98 },
    { month: 'Mar', occupied: 82, revenue: 125 },
    { month: 'Apr', occupied: 78, revenue: 110 },
    { month: 'May', occupied: 85, revenue: 135 },
    { month: 'Jun', occupied: 92, revenue: 154 },
    { month: 'Jul', occupied: 88, revenue: 148 },
];

const unitStatusCfg = {
    Occupied: { bg: ds.blueLt, color: '#1e40af', dot: ds.blue },
    Available: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Reserved: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Maintenance: { bg: ds.redLt, color: '#991b1b', dot: ds.red },
};

const reqStatusCfg = {
    Pending: { bg: ds.amberLt, color: '#92400e', dot: ds.amber },
    Accepted: { bg: ds.greenLt, color: '#166534', dot: ds.green },
    Rejected: { bg: ds.redLt, color: '#991b1b', dot: ds.red },
};

const Badge = ({ label, cfg }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: ds.fontB, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
        {cfg.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}{label}
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
        { id: 'units', label: 'Storage Units', icon: Archive },
        { id: 'requests', label: 'Booking Requests', icon: Clock },
        { id: 'temperature', label: 'Temperature Monitors', icon: Thermometer },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (
        <aside style={{ width: collapsed ? 66 : 240, flexShrink: 0, background: ds.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏭</div>
                {!collapsed && <div><p style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>NagroMS</p><p style={{ fontFamily: ds.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Storage Portal</p></div>}
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
    const labels = { dashboard: 'Dashboard Overview', units: 'Storage Units', requests: 'Booking Requests', temperature: 'Temperature Monitors', settings: 'Settings' };
    const businessName = localStorage.getItem('businessName') || 'Agri Storage Facility';
    return (
        <header style={{ height: 60, background: ds.surface, borderBottom: `1px solid ${ds.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: ds.fontD, fontSize: 16, fontWeight: 700, color: ds.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: ds.fontB, fontSize: 11, color: ds.textTer, margin: 0 }}>Storage Facilities Management · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: `1px solid ${ds.border}`, borderRadius: 8, padding: '4px 10px' }}>
                    <span style={{ fontSize: 14 }}>🏠</span>
                    <span style={{ fontFamily: ds.fontB, fontSize: 12, fontWeight: 600, color: ds.text }}>{businessName}</span>
                </div>
            </div>
        </header>
    );
}

function DashboardHome({ setSection }) {
    const occupied = UNITS.filter(u => u.status === 'Occupied').length;
    const available = UNITS.filter(u => u.status === 'Available').length;
    const reserved = UNITS.filter(u => u.status === 'Reserved').length;
    const tempAlerts = ZONE_READINGS.filter(z => z.currentTemp < z.targetMin || z.currentTemp > z.targetMax);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tempAlerts.length > 0 && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#92400e', fontSize: '13px' }}>Temperature Alert</strong>
                        <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>
                            {tempAlerts.map(z => `Zone ${z.zone} (${z.name}): ${z.currentTemp}°C`).join(' · ')} — currently outside optimal ranges.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <KpiCard label="Total Storage Units" value={String(UNITS.length)} sub="Across 4 Zones" icon={<Archive style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Occupied Units" value={String(occupied)} sub="Active storage rentals" icon={<Package style={{ width: 18, height: 18 }} />} iconBg={ds.blueLt} iconColor={ds.blue} />
                <KpiCard label="Available Space" value={String(available)} sub="Ready for new bookings" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
                <KpiCard label="Total Revenue" value="Rs 148K" sub="Current Month (Jul)" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={ds.greenLt} iconColor={ds.green} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Facility Occupancy & Revenue</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={OCCUPANCY_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="occupied" stroke={ds.green} name="Occupancy %" strokeWidth={2} />
                            <Line type="monotone" dataKey="revenue" stroke={ds.blue} name="Revenue (Rs K)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px', boxShadow: ds.shadow }}>
                    <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: '0 0 16px 0' }}>Live Temperatures</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {ZONE_READINGS.map(z => {
                            const isOk = z.currentTemp >= z.targetMin && z.currentTemp <= z.targetMax;
                            return (
                                <div key={z.zone} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '10px 12px', background: isOk ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isOk ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 18 }}>{z.emoji}</span>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>Zone {z.zone}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: ds.textSec }}>{z.name}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: isOk ? ds.green : ds.red }}>{z.currentTemp}°C</span>
                                        <p style={{ margin: 0, fontSize: 9, color: ds.textTer }}>Hum: {z.humidity}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StorageUnits() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Storage Unit Directory</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Unit ID</TH>
                            <TH>Zone</TH>
                            <TH>Type</TH>
                            <TH>Size</TH>
                            <TH>Capacity</TH>
                            <TH>Current Contents</TH>
                            <TH>Customer</TH>
                            <TH>Days Left</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {UNITS.map(u => (
                            <tr key={u.id}>
                                <TD mono>{u.id}</TD>
                                <TD>Zone {u.zone}</TD>
                                <TD>{u.type}</TD>
                                <TD mono>{u.size}</TD>
                                <TD mono>{u.capacity}</TD>
                                <TD>{u.contents || '—'}</TD>
                                <TD>{u.customer || '—'}</TD>
                                <TD mono>{u.daysLeft != null ? `${u.daysLeft} days` : '—'}</TD>
                                <TD><Badge label={u.status} cfg={unitStatusCfg[u.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BookingRequests() {
    const [requests, setRequests] = useState(REQUESTS);
    const handleStatus = (id, newStatus) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, overflow: 'hidden', boxShadow: ds.shadow }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ds.border}` }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, margin: 0 }}>Farmer Booking Requests</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Request ID</TH>
                            <TH>Farmer Name</TH>
                            <TH>Crop Type</TH>
                            <TH>Required Space</TH>
                            <TH>Storage Type</TH>
                            <TH>Duration</TH>
                            <TH>Estimated Fee</TH>
                            <TH>Date Submitted</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r.id}>
                                <TD mono>{r.id}</TD>
                                <TD>{r.farmer}</TD>
                                <TD>{r.crop}</TD>
                                <TD mono>{r.space}</TD>
                                <TD>{r.type}</TD>
                                <TD>{r.duration}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {r.price.toLocaleString()}</TD>
                                <TD mono>{r.date}</TD>
                                <TD><Badge label={r.status} cfg={reqStatusCfg[r.status]} /></TD>
                                <TD>
                                    {r.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleStatus(r.id, 'Accepted')} style={{ padding: '4px 8px', background: ds.green, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Accept</button>
                                            <button onClick={() => handleStatus(r.id, 'Rejected')} style={{ padding: '4px 8px', background: ds.red, border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
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

function TemperatureMonitor() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 20 }}>
                <h3 style={{ fontFamily: ds.fontD, fontSize: 14, fontWeight: 700, color: ds.text, marginBottom: 12 }}>Zone Condition Logs</h3>
                <p style={{ fontSize: 12, color: ds.textSec }}>Telemetry monitors report temperature and relative humidity statistics every 5 seconds.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {ZONE_READINGS.map(z => {
                    const isOk = z.currentTemp >= z.targetMin && z.currentTemp <= z.targetMax;
                    return (
                        <div key={z.zone} style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${isOk ? ds.border : ds.amber}`, padding: 20, boxShadow: ds.shadow }}>
                            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: 24 }}>{z.emoji}</span>
                                <Badge label={isOk ? 'Optimal' : 'Out of Bounds'} cfg={isOk ? unitStatusCfg.Available : unitStatusCfg.Reserved} />
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Zone {z.zone} — {z.name}</h4>
                            <p style={{ margin: '0 0 10px', fontSize: 11, color: ds.textTer }}>Target Temp: {z.targetMin}°C to {z.targetMax}°C</p>
                            <div style={{ borderTop: `1px solid ${ds.borderLt}`, paddingTop: 10, display: 'flex', justify: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: 11, color: ds.textSec }}>Temperature</span>
                                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isOk ? ds.green : ds.red }}>{z.currentTemp}°C</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 11, color: ds.textSec }}>Humidity</span>
                                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{z.humidity}%</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StorageSettings() {
    return (
        <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: 24, maxWidth: 600, boxShadow: ds.shadow }}>
            <h3 style={{ fontFamily: ds.fontD, fontSize: 15, fontWeight: 750, color: ds.text, marginBottom: 16 }}>Facility Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Facility Name</label>
                    <input type="text" defaultValue={localStorage.getItem('businessName') || 'Agri Storage Partner Ltd'} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: ds.textSec, marginBottom: 6 }}>Operating Location</label>
                    <input type="text" defaultValue="Anuradhapura District" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${ds.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <button style={{ padding: '8px 16px', background: ds.green, border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save Configurations</button>
                </div>
            </div>
        </div>
    );
}

export default function StorageFacilitiesDashboard({ onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const renderSection = () => {
        switch (section) {
            case 'dashboard': return <DashboardHome setSection={setSection} />;
            case 'units': return <StorageUnits />;
            case 'requests': return <BookingRequests />;
            case 'temperature': return <TemperatureMonitor />;
            case 'settings': return <StorageSettings />;
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