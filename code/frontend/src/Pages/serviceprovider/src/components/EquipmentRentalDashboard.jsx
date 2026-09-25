import { useState, useMemo, useEffect } from 'react';
import { db, auth } from '../../../../utils/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import {
    LayoutDashboard, Boxes, FileText, Tag, Wrench, History,
    BarChart2, MessageSquare, Star, Settings, LogOut,
    ChevronLeft, ChevronRight, Bell, Search, Plus,
    Edit2, Trash2, Eye, Check, X, AlertTriangle,
    TrendingUp, Download, Filter, RefreshCw, MapPin,
    Calendar, Clock, ArrowUpRight, CheckCircle, Send, Paperclip
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
    { id: 'EQ-005', emoji: '🚜', name: 'John Deere 5075E Tractor', category: 'Tractors', dailyRate: 7200, weeklyRate: 45000, monthlyRate: 158000, condition: 'Good', status: 'Reserved', location: 'Anuradhapura', lastMaintenance: '2026-06-01', totalRentals: 22, utilization: 54 },
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
    { id: 'MNT-003', equipment: 'John Deere 5075E Tractor', emoji: '🚜', type: 'Filter Replacement', scheduledDate: '2026-07-05', status: 'In Progress', cost: 4200, notes: 'Air & oil filters due for replacement' },
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

function StatusBadge({ label, cfg }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: c.fontB, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
            {cfg.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}
            {label}
        </span>
    );
}

