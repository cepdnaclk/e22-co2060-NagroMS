import { useState, useMemo } from 'react';
import {
    LayoutDashboard, Boxes, FileText, Tag, Wrench, History,
    BarChart2, MessageSquare, Star, Settings, LogOut,
    ChevronLeft, ChevronRight, Bell, Search, Plus,
    Edit2, Trash2, Eye, Check, X, AlertTriangle,
    TrendingUp, Download, Filter, RefreshCw, MapPin,
    Calendar, Clock, ArrowUpRight, CheckCircle,
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Design System ─────────────────────────────────────────────────────────────
const c = {
    sidebar: 'linear-gradient(170deg, #0a2e1a 0%, #134d2e 50%, #0e3d24 100%)',
    green: '#16a34a',
    greenDk: '#15803d',
    greenLt: '#f0fdf4',
    greenBd: '#dcfce7',
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    borderLt: '#f1f5f9',
    text: '#0f172a',
    textSec: '#475569',
    textTer: '#94a3b8',
    shadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.08)',
    fontD: "'Plus Jakarta Sans', sans-serif",
    fontB: "'Inter', sans-serif",
    fontM: "'JetBrains Mono', monospace",
    radius: '14px',
    amber: '#f59e0b', amberLt: '#fffbeb', amberBd: '#fde68a',
    red: '#ef4444', redLt: '#fef2f2', redBd: '#fecaca',
    blue: '#3b82f6', blueLt: '#eff6ff', blueBd: '#bfdbfe',
    purple: '#8b5cf6', purpleLt: '#f5f3ff',
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const EQUIPMENT = [
    { id: 'EQ-001', emoji: '🚜', name: 'Mahindra 575 DI Tractor', category: 'Tractors', dailyRate: 5500, weeklyRate: 32000, monthlyRate: 115000, condition: 'Excellent', status: 'Available', location: 'Anuradhapura', lastMaintenance: '2026-06-15', totalRentals: 48, utilization: 78 },
    { id: 'EQ-002', emoji: '🌾', name: 'Kubota DC-70 Harvester', category: 'Harvesters', dailyRate: 8500, weeklyRate: 55000, monthlyRate: 195000, condition: 'Good', status: 'Rented', location: 'Polonnaruwa', lastMaintenance: '2026-05-20', totalRentals: 31, utilization: 65 },
    { id: 'EQ-003', emoji: '💧', name: 'Honda WB30 Water Pump', category: 'Irrigation', dailyRate: 1800, weeklyRate: 10500, monthlyRate: 38000, condition: 'Good', status: 'Available', location: 'Kurunegala', lastMaintenance: '2026-06-28', totalRentals: 92, utilization: 89 },
    { id: 'EQ-004', emoji: '🌿', name: 'Yamaha KF150 Sprayer', category: 'Crop Care', dailyRate: 950, weeklyRate: 5800, monthlyRate: 21000, condition: 'Excellent', status: 'Available', location: 'Kandy', lastMaintenance: '2026-07-01', totalRentals: 67, utilization: 71 },
    { id: 'EQ-005', emoji: '🏗️', name: 'John Deere 5075E Tractor', category: 'Tractors', dailyRate: 7200, weeklyRate: 45000, monthlyRate: 158000, condition: 'Good', status: 'Reserved', location: 'Anuradhapura', lastMaintenance: '2026-06-01', totalRentals: 22, utilization: 54 },
    { id: 'EQ-006', emoji: '🔧', name: 'Kubota L3800 Cultivator', category: 'Tillage', dailyRate: 3800, weeklyRate: 24000, monthlyRate: 86000, condition: 'Needs Service', status: 'Maintenance', location: 'Badulla', lastMaintenance: '2026-04-10', totalRentals: 39, utilization: 42 },
    { id: 'EQ-007', emoji: '🚿', name: 'Rain Bird Drip System', category: 'Irrigation', dailyRate: 2200, weeklyRate: 13500, monthlyRate: 48000, condition: 'Excellent', status: 'Available', location: 'Jaffna', lastMaintenance: '2026-06-30', totalRentals: 55, utilization: 81 },
    { id: 'EQ-008', emoji: '🌾', name: 'Iseki TH5370 Combine', category: 'Harvesters', dailyRate: 11000, weeklyRate: 68000, monthlyRate: 240000, condition: 'Good', status: 'Rented', location: 'Batticaloa', lastMaintenance: '2026-05-15', totalRentals: 18, utilization: 60 },
];

const RENTAL_REQUESTS = [
    { id: 'RNT-2851', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', equipment: 'Mahindra 575 DI Tractor', durationDays: 7, pickupDate: '2026-07-08', returnDate: '2026-07-15', totalCost: 32000, contact: '077 123 4567', status: 'Pending', district: 'Anuradhapura' },
    { id: 'RNT-2850', farmer: 'Kamala Silva', farmerIcon: '👩‍🌾', equipment: 'Honda WB30 Water Pump', durationDays: 14, pickupDate: '2026-07-06', returnDate: '2026-07-20', totalCost: 21000, contact: '081 222 3344', status: 'Accepted', district: 'Kandy' },
    { id: 'RNT-2849', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', equipment: 'Kubota DC-70 Harvester', durationDays: 5, pickupDate: '2026-07-04', returnDate: '2026-07-09', totalCost: 42500, contact: '091 333 4455', status: 'In Progress', district: 'Galle' },
    { id: 'RNT-2848', farmer: 'Priya Kumar', farmerIcon: '👩‍🌾', equipment: 'Yamaha KF150 Sprayer', durationDays: 3, pickupDate: '2026-07-01', returnDate: '2026-07-04', totalCost: 2850, contact: '021 444 5566', status: 'Completed', district: 'Jaffna' },
    { id: 'RNT-2847', farmer: 'Rajan Muthu', farmerIcon: '👨‍🌾', equipment: 'John Deere 5075E Tractor', durationDays: 10, pickupDate: '2026-07-10', returnDate: '2026-07-20', totalCost: 72000, contact: '076 555 6677', status: 'Pending', district: 'Batticaloa' },
    { id: 'RNT-2846', farmer: 'Amara Jayaweera', farmerIcon: '👩‍🌾', equipment: 'Rain Bird Drip System', durationDays: 30, pickupDate: '2026-06-01', returnDate: '2026-07-01', totalCost: 48000, contact: '070 666 7788', status: 'Completed', district: 'Kurunegala' },
];

const MAINTENANCE = [
    { id: 'MNT-001', equipment: 'Kubota L3800 Cultivator', emoji: '🔧', type: 'Engine Overhaul', scheduledDate: '2026-07-10', status: 'Upcoming', cost: 35000, notes: 'Full engine service & oil change required' },
    { id: 'MNT-002', equipment: 'Kubota DC-70 Harvester', emoji: '🌾', type: 'Blade Sharpening', scheduledDate: '2026-07-08', status: 'Upcoming', cost: 8500, notes: 'Cutting blades worn, needs replacement' },
    { id: 'MNT-003', equipment: 'John Deere 5075E Tractor', emoji: '🏗️', type: 'Filter Replacement', scheduledDate: '2026-07-05', status: 'In Progress', cost: 4200, notes: 'Air & oil filters due for replacement' },
    { id: 'MNT-004', equipment: 'Mahindra 575 DI Tractor', emoji: '🚜', type: 'Annual Service', scheduledDate: '2026-06-15', status: 'Completed', cost: 22000, notes: 'Full annual service completed successfully' },
    { id: 'MNT-005', equipment: 'Honda WB30 Water Pump', emoji: '💧', type: 'Seal Replacement', scheduledDate: '2026-06-28', status: 'Completed', cost: 6500, notes: 'Shaft seals replaced, pressure tested' },
];

const REVENUE_DATA = [
    { month: 'Jan', revenue: 285, rentals: 18 },
    { month: 'Feb', revenue: 342, rentals: 22 },
    { month: 'Mar', revenue: 418, rentals: 28 },
    { month: 'Apr', revenue: 385, rentals: 25 },
    { month: 'May', revenue: 495, rentals: 34 },
    { month: 'Jun', revenue: 562, rentals: 38 },
    { month: 'Jul', revenue: 485, rentals: 31 },
];

const CATEGORY_DATA = [
    { name: 'Tractors', value: 38, color: c.green },
    { name: 'Harvesters', value: 27, color: c.blue },
    { name: 'Irrigation', value: 18, color: c.purple },
    { name: 'Crop Care', value: 11, color: c.amber },
    { name: 'Tillage', value: 6, color: '#ec4899' },
];

const ACTIVITIES = [
    { time: '12 min ago', icon: '📋', text: 'New rental request from Sunil Perera for Mahindra Tractor', type: 'request', color: c.green },
    { time: '1 hr ago', icon: '✅', text: 'Kubota DC-70 Harvester returned by Nimal Fernando', type: 'returned', color: c.blue },
    { time: '2 hr ago', icon: '🔧', text: 'Scheduled maintenance completed on Mahindra 575 DI', type: 'maintenance', color: c.amber },
    { time: '4 hr ago', icon: '➕', text: 'New equipment added: Rain Bird Drip Irrigation System', type: 'added', color: c.purple },
    { time: 'Yesterday', icon: '💬', text: 'New review received — 5 stars from Amara Jayaweera', type: 'review', color: '#ec4899' },
    { time: 'Yesterday', icon: '💰', text: 'Payment received Rs 42,500 for RNT-2849', type: 'payment', color: c.green },
];

// ─── Status Configs ────────────────────────────────────────────────────────────
const eqStatusCfg = {
    Available: { bg: c.greenLt, color: '#166534', dot: c.green },
    Rented: { bg: c.blueLt, color: '#1e40af', dot: c.blue },
    Maintenance: { bg: c.amberLt, color: '#92400e', dot: c.amber },
    Reserved: { bg: c.purpleLt, color: '#5b21b6', dot: c.purple },
};
const eqCondCfg = {
    Excellent: { bg: c.greenLt, color: '#166534' },
    Good: { bg: '#ecfeff', color: '#164e63' },
    Fair: { bg: c.amberLt, color: '#92400e' },
    'Needs Service': { bg: c.redLt, color: '#991b1b' },
};
const reqStatusCfg = {
    Pending: { bg: c.amberLt, color: '#92400e' },
    Accepted: { bg: c.blueLt, color: '#1e40af' },
    'In Progress': { bg: c.purpleLt, color: '#5b21b6' },
    Completed: { bg: c.greenLt, color: '#166534' },
    Rejected: { bg: c.redLt, color: '#991b1b' },
};
const maintStatusCfg = {
    Upcoming: { bg: c.blueLt, color: '#1e40af' },
    'In Progress': { bg: c.purpleLt, color: '#5b21b6' },
    Completed: { bg: c.greenLt, color: '#166534' },
    Overdue: { bg: c.redLt, color: '#991b1b' },
};

// ─── Reusable Primitives ───────────────────────────────────────────────────────
function StatusBadge({ label, cfg }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: c.fontB, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
            {cfg.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}
            {label}
        </span>
    );
}

function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend }) {
    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '22px', boxShadow: c.shadow, transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>{icon}</div>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: trend.startsWith('+') ? c.green : c.red, fontFamily: c.fontB }}>
                        <ArrowUpRight style={{ width: 12, height: 12 }} />{trend}
                    </div>
                )}
            </div>
            <p style={{ fontFamily: c.fontM, fontSize: 26, fontWeight: 700, color: c.text, margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontFamily: c.fontB, fontSize: 12, fontWeight: 600, color: c.textTer, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec, margin: 0 }}>{sub}</p>
        </div>
    );
}

