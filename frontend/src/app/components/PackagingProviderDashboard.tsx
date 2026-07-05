import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  History, BarChart2, Star, MessageSquare, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, Search,
  Plus, Edit2, Trash2, Eye, Check, X, Download,
  TrendingUp, Clock, CheckCircle, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ds = {
  sidebar:   'linear-gradient(170deg,#0a2e1a 0%,#134d2e 50%,#0e3d24 100%)',
  green:     '#16a34a', greenDk: '#15803d', greenLt: '#f0fdf4', greenBd: '#dcfce7',
  bg:        '#f8fafc', surface: '#ffffff',
  border:    '#e2e8f0', borderLt: '#f1f5f9',
  text:      '#0f172a', textSec: '#475569', textTer: '#94a3b8',
  shadow:    '0 1px 3px rgba(0,0,0,0.07)',
  fontD:     "'Plus Jakarta Sans',sans-serif",
  fontB:     "'Inter',sans-serif",
  fontM:     "'JetBrains Mono',monospace",
  amber:     '#f59e0b', amberLt: '#fffbeb', amberBd: '#fde68a',
  red:       '#ef4444', redLt:   '#fef2f2', redBd:   '#fecaca',
  blue:      '#3b82f6', blueLt:  '#eff6ff', blueBd:  '#bfdbfe',
  purple:    '#8b5cf6', purpleLt:'#f5f3ff', purpleBd:'#ddd6fe',
  orange:    '#ea580c', orangeLt:'#fff7ed', orangeBd:'#fed7aa',
};

type OrderStatus = 'Pending'|'Accepted'|'In Progress'|'Completed'|'Rejected';

interface PackagingOrder {
  id:string; farmer:string; farmerIcon:string; crop:string; packagingType:string;
  quantity:number; unit:string; packagingDate:string; deadline:string;
  status:OrderStatus; totalPrice:number; district:string;
}
interface PackagingService {
  id:string; emoji:string; name:string; description:string;
  pricePerUnit:number; unit:string; minQty:number; turnaround:string;
  status:'Active'|'Inactive'; ordersThisMonth:number;
}

