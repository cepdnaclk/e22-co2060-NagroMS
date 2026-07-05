import { useEffect, useState } from 'react';
import { EquipmentRentalDashboard } from './EquipmentRentalDashboard';
import { PackagingProviderDashboard } from './PackagingProviderDashboard';
import { FinancialProviderDashboard } from './FinancialProviderDashboard';
import { DeliveryExportDashboard } from './DeliveryExportDashboard';
import { StorageFacilitiesDashboard } from './StorageFacilitiesDashboard';
import {
  Sprout, LogOut, Menu, X, Wrench, Calendar, DollarSign,
  Package, CheckCircle, Clock, TrendingUp, Settings,
  MapPin, Star, Thermometer, Droplets, AlertTriangle,
  BarChart2, Truck, Archive, BoxSelect, Plus,
  LayoutDashboard, FileText, Bell, Search, MessageSquare,
  ChevronLeft, ChevronRight, Users, Activity, Zap,
  ShieldCheck, ExternalLink, ArrowUpRight, ArrowDownRight, Check,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Design tokens (shared with FarmerDashboard) ──────────────────────────────

const ds = {
  fontDisplay: "'Plus Jakarta Sans', sans-serif",
  fontSans:    "'Inter', sans-serif",
  fontMono:    "'JetBrains Mono', monospace",
  bg:          '#f8fafc',
  surface:     '#ffffff',
  border:      '#e2e8f0',
  borderLight: '#f1f5f9',
  text:        '#0f172a',
  textSec:     '#475569',
  textTer:     '#94a3b8',
  green:       '#16a34a',
  greenDk:     '#15803d',
  greenLt:     '#f0fdf4',
  greenBd:     '#dcfce7',
  shadow:      '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
};

// ─── Shared Layout ────────────────────────────────────────────────────────────

function DashboardShell({
  onNavigate, icon, title, subtitle, menuItems, activeTab, setActiveTab, children,
}: {
  onNavigate: (p: string) => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  menuItems: { id: string; label: string; icon: React.ElementType }[];
  activeTab: string;
  setActiveTab: (t: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: ds.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: ds.surface, borderBottom: `1px solid ${ds.border}`, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: ds.green, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
          <div>
            <span style={{ fontFamily: ds.fontDisplay, fontSize: 15, fontWeight: 800, color: ds.text }}>{title}</span>
            <span style={{ fontFamily: ds.fontSans, fontSize: 11, color: ds.textTer, marginLeft: 8 }}>{subtitle}</span>
          </div>
        </div>
        <button onClick={() => onNavigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: ds.fontSans, fontSize: 13, fontWeight: 500, color: ds.textSec, background: 'none', border: `1px solid ${ds.border}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}>
          <LogOut style={{ width: 14, height: 14 }} /> Logout
        </button>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: ds.surface, borderRight: `1px solid ${ds.border}`, padding: '16px 12px', flexShrink: 0, overflowY: 'auto' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2, fontFamily: ds.fontSans, fontSize: 13, fontWeight: active ? 600 : 400, background: active ? ds.green : 'transparent', color: active ? '#fff' : ds.textSec, transition: 'all 0.15s' }}>
                <Icon style={{ width: 15, height: 15 }} />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color = '#16a34a', sub }: { label: string; value: string; icon: React.ReactNode; color?: string; sub?: string }) {
  return (
    <div style={{ background: ds.surface, borderRadius: 12, border: `1px solid ${ds.border}`, padding: '20px 20px 16px', boxShadow: ds.shadow }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontFamily: ds.fontSans, fontSize: 11, fontWeight: 600, color: ds.textTer, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      </div>
      <p style={{ fontFamily: ds.fontMono, fontSize: 26, fontWeight: 700, color: ds.text, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ fontFamily: ds.fontSans, fontSize: 11, color: ds.green, margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE FACILITY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

type UnitStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

interface StorageUnit {
  id: string;
  zone: string;
  size: 'S' | 'M' | 'L';
  status: UnitStatus;
  tempTarget: string;
  contents?: string;
  customer?: string;
  daysLeft?: number;
}

const INITIAL_UNITS: StorageUnit[] = [
  // Zone A – Dry Warehouse
  { id: 'A1', zone: 'A', size: 'L', status: 'occupied', tempTarget: '25-30°C', contents: 'Paddy (50 bags)', customer: 'Sunil Perera', daysLeft: 12 },
  { id: 'A2', zone: 'A', size: 'L', status: 'occupied', tempTarget: '25-30°C', contents: 'Maize (30 bags)', customer: 'Kamala Silva', daysLeft: 5 },
  { id: 'A3', zone: 'A', size: 'L', status: 'available', tempTarget: '25-30°C' },
  { id: 'A4', zone: 'A', size: 'L', status: 'reserved', tempTarget: '25-30°C', customer: 'Nimal Fernando' },
  // Zone B – Cold Room 1
  { id: 'B1', zone: 'B', size: 'M', status: 'occupied', tempTarget: '5-8°C', contents: 'Tomatoes (20 crates)', customer: 'Priya Kumar', daysLeft: 3 },
  { id: 'B2', zone: 'B', size: 'M', status: 'occupied', tempTarget: '5-8°C', contents: 'Beans (15 crates)', customer: 'Amara Jayaweera', daysLeft: 8 },
  { id: 'B3', zone: 'B', size: 'M', status: 'available', tempTarget: '5-8°C' },
  { id: 'B4', zone: 'B', size: 'M', status: 'maintenance', tempTarget: '5-8°C' },
  // Zone C – Cold Room 2
  { id: 'C1', zone: 'C', size: 'M', status: 'occupied', tempTarget: '8-12°C', contents: 'Cabbage (25 crates)', customer: 'Rajan Muthu', daysLeft: 6 },
  { id: 'C2', zone: 'C', size: 'M', status: 'available', tempTarget: '8-12°C' },
  { id: 'C3', zone: 'C', size: 'M', status: 'available', tempTarget: '8-12°C' },
  { id: 'C4', zone: 'C', size: 'M', status: 'occupied', tempTarget: '8-12°C', contents: 'Carrot (18 bags)', customer: 'Sunil Perera', daysLeft: 14 },
  // Zone D – Freezer
  { id: 'D1', zone: 'D', size: 'S', status: 'occupied', tempTarget: '-18 to -15°C', contents: 'Fish (10 crates)', customer: 'Sea Fresh Ltd', daysLeft: 20 },
  { id: 'D2', zone: 'D', size: 'S', status: 'available', tempTarget: '-18 to -15°C' },
  { id: 'D3', zone: 'D', size: 'S', status: 'available', tempTarget: '-18 to -15°C' },
  { id: 'D4', zone: 'D', size: 'S', status: 'maintenance', tempTarget: '-18 to -15°C' },
];

interface ZoneReading {
  zone: string;
  name: string;
  emoji: string;
  currentTemp: number;
  targetMin: number;
  targetMax: number;
  humidity: number;
  targetHumMin: number;
  targetHumMax: number;
}

const ZONE_READINGS: ZoneReading[] = [
  { zone: 'A', name: 'Dry Warehouse', emoji: '🏠', currentTemp: 27, targetMin: 25, targetMax: 30, humidity: 55, targetHumMin: 50, targetHumMax: 60 },
  { zone: 'B', name: 'Cold Room 1', emoji: '🧊', currentTemp: 6.5, targetMin: 5, targetMax: 8, humidity: 87, targetHumMin: 85, targetHumMax: 90 },
  { zone: 'C', name: 'Cold Room 2', emoji: '❄️', currentTemp: 13.2, targetMin: 8, targetMax: 12, humidity: 82, targetHumMin: 80, targetHumMax: 85 },
  { zone: 'D', name: 'Freezer', emoji: '🥶', currentTemp: -16.8, targetMin: -18, targetMax: -15, humidity: 72, targetHumMin: 70, targetHumMax: 75 },
];

const unitStatusStyle: Record<UnitStatus, { bg: string; border: string; label: string; labelColor: string }> = {
  available: { bg: '#f0fdf4', border: '#86efac', label: '✅ Available', labelColor: '#16a34a' },
  occupied: { bg: '#fff7ed', border: '#fdba74', label: '📦 Occupied', labelColor: '#ea580c' },
  maintenance: { bg: '#f3f4f6', border: '#d1d5db', label: '🔧 Maintenance', labelColor: '#6b7280' },
  reserved: { bg: '#eff6ff', border: '#93c5fd', label: '🔒 Reserved', labelColor: '#2563eb' },
};

function StorageDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [units, setUnits] = useState<StorageUnit[]>(INITIAL_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const [reqStatuses, setReqStatuses] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({});

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'requests', label: 'Storage Requests', icon: Clock },
    { id: 'units', label: 'Storage Units', icon: Archive },
    { id: 'temperature', label: 'Temp & Humidity', icon: Thermometer },
    { id: 'rentals', label: 'Active Rentals', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const occupied = units.filter(u => u.status === 'occupied').length;
  const available = units.filter(u => u.status === 'available').length;
  const maintenance = units.filter(u => u.status === 'maintenance').length;
  const tempAlerts = ZONE_READINGS.filter(z => z.currentTemp < z.targetMin || z.currentTemp > z.targetMax);

  const toggleStatus = (id: string) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== id) return u;
      if (u.status === 'available') return { ...u, status: 'maintenance' as UnitStatus };
      if (u.status === 'maintenance') return { ...u, status: 'available' as UnitStatus };
      return u;
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Storage Facility Dashboard</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Monitor your storage facility in real time</p>
            </div>

            {tempAlerts.length > 0 && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#92400e' }}>Temperature Alert</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f' }}>
                    {tempAlerts.map(z => `Zone ${z.zone} (${z.name}): ${z.currentTemp}°C`).join(' · ')} — outside target range
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Total Units" value={String(units.length)} icon={<Archive style={{ width: 18, height: 18 }} />} />
              <StatCard label="Occupied" value={String(occupied)} icon={<Package style={{ width: 18, height: 18 }} />} color="#ea580c" />
              <StatCard label="Available" value={String(available)} icon={<CheckCircle style={{ width: 18, height: 18 }} />} color="#16a34a" />
              <StatCard label="Maintenance" value={String(maintenance)} icon={<Wrench style={{ width: 18, height: 18 }} />} color="#6b7280" />
              <StatCard label="Monthly Revenue" value="Rs 185,000" icon={<DollarSign style={{ width: 18, height: 18 }} />} sub="+11% this month" />
            </div>

            {/* Zone overview */}
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0', fontWeight: 600 }}>Zone Temperature Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem' }}>
                {ZONE_READINGS.map(z => {
                  const tempOk = z.currentTemp >= z.targetMin && z.currentTemp <= z.targetMax;
                  return (
                    <div key={z.zone} style={{ background: tempOk ? '#f0fdf4' : '#fef3c7', borderRadius: '0.625rem', padding: '0.875rem', border: `1px solid ${tempOk ? '#bbf7d0' : '#fcd34d'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{z.emoji}</span>
                        <strong style={{ fontSize: '0.875rem' }}>Zone {z.zone} — {z.name}</strong>
                      </div>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: '#374151' }}>
                        🌡 {z.currentTemp}°C
                        <span style={{ color: tempOk ? '#16a34a' : '#dc2626', marginLeft: '0.5rem', fontWeight: 600 }}>
                          {tempOk ? '✓ OK' : '⚠ Alert'}
                        </span>
                      </p>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: '#6b7280' }}>💧 {z.humidity}% humidity</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Occupancy bar */}
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 0.75rem 0', fontWeight: 600 }}>Overall Occupancy</h3>
              <div style={{ background: '#f3f4f6', borderRadius: '0.5rem', height: 16, overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${(occupied / units.length) * 100}%`, background: 'linear-gradient(to right,#16a34a,#22c55e)', borderRadius: '0.5rem' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{occupied} of {units.length} units occupied ({Math.round((occupied / units.length) * 100)}%)</p>
            </div>
          </div>
        );

      case 'requests': {
        // Sample incoming storage requests
        const storageRequests = [
          { id: 'SR001', farmer: 'Ranjith Bandara', phone: '+94 77 234 5678', district: 'Anuradhapura', type: 'dry', typeLabel: 'Dry Warehouse', typeEmoji: '🏠', spaceNeeded: 40, spaceUnit: 'bags', duration: '2 months', product: 'Paddy', date: '2026-07-08', urgent: false },
          { id: 'SR002', farmer: 'Preethi Herath', phone: '+94 71 345 6789', district: 'Kandy', type: 'cold', typeLabel: 'Cold Room', typeEmoji: '🧊', spaceNeeded: 15, spaceUnit: 'crates', duration: '1 month', product: 'Tomatoes & Beans', date: '2026-07-07', urgent: true },
          { id: 'SR003', farmer: 'Lasith Mendis', phone: '+94 76 456 7890', district: 'Badulla', type: 'freezer', typeLabel: 'Freezer', typeEmoji: '🥶', spaceNeeded: 8, spaceUnit: 'crates', duration: '3 months', product: 'Frozen Fish', date: '2026-07-06', urgent: false },
          { id: 'SR004', farmer: 'Chamari Senanayake', phone: '+94 70 567 8901', district: 'Kurunegala', type: 'dry', typeLabel: 'Dry Warehouse', typeEmoji: '🏠', spaceNeeded: 80, spaceUnit: 'bags', duration: '6 months', product: 'Maize & Soya', date: '2026-07-05', urgent: false },
        ];

        // Check availability per type
        const dryAvail = units.filter(u => u.zone === 'A' && u.status === 'available').length;
        const coldAvail = units.filter(u => (u.zone === 'B' || u.zone === 'C') && u.status === 'available').length;
        const freezerAvail = units.filter(u => u.zone === 'D' && u.status === 'available').length;

        // Capacity per unit (bags for dry, crates for cold/freezer)
        const DRY_UNIT_CAPACITY = 200; // bags per large unit
        const COLD_UNIT_CAPACITY = 100; // crates per medium unit
        const FREEZER_UNIT_CAPACITY = 50; // crates per small unit

        const checkAvailability = (req: typeof storageRequests[0]) => {
          if (req.type === 'dry') {
            const totalCap = dryAvail * DRY_UNIT_CAPACITY;
            return { enough: totalCap >= req.spaceNeeded, availableUnits: dryAvail, totalCap };
          }
          if (req.type === 'cold') {
            const totalCap = coldAvail * COLD_UNIT_CAPACITY;
            return { enough: totalCap >= req.spaceNeeded, availableUnits: coldAvail, totalCap };
          }
          const totalCap = freezerAvail * FREEZER_UNIT_CAPACITY;
          return { enough: totalCap >= req.spaceNeeded, availableUnits: freezerAvail, totalCap };
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Storage Requests</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Farmers requesting storage space — check availability before accepting</p>
            </div>

            {/* Availability summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Dry Warehouse', emoji: '🏠', avail: dryAvail, zone: 'Zone A' },
                { label: 'Cold Rooms', emoji: '🧊', avail: coldAvail, zone: 'Zone B & C' },
                { label: 'Freezer', emoji: '🥶', avail: freezerAvail, zone: 'Zone D' },
              ].map(z => (
                <div key={z.label} style={{ background: '#fff', border: '1px solid #dcfce7', borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{z.emoji}</div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>{z.label}</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{z.zone}</p>
                  <p style={{ margin: '0.35rem 0 0', fontWeight: 800, fontSize: '1.2rem', color: z.avail > 0 ? '#16a34a' : '#dc2626' }}>{z.avail} free</p>
                </div>
              ))}
            </div>

            {storageRequests.map(req => {
              const avail = checkAvailability(req);
              const status = reqStatuses[req.id] || 'pending';
              const typeColor = req.type === 'dry' ? '#92400e' : req.type === 'cold' ? '#1e40af' : '#1e3a5f';
              const typeBg = req.type === 'dry' ? '#fef3c7' : req.type === 'cold' ? '#dbeafe' : '#e0f2fe';

              return (
                <div key={req.id} style={{
                  background: '#fff', borderRadius: '1rem',
                  border: `2px solid ${status === 'accepted' ? '#86efac' : status === 'declined' ? '#fecaca' : req.urgent ? '#fdba74' : '#e5e7eb'}`,
                  padding: '1.5rem', position: 'relative',
                }}>
                  {req.urgent && status === 'pending' && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: '#92400e', fontWeight: 700 }}>
                      ⚡ Urgent
                    </div>
                  )}

                  {/* Request header */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '2.5rem', background: typeBg, borderRadius: '0.625rem', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {req.typeEmoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '1rem' }}>#{req.id}</strong>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: typeBg, color: typeColor, fontWeight: 700 }}>
                          {req.typeLabel}
                        </span>
                        {status !== 'pending' && (
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: status === 'accepted' ? '#f0fdf4' : '#fef2f2', color: status === 'accepted' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                            {status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>👤 {req.farmer}</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>📞 {req.phone} &nbsp;·&nbsp; 📍 {req.district}</p>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {[
                      { icon: '📦', label: 'Product', value: req.product },
                      { icon: '📐', label: 'Space Needed', value: `${req.spaceNeeded} ${req.spaceUnit}` },
                      { icon: '⏳', label: 'Duration', value: req.duration },
                      { icon: '📅', label: 'Requested On', value: req.date },
                    ].map(d => (
                      <div key={d.label} style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>{d.icon} {d.label}</p>
                        <p style={{ margin: '0.15rem 0 0', fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Availability check */}
                  <div style={{
                    background: avail.enough ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${avail.enough ? '#86efac' : '#fecaca'}`,
                    borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{avail.enough ? '✅' : '❌'}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: avail.enough ? '#16a34a' : '#dc2626' }}>
                        {avail.enough ? 'Space Available' : 'Not Enough Space'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                        {avail.availableUnits} {req.typeLabel} unit{avail.availableUnits !== 1 ? 's' : ''} free · capacity {avail.totalCap} {req.spaceUnit} · requested {req.spaceNeeded} {req.spaceUnit}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => setReqStatuses(p => ({ ...p, [req.id]: 'accepted' }))}
                        disabled={!avail.enough}
                        style={{ flex: 1, padding: '0.65rem', background: avail.enough ? '#16a34a' : '#d1d5db', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: avail.enough ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.9rem' }}
                      >
                        ✅ Accept Request
                      </button>
                      <button
                        onClick={() => setReqStatuses(p => ({ ...p, [req.id]: 'declined' }))}
                        style={{ flex: 1, padding: '0.65rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                      >
                        ❌ Decline
                      </button>
                    </div>
                  )}
                  {status === 'accepted' && (
                    <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>
                      ✅ You accepted this request. Contact {req.farmer} to confirm check-in.
                    </p>
                  )}
                  {status === 'declined' && (
                    <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>
                      ❌ Request declined. The farmer will be notified.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'units':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Storage Units</h2>
                <p style={{ color: '#6b7280', margin: 0 }}>Click a unit to view details or change status</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(unitStatusStyle).map(([key, val]) => (
                  <span key={key} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: val.bg, border: `1px solid ${val.border}`, color: val.labelColor }}>
                    {val.label}
                  </span>
                ))}
              </div>
            </div>

            {['A', 'B', 'C', 'D'].map(zone => {
              const zoneInfo = ZONE_READINGS.find(z => z.zone === zone)!;
              const zoneUnits = units.filter(u => u.zone === zone);
              return (
                <div key={zone} style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{zoneInfo.emoji}</span>
                    <div>
                      <h3 style={{ fontWeight: 700, color: '#16a34a', margin: 0 }}>Zone {zone} — {zoneInfo.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Target: {zoneInfo.targetMin}°C – {zoneInfo.targetMax}°C • Size: {zoneUnits[0]?.size === 'L' ? 'Large (500 bags)' : zoneUnits[0]?.size === 'M' ? 'Medium (200 crates)' : 'Small (50 crates)'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem' }}>
                    {zoneUnits.map(unit => {
                      const st = unitStatusStyle[unit.status];
                      return (
                        <div
                          key={unit.id}
                          onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
                          style={{
                            background: st.bg, border: `2px solid ${selectedUnit?.id === unit.id ? '#16a34a' : st.border}`,
                            borderRadius: '0.625rem', padding: '0.875rem', cursor: 'pointer',
                            boxShadow: selectedUnit?.id === unit.id ? '0 0 0 3px #bbf7d0' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <strong style={{ fontSize: '1rem' }}>Unit {unit.id}</strong>
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: 99, background: '#e5e7eb', color: '#374151' }}>{unit.size}</span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: st.labelColor, fontWeight: 600, margin: '0.2rem 0' }}>{st.label}</p>
                          {unit.contents && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0.2rem 0' }}>📦 {unit.contents}</p>}
                          {unit.customer && <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0.2rem 0' }}>👤 {unit.customer}</p>}
                          {unit.daysLeft !== undefined && (
                            <p style={{ fontSize: '0.72rem', color: unit.daysLeft <= 5 ? '#dc2626' : '#16a34a', margin: '0.2rem 0', fontWeight: 600 }}>
                              ⏱ {unit.daysLeft} days left
                            </p>
                          )}
                          {(unit.status === 'available' || unit.status === 'maintenance') && (
                            <button
                              onClick={e => { e.stopPropagation(); toggleStatus(unit.id); }}
                              style={{ marginTop: '0.5rem', width: '100%', padding: '0.3rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.7rem', color: '#374151' }}
                            >
                              {unit.status === 'available' ? '🔧 Set Maintenance' : '✅ Mark Available'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'temperature':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Temperature & Humidity Monitor</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Live readings from all storage zones</p>
            </div>

            {tempAlerts.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle style={{ width: 18, height: 18, color: '#dc2626' }} />
                  <strong style={{ color: '#dc2626' }}>Active Alerts</strong>
                </div>
                {tempAlerts.map(z => (
                  <p key={z.zone} style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                    ⚠ Zone {z.zone} ({z.name}): {z.currentTemp}°C — target {z.targetMin}°C to {z.targetMax}°C
                  </p>
                ))}
              </div>
            )}

            {ZONE_READINGS.map(z => {
              const tempOk = z.currentTemp >= z.targetMin && z.currentTemp <= z.targetMax;
              const humOk = z.humidity >= z.targetHumMin && z.humidity <= z.targetHumMax;
              const tempPct = Math.min(100, Math.max(0, ((z.currentTemp - z.targetMin + 5) / (z.targetMax - z.targetMin + 10)) * 100));
              const humPct = Math.min(100, Math.max(0, ((z.humidity - z.targetHumMin + 5) / (z.targetHumMax - z.targetHumMin + 10)) * 100));

              return (
                <div key={z.zone} style={{ background: '#fff', borderRadius: '0.75rem', border: `1px solid ${tempOk && humOk ? '#dcfce7' : '#fecaca'}`, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>{z.emoji}</span>
                      <div>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Zone {z.zone} — {z.name}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Target: {z.targetMin}°C to {z.targetMax}°C</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
                      background: tempOk && humOk ? '#dcfce7' : '#fef2f2',
                      color: tempOk && humOk ? '#16a34a' : '#dc2626',
                    }}>
                      {tempOk && humOk ? '✓ Normal' : '⚠ Alert'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Temperature */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Thermometer style={{ width: 16, height: 16, color: tempOk ? '#16a34a' : '#dc2626' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Temperature</span>
                        </div>
                        <strong style={{ color: tempOk ? '#16a34a' : '#dc2626', fontSize: '1.1rem' }}>{z.currentTemp}°C</strong>
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${tempPct}%`, background: tempOk ? '#22c55e' : '#ef4444', borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Range: {z.targetMin}°C – {z.targetMax}°C</p>
                    </div>

                    {/* Humidity */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Droplets style={{ width: 16, height: 16, color: humOk ? '#2563eb' : '#dc2626' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Humidity</span>
                        </div>
                        <strong style={{ color: humOk ? '#2563eb' : '#dc2626', fontSize: '1.1rem' }}>{z.humidity}%</strong>
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${humPct}%`, background: humOk ? '#3b82f6' : '#ef4444', borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Range: {z.targetHumMin}% – {z.targetHumMax}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'rentals':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Active Rentals</h2>
                <p style={{ color: '#6b7280', margin: 0 }}>Farmers currently renting your storage</p>
              </div>
              <button style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                + New Rental
              </button>
            </div>

            {units.filter(u => u.status === 'occupied').map(unit => {
              const zoneInfo = ZONE_READINGS.find(z => z.zone === unit.zone)!;
              const urgent = (unit.daysLeft ?? 99) <= 5;
              return (
                <div key={unit.id} style={{ background: '#fff', borderRadius: '0.75rem', border: `1px solid ${urgent ? '#fecaca' : '#dcfce7'}`, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ background: urgent ? '#fef2f2' : '#f0fdf4', borderRadius: '0.625rem', padding: '0.75rem', fontSize: '1.6rem', minWidth: 52, textAlign: 'center' }}>
                        {zoneInfo.emoji}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <strong>Unit {unit.id}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>— {zoneInfo.name}</span>
                        </div>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#374151' }}>👤 {unit.customer}</p>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#374151' }}>📦 {unit.contents}</p>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: '#6b7280' }}>🌡 Storage: {zoneInfo.currentTemp}°C (target {unit.tempTarget})</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#16a34a' }}>
                        Rs {unit.size === 'L' ? '500/bag/mo' : unit.size === 'M' ? '800/crate/mo' : '300/unit/mo'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: urgent ? '#dc2626' : '#6b7280', fontWeight: urgent ? 700 : 400 }}>
                        ⏱ {unit.daysLeft} days remaining
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                        <button style={{ padding: '0.35rem 0.75rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Extend
                        </button>
                        <button style={{ padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                          End Rental
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {units.filter(u => u.status === 'reserved').map(unit => (
              <div key={unit.id} style={{ background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Unit {unit.id} — Reserved</p>
                  <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>👤 {unit.customer} (pending check-in)</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.35rem 0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>Confirm</button>
                  <button style={{ padding: '0.35rem 0.75rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'earnings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Earnings</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Revenue from storage rentals</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Today" value="Rs 6,200" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+5% vs yesterday" />
              <StatCard label="This Week" value="Rs 42,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+9% vs last week" />
              <StatCard label="This Month" value="Rs 185,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+11% vs last month" />
            </div>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0', fontWeight: 600 }}>Recent Payments</h3>
              {[
                { customer: 'Sunil Perera', unit: 'A1', amount: '+Rs 25,000', date: '2026-07-01', type: 'Monthly Rental' },
                { customer: 'Priya Kumar', unit: 'B1', amount: '+Rs 16,000', date: '2026-06-30', type: 'Monthly Rental' },
                { customer: 'Amara Jayaweera', unit: 'B2', amount: '+Rs 12,000', date: '2026-06-29', type: 'Monthly Rental' },
                { customer: 'Rajan Muthu', unit: 'C1', amount: '+Rs 16,000', date: '2026-06-28', type: 'Monthly Rental' },
                { customer: 'Sea Fresh Ltd', unit: 'D1', amount: '+Rs 15,000', date: '2026-06-27', type: 'Monthly Rental' },
              ].map((tx, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: '#f0fdf4', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{tx.customer} — Unit {tx.unit}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{tx.type} • {tx.date}</p>
                  </div>
                  <strong style={{ color: '#16a34a' }}>{tx.amount}</strong>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Settings</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Manage your facility details</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Facility Name', defaultValue: 'Green Valley Cold Storage' },
                { label: 'Contact Number', defaultValue: '+94 77 456 7890' },
                { label: 'Location / Address', defaultValue: 'Nuwara Eliya, Sri Lanka' },
                { label: 'Total Capacity', defaultValue: '16 units (4 zones)' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input type="text" defaultValue={f.defaultValue} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button style={{ padding: '0.625rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
                Save Changes
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <DashboardShell
      onNavigate={onNavigate}
      icon={<Archive style={{ width: 22, height: 22, color: '#fff' }} />}
      title="NagroMS"
      subtitle="Storage Facility Portal"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </DashboardShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EQUIPMENT RENTAL DASHBOARD (existing flow, cleaned up)
// ═══════════════════════════════════════════════════════════════════════════════

function EquipmentDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceCategory, setServiceCategory] = useState('equipment');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'bookings', label: 'Booking Requests', icon: Calendar },
    { id: 'services', label: 'My Equipment', icon: Package },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const bookingRequests = [
    { id: 1, farmer: 'Sunil Perera', service: 'Tractor Rental', date: '2026-07-10', location: 'Anuradhapura', status: 'pending' },
    { id: 2, farmer: 'Kamala Silva', service: 'Plowing Service', date: '2026-07-11', location: 'Polonnaruwa', status: 'pending' },
    { id: 3, farmer: 'Nimal Fernando', service: 'Harvester Rental', date: '2026-07-12', location: 'Kurunegala', status: 'confirmed' },
  ];

  const equipment = [
    { id: 1, name: 'Tractor', emoji: '🚜', rate: 'Rs 5,000/day', available: true, bookings: 12 },
    { id: 2, name: 'Harvester', emoji: '🌾', rate: 'Rs 8,000/day', available: false, bookings: 15 },
    { id: 3, name: 'Water Pump', emoji: '💧', rate: 'Rs 1,500/day', available: true, bookings: 20 },
    { id: 4, name: 'Sprayer', emoji: '🌿', rate: 'Rs 800/day', available: true, bookings: 9 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Equipment Rental Dashboard</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Manage your equipment & bookings</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Pending Requests" value="5" icon={<Clock style={{ width: 18, height: 18 }} />} color="#ea580c" />
              <StatCard label="Active Bookings" value="12" icon={<CheckCircle style={{ width: 18, height: 18 }} />} />
              <StatCard label="Month Earnings" value="Rs 245,000" icon={<DollarSign style={{ width: 18, height: 18 }} />} sub="+15% this month" />
            </div>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0' }}>Recent Bookings</h3>
              {bookingRequests.slice(0, 3).map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: '#f0fdf4', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{b.farmer} — {b.service}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{b.date} • {b.location}</p>
                  </div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', background: b.status === 'pending' ? '#fff7ed' : '#f0fdf4', color: b.status === 'pending' ? '#ea580c' : '#16a34a' }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Booking Requests</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Manage incoming service requests</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', overflow: 'hidden' }}>
              {bookingRequests.map(b => (
                <div key={b.id} style={{ padding: '1.25rem', borderBottom: '1px solid #f0fdf4' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, margin: '0 0 0.4rem 0' }}>{b.service}</h3>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.85rem', color: '#6b7280' }}>👤 {b.farmer}</p>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.85rem', color: '#6b7280' }}>📅 {b.date} &nbsp;📍 {b.location}</p>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', background: b.status === 'pending' ? '#fff7ed' : '#f0fdf4', color: b.status === 'pending' ? '#ea580c' : '#16a34a' }}>
                      {b.status}
                    </span>
                  </div>
                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button style={{ flex: 1, padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Accept</button>
                      <button style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'services':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>My Equipment</h2>
              <button style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
              {equipment.map(eq => (
                <div key={eq.id} style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{eq.emoji}</div>
                  <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{eq.name}</h3>
                  <p style={{ color: '#16a34a', fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{eq.rate}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 99, background: eq.available ? '#f0fdf4' : '#fef2f2', color: eq.available ? '#16a34a' : '#dc2626' }}>
                      {eq.available ? '✅ Available' : '❌ Unavailable'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>📋 {eq.bookings} bookings</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ flex: 1, padding: '0.35rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                    <button style={{ padding: '0.35rem 0.6rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      {eq.available ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Earnings</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Track your revenue</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Today" value="Rs 12,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+12% vs yesterday" />
              <StatCard label="This Week" value="Rs 65,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+8% vs last week" />
              <StatCard label="This Month" value="Rs 245,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+15% vs last month" />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '1rem' }}>Settings</h2>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Business Name</label><input defaultValue="Green Valley Services" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Contact</label><input defaultValue="+94 77 123 4567" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <button style={{ padding: '0.625rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start' }}>Save</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <DashboardShell
      onNavigate={onNavigate}
      icon={<Wrench style={{ width: 22, height: 22, color: '#fff' }} />}
      title="NagroMS"
      subtitle="Equipment Rental Portal"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </DashboardShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY & EXPORT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function DeliveryDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'deliveries', label: 'Active Deliveries', icon: Truck },
    { id: 'requests', label: 'New Requests', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const deliveries = [
    { id: 'D001', from: 'Anuradhapura Farm', to: 'Colombo Manning Market', contents: 'Paddy — 50 bags', status: 'in-transit', driver: 'Asanka', eta: '2h 30min', type: '🚛' },
    { id: 'D002', from: 'Kurunegala', to: 'Keells Super, Kandy', contents: 'Vegetables — 20 crates', status: 'loading', driver: 'Ruwan', eta: 'Departs 3pm', type: '🚚' },
    { id: 'D003', from: 'Badulla', to: 'BIA Export Terminal', contents: 'Cinnamon — 5 tons', status: 'delivered', driver: 'Chamara', eta: 'Completed', type: '✈️' },
  ];

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    'in-transit': { bg: '#fff7ed', color: '#ea580c', label: '🟠 In Transit' },
    loading: { bg: '#eff6ff', color: '#2563eb', label: '🔵 Loading' },
    delivered: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Delivered' },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Delivery & Export Dashboard</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Track your fleet and deliveries</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="In Transit" value="3" icon={<Truck style={{ width: 18, height: 18 }} />} color="#ea580c" />
              <StatCard label="Completed Today" value="7" icon={<CheckCircle style={{ width: 18, height: 18 }} />} />
              <StatCard label="Month Revenue" value="Rs 310,000" icon={<DollarSign style={{ width: 18, height: 18 }} />} sub="+18% this month" />
            </div>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0' }}>Active Deliveries</h3>
              {deliveries.map(d => {
                const s = statusStyle[d.status];
                return (
                  <div key={d.id} style={{ display: 'flex', gap: '1rem', padding: '0.875rem', background: s.bg, borderRadius: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem' }}>{d.type}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{d.from} → {d.to}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>📦 {d.contents} &nbsp;👤 {d.driver}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 99, background: '#fff', color: s.color, fontWeight: 600 }}>{s.label}</span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>ETA: {d.eta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'deliveries':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>Active Deliveries</h2>
            {deliveries.map(d => {
              const s = statusStyle[d.status];
              return (
                <div key={d.id} style={{ background: '#fff', borderRadius: '0.75rem', border: `1px solid ${d.status === 'in-transit' ? '#fdba74' : '#dcfce7'}`, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem', background: s.bg, borderRadius: '0.5rem', padding: '0.5rem', alignSelf: 'flex-start' }}>{d.type}</div>
                      <div>
                        <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0' }}>#{d.id}</p>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.875rem' }}>📍 {d.from} → {d.to}</p>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#6b7280' }}>📦 {d.contents}</p>
                        <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#6b7280' }}>👤 Driver: {d.driver}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>ETA: {d.eta}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 'requests':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '1rem' }}>New Delivery Requests</h2>
            {[
              { farmer: 'Sunil Perera', from: 'Anuradhapura', to: 'Colombo', date: '2026-07-05', load: '30 bags of paddy', rate: 'Rs 1,200' },
              { farmer: 'Kamala Silva', from: 'Kurunegala', to: 'Kandy', date: '2026-07-06', load: '10 crates of vegetables', rate: 'Rs 800' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>👤 {r.farmer}</p>
                    <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#6b7280' }}>📍 {r.from} → {r.to}</p>
                    <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#6b7280' }}>📦 {r.load} &nbsp;📅 {r.date}</p>
                  </div>
                  <strong style={{ color: '#16a34a' }}>{r.rate}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button style={{ flex: 1, padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Accept</button>
                  <button style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'earnings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>Earnings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Today" value="Rs 8,400" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+20% vs yesterday" />
              <StatCard label="This Week" value="Rs 52,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+14% vs last week" />
              <StatCard label="This Month" value="Rs 310,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+18% vs last month" />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '1rem' }}>Settings</h2>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Company Name</label><input defaultValue="Swift Agro Logistics" style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Fleet Size</label><input defaultValue="4 lorries, 2 vans" style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <button style={{ padding: '0.625rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start' }}>Save</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <DashboardShell onNavigate={onNavigate} icon={<Truck style={{ width: 22, height: 22, color: '#fff' }} />} title="NagroMS" subtitle="Delivery & Export Portal" menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PACKAGING DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface Material { name: string; stock: number; unit: string; lowThreshold: number; }

function PackagingDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Order Queue', icon: BoxSelect },
    { id: 'materials', label: 'Materials Stock', icon: Archive },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const orders = [
    { id: 'PK001', farmer: 'Sunil Perera', type: 'Bag & Seal', qty: 200, product: 'Rice', status: 'in-progress', due: 'Today 4pm' },
    { id: 'PK002', farmer: 'Kamala Silva', type: 'Carton Packing', qty: 50, product: 'Vegetables', status: 'pending', due: 'Tomorrow 10am' },
    { id: 'PK003', farmer: 'Nimal Fernando', type: 'Vacuum Sealing', qty: 80, product: 'Spices', status: 'completed', due: 'Completed' },
  ];

  const [materials, setMaterials] = useState<Material[]>([
    { name: 'Polythene Bags (1kg)', stock: 2400, unit: 'pcs', lowThreshold: 200 },
    { name: 'Woven Bags (50kg)', stock: 300, unit: 'pcs', lowThreshold: 50 },
    { name: 'Export Cartons', stock: 45, unit: 'pcs', lowThreshold: 50 },
    { name: 'Labels (custom)', stock: 800, unit: 'pcs', lowThreshold: 100 },
    { name: 'Vacuum Pouches', stock: 120, unit: 'pcs', lowThreshold: 150 },
    { name: 'Crates (wooden)', stock: 30, unit: 'pcs', lowThreshold: 40 },
  ]);

  // track the "use amount" and "restock amount" input per material
  const [useAmt, setUseAmt] = useState<Record<string, string>>({});
  const [addAmt, setAddAmt] = useState<Record<string, string>>({});

  const recordUse = (name: string) => {
    const qty = parseInt(useAmt[name] || '0', 10);
    if (!qty || qty <= 0) return;
    setMaterials(prev => prev.map(m => m.name === name ? { ...m, stock: Math.max(0, m.stock - qty) } : m));
    setUseAmt(prev => ({ ...prev, [name]: '' }));
  };

  const recordRestock = (name: string) => {
    const qty = parseInt(addAmt[name] || '0', 10);
    if (!qty || qty <= 0) return;
    setMaterials(prev => prev.map(m => m.name === name ? { ...m, stock: m.stock + qty } : m));
    setAddAmt(prev => ({ ...prev, [name]: '' }));
  };

  const orderStatus: Record<string, { bg: string; color: string; label: string }> = {
    'in-progress': { bg: '#eff6ff', color: '#2563eb', label: '🔵 In Progress' },
    pending: { bg: '#fff7ed', color: '#ea580c', label: '🟠 Pending' },
    completed: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Completed' },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Packaging Dashboard</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Manage packing orders and materials</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Pending Orders" value="4" icon={<Clock style={{ width: 18, height: 18 }} />} color="#ea580c" />
              <StatCard label="In Progress" value="2" icon={<Package style={{ width: 18, height: 18 }} />} color="#2563eb" />
              <StatCard label="Completed Today" value="11" icon={<CheckCircle style={{ width: 18, height: 18 }} />} />
              <StatCard label="Month Revenue" value="Rs 145,000" icon={<DollarSign style={{ width: 18, height: 18 }} />} sub="+9% this month" />
            </div>
            {materials.some(m => m.stock <= m.lowThreshold) && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle style={{ width: 18, height: 18, color: '#d97706' }} />
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                  Low stock alert: {materials.filter(m => m.stock <= m.lowThreshold).map(m => m.name).join(', ')}
                </p>
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.25rem' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0' }}>Recent Orders</h3>
              {orders.map(o => {
                const s = orderStatus[o.status];
                return (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: s.bg, borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.2rem 0' }}>#{o.id} — {o.type}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>👤 {o.farmer} · 📦 {o.qty}× {o.product} · ⏱ {o.due}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 99, background: '#fff', color: s.color, fontWeight: 600 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>Order Queue</h2>
              <button style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>+ New Order</button>
            </div>
            {orders.map(o => {
              const s = orderStatus[o.status];
              return (
                <div key={o.id} style={{ background: '#fff', borderRadius: '0.75rem', border: `1px solid ${o.status === 'pending' ? '#fdba74' : '#dcfce7'}`, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0' }}>#{o.id}</p>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.875rem' }}>🗂 {o.type} &nbsp;&nbsp; 📦 {o.qty}× {o.product}</p>
                      <p style={{ margin: '0.15rem 0', fontSize: '0.875rem', color: '#6b7280' }}>👤 {o.farmer} · ⏱ {o.due}</p>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  {o.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {o.status === 'pending' && <button style={{ flex: 1, padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Start Packing</button>}
                      {o.status === 'in-progress' && <button style={{ flex: 1, padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Mark Complete</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      case 'materials':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: '0 0 0.25rem 0' }}>Materials Stock</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Track usage and restock your packaging materials</p>
            </div>

            {materials.some(m => m.stock <= m.lowThreshold) && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle style={{ width: 18, height: 18, color: '#d97706', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                  Low stock: {materials.filter(m => m.stock <= m.lowThreshold).map(m => m.name).join(', ')}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
              {materials.map(m => {
                const isLow = m.stock <= m.lowThreshold;
                const pct = Math.min(100, (m.stock / (m.lowThreshold * 5)) * 100);
                return (
                  <div key={m.name} style={{ background: '#fff', borderRadius: '0.875rem', border: `2px solid ${isLow ? '#fecaca' : '#dcfce7'}`, padding: '1.25rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem', color: '#111827' }}>{m.name}</p>
                      {isLow
                        ? <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>⚠ Low Stock</span>
                        : <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 99, fontWeight: 700 }}>✓ OK</span>
                      }
                    </div>

                    {/* Stock count */}
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: isLow ? '#dc2626' : '#16a34a', margin: '0 0 0.2rem 0', lineHeight: 1 }}>{m.stock}</p>
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 0.625rem 0' }}>{m.unit} in stock · alert below {m.lowThreshold}</p>

                    {/* Stock bar */}
                    <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6, marginBottom: '1rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isLow ? '#ef4444' : '#22c55e', borderRadius: 99 }} />
                    </div>

                    {/* Record Usage */}
                    <div style={{ marginBottom: '0.625rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.3rem 0', fontWeight: 600 }}>📤 Record Usage</p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="number"
                          min="1"
                          placeholder="qty used"
                          value={useAmt[m.name] || ''}
                          onChange={e => setUseAmt(prev => ({ ...prev, [m.name]: e.target.value }))}
                          style={{ flex: 1, padding: '0.4rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none' }}
                        />
                        <button
                          onClick={() => recordUse(m.name)}
                          style={{ padding: '0.4rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          − Use
                        </button>
                      </div>
                    </div>

                    {/* Restock */}
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.3rem 0', fontWeight: 600 }}>📥 Restock</p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="number"
                          min="1"
                          placeholder="qty added"
                          value={addAmt[m.name] || ''}
                          onChange={e => setAddAmt(prev => ({ ...prev, [m.name]: e.target.value }))}
                          style={{ flex: 1, padding: '0.4rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.4rem', fontSize: '0.85rem', outline: 'none' }}
                        />
                        <button
                          onClick={() => recordRestock(m.name)}
                          style={{ padding: '0.4rem 0.75rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>Earnings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
              <StatCard label="Today" value="Rs 4,800" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+6% vs yesterday" />
              <StatCard label="This Week" value="Rs 32,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+10% vs last week" />
              <StatCard label="This Month" value="Rs 145,000" icon={<DollarSign style={{ width: 16, height: 16 }} />} sub="+9% vs last month" />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '1rem' }}>Settings</h2>
            <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #dcfce7', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Business Name</label><input defaultValue="AgroPack Solutions" style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.4rem' }}>Location</label><input defaultValue="Colombo, Sri Lanka" style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1fae5', borderRadius: '0.5rem', boxSizing: 'border-box' }} /></div>
              <button style={{ padding: '0.625rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start' }}>Save</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <DashboardShell onNavigate={onNavigate} icon={<Package style={{ width: 22, height: 22, color: '#fff' }} />} title="NagroMS" subtitle="Packaging Services Portal" menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL SERVICES DASHBOARD — Bank (business) & Individual lender
// ═══════════════════════════════════════════════════════════════════════════════

// ── Shared financial types ────────────────────────────────────────────────────

interface LoanProduct {
  id: number; emoji: string; name: string;
  minAmount: number; maxAmount: number;
  interestRate: string; tenure: string; description: string; active: boolean;
}

interface LoanApplication {
  id: string; farmer: string; icon: string; district: string; phone: string;
  loanType: string; amount: number; purpose: string; date: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
}

interface LoanRepayment {
  id: string; farmer: string; icon: string; district: string; phone: string;
  loanType: string; totalAmount: number; monthlyInstallment: number;
  paidThisMonth: number; totalPaid: number; outstanding: number;
  startDate: string; nextDue: string; status: 'on-time' | 'overdue' | 'completed';
  history: { month: string; amount: number; date: string }[];
}

const INIT_APPLICATIONS: LoanApplication[] = [
  { id: 'LA-001', farmer: 'Sunil Perera', icon: '👨', district: 'Anuradhapura', phone: '0771234567', loanType: 'Crop Development Loan', amount: 45000, purpose: 'Paddy cultivation — 2 acres', date: '2026-07-04', status: 'pending' },
  { id: 'LA-002', farmer: 'Kamala Silva', icon: '👩', district: 'Kandy', phone: '0812223344', loanType: 'Equipment Finance', amount: 120000, purpose: 'Water pump & drip irrigation system', date: '2026-07-03', status: 'pending' },
  { id: 'LA-003', farmer: 'Nimal Fernando', icon: '👨', district: 'Polonnaruwa', phone: '0913334455', loanType: 'Crop Development Loan', amount: 28000, purpose: 'Vegetable cultivation — tomatoes & beans', date: '2026-07-01', status: 'approved' },
  { id: 'LA-004', farmer: 'Priya Kumar', icon: '👩', district: 'Batticaloa', phone: '0654445566', loanType: 'Crop Development Loan', amount: 60000, purpose: 'Rice cultivation — 3 acres', date: '2026-06-28', status: 'disbursed' },
  { id: 'LA-005', farmer: 'Rajan Muthu', icon: '👨', district: 'Jaffna', phone: '0214445566', loanType: 'Equipment Finance', amount: 85000, purpose: 'Tractor hire-purchase', date: '2026-06-25', status: 'disbursed' },
];

const INIT_REPAYMENTS: LoanRepayment[] = [
  {
    id: 'LR-001', farmer: 'Priya Kumar', icon: '👩', district: 'Batticaloa', phone: '0654445566',
    loanType: 'Crop Development Loan', totalAmount: 60000, monthlyInstallment: 5500,
    paidThisMonth: 5500, totalPaid: 22000, outstanding: 38000,
    startDate: '2026-04-01', nextDue: '2026-08-01', status: 'on-time',
    history: [
      { month: 'April 2026', amount: 5500, date: '2026-04-02' },
      { month: 'May 2026', amount: 5500, date: '2026-05-03' },
      { month: 'June 2026', amount: 5500, date: '2026-06-01' },
      { month: 'July 2026', amount: 5500, date: '2026-07-02' },
    ],
  },
  {
    id: 'LR-002', farmer: 'Rajan Muthu', icon: '👨', district: 'Jaffna', phone: '0214445566',
    loanType: 'Equipment Finance', totalAmount: 85000, monthlyInstallment: 8000,
    paidThisMonth: 0, totalPaid: 16000, outstanding: 69000,
    startDate: '2026-05-01', nextDue: '2026-07-01', status: 'overdue',
    history: [
      { month: 'May 2026', amount: 8000, date: '2026-05-02' },
      { month: 'June 2026', amount: 8000, date: '2026-06-04' },
    ],
  },
];

const appStatusStyle: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#fef3c7', color: '#d97706', label: '⏳ Pending' },
  approved: { bg: '#eff6ff', color: '#2563eb', label: '✅ Approved' },
  rejected: { bg: '#fef2f2', color: '#dc2626', label: '❌ Rejected' },
  disbursed:{ bg: '#f0fdf4', color: '#16a34a', label: '💸 Disbursed' },
};

const finInp: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem',
  border: '1.5px solid #a5f3fc', borderRadius: '0.5rem',
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function LoanApplicationsTab({ applications, setApplications }: {
  applications: LoanApplication[];
  setApplications: React.Dispatch<React.SetStateAction<LoanApplication[]>>;
}) {
  const update = (id: string, status: LoanApplication['status']) =>
    setApplications(p => p.map(a => a.id === id ? { ...a, status } : a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {applications.map(app => {
        const s = appStatusStyle[app.status];
        return (
          <div key={app.id} style={{ background: '#fff', borderRadius: '0.875rem', border: `2px solid ${app.status === 'pending' ? '#fcd34d' : app.status === 'approved' ? '#bfdbfe' : app.status === 'disbursed' ? '#86efac' : '#fecaca'}`, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem' }}>{app.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.95rem' }}>{app.farmer}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>📍 {app.district} · 📞 {app.phone} · 📅 {app.date}</p>
                </div>
              </div>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: 99, fontWeight: 700, fontSize: '0.78rem', background: s.bg, color: s.color }}>{s.label}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { icon: '📋', label: 'Loan Type', value: app.loanType },
                { icon: '💰', label: 'Amount', value: `Rs ${app.amount.toLocaleString()}` },
                { icon: '🌱', label: 'Purpose', value: app.purpose },
              ].map(d => (
                <div key={d.label} style={{ background: '#f9fafb', borderRadius: '0.4rem', padding: '0.4rem 0.65rem' }}>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ca3af' }}>{d.icon} {d.label}</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#111827' }}>{d.value}</p>
                </div>
              ))}
            </div>
            {app.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button onClick={() => update(app.id, 'approved')} style={{ flex: 1, padding: '0.55rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>✅ Approve</button>
                <button onClick={() => update(app.id, 'rejected')} style={{ flex: 1, padding: '0.55rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>❌ Reject</button>
              </div>
            )}
            {app.status === 'approved' && (
              <button onClick={() => update(app.id, 'disbursed')} style={{ width: '100%', padding: '0.55rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>💸 Mark as Disbursed</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RepaymentTrackerTab({ repayments, setRepayments }: {
  repayments: LoanRepayment[];
  setRepayments: React.Dispatch<React.SetStateAction<LoanRepayment[]>>;
}) {
  const [recording, setRecording] = useState<string | null>(null);
  const [paymentAmt, setPaymentAmt] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const recordPayment = (id: string) => {
    const amt = parseInt(paymentAmt);
    if (!amt || amt <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setRepayments(prev => prev.map(r => {
      if (r.id !== id) return r;
      const newPaid = r.totalPaid + amt;
      const newOutstanding = Math.max(0, r.totalAmount - newPaid);
      return {
        ...r,
        paidThisMonth: r.paidThisMonth + amt,
        totalPaid: newPaid,
        outstanding: newOutstanding,
        status: newOutstanding === 0 ? 'completed' : 'on-time',
        history: [...r.history, { month, amount: amt, date: today }],
      };
    }));
    setPaymentAmt('');
    setRecording(null);
  };

  const totalOutstanding = repayments.reduce((s, r) => s + r.outstanding, 0);
  const totalCollectedThisMonth = repayments.reduce((s, r) => s + r.paidThisMonth, 0);
  const overdueCount = repayments.filter(r => r.status === 'overdue').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Collected This Month', value: `Rs ${totalCollectedThisMonth.toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4', icon: '💰' },
          { label: 'Total Outstanding', value: `Rs ${totalOutstanding.toLocaleString()}`, color: '#d97706', bg: '#fef3c7', icon: '📊' },
          { label: 'Overdue Accounts', value: String(overdueCount), color: '#dc2626', bg: '#fef2f2', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${s.color}30` }}>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>{s.icon} {s.label}</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Repayment cards */}
      {repayments.map(r => {
        const pct = Math.round((r.totalPaid / r.totalAmount) * 100);
        const isOverdue = r.status === 'overdue';
        const isCompleted = r.status === 'completed';
        return (
          <div key={r.id} style={{ background: '#fff', borderRadius: '1rem', border: `2px solid ${isOverdue ? '#fecaca' : isCompleted ? '#86efac' : '#a5f3fc'}`, padding: '1.25rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.95rem' }}>{r.farmer}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>📍 {r.district} · 📞 {r.phone}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700, background: isOverdue ? '#fef2f2' : isCompleted ? '#f0fdf4' : '#ecfeff', color: isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#0891b2' }}>
                  {isOverdue ? '⚠ Overdue' : isCompleted ? '✅ Completed' : '✓ On Time'}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { icon: '🏷️', label: 'Loan Type', value: r.loanType },
                { icon: '💰', label: 'Total Loan', value: `Rs ${r.totalAmount.toLocaleString()}` },
                { icon: '📅', label: 'Monthly Instalment', value: `Rs ${r.monthlyInstallment.toLocaleString()}` },
                { icon: '✅', label: 'Paid This Month', value: `Rs ${r.paidThisMonth.toLocaleString()}`, highlight: r.paidThisMonth >= r.monthlyInstallment },
                { icon: '📊', label: 'Total Paid', value: `Rs ${r.totalPaid.toLocaleString()}` },
                { icon: '⏳', label: 'Outstanding', value: `Rs ${r.outstanding.toLocaleString()}`, red: true },
                { icon: '📆', label: 'Next Due', value: r.nextDue, warn: isOverdue },
                { icon: '🗓️', label: 'Start Date', value: r.startDate },
              ].map(d => (
                <div key={d.label} style={{ background: d.red ? '#fef2f2' : d.highlight ? '#f0fdf4' : d.warn ? '#fef3c7' : '#f9fafb', borderRadius: '0.4rem', padding: '0.4rem 0.65rem' }}>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ca3af' }}>{d.icon} {d.label}</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: d.red ? '#dc2626' : d.highlight ? '#16a34a' : d.warn ? '#d97706' : '#111827' }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Repayment Progress</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0891b2' }}>{pct}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: isCompleted ? '#16a34a' : isOverdue ? '#ef4444' : '#0891b2', borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {!isCompleted && (
                <button
                  onClick={() => { setRecording(recording === r.id ? null : r.id); setPaymentAmt(''); }}
                  style={{ padding: '0.45rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  💳 Record Payment
                </button>
              )}
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                style={{ padding: '0.45rem 1rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                {expanded === r.id ? '▲ Hide History' : '▼ Payment History'}
              </button>
            </div>

            {/* Record payment form */}
            {recording === r.id && (
              <div style={{ marginTop: '0.875rem', background: '#ecfeff', borderRadius: '0.625rem', padding: '0.875rem', border: '1px solid #a5f3fc' }}>
                <p style={{ fontWeight: 700, color: '#0891b2', margin: '0 0 0.625rem' }}>💳 Record Payment for {r.farmer}</p>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>Monthly instalment: <strong>Rs {r.monthlyInstallment.toLocaleString()}</strong></p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number" placeholder="Enter amount received (Rs)" value={paymentAmt}
                    onChange={e => setPaymentAmt(e.target.value)}
                    style={{ ...finInp, flex: 1 }}
                  />
                  <button onClick={() => recordPayment(r.id)} style={{ padding: '0.55rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ✓ Save
                  </button>
                  <button onClick={() => setRecording(null)} style={{ padding: '0.55rem 0.875rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Payment history */}
            {expanded === r.id && (
              <div style={{ marginTop: '0.875rem', background: '#f9fafb', borderRadius: '0.625rem', padding: '0.875rem', border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.625rem', fontSize: '0.875rem' }}>📜 Payment History</p>
                {r.history.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.82rem', margin: 0 }}>No payments recorded yet.</p>}
                {r.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: i < r.history.length - 1 ? '1px dashed #e5e7eb' : 'none', fontSize: '0.82rem' }}>
                    <span style={{ color: '#374151' }}>📅 {h.month} <span style={{ color: '#9ca3af' }}>({h.date})</span></span>
                    <strong style={{ color: '#16a34a' }}>Rs {h.amount.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── BANK Dashboard (business account) ────────────────────────────────────────

function BankDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<LoanApplication[]>(INIT_APPLICATIONS);
  const [repayments, setRepayments] = useState<LoanRepayment[]>(INIT_REPAYMENTS);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([
    { id: 1, emoji: '🌾', name: 'Crop Development Loan', minAmount: 25000, maxAmount: 500000, interestRate: '7.5%', tenure: '6–60 months', description: 'Seasonal crop cultivation funding', active: true },
    { id: 2, emoji: '🚜', name: 'Equipment Finance', minAmount: 50000, maxAmount: 2000000, interestRate: '8.0%', tenure: '12–84 months', description: 'Tractors, pumps and farm machinery', active: true },
    { id: 3, emoji: '🏗️', name: 'Greenhouse Loan', minAmount: 100000, maxAmount: 5000000, interestRate: '6.5%', tenure: '24–120 months', description: 'Greenhouse & protected agriculture setup', active: false },
  ]);
  const [newLoan, setNewLoan] = useState({ emoji: '💰', name: '', minAmount: '', maxAmount: '', interestRate: '', tenure: '', description: '' });

  // Bank profile from localStorage
  const bankName = localStorage.getItem('businessName') || 'My Bank';
  const bankRegNo = localStorage.getItem('businessRegNo') || '—';
  const contactPerson = localStorage.getItem('contactPersonName') || '—';

  // Bank-specific settings state
  const [bankProfile, setBankProfile] = useState({
    bankName, branch: 'Main Branch — Colombo', swiftCode: 'BCEYLKLX', hotline: '+94 11 200 0000',
    regNo: bankRegNo, contactPerson, agriLicenseNo: 'CBL-AGRI-2024-0012',
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Loan Products', icon: Package },
    { id: 'applications', label: 'Applications', icon: Calendar },
    { id: 'repayments', label: 'Repayment Tracker', icon: DollarSign },
    { id: 'settings', label: 'Bank Profile', icon: Settings },
  ];

  const pending = applications.filter(a => a.status === 'pending').length;
  const active = repayments.filter(r => r.status !== 'completed').length;
  const totalOutstanding = repayments.reduce((s, r) => s + r.outstanding, 0);
  const collectedThisMonth = repayments.reduce((s, r) => s + r.paidThisMonth, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>🏦 {bankProfile.bankName}</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>{bankProfile.branch} · Agri Loan Division</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Loan Products', value: String(loanProducts.filter(l => l.active).length), icon: '📋', color: '#0891b2', bg: '#ecfeff' },
                { label: 'Pending Applications', value: String(pending), icon: '⏳', color: '#d97706', bg: '#fef3c7' },
                { label: 'Active Loans', value: String(active), icon: '💸', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Collected This Month', value: `Rs ${collectedThisMonth.toLocaleString()}`, icon: '💰', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Total Outstanding', value: `Rs ${totalOutstanding.toLocaleString()}`, icon: '📊', color: '#d97706', bg: '#fef3c7' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${s.color}30` }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>{s.icon} {s.label}</p>
                  <p style={{ margin: '0.2rem 0 0', fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Overdue alert */}
            {repayments.some(r => r.status === 'overdue') && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle style={{ width: 20, height: 20, color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#dc2626' }}>Overdue Repayments</strong>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d' }}>
                    {repayments.filter(r => r.status === 'overdue').map(r => r.farmer).join(', ')} — payment past due date
                  </p>
                </div>
              </div>
            )}

            {/* Recent applications */}
            <div style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #a5f3fc', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0891b2', margin: '0 0 0.875rem' }}>Recent Applications</h3>
              {applications.slice(0, 3).map(a => {
                const s = appStatusStyle[a.status];
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: s.bg, borderRadius: '0.5rem', marginBottom: '0.4rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{a.icon} {a.farmer} — {a.loanType}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>Rs {a.amount.toLocaleString()} · {a.district} · {a.date}</p>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: '#fff', color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'products':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Loan Products</h2>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Agricultural loan schemes offered by your bank</p>
              </div>
              <button onClick={() => setShowAddLoan(!showAddLoan)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.625rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                <Plus style={{ width: 16, height: 16 }} /> Add Loan Product
              </button>
            </div>

            {showAddLoan && (
              <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '0.875rem', padding: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#0891b2', margin: '0 0 0.875rem' }}>➕ New Loan Product</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  {[
                    { label: 'Emoji', key: 'emoji', placeholder: '💰' },
                    { label: 'Product Name', key: 'name', placeholder: 'e.g. Land Development Loan' },
                    { label: 'Min Amount (Rs)', key: 'minAmount', placeholder: '25000', type: 'number' },
                    { label: 'Max Amount (Rs)', key: 'maxAmount', placeholder: '1000000', type: 'number' },
                    { label: 'Interest Rate (% p.a.)', key: 'interestRate', placeholder: 'e.g. 7.5%' },
                    { label: 'Tenure', key: 'tenure', placeholder: 'e.g. 12–60 months' },
                    { label: 'Description', key: 'description', placeholder: 'Brief description' },
                  ].map(f => (
                    <div key={f.key} style={f.key === 'description' ? { gridColumn: '1/-1' } : {}}>
                      <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>{f.label}</label>
                      <input type={f.type || 'text'} value={(newLoan as any)[f.key]} placeholder={f.placeholder}
                        onChange={e => setNewLoan(p => ({ ...p, [f.key]: e.target.value }))} style={finInp} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => {
                    if (!newLoan.name) return;
                    setLoanProducts(p => [...p, { id: Date.now(), emoji: newLoan.emoji, name: newLoan.name, minAmount: parseInt(newLoan.minAmount) || 0, maxAmount: parseInt(newLoan.maxAmount) || 0, interestRate: newLoan.interestRate, tenure: newLoan.tenure, description: newLoan.description, active: true }]);
                    setNewLoan({ emoji: '💰', name: '', minAmount: '', maxAmount: '', interestRate: '', tenure: '', description: '' });
                    setShowAddLoan(false);
                  }} style={{ flex: 1, padding: '0.55rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Save</button>
                  <button onClick={() => setShowAddLoan(false)} style={{ padding: '0.55rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {loanProducts.map(loan => (
                <div key={loan.id} style={{ background: '#fff', borderRadius: '0.875rem', border: `2px solid ${loan.active ? '#a5f3fc' : '#e5e7eb'}`, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '2rem', background: '#ecfeff', borderRadius: '0.625rem', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{loan.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{loan.name}</h3>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: loan.active ? '#f0fdf4' : '#fef2f2', color: loan.active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {loan.active ? '✅ Active' : '⏸ Paused'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>{loan.description}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#ecfeff', color: '#0891b2', borderRadius: 99, fontWeight: 600 }}>💰 Rs {loan.minAmount.toLocaleString()} – Rs {loan.maxAmount.toLocaleString()}</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#fef3c7', color: '#d97706', borderRadius: 99, fontWeight: 600 }}>📈 {loan.interestRate} p.a.</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 99, fontWeight: 600 }}>📅 {loan.tenure}</span>
                    </div>
                  </div>
                  <button onClick={() => setLoanProducts(p => p.map(l => l.id === loan.id ? { ...l, active: !l.active } : l))} style={{ padding: '0.4rem 0.875rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>
                    {loan.active ? '⏸ Pause' : '▶ Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'applications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Loan Applications</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Farmers applying for your loan products</p>
            </div>
            <LoanApplicationsTab applications={applications} setApplications={setApplications} />
          </div>
        );

      case 'repayments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Repayment Tracker</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Track monthly repayments per farmer — record payments and view history</p>
            </div>
            <RepaymentTrackerTab repayments={repayments} setRepayments={setRepayments} />
          </div>
        );

      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Bank Profile</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Manage your bank's details visible to farmers</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #a5f3fc', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Bank Name', key: 'bankName' },
                { label: 'Branch / Division', key: 'branch' },
                { label: 'SWIFT / BIC Code', key: 'swiftCode' },
                { label: 'Agri License Number', key: 'agriLicenseNo' },
                { label: 'Business Reg. No.', key: 'regNo' },
                { label: 'Contact Person', key: 'contactPerson' },
                { label: 'Hotline Number', key: 'hotline' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 600 }}>{f.label}</label>
                  <input value={(bankProfile as any)[f.key]}
                    onChange={e => setBankProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ ...finInp, border: '1.5px solid #d1fae5' }} />
                </div>
              ))}
              <button style={{ padding: '0.625rem 1.5rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' }}>Save Changes</button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <DashboardShell onNavigate={onNavigate} icon={<DollarSign style={{ width: 22, height: 22, color: '#fff' }} />}
      title={bankProfile.bankName} subtitle="Agricultural Loan Division"
      menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardShell>
  );
}

// ── INDIVIDUAL LENDER Dashboard ───────────────────────────────────────────────

function IndividualLenderDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<LoanApplication[]>(INIT_APPLICATIONS.slice(0, 3));
  const [repayments, setRepayments] = useState<LoanRepayment[]>(INIT_REPAYMENTS);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([
    { id: 1, emoji: '🌱', name: 'Short-term Crop Loan', minAmount: 5000, maxAmount: 100000, interestRate: '10%', tenure: '3–12 months', description: 'Quick cash for seasonal farming needs', active: true },
    { id: 2, emoji: '🚜', name: 'Equipment Loan', minAmount: 20000, maxAmount: 300000, interestRate: '11.5%', tenure: '12–36 months', description: 'Buy farm tools & small machinery', active: true },
  ]);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [newLoan, setNewLoan] = useState({ emoji: '💰', name: '', minAmount: '', maxAmount: '', interestRate: '', tenure: '', description: '' });

  const lenderName = localStorage.getItem('userName') || 'My Profile';
  const [profile, setProfile] = useState({
    name: lenderName,
    district: localStorage.getItem('userDistrict') || '—',
    phone: localStorage.getItem('userPhone') || '—',
    availableAmount: '500000',
    collateral: 'Flexible — crop yield or guarantor',
    speciality: 'Paddy & vegetable cultivation loans',
    nicNo: localStorage.getItem('userNIC') || '—',
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'My Loan Terms', icon: Package },
    { id: 'applications', label: 'Applications', icon: Calendar },
    { id: 'repayments', label: 'Repayment Tracker', icon: DollarSign },
    { id: 'settings', label: 'My Profile', icon: Settings },
  ];

  const pending = applications.filter(a => a.status === 'pending').length;
  const active = repayments.filter(r => r.status !== 'completed').length;
  const totalOutstanding = repayments.reduce((s, r) => s + r.outstanding, 0);
  const collectedThisMonth = repayments.reduce((s, r) => s + r.paidThisMonth, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>👤 {profile.name}</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Individual Lender · 📍 {profile.district}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Available to Lend', value: `Rs ${parseInt(profile.availableAmount).toLocaleString()}`, icon: '💳', color: '#0891b2', bg: '#ecfeff' },
                { label: 'Pending Applications', value: String(pending), icon: '⏳', color: '#d97706', bg: '#fef3c7' },
                { label: 'Active Loans', value: String(active), icon: '💸', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Collected This Month', value: `Rs ${collectedThisMonth.toLocaleString()}`, icon: '💰', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Total Outstanding', value: `Rs ${totalOutstanding.toLocaleString()}`, icon: '📊', color: '#d97706', bg: '#fef3c7' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${s.color}30` }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>{s.icon} {s.label}</p>
                  <p style={{ margin: '0.2rem 0 0', fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {repayments.some(r => r.status === 'overdue') && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle style={{ width: 18, height: 18, color: '#dc2626', flexShrink: 0 }} />
                <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.875rem' }}>
                  <strong>Overdue:</strong> {repayments.filter(r => r.status === 'overdue').map(r => r.farmer).join(', ')} — payment past due
                </p>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #a5f3fc', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0891b2', margin: '0 0 0.875rem' }}>Recent Applications</h3>
              {applications.slice(0, 3).map(a => {
                const s = appStatusStyle[a.status];
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: s.bg, borderRadius: '0.5rem', marginBottom: '0.4rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{a.icon} {a.farmer} — Rs {a.amount.toLocaleString()}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>{a.purpose} · {a.district}</p>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: '#fff', color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'products':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>My Loan Terms</h2>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Loan offerings visible to farmers on NagroMS</p>
              </div>
              <button onClick={() => setShowAddLoan(!showAddLoan)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.625rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                <Plus style={{ width: 16, height: 16 }} /> Add Loan Type
              </button>
            </div>

            {showAddLoan && (
              <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '0.875rem', padding: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#0891b2', margin: '0 0 0.875rem' }}>➕ New Loan Type</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  {[
                    { label: 'Emoji', key: 'emoji', placeholder: '💰' },
                    { label: 'Loan Name', key: 'name', placeholder: 'e.g. Vegetable Crop Loan' },
                    { label: 'Min (Rs)', key: 'minAmount', placeholder: '5000', type: 'number' },
                    { label: 'Max (Rs)', key: 'maxAmount', placeholder: '200000', type: 'number' },
                    { label: 'Interest Rate', key: 'interestRate', placeholder: 'e.g. 10%' },
                    { label: 'Tenure', key: 'tenure', placeholder: 'e.g. 3–12 months' },
                    { label: 'Description', key: 'description', placeholder: 'Brief description' },
                  ].map(f => (
                    <div key={f.key} style={f.key === 'description' ? { gridColumn: '1/-1' } : {}}>
                      <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>{f.label}</label>
                      <input type={f.type || 'text'} value={(newLoan as any)[f.key]} placeholder={f.placeholder}
                        onChange={e => setNewLoan(p => ({ ...p, [f.key]: e.target.value }))} style={finInp} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => {
                    if (!newLoan.name) return;
                    setLoanProducts(p => [...p, { id: Date.now(), emoji: newLoan.emoji, name: newLoan.name, minAmount: parseInt(newLoan.minAmount) || 0, maxAmount: parseInt(newLoan.maxAmount) || 0, interestRate: newLoan.interestRate, tenure: newLoan.tenure, description: newLoan.description, active: true }]);
                    setNewLoan({ emoji: '💰', name: '', minAmount: '', maxAmount: '', interestRate: '', tenure: '', description: '' });
                    setShowAddLoan(false);
                  }} style={{ flex: 1, padding: '0.55rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Save</button>
                  <button onClick={() => setShowAddLoan(false)} style={{ padding: '0.55rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {loanProducts.map(loan => (
                <div key={loan.id} style={{ background: '#fff', borderRadius: '0.875rem', border: `2px solid ${loan.active ? '#a5f3fc' : '#e5e7eb'}`, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '2rem', background: '#ecfeff', borderRadius: '0.625rem', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{loan.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, margin: 0 }}>{loan.name}</h3>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: loan.active ? '#f0fdf4' : '#fef2f2', color: loan.active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{loan.active ? '✅ Active' : '⏸ Paused'}</span>
                    </div>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: '#6b7280' }}>{loan.description}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#ecfeff', color: '#0891b2', borderRadius: 99, fontWeight: 600 }}>💰 Rs {loan.minAmount.toLocaleString()} – Rs {loan.maxAmount.toLocaleString()}</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#fef3c7', color: '#d97706', borderRadius: 99, fontWeight: 600 }}>📈 {loan.interestRate} p.a.</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 99, fontWeight: 600 }}>📅 {loan.tenure}</span>
                    </div>
                  </div>
                  <button onClick={() => setLoanProducts(p => p.map(l => l.id === loan.id ? { ...l, active: !l.active } : l))} style={{ padding: '0.4rem 0.875rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>
                    {loan.active ? '⏸ Pause' : '▶ Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'applications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Loan Applications</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Farmers requesting loans from you</p>
            </div>
            <LoanApplicationsTab applications={applications} setApplications={setApplications} />
          </div>
        );

      case 'repayments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>Repayment Tracker</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Track how much each farmer has paid — record payments and view history</p>
            </div>
            <RepaymentTrackerTab repayments={repayments} setRepayments={setRepayments} />
          </div>
        );

      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0891b2', margin: '0 0 0.25rem' }}>My Lender Profile</h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.85rem' }}>Your details shown to farmers when browsing lenders</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #a5f3fc', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Full Name', key: 'name' },
                { label: 'District', key: 'district' },
                { label: 'Phone Number', key: 'phone' },
                { label: 'NIC Number', key: 'nicNo' },
                { label: 'Available Amount to Lend (Rs)', key: 'availableAmount' },
                { label: 'Collateral Accepted', key: 'collateral' },
                { label: 'Speciality / Focus Area', key: 'speciality' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 600 }}>{f.label}</label>
                  <input value={(profile as any)[f.key]}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ ...finInp, border: '1.5px solid #d1fae5' }} />
                </div>
              ))}
              <button style={{ padding: '0.625rem 1.5rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' }}>Save Changes</button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <DashboardShell onNavigate={onNavigate} icon={<DollarSign style={{ width: 22, height: 22, color: '#fff' }} />}
      title="NagroMS" subtitle="Individual Lender Portal"
      menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardShell>
  );
}

// ── Router: picks Bank or Individual based on account type ────────────────────
function FinancialDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const accountType = localStorage.getItem('userAccountType') || 'individual';
  if (accountType === 'business') return <BankDashboard onNavigate={onNavigate} />;
  return <IndividualLenderDashboard onNavigate={onNavigate} />;
}


// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const MONTHLY_REQ = [
  { month: 'Jan', requests: 42, completed: 38 },
  { month: 'Feb', requests: 58, completed: 51 },
  { month: 'Mar', requests: 65, completed: 60 },
  { month: 'Apr', requests: 79, completed: 70 },
  { month: 'May', requests: 88, completed: 82 },
  { month: 'Jun', requests: 102, completed: 94 },
  { month: 'Jul', requests: 87, completed: 0 },
];

const REVENUE_DATA = [
  { month: 'Jan', revenue: 85, expenses: 42 },
  { month: 'Feb', revenue: 122, expenses: 55 },
  { month: 'Mar', revenue: 165, expenses: 78 },
  { month: 'Apr', revenue: 198, expenses: 88 },
  { month: 'May', revenue: 242, expenses: 102 },
  { month: 'Jun', revenue: 285, expenses: 115 },
  { month: 'Jul', revenue: 318, expenses: 125 },
];

const CATEGORY_DIST = [
  { name: 'Equipment', value: 35, color: '#16a34a' },
  { name: 'Storage', value: 25, color: '#0891b2' },
  { name: 'Delivery', value: 20, color: '#7c3aed' },
  { name: 'Packaging', value: 12, color: '#d97706' },
  { name: 'Financial', value: 8, color: '#dc2626' },
];

const REQUESTS_TABLE = [
  { id: 'REQ-2851', farmer: 'Sunil Perera', type: 'Equipment Rental', date: '2026-07-05', location: 'Anuradhapura', status: 'pending' },
  { id: 'REQ-2850', farmer: 'Kamala Silva', type: 'Storage Facility', date: '2026-07-04', location: 'Kandy', status: 'in-progress' },
  { id: 'REQ-2849', farmer: 'Nimal Fernando', type: 'Delivery & Export', date: '2026-07-04', location: 'Galle', status: 'accepted' },
  { id: 'REQ-2848', farmer: 'Priya Kumar', type: 'Packaging', date: '2026-07-03', location: 'Batticaloa', status: 'completed' },
  { id: 'REQ-2847', farmer: 'Rajan Muthu', type: 'Financial', date: '2026-07-03', location: 'Jaffna', status: 'pending' },
  { id: 'REQ-2846', farmer: 'Amara Jayaweera', type: 'Equipment Rental', date: '2026-07-02', location: 'Kurunegala', status: 'completed' },
  { id: 'REQ-2845', farmer: 'Saman Dias', type: 'Storage Facility', date: '2026-07-02', location: 'Polonnaruwa', status: 'rejected' },
  { id: 'REQ-2844', farmer: 'Lasith Mendis', type: 'Delivery & Export', date: '2026-07-01', location: 'Badulla', status: 'completed' },
];

const ACTIVITY_FEED = [
  { time: '2 min ago', icon: '🆕', text: 'New request from Sunil Perera', type: 'request', color: '#16a34a' },
  { time: '18 min ago', icon: '✅', text: 'Delivery for Amara Jayaweera marked complete', type: 'complete', color: '#0891b2' },
  { time: '1 hr ago', icon: '⭐', text: 'Priya Kumar left a 5-star review', type: 'review', color: '#d97706' },
  { time: '2 hr ago', icon: '💬', text: 'New message from Nimal Fernando', type: 'message', color: '#7c3aed' },
  { time: '3 hr ago', icon: '📦', text: 'Packaging order PK-0088 dispatched', type: 'update', color: '#ea580c' },
  { time: '5 hr ago', icon: '💰', text: 'Payment received — Rs 45,000', type: 'payment', color: '#16a34a' },
];

const TASKS_TODAY = [
  { done: false, text: 'Respond to 3 pending equipment requests' },
  { done: true,  text: 'Update storage unit availability' },
  { done: false, text: 'Review loan application LA-002' },
  { done: true,  text: 'Confirm delivery with Nimal Fernando' },
  { done: false, text: 'Upload invoice for REQ-2849' },
];

const SERVICE_CATEGORIES = [
  {
    id: 'delivery', emoji: '🚚', title: 'Delivery & Export',
    gradient: 'linear-gradient(135deg,#0f766e,#0891b2)',
    desc: 'Transport produce from farms to markets, supermarkets and export terminals.',
    features: ['Manage delivery requests', 'Real-time shipment tracking', 'Update delivery status'],
  },
  {
    id: 'equipment', emoji: '🚜', title: 'Equipment Rental',
    gradient: 'linear-gradient(135deg,#15803d,#16a34a)',
    desc: 'Rent out tractors, harvesters, pumps and other farm machinery.',
    features: ['Add & manage equipment', 'Track active rentals', 'Set availability calendar'],
  },
  {
    id: 'storage', emoji: '🏢', title: 'Storage Facilities',
    gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    desc: 'Provide warehouses, cold rooms and silos for agricultural storage.',
    features: ['Manage storage units', 'Monitor temperature & humidity', 'Handle booking requests'],
  },
  {
    id: 'packaging', emoji: '📦', title: 'Packaging Services',
    gradient: 'linear-gradient(135deg,#b45309,#d97706)',
    desc: 'Pack, label, seal and prepare produce for markets and export.',
    features: ['Manage packing orders', 'Materials stock control', 'Pricing management'],
  },
  {
    id: 'financial', emoji: '💰', title: 'Financial Services',
    gradient: 'linear-gradient(135deg,#1e40af,#2563eb)',
    desc: 'Offer agricultural loans to farmers as a bank or individual lender.',
    features: ['Create loan products', 'Review applications', 'Track repayments'],
  },
];

const reqStatusCfg: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  accepted:    { bg: '#d1fae5', color: '#065f46', label: 'Accepted' },
  'in-progress':{ bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  completed:   { bg: '#f0fdf4', color: '#166534', label: 'Completed' },
  rejected:    { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

// -- Premium Sidebar --

function PremiumSidebar({ collapsed, setCollapsed, activeSection, setActiveSection, onNavigate, onPortal }: {
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  activeSection: string; setActiveSection: (s: string) => void;
  onNavigate: (p: string) => void; onPortal: () => void;
}) {
  const serviceType = localStorage.getItem('serviceProviderType') || 'equipment';
  const portalLabels: Record<string,string> = { equipment: 'Equipment Portal', storage: 'Storage Portal', delivery: 'Delivery Portal', packaging: 'Packaging Portal', financial: 'Finance Portal' };

  const nav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Service Requests', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: collapsed ? 64 : 240, flexShrink: 0,
      background: 'linear-gradient(180deg,#064e3b 0%,#065f46 50%,#047857 100%)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
          <Sprout style={{ width: 20, height: 20, color: '#fff' }} />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>NagroMS</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Service Provider</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map(item => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button key={item.id} onClick={() => setActiveSection(item.id)} title={collapsed ? item.label : ''} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2,
              background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s', backdropFilter: active ? 'blur(10px)' : 'none',
              boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none',
            }}>
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {!collapsed && item.label}
            </button>
          );
        })}

        {/* My Portal link */}
        <div style={{ margin: '8px 0', height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <button onClick={onPortal} title={collapsed ? portalLabels[serviceType] : ''} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', marginBottom: 2,
          background: 'rgba(255,255,255,0.08)', color: '#fff',
          fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
        }}>
          <ExternalLink style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{portalLabels[serviceType]}</span>}
        </button>
      </nav>

      {/* Collapse toggle + logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => onNavigate('landing')} title={collapsed ? 'Logout' : ''} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 8,
          background: 'transparent', color: 'rgba(255,255,255,0.55)',
          fontFamily: "'Inter',sans-serif", fontSize: 13,
        }}>
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
        }}>
          {collapsed ? <ChevronRight style={{ width: 15, height: 15 }} /> : <ChevronLeft style={{ width: 15, height: 15 }} />}
          {!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, marginLeft: 6 }}>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

// -- Premium Top Nav --

function PremiumTopNav({ activeSection }: { activeSection: string }) {
  const sectionLabels: Record<string,string> = { overview: 'Dashboard Overview', requests: 'Service Requests', analytics: 'Analytics', schedule: 'Schedule', messages: 'Messages', settings: 'Settings' };
  const name = localStorage.getItem('userName') || localStorage.getItem('businessName') || 'Provider';
  return (
    <header style={{ height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>{sectionLabels[activeSection] || 'Dashboard'}</h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', margin: 0 }}>NagroMS · Service Provider Platform</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 12px', width: 220 }}>
          <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#94a3b8' }}>Search requests…</span>
        </div>

        {/* Bell */}
        <button style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Bell style={{ width: 16, height: 16, color: '#475569' }} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
        </button>

        {/* Messages */}
        <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <MessageSquare style={{ width: 16, height: 16, color: '#475569' }} />
        </button>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, padding: '5px 12px 5px 5px', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👨‍💼</div>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>{name.split(' ')[0]}</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: '#94a3b8', margin: 0 }}>Service Provider</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// -- Welcome Banner --

function WelcomeBanner({ onPortal }: { onPortal: () => void }) {
  const name = localStorage.getItem('userName') || localStorage.getItem('businessName') || 'Provider';
  const serviceType = localStorage.getItem('serviceProviderType') || 'equipment';
  const labels: Record<string,string> = { equipment: 'Equipment Rental', storage: 'Storage Facilities', delivery: 'Delivery & Export', packaging: 'Packaging Services', financial: 'Financial Services' };
  return (
    <div style={{
      background: 'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 70%,#059669 100%)',
      borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -60, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: 20, right: 200, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, padding: '4px 10px', marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Active · {labels[serviceType]}</span>
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Welcome back, {name.split(' ')[0]}! 👋</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>You have 5 pending requests and 2 new messages today.</p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: "Today's Requests", value: '5', icon: '📥' },
            { label: 'Monthly Revenue', value: 'Rs 318K', icon: '💰' },
            { label: 'Avg Rating', value: '4.8 ⭐', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: 90 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{s.value}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{s.label}</p>
            </div>
          ))}

          <button onClick={onPortal} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
            Open My Portal <ExternalLink style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Stats Cards --

function StatsGrid() {
  const stats = [
    { label: 'Total Requests', value: '248', change: '+18%', up: true, icon: FileText, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Pending', value: '12', change: '+3 today', up: false, icon: Clock, color: '#d97706', bg: '#fffbeb' },
    { label: 'Active Services', value: '8', change: '2 expiring soon', up: true, icon: Zap, color: '#7c3aed', bg: '#faf5ff' },
    { label: 'Completed', value: '228', change: '+24 this week', up: true, icon: CheckCircle, color: '#0891b2', bg: '#ecfeff' },
    { label: 'Monthly Revenue', value: 'Rs 318K', change: '+12% vs last mo', up: true, icon: DollarSign, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Customer Rating', value: '4.8 / 5', change: '96 reviews', up: true, icon: Star, color: '#f59e0b', bg: '#fffbeb' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 24 }}>
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontFamily: "'Inter',sans-serif", fontWeight: 600, color: s.up ? '#16a34a' : '#d97706' }}>
                {s.up ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                {s.change}
              </div>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{s.value}</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// -- Charts Row --

function ChartsRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, marginBottom: 24 }}>
      {/* Line chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Monthly Service Requests</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>Jan – Jul 2026</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#64748b' }}><span style={{ width: 10, height: 3, background: '#16a34a', borderRadius: 99, display: 'inline-block' }} />Requests</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#64748b' }}><span style={{ width: 10, height: 3, background: '#86efac', borderRadius: 99, display: 'inline-block' }} />Completed</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MONTHLY_REQ} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: "'Inter',sans-serif", fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="requests" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="completed" stroke="#86efac" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Revenue Overview</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>Rs (in thousands)</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: "'Inter',sans-serif", fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`Rs ${v}K`, '']} />
            <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#bbf7d0" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Category Distribution</p>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', margin: '0 0 12px' }}>% of total requests</p>
        <ResponsiveContainer width="100%" height={130}>
          <PieChart>
            <Pie data={CATEGORY_DIST} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
              {CATEGORY_DIST.map((entry) => <Cell key={`sp-${entry.name}`} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: "'Inter',sans-serif", fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} formatter={(v: number) => [`${v}%`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {CATEGORY_DIST.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#475569' }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- Requests Table --

function RequestsTable() {
  const [requests, setRequests] = useState(REQUESTS_TABLE);
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'pending', 'accepted', 'in-progress', 'completed', 'rejected'];
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const updateStatus = (id: string, status: string) => setRequests(p => p.map(r => r.id === id ? { ...r, status } : r));

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Service Request Management</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{requests.length} total requests</p>
        </div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 99, border: `1px solid ${filter === f ? '#16a34a' : '#e2e8f0'}`,
              background: filter === f ? '#16a34a' : '#fff', color: filter === f ? '#fff' : '#475569',
              fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}>{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Request ID', 'Farmer', 'Service Type', 'Date', 'Location', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 20px', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const sc = reqStatusCfg[r.status] || { bg: '#f1f5f9', color: '#475569', label: r.status };
              return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: '#16a34a' }}>{r.id}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{r.farmer}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#475569' }}>{r.type}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94a3b8' }}>{r.date}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#475569' }}>
                      <MapPin style={{ width: 12, height: 12, color: '#94a3b8' }} /> {r.location}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: sc.bg, color: sc.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} />
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(r.id, 'accepted')} style={{ padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 7, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => updateStatus(r.id, 'rejected')} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                        </>
                      )}
                      {r.status === 'accepted' && (
                        <button onClick={() => updateStatus(r.id, 'in-progress')} style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 7, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Start</button>
                      )}
                      {r.status === 'in-progress' && (
                        <button onClick={() => updateStatus(r.id, 'completed')} style={{ padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 7, fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Complete</button>
                      )}
                      <button style={{ padding: '4px 10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 7, fontFamily: "'Inter',sans-serif", fontSize: 11, cursor: 'pointer' }}>View</button>
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

// -- Activity + Tasks --

function ActivityAndTasks() {
  const [tasks, setTasks] = useState(TASKS_TODAY);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {/* Activity */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Activity</p>
        </div>
        <div style={{ padding: '8px 0' }}>
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: i < ACTIVITY_FEED.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${a.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#0f172a', margin: '0 0 2px', fontWeight: 500 }}>{a.text}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', margin: 0 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's tasks */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Today's Tasks</p>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8' }}>{tasks.filter(t => t.done).length}/{tasks.length} done</span>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task, i) => (
            <div key={i} onClick={() => setTasks(p => p.map((t, j) => j === i ? { ...t, done: !t.done } : t))} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '8px', borderRadius: 8, background: task.done ? '#f8fafc' : '#fff', border: `1px solid ${task.done ? '#f1f5f9' : '#e2e8f0'}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${task.done ? '#16a34a' : '#d1d5db'}`, background: task.done ? '#16a34a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {task.done && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: task.done ? '#94a3b8' : '#0f172a', margin: 0, textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Add Service', icon: Plus, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'View Requests', icon: FileText, color: '#7c3aed', bg: '#faf5ff' },
              { label: 'Update Availability', icon: Calendar, color: '#0891b2', bg: '#ecfeff' },
              { label: 'View Reports', icon: BarChart2, color: '#d97706', bg: '#fffbeb' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', background: a.bg, border: `1px solid ${a.color}22`, borderRadius: 9, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: a.color }}>
                  <Icon style={{ width: 13, height: 13 }} /> {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Service Category Cards --

function ServiceCategoryCards({ onPortal }: { onPortal: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Service Categories</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Click to open your specialized portal</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
        {SERVICE_CATEGORIES.map(cat => {
          const isHov = hovered === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={onPortal}
              style={{
                background: cat.gradient, borderRadius: 20, padding: '24px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                transform: isHov ? 'translateY(-4px) scale(1.01)' : 'none',
                boxShadow: isHov ? '0 20px 40px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Glass orb */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              {/* Glass header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 14px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>{cat.title}</span>
              </div>

              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', lineHeight: 1.6 }}>{cat.desc}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                {cat.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ShieldCheck style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 9, padding: '7px 12px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.2)' }}>
                Open Portal <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Premium Overview Dashboard --

function PremiumServiceDashboard({ onNavigate, onPortal }: { onNavigate: (p: string) => void; onPortal: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      <PremiumSidebar collapsed={collapsed} setCollapsed={setCollapsed} activeSection={activeSection} setActiveSection={setActiveSection} onNavigate={onNavigate} onPortal={onPortal} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <PremiumTopNav activeSection={activeSection} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <WelcomeBanner onPortal={onPortal} />
          <StatsGrid />
          <ChartsRow />
          <RequestsTable />
          <ActivityAndTasks />
          <ServiceCategoryCards onPortal={onPortal} />
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — routes to correct dashboard based on serviceProviderType
// ═══════════════════════════════════════════════════════════════════════════════

export function ServiceProviderDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const serviceType = localStorage.getItem('serviceProviderType') || 'equipment';
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/service-provider/dashboard`;
      const email = localStorage.getItem('userEmail');
      const query = email ? `email=${encodeURIComponent(email)}` : `type=${encodeURIComponent(serviceType)}`;

      try {
        const res = await fetch(`${apiUrl}?${query}`);
        const payload = await res.json();
        if (!res.ok) {
          setDashboardError(payload?.message || 'Unable to load dashboard data');
          return;
        }
        setDashboardData(payload.data);
      } catch (error) {
        setDashboardError('Unable to contact the backend service');
        console.warn('Dashboard fetch error:', error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, [serviceType]);

  const renderInfoPanel = () => {
    if (loadingDashboard) {
      return (
        <div className="bg-[#f7fff5] border border-[#d9f5e2] px-6 py-5 text-sm text-slate-700">Loading your dashboard insights…</div>
      );
    }

    if (dashboardError) {
      return (
        <div className="bg-[#fff7eb] border border-[#f8e3c4] px-6 py-5 text-sm text-amber-900">{dashboardError}</div>
      );
    }

    return (
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <div className="rounded-[1.25rem] bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{dashboardData?.providerName || 'Service Provider'}</p>
          <p className="mt-2 text-sm text-slate-600">{dashboardData?.serviceProviderType?.replace('-', ' ') || serviceType} portal</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total orders</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{dashboardData?.totalOrders ?? '—'}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Revenue</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">${dashboardData?.revenue ?? '—'}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderInfoPanel()}
      {serviceType === 'storage' && <StorageFacilitiesDashboard onNavigate={onNavigate} />}
      {serviceType === 'delivery' && <DeliveryExportDashboard onNavigate={onNavigate} />}
      {serviceType === 'packaging' && <PackagingProviderDashboard onNavigate={onNavigate} />}
      {serviceType === 'financial' && <FinancialProviderDashboard onNavigate={onNavigate} />}
      {serviceType === 'equipment' && <EquipmentRentalDashboard onNavigate={onNavigate} />}
    </>
  );
}