function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend, trendUp = true }) {
    return (
        <div style={{ 
            background: `linear-gradient(135deg, ${c.surface} 0%, ${iconBg}15 100%)`, 
            borderRadius: 20, 
            border: `1px solid ${c.border}`, 
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
                        fontFamily: c.fontB
                    }}>
                        {trend}
                    </span>
                )}
            </div>
            <p style={{ fontFamily: c.fontM, fontSize: 26, fontWeight: 800, color: c.text, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{value}</p>
            <p style={{ fontFamily: c.fontB, fontSize: 12, fontWeight: 700, color: c.textSec, margin: '0 0 2px 0', letterSpacing: '0.02em' }}>{label}</p>
            <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer, margin: 0 }}>{sub}</p>
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

            <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
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
    const labels = { dashboard: 'Dashboard Overview', equipment: 'Equipment Management', requests: 'Rental Requests', categories: 'Equipment Categories', maintenance: 'Maintenance Schedule', history: 'Rental History Log', analytics: 'Analytics & Reports', messages: 'Secure Customer Inbox', reviews: 'Customer Feedback Reviews', settings: 'Configuration Settings' };
    const name = localStorage.getItem('userName') || localStorage.getItem('businessName') || 'Provider';
    return (
        <header style={{ height: 60, background: c.surface, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
            <div>
                <h1 style={{ fontFamily: c.fontD, fontSize: 16, fontWeight: 700, color: c.text, margin: 0 }}>{labels[section] || 'Dashboard'}</h1>
                <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: 0 }}>Equipment Rental Portal · NagroMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, padding: '3px 10px', marginBottom: 10 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                            <span style={{ fontFamily: c.fontB, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Active · Equipment Rental Provider</span>
                        </div>
                        <h2 style={{ fontFamily: c.fontD, fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Good morning! 🚜</h2>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>You have {pending} pending rental requests and {rented} active rentals today.</p>
                    </div>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 14, marginBottom: 24 }}>
                <KpiCard label="Total Equipment" value={String(totalEq)} sub="Across all categories" icon={<Boxes style={{ width: 18, height: 18 }} />} iconBg={c.greenLt} iconColor={c.green} trend="+2 this month" />
                <KpiCard label="Available" value={String(available)} sub="Ready for rental" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg="#ecfeff" iconColor={c.blue} trend={`${Math.round(available / totalEq * 100)}% of fleet`} />
                <KpiCard label="Currently Rented" value={String(rented)} sub="Active rentals" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={c.purpleLt} iconColor={c.purple} />
                <KpiCard label="Pending Requests" value={String(pending)} sub="Awaiting response" icon={<Clock style={{ width: 18, height: 18 }} />} iconBg={c.amberLt} iconColor={c.amber} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Revenue line chart */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                        <div>
                            <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Monthly Revenue</p>
                            <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '2px 0 0' }}>Rs in thousands · 2026</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={175}>
                        <LineChart data={REVENUE_DATA} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} />
                            <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} />
                            <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} />
                            <Tooltip formatter={(v) => [`Rs ${v}K`]} />
                            <Line type="monotone" dataKey="revenue" stroke={c.green} strokeWidth={2.5} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Rentals bar chart */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Monthly Rentals</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '2px 0 0' }}>Number of rental transactions</p>
                    </div>
                    <ResponsiveContainer width="100%" height={175}>
                        <BarChart data={REVENUE_DATA} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} />
                            <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} />
                            <Tooltip />
                            <Bar dataKey="rentals" fill={c.green} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Row: Recent Requests & Activities */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                {/* Pending / Recent Requests */}
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
                    <SectionHeader title="Recent Rental Requests" subtitle="Awaiting authorization" action={<ActionBtn label="View All" variant="secondary" size="sm" onClick={() => setSection('requests')} />} />
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
                    <SectionHeader title="Live Activity Feed" subtitle="Updates from the network" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {ACTIVITIES.map((act, index) => (
                            <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: `1px solid c.border`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                    {act.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.text, margin: 0 }}>{act.text}</p>
                                    <span style={{ fontFamily: c.fontB, fontSize: 10, color: c.textTer, display: 'block' }}>{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Equipment CRUD Form Modal ──────────────────────────────────────────────────
const BLANK_EQ = { name: '', category: 'Tractors', dailyRate: '', weeklyRate: '', monthlyRate: '', condition: 'Good', status: 'Available', location: '', emoji: '🚜', utilization: 0 };
const CATEGORIES_LIST = ['Tractors', 'Harvesters', 'Irrigation', 'Crop Care', 'Tillage'];
const CONDITIONS_LIST = ['Excellent', 'Good', 'Fair', 'Needs Service'];
const STATUSES_LIST = ['Available', 'Rented', 'Maintenance', 'Reserved'];
const EMOJI_MAP = { Tractors: '🚜', Harvesters: '🌾', Irrigation: '💧', 'Crop Care': '🌿', Tillage: '🔧' };

function EquipmentFormModal({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || BLANK_EQ);
    const [saving, setSaving] = useState(false);

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.location || !form.dailyRate) {
            alert('Please fill in all required fields: Name, Location, and Daily Rate.');
            return;
        }
        setSaving(true);
        const payload = {
            ...form,
            emoji: EMOJI_MAP[form.category] || '🚜',
            dailyRate: Number(form.dailyRate),
            weeklyRate: Number(form.weeklyRate) || Number(form.dailyRate) * 6,
            monthlyRate: Number(form.monthlyRate) || Number(form.dailyRate) * 22,
            utilization: Number(form.utilization) || 0,
            lastMaintenance: form.lastMaintenance || new Date().toISOString().split('T')[0],
            totalRentals: form.totalRentals || 0,
        };
        await onSave(payload);
        setSaving(false);
    };

    const inp = (label, field, type = 'text', placeholder = '', required = false) => (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.textSec, marginBottom: 4 }}>{label}{required && ' *'}</label>
            <input type={type} placeholder={placeholder} value={form[field] || ''} required={required}
                onChange={e => set(field, e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${c.border}`, borderRadius: 7, fontSize: 13, boxSizing: 'border-box', fontFamily: c.fontB }} />
        </div>
    );

    const sel = (label, field, options) => (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.textSec, marginBottom: 4 }}>{label}</label>
            <select value={form[field]} onChange={e => set(field, e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${c.border}`, borderRadius: 7, fontSize: 13, background: '#fff', fontFamily: c.fontB }}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontFamily: c.fontD, fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>{initial ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                        <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer, margin: '3px 0 0' }}>Fill in the details for your agricultural asset</p>
                    </div>
                    <button onClick={onClose} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: c.textSec }}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {inp('Equipment Name', 'name', 'text', 'e.g. Mahindra 575 DI Tractor', true)}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {sel('Category', 'category', CATEGORIES_LIST)}
                        {inp('Location', 'location', 'text', 'e.g. Anuradhapura', true)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        {inp('Daily Rate (Rs)', 'dailyRate', 'number', '5500', true)}
                        {inp('Weekly Rate (Rs)', 'weeklyRate', 'number', '32000')}
                        {inp('Monthly Rate (Rs)', 'monthlyRate', 'number', '115000')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {sel('Condition', 'condition', CONDITIONS_LIST)}
                        {sel('Status', 'status', STATUSES_LIST)}
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${c.border}`, background: '#fff', cursor: 'pointer', fontFamily: c.fontB, fontSize: 13, fontWeight: 600, color: c.textSec }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: c.green, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: c.fontB, fontSize: 13, fontWeight: 700 }}>
                            {saving ? 'Saving...' : (initial ? 'Update Equipment' : 'Add to Fleet')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Equipment Tab ─────────────────────────────────────────────────────────────
function EquipmentManagement({ equipment, setEquipment }) {
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | { ...editItem }

    const filtered = useMemo(() => {
        return equipment.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));
    }, [equipment, search]);

    const handleSave = async (payload) => {
        if (modal === 'add') {
            // Adding new equipment
            const newItem = { ...payload, id: 'EQ-' + Date.now() };
            try {
                const docRef = await addDoc(collection(db, 'equipmentFleet'), newItem);
                setEquipment(prev => [...prev, { ...newItem, id: docRef.id }]);
            } catch (err) {
                console.warn('Firebase write failed, using local state:', err);
                setEquipment(prev => [...prev, newItem]);
            }
        } else {
            // Editing existing equipment
            const id = modal.id;
            const updated = { ...payload, id };
            try {
                if (!String(id).startsWith('EQ-0')) { // real Firestore doc
                    await updateDoc(doc(db, 'equipmentFleet', id), payload);
                }
                setEquipment(prev => prev.map(e => e.id === id ? updated : e));
            } catch (err) {
                console.warn('Firebase update failed, using local state:', err);
                setEquipment(prev => prev.map(e => e.id === id ? updated : e));
            }
        }
        setModal(null);
    };

    const handleDelete = async (eq) => {
        if (!window.confirm(`Permanently remove "${eq.name}" from your fleet?`)) return;
        try {
            if (!String(eq.id).startsWith('EQ-0')) {
                await deleteDoc(doc(db, 'equipmentFleet', eq.id));
            }
        } catch (err) {
            console.warn('Firebase delete failed, removing locally:', err);
        }
        setEquipment(prev => prev.filter(e => e.id !== eq.id));
    };

    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
            {modal && (
                <EquipmentFormModal
                    initial={modal === 'add' ? null : modal}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}

            <SectionHeader
                title="Fleet Management"
                subtitle="Manage and track your agricultural assets, availability, and structural condition records"
                action={
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <ActionBtn label="Export Data" icon={<Download style={{ width: 14, height: 14 }} />} variant="secondary" onClick={() => exportToCSV('NagroMS_Fleet.csv', equipment)} />
                        <button onClick={() => setModal('add')} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#047857', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)', transition: 'all 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Plus style={{ width: 18, height: 18 }} />
                            Add Equipment
                        </button>
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
                            <tr key={eq.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = c.bg} onMouseLeave={e => e.currentTarget.style.background = ''}>
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
                                        <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 600 }}>Rs {Number(eq.dailyRate).toLocaleString()}/d</span>
                                        <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>Rs {Number(eq.monthlyRate).toLocaleString()}/mo</p>
                                    </div>
                                </TD>
                                <TD><StatusBadge label={eq.condition} cfg={eqCondCfg[eq.condition] || eqCondCfg.Good} /></TD>
                                <TD>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 80 }}>
                                        <div style={{ flex: 1, height: 5, background: c.borderLt, borderRadius: 9, overflow: 'hidden' }}>
                                            <div style={{ width: `${eq.utilization}%`, height: '100%', background: eq.utilization > 75 ? c.green : eq.utilization > 50 ? c.blue : c.amber }} />
                                        </div>
                                        <span style={{ fontFamily: c.fontM, fontSize: 11, fontWeight: 600 }}>{eq.utilization}%</span>
                                    </div>
                                </TD>
                                <TD><StatusBadge label={eq.status} cfg={eqStatusCfg[eq.status] || eqStatusCfg.Available} /></TD>
                                <TD>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => setModal(eq)}
                                            title="Edit Equipment"
                                            style={{ padding: '5px 10px', background: c.blueLt, color: c.blue, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            <Edit2 size={11} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(eq)}
                                            title="Delete Equipment"
                                            style={{ padding: '5px 10px', background: c.redLt, color: c.red, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            <Trash2 size={11} /> Delete
                                        </button>
                                    </div>
                                </TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <p style={{ color: c.textTer, fontSize: 14 }}>No equipment found. Add your first asset above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Rental Requests Tab ───────────────────────────────────────────────────────
function RentalRequests({ requests, handleRequest }) {
    const pending = useMemo(() => requests.filter(r => r.status === 'Pending'), [requests]);
    const others  = useMemo(() => requests.filter(r => r.status !== 'Pending'), [requests]);

    const ReqTable = ({ rows, dimmed = false }) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <TH>ID</TH>
                        <TH>Farmer</TH>
                        <TH>Requested Asset</TH>
                        <TH>Date / Duration</TH>
                        <TH>Cost (Rs)</TH>
                        <TH>Status</TH>
                        {!dimmed && <TH>Actions</TH>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(req => (
                        <tr key={req.id}
                            style={{ opacity: dimmed ? 0.6 : 1, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = c.bg}
                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                            <TD mono>{String(req.id).slice(0, 12)}</TD>
                            <TD>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>{req.farmerIcon}</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{req.farmer}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>{req.contact} · {req.district}</p>
                                    </div>
                                </div>
                            </TD>
                            <TD>{req.equipment}</TD>
                            <TD>
                                <span style={{ fontSize: 12, fontWeight: 500 }}>
                                    <Calendar style={{ width: 11, height: 11, display: 'inline', marginRight: 3 }} />{req.pickupDate}
                                </span>
                                <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>Duration: {req.durationDays} day{req.durationDays !== 1 ? 's' : ''}</p>
                            </TD>
                            <TD mono style={{ fontWeight: 600 }}>Rs {Number(req.totalCost).toLocaleString()}</TD>
                            <TD><StatusBadge label={req.status} cfg={reqStatusCfg[req.status] || reqStatusCfg.Pending} /></TD>
                            {!dimmed && (
                                <TD>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => handleRequest(req.id, 'Accepted')}
                                            style={{ border: 'none', background: c.greenLt, color: c.green, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Check style={{ width: 13, height: 13 }} /> Accept
                                        </button>
                                        <button onClick={() => handleRequest(req.id, 'Rejected')}
                                            style={{ border: 'none', background: c.redLt, color: c.red, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <X style={{ width: 13, height: 13 }} /> Reject
                                        </button>
                                    </div>
                                </TD>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── WAITING FOR ACTION panel ── */}
            <div style={{
                background: c.surface,
                borderRadius: 16,
                border: `1px solid ${pending.length > 0 ? c.blueBd : c.border}`,
                overflow: 'hidden',
                boxShadow: pending.length > 0 ? `0 4px 20px -4px ${c.blueLt}` : c.shadow,
                transition: 'all 0.3s'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: pending.length > 0 ? 'linear-gradient(to right, #f8fafc, #eff6ff)' : c.bg, borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: pending.length > 0 ? c.blue : c.border, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: pending.length > 0 ? '0 4px 12px rgba(59,130,246,0.25)' : 'none' }}>
                            <Clock style={{ width: 20, height: 20, color: '#fff' }} />
                        </div>
                        <div>
                            <p style={{ fontFamily: c.fontD, fontSize: 16, fontWeight: 800, color: c.text, margin: 0 }}>Waiting for Action</p>
                            <p style={{ fontFamily: c.fontB, fontSize: 12, color: pending.length > 0 ? c.blue : c.textSec, margin: '2px 0 0', fontWeight: pending.length > 0 ? 600 : 400 }}>Farmers awaiting your response</p>
                        </div>
                    </div>
                    {pending.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${c.blueBd}`, padding: '6px 14px', borderRadius: 99, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.blue, animation: 'pulse 2s infinite' }} />
                            <span style={{ fontFamily: c.fontB, fontSize: 13, fontWeight: 800, color: '#1e40af' }}>
                                {pending.length} pending
                            </span>
                        </div>
                    )}
                </div>

                {/* Pending table */}
                {pending.length > 0 ? (
                    <div style={{ padding: '0 4px' }}>
                        <ReqTable rows={pending} dimmed={false} />
                    </div>
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Check style={{ width: 32, height: 32, color: c.green }} />
                        </div>
                        <p style={{ fontFamily: c.fontD, fontSize: 16, fontWeight: 800, color: c.text, margin: '0 0 6px' }}>All caught up!</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, color: c.textTer, margin: 0 }}>No pending requests right now.</p>
                    </div>
                )}
            </div>

            {/* ── ALL OTHER REQUESTS (Accepted / In Progress / Completed / Rejected) ── */}
            <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, overflow: 'hidden', boxShadow: c.shadow }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Request History</p>
                        <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer, margin: 0 }}>Accepted, in-progress, completed & rejected</p>
                    </div>
                    <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 700, color: c.textSec }}>{others.length} records</span>
                </div>
                {others.length > 0 ? (
                    <ReqTable rows={others} dimmed={true} />
                ) : (
                    <div style={{ padding: '28px', textAlign: 'center' }}>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, color: c.textTer, margin: 0 }}>No request history yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}