function SectionHeader({ title, subtitle, action }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
                <h2 style={{ fontFamily: c.fontD, fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>{title}</h2>
                {subtitle && <p style={{ fontFamily: c.fontB, fontSize: 13, color: c.textSec, margin: '3px 0 0' }}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function ActionBtn({ label, icon, onClick, variant = 'primary', size = 'md' }) {
    const vs = { primary: { bg: c.green, color: '#fff', border: 'none' }, secondary: { bg: '#fff', color: c.text, border: `1px solid ${c.border}` }, danger: { bg: c.redLt, color: c.red, border: `1px solid ${c.redBd}` }, ghost: { bg: 'transparent', color: c.textSec, border: 'none' } }[variant];
    const sz = size === 'sm' ? { padding: '5px 11px', fontSize: 12 } : { padding: '8px 16px', fontSize: 13 };
    return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: c.fontB, fontWeight: 600, borderRadius: 8, cursor: 'pointer', ...vs, ...sz }}>{icon}{label}</button>;
}

const TH = ({ children }) => (
    <th style={{ padding: '11px 16px', fontFamily: c.fontB, fontSize: 11, fontWeight: 600, color: c.textTer, textAlign: 'left', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.bg, whiteSpace: 'nowrap' }}>{children}</th>
);
const TD = ({ children, mono }) => (
    <td style={{ padding: '13px 16px', fontFamily: mono ? c.fontM : c.fontB, fontSize: 13, color: c.text, borderBottom: `1px solid ${c.borderLt}`, verticalAlign: 'middle' }}>{children}</td>
);

// ─── Utility ───────────────────────────────────────────────────────────────────
function exportToCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvData = rows.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipment', label: 'Equipment', icon: Boxes },
    { id: 'requests', label: 'Rental Requests', icon: FileText },
    { id: 'categories', label: 'Equipment Categories', icon: Tag },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'history', label: 'Rental History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
];

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }) {
    return (
        <aside style={{ width: collapsed ? 66 : 244, flexShrink: 0, background: c.sidebar, display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
            {/* Logo */}
            <div style={{ padding: collapsed ? '20px 15px' : '20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 68, flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.12)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: 17 }}>🚜</span>
                </div>
                {!collapsed && (
                    <div>
                        <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>NagroMS</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Equipment Rental</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                        <button key={item.id} onClick={() => setActive(item.id)} title={collapsed ? item.label : undefined} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
                            borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2,
                            background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                            fontFamily: c.fontB, fontSize: 13, fontWeight: isActive ? 600 : 400,
                            transition: 'all 0.15s',
                            boxShadow: isActive ? 'inset 0 0 0 1px rgba(255,255,255,0.18)' : 'none',
                        }}>
                            <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                            {!collapsed && <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                <button onClick={() => onNavigate('landing')} title={collapsed ? 'Overview' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', fontFamily: c.fontB, fontSize: 12, fontWeight: 500 }}>
                    <LayoutDashboard style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {!collapsed && 'Main Dashboard'}
                </button>
                <button onClick={() => onNavigate('landing')} title={collapsed ? 'Logout' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: c.fontB, fontSize: 12 }}>
                    <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {!collapsed && 'Logout'}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: c.fontB, fontSize: 11 }}>
                    {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <><ChevronLeft style={{ width: 14, height: 14 }} /><span>Collapse</span></>}
                </button>
            </div>
        </aside>
    );
}

// ─── Top Nav ───────────────────────────────────────────────────────────────────
function TopNav({ section }) {
    const labels = { dashboard: 'Dashboard Overview', equipment: 'Equipment Management', requests: 'Rental Requests', categories: 'Equipment Categories', maintenance: 'Maintenance Schedule', history: 'Rental History', analytics: 'Analytics & Reports', messages: 'Messages', reviews: 'Customer Reviews', settings: 'Settings' };
    const name = localStorage.getItem('userName') || localStorage.getItem('businessName') || 'Provider';
    return (
        <header style={{ height: 60, background: c.surface, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: c.fontD, fontSize: 16, fontWeight: 700, color: c.text, margin: 0 }}>{labels[section]}</h1>
                <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: 0 }}>Equipment Rental Portal · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 9, padding: '6px 12px', width: 210 }}>
                    <Search style={{ width: 13, height: 13, color: c.textTer }} />
                    <span style={{ fontFamily: c.fontB, fontSize: 13, color: c.textTer }}>Search equipment…</span>
                </div>
                <button style={{ position: 'relative', width: 36, height: 36, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Bell style={{ width: 15, height: 15, color: c.textSec }} />
                    <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, background: c.red, borderRadius: '50%', border: `2px solid ${c.surface}` }} />
                </button>
                <button style={{ width: 36, height: 36, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MessageSquare style={{ width: 15, height: 15, color: c.textSec }} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: c.greenLt, border: `1px solid ${c.greenBd}`, borderRadius: 9, padding: '4px 11px 4px 4px', cursor: 'pointer' }}>
                    <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${c.green},#22c55e)`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🚜</div>
                    <div>
                        <p style={{ fontFamily: c.fontB, fontSize: 12, fontWeight: 600, color: c.text, margin: 0 }}>{name.split(' ')[0]}</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 10, color: c.textTer, margin: 0 }}>Equipment Provider</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome({ setSection }) {
    const totalEq = EQUIPMENT.length;
    const available = EQUIPMENT.filter(e => e.status === 'Available').length;
    const rented = EQUIPMENT.filter(e => e.status === 'Rented').length;
    const pending = RENTAL_REQUESTS.filter(r => r.status === 'Pending').length;
    const monthRev = REVENUE_DATA[REVENUE_DATA.length - 1].revenue;
    const avgUtil = Math.round(EQUIPMENT.reduce((s, e) => s + e.utilization, 0) / totalEq);

    return (
        <div>
            {/* Welcome banner */}
            <div style={{ background: 'linear-gradient(135deg,#0a2e1a 0%,#15803d 50%,#16a34a 100%)', borderRadius: 20, padding: '26px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', bottom: -50, right: 160, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, padding: '3px 10px', marginBottom: 10 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                            <span style={{ fontFamily: c.fontB, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Active · Equipment Rental Provider</span>
                        </div>
                        <h2 style={{ fontFamily: c.fontD, fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Good morning! 🚜</h2>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>You have {pending} pending rental requests and {rented} active rentals today.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            { label: 'Active Rentals', value: String(rented) },
                            { label: 'Monthly Rev', value: `Rs ${monthRev}K` },
                            { label: 'Utilization', value: `${avgUtil}%` },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '12px 18px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: 90 }}>
                                <p style={{ fontFamily: c.fontD, fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{s.value}</p>
                                <p style={{ fontFamily: c.fontB, fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 14, marginBottom: 24 }}>
                <KpiCard label="Total Equipment" value={String(totalEq)} sub="Across all categories" icon={<Boxes style={{ width: 18, height: 18 }} />} iconBg={c.greenLt} iconColor={c.green} trend="+2 this month" />
                <KpiCard label="Available" value={String(available)} sub="Ready for rental" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg="#ecfeff" iconColor={c.blue} trend={`${Math.round(available / totalEq * 100)}% of fleet`} />
                <KpiCard label="Currently Rented" value={String(rented)} sub="Active rentals" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={c.purpleLt} iconColor={c.purple} />
                <KpiCard label="Pending Requests" value={String(pending)} sub="Awaiting response" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={c.amberLt} iconColor={c.amber} />
                <KpiCard label="Monthly Revenue" value={`Rs ${monthRev}K`} sub="Jul 2026" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={c.greenLt} iconColor={c.green} trend="+14% vs Jun" />
                <KpiCard label="Utilization Rate" value={`${avgUtil}%`} sub="Fleet average" icon={<BarChart2 style={{ width: 18, height: 18 }} />} iconBg="#fdf4ff" iconColor="#9333ea" trend="+5% this month" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 16, marginBottom: 24 }}>
                {/* Revenue line chart */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                        <div>
                            <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Monthly Revenue</p>
                            <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '2px 0 0' }}>Rs in thousands · 2026</p>
                        </div>
                        <span style={{ fontFamily: c.fontM, fontSize: 13, fontWeight: 700, color: c.green }}>+14%</span>
                    </div>
                    <ResponsiveContainer key="dash-revenue-line" width="100%" height={175}>
                        <LineChart data={REVENUE_DATA} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} />
                            <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}`, boxShadow: c.shadowMd }} formatter={(v) => [`Rs ${v}K`, 'Revenue']} />
                            <Line key="dash-rev-line" type="monotone" dataKey="revenue" name="dash-revenue" stroke={c.green} strokeWidth={2.5} dot={{ r: 4, fill: c.green, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Rentals bar chart */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Monthly Rentals</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '2px 0 0' }}>Number of rental transactions</p>
                    </div>
                    <ResponsiveContainer key="dash-rentals-bar" width="100%" height={175}>
                        <BarChart data={REVENUE_DATA} margin={{ top: 2, right: 4, left: -20, bottom: 0 }} barCategoryGap="40%">
                            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v) => [v, 'Rentals']} />
                            <Bar key="dash-rentals-bar-series" dataKey="rentals" name="dash-rentals" fill={c.green} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category pie */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 4px' }}>Category Split</p>
                    <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '0 0 10px' }}>By rental frequency</p>
                    <ResponsiveContainer key="dash-category-pie" width="100%" height={130}>
                        <PieChart>
                            <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={3} dataKey="value">
                                {CATEGORY_DATA.map((d) => <Cell key={`dash-cat-${d.name}`} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v) => [`${v}%`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                        {CATEGORY_DATA.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                                    <span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{d.name}</span>
                                </div>
                                <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 600, color: c.text }}>{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Row: Recent Requests & Activities */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                {/* Pending / Recent Requests */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <SectionHeader
                        title="Recent Rental Requests"
                        subtitle="Awaiting authorization or immediate action"
                        action={<ActionBtn label="View All" variant="secondary" size="sm" onClick={() => setSection('requests')} />}
                    />
                    <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <TH>ID</TH>
                                    <TH>Farmer</TH>
                                    <TH>Equipment</TH>
                                    <TH>Duration</TH>
                                    <TH>Total Cost</TH>
                                    <TH>Status</TH>
                                </tr>
                            </thead>
                            <tbody>
                                {RENTAL_REQUESTS.slice(0, 4).map((req) => (
                                    <tr key={req.id}>
                                        <TD mono>{req.id}</TD>
                                        <TD>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 16 }}>{req.farmerIcon}</span>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600 }}>{req.farmer}</p>
                                                    <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>{req.district}</p>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD>{req.equipment}</TD>
                                        <TD>{req.durationDays} days</TD>
                                        <TD mono style={{ fontWeight: 600 }}>Rs {req.totalCost.toLocaleString()}</TD>
                                        <TD><StatusBadge label={req.status} cfg={reqStatusCfg[req.status]} /></TD>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <SectionHeader title="Live Activity" subtitle="Updates from the network" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 310, overflowY: 'auto', paddingRight: 4 }}>
                        {ACTIVITIES.map((act, index) => (
                            <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: `1px solid ${c.borderLt}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                    {act.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.text, margin: 0, lineHeight: 1.4 }}>{act.text}</p>
                                    <span style={{ fontFamily: c.fontB, fontSize: 10, color: c.textTer, display: 'block', marginTop: 1 }}>{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Equipment Tab ─────────────────────────────────────────────────────────────
function EquipmentManagement() {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return EQUIPMENT.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
            <SectionHeader
                title="Fleet Management"
                subtitle="Manage and track your agricultural assets, availability, and structural condition records"
                action={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <ActionBtn label="Export Data" icon={<Download style={{ width: 14, height: 14 }} />} variant="secondary" onClick={() => exportToCSV('NagroMS_Fleet.csv', EQUIPMENT)} />
                        <ActionBtn label="Add Asset" icon={<Plus style={{ width: 14, height: 14 }} />} variant="primary" />
                    </div>
                }
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '8px 14px', flex: 1 }}>
                    <Search style={{ width: 15, height: 15, color: c.textTer }} />
                    <input
                        type="text"
                        placeholder="Search assets by name, ID or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: c.fontB, fontSize: 13, color: c.text }}
                    />
                </div>
                <ActionBtn label="Filter" icon={<Filter style={{ width: 14, height: 14 }} />} variant="secondary" />
            </div>

            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Asset ID</TH>
                            <TH>Equipment Name</TH>
                            <TH>Category</TH>
                            <TH>Rates (Daily/Mo)</TH>
                            <TH>Condition</TH>
                            <TH>Utilization</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(eq => (
                            <tr key={eq.id}>
                                <TD mono>{eq.id}</TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 20 }}>{eq.emoji}</span>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{eq.name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: c.textTer }}><MapPin style={{ width: 10, height: 10, display: 'inline', marginRight: 2 }} />{eq.location}</p>
                                        </div>
                                    </div>
                                </TD>
                                <TD>{eq.category}</TD>
                                <TD>
                                    <div>
                                        <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 600 }}>Rs {eq.dailyRate}/d</span>
                                        <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>Rs {eq.monthlyRate.toLocaleString()}/mo</p>
                                    </div>
                                </TD>
                                <TD><StatusBadge label={eq.condition} cfg={eqCondCfg[eq.condition]} /></TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 80 }}>
                                        <div style={{ flex: 1, height: 5, background: c.borderLt, borderRadius: 9, overflow: 'hidden' }}>
                                            <div style={{ width: `${eq.utilization}%`, height: '100%', background: eq.utilization > 75 ? c.green : eq.utilization > 50 ? c.blue : c.amber }} />
                                        </div>
                                        <span style={{ fontFamily: c.fontM, fontSize: 11, fontWeight: 600 }}>{eq.utilization}%</span>
                                    </div>
                                </TD>
                                <TD><StatusBadge label={eq.status} cfg={eqStatusCfg[eq.status]} /></TD>
                                <TD>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button title="Edit Asset" style={{ padding: 6, border: 'none', background: 'transparent', color: c.textSec, cursor: 'pointer' }}><Edit2 style={{ width: 14, height: 14 }} /></button>
                                        <button title="Delete Asset" style={{ padding: 6, border: 'none', background: 'transparent', color: c.red, cursor: 'pointer' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                                    </div>
                                </TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Rental Requests Tab ───────────────────────────────────────────────────────
function RentalRequests() {
    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
            <SectionHeader
                title="Inbound Rental Enquiries"
                subtitle="Approve or reject rental schedules submitted by farmers directly from the marketplace portal"
            />
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>ID</TH>
                            <TH>Farmer Profile</TH>
                            <TH>Requested Asset</TH>
                            <TH>Booking Window</TH>
                            <TH>Financials</TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {RENTAL_REQUESTS.map(req => (
                            <tr key={req.id}>
                                <TD mono>{req.id}</TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 20 }}>{req.farmerIcon}</span>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{req.farmer}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>{req.contact} · {req.district}</p>
                                        </div>
                                    </div>
                                </TD>
                                <TD>{req.equipment}</TD>
                                <TD>
                                    <div>
                                        <span style={{ fontSize: 12, fontWeight: 500 }}><Calendar style={{ width: 11, height: 11, display: 'inline', marginRight: 3 }} />{req.pickupDate}</span>
                                        <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>Duration: {req.durationDays} days</p>
                                    </div>
                                </TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {req.totalCost.toLocaleString()}</TD>
                                <TD><StatusBadge label={req.status} cfg={reqStatusCfg[req.status]} /></TD>
                                <TD>
                                    {req.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button title="Accept Request" style={{ border: 'none', background: c.greenLt, color: c.green, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Check style={{ width: 14, height: 14 }} /></button>
                                            <button title="Reject Request" style={{ border: 'none', background: c.redLt, color: c.red, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X style={{ width: 14, height: 14 }} /></button>
                                        </div>
                                    ) : (
                                        <button style={{ border: `1px solid ${c.border}`, background: 'transparent', color: c.textSec, padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}><Eye style={{ width: 12, height: 12, display: 'inline', marginRight: 3 }} />Details</button>
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

// ─── Maintenance Schedule Tab ─────────────────────────────────────────────────
function MaintenanceSchedule() {
    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
            <SectionHeader
                title="Fleet Servicing & Compliance"
                subtitle="Monitor maintenance milestones, overhaul budgets, and field service cycles"
            />
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>Job ID</TH>
                            <TH>Equipment Asset</TH>
                            <TH>Service Configuration</TH>
                            <TH>Scheduled Date</TH>
                            <TH>Projected Cost</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {MAINTENANCE.map(maint => (
                            <tr key={maint.id}>
                                <TD mono>{maint.id}</TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 16 }}>{maint.emoji}</span>
                                        <span style={{ fontWeight: 600 }}>{maint.equipment}</span>
                                    </div>
                                </TD>
                                <TD>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{maint.type}</span>
                                        <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>{maint.notes}</p>
                                    </div>
                                </TD>
                                <TD mono>{maint.scheduledDate}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {maint.cost.toLocaleString()}</TD>
                                <TD><StatusBadge label={maint.status} cfg={maintStatusCfg[maint.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Controller Component ─────────────────────────────────────────────────
export default function EquipmentRentalDashboard({ onNavigate = () => { } }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    return (
        <div style={{ display: 'flex', background: c.bg, minHeight: '100vh', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                active={section}
                setActive={setSection}
                onNavigate={onNavigate}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} />

                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {section === 'dashboard' && <DashboardHome setSection={setSection} />}
                    {section === 'equipment' && <EquipmentManagement />}
                    {section === 'requests' && <RentalRequests />}
                    {section === 'maintenance' && <MaintenanceSchedule />}

                    {!['dashboard', 'equipment', 'requests', 'maintenance'].includes(section) && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 350, background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 40, textAlign: 'center' }}>
                            <AlertTriangle style={{ width: 44, height: 44, color: c.amber, marginBottom: 12 }} />
                            <h3 style={{ fontFamily: c.fontD, fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Module Sandbox Mode</h3>
                            <p style={{ fontFamily: c.fontB, fontSize: 13, color: c.textSec, maxWidth: 400, margin: 0 }}>
                                The <strong>{section}</strong> interface configuration layer is operational. Full live analytical pipelines are compiling context safely.
                            </p>
                            <div style={{ marginTop: 16 }}>
                                <ActionBtn label="Return to Dashboard Overview" onClick={() => setSection('dashboard')} variant="primary" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}