const ORDERS: PackagingOrder[] = [
  { id:'PKG-0441', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', crop:'Paddy Rice',      packagingType:'Bulk Sack Packaging',  quantity:500, unit:'bags',    packagingDate:'2026-07-08', deadline:'2026-07-12', status:'Pending',      totalPrice:18500, district:'Anuradhapura' },
  { id:'PKG-0440', farmer:'Kamala Silva',    farmerIcon:'👩‍🌾', crop:'Tomatoes',         packagingType:'Vacuum Packaging',     quantity:200, unit:'crates',  packagingDate:'2026-07-06', deadline:'2026-07-09', status:'In Progress',  totalPrice:14000, district:'Kandy' },
  { id:'PKG-0439', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', crop:'Cinnamon',         packagingType:'Export Packaging',     quantity:100, unit:'cartons', packagingDate:'2026-07-04', deadline:'2026-07-07', status:'Accepted',     totalPrice:35000, district:'Galle' },
  { id:'PKG-0438', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', crop:'Green Beans',      packagingType:'Eco-Friendly Bags',    quantity:150, unit:'bags',    packagingDate:'2026-07-01', deadline:'2026-07-03', status:'Completed',    totalPrice:7500,  district:'Jaffna' },
  { id:'PKG-0437', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', crop:'Coconut Products', packagingType:'Custom Branding',      quantity:300, unit:'boxes',   packagingDate:'2026-07-10', deadline:'2026-07-15', status:'Pending',      totalPrice:42000, district:'Batticaloa' },
  { id:'PKG-0436', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', crop:'Banana',           packagingType:'Export Packaging',     quantity:400, unit:'cartons', packagingDate:'2026-06-28', deadline:'2026-07-01', status:'Completed',    totalPrice:56000, district:'Kurunegala' },
  { id:'PKG-0435', farmer:'Saman Dias',      farmerIcon:'👨‍🌾', crop:'Chilli',           packagingType:'Vacuum Packaging',     quantity:80,  unit:'pouches', packagingDate:'2026-06-25', deadline:'2026-06-28', status:'Rejected',     totalPrice:6400,  district:'Badulla' },
  { id:'PKG-0434', farmer:'Nilanthi Peris',  farmerIcon:'👩‍🌾', crop:'Turmeric Powder',  packagingType:'Eco-Friendly Bags',    quantity:250, unit:'bags',    packagingDate:'2026-07-12', deadline:'2026-07-16', status:'Pending',      totalPrice:11250, district:'Polonnaruwa' },
];

const SERVICES: PackagingService[] = [
  { id:'SVC-01', emoji:'🌿', name:'Eco-Friendly Packaging',  description:'Biodegradable materials, leaf packaging, jute bags for organic produce',       pricePerUnit:45,  unit:'bag',    minQty:50,  turnaround:'1–2 days', status:'Active',   ordersThisMonth:38 },
  { id:'SVC-02', emoji:'🧪', name:'Vacuum Packaging',        description:'Airtight vacuum seal for extended shelf life — ideal for spices & dried goods',  pricePerUnit:80,  unit:'pouch',  minQty:25,  turnaround:'Same day', status:'Active',   ordersThisMonth:25 },
  { id:'SVC-03', emoji:'📦', name:'Bulk Sack Packaging',     description:'Heavy-duty woven sacks for paddy, rice, grain and root vegetables',             pricePerUnit:37,  unit:'sack',   minQty:100, turnaround:'2–3 days', status:'Active',   ordersThisMonth:52 },
  { id:'SVC-04', emoji:'✈️', name:'Export Packaging',        description:'Export-grade cartons with multilingual labels & barcode — meets customs standards',pricePerUnit:350, unit:'carton', minQty:20,  turnaround:'2–4 days', status:'Active',   ordersThisMonth:19 },
  { id:'SVC-05', emoji:'🎨', name:'Custom Branding & Labels',description:'Branded boxes, custom label printing, logo application for market differentiation', pricePerUnit:140, unit:'box',    minQty:30,  turnaround:'3–5 days', status:'Active',   ordersThisMonth:14 },
  { id:'SVC-06', emoji:'🗜️', name:'Crate & Pallet Packing', description:'Wooden crate packing for bulk produce transport — suitable for heavy loads',      pricePerUnit:200, unit:'crate',  minQty:10,  turnaround:'1–2 days', status:'Inactive', ordersThisMonth:0  },
];

const MONTHLY = [
  { month:'Jan', orders:32, revenue:285 },
  { month:'Feb', orders:41, revenue:368 },
  { month:'Mar', orders:58, revenue:495 },
  { month:'Apr', orders:52, revenue:441 },
  { month:'May', orders:67, revenue:562 },
  { month:'Jun', orders:78, revenue:645 },
  { month:'Jul', orders:64, revenue:528 },
];
const TYPE_DIST = [
  { name:'Bulk Sack',    value:34, color:ds.green  },
  { name:'Eco-Friendly', value:24, color:'#0891b2' },
  { name:'Vacuum',       value:16, color:ds.purple },
  { name:'Export',       value:15, color:ds.amber  },
  { name:'Custom',       value:11, color:'#ec4899' },
];
const ACTIVITIES = [
  { time:'5 min ago',  icon:'📋', text:'New request PKG-0441 from Sunil Perera — Paddy Rice, 500 bags', color:ds.green  },
  { time:'1 hr ago',   icon:'✅', text:'Order PKG-0436 completed — Banana Export Packaging, 400 cartons', color:ds.blue  },
  { time:'2 hr ago',   icon:'⭐', text:'5-star review from Amara Jayaweera — "Excellent packaging quality"', color:ds.amber },
  { time:'3 hr ago',   icon:'💰', text:'Payment confirmed Rs 56,000 for order PKG-0436', color:ds.green },
  { time:'Yesterday',  icon:'🎨', text:'Custom branding template updated for Coconut Products series', color:ds.purple },
  { time:'Yesterday',  icon:'➕', text:'Export Packaging upgraded to include QR code labelling', color:'#0891b2' },
];

const statusCfg: Record<OrderStatus,{bg:string;color:string;dot:string}> = {
  Pending:      {bg:ds.amberLt,  color:'#92400e', dot:ds.amber  },
  Accepted:     {bg:ds.blueLt,   color:'#1e40af', dot:ds.blue   },
  'In Progress':{bg:ds.purpleLt, color:'#5b21b6', dot:ds.purple },
  Completed:    {bg:ds.greenLt,  color:'#166534', dot:ds.green  },
  Rejected:     {bg:ds.redLt,    color:'#991b1b', dot:ds.red    },
};

// ─── Primitives ────────────────────────────────────────────────────────────────
const Badge = ({label,cfg}:{label:string;cfg:{bg:string;color:string;dot?:string}}) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>
    {cfg.dot&&<span style={{width:5,height:5,borderRadius:'50%',background:cfg.dot}}/>}{label}
  </span>
);
const TH = ({c}:{c:string}) => <th style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.07em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`,background:ds.bg,whiteSpace:'nowrap'}}>{c}</th>;
const TD = ({children,mono}:{children:React.ReactNode;mono?:boolean}) => <td style={{padding:'13px 16px',fontFamily:mono?ds.fontM:ds.fontB,fontSize:13,color:ds.text,borderBottom:`1px solid ${ds.borderLt}`,verticalAlign:'middle'}}>{children}</td>;
const Btn = ({label,icon,variant='primary',onClick,size='md'}:{label:string;icon?:React.ReactNode;variant?:'primary'|'secondary'|'danger';onClick?:()=>void;size?:'sm'|'md'}) => {
  const v={primary:{background:ds.green,color:'#fff',border:'none'},secondary:{background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`},danger:{background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`}}[variant];
  const s=size==='sm'?{padding:'5px 11px',fontSize:12}:{padding:'8px 16px',fontSize:13};
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:ds.fontB,fontWeight:600,borderRadius:8,cursor:'pointer',...v,...s}}>{icon}{label}</button>;
};

function KpiCard({label,value,sub,icon,iconBg,iconColor,trend}:{label:string;value:string;sub:string;icon:React.ReactNode;iconBg:string;iconColor:string;trend?:string}) {
  return (
    <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'22px',boxShadow:ds.shadow}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:11,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:iconColor}}>{icon}</div>
        {trend&&<span style={{display:'flex',alignItems:'center',gap:3,fontSize:11,fontWeight:700,color:ds.green,fontFamily:ds.fontB}}><ArrowUpRight style={{width:12,height:12}}/>{trend}</span>}
      </div>
      <p style={{fontFamily:ds.fontM,fontSize:26,fontWeight:700,color:ds.text,margin:'0 0 4px'}}>{value}</p>
      <p style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,margin:'0 0 2px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
      <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>{sub}</p>
    </div>
  );
}


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
const NAV = [
  {id:'dashboard', label:'Dashboard',          icon:LayoutDashboard},
  {id:'orders',    label:'Packaging Orders',   icon:Package},
  {id:'services',  label:'Packaging Services', icon:ShoppingBag},
  {id:'requests',  label:'Customer Requests',  icon:Users},
  {id:'pricing',   label:'Pricing',            icon:Tag},
  {id:'history',   label:'Order History',      icon:History},
  {id:'analytics', label:'Analytics',          icon:BarChart2},
  {id:'reviews',   label:'Reviews',            icon:Star},
  {id:'messages',  label:'Messages',           icon:MessageSquare},
  {id:'settings',  label:'Settings',           icon:Settings},
];

function Sidebar({collapsed,setCollapsed,active,setActive,onNavigate}:{collapsed:boolean;setCollapsed:(v:boolean)=>void;active:string;setActive:(s:string)=>void;onNavigate:(p:string)=>void}) {
  return (
    <aside style={{width:collapsed?66:244,flexShrink:0,background:ds.sidebar,display:'flex',flexDirection:'column',transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <div style={{padding:collapsed?'20px 15px':'20px 20px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,0.08)',justifyContent:collapsed?'center':'flex-start',minHeight:68,flexShrink:0}}>
        <div style={{width:34,height:34,background:'rgba(255,255,255,0.12)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,0.15)'}}><span style={{fontSize:17}}>📦</span></div>
        {!collapsed&&<div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:800,color:'#fff',margin:0,lineHeight:1.2}}>NagroMS</p><p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.5)',margin:0}}>Packaging Services</p></div>}
      </div>
      <nav style={{flex:1,padding:'12px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {NAV.map(item=>{const Icon=item.icon;const isActive=active===item.id;return(
          <button key={item.id} onClick={()=>setActive(item.id)} title={collapsed?item.label:undefined} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:isActive?'rgba(255,255,255,0.14)':'transparent',color:isActive?'#fff':'rgba(255,255,255,0.55)',fontFamily:ds.fontB,fontSize:13,fontWeight:isActive?600:400,transition:'all 0.15s',boxShadow:isActive?'inset 0 0 0 1px rgba(255,255,255,0.18)':'none'}}>
            <Icon style={{width:16,height:16,flexShrink:0}}/>{!collapsed&&<span style={{flex:1,textAlign:'left',whiteSpace:'nowrap'}}>{item.label}</span>}
          </button>
        );})}
      </nav>
      <div style={{padding:'10px 8px',borderTop:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
        <button onClick={()=>onNavigate('landing')} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:4,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',fontFamily:ds.fontB,fontSize:12,fontWeight:500}}>
          <LayoutDashboard style={{width:14,height:14,flexShrink:0}}/>{!collapsed&&'Main Dashboard'}
        </button>
        <button onClick={()=>onNavigate('landing')} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',background:'transparent',color:'rgba(255,255,255,0.4)',fontFamily:ds.fontB,fontSize:12}}>
          <LogOut style={{width:14,height:14,flexShrink:0}}/>{!collapsed&&'Logout'}
        </button>
        <button onClick={()=>setCollapsed(!collapsed)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',marginTop:4,fontFamily:ds.fontB,fontSize:11}}>
          {collapsed?<ChevronRight style={{width:14,height:14}}/>:<><ChevronLeft style={{width:14,height:14}}/><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

// ─── Top Nav ───────────────────────────────────────────────────────────────────
function TopNav({section}:{section:string}) {
  const labels:Record<string,string>={dashboard:'Dashboard Overview',orders:'Packaging Orders',services:'Packaging Services',requests:'Customer Requests',pricing:'Pricing Management',history:'Order History',analytics:'Analytics & Reports',reviews:'Customer Reviews',messages:'Messages',settings:'Settings'};
  const name=localStorage.getItem('userName')||localStorage.getItem('businessName')||'Provider';
  return (
    <header style={{height:60,background:ds.surface,borderBottom:`1px solid ${ds.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:30,flexShrink:0}}>
      <div>
        <h1 style={{fontFamily:ds.fontD,fontSize:16,fontWeight:700,color:ds.text,margin:0}}>{labels[section]||'Dashboard'}</h1>
        <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>Packaging Services Portal · NagroMS</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',width:210}}>
          <Search style={{width:13,height:13,color:ds.textTer}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.textTer}}>Search orders…</span>
        </div>
        <button style={{position:'relative',width:36,height:36,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Bell style={{width:15,height:15,color:ds.textSec}}/><span style={{position:'absolute',top:6,right:7,width:7,height:7,background:ds.red,borderRadius:'50%',border:`2px solid ${ds.surface}`}}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.greenLt,border:`1px solid ${ds.greenBd}`,borderRadius:9,padding:'4px 11px 4px 4px',cursor:'pointer'}}>
          <div style={{width:26,height:26,background:`linear-gradient(135deg,${ds.green},#22c55e)`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>📦</div>
          <div><p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:0}}>{name.split(' ')[0]}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>Packaging Provider</p></div>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardHome({ setSection }: { setSection: (s: string) => void }) {
  const pending=ORDERS.filter(o=>o.status==='Pending').length;
  const inProg=ORDERS.filter(o=>o.status==='In Progress').length;
  const completed=ORDERS.filter(o=>o.status==='Completed').length;
  const rev=MONTHLY[MONTHLY.length-1].revenue;
  const cnt=MONTHLY[MONTHLY.length-1].orders;
  return (
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#0a2e1a 0%,#15803d 50%,#16a34a 100%)',borderRadius:20,padding:'26px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
        <div style={{position:'absolute',bottom:-50,right:160,width:130,height:130,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.12)',borderRadius:99,padding:'3px 10px',marginBottom:10}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80'}}/><span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>Active · Packaging Services Provider</span>
            </div>
            <h2 style={{fontFamily:ds.fontD,fontSize:24,fontWeight:800,color:'#fff',margin:'0 0 6px'}}>Good morning! 📦</h2>
            <p style={{fontFamily:ds.fontB,fontSize:13,color:'rgba(255,255,255,0.7)',margin:0}}>{pending} pending orders and {inProg} orders currently being processed.</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[{label:'Active Orders',value:String(inProg+pending)},{label:'Monthly Orders',value:String(cnt)},{label:'Revenue (Jul)',value:`Rs ${rev}K`}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',borderRadius:14,padding:'12px 18px',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center',minWidth:90}}>
                <p style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 2px'}}>{s.value}</p>
                <p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.65)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:14,marginBottom:24}}>
        <KpiCard label="Total Orders"    value={String(ORDERS.length)} sub="All time"           icon={<Package style={{width:18,height:18}}/>}     iconBg={ds.greenLt}  iconColor={ds.green}  trend="+8 this month"/>
        <KpiCard label="Pending"         value={String(pending)}       sub="Awaiting response"  icon={<Clock style={{width:18,height:18}}/>}        iconBg={ds.amberLt}  iconColor={ds.amber}/>
        <KpiCard label="In Progress"     value={String(inProg)}        sub="Being packed"       icon={<RefreshCw style={{width:18,height:18}}/>}   iconBg={ds.purpleLt} iconColor={ds.purple}/>
        <KpiCard label="Completed"       value={String(completed)}     sub="Delivered"          icon={<CheckCircle style={{width:18,height:18}}/>} iconBg={ds.greenLt}  iconColor={ds.green}  trend="+14%"/>
        <KpiCard label="Monthly Revenue" value={`Rs ${rev}K`}          sub="Jul 2026"           icon={<TrendingUp style={{width:18,height:18}}/>}  iconBg={ds.greenLt}  iconColor={ds.green}  trend="+18%"/>
        <KpiCard label="Satisfaction"    value="4.8 / 5"               sub="96 reviews"         icon={<Star style={{width:18,height:18}}/>}        iconBg={ds.amberLt}  iconColor={ds.amber}/>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 290px',gap:16,marginBottom:24}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Monthly Orders & Revenue</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={MONTHLY} margin={{top:2,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/>
              <Line type="monotone" dataKey="orders" stroke={ds.green} strokeWidth={2.5} dot={{r:4,fill:ds.green,strokeWidth:0}} name="Orders"/>
              <Line type="monotone" dataKey="revenue" stroke={ds.blue} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Revenue(K)"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Revenue Growth (Rs Thousands)</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={MONTHLY} margin={{top:2,right:4,left:-20,bottom:0}} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']}/>
              <Bar dataKey="revenue" fill={ds.orange} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 4px'}}>Service Distribution</p>
          <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:'0 0 8px'}}>By order volume</p>
          <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={TYPE_DIST} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">{TYPE_DIST.map((d)=><Cell key={`pkg-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:4}}>
            {TYPE_DIST.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:2,background:d.color,display:'inline-block'}}/><span style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec}}>{d.name}</span></div>
                <span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.text}}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
          <div style={{padding:'18px 20px',borderBottom:`1px solid ${ds.borderLt}`}}><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:0}}>Recent Activities</p></div>
          {ACTIVITIES.map((a,i)=>(
            <div key={i} style={{display:'flex',gap:12,padding:'12px 20px',borderBottom:i<ACTIVITIES.length-1?`1px solid ${ds.borderLt}`:'none'}}>
              <div style={{width:34,height:34,borderRadius:9,background:`${a.color}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{a.icon}</div>
              <div><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.text,margin:'0 0 2px',fontWeight:500}}>{a.text}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{a.time}</p></div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
            <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Quick Actions</p>
            {[{label:'Add Packaging Service',icon:<Plus style={{width:13,height:13}}/>,color:ds.green,bg:ds.greenLt,action:()=>setSection('services')},{label:'Update Pricing',icon:<Tag style={{width:13,height:13}}/>,color:ds.blue,bg:ds.blueLt,action:()=>setSection('pricing')},{label:'Manage Orders',icon:<Package style={{width:13,height:13}}/>,color:ds.purple,bg:ds.purpleLt,action:()=>setSection('orders')},{label:'View Reports',icon:<BarChart2 style={{width:13,height:13}}/>,color:ds.amber,bg:ds.amberLt,action:()=>exportToCSV('packaging_reports.csv', ORDERS)},{label:'Download Invoices',icon:<Download style={{width:13,height:13}}/>,color:ds.textSec,bg:ds.bg,action:()=>exportToCSV('packaging_invoices.csv', ORDERS)}].map(a=>(
              <button key={a.label} onClick={a.action} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 12px',background:a.bg,border:`1px solid ${a.color}22`,borderRadius:10,cursor:'pointer',fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:a.color,marginBottom:8}}>{a.icon}{a.label}</button>
            ))}
          </div>
          <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
            <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 12px'}}>Service Popularity</p>
            {SERVICES.filter(s=>s.ordersThisMonth>0).map(s=>(
              <div key={s.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.text,fontWeight:500}}>{s.emoji} {s.name.split(' ').slice(0,2).join(' ')}</span>
                  <span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.green}}>{s.ordersThisMonth}</span>
                </div>
                <div style={{background:ds.borderLt,borderRadius:99,height:5}}><div style={{width:`${(s.ordersThisMonth/52)*100}%`,height:'100%',background:ds.green,borderRadius:99}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Table ──────────────────────────────────────────────────────────────
function OrdersSection() {
  const [orders,setOrders]=useState(ORDERS);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [filter,setFilter]=useState('All');
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);const perPage=5;
  const update=(id:string,s:OrderStatus)=>setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o));
  const filtered=useMemo(()=>orders.filter(o=>(filter==='All'||o.status===filter)&&(o.farmer.toLowerCase().includes(search.toLowerCase())||o.crop.toLowerCase().includes(search.toLowerCase()))),[orders,filter,search]);
  const paged=filtered.slice((page-1)*perPage,page*perPage);
  const total=Math.ceil(filtered.length/perPage);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Packaging Orders</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{ORDERS.length} total orders</p></div><Btn label="Export" icon={<Download style={{width:13,height:13}}/>} variant="secondary" onClick={() => exportToCSV('packaging_orders.csv', orders)}/></div>
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',flex:1,minWidth:200}}>
          <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['All','Pending','Accepted','In Progress','Completed','Rejected'].map(f=><button key={f} onClick={()=>{setFilter(f);setPage(1);}} style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${filter===f?ds.green:ds.border}`,background:filter===f?ds.green:ds.surface,color:filter===f?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>{f}</button>)}
        </div>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:950}}>
          <thead><tr><TH c="Order ID"/><TH c="Farmer"/><TH c="Crop / Product"/><TH c="Packaging Type"/><TH c="Quantity"/><TH c="Pack Date"/><TH c="Deadline"/><TH c="Status"/><TH c="Total"/><TH c="Actions"/></tr></thead>
          <tbody>{paged.map((o,i)=>(
            <tr key={o.id} style={{background:i%2===0?ds.surface:'#fafafa'}}>
              <TD><span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.green}}>{o.id}</span></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18}}>{o.farmerIcon}</span><div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>{o.farmer}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{o.district}</p></div></div></TD>
              <TD>{o.crop}</TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:ds.bg,borderRadius:6,color:ds.textSec}}>{o.packagingType}</span></TD>
              <TD mono>{o.quantity.toLocaleString()} {o.unit}</TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{o.packagingDate}</span></TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{o.deadline}</span></TD>
              <TD><Badge label={o.status} cfg={statusCfg[o.status]}/></TD>
              <TD mono><strong style={{color:ds.green}}>Rs {o.totalPrice.toLocaleString()}</strong></TD>
              <TD><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                <button onClick={() => setViewOrder(o)} style={{padding:'4px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Eye style={{width:11,height:11}}/>View</button>
                {o.status==='Pending'&&<><button onClick={()=>update(o.id,'Accepted')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Check style={{width:11,height:11}}/>Accept</button><button onClick={()=>update(o.id,'Rejected')} style={{padding:'4px 8px',background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><X style={{width:11,height:11}}/>Reject</button></>}
                {o.status==='Accepted'&&<button onClick={()=>update(o.id,'In Progress')} style={{padding:'4px 8px',background:ds.blueLt,color:ds.blue,border:`1px solid ${ds.blueBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Start</button>}
                {o.status==='In Progress'&&<button onClick={()=>update(o.id,'Completed')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Complete</button>}
              </div></TD>
            </tr>
          ))}</tbody>
        </table></div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===1?ds.textTer:ds.text,cursor:page===1?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Prev</button>
            {Array.from({length:total},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${page===i+1?ds.green:ds.border}`,background:page===i+1?ds.green:ds.surface,color:page===i+1?'#fff':ds.text,cursor:'pointer',fontFamily:ds.fontB,fontSize:12}}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===total?ds.textTer:ds.text,cursor:page===total?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Services Catalog ──────────────────────────────────────────────────────────
function ServicesCatalog() {
  const [services,setServices]=useState(SERVICES);
  const [actionService, setActionService] = useState<{unit: any, action: 'add'|'edit'|null}>( {unit: null, action: null} );
  const toggle=(id:string)=>setServices(p=>p.map(s=>s.id===id?{...s,status:s.status==='Active'?'Inactive':'Active'}:s));
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Packaging Services</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Manage your service offerings</p></div><Btn label="Add Service" icon={<Plus style={{width:13,height:13}}/>} onClick={() => setActionService({unit: {}, action: 'add'})}/></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
        {services.map(svc=>(
          <div key={svc.id} style={{background:ds.surface,borderRadius:18,border:`1px solid ${svc.status==='Active'?ds.greenBd:ds.border}`,padding:'22px',boxShadow:ds.shadow}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:44,height:44,borderRadius:12,background:svc.status==='Active'?ds.greenLt:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{svc.emoji}</div>
                <div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:0}}>{svc.name}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:'2px 0 0'}}>Min: {svc.minQty} {svc.unit}s</p></div>
              </div>
              <Badge label={svc.status} cfg={svc.status==='Active'?{bg:ds.greenLt,color:'#166534',dot:ds.green}:{bg:'#f1f5f9',color:ds.textSec,dot:ds.textTer}}/>
            </div>
            <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:'0 0 14px',lineHeight:1.6}}>{svc.description}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[{label:'Price per unit',value:`Rs ${svc.pricePerUnit}/${svc.unit}`},{label:'Turnaround',value:svc.turnaround},{label:'Orders this month',value:String(svc.ordersThisMonth)},{label:'Min order',value:`${svc.minQty} ${svc.unit}s`}].map(d=>(
                <div key={d.label} style={{background:ds.bg,borderRadius:8,padding:'8px 10px'}}><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0,textTransform:'uppercase',letterSpacing:'0.05em'}}>{d.label}</p><p style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.text,margin:'2px 0 0'}}>{d.value}</p></div>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn label="Edit" icon={<Edit2 style={{width:12,height:12}}/>} variant="secondary" size="sm" onClick={() => setActionService({unit: svc, action: 'edit'})}/>
              <button onClick={()=>toggle(svc.id)} style={{padding:'5px 12px',background:svc.status==='Active'?ds.redLt:ds.greenLt,color:svc.status==='Active'?ds.red:ds.green,border:`1px solid ${svc.status==='Active'?ds.redBd:ds.greenBd}`,borderRadius:8,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>{svc.status==='Active'?'Deactivate':'Activate'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsSection() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Analytics & Reports</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Packaging performance and revenue insights</p></div><Btn label="Export Report" icon={<Download style={{width:13,height:13}}/>} variant="secondary"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Order Volume & Revenue Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/><Line type="monotone" dataKey="orders" stroke={ds.green} strokeWidth={2.5} dot={{r:4,fill:ds.green,strokeWidth:0}} name="Orders"/><Line type="monotone" dataKey="revenue" stroke={ds.blue} strokeWidth={2} dot={false} strokeDasharray="5 3" name="Revenue(K)"/></LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Revenue by Month (Rs Thousands)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}} barCategoryGap="40%"><CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']} /><Bar dataKey="revenue" fill={ds.orange} radius={[6,6,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 16px'}}>Most Popular Packaging Types</p>
          {SERVICES.filter(s=>s.ordersThisMonth>0).sort((a,b)=>b.ordersThisMonth-a.ordersThisMonth).map(svc=>(
            <div key={svc.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontSize:20,flexShrink:0}}>{svc.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.text}}>{svc.name}</span><span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.green}}>{svc.ordersThisMonth} orders</span></div>
                <div style={{background:ds.borderLt,borderRadius:99,height:5}}><div style={{width:`${(svc.ordersThisMonth/52)*100}%`,height:'100%',background:ds.green,borderRadius:99}}/></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 8px'}}>Service Distribution</p>
          <ResponsiveContainer width="100%" height={165}><PieChart><Pie data={TYPE_DIST} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>{TYPE_DIST.map((d)=><Cell key={`pkg-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
          {TYPE_DIST.map(d=>(
            <div key={d.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:2,background:d.color,display:'inline-block'}}/><span style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec}}>{d.name}</span></div>
              <span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.text}}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Customer Requests ─────────────────────────────────────────────────────────
const CUST_REQUESTS = [
  {id:'CR-001',farmer:'Sunil Perera',    icon:'👨‍🌾',product:'Organic Rice',   qty:'500 kg',  type:'Eco-Friendly Bags',    note:'Need biodegradable labels',         date:'2026-07-05',district:'Anuradhapura',contact:'077 123 4567',status:'New'},
  {id:'CR-002',farmer:'Kamala Silva',    icon:'👩‍🌾',product:'Tomatoes',       qty:'200 kg',  type:'Export Packaging',     note:'QR code labels required for EU',    date:'2026-07-04',district:'Kandy',       contact:'081 222 3344',status:'Replied'},
  {id:'CR-003',farmer:'Nimal Fernando',  icon:'👨‍🌾',product:'Cinnamon',       qty:'100 kg',  type:'Vacuum Packaging',     note:'Airtight 250g pouches',             date:'2026-07-03',district:'Galle',       contact:'091 333 4455',status:'New'},
  {id:'CR-004',farmer:'Priya Kumar',     icon:'👩‍🌾',product:'Coconut Oil',    qty:'150 L',   type:'Custom Branding',      note:'Branded bottles with NFC tags',     date:'2026-07-02',district:'Jaffna',      contact:'021 444 5566',status:'Converted'},
  {id:'CR-005',farmer:'Rajan Muthu',     icon:'👨‍🌾',product:'Banana',        qty:'1,000 kg',type:'Bulk Sack Packaging',  note:'Standard 25 kg woven sacks',       date:'2026-07-01',district:'Batticaloa',  contact:'076 555 6677',status:'Replied'},
];
const crStatusCfg: Record<string,{bg:string;color:string;dot:string}> = {
  New:       {bg:ds.amberLt,color:'#92400e',dot:ds.amber},
  Replied:   {bg:ds.blueLt, color:'#1e40af', dot:'#3b82f6'},
  Converted: {bg:ds.greenLt,color:'#166534', dot:ds.green},
};

function CustomerRequests() {
  const [search,setSearch]=useState('');
  const [viewRequest, setViewRequest] = useState<any>(null);
  const filtered=useMemo(()=>CUST_REQUESTS.filter(r=>r.farmer.toLowerCase().includes(search.toLowerCase())||r.product.toLowerCase().includes(search.toLowerCase())),[search]);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Customer Requests</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Enquiries from farmers asking about packaging services</p></div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',marginBottom:16}}>
        <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by farmer or product…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.map(r=>{
          const sc=crStatusCfg[r.status]||crStatusCfg['New'];
          return (
            <div key={r.id} style={{background:ds.surface,borderRadius:14,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:10,marginBottom:12}}>
                <div style={{display:'flex',gap:10}}>
                  <div style={{width:44,height:44,borderRadius:11,background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{r.icon}</div>
                  <div><p style={{fontFamily:ds.fontB,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 2px'}}>{r.farmer}</p><p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>📍 {r.district} · 📞 {r.contact} · 📅 {r.date}</p></div>
                </div>
                <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:sc.bg,color:sc.color,whiteSpace:'nowrap'}}><span style={{width:5,height:5,borderRadius:'50%',background:sc.dot}}/>{r.status}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginBottom:12}}>
                {[{icon:'🌾',label:'Product',val:r.product},{icon:'⚖️',label:'Quantity',val:r.qty},{icon:'📦',label:'Packaging Type',val:r.type}].map(d=>(
                  <div key={d.label} style={{background:ds.bg,borderRadius:8,padding:'8px 10px'}}><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>{d.icon} {d.label}</p><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:'2px 0 0'}}>{d.val}</p></div>
                ))}
              </div>
              <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,background:ds.bg,borderRadius:8,padding:'8px 10px',margin:'0 0 12px',fontStyle:'italic'}}>💬 "{r.note}"</p>
              <div style={{display:'flex',gap:8}}>
                {r.status==='New'&&<><button style={{padding:'6px 14px',background:ds.green,color:'#fff',border:'none',borderRadius:7,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>Reply</button><button style={{padding:'6px 14px',background:ds.orangeLt,color:ds.orange,border:`1px solid ${ds.orangeBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>Create Order</button></>}
                {r.status==='Replied'&&<button style={{padding:'6px 14px',background:ds.blueLt,color:'#1e40af',border:'1px solid #bfdbfe',borderRadius:7,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>Follow Up</button>}
                <button onClick={() => setViewRequest(r)} style={{padding:'6px 12px',background:ds.surface,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:12,cursor:'pointer'}}>View Details</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pricing Management ────────────────────────────────────────────────────────
const PRICING = [
  {id:'p1',emoji:'🌿',type:'Eco-Friendly Bags',    materialCost:25, serviceCost:20, finalPrice:45,  time:'1–2 days',active:true},
  {id:'p2',emoji:'🧪',type:'Vacuum Packaging',     materialCost:45, serviceCost:35, finalPrice:80,  time:'Same day',active:true},
  {id:'p3',emoji:'📦',type:'Bulk Sack Packaging',  materialCost:20, serviceCost:17, finalPrice:37,  time:'2–3 days',active:true},
  {id:'p4',emoji:'✈️',type:'Export Packaging',     materialCost:200,serviceCost:150,finalPrice:350, time:'2–4 days',active:true},
  {id:'p5',emoji:'🎨',type:'Custom Branding',      materialCost:80, serviceCost:60, finalPrice:140, time:'3–5 days',active:true},
  {id:'p6',emoji:'🗜️',type:'Crate & Pallet',       materialCost:120,serviceCost:80, finalPrice:200, time:'1–2 days',active:false},
];
function PricingManagement() {
  const [prices,setPrices]=useState(PRICING);
  const [editing,setEditing]=useState<string|null>(null);
  const [editVals,setEditVals]=useState<{material:string;service:string}>({material:'',service:''});
  const startEdit=(p:{id:string;materialCost:number;serviceCost:number})=>{setEditing(p.id);setEditVals({material:String(p.materialCost),service:String(p.serviceCost)});};
  const saveEdit=(id:string)=>{
    const mat=parseInt(editVals.material)||0;
    const svc=parseInt(editVals.service)||0;
    setPrices(prev=>prev.map(p=>p.id===id?{...p,materialCost:mat,serviceCost:svc,finalPrice:mat+svc}:p));
    setEditing(null);
  };
  const inp:React.CSSProperties={width:'100%',padding:'7px 10px',border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontM,fontSize:13,outline:'none',boxSizing:'border-box'};
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Pricing Management</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Set and update pricing for each packaging service</p></div>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:ds.bg}}>{['Service Type','Material Cost (Rs)','Service Cost (Rs)','Final Price (Rs)','Turnaround','Status','Actions'].map(h=><th key={h} style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.06em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`}}>{h}</th>)}</tr></thead>
          <tbody>
            {prices.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:i<prices.length-1?`1px solid ${ds.borderLt}`:'none'}}>
                <td style={{padding:'14px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18}}>{p.emoji}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{p.type}</span></div></td>
                <td style={{padding:'14px 16px'}}>
                  {editing===p.id?<input value={editVals.material} onChange={e=>setEditVals(v=>({...v,material:e.target.value}))} style={inp}/>:<span style={{fontFamily:ds.fontM,fontSize:13,color:ds.textSec}}>Rs {p.materialCost}</span>}
                </td>
                <td style={{padding:'14px 16px'}}>
                  {editing===p.id?<input value={editVals.service} onChange={e=>setEditVals(v=>({...v,service:e.target.value}))} style={inp}/>:<span style={{fontFamily:ds.fontM,fontSize:13,color:ds.textSec}}>Rs {p.serviceCost}</span>}
                </td>
                <td style={{padding:'14px 16px',fontFamily:ds.fontM,fontSize:14,fontWeight:800,color:ds.green}}>Rs {editing===p.id?(parseInt(editVals.material)||0)+(parseInt(editVals.service)||0):p.finalPrice}</td>
                <td style={{padding:'14px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{p.time}</td>
                <td style={{padding:'14px 16px'}}><span style={{fontFamily:ds.fontB,fontSize:11,padding:'3px 8px',borderRadius:99,background:p.active?ds.greenLt:ds.bg,color:p.active?ds.green:ds.textSec,fontWeight:600}}>{p.active?'Active':'Inactive'}</span></td>
                <td style={{padding:'14px 16px'}}>
                  {editing===p.id
                    ?<div style={{display:'flex',gap:6}}><button onClick={()=>saveEdit(p.id)} style={{padding:'5px 10px',background:ds.green,color:'#fff',border:'none',borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Save</button><button onClick={()=>setEditing(null)} style={{padding:'5px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer'}}>Cancel</button></div>
                    :<button onClick={()=>startEdit(p)} style={{padding:'5px 12px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4}}><Edit2 style={{width:11,height:11}}/>Edit Rate</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Order History ─────────────────────────────────────────────────────────────
const ORDER_HISTORY = [
  {id:'PKG-0433',farmer:'Sunil Perera',    icon:'👨‍🌾',product:'Paddy',     type:'Bulk Sack',  qty:400,  date:'2026-06-28',revenue:14800,rating:5},
  {id:'PKG-0432',farmer:'Kamala Silva',    icon:'👩‍🌾',product:'Tomatoes',  type:'Export',     qty:150,  date:'2026-06-25',revenue:52500,rating:4},
  {id:'PKG-0431',farmer:'Nimal Fernando',  icon:'👨‍🌾',product:'Cinnamon',  type:'Vacuum',     qty:80,   date:'2026-06-22',revenue:6400, rating:5},
  {id:'PKG-0430',farmer:'Amara Jayaweera', icon:'👩‍🌾',product:'Banana',    type:'Eco-Friendly',qty:600, date:'2026-06-18',revenue:27000,rating:4},
  {id:'PKG-0429',farmer:'Rajan Muthu',     icon:'👨‍🌾',product:'Coconut Oil',type:'Custom',    qty:200,  date:'2026-06-15',revenue:28000,rating:5},
  {id:'PKG-0428',farmer:'Saman Dias',      icon:'👨‍🌾',product:'Chilli',    type:'Vacuum',     qty:60,   date:'2026-06-10',revenue:4800, rating:3},
];
function OrderHistory() {
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);const perPage=5;
  const filtered=useMemo(()=>ORDER_HISTORY.filter(o=>o.farmer.toLowerCase().includes(search.toLowerCase())||o.product.toLowerCase().includes(search.toLowerCase())||o.id.toLowerCase().includes(search.toLowerCase())),[search]);
  const paged=filtered.slice((page-1)*perPage,page*perPage);
  const total=Math.ceil(filtered.length/perPage);
  const totalRev=ORDER_HISTORY.reduce((s,o)=>s+o.revenue,0);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Order History</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{ORDER_HISTORY.length} completed packaging orders</p></div>
        <button onClick={() => exportToCSV('packaging_history.csv', ORDER_HISTORY)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}><Download style={{width:14,height:14}}/>Export</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Total Orders',v:String(ORDER_HISTORY.length),c:ds.green,bg:ds.greenLt},{l:'Total Revenue',v:`Rs ${(totalRev/1000).toFixed(0)}K`,c:'#2563eb',bg:'#eff6ff'},{l:'Avg Rating',v:`${(ORDER_HISTORY.reduce((s,o)=>s+o.rating,0)/ORDER_HISTORY.length).toFixed(1)} ⭐`,c:ds.amber,bg:ds.amberLt}].map(s=>(
          <div key={s.l} style={{background:s.bg,borderRadius:12,padding:16,border:`1px solid ${s.c}20`}}><p style={{fontFamily:ds.fontM,fontSize:22,fontWeight:700,color:s.c,margin:'0 0 4px'}}>{s.v}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:0}}>{s.l}</p></div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',marginBottom:16}}>
        <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search history…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
          <thead><tr style={{background:ds.bg}}>{['Order ID','Farmer','Product','Type','Quantity','Date','Revenue','Rating'].map(h=><th key={h} style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.06em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{paged.map((o,i)=>(
            <tr key={o.id} style={{borderBottom:i<paged.length-1?`1px solid ${ds.borderLt}`:'none'}}>
              <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.green}}>{o.id}</td>
              <td style={{padding:'13px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:16}}>{o.icon}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{o.farmer}</span></div></td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:13,color:ds.text}}>{o.product}</td>
              <td style={{padding:'13px 16px'}}><span style={{fontFamily:ds.fontB,fontSize:11,padding:'3px 8px',background:ds.bg,borderRadius:6,color:ds.textSec}}>{o.type}</span></td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:13,color:ds.text}}>{o.qty} units</td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{o.date}</td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:13,fontWeight:700,color:ds.green}}>Rs {o.revenue.toLocaleString()}</td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:13}}>{'⭐'.repeat(o.rating)}{'☆'.repeat(5-o.rating)}</td>
            </tr>
          ))}</tbody>
        </table></div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===1?ds.textTer:ds.text,cursor:page===1?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Prev</button>
            {Array.from({length:total},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${page===i+1?ds.green:ds.border}`,background:page===i+1?ds.green:ds.surface,color:page===i+1?'#fff':ds.text,cursor:'pointer',fontFamily:ds.fontB,fontSize:12}}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===total?ds.textTer:ds.text,cursor:page===total?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
const PKG_REVIEWS = [
  {id:'r1',farmer:'Sunil Perera',    icon:'👨‍🌾',service:'Bulk Sack',   rating:5,date:'2026-07-02',comment:'Excellent packaging! Bags were strong and all 400 reached Colombo without any damage. Will use again.'},
  {id:'r2',farmer:'Kamala Silva',    icon:'👩‍🌾',service:'Export Packaging',rating:4,date:'2026-06-25',comment:'Good quality export cartons. Labels were clear and met customs requirements. Slight delay in completion.'},
  {id:'r3',farmer:'Nimal Fernando',  icon:'👨‍🌾',service:'Vacuum Packaging',rating:5,date:'2026-06-22',comment:'Perfect vacuum sealing for cinnamon. Shelf life improved significantly. Very professional service.'},
  {id:'r4',farmer:'Amara Jayaweera', icon:'👩‍🌾',service:'Eco-Friendly Bags',rating:4,date:'2026-06-18',comment:'Good eco packaging. Customers loved the biodegradable bags. Would prefer faster turnaround next time.'},
  {id:'r5',farmer:'Rajan Muthu',     icon:'👨‍🌾',service:'Custom Branding', rating:5,date:'2026-06-15',comment:'Amazing branding work! Coconut oil bottles looked very premium. Sales improved after rebranding. 10/10!'},
];
function PackagingReviews() {
  const avg=(PKG_REVIEWS.reduce((s,r)=>s+r.rating,0)/PKG_REVIEWS.length).toFixed(1);
  const dist=[5,4,3,2,1].map(star=>({star,count:PKG_REVIEWS.filter(r=>r.rating===star).length}));
  const [filter,setFilter]=useState(0);
  const filtered=filter===0?PKG_REVIEWS:PKG_REVIEWS.filter(r=>r.rating===filter);
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Reviews & Ratings</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{PKG_REVIEWS.length} customer reviews</p></div>
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:20,background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,marginBottom:20,boxShadow:ds.shadow}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRight:`1px solid ${ds.borderLt}`,paddingRight:20}}>
          <p style={{fontFamily:ds.fontM,fontSize:48,fontWeight:800,color:ds.green,margin:'0 0 4px'}}>{avg}</p>
          <p style={{margin:'0 0 6px',fontSize:'1.2rem'}}>{'⭐'.repeat(Math.round(Number(avg)))}</p>
          <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>Based on {PKG_REVIEWS.length} reviews</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:4}}>
          {dist.map(d=>(
            <div key={d.star} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setFilter(filter===d.star?0:d.star)}>
              <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,width:36}}>{d.star} ⭐</span>
              <div style={{flex:1,background:ds.borderLt,borderRadius:99,height:8}}><div style={{width:`${(d.count/PKG_REVIEWS.length)*100}%`,height:'100%',background:d.star>=4?ds.green:d.star===3?ds.amber:ds.red,borderRadius:99}}/></div>
              <span style={{fontFamily:ds.fontM,fontSize:12,color:ds.text,width:16}}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {[{label:'All',val:0},...[5,4,3,2,1].map(s=>({label:`${s} ⭐`,val:s}))].map(f=>(
          <button key={f.val} onClick={()=>setFilter(f.val)} style={{padding:'6px 14px',borderRadius:99,border:`1px solid ${filter===f.val?ds.green:ds.border}`,background:filter===f.val?ds.green:ds.surface,color:filter===f.val?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>{f.label}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.map(r=>(
          <div key={r.id} style={{background:ds.surface,borderRadius:14,border:`1px solid ${ds.border}`,padding:20,boxShadow:ds.shadow}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
              <div style={{display:'flex',gap:10}}><div style={{width:40,height:40,borderRadius:'50%',background:ds.greenLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{r.icon}</div><div><p style={{fontFamily:ds.fontB,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 2px'}}>{r.farmer}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:0}}>{r.service}</p></div></div>
              <div style={{textAlign:'right'}}><p style={{fontFamily:ds.fontB,fontSize:16,margin:'0 0 2px'}}>{'⭐'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{r.date}</p></div>
            </div>
            <p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'0 0 12px',lineHeight:1.7,fontStyle:'italic'}}>"{r.comment}"</p>
            <div style={{display:'flex',gap:8}}>
              <button style={{padding:'5px 12px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>👍 Thank</button>
              <button style={{padding:'5px 12px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:12,cursor:'pointer'}}>💬 Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages ─────────────────────────────────────────────────────────────────
const PKG_CONVOS = [
  {id:'pm1',name:'Sunil Perera',   icon:'👨‍🌾',lastMsg:'Can you do 500 eco bags by Friday?',    time:'15 min ago',unread:2,online:true},
  {id:'pm2',name:'Kamala Silva',   icon:'👩‍🌾',lastMsg:'Export cartons arrived perfectly!',    time:'2 hr ago',  unread:0,online:false},
  {id:'pm3',name:'Rajan Muthu',    icon:'👨‍🌾',lastMsg:'What is custom branding turnaround?',  time:'Yesterday', unread:1,online:true},
];
const PKG_MSG:Record<string,{from:'me'|'them';text:string;time:string}[]>={
  pm1:[{from:'them',text:'I need eco-friendly packaging for 500 bags of paddy.',time:'9:00 AM'},{from:'me',text:'We can do that! Biodegradable jute bags with printed labels.',time:'9:10 AM'},{from:'them',text:'Can you do 500 eco bags by Friday?',time:'10:00 AM'}],
};

function PackagingMessages() {
  const [active,setActive]=useState('pm1');
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState(PKG_MSG);
  const send=()=>{if(!input.trim())return;setMsgs(p=>({...p,[active]:[...(p[active]||[]),{from:'me',text:input.trim(),time:'Just now'}]}));setInput('');};
  const convo=PKG_CONVOS.find(c=>c.id===active)!;
  const thread=msgs[active]||[];
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Messages</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Chat with farmers about packaging requirements</p></div>
      <div style={{display:'flex',background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow,height:520}}>
        <div style={{width:260,flexShrink:0,borderRight:`1px solid ${ds.borderLt}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:`1px solid ${ds.borderLt}`}}><div style={{display:'flex',alignItems:'center',gap:6,background:ds.bg,borderRadius:7,padding:'6px 10px'}}><Search style={{width:12,height:12,color:ds.textTer}}/><input placeholder="Search…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:12,background:'transparent',width:'100%'}}/></div></div>
          <div style={{flex:1,overflowY:'auto'}}>
            {PKG_CONVOS.map(c=>(
              <div key={c.id} onClick={()=>setActive(c.id)} style={{display:'flex',gap:9,padding:'11px 14px',cursor:'pointer',background:active===c.id?ds.greenLt:'transparent',borderBottom:`1px solid ${ds.borderLt}`}}>
                <div style={{position:'relative',flexShrink:0}}><div style={{width:38,height:38,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{c.icon}</div>{c.online&&<span style={{position:'absolute',bottom:0,right:0,width:9,height:9,background:'#22c55e',borderRadius:'50%',border:`2px solid ${ds.surface}`}}/>}</div>
                <div style={{flex:1,minWidth:0}}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text}}>{c.name}</span><span style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer}}>{c.time}</span></div><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.lastMsg}</p></div>
                {c.unread>0&&<span style={{alignSelf:'center',minWidth:16,height:16,background:ds.green,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ds.fontB,fontSize:10,fontWeight:700,color:'#fff'}}>{c.unread}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 18px',borderBottom:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',gap:9}}><div style={{width:34,height:34,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{convo.icon}</div><div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>{convo.name}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:convo.online?'#22c55e':ds.textTer,margin:0}}>{convo.online?'Online':'Offline'}</p></div></div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
            {thread.length===0&&<p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer,textAlign:'center',marginTop:40}}>No messages yet.</p>}
            {thread.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.from==='me'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'70%',background:m.from==='me'?ds.green:ds.bg,color:m.from==='me'?'#fff':ds.text,borderRadius:m.from==='me'?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'9px 13px'}}>
                  <p style={{fontFamily:ds.fontB,fontSize:12,margin:0,lineHeight:1.5}}>{m.text}</p>
                  <p style={{fontFamily:ds.fontB,fontSize:9,color:m.from==='me'?'rgba(255,255,255,0.7)':ds.textTer,margin:'3px 0 0',textAlign:'right'}}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'10px 14px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',gap:7}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message…" style={{flex:1,padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:9,fontFamily:ds.fontB,fontSize:12,color:ds.text,outline:'none'}}/>
            <button onClick={send} style={{padding:'9px 18px',background:ds.green,color:'#fff',border:'none',borderRadius:9,fontFamily:ds.fontB,fontWeight:600,fontSize:12,cursor:'pointer'}}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function PackagingSettings() {
  const bizName=localStorage.getItem('businessName')||localStorage.getItem('userName')||'My Packaging Co.';
  const [profile,setProfile]=useState({name:bizName,phone:'+94 77 000 0000',email:localStorage.getItem('userEmail')||'',district:localStorage.getItem('userDistrict')||'',description:'Professional agricultural packaging services for Sri Lankan farmers.',minOrder:'25 units'});
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontSize:14,color:ds.text,outline:'none',boxSizing:'border-box'};
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Settings</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Manage your packaging business profile and preferences</p></div>
      {saved&&<div style={{background:ds.greenLt,border:`1px solid ${ds.greenBd}`,borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}><CheckCircle style={{width:16,height:16,color:ds.green}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.green,fontWeight:600}}>Saved successfully!</span></div>}
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>📦 Business Profile</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[{l:'Business Name',k:'name'},{l:'Phone',k:'phone'},{l:'Email',k:'email'},{l:'District',k:'district'},{l:'Min Order Quantity',k:'minOrder'}].map(f=>(
              <div key={f.k}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.l}</label><input value={(profile as any)[f.k]} onChange={e=>setProfile(p=>({...p,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
            <div style={{gridColumn:'1/-1'}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>Description</label><textarea value={profile.description} onChange={e=>setProfile(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:'vertical'}}/></div>
          </div>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>🔔 Notifications</p>
          {['New packaging request','Order accepted by system','Pricing update published','Customer message received','Review posted'].map((n,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<4?`1px solid ${ds.borderLt}`:'none'}}>
              <span style={{fontFamily:ds.fontB,fontSize:13,color:ds.text}}>{n}</span>
              <div onClick={() => {
                const isChecked = profile[n as keyof typeof profile] !== false;
                setProfile(p => ({...p, [n]: !isChecked}));
              }} style={{width:44,height:24,background:profile[n as keyof typeof profile] !== false?ds.green:'#e5e7eb',borderRadius:99,position:'relative',cursor:'pointer',transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:2,left:profile[n as keyof typeof profile] !== false?22:2,width:20,height:20,background:'#fff',borderRadius:'50%',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>🔐 Security</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:600}}>
            {['Current Password','New Password','Confirm Password'].map((l,i)=>(
              <div key={i} style={i===2?{gridColumn:'1/2'}:{}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{l}</label><input type="password" placeholder="••••••••" style={inp}/></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}><button onClick={save} style={{padding:'10px 28px',background:ds.green,color:'#fff',border:'none',borderRadius:10,fontFamily:ds.fontB,fontWeight:700,fontSize:14,cursor:'pointer'}}>Save Changes</button><button style={{padding:'10px 20px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:10,fontFamily:ds.fontB,fontSize:14,cursor:'pointer'}}>Reset</button></div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function PackagingProviderDashboard({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const [collapsed,setCollapsed]=useState(false);
  const [section,setSection]=useState('dashboard');
  const render=()=>{
    switch(section){
      case 'dashboard': return <DashboardHome setSection={setSection}/>;
      case 'orders':    return <OrdersSection/>;
      case 'services':  return <ServicesCatalog/>;
      case 'requests':  return <CustomerRequests/>;
      case 'pricing':   return <PricingManagement/>;
      case 'history':   return <OrderHistory/>;
      case 'analytics': return <AnalyticsSection/>;
      case 'reviews':   return <PackagingReviews/>;
      case 'messages':  return <PackagingMessages/>;
      case 'settings':  return <PackagingSettings/>;
      default: return null;
    }
  };
  return (
    <div style={{minHeight:'100vh',background:ds.bg,display:'flex',fontFamily:ds.fontB}}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={setSection} onNavigate={onNavigate}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <TopNav section={section}/>
        <main style={{flex:1,overflowY:'auto',padding:24}}>{render()}</main>
      </div>
    </div>
  );
}