// ─── Equipment Categories Tab ──────────────────────────────────────────────────
function EquipmentCategories({ equipment }) {
    const [activeCat, setActiveCat] = useState(null);

    const categories = useMemo(() => {
        if (!equipment || equipment.length === 0) return [];
        
        const map = new Map();
        equipment.forEach(eq => {
            if (!map.has(eq.category)) {
                map.set(eq.category, { name: eq.category, emoji: eq.emoji || '🏷️', count: 0, utilSum: 0, dailyRev: 0, available: 0, rented: 0, maintenance: 0, items: [] });
            }
            const cat = map.get(eq.category);
            cat.count += 1;
            cat.utilSum += (eq.utilization || 0);
            cat.dailyRev += (eq.dailyRate || 0);
            cat.items.push(eq);
            if (eq.status === 'Available') cat.available += 1;
            else if (eq.status === 'Rented') cat.rented += 1;
            else if (eq.status === 'Maintenance' || eq.status === 'Reserved') cat.maintenance += 1;
        });

        const result = Array.from(map.values()).map(cat => ({
            ...cat,
            avgUtil: Math.round(cat.utilSum / cat.count),
            percentOfFleet: Math.round((cat.count / equipment.length) * 100),
            color: cat.name === 'Tractors' ? '#10b981' : cat.name === 'Harvesters' ? '#3b82f6' : cat.name === 'Irrigation' ? '#8b5cf6' : cat.name === 'Crop Care' ? '#f59e0b' : '#ec4899',
            bgGlow: cat.name === 'Tractors' ? 'rgba(16, 185, 129, 0.15)' : cat.name === 'Harvesters' ? 'rgba(59, 130, 246, 0.15)' : cat.name === 'Irrigation' ? 'rgba(139, 92, 246, 0.15)' : cat.name === 'Crop Care' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(236, 72, 153, 0.15)'
        }));

        return result.sort((a, b) => b.count - a.count);
    }, [equipment]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Banner */}
            <div style={{ 
                background: c.surface, 
                borderRadius: 16, 
                padding: '24px 32px', 
                position: 'relative', 
                overflow: 'hidden', 
                border: `1px solid ${c.border}`,
                boxShadow: c.shadow
            }}>
                <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.05, fontSize: 140 }}>📊</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-block', padding: '4px 12px', background: c.greenLt, borderRadius: 20, marginBottom: 12, border: `1px solid ${c.greenBd}` }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.greenDk, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Intelligence Hub</span>
                    </div>
                    <h3 style={{ fontFamily: c.fontD, fontSize: 24, fontWeight: 800, color: c.text, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>Fleet Category Insights</h3>
                    <p style={{ margin: 0, fontSize: 14, color: c.textSec, maxWidth: 650, lineHeight: 1.6 }}>
                        Analyze utilization trends, revenue potential, and inventory distribution. Click on any category to view individual assets and their real-time statuses.
                    </p>
                </div>
            </div>

            {/* Category Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                {categories.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, gridColumn: '1 / -1' }}>
                        <p style={{ color: c.textTer, fontSize: 15, fontWeight: 600 }}>No equipment found in the fleet.</p>
                    </div>
                )}
                {categories.map(cat => {
                    const insight = cat.avgUtil > 75 
                        ? { text: 'High Demand! Expand fleet.', color: '#15803d', bg: c.greenLt, border: c.greenBd }
                        : cat.avgUtil < 40
                            ? { text: 'Low utilization. Run promos.', color: '#b91c1c', bg: c.redLt, border: c.redBd }
                            : { text: 'Stable performance.', color: '#1d4ed8', bg: c.blueLt, border: c.blueBd };

                    return (
                        <div key={cat.name} 
                            onClick={() => setActiveCat(activeCat === cat.name ? null : cat.name)}
                            style={{ 
                                background: c.surface, 
                                borderRadius: 16, 
                                border: `1px solid ${activeCat === cat.name ? cat.color : c.border}`, 
                                padding: 24, 
                                boxShadow: activeCat === cat.name ? `0 0 0 3px ${cat.bgGlow}` : c.shadow, 
                                display: 'flex', flexDirection: 'column', gap: 20,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: activeCat === cat.name ? 'translateY(-2px)' : 'none'
                            }}
                            onMouseEnter={e => { if(activeCat !== cat.name) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px -8px ${cat.bgGlow}`; } }}
                            onMouseLeave={e => { if(activeCat !== cat.name) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = c.shadow; } }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: cat.bgGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                        {cat.emoji}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontFamily: c.fontD, fontSize: 18, fontWeight: 800, color: c.text }}>{cat.name}</h4>
                                        <p style={{ margin: 0, fontSize: 13, color: c.textSec, fontWeight: 600 }}>{cat.count} units · {cat.percentOfFleet}% of fleet</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', background: c.bg, padding: '6px 12px', borderRadius: 12, border: `1px solid ${c.borderLt}` }}>
                                    <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: cat.color, fontFamily: c.fontM }}>{cat.avgUtil}%</span>
                                    <span style={{ fontSize: 10, color: c.textTer, fontWeight: 700, textTransform: 'uppercase' }}>Avg Util</span>
                                </div>
                            </div>

                            {/* Revenue & Status Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px 0', borderTop: `1px solid ${c.borderLt}`, borderBottom: `1px solid ${c.borderLt}` }}>
                                <div>
                                    <p style={{ margin: '0 0 6px', fontSize: 11, color: c.textTer, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Potential</p>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: c.text, fontFamily: c.fontM }}>Rs {cat.dailyRev.toLocaleString()}/d</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 6px', fontSize: 11, color: c.textTer, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fleet Status</p>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 13, fontWeight: 700 }}>
                                        <span style={{ color: c.green }} title="Available">{cat.available} A</span>
                                        <span style={{ color: c.borderLt }}>|</span>
                                        <span style={{ color: c.blue }} title="Rented">{cat.rented} R</span>
                                        <span style={{ color: c.borderLt }}>|</span>
                                        <span style={{ color: c.amber }} title="Maintenance">{cat.maintenance} M</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Badge */}
                            <div style={{ background: insight.bg, color: insight.color, padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', border: `1px solid ${insight.border}` }}>
                                <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
                                <span>{insight.text}</span>
                            </div>

                            {/* Drill-down list (visible only when clicked) */}
                            {activeCat === cat.name && (
                                <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${c.borderLt}`, animation: 'fadeIn 0.3s ease' }}>
                                    <p style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 800, color: c.text, textTransform: 'uppercase' }}>Assets in this category</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                                        {cat.items.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: c.bg, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 16 }}>{item.emoji}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{item.name}</span>
                                                </div>
                                                <span style={{ 
                                                    fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6,
                                                    background: item.status === 'Available' ? c.greenLt : item.status === 'Rented' ? c.blueLt : c.amberLt,
                                                    color: item.status === 'Available' ? c.greenDk : item.status === 'Rented' ? '#1e40af' : '#92400e',
                                                    border: `1px solid ${item.status === 'Available' ? c.greenBd : item.status === 'Rented' ? c.blueBd : c.amberBd}`
                                                }}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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

// ─── Rental History Tab ────────────────────────────────────────────────────────
function RentalHistory({ completedHistory }) {
    const [search, setSearch] = useState('');
    const exportHistory = () => {
        const headers = ['ID', 'Farmer', 'Equipment', 'Duration (Days)', 'Pickup Date', 'Return Date', 'Total Cost', 'Status'];
        const rows = completedHistory.map(h => [
            h.id, h.farmer, h.equipment, h.durationDays, h.pickupDate, h.returnDate, h.totalCost, h.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rental_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = useMemo(() => {
        return completedHistory.filter(h => h.id.toLowerCase().includes(search.toLowerCase()) || h.farmer.toLowerCase().includes(search.toLowerCase()) || h.equipment.toLowerCase().includes(search.toLowerCase()));
    }, [completedHistory, search]);

    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Rental Transactions Log</h3>
                    <p style={{ margin: 0, fontSize: 11, color: c.textTer }}>Archived records of returned agricultural equipment.</p>
                </div>
                <button onClick={exportHistory} style={{ padding: '8px 14px', background: c.green, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12 }}>
                    <Download style={{ width: 14, height: 14 }} /> Export Log
                </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input type="text" placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 13 }} />
            </div>
            <div style={{ overflowX: 'auto', margin: '0 -20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <TH>ID</TH>
                            <TH>Farmer</TH>
                            <TH>Equipment</TH>
                            <TH>Duration</TH>
                            <TH>Window</TH>
                            <TH>Fee</TH>
                            <TH>Status</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(h => (
                            <tr key={h.id}>
                                <TD mono>{h.id}</TD>
                                <TD>{h.farmer}</TD>
                                <TD>{h.equipment}</TD>
                                <TD>{h.durationDays} days</TD>
                                <TD mono style={{ fontSize: 11 }}>{h.pickupDate} to {h.returnDate}</TD>
                                <TD mono style={{ fontWeight: 600 }}>Rs {h.totalCost.toLocaleString()}</TD>
                                <TD><StatusBadge label={h.status} cfg={reqStatusCfg[h.status]} /></TD>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Equipment Analytics Tab ──────────────────────────────────────────────────
function EquipmentAnalytics() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <KpiCard label="Average Utilization" value="72.5%" sub="Active dispatch ratio" icon={<Boxes style={{ width: 18, height: 18 }} />} iconBg={c.greenLt} iconColor={c.green} />
                <KpiCard label="Revenue growth" value="+14.2%" sub="Month-over-month" icon={<TrendingUp style={{ width: 18, height: 18 }} />} iconBg={c.blueLt} iconColor={c.blue} />
                <KpiCard label="Breakdown Ratio" value="4.5%" sub="Outages for maintenance" icon={<AlertTriangle style={{ width: 18, height: 18 }} />} iconBg={c.redLt} iconColor={c.red} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 20, boxShadow: c.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Monthly Rental Income (Rs K)</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill={c.green} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 20, boxShadow: c.shadow }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>Active Fleet Dispatch Splitting</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                                {CATEGORY_DATA.map((d, idx) => <Cell key={idx} fill={d.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ─── Equipment Messages Tab ───────────────────────────────────────────────────
function EquipmentMessages() {
    const [conversations, setConversations] = useState([
        { id: 'c1', name: 'Sunil Perera', lastMessage: 'Checking tractor availability.', unread: 1, online: true },
        { id: 'c2', name: 'Kamala Silva', lastMessage: 'Returned water pump yesterday.', unread: 0, online: false }
    ]);
    const [activeChat, setActiveChat] = useState('c1');
    const [messages, setMessages] = useState({
        c1: [
            { id: 1, sender: 'them', text: 'Hi, is the Mahindra tractor free tomorrow morning?', time: '09:00 AM' },
            { id: 2, sender: 'me', text: 'Yes Sunil, it is serviced and available at our Anuradhapura yard.', time: '09:05 AM' }
        ],
        c2: [
            { id: 1, sender: 'them', text: 'Hello, water pump returned at badulla office yesterday.', time: 'Yesterday' },
            { id: 2, sender: 'me', text: 'Logged! Receipt issued.', time: 'Yesterday' }
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
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, overflow: 'hidden', height: 'calc(100vh - 140px)', boxShadow: c.shadow }}>
            <div style={{ borderRight: `1px solid ${c.border}`, background: '#f8fafc' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${c.border}` }}>
                    <input type="text" placeholder="Search chats..." style={{ width: '100%', padding: '6px 10px', border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 12 }} />
                </div>
                <div style={{ overflowY: 'auto' }}>
                    {conversations.map(conv => (
                        <div key={conv.id} onClick={() => { setActiveChat(conv.id); conv.unread = 0; }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, cursor: 'pointer', background: activeChat === conv.id ? c.greenLt : 'transparent', borderBottom: `1px solid ${c.borderLt}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👨‍🌾</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{conv.name}</span>
                                <p style={{ margin: 0, fontSize: 10, color: c.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${c.border}`, background: '#f8fafc' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{conversations.find(conv => conv.id === activeChat)?.name}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                    {messages[activeChat]?.map(m => {
                        const isMe = m.sender === 'me';
                        return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '70%', background: isMe ? c.green : '#fff', color: isMe ? '#fff' : c.text, padding: '10px 14px', borderRadius: 12, border: isMe ? 'none' : `1px solid ${c.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4 }}>{m.text}</p>
                                    <span style={{ display: 'block', textAlign: 'right', fontSize: 9, color: isMe ? 'rgba(255,255,255,0.7)' : c.textTer, marginTop: 4 }}>{m.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <form onSubmit={handleSend} style={{ padding: 12, borderTop: `1px solid ${c.border}`, display: 'flex', gap: 8 }}>
                    <input type="text" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: 8, border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 13 }} />
                    <button type="submit" style={{ padding: '8px 16px', background: c.green, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                </form>
            </div>
        </div>
    );
}

// ─── Equipment Reviews Tab ────────────────────────────────────────────────────
function EquipmentReviews() {
    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 20, boxShadow: c.shadow }}>
            <h3 style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 16px 0' }}>Farmer Feedback Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                    { author: 'Sunil Perera', rating: 5, comment: 'Mahindra Tractor was clean and powerful. Delivered exactly on time.', date: '2026-07-06' },
                    { author: 'Kamala Silva', rating: 4, comment: 'Water pump was efficient, but needed a longer hose adapter.', date: '2026-07-04' }
                ].map((r, idx) => (
                    <div key={idx} style={{ padding: 14, border: `1px solid ${c.borderLt}`, borderRadius: 10 }}>
                        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{r.author}</span>
                                <p style={{ margin: 0, fontSize: 10, color: c.textTer }}>{r.date}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} style={{ width: 12, height: 12, fill: i < r.rating ? c.amber : 'none', stroke: i < r.rating ? c.amber : c.textTer }} />
                                ))}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 12.5, color: c.textSec }}>{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function EquipmentSettings() {
    const [bizName, setBizName] = useState(localStorage.getItem('businessName') || 'Agri Equipment Rental');

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('businessName', bizName);
        alert('Configurations saved successfully!');
    };

    return (
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 24, maxWidth: 600, boxShadow: c.shadow }}>
            <h3 style={{ fontFamily: c.fontD, fontSize: 15, fontWeight: 750, color: c.text, marginBottom: 16 }}>Equipment Center Profile</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.textSec, marginBottom: 6 }}>Equipment Yard Name</label>
                    <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.textSec, marginBottom: 6 }}>Operating Location</label>
                    <input type="text" defaultValue="Anuradhapura & Kandy Hubs" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 13 }} />
                </div>
                <button type="submit" style={{ padding: '8px 16px', background: c.green, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start' }}>Save Config</button>
            </form>
        </div>
    );
}

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

// ─── Main Controller Component ─────────────────────────────────────────────────
export default function EquipmentRentalDashboard({ onNavigate = () => { } }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSection] = useState('dashboard');

    const [equipment, setEquipment] = useState(EQUIPMENT);
    const [requests, setRequests] = useState(RENTAL_REQUESTS);

    useEffect(() => {
        const q = query(collection(db, 'serviceBookings'), where('serviceType', 'in', ['equipment', 'Equipment Rental']));
        const unsub = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                
                // If it's available in my list, it should show to me
                // Either the equipment name matches OR we just show it if we have no auth
                // To be safe, we'll check if the requirement matches any equipment in our fleet, 
                // OR if the providerId matches our currently simulated auth.
                
                const matchesFleet = equipment.some(e => e.name.toLowerCase().includes(data.requirement?.toLowerCase() || '')) ||
                                     equipment.some(e => e.category.toLowerCase().includes(data.requirement?.toLowerCase() || ''));
                                     
                if (matchesFleet || !data.providerId) {
                    fetched.push({
                        id: docSnap.id,
                        farmer: data.farmerName || 'Farmer User',
                        farmerIcon: '👨‍🌾',
                        equipment: data.requirement,
                        durationDays: data.durationDays || 1,
                        pickupDate: data.requiredDate || 'N/A',
                        returnDate: 'N/A', // Could compute
                        totalCost: data.proposedCost || 0,
                        contact: data.farmerPhone || 'N/A',
                        status: data.status === 'pending' ? 'Pending' : (data.status === 'accepted' ? 'Accepted' : (data.status === 'rejected' ? 'Rejected' : 'Completed')),
                        district: data.district || 'Anuradhapura'
                    });
                }
            });
            if (fetched.length > 0) {
                setRequests(prev => {
                    // merge with mock data for visual purposes if you want, but better to just use fetched + mock
                    const newIds = new Set(fetched.map(f => f.id));
                    const remainingMocks = prev.filter(p => !newIds.has(p.id) && String(p.id).startsWith('RNT'));
                    return [...fetched, ...remainingMocks];
                });
            }
        });
        return () => unsub();
    }, [equipment]);

    const handleRequest = async (id, newStatus) => {
        try {
            // Optimistic update
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            
            // Try to update firebase if it's a real document (not a mock RNT-xxx)
            if (!String(id).startsWith('RNT')) {
                const firestoreStatus = newStatus.toLowerCase();
                await updateDoc(doc(db, 'serviceBookings', id), { status: firestoreStatus });
            }
            
            if (newStatus === 'Accepted') {
                const req = requests.find(r => r.id === id);
                if (req) {
                    setEquipment(prevEq => prevEq.map(eq => (eq.name.includes(req.equipment) || req.equipment.includes(eq.name)) ? { ...eq, status: 'Rented' } : eq));
                    alert(`Approved request! Gear ${req.equipment} is now rented to farmer ${req.farmer}.`);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status in backend.');
        }
    };

    const completedHistory = useMemo(() => {
        return requests.filter(r => r.status === 'Completed' || r.status === 'Rejected');
    }, [requests]);

    return (
        <div className="mobile-dash-wrapper" style={{ display: 'flex', background: c.bg, minHeight: '100vh', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-dash-wrapper { flex-direction: column !important; }
                    .mobile-sidebar { width: 100% !important; height: auto !important; position: static !important; }
                    .mobile-main { padding: 12px !important; }
                    .mobile-grid-1 { grid-template-columns: 1fr !important; }
                    .mobile-grid-2 { grid-template-columns: 1fr !important; }
                    .mobile-hidden { display: none !important; }
                }
            `}</style>
            
            <div className="mobile-sidebar" style={{ zIndex: 10 }}>
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    active={section}
                    setActive={setSection}
                    onNavigate={onNavigate}
                />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopNav section={section} />

                <main className="mobile-main" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {section === 'dashboard' && <DashboardHome setSection={setSection} />}
                    {section === 'equipment' && <EquipmentManagement equipment={equipment} setEquipment={setEquipment} />}
                    {section === 'requests' && <RentalRequests requests={requests} handleRequest={handleRequest} />}
                    {section === 'categories' && <EquipmentCategories equipment={equipment} />}
                    {section === 'maintenance' && <MaintenanceSchedule />}
                    {section === 'history' && <RentalHistory completedHistory={completedHistory} />}
                    {section === 'analytics' && <EquipmentAnalytics />}
                    {section === 'messages' && <EquipmentMessages />}
                    {section === 'reviews' && <EquipmentReviews />}
                    {section === 'settings' && <EquipmentSettings />}
                </main>
            </div>
        </div>
    );
}