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
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Design System ─────────────────────────────────────────────────────────────
const c = {
  sidebar:    'linear-gradient(170deg, #0a2e1a 0%, #134d2e 50%, #0e3d24 100%)',
  green:      '#16a34a',
  greenDk:    '#15803d',
  greenLt:    '#f0fdf4',
  greenBd:    '#dcfce7',
  bg:         '#f8fafc',
  surface:    '#ffffff',
  border:     '#e2e8f0',
  borderLt:   '#f1f5f9',
  text:       '#0f172a',
  textSec:    '#475569',
  textTer:    '#94a3b8',
  shadow:     '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:   '0 4px 16px rgba(0,0,0,0.08)',
  fontD:      "'Plus Jakarta Sans', sans-serif",
  fontB:      "'Inter', sans-serif",
  fontM:      "'JetBrains Mono', monospace",
  radius:     '14px',
  amber:      '#f59e0b', amberLt: '#fffbeb', amberBd: '#fde68a',
  red:        '#ef4444', redLt: '#fef2f2', redBd: '#fecaca',
  blue:       '#3b82f6', blueLt: '#eff6ff', blueBd: '#bfdbfe',
  purple:     '#8b5cf6', purpleLt: '#f5f3ff',
};

// ─── Types ─────────────────────────────────────────────────────────────────────
type EqStatus   = 'Available' | 'Rented' | 'Maintenance' | 'Reserved';
type EqCond     = 'Excellent' | 'Good' | 'Fair' | 'Needs Service';
type ReqStatus  = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';
type MaintStatus= 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue';

interface Equipment {
  id: string; emoji: string; name: string; category: string;
  dailyRate: number; weeklyRate: number; monthlyRate: number;
  condition: EqCond; status: EqStatus; location: string;
  lastMaintenance: string; totalRentals: number; utilization: number;
}
interface RentalReq {
  id: string; farmer: string; farmerIcon: string; equipment: string;
  durationDays: number; pickupDate: string; returnDate: string;
  totalCost: number; contact: string; status: ReqStatus; district: string;
}
interface Maintenance {
  id: string; equipment: string; emoji: string; type: string;
  scheduledDate: string; status: MaintStatus; cost: number; notes: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', emoji: '🚜', name: 'Mahindra 575 DI Tractor', category: 'Tractors', dailyRate: 5500, weeklyRate: 32000, monthlyRate: 115000, condition: 'Excellent', status: 'Available', location: 'Anuradhapura', lastMaintenance: '2026-06-15', totalRentals: 48, utilization: 78 },
  { id: 'EQ-002', emoji: '🌾', name: 'Kubota DC-70 Harvester', category: 'Harvesters', dailyRate: 8500, weeklyRate: 55000, monthlyRate: 195000, condition: 'Good', status: 'Rented', location: 'Polonnaruwa', lastMaintenance: '2026-05-20', totalRentals: 31, utilization: 65 },
  { id: 'EQ-003', emoji: '💧', name: 'Honda WB30 Water Pump', category: 'Irrigation', dailyRate: 1800, weeklyRate: 10500, monthlyRate: 38000, condition: 'Good', status: 'Available', location: 'Kurunegala', lastMaintenance: '2026-06-28', totalRentals: 92, utilization: 89 },
  { id: 'EQ-004', emoji: '🌿', name: 'Yamaha KF150 Sprayer', category: 'Crop Care', dailyRate: 950, weeklyRate: 5800, monthlyRate: 21000, condition: 'Excellent', status: 'Available', location: 'Kandy', lastMaintenance: '2026-07-01', totalRentals: 67, utilization: 71 },
  { id: 'EQ-005', emoji: '🏗️', name: 'John Deere 5075E Tractor', category: 'Tractors', dailyRate: 7200, weeklyRate: 45000, monthlyRate: 158000, condition: 'Good', status: 'Reserved', location: 'Anuradhapura', lastMaintenance: '2026-06-01', totalRentals: 22, utilization: 54 },
  { id: 'EQ-006', emoji: '🔧', name: 'Kubota L3800 Cultivator', category: 'Tillage', dailyRate: 3800, weeklyRate: 24000, monthlyRate: 86000, condition: 'Needs Service', status: 'Maintenance', location: 'Badulla', lastMaintenance: '2026-04-10', totalRentals: 39, utilization: 42 },
  { id: 'EQ-007', emoji: '🚿', name: 'Rain Bird Drip System', category: 'Irrigation', dailyRate: 2200, weeklyRate: 13500, monthlyRate: 48000, condition: 'Excellent', status: 'Available', location: 'Jaffna', lastMaintenance: '2026-06-30', totalRentals: 55, utilization: 81 },
  { id: 'EQ-008', emoji: '🌾', name: 'Iseki TH5370 Combine', category: 'Harvesters', dailyRate: 11000, weeklyRate: 68000, monthlyRate: 240000, condition: 'Good', status: 'Rented', location: 'Batticaloa', lastMaintenance: '2026-05-15', totalRentals: 18, utilization: 60 },
];

const RENTAL_REQUESTS: RentalReq[] = [
  { id: 'RNT-2851', farmer: 'Sunil Perera', farmerIcon: '👨‍🌾', equipment: 'Mahindra 575 DI Tractor', durationDays: 7, pickupDate: '2026-07-08', returnDate: '2026-07-15', totalCost: 32000, contact: '077 123 4567', status: 'Pending', district: 'Anuradhapura' },
  { id: 'RNT-2850', farmer: 'Kamala Silva', farmerIcon: '👩‍🌾', equipment: 'Honda WB30 Water Pump', durationDays: 14, pickupDate: '2026-07-06', returnDate: '2026-07-20', totalCost: 21000, contact: '081 222 3344', status: 'Accepted', district: 'Kandy' },
  { id: 'RNT-2849', farmer: 'Nimal Fernando', farmerIcon: '👨‍🌾', equipment: 'Kubota DC-70 Harvester', durationDays: 5, pickupDate: '2026-07-04', returnDate: '2026-07-09', totalCost: 42500, contact: '091 333 4455', status: 'In Progress', district: 'Galle' },
  { id: 'RNT-2848', farmer: 'Priya Kumar', farmerIcon: '👩‍🌾', equipment: 'Yamaha KF150 Sprayer', durationDays: 3, pickupDate: '2026-07-01', returnDate: '2026-07-04', totalCost: 2850, contact: '021 444 5566', status: 'Completed', district: 'Jaffna' },
  { id: 'RNT-2847', farmer: 'Rajan Muthu', farmerIcon: '👨‍🌾', equipment: 'John Deere 5075E Tractor', durationDays: 10, pickupDate: '2026-07-10', returnDate: '2026-07-20', totalCost: 72000, contact: '076 555 6677', status: 'Pending', district: 'Batticaloa' },
  { id: 'RNT-2846', farmer: 'Amara Jayaweera', farmerIcon: '👩‍🌾', equipment: 'Rain Bird Drip System', durationDays: 30, pickupDate: '2026-06-01', returnDate: '2026-07-01', totalCost: 48000, contact: '070 666 7788', status: 'Completed', district: 'Kurunegala' },
];

const MAINTENANCE: Maintenance[] = [
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
const eqStatusCfg: Record<EqStatus, { bg: string; color: string; dot: string }> = {
  Available:   { bg: c.greenLt, color: '#166534', dot: c.green },
  Rented:      { bg: c.blueLt,  color: '#1e40af', dot: c.blue },
  Maintenance: { bg: c.amberLt, color: '#92400e', dot: c.amber },
  Reserved:    { bg: c.purpleLt, color: '#5b21b6', dot: c.purple },
};
const eqCondCfg: Record<EqCond, { bg: string; color: string }> = {
  Excellent:      { bg: c.greenLt, color: '#166534' },
  Good:           { bg: '#ecfeff', color: '#164e63' },
  Fair:           { bg: c.amberLt, color: '#92400e' },
  'Needs Service':{ bg: c.redLt,   color: '#991b1b' },
};
const reqStatusCfg: Record<ReqStatus, { bg: string; color: string }> = {
  Pending:    { bg: c.amberLt, color: '#92400e' },
  Accepted:   { bg: c.blueLt,  color: '#1e40af' },
  'In Progress':{ bg: c.purpleLt, color: '#5b21b6' },
  Completed:  { bg: c.greenLt, color: '#166534' },
  Rejected:   { bg: c.redLt,   color: '#991b1b' },
};
const maintStatusCfg: Record<MaintStatus, { bg: string; color: string }> = {
  Upcoming:    { bg: c.blueLt,  color: '#1e40af' },
  'In Progress':{ bg: c.purpleLt, color: '#5b21b6' },
  Completed:  { bg: c.greenLt, color: '#166534' },
  Overdue:    { bg: c.redLt,   color: '#991b1b' },
};

// ─── Reusable Primitives ───────────────────────────────────────────────────────
function StatusBadge({ label, cfg }: { label: string; cfg: { bg: string; color: string; dot?: string } }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, fontFamily: c.fontB, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend }: { label: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; iconColor: string; trend?: string }) {
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

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
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

function ActionBtn({ label, icon, onClick, variant = 'primary', size = 'md' }: { label: string; icon?: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' }) {
  const vs = { primary: { bg: c.green, color: '#fff', border: 'none' }, secondary: { bg: '#fff', color: c.text, border: `1px solid ${c.border}` }, danger: { bg: c.redLt, color: c.red, border: `1px solid ${c.redBd}` }, ghost: { bg: 'transparent', color: c.textSec, border: 'none' } }[variant];
  const sz = size === 'sm' ? { padding: '5px 11px', fontSize: 12 } : { padding: '8px 16px', fontSize: 13 };
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: c.fontB, fontWeight: 600, borderRadius: 8, cursor: 'pointer', ...vs, ...sz }}>{icon}{label}</button>;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: '11px 16px', fontFamily: c.fontB, fontSize: 11, fontWeight: 600, color: c.textTer, textAlign: 'left', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.bg, whiteSpace: 'nowrap' }}>{children}</th>
);
const TD = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td style={{ padding: '13px 16px', fontFamily: mono ? c.fontM : c.fontB, fontSize: 13, color: c.text, borderBottom: `1px solid ${c.borderLt}`, verticalAlign: 'middle' }}>{children}</td>
);


// ─── Utility ───────────────────────────────────────────────────────────────────
function exportToCSV(filename: string, rows: any[]) {
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

function Sidebar({ collapsed, setCollapsed, active, setActive, onNavigate }: {
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  active: string; setActive: (s: string) => void; onNavigate: (p: string) => void;
}) {
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
function TopNav({ section }: { section: string }) {
  const labels: Record<string, string> = { dashboard: 'Dashboard Overview', equipment: 'Equipment Management', requests: 'Rental Requests', categories: 'Equipment Categories', maintenance: 'Maintenance Schedule', history: 'Rental History', analytics: 'Analytics & Reports', messages: 'Messages', reviews: 'Customer Reviews', settings: 'Settings' };
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
function DashboardHome({ setSection }: { setSection: (s: string) => void }) {
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
        <KpiCard label="Available" value={String(available)} sub="Ready for rental" icon={<CheckCircle style={{ width: 18, height: 18 }} />} iconBg="#ecfeff" iconColor={c.blue} trend={`${Math.round(available/totalEq*100)}% of fleet`} />
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
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}`, boxShadow: c.shadowMd }} formatter={(v: number) => [`Rs ${v}K`, 'Revenue']} />
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
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v: number) => [v, 'Rentals']} />
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
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
            {CATEGORY_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                  <span style={{ fontFamily: c.fontB, fontSize: 11, color: c.textSec }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: c.fontM, fontSize: 11, fontWeight: 700, color: c.text }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Activity */}
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, overflow: 'hidden', boxShadow: c.shadow }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${c.borderLt}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Recent Activities</p>
            <button style={{ fontFamily: c.fontB, fontSize: 12, color: c.green, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all</button>
          </div>
          {ACTIVITIES.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: i < ACTIVITIES.length - 1 ? `1px solid ${c.borderLt}` : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${a.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: c.fontB, fontSize: 13, color: c.text, margin: '0 0 2px', fontWeight: 500 }}>{a.text}</p>
                <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: 0 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions + utilization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '18px 20px', boxShadow: c.shadow }}>
            <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 14px' }}>Quick Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Add New Equipment', icon: <Plus style={{ width: 13, height: 13 }} />, color: c.green, bg: c.greenLt, action: () => setSection('equipment') },
                { label: 'Update Availability', icon: <RefreshCw style={{ width: 13, height: 13 }} />, color: c.blue, bg: c.blueLt, action: () => setSection('equipment') },
                { label: 'Schedule Maintenance', icon: <Wrench style={{ width: 13, height: 13 }} />, color: c.amber, bg: c.amberLt, action: () => setSection('maintenance') },
                { label: 'View Rental History', icon: <History style={{ width: 13, height: 13 }} />, color: c.purple, bg: c.purpleLt, action: () => setSection('history') },
                { label: 'Export Reports', icon: <Download style={{ width: 13, height: 13 }} />, color: c.textSec, bg: c.bg, action: () => exportToCSV('equipment_reports.csv', EQUIPMENT) },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', background: a.bg, border: `1px solid ${a.color}22`, borderRadius: 10, cursor: 'pointer', fontFamily: c.fontB, fontSize: 13, fontWeight: 600, color: a.color, textAlign: 'left' }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Utilization */}
          <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '18px 20px', boxShadow: c.shadow }}>
            <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 14px' }}>Equipment Utilization</p>
            {EQUIPMENT.slice(0, 4).map(eq => (
              <div key={eq.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: c.fontB, fontSize: 12, color: c.text, fontWeight: 500 }}>{eq.emoji} {eq.name.split(' ').slice(0, 3).join(' ')}</span>
                  <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 700, color: eq.utilization > 70 ? c.green : c.amber }}>{eq.utilization}%</span>
                </div>
                <div style={{ background: c.borderLt, borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${eq.utilization}%`, height: '100%', background: eq.utilization > 70 ? c.green : eq.utilization > 50 ? c.amber : c.red, borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Equipment Management ──────────────────────────────────────────────────────
function EquipmentSection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [equipment, setEquipment] = useState(EQUIPMENT);
  const [actionEq, setActionEq] = useState<{unit: any, action: 'add'|'edit'|null}>( {unit: null, action: null} );
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => equipment.filter(e =>
    (statusFilter === 'All' || e.status === statusFilter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  ), [equipment, search, statusFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleStatus = (id: string) => setEquipment(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Available' ? 'Reserved' : 'Available' } : e));

  return (
    <div>
      <SectionHeader title="Equipment Management" subtitle={`${equipment.length} pieces of equipment registered`}
        action={<ActionBtn label="Add Equipment" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={() => setActionEq({unit: {}, action: 'add'})} />} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 9, padding: '7px 12px', flex: 1, minWidth: 220 }}>
          <Search style={{ width: 14, height: 14, color: c.textTer }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search equipment…" style={{ border: 'none', outline: 'none', fontFamily: c.fontB, fontSize: 13, color: c.text, background: 'transparent', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Available', 'Rented', 'Maintenance', 'Reserved'].map(f => (
            <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }} style={{ padding: '7px 13px', borderRadius: 8, border: `1px solid ${statusFilter === f ? c.green : c.border}`, background: statusFilter === f ? c.green : c.surface, color: statusFilter === f ? '#fff' : c.textSec, fontFamily: c.fontB, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
        <ActionBtn label="Export" icon={<Download style={{ width: 13, height: 13 }} />} variant="secondary" onClick={() => exportToCSV('equipment.csv', equipment)} />
      </div>

      {/* Table */}
      <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, overflow: 'hidden', boxShadow: c.shadow }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <TH>Equipment</TH><TH>Category</TH><TH>Daily Rate</TH><TH>Weekly Rate</TH><TH>Monthly Rate</TH>
                <TH>Condition</TH><TH>Status</TH><TH>Location</TH><TH>Last Serviced</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {paged.map((eq, i) => (
                <tr key={eq.id} style={{ background: i % 2 === 0 ? c.surface : '#fafafa' }}>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: c.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{eq.emoji}</div>
                      <div>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, fontWeight: 600, color: c.text, margin: 0, whiteSpace: 'nowrap' }}>{eq.name}</p>
                        <p style={{ fontFamily: c.fontM, fontSize: 11, color: c.textTer, margin: 0 }}>{eq.id}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, padding: '3px 8px', background: c.bg, borderRadius: 6, color: c.textSec }}>{eq.category}</span></TD>
                  <TD mono>Rs {eq.dailyRate.toLocaleString()}</TD>
                  <TD mono>Rs {eq.weeklyRate.toLocaleString()}</TD>
                  <TD mono>Rs {eq.monthlyRate.toLocaleString()}</TD>
                  <TD><StatusBadge label={eq.condition} cfg={eqCondCfg[eq.condition]} /></TD>
                  <TD><StatusBadge label={eq.status} cfg={eqStatusCfg[eq.status]} /></TD>
                  <TD><div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: c.fontB, fontSize: 12, color: c.textSec }}><MapPin style={{ width: 11, height: 11 }} />{eq.location}</div></TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer }}>{eq.lastMaintenance}</span></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => setActionEq({unit: eq, action: 'edit'})} style={{ padding: '4px 9px', background: c.greenLt, color: c.green, border: `1px solid ${c.greenBd}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 style={{ width: 11, height: 11 }} />
                      </button>
                      <button style={{ padding: '4px 9px', background: c.redLt, color: c.red, border: `1px solid ${c.redBd}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${c.borderLt}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer }}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.surface, color: page === 1 ? c.textTer : c.text, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: c.fontB, fontSize: 12 }}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${page === i+1 ? c.green : c.border}`, background: page === i+1 ? c.green : c.surface, color: page === i+1 ? '#fff' : c.text, cursor: 'pointer', fontFamily: c.fontB, fontSize: 12 }}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.surface, color: page === totalPages ? c.textTer : c.text, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: c.fontB, fontSize: 12 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rental Requests ───────────────────────────────────────────────────────────
function RentalRequests() {
  const [requests, setRequests] = useState(RENTAL_REQUESTS);
  const [filter, setFilter] = useState('All');
  const [viewRequest, setViewRequest] = useState<any>(null);
  const update = (id: string, status: ReqStatus) => setRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <SectionHeader title="Rental Requests" subtitle={`${requests.filter(r=>r.status==='Pending').length} pending requests`}
        action={<ActionBtn label="Export" icon={<Download style={{ width: 13, height: 13 }} />} variant="secondary" onClick={() => exportToCSV('equipment.csv', equipment)} />} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 13px', borderRadius: 8, border: `1px solid ${filter === f ? c.green : c.border}`, background: filter === f ? c.green : c.surface, color: filter === f ? '#fff' : c.textSec, fontFamily: c.fontB, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, overflow: 'hidden', boxShadow: c.shadow }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead><tr><TH>Farmer</TH><TH>Equipment</TH><TH>Duration</TH><TH>Pickup</TH><TH>Return</TH><TH>Total Cost</TH><TH>Contact</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? c.surface : '#fafafa' }}>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontSize: 20 }}>{r.farmerIcon}</span>
                      <div>
                        <p style={{ fontFamily: c.fontB, fontSize: 13, fontWeight: 600, color: c.text, margin: 0 }}>{r.farmer}</p>
                        <p style={{ fontFamily: c.fontM, fontSize: 11, color: c.textTer, margin: 0 }}>{r.id}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{r.equipment}</span></TD>
                  <TD mono>{r.durationDays} days</TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{r.pickupDate}</span></TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{r.returnDate}</span></TD>
                  <TD mono><strong style={{ color: c.green }}>Rs {r.totalCost.toLocaleString()}</strong></TD>
                  <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{r.contact}</span></TD>
                  <TD><StatusBadge label={r.status} cfg={reqStatusCfg[r.status]} /></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button onClick={() => setViewRequest(r)} style={{ padding: '4px 9px', background: c.bg, color: c.textSec, border: `1px solid ${c.border}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Eye style={{ width: 11, height: 11 }} /> View</button>
                      {r.status === 'Pending' && <>
                        <button onClick={() => update(r.id, 'Accepted')} style={{ padding: '4px 9px', background: c.greenLt, color: c.green, border: `1px solid ${c.greenBd}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Check style={{ width: 11, height: 11 }} /> Accept</button>
                        <button onClick={() => update(r.id, 'Rejected')} style={{ padding: '4px 9px', background: c.redLt, color: c.red, border: `1px solid ${c.redBd}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><X style={{ width: 11, height: 11 }} /> Reject</button>
                      </>}
                      {r.status === 'Accepted' && <button onClick={() => update(r.id, 'In Progress')} style={{ padding: '4px 9px', background: c.blueLt, color: c.blue, border: `1px solid ${c.blueBd}`, borderRadius: 7, fontFamily: c.fontB, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Start</button>}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance ───────────────────────────────────────────────────────────────
function MaintenanceSection() {
  const [records, setRecords] = useState(MAINTENANCE);
  const [showSchedule, setShowSchedule] = useState(false);
  const upcoming = records.filter(m => m.status === 'Upcoming' || m.status === 'In Progress');
  const history = records.filter(m => m.status === 'Completed');

  const markDone = (id: string) => setRecords(p => p.map(m => m.id === id ? { ...m, status: 'Completed' as MaintStatus } : m));

  return (
    <div>
      <SectionHeader title="Maintenance Schedule" subtitle="Track equipment health and service schedules"
        action={<ActionBtn label="Schedule Service" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={() => setShowSchedule(true)} />} />

      {/* Health overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Upcoming Services', value: String(upcoming.length), color: c.amber, bg: c.amberLt, icon: <Clock style={{ width: 16, height: 16 }} /> },
          { label: 'In Progress', value: String(records.filter(m=>m.status==='In Progress').length), color: c.purple, bg: c.purpleLt, icon: <Wrench style={{ width: 16, height: 16 }} /> },
          { label: 'Completed', value: String(history.length), color: c.green, bg: c.greenLt, icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
          { label: 'Overdue', value: String(records.filter(m=>m.status==='Overdue').length), color: c.red, bg: c.redLt, icon: <AlertTriangle style={{ width: 16, height: 16 }} /> },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${s.color}22` }}>
            <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontFamily: c.fontM, fontSize: 24, fontWeight: 700, color: s.color, margin: '0 0 3px' }}>{s.value}</p>
            <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: c.fontD, fontSize: 15, fontWeight: 700, color: c.text, margin: '0 0 12px' }}>Upcoming & In Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {upcoming.map(m => {
            const sc = maintStatusCfg[m.status];
            return (
              <div key={m.id} style={{ background: c.surface, borderRadius: 14, border: `1px solid ${c.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', boxShadow: c.shadow }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: c.amberLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <p style={{ fontFamily: c.fontB, fontSize: 14, fontWeight: 600, color: c.text, margin: 0 }}>{m.equipment}</p>
                    <StatusBadge label={m.status} cfg={sc} />
                  </div>
                  <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec, margin: '0 0 2px' }}>{m.type}</p>
                  <p style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer, margin: 0 }}>{m.notes}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Calendar style={{ width: 13, height: 13, color: c.textTer }} />
                    <span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{m.scheduledDate}</span>
                  </div>
                  <p style={{ fontFamily: c.fontM, fontSize: 13, fontWeight: 700, color: c.text, margin: '0 0 8px' }}>Rs {m.cost.toLocaleString()}</p>
                  {m.status !== 'Completed' && <ActionBtn label="Mark Done" onClick={() => markDone(m.id)} size="sm" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontFamily: c.fontD, fontSize: 15, fontWeight: 700, color: c.text, margin: '0 0 12px' }}>Maintenance History</h3>
      <div style={{ background: c.surface, borderRadius: 14, border: `1px solid ${c.border}`, overflow: 'hidden', boxShadow: c.shadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><TH>Equipment</TH><TH>Service Type</TH><TH>Date</TH><TH>Cost</TH><TH>Status</TH></tr></thead>
          <tbody>
            {history.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? c.surface : '#fafafa' }}>
                <TD><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>{m.emoji}</span><span style={{ fontFamily: c.fontB, fontSize: 13, fontWeight: 500 }}>{m.equipment}</span></div></TD>
                <TD>{m.type}</TD>
                <TD><span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textTer }}>{m.scheduledDate}</span></TD>
                <TD mono>Rs {m.cost.toLocaleString()}</TD>
                <TD><StatusBadge label={m.status} cfg={maintStatusCfg[m.status]} /></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsSection() {
  return (
    <div>
      <SectionHeader title="Analytics & Reports" subtitle="Equipment performance and revenue insights"
        action={<ActionBtn label="Export Report" icon={<Download style={{ width: 13, height: 13 }} />} variant="secondary" />} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Revenue growth */}
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
          <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 4px' }}>Revenue Growth Trend</p>
          <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '0 0 16px' }}>Monthly revenue in thousands (Rs)</p>
          <ResponsiveContainer key="analytics-revenue-line" width="100%" height={200}>
            <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} />
              <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v: number) => [`Rs ${v}K`, 'Revenue']} />
              <Line key="analytics-rev-line" type="monotone" dataKey="revenue" name="analytics-revenue" stroke={c.green} strokeWidth={2.5} dot={{ r: 4, fill: c.green, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rental frequency bar */}
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
          <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 4px' }}>Rental Volume</p>
          <p style={{ fontFamily: c.fontB, fontSize: 11, color: c.textTer, margin: '0 0 16px' }}>Number of rentals per month</p>
          <ResponsiveContainer key="analytics-rentals-bar" width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke={c.borderLt} vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: c.fontB, fontSize: 11, fill: c.textTer }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} />
              <Bar key="analytics-rentals-bar-series" dataKey="rentals" name="analytics-rentals" fill={c.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most rented + category dist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
          <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 16px' }}>Most Rented Equipment</p>
          {EQUIPMENT.sort((a, b) => b.totalRentals - a.totalRentals).slice(0, 5).map((eq, i) => (
            <div key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontFamily: c.fontM, fontSize: 12, color: c.textTer, width: 16 }}>#{i+1}</span>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{eq.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: c.fontB, fontSize: 13, fontWeight: 500, color: c.text }}>{eq.name.split(' ').slice(0, 3).join(' ')}</span>
                  <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 700, color: c.green }}>{eq.totalRentals} rentals</span>
                </div>
                <div style={{ background: c.borderLt, borderRadius: 99, height: 5 }}>
                  <div style={{ width: `${(eq.totalRentals / 92) * 100}%`, height: '100%', background: c.green, borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: '20px', boxShadow: c.shadow }}>
          <p style={{ fontFamily: c.fontD, fontSize: 14, fontWeight: 700, color: c.text, margin: '0 0 8px' }}>Category Revenue Share</p>
          <ResponsiveContainer key="analytics-category-pie" width="100%" height={170}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {CATEGORY_DATA.map((d) => <Cell key={`analytics-cat-${d.name}`} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: c.fontB, fontSize: 12, borderRadius: 10, border: `1px solid ${c.border}` }} formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          {CATEGORY_DATA.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                <span style={{ fontFamily: c.fontB, fontSize: 12, color: c.textSec }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: c.fontM, fontSize: 12, fontWeight: 700, color: c.text }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Equipment Categories ──────────────────────────────────────────────────────
const CATEGORIES_DATA = [
  { id:'cat-1', emoji:'🚜', name:'Tractors',      count:2, available:1, avgDailyRate:6350, description:'Heavy-duty tractors for plowing, field preparation and hauling', color:c.green },
  { id:'cat-2', emoji:'🌾', name:'Harvesters',    count:2, available:0, avgDailyRate:9750, description:'Combine and paddy harvesters for efficient crop harvesting',      color:'#0891b2' },
  { id:'cat-3', emoji:'💧', name:'Irrigation',    count:2, available:2, avgDailyRate:2000, description:'Water pumps and drip irrigation systems for crop watering',       color:'#3b82f6' },
  { id:'cat-4', emoji:'🌿', name:'Crop Care',     count:1, available:1, avgDailyRate:950,  description:'Sprayers and spreaders for pesticides and fertilizers',           color:'#8b5cf6' },
  { id:'cat-5', emoji:'🏗️', name:'Tillage',       count:1, available:0, avgDailyRate:3800, description:'Cultivators and rotavators for soil preparation',                color:'#f59e0b' },
];

function EquipmentCategories() {
  const [selected, setSelected] = useState<string|null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ emoji:'🔩', name:'', description:'' });
  const inp: React.CSSProperties = { width:'100%', padding:'8px 12px', border:`1px solid ${c.border}`, borderRadius:8, fontFamily:c.fontB, fontSize:14, color:c.text, outline:'none', boxSizing:'border-box' };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:c.fontD, fontSize:18, fontWeight:800, color:c.text, margin:0 }}>Equipment Categories</h2>
          <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:'3px 0 0' }}>Organise your fleet by equipment type</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:c.green, color:'#fff', border:'none', borderRadius:8, fontFamily:c.fontB, fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <Plus style={{ width:14, height:14 }}/> Add Category
        </button>
      </div>

      {showAdd && (
        <div style={{ background:c.greenLt, border:`1px solid ${c.greenBd}`, borderRadius:14, padding:20, marginBottom:20 }}>
          <p style={{ fontFamily:c.fontD, fontSize:14, fontWeight:700, color:c.green, margin:'0 0 14px' }}>➕ New Category</p>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:10, marginBottom:12 }}>
            <div><label style={{ display:'block', fontSize:12, color:c.textSec, marginBottom:4, fontFamily:c.fontB }}>Emoji</label><input value={newCat.emoji} onChange={e=>setNewCat(p=>({...p,emoji:e.target.value}))} style={inp}/></div>
            <div><label style={{ display:'block', fontSize:12, color:c.textSec, marginBottom:4, fontFamily:c.fontB }}>Category Name</label><input value={newCat.name} placeholder="e.g. Seeders" onChange={e=>setNewCat(p=>({...p,name:e.target.value}))} style={inp}/></div>
            <div><label style={{ display:'block', fontSize:12, color:c.textSec, marginBottom:4, fontFamily:c.fontB }}>Description</label><input value={newCat.description} placeholder="Short description" onChange={e=>setNewCat(p=>({...p,description:e.target.value}))} style={inp}/></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'7px 16px', background:c.green, color:'#fff', border:'none', borderRadius:8, fontFamily:c.fontB, fontWeight:600, fontSize:13, cursor:'pointer' }}>Save</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'7px 14px', background:'#fff', border:`1px solid ${c.border}`, borderRadius:8, fontFamily:c.fontB, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16, marginBottom:24 }}>
        {CATEGORIES_DATA.map(cat => (
          <div key={cat.id} onClick={()=>setSelected(selected===cat.id?null:cat.id)} style={{ background:c.surface, borderRadius:16, border:`2px solid ${selected===cat.id?cat.color:c.border}`, padding:20, cursor:'pointer', boxShadow:selected===cat.id?`0 0 0 3px ${cat.color}20`:c.shadow, transition:'all 0.2s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:46, height:46, borderRadius:12, background:`${cat.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{cat.emoji}</div>
                <div>
                  <p style={{ fontFamily:c.fontD, fontSize:15, fontWeight:700, color:c.text, margin:0 }}>{cat.name}</p>
                  <p style={{ fontFamily:c.fontB, fontSize:11, color:c.textTer, margin:'2px 0 0' }}>{cat.count} equipment listed</p>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:c.fontM, fontSize:13, fontWeight:700, color:cat.color, margin:0 }}>Rs {cat.avgDailyRate.toLocaleString()}</p>
                <p style={{ fontFamily:c.fontB, fontSize:10, color:c.textTer, margin:'2px 0 0' }}>avg/day</p>
              </div>
            </div>
            <p style={{ fontFamily:c.fontB, fontSize:12, color:c.textSec, margin:'0 0 14px', lineHeight:1.6 }}>{cat.description}</p>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1, background:c.greenLt, borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                <p style={{ fontFamily:c.fontM, fontSize:16, fontWeight:700, color:c.green, margin:0 }}>{cat.available}</p>
                <p style={{ fontFamily:c.fontB, fontSize:10, color:c.textTer, margin:0 }}>Available</p>
              </div>
              <div style={{ flex:1, background:'#eff6ff', borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                <p style={{ fontFamily:c.fontM, fontSize:16, fontWeight:700, color:'#2563eb', margin:0 }}>{cat.count - cat.available}</p>
                <p style={{ fontFamily:c.fontB, fontSize:10, color:c.textTer, margin:0 }}>Rented</p>
              </div>
            </div>
            {selected===cat.id && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${c.borderLt}`, display:'flex', gap:8 }}>
                <button style={{ flex:1, padding:'6px', background:c.greenLt, color:c.green, border:`1px solid ${c.greenBd}`, borderRadius:7, fontFamily:c.fontB, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><Edit2 style={{ width:12,height:12 }}/>Edit</button>
                <button style={{ padding:'6px 12px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:7, fontFamily:c.fontB, fontSize:12, cursor:'pointer' }}><Trash2 style={{ width:12,height:12 }}/></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, overflow:'hidden', boxShadow:c.shadow }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${c.borderLt}` }}><p style={{ fontFamily:c.fontD, fontSize:14, fontWeight:700, color:c.text, margin:0 }}>Category Summary</p></div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:c.bg }}>
            {['Category','Equipment Count','Available','Rented','Avg Daily Rate','Utilization'].map(h=><th key={h} style={{ padding:'11px 20px', fontFamily:c.fontB, fontSize:11, fontWeight:600, color:c.textTer, textAlign:'left', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:`1px solid ${c.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {CATEGORIES_DATA.map((cat,i)=>{
              const util = Math.round(((cat.count-cat.available)/cat.count)*100);
              return (
                <tr key={cat.id} style={{ borderBottom:i<CATEGORIES_DATA.length-1?`1px solid ${c.borderLt}`:'none' }}>
                  <td style={{ padding:'13px 20px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:18 }}>{cat.emoji}</span><span style={{ fontFamily:c.fontB, fontSize:13, fontWeight:600, color:c.text }}>{cat.name}</span></div></td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:13, color:c.text }}>{cat.count}</td>
                  <td style={{ padding:'13px 20px' }}><span style={{ fontFamily:c.fontB, fontSize:12, padding:'3px 8px', background:c.greenLt, color:c.green, borderRadius:99, fontWeight:600 }}>{cat.available}</span></td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:13, color:c.text }}>{cat.count-cat.available}</td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:13, fontWeight:600, color:c.text }}>Rs {cat.avgDailyRate.toLocaleString()}</td>
                  <td style={{ padding:'13px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, background:c.borderLt, borderRadius:99, height:6 }}><div style={{ width:`${util}%`, height:'100%', background:util>70?c.green:util>40?'#f59e0b':'#ef4444', borderRadius:99 }}/></div>
                      <span style={{ fontFamily:c.fontM, fontSize:12, fontWeight:700, color:c.text, minWidth:36 }}>{util}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Rental History ────────────────────────────────────────────────────────────
const RENTAL_HISTORY = [
  { id:'RNT-H001', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', equipment:'Mahindra 575 DI Tractor', emoji:'🚜', from:'2026-06-01', to:'2026-06-07', days:7,  revenue:38500, status:'Completed', rating:5, district:'Anuradhapura' },
  { id:'RNT-H002', farmer:'Kamala Silva',    farmerIcon:'👩‍🌾', equipment:'Honda WB30 Water Pump',  emoji:'💧', from:'2026-06-10', to:'2026-06-24', days:14, revenue:25200, status:'Completed', rating:4, district:'Kandy' },
  { id:'RNT-H003', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', equipment:'Kubota DC-70 Harvester', emoji:'🌾', from:'2026-06-15', to:'2026-06-20', days:5,  revenue:42500, status:'Completed', rating:5, district:'Galle' },
  { id:'RNT-H004', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', equipment:'Yamaha KF150 Sprayer',   emoji:'🌿', from:'2026-06-22', to:'2026-06-25', days:3,  revenue:2850,  status:'Completed', rating:4, district:'Jaffna' },
  { id:'RNT-H005', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', equipment:'John Deere 5075E',       emoji:'🏗️', from:'2026-05-18', to:'2026-05-28', days:10, revenue:72000, status:'Completed', rating:3, district:'Batticaloa' },
  { id:'RNT-H006', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', equipment:'Rain Bird Drip System',  emoji:'🚿', from:'2026-05-01', to:'2026-05-31', days:30, revenue:66000, status:'Completed', rating:5, district:'Kurunegala' },
  { id:'RNT-H007', farmer:'Saman Dias',      farmerIcon:'👨‍🌾', equipment:'Mahindra 575 DI Tractor', emoji:'🚜', from:'2026-04-12', to:'2026-04-19', days:7, revenue:38500,  status:'Completed', rating:4, district:'Badulla' },
];

function RentalHistory() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1); const perPage = 5;
  const filtered = useMemo(()=>RENTAL_HISTORY.filter(r=>r.farmer.toLowerCase().includes(search.toLowerCase())||r.equipment.toLowerCase().includes(search.toLowerCase())||r.id.toLowerCase().includes(search.toLowerCase())),[search]);
  const paged = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length/perPage);
  const totalRev = RENTAL_HISTORY.reduce((s,r)=>s+r.revenue,0);
  const avgRating = (RENTAL_HISTORY.reduce((s,r)=>s+r.rating,0)/RENTAL_HISTORY.length).toFixed(1);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:c.fontD, fontSize:18, fontWeight:800, color:c.text, margin:0 }}>Rental History</h2>
          <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:'3px 0 0' }}>{RENTAL_HISTORY.length} completed rentals</p>
        </div>
        <button onClick={() => exportToCSV('rental_history.csv', RENTAL_HISTORY)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:c.surface, color:c.text, border:`1px solid ${c.border}`, borderRadius:8, fontFamily:c.fontB, fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <Download style={{ width:14, height:14 }}/> Export
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Rentals', value:String(RENTAL_HISTORY.length), color:c.green, bg:c.greenLt },
          { label:'Total Revenue',  value:`Rs ${(totalRev/1000).toFixed(0)}K`, color:'#2563eb', bg:'#eff6ff' },
          { label:'Avg Duration',   value:`${Math.round(RENTAL_HISTORY.reduce((s,r)=>s+r.days,0)/RENTAL_HISTORY.length)} days`, color:'#8b5cf6', bg:'#f5f3ff' },
          { label:'Avg Rating',     value:`${avgRating} ⭐`, color:'#f59e0b', bg:'#fffbeb' },
        ].map(s=>(
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'16px', border:`1px solid ${s.color}20` }}>
            <p style={{ fontFamily:c.fontM, fontSize:22, fontWeight:700, color:s.color, margin:'0 0 4px' }}>{s.value}</p>
            <p style={{ fontFamily:c.fontB, fontSize:11, color:c.textSec, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display:'flex', alignItems:'center', gap:8, background:c.surface, border:`1px solid ${c.border}`, borderRadius:9, padding:'7px 12px', marginBottom:16 }}>
        <Search style={{ width:14, height:14, color:c.textTer }}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by farmer, equipment, ID…" style={{ border:'none', outline:'none', fontFamily:c.fontB, fontSize:13, color:c.text, background:'transparent', width:'100%' }}/>
      </div>

      <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, overflow:'hidden', boxShadow:c.shadow }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
            <thead><tr style={{ background:c.bg }}>
              {['Rental ID','Farmer','Equipment','From','To','Days','Revenue','Rating'].map(h=><th key={h} style={{ padding:'11px 20px', fontFamily:c.fontB, fontSize:11, fontWeight:600, color:c.textTer, textAlign:'left', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:`1px solid ${c.border}` }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {paged.map((r,i)=>(
                <tr key={r.id} style={{ borderBottom:i<paged.length-1?`1px solid ${c.borderLt}`:'none' }}>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:12, fontWeight:600, color:c.green }}>{r.id}</td>
                  <td style={{ padding:'13px 20px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:18 }}>{r.farmerIcon}</span><div><p style={{ fontFamily:c.fontB, fontSize:13, fontWeight:600, color:c.text, margin:0 }}>{r.farmer}</p><p style={{ fontFamily:c.fontB, fontSize:11, color:c.textTer, margin:0 }}>{r.district}</p></div></div></td>
                  <td style={{ padding:'13px 20px' }}><div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ fontSize:16 }}>{r.emoji}</span><span style={{ fontFamily:c.fontB, fontSize:12, color:c.textSec }}>{r.equipment}</span></div></td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontB, fontSize:12, color:c.textSec }}>{r.from}</td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontB, fontSize:12, color:c.textSec }}>{r.to}</td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:13, color:c.text }}>{r.days}d</td>
                  <td style={{ padding:'13px 20px', fontFamily:c.fontM, fontSize:13, fontWeight:700, color:c.green }}>Rs {r.revenue.toLocaleString()}</td>
                  <td style={{ padding:'13px 20px' }}><span style={{ fontFamily:c.fontB, fontSize:13 }}>{'⭐'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${c.borderLt}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:c.fontB, fontSize:12, color:c.textTer }}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${c.border}`, background:c.surface, color:page===1?c.textTer:c.text, cursor:page===1?'not-allowed':'pointer', fontFamily:c.fontB, fontSize:12 }}>Prev</button>
            {Array.from({length:totalPages},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${page===i+1?c.green:c.border}`, background:page===i+1?c.green:c.surface, color:page===i+1?'#fff':c.text, cursor:'pointer', fontFamily:c.fontB, fontSize:12 }}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${c.border}`, background:c.surface, color:page===totalPages?c.textTer:c.text, cursor:page===totalPages?'not-allowed':'pointer', fontFamily:c.fontB, fontSize:12 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Messages ─────────────────────────────────────────────────────────────────
const CONVERSATIONS = [
  { id:'c1', name:'Sunil Perera',    icon:'👨‍🌾', lastMsg:"Can I extend the tractor rental by 2 more days?",     time:'10 min ago', unread:2, online:true  },
  { id:'c2', name:'Kamala Silva',    icon:'👩‍🌾', lastMsg:"Thank you! The pump worked perfectly for irrigation.",   time:'1 hr ago',   unread:0, online:false },
  { id:'c3', name:'Nimal Fernando',  icon:'👨‍🌾', lastMsg:"What is the availability for harvester next week?",     time:'3 hr ago',   unread:1, online:true  },
  { id:'c4', name:'Priya Kumar',     icon:'👩‍🌾', lastMsg:"Can you deliver to Jaffna? Extra charge?",              time:'Yesterday',  unread:0, online:false },
  { id:'c5', name:'Rajan Muthu',     icon:'👨‍🌾', lastMsg:"The tractor had an issue — oil leak. Please check.",    time:'Yesterday',  unread:0, online:false },
];

const MESSAGES_BY_CONVO: Record<string,{from:'me'|'them';text:string;time:string}[]> = {
  c1: [
    { from:'them', text:"Hi, I rented the tractor last week. Great service!", time:'9:00 AM' },
    { from:'me',   text:"Thank you Sunil! Glad it helped with your harvest.", time:'9:05 AM' },
    { from:'them', text:"Can I extend the tractor rental by 2 more days?",   time:'10:30 AM' },
  ],
  c3: [
    { from:'them', text:"What is the availability for harvester next week?",  time:'Yesterday 3 PM' },
  ],
};

function Messages() {
  const [active, setActive] = useState('c1');
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(MESSAGES_BY_CONVO);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => ({ ...prev, [active]: [...(prev[active]||[]), { from:'me', text:input.trim(), time:'Just now' }] }));
    setInput('');
  };

  const convo = CONVERSATIONS.find(c=>c.id===active)!;
  const thread = msgs[active] || [];

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:c.fontD, fontSize:18, fontWeight:800, color:c.text, margin:0 }}>Messages</h2>
        <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:'3px 0 0' }}>Chat with farmers about rental requests</p>
      </div>
      <div style={{ display:'flex', gap:0, background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, overflow:'hidden', boxShadow:c.shadow, height:560 }}>
        {/* Sidebar */}
        <div style={{ width:280, flexShrink:0, borderRight:`1px solid ${c.borderLt}`, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.borderLt}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, background:c.bg, borderRadius:8, padding:'7px 10px' }}>
              <Search style={{ width:13, height:13, color:c.textTer }}/><input placeholder="Search conversations…" style={{ border:'none', outline:'none', fontFamily:c.fontB, fontSize:12, color:c.text, background:'transparent', width:'100%' }}/>
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {CONVERSATIONS.map(conv=>(
              <div key={conv.id} onClick={()=>setActive(conv.id)} style={{ display:'flex', gap:10, padding:'12px 16px', cursor:'pointer', background:active===conv.id?c.greenLt:'transparent', borderBottom:`1px solid ${c.borderLt}` }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{conv.icon}</div>
                  {conv.online&&<span style={{ position:'absolute', bottom:0, right:0, width:10, height:10, background:'#22c55e', borderRadius:'50%', border:`2px solid ${c.surface}` }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontFamily:c.fontB, fontSize:13, fontWeight:600, color:c.text }}>{conv.name}</span>
                    <span style={{ fontFamily:c.fontB, fontSize:10, color:c.textTer }}>{conv.time}</span>
                  </div>
                  <p style={{ fontFamily:c.fontB, fontSize:11, color:c.textSec, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.lastMsg}</p>
                </div>
                {conv.unread>0&&<span style={{ alignSelf:'center', minWidth:18, height:18, background:c.green, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:c.fontB, fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{conv.unread}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${c.borderLt}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{convo.icon}</div>
            <div>
              <p style={{ fontFamily:c.fontB, fontSize:14, fontWeight:600, color:c.text, margin:0 }}>{convo.name}</p>
              <p style={{ fontFamily:c.fontB, fontSize:11, color:convo.online?'#22c55e':c.textTer, margin:0 }}>{convo.online?'Online':'Offline'}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
            {thread.length===0&&<p style={{ fontFamily:c.fontB, fontSize:13, color:c.textTer, textAlign:'center', marginTop:40 }}>No messages yet. Say hello! 👋</p>}
            {thread.map((msg,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:msg.from==='me'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'70%', background:msg.from==='me'?c.green:c.bg, color:msg.from==='me'?'#fff':c.text, borderRadius:msg.from==='me'?'16px 16px 4px 16px':'16px 16px 16px 4px', padding:'10px 14px' }}>
                  <p style={{ fontFamily:c.fontB, fontSize:13, margin:0, lineHeight:1.5 }}>{msg.text}</p>
                  <p style={{ fontFamily:c.fontB, fontSize:10, color:msg.from==='me'?'rgba(255,255,255,0.7)':c.textTer, margin:'4px 0 0', textAlign:'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'12px 16px', borderTop:`1px solid ${c.borderLt}`, display:'flex', gap:8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message…" style={{ flex:1, padding:'10px 14px', border:`1px solid ${c.border}`, borderRadius:10, fontFamily:c.fontB, fontSize:13, color:c.text, outline:'none' }}/>
            <button onClick={send} style={{ padding:'10px 20px', background:c.green, color:'#fff', border:'none', borderRadius:10, fontFamily:c.fontB, fontWeight:600, fontSize:13, cursor:'pointer' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
const REVIEWS_DATA = [
  { id:'rv1', farmer:'Sunil Perera',    icon:'👨‍🌾', equipment:'Mahindra 575 DI Tractor', rating:5, date:'2026-07-02', comment:"Excellent tractor! Very clean and well-maintained. The provider was very responsive and helped me on time. Highly recommend!" },
  { id:'rv2', farmer:'Kamala Silva',    icon:'👩‍🌾', equipment:'Honda WB30 Water Pump',  rating:4, date:'2026-06-25', comment:"Good pump, worked well for 2 weeks of irrigation. Small oil leak noticed at the end but it didn't affect performance much." },
  { id:'rv3', farmer:'Nimal Fernando',  icon:'👨‍🌾', equipment:'Kubota DC-70 Harvester', rating:5, date:'2026-06-20', comment:"Amazing harvester! Saved us so much time during paddy season. Very satisfied with the service and will definitely rent again." },
  { id:'rv4', farmer:'Priya Kumar',     icon:'👩‍🌾', equipment:'Yamaha KF150 Sprayer',   rating:4, date:'2026-06-15', comment:"Good sprayer, easy to operate. Delivery was on time and pickup was smooth. Would appreciate more flexible pickup times." },
  { id:'rv5', farmer:'Rajan Muthu',     icon:'👨‍🌾', equipment:'John Deere 5075E',       rating:3, date:'2026-05-28', comment:"Tractor was okay but had some engine noise. The provider did address the issue quickly. Service attitude was good." },
  { id:'rv6', farmer:'Amara Jayaweera', icon:'👩‍🌾', equipment:'Rain Bird Drip System',  rating:5, date:'2026-05-31', comment:"Best drip irrigation system I have used! Covered the entire 2 acres perfectly. Worth every rupee. 10/10 service!" },
];

function Reviews() {
  const avgRating = (REVIEWS_DATA.reduce((s,r)=>s+r.rating,0)/REVIEWS_DATA.length).toFixed(1);
  const dist = [5,4,3,2,1].map(star=>({ star, count:REVIEWS_DATA.filter(r=>r.rating===star).length }));
  const [filter, setFilter] = useState(0);
  const filtered = filter===0 ? REVIEWS_DATA : REVIEWS_DATA.filter(r=>r.rating===filter);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:c.fontD, fontSize:18, fontWeight:800, color:c.text, margin:0 }}>Customer Reviews</h2>
        <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:'3px 0 0' }}>{REVIEWS_DATA.length} reviews from rental customers</p>
      </div>

      {/* Rating overview */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20, background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, padding:24, marginBottom:20, boxShadow:c.shadow }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRight:`1px solid ${c.borderLt}`, paddingRight:20 }}>
          <p style={{ fontFamily:c.fontM, fontSize:52, fontWeight:800, color:c.green, margin:'0 0 4px' }}>{avgRating}</p>
          <p style={{ fontFamily:c.fontB, fontSize:20, margin:'0 0 6px' }}>{'⭐'.repeat(Math.round(Number(avgRating)))}</p>
          <p style={{ fontFamily:c.fontB, fontSize:12, color:c.textSec, margin:0 }}>Based on {REVIEWS_DATA.length} reviews</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:4 }}>
          {dist.map(d=>(
            <div key={d.star} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setFilter(filter===d.star?0:d.star)}>
              <span style={{ fontFamily:c.fontB, fontSize:12, color:c.textSec, width:36 }}>{d.star} ⭐</span>
              <div style={{ flex:1, background:c.borderLt, borderRadius:99, height:8 }}>
                <div style={{ width:`${(d.count/REVIEWS_DATA.length)*100}%`, height:'100%', background:d.star>=4?c.green:d.star===3?'#f59e0b':'#ef4444', borderRadius:99 }}/>
              </div>
              <span style={{ fontFamily:c.fontM, fontSize:12, color:c.text, width:16 }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[{label:'All',val:0},...[5,4,3,2,1].map(s=>({label:`${s} ⭐`,val:s}))].map(f=>(
          <button key={f.val} onClick={()=>setFilter(f.val)} style={{ padding:'6px 14px', borderRadius:99, border:`1px solid ${filter===f.val?c.green:c.border}`, background:filter===f.val?c.green:c.surface, color:filter===f.val?'#fff':c.textSec, fontFamily:c.fontB, fontSize:12, fontWeight:600, cursor:'pointer' }}>{f.label}</button>
        ))}
      </div>

      {/* Review cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {filtered.map(r=>(
          <div key={r.id} style={{ background:c.surface, borderRadius:14, border:`1px solid ${c.border}`, padding:20, boxShadow:c.shadow }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:c.greenLt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontFamily:c.fontB, fontSize:14, fontWeight:700, color:c.text, margin:'0 0 2px' }}>{r.farmer}</p>
                  <p style={{ fontFamily:c.fontB, fontSize:11, color:c.textSec, margin:0 }}>{r.equipment}</p>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:c.fontB, fontSize:16, margin:'0 0 2px' }}>{'⭐'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p>
                <p style={{ fontFamily:c.fontB, fontSize:11, color:c.textTer, margin:0 }}>{r.date}</p>
              </div>
            </div>
            <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:0, lineHeight:1.7, fontStyle:'italic' }}>"{r.comment}"</p>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button style={{ padding:'5px 12px', background:c.greenLt, color:c.green, border:`1px solid ${c.greenBd}`, borderRadius:7, fontFamily:c.fontB, fontSize:12, fontWeight:600, cursor:'pointer' }}>👍 Thank</button>
              <button style={{ padding:'5px 12px', background:c.bg, color:c.textSec, border:`1px solid ${c.border}`, borderRadius:7, fontFamily:c.fontB, fontSize:12, cursor:'pointer' }}>💬 Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function EquipmentSettings() {
  const bizName = localStorage.getItem('businessName') || localStorage.getItem('userName') || 'My Equipment Rental';
  const [profile, setProfile] = useState({ name:bizName, phone:localStorage.getItem('userPhone')||'+94 77 000 0000', email:localStorage.getItem('userEmail')||'', district:localStorage.getItem('userDistrict')||'', description:'Providing quality agricultural equipment rentals to farmers across Sri Lanka.', serviceAreas:'Anuradhapura, Polonnaruwa, Kurunegala' });
  const [pricing, setPricing] = useState({ depositPct:'20', minRentalDays:'1', deliveryCharge:'2500', fuelPolicy:'Full to Full' });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', border:`1px solid ${c.border}`, borderRadius:8, fontFamily:c.fontB, fontSize:14, color:c.text, outline:'none', boxSizing:'border-box' };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:c.fontD, fontSize:18, fontWeight:800, color:c.text, margin:0 }}>Settings</h2>
        <p style={{ fontFamily:c.fontB, fontSize:13, color:c.textSec, margin:'3px 0 0' }}>Manage your business profile and preferences</p>
      </div>

      {saved && (
        <div style={{ background:c.greenLt, border:`1px solid ${c.greenBd}`, borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <CheckCircle style={{ width:16, height:16, color:c.green }}/><span style={{ fontFamily:c.fontB, fontSize:13, color:c.green, fontWeight:600 }}>Changes saved successfully!</span>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {/* Business Profile */}
        <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, padding:24, boxShadow:c.shadow }}>
          <p style={{ fontFamily:c.fontD, fontSize:15, fontWeight:700, color:c.text, margin:'0 0 18px' }}>🏢 Business Profile</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { label:'Business / Provider Name', key:'name' },
              { label:'Phone Number', key:'phone' },
              { label:'Email Address', key:'email' },
              { label:'District', key:'district' },
            ].map(f=>(
              <div key={f.key}>
                <label style={{ display:'block', fontFamily:c.fontB, fontSize:12, fontWeight:500, color:c.textSec, marginBottom:5 }}>{f.label}</label>
                <input value={(profile as any)[f.key]} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} style={inp}/>
              </div>
            ))}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontFamily:c.fontB, fontSize:12, fontWeight:500, color:c.textSec, marginBottom:5 }}>Business Description</label>
              <textarea value={profile.description} onChange={e=>setProfile(p=>({...p,description:e.target.value}))} rows={3} style={{ ...inp, resize:'vertical' }}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontFamily:c.fontB, fontSize:12, fontWeight:500, color:c.textSec, marginBottom:5 }}>Service Areas (districts covered)</label>
              <input value={profile.serviceAreas} onChange={e=>setProfile(p=>({...p,serviceAreas:e.target.value}))} placeholder="e.g. Anuradhapura, Kandy, Polonnaruwa" style={inp}/>
            </div>
          </div>
        </div>

        {/* Pricing Preferences */}
        <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, padding:24, boxShadow:c.shadow }}>
          <p style={{ fontFamily:c.fontD, fontSize:15, fontWeight:700, color:c.text, margin:'0 0 18px' }}>💰 Pricing & Rental Preferences</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { label:'Security Deposit (%)', key:'depositPct', placeholder:'e.g. 20' },
              { label:'Minimum Rental Period (days)', key:'minRentalDays', placeholder:'e.g. 1' },
              { label:'Delivery Charge (Rs)', key:'deliveryCharge', placeholder:'e.g. 2500' },
              { label:'Fuel Policy', key:'fuelPolicy', placeholder:'e.g. Full to Full' },
            ].map(f=>(
              <div key={f.key}>
                <label style={{ display:'block', fontFamily:c.fontB, fontSize:12, fontWeight:500, color:c.textSec, marginBottom:5 }}>{f.label}</label>
                <input value={(pricing as any)[f.key]} placeholder={f.placeholder} onChange={e=>setPricing(p=>({...p,[f.key]:e.target.value}))} style={inp}/>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, padding:24, boxShadow:c.shadow }}>
          <p style={{ fontFamily:c.fontD, fontSize:15, fontWeight:700, color:c.text, margin:'0 0 18px' }}>🔔 Notification Preferences</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'New rental request received', sub:'Get notified when a farmer sends a request' },
              { label:'Booking confirmed',            sub:'When you accept a request' },
              { label:'Maintenance reminder',         sub:'7 days before scheduled maintenance' },
              { label:'Payment received',             sub:'When a farmer completes payment' },
              { label:'New review posted',            sub:'When a customer leaves a review' },
            ].map((n,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:i<4?`1px solid ${c.borderLt}`:'none' }}>
                <div><p style={{ fontFamily:c.fontB, fontSize:13, fontWeight:500, color:c.text, margin:0 }}>{n.label}</p><p style={{ fontFamily:c.fontB, fontSize:11, color:c.textTer, margin:'2px 0 0' }}>{n.sub}</p></div>
                <div onClick={() => {
                  const isChecked = profile[n.label as keyof typeof profile] !== false;
                  setProfile(p => ({...p, [n.label]: !isChecked}));
                }} style={{ width:44, height:24, background:profile[n.label as keyof typeof profile] !== false?c.green:'#e5e7eb', borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:2, left:profile[n.label as keyof typeof profile] !== false?22:2, width:20, height:20, background:'#fff', borderRadius:'50%', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div style={{ background:c.surface, borderRadius:16, border:`1px solid ${c.border}`, padding:24, boxShadow:c.shadow }}>
          <p style={{ fontFamily:c.fontD, fontSize:15, fontWeight:700, color:c.text, margin:'0 0 18px' }}>🔐 Account & Security</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[{label:'Current Password',placeholder:'Enter current password'},{label:'New Password',placeholder:'Enter new password'},{label:'Confirm New Password',placeholder:'Repeat new password'}].map((f,i)=>(
              <div key={i} style={i===2?{gridColumn:'1/-1',maxWidth:'50%'}:{}}>
                <label style={{ display:'block', fontFamily:c.fontB, fontSize:12, fontWeight:500, color:c.textSec, marginBottom:5 }}>{f.label}</label>
                <input type="password" placeholder={f.placeholder} style={inp}/>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={save} style={{ padding:'10px 28px', background:c.green, color:'#fff', border:'none', borderRadius:10, fontFamily:c.fontB, fontWeight:700, fontSize:14, cursor:'pointer' }}>Save All Changes</button>
          <button style={{ padding:'10px 20px', background:c.surface, color:c.text, border:`1px solid ${c.border}`, borderRadius:10, fontFamily:c.fontB, fontSize:14, cursor:'pointer' }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function EquipmentRentalDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState('dashboard');

  const renderSection = () => {
    switch (section) {
      case 'dashboard':    return <DashboardHome setSection={setSection} />;
      case 'equipment':    return <EquipmentSection />;
      case 'requests':     return <RentalRequests />;
      case 'categories':   return <EquipmentCategories />;
      case 'maintenance':  return <MaintenanceSection />;
      case 'history':      return <RentalHistory />;
      case 'analytics':    return <AnalyticsSection />;
      case 'messages':     return <Messages />;
      case 'reviews':      return <Reviews />;
      case 'settings':     return <EquipmentSettings />;
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: 12 }}>
            <span style={{ fontSize: 48 }}>🚧</span>
            <p style={{ fontFamily: c.fontD, fontSize: 18, fontWeight: 700, color: c.text }}>Coming Soon</p>
            <p style={{ fontFamily: c.fontB, fontSize: 14, color: c.textSec }}>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', fontFamily: c.fontB }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={setSection} onNavigate={onNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopNav section={section} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
