import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Truck, Ship, MapPin, Car, History,
  BarChart2, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Plus,
  Eye, Check, X, Download, TrendingUp, Clock,
  CheckCircle, ArrowUpRight, Package, Globe,
  AlertTriangle, Navigation, User, Fuel,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ds = {
  sidebar:    'linear-gradient(170deg,#0a1e2e 0%,#0f3352 50%,#0a2540 100%)',
  blue:       '#2563eb', blueLt: '#eff6ff', blueBd: '#bfdbfe',
  green:      '#16a34a', greenLt:'#f0fdf4', greenBd:'#dcfce7',
  bg:         '#f8fafc', surface:'#ffffff',
  border:     '#e2e8f0', borderLt:'#f1f5f9',
  text:       '#0f172a', textSec:'#475569', textTer:'#94a3b8',
  shadow:     '0 1px 3px rgba(0,0,0,0.07)',
  fontD:      "'Plus Jakarta Sans',sans-serif",
  fontB:      "'Inter',sans-serif",
  fontM:      "'JetBrains Mono',monospace",
  amber:      '#f59e0b', amberLt:'#fffbeb', amberBd:'#fde68a',
  red:        '#ef4444', redLt:  '#fef2f2', redBd:  '#fecaca',
  purple:     '#8b5cf6', purpleLt:'#f5f3ff', purpleBd:'#ddd6fe',
  teal:       '#0891b2', tealLt: '#ecfeff', tealBd: '#a5f3fc',
};

type DelStatus  = 'Pending'|'Accepted'|'In Transit'|'Delivered'|'Rejected';
type ExpStatus  = 'Pending'|'Processing'|'Customs Clearance'|'Exported'|'Rejected';
type VehStatus  = 'Available'|'In Transit'|'Maintenance';

interface DeliveryReq {
  id:string; farmer:string; farmerIcon:string; customer:string; pickup:string; drop:string;
  product:string; qty:string; date:string; status:DelStatus; price:number; distance:string;
}
interface ExportReq {
  id:string; farmer:string; farmerIcon:string; product:string; destination:string; qty:string;
  status:ExpStatus; documents:string[]; customs:string; price:number; date:string;
}
interface Shipment {
  id:string; farmer:string; driver:string; driverIcon:string; vehicle:string; from:string; to:string;
  progress:number; status:DelStatus; eta:string; product:string;
}
interface Vehicle {
  id:string; emoji:string; type:string; plate:string; status:VehStatus; driver:string; capacity:string; lastService:string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const DELIVERIES: DeliveryReq[] = [
  { id:'DLV-2891', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', customer:'Manning Market, Colombo', pickup:'Anuradhapura', drop:'Colombo Pettah', product:'Paddy Rice',     qty:'2,000 kg', date:'2026-07-08', status:'Pending',    price:12000, distance:'185 km' },
  { id:'DLV-2890', farmer:'Kamala Silva',    farmerIcon:'👩‍🌾', customer:'Keells Super, Kandy',     pickup:'Kandy',        drop:'Kandy City',     product:'Vegetables',     qty:'800 kg',   date:'2026-07-07', status:'In Transit', price:4500,  distance:'22 km'  },
  { id:'DLV-2889', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', customer:'Laugfs Eco Store',        pickup:'Galle',        drop:'Colombo 03',     product:'Organic Spices', qty:'350 kg',   date:'2026-07-06', status:'Delivered',  price:18000, distance:'116 km' },
  { id:'DLV-2888', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', customer:'Local Supermarket',       pickup:'Jaffna',       drop:'Colombo 07',     product:'Fresh Fruits',   qty:'600 kg',   date:'2026-07-05', status:'Accepted',   price:22000, distance:'395 km' },
  { id:'DLV-2887', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', customer:'Wholesale Market',        pickup:'Batticaloa',   drop:'Kandy',          product:'Banana',         qty:'1,200 kg', date:'2026-07-04', status:'Delivered',  price:8500,  distance:'174 km' },
  { id:'DLV-2886', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', customer:'Export Agent, BIA',       pickup:'Kurunegala',   drop:'BIA, Katunayake',product:'Cinnamon',       qty:'500 kg',   date:'2026-07-03', status:'Delivered',  price:15000, distance:'92 km'  },
];

const EXPORTS: ExportReq[] = [
  { id:'EXP-0441', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', product:'Ceylon Cinnamon',   destination:'Germany',     qty:'1,200 kg', status:'Customs Clearance', documents:['Phytosanitary','Certificate of Origin','Commercial Invoice'], customs:'Under Review', price:285000, date:'2026-07-05' },
  { id:'EXP-0440', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', product:'Organic Tea',        destination:'Japan',       qty:'800 kg',   status:'Processing',        documents:['Export License','Invoice','Packing List'],                     customs:'Not Started',  price:192000, date:'2026-07-04' },
  { id:'EXP-0439', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', product:'Black Pepper',       destination:'UAE',         qty:'600 kg',   status:'Exported',          documents:['All Documents Cleared'],                                         customs:'Approved',     price:168000, date:'2026-07-01' },
  { id:'EXP-0438', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', product:'Fresh Pineapples',   destination:'Singapore',   qty:'2,000 kg', status:'Pending',           documents:['Phytosanitary Required','Invoice Pending'],                      customs:'Not Started',  price:95000,  date:'2026-07-06' },
  { id:'EXP-0437', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', product:'Coconut Products',   destination:'Netherlands', qty:'3,000 kg', status:'Processing',        documents:['EU Organic Cert','Invoice','Origin Certificate'],                 customs:'In Review',    price:340000, date:'2026-07-03' },
];

const SHIPMENTS: Shipment[] = [
  { id:'DLV-2890', farmer:'Kamala Silva', driver:'Asanka Perera', driverIcon:'🧑‍✈️', vehicle:'LT-5892 · Lorry',   from:'Kandy', to:'Kandy City Center', progress:65, status:'In Transit', eta:'45 min',  product:'Vegetables — 800 kg' },
  { id:'DLV-2888', farmer:'Priya Kumar',  driver:'Ruwan Silva',   driverIcon:'🧑‍✈️', vehicle:'WP-3341 · Van',     from:'Jaffna',to:'Colombo 07',          progress:22, status:'In Transit', eta:'5h 20min',product:'Fresh Fruits — 600 kg' },
];

const VEHICLES: Vehicle[] = [
  { id:'VH-01', emoji:'🚚', type:'10-Ton Lorry',      plate:'LT-5892', status:'In Transit',   driver:'Asanka Perera', capacity:'10,000 kg', lastService:'2026-06-15' },
  { id:'VH-02', emoji:'🚐', type:'Mini Van',          plate:'WP-3341', status:'In Transit',   driver:'Ruwan Silva',   capacity:'1,500 kg',  lastService:'2026-06-28' },
  { id:'VH-03', emoji:'🚛', type:'Refrigerated Truck',plate:'NW-7721', status:'Available',    driver:'Chamara Dias',  capacity:'8,000 kg',  lastService:'2026-07-01' },
  { id:'VH-04', emoji:'🚜', type:'Flatbed Truck',     plate:'SG-4412', status:'Available',    driver:'Unassigned',    capacity:'12,000 kg', lastService:'2026-06-20' },
  { id:'VH-05', emoji:'🚗', type:'Pickup Truck',      plate:'KN-8832', status:'Maintenance',  driver:'Unassigned',    capacity:'800 kg',    lastService:'2026-05-10' },
];

const MONTHLY = [
  { month:'Jan', deliveries:48, exports:12, revenue:385 },
  { month:'Feb', deliveries:62, exports:15, revenue:492 },
  { month:'Mar', deliveries:71, exports:18, revenue:568 },
  { month:'Apr', deliveries:58, exports:14, revenue:445 },
  { month:'May', deliveries:84, exports:22, revenue:672 },
  { month:'Jun', deliveries:96, exports:28, revenue:782 },
  { month:'Jul', deliveries:79, exports:24, revenue:651 },
];

const TYPE_DIST = [
  { name:'Local Delivery', value:52, color:ds.blue   },
  { name:'Inter-City',     value:28, color:ds.green  },
  { name:'Export',         value:20, color:ds.purple },
];

const ACTIVITIES = [
  { time:'10 min ago', icon:'📋', text:'New delivery request DLV-2891 from Sunil Perera — Paddy Rice, Anuradhapura → Colombo', color:ds.blue   },
  { time:'1 hr ago',   icon:'🚚', text:'Shipment DLV-2890 dispatched — Driver Asanka Perera, Kandy route',                     color:ds.teal   },
  { time:'2 hr ago',   icon:'✅', text:'Delivery DLV-2889 completed — Organic Spices delivered to Laugfs Eco Store',           color:ds.green  },
  { time:'3 hr ago',   icon:'✈️', text:'Export EXP-0439 approved — Black Pepper, 600 kg shipped to UAE',                       color:ds.purple },
  { time:'Yesterday',  icon:'📄', text:'Export EXP-0441 customs documentation submitted for review',                            color:ds.amber  },
  { time:'Yesterday',  icon:'💰', text:'Payment received Rs 168,000 for export EXP-0439',                                       color:ds.green  },
];

const delStatusCfg: Record<DelStatus,{bg:string;color:string;dot:string}> = {
  Pending:    {bg:ds.amberLt,  color:'#92400e', dot:ds.amber  },
  Accepted:   {bg:ds.blueLt,   color:'#1e40af', dot:ds.blue   },
  'In Transit':{bg:ds.tealLt,  color:'#164e63', dot:ds.teal   },
  Delivered:  {bg:ds.greenLt,  color:'#166534', dot:ds.green  },
  Rejected:   {bg:ds.redLt,    color:'#991b1b', dot:ds.red    },
};
const expStatusCfg: Record<ExpStatus,{bg:string;color:string;dot:string}> = {
  Pending:            {bg:ds.amberLt,  color:'#92400e', dot:ds.amber  },
  Processing:         {bg:ds.blueLt,   color:'#1e40af', dot:ds.blue   },
  'Customs Clearance':{bg:ds.purpleLt, color:'#5b21b6', dot:ds.purple },
  Exported:           {bg:ds.greenLt,  color:'#166534', dot:ds.green  },
  Rejected:           {bg:ds.redLt,    color:'#991b1b', dot:ds.red    },
};
const vehStatusCfg: Record<VehStatus,{bg:string;color:string;dot:string}> = {
  Available:   {bg:ds.greenLt, color:'#166534', dot:ds.green},
  'In Transit':{bg:ds.tealLt,  color:'#164e63', dot:ds.teal },
  Maintenance: {bg:ds.amberLt, color:'#92400e', dot:ds.amber},
};

// ─── Primitives ────────────────────────────────────────────────────────────────
const Badge = ({label,cfg}:{label:string;cfg:{bg:string;color:string;dot?:string}}) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>
    {cfg.dot&&<span style={{width:5,height:5,borderRadius:'50%',background:cfg.dot,flexShrink:0}}/>}{label}
  </span>
);
const TH = ({c}:{c:string}) => <th style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.07em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`,background:ds.bg,whiteSpace:'nowrap'}}>{c}</th>;
const TD = ({children,mono}:{children:React.ReactNode;mono?:boolean}) => <td style={{padding:'13px 16px',fontFamily:mono?ds.fontM:ds.fontB,fontSize:13,color:ds.text,borderBottom:`1px solid ${ds.borderLt}`,verticalAlign:'middle'}}>{children}</td>;
const Btn = ({label,icon,variant='primary',onClick,size='md'}:{label:string;icon?:React.ReactNode;variant?:'primary'|'secondary'|'danger';onClick?:()=>void;size?:'sm'|'md'}) => {
  const v={primary:{background:ds.blue,color:'#fff',border:'none'},secondary:{background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`},danger:{background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`}}[variant];
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
  {id:'dashboard', label:'Dashboard',         icon:LayoutDashboard},
  {id:'delivery',  label:'Delivery Requests', icon:Truck},
  {id:'export',    label:'Export Requests',   icon:Ship},
  {id:'tracking',  label:'Shipment Tracking', icon:Navigation},
  {id:'vehicles',  label:'Vehicles & Drivers',icon:Car},
  {id:'history',   label:'Delivery History',  icon:History},
  {id:'analytics', label:'Analytics',         icon:BarChart2},
  {id:'messages',  label:'Messages',          icon:MessageSquare},
  {id:'settings',  label:'Settings',          icon:Settings},
];

function Sidebar({collapsed,setCollapsed,active,setActive,onNavigate}:{collapsed:boolean;setCollapsed:(v:boolean)=>void;active:string;setActive:(s:string)=>void;onNavigate:(p:string)=>void}) {
  return (
    <aside style={{width:collapsed?66:248,flexShrink:0,background:ds.sidebar,display:'flex',flexDirection:'column',transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <div style={{padding:collapsed?'20px 15px':'20px 20px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,0.08)',justifyContent:collapsed?'center':'flex-start',minHeight:68,flexShrink:0}}>
        <div style={{width:34,height:34,background:'rgba(255,255,255,0.12)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,0.15)'}}><span style={{fontSize:17}}>🚚</span></div>
        {!collapsed&&<div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:800,color:'#fff',margin:0,lineHeight:1.2}}>NagroMS</p><p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.5)',margin:0}}>Delivery & Export</p></div>}
      </div>
      <nav style={{flex:1,padding:'12px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {NAV.map(item=>{const Icon=item.icon;const isActive=active===item.id;return(
          <button key={item.id} onClick={()=>setActive(item.id)} title={collapsed?item.label:undefined} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:isActive?'rgba(255,255,255,0.14)':'transparent',color:isActive?'#fff':'rgba(255,255,255,0.55)',fontFamily:ds.fontB,fontSize:13,fontWeight:isActive?600:400,transition:'all 0.15s',boxShadow:isActive?'inset 0 0 0 1px rgba(255,255,255,0.18)':'none'}}>
            <Icon style={{width:16,height:16,flexShrink:0}}/>{!collapsed&&<span style={{flex:1,textAlign:'left',whiteSpace:'nowrap'}}>{item.label}</span>}
          </button>
        );})}
      </nav>
      <div style={{padding:'10px 8px',borderTop:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
        <button onClick={()=>onNavigate('landing')} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:4,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',fontFamily:ds.fontB,fontSize:12,fontWeight:500}}><LayoutDashboard style={{width:14,height:14,flexShrink:0}}/>{!collapsed&&'Main Dashboard'}</button>
        <button onClick={()=>onNavigate('landing')} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',background:'transparent',color:'rgba(255,255,255,0.4)',fontFamily:ds.fontB,fontSize:12}}><LogOut style={{width:14,height:14,flexShrink:0}}/>{!collapsed&&'Logout'}</button>
        <button onClick={()=>setCollapsed(!collapsed)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',marginTop:4,fontFamily:ds.fontB,fontSize:11}}>
          {collapsed?<ChevronRight style={{width:14,height:14}}/>:<><ChevronLeft style={{width:14,height:14}}/><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

// ─── Top Nav ───────────────────────────────────────────────────────────────────
function TopNav({section}:{section:string}) {
  const labels:Record<string,string>={dashboard:'Dashboard Overview',delivery:'Delivery Requests',export:'Export Requests',tracking:'Shipment Tracking',vehicles:'Vehicles & Drivers',history:'Delivery History',analytics:'Analytics & Reports',messages:'Messages',settings:'Settings'};
  const name=localStorage.getItem('userName')||localStorage.getItem('businessName')||'Provider';
  return (
    <header style={{height:60,background:ds.surface,borderBottom:`1px solid ${ds.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:30,flexShrink:0}}>
      <div>
        <h1 style={{fontFamily:ds.fontD,fontSize:16,fontWeight:700,color:ds.text,margin:0}}>{labels[section]||'Dashboard'}</h1>
        <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>Delivery & Export Portal · NagroMS</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',width:210}}>
          <Search style={{width:13,height:13,color:ds.textTer}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.textTer}}>Search requests…</span>
        </div>
        <button style={{position:'relative',width:36,height:36,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Bell style={{width:15,height:15,color:ds.textSec}}/><span style={{position:'absolute',top:6,right:7,width:7,height:7,background:ds.red,borderRadius:'50%',border:`2px solid ${ds.surface}`}}/></button>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.blueLt,border:`1px solid ${ds.blueBd}`,borderRadius:9,padding:'4px 11px 4px 4px',cursor:'pointer'}}>
          <div style={{width:26,height:26,background:`linear-gradient(135deg,${ds.blue},#3b82f6)`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🚚</div>
          <div><p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:0}}>{name.split(' ')[0]}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>Delivery Provider</p></div>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome({setSection}:{setSection:(s:string)=>void}) {
  const pending=DELIVERIES.filter(d=>d.status==='Pending').length;
  const active=DELIVERIES.filter(d=>d.status==='In Transit').length;
  const completed=DELIVERIES.filter(d=>d.status==='Delivered').length;
  const rev=MONTHLY[MONTHLY.length-1].revenue;
  return (
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#0a1e2e 0%,#1e3a6e 40%,#2563eb 100%)',borderRadius:20,padding:'26px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'absolute',bottom:-50,right:140,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.03)'}}/>
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.12)',borderRadius:99,padding:'3px 10px',marginBottom:10}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80'}}/><span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>Active · Delivery & Export Provider</span>
            </div>
            <h2 style={{fontFamily:ds.fontD,fontSize:24,fontWeight:800,color:'#fff',margin:'0 0 6px'}}>Good morning! 🚚</h2>
            <p style={{fontFamily:ds.fontB,fontSize:13,color:'rgba(255,255,255,0.7)',margin:0}}>{active} shipments in transit · {pending} requests awaiting your response.</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[{label:'In Transit',value:String(active)},{label:'Monthly Rev',value:`Rs ${rev}K`},{label:'Exports',value:String(EXPORTS.filter(e=>e.status!=='Exported').length)+' active'}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',borderRadius:14,padding:'12px 18px',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center',minWidth:95}}>
                <p style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 2px'}}>{s.value}</p>
                <p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.65)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:14,marginBottom:24}}>
        <KpiCard label="Total Requests"    value={String(DELIVERIES.length)} sub="All deliveries"       icon={<Package style={{width:18,height:18}}/>}     iconBg={ds.blueLt}   iconColor={ds.blue}   trend="+12%"/>
        <KpiCard label="Active Deliveries" value={String(active)}            sub="Currently in transit" icon={<Truck style={{width:18,height:18}}/>}        iconBg={ds.tealLt}   iconColor={ds.teal}/>
        <KpiCard label="Pending"           value={String(pending)}           sub="Awaiting response"    icon={<Clock style={{width:18,height:18}}/>}        iconBg={ds.amberLt}  iconColor={ds.amber}/>
        <KpiCard label="Completed"         value={String(completed)}         sub="Successfully delivered"icon={<CheckCircle style={{width:18,height:18}}/>} iconBg={ds.greenLt}  iconColor={ds.green}  trend="+18%"/>
        <KpiCard label="Export Orders"     value={String(EXPORTS.length)}    sub="International exports" icon={<Globe style={{width:18,height:18}}/>}       iconBg={ds.purpleLt} iconColor={ds.purple}/>
        <KpiCard label="Monthly Revenue"   value={`Rs ${rev}K`}              sub="Jul 2026"             icon={<TrendingUp style={{width:18,height:18}}/>}   iconBg={ds.greenLt}  iconColor={ds.green}  trend="+14%"/>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 280px',gap:16,marginBottom:24}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Monthly Deliveries & Exports</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={MONTHLY} margin={{top:2,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/>
              <Line type="monotone" dataKey="deliveries" stroke={ds.blue} strokeWidth={2.5} dot={{r:4,fill:ds.blue,strokeWidth:0}} name="Deliveries"/>
              <Line type="monotone" dataKey="exports" stroke={ds.purple} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Exports"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Monthly Revenue (Rs Thousands)</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={MONTHLY} margin={{top:2,right:4,left:-20,bottom:0}} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']}/>
              <Bar dataKey="revenue" fill={ds.blue} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 4px'}}>Delivery Type Split</p>
          <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:'0 0 8px'}}>By request volume</p>
          <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={TYPE_DIST} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">{TYPE_DIST.map((d)=><Cell key={`del-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
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
            {[{label:'Add Delivery Vehicle',icon:<Plus style={{width:13,height:13}}/>,color:ds.blue,bg:ds.blueLt, action: () => setSection('vehicles')},{label:'Assign Driver',icon:<User style={{width:13,height:13}}/>,color:ds.green,bg:ds.greenLt, action: () => setSection('vehicles')},{label:'Update Shipment',icon:<Navigation style={{width:13,height:13}}/>,color:ds.teal,bg:ds.tealLt, action: () => setSection('tracking')},{label:'Create Export Entry',icon:<Globe style={{width:13,height:13}}/>,color:ds.purple,bg:ds.purpleLt, action: () => setSection('export')},{label:'View Reports',icon:<BarChart2 style={{width:13,height:13}}/>,color:ds.textSec,bg:ds.bg, action: () => exportToCSV('delivery_reports.csv', DELIVERIES)}].map(a=>(
              <button key={a.label} onClick={a.action} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 12px',background:a.bg,border:`1px solid ${a.color}22`,borderRadius:10,cursor:'pointer',fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:a.color,marginBottom:8}}>{a.icon}{a.label}</button>
            ))}
          </div>
          <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
            <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 12px'}}>Fleet Status</p>
            {vehicles.map(v=>(
              <div key={v.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18}}>{v.emoji}</span><div><p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:0}}>{v.plate}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>{v.type}</p></div></div>
                <Badge label={v.status} cfg={vehStatusCfg[v.status]}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Requests ─────────────────────────────────────────────────────────
function DeliveryRequests() {
  const [deliveries,setDeliveries]=useState(DELIVERIES);
  const [viewDelivery, setViewDelivery] = useState<any>(null);
  const [filter,setFilter]=useState('All');
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);const perPage=5;
  const update=(id:string,s:DelStatus)=>setDeliveries(p=>p.map(d=>d.id===id?{...d,status:s}:d));
  const filtered=useMemo(()=>deliveries.filter(d=>(filter==='All'||d.status===filter)&&(d.farmer.toLowerCase().includes(search.toLowerCase())||d.product.toLowerCase().includes(search.toLowerCase()))),[deliveries,filter,search]);
  const paged=filtered.slice((page-1)*perPage,page*perPage);
  const total=Math.ceil(filtered.length/perPage);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Delivery Requests</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{deliveries.length} total requests</p></div><Btn label="Export" icon={<Download style={{width:13,height:13}}/>} variant="secondary" onClick={() => exportToCSV('deliveries.csv', deliveries)}/></div>
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',flex:1,minWidth:200}}>
          <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search requests…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['All','Pending','Accepted','In Transit','Delivered','Rejected'].map(f=><button key={f} onClick={()=>{setFilter(f);setPage(1);}} style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${filter===f?ds.blue:ds.border}`,background:filter===f?ds.blue:ds.surface,color:filter===f?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>{f}</button>)}
        </div>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:1000}}>
          <thead><tr><TH c="Request ID"/><TH c="Farmer"/><TH c="Customer"/><TH c="Pickup"/><TH c="Drop"/><TH c="Product"/><TH c="Quantity"/><TH c="Date"/><TH c="Status"/><TH c="Price"/><TH c="Actions"/></tr></thead>
          <tbody>{paged.map((d,i)=>(
            <tr key={d.id} style={{background:i%2===0?ds.surface:'#fafafa'}}>
              <TD><span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.blue}}>{d.id}</span></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:18}}>{d.farmerIcon}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600}}>{d.farmer}</span></div></TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{d.customer}</span></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:4,fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}><MapPin style={{width:11,height:11,color:ds.green,flexShrink:0}}/>{d.pickup}</div></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:4,fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}><MapPin style={{width:11,height:11,color:ds.red,flexShrink:0}}/>{d.drop}</div></TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:ds.bg,borderRadius:6,color:ds.textSec}}>{d.product}</span></TD>
              <TD mono>{d.qty}</TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{d.date}</span></TD>
              <TD><Badge label={d.status} cfg={delStatusCfg[d.status]}/></TD>
              <TD mono><strong style={{color:ds.blue}}>Rs {d.price.toLocaleString()}</strong></TD>
              <TD><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                <button onClick={() => setViewDelivery(d)} style={{padding:'4px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Eye style={{width:11,height:11}}/>View</button>
                {d.status==='Pending'&&<><button onClick={()=>update(d.id,'Accepted')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Check style={{width:11,height:11}}/>Accept</button><button onClick={()=>update(d.id,'Rejected')} style={{padding:'4px 8px',background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><X style={{width:11,height:11}}/>Reject</button></>}
                {d.status==='Accepted'&&<button onClick={()=>update(d.id,'In Transit')} style={{padding:'4px 8px',background:ds.tealLt,color:ds.teal,border:`1px solid ${ds.tealBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Dispatch</button>}
                {d.status==='In Transit'&&<button onClick={()=>update(d.id,'Delivered')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Delivered</button>}
              </div></TD>
            </tr>
          ))}</tbody>
        </table></div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===1?ds.textTer:ds.text,cursor:page===1?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Prev</button>
            {Array.from({length:total},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${page===i+1?ds.blue:ds.border}`,background:page===i+1?ds.blue:ds.surface,color:page===i+1?'#fff':ds.text,cursor:'pointer',fontFamily:ds.fontB,fontSize:12}}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===total?ds.textTer:ds.text,cursor:page===total?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export Requests ───────────────────────────────────────────────────────────
function ExportRequests() {
  const [exports,setExports]=useState(EXPORTS);
  const [filter,setFilter]=useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewExport, setViewExport] = useState<any>(null);
  const update=(id:string,s:ExpStatus)=>setExports(p=>p.map(e=>e.id===id?{...e,status:s}:e));
  const filtered=filter==='All'?exports:exports.filter(e=>e.status===filter);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Export Requests</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>International export order management</p></div><Btn label="Create Export Entry" icon={<Plus style={{width:13,height:13}}/>} onClick={() => setShowAddModal(true)}/></div>
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {['All','Pending','Processing','Customs Clearance','Exported','Rejected'].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${filter===f?ds.blue:ds.border}`,background:filter===f?ds.blue:ds.surface,color:filter===f?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{f}</button>)}
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
          <thead><tr><TH c="Export ID"/><TH c="Farmer"/><TH c="Product"/><TH c="Destination"/><TH c="Quantity"/><TH c="Export Status"/><TH c="Documents"/><TH c="Customs"/><TH c="Value"/><TH c="Actions"/></tr></thead>
          <tbody>{filtered.map((e,i)=>(
            <tr key={e.id} style={{background:i%2===0?ds.surface:'#fafafa'}}>
              <TD><span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.purple}}>{e.id}</span></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:18}}>{e.farmerIcon}</span><div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>{e.farmer}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{e.date}</p></div></div></TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.text}}>{e.product}</span></TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:4}}><Globe style={{width:12,height:12,color:ds.blue}}/><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{e.destination}</span></div></TD>
              <TD mono>{e.qty}</TD>
              <TD><Badge label={e.status} cfg={expStatusCfg[e.status]}/></TD>
              <TD><div style={{display:'flex',flexDirection:'column',gap:3}}>{e.documents.map((doc,j)=><span key={j} style={{fontFamily:ds.fontB,fontSize:10,padding:'2px 6px',background:doc.includes('Cleared')?ds.greenLt:doc.includes('Required')||doc.includes('Pending')?ds.amberLt:ds.primaryLt||ds.blueLt,color:doc.includes('Cleared')?ds.green:doc.includes('Required')||doc.includes('Pending')?ds.amber:ds.blue,borderRadius:4}}>{doc}</span>)}</div></TD>
              <TD><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:e.customs==='Approved'?ds.greenLt:e.customs==='Under Review'||e.customs==='In Review'?ds.amberLt:ds.bg,color:e.customs==='Approved'?ds.green:e.customs==='Under Review'||e.customs==='In Review'?ds.amber:ds.textSec,borderRadius:6,fontWeight:600}}>{e.customs}</span></TD>
              <TD mono><strong style={{color:ds.purple}}>Rs {e.price.toLocaleString()}</strong></TD>
              <TD><div style={{display:'flex',gap:5}}>
                <button onClick={() => setViewExport(e)} style={{padding:'4px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Eye style={{width:11,height:11}}/>Details</button>
                {e.status==='Pending'&&<button onClick={()=>update(e.id,'Processing')} style={{padding:'4px 8px',background:ds.blueLt,color:ds.blue,border:`1px solid ${ds.blueBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Process</button>}
                {e.status==='Processing'&&<button onClick={()=>update(e.id,'Customs Clearance')} style={{padding:'4px 8px',background:ds.purpleLt,color:ds.purple,border:`1px solid ${ds.purpleBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Submit Customs</button>}
                {e.status==='Customs Clearance'&&<button onClick={()=>update(e.id,'Exported')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Mark Exported</button>}
              </div></TD>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

// ─── Shipment Tracking ─────────────────────────────────────────────────────────
function ShipmentTracking() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Shipment Tracking</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{SHIPMENTS.length} active shipments in transit</p></div></div>

      {/* Map placeholder */}
      <div style={{background:'linear-gradient(135deg,#e0f2fe 0%,#dbeafe 50%,#ede9fe 100%)',borderRadius:18,border:`1px solid ${ds.blueBd}`,padding:'32px',marginBottom:20,position:'relative',overflow:'hidden',minHeight:180}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <span style={{fontSize:48}}>🗺️</span>
          <p style={{fontFamily:ds.fontD,fontSize:16,fontWeight:700,color:ds.blue,margin:0}}>Live Delivery Map</p>
          <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0,textAlign:'center'}}>Real-time GPS tracking integration · {SHIPMENTS.length} vehicles currently active</p>
        </div>
        {/* Decorative route lines */}
        <div style={{position:'absolute',top:20,left:30,width:60,height:60,borderRadius:'50%',background:'rgba(37,99,235,0.1)',border:'2px solid rgba(37,99,235,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:20}}>📍</span></div>
        <div style={{position:'absolute',bottom:20,right:30,width:60,height:60,borderRadius:'50%',background:'rgba(22,163,74,0.1)',border:'2px solid rgba(22,163,74,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:20}}>🏁</span></div>
        <div style={{position:'absolute',top:'40%',right:'25%',width:40,height:40,borderRadius:'50%',background:'rgba(37,99,235,0.15)',border:'2px solid rgba(37,99,235,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:16}}>🚚</span></div>
      </div>

      {/* Active shipment cards */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {SHIPMENTS.map(s=>(
          <div key={s.id} style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.tealBd}`,padding:'20px',boxShadow:ds.shadow}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:16}}>
              <div style={{display:'flex',gap:12}}>
                <div style={{width:48,height:48,borderRadius:12,background:ds.tealLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🚚</div>
                <div>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}><span style={{fontFamily:ds.fontM,fontSize:13,fontWeight:700,color:ds.teal}}>{s.id}</span><Badge label={s.status} cfg={delStatusCfg[s.status]}/></div>
                  <p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:'0 0 2px'}}>{s.product}</p>
                  <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>
                    <span style={{display:'flex',alignItems:'center',gap:3}}><MapPin style={{width:11,height:11,color:ds.green}}/>{s.from}</span>
                    <span style={{color:ds.textTer}}>→</span>
                    <span style={{display:'flex',alignItems:'center',gap:3}}><MapPin style={{width:11,height:11,color:ds.red}}/>{s.to}</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:4,justifyContent:'flex-end'}}><span style={{fontSize:18}}>{s.driverIcon}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{s.driver}</span></div>
                <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:'0 0 2px'}}>{s.vehicle}</p>
                <p style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.teal,margin:0}}>ETA: {s.eta}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>Delivery Progress</span>
                <span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.teal}}>{s.progress}%</span>
              </div>
              <div style={{background:ds.borderLt,borderRadius:99,height:10,overflow:'hidden'}}>
                <div style={{width:`${s.progress}%`,height:'100%',background:`linear-gradient(to right,${ds.blue},${ds.teal})`,borderRadius:99,transition:'width 0.5s'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                {['Order Accepted','Dispatched','In Transit','Near Destination','Delivered'].map((step,i)=>{
                  const pctThreshold=[0,20,40,80,100][i];
                  const done=s.progress>=pctThreshold;
                  return <span key={step} style={{fontFamily:ds.fontB,fontSize:10,color:done?ds.teal:ds.textTer,fontWeight:done?700:400}}>{step}</span>;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vehicles & Drivers ────────────────────────────────────────────────────────
function VehiclesDrivers() {
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [actionVehicle, setActionVehicle] = useState<{unit: any, action: 'assign'|'dispatch'|null}>( {unit: null, action: null} );
  const avail=vehicles.filter(v=>v.status==='Available').length;
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Vehicles & Drivers</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{vehicles.length} vehicles · {avail} available</p></div><Btn label="Add Vehicle" icon={<Plus style={{width:13,height:13}}/>}/></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:20}}>
        {[{label:'Total Fleet',value:String(vehicles.length),color:ds.blue,bg:ds.blueLt},{label:'Available',value:String(avail),color:ds.green,bg:ds.greenLt},{label:'In Transit',value:String(vehicles.filter(v=>v.status==='In Transit').length),color:ds.teal,bg:ds.tealLt},{label:'Maintenance',value:String(vehicles.filter(v=>v.status==='Maintenance').length),color:ds.amber,bg:ds.amberLt}].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:14,padding:'18px',border:`1px solid ${s.color}22`}}>
            <p style={{fontFamily:ds.fontM,fontSize:28,fontWeight:800,color:s.color,margin:'0 0 4px'}}>{s.value}</p>
            <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {vehicles.map(v=>(
          <div key={v.id} style={{background:ds.surface,borderRadius:16,border:`1px solid ${v.status==='Available'?ds.greenBd:v.status==='In Transit'?ds.tealBd:ds.amberBd}`,padding:'20px',boxShadow:ds.shadow}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:12,background:v.status==='Available'?ds.greenLt:v.status==='In Transit'?ds.tealLt:ds.amberLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{v.emoji}</div>
                <div>
                  <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 2px'}}>{v.type}</p>
                  <p style={{fontFamily:ds.fontM,fontSize:12,color:ds.textSec,margin:0}}>{v.plate}</p>
                </div>
              </div>
              <Badge label={v.status} cfg={vehStatusCfg[v.status]}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[{label:'Driver',value:v.driver},{label:'Capacity',value:v.capacity},{label:'Last Service',value:v.lastService},{label:'Vehicle ID',value:v.id}].map(d=>(
                <div key={d.label} style={{background:ds.bg,borderRadius:8,padding:'8px 10px'}}>
                  <p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0,textTransform:'uppercase',letterSpacing:'0.05em'}}>{d.label}</p>
                  <p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:'2px 0 0'}}>{d.value}</p>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn label="Assign Driver" icon={<User style={{width:12,height:12}}/>} variant="secondary" size="sm" onClick={() => setActionVehicle({unit: v, action: 'assign'})}/>
              {v.status==='Available'&&<Btn label="Dispatch" icon={<Truck style={{width:12,height:12}}/>} size="sm" onClick={() => setActionVehicle({unit: v, action: 'dispatch'})}/>}
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
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Analytics & Reports</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Delivery performance and revenue insights</p></div><Btn label="Export Report" icon={<Download style={{width:13,height:13}}/>} variant="secondary"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Delivery & Export Trends (2026)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/><Line type="monotone" dataKey="deliveries" stroke={ds.blue} strokeWidth={2.5} dot={{r:4,fill:ds.blue,strokeWidth:0}} name="Deliveries"/><Line type="monotone" dataKey="exports" stroke={ds.purple} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Exports"/></LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Revenue Growth (Rs Thousands)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}} barCategoryGap="40%"><CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']} /><Bar dataKey="revenue" fill={ds.blue} radius={[6,6,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 16px'}}>Most Delivered Products</p>
          {[{emoji:'🌾',name:'Paddy Rice',qty:'12,400 kg',rev:'Rs 85K'},{emoji:'🍅',name:'Vegetables',qty:'8,200 kg',rev:'Rs 62K'},{emoji:'🧄',name:'Organic Spices',qty:'3,800 kg',rev:'Rs 95K'},{emoji:'🍌',name:'Banana',qty:'9,600 kg',rev:'Rs 48K'},{emoji:'🌴',name:'Coconut Products',qty:'5,200 kg',rev:'Rs 78K'}].map((p,i)=>(
            <div key={p.name} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontFamily:ds.fontM,fontSize:12,color:ds.textTer,width:16}}>#{i+1}</span>
              <span style={{fontSize:20,flexShrink:0}}>{p.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.text}}>{p.name}</span><span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.blue}}>{p.qty}</span></div>
                <div style={{background:ds.borderLt,borderRadius:99,height:5}}><div style={{width:`${[95,65,30,75,42][i]}%`,height:'100%',background:ds.blue,borderRadius:99}}/></div>
              </div>
              <span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.green,whiteSpace:'nowrap'}}>{p.rev}</span>
            </div>
          ))}
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 8px'}}>Delivery Type Split</p>
          <ResponsiveContainer width="100%" height={165}><PieChart><Pie data={TYPE_DIST} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>{TYPE_DIST.map((d)=><Cell key={`del-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
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

// ─── Main ──────────────────────────────────────────────────────────────────────
// ─── Delivery History ──────────────────────────────────────────────────────────
const HISTORY_DATA = [
  { id:'DLV-2885', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', customer:'Manning Market',    product:'Paddy Rice',     qty:'2,000 kg', from:'Anuradhapura', to:'Colombo',    date:'2026-06-30', days:1, revenue:12000, rating:5 },
  { id:'DLV-2884', farmer:'Kamala Silva',    farmerIcon:'👩‍🌾', customer:'Keells Super',       product:'Vegetables',     qty:'800 kg',   from:'Kandy',        to:'Kandy City', date:'2026-06-28', days:1, revenue:4500,  rating:4 },
  { id:'DLV-2883', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', customer:'Laugfs Eco Store',   product:'Organic Spices', qty:'350 kg',   from:'Galle',        to:'Colombo',    date:'2026-06-25', days:1, revenue:18000, rating:5 },
  { id:'DLV-2882', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', customer:'Arpico Supercentre', product:'Fresh Fruits',   qty:'600 kg',   from:'Jaffna',       to:'Colombo',    date:'2026-06-20', days:2, revenue:22000, rating:4 },
  { id:'DLV-2881', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', customer:'Wholesale Market',   product:'Banana',         qty:'1,200 kg', from:'Batticaloa',   to:'Kandy',      date:'2026-06-18', days:1, revenue:8500,  rating:3 },
  { id:'DLV-2880', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', customer:'Export Agent, BIA',  product:'Cinnamon',       qty:'500 kg',   from:'Kurunegala',   to:'Katunayake', date:'2026-06-15', days:1, revenue:15000, rating:5 },
  { id:'DLV-2879', farmer:'Saman Dias',      farmerIcon:'👨‍🌾', customer:'Cargills Food City', product:'Chilli',         qty:'300 kg',   from:'Badulla',      to:'Colombo',    date:'2026-06-10', days:1, revenue:6000,  rating:4 },
];

function DeliveryHistory() {
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1); const perPage=5;
  const filtered=useMemo(()=>HISTORY_DATA.filter(d=>d.farmer.toLowerCase().includes(search.toLowerCase())||d.product.toLowerCase().includes(search.toLowerCase())||d.id.toLowerCase().includes(search.toLowerCase())),[search]);
  const paged=filtered.slice((page-1)*perPage,page*perPage);
  const total=Math.ceil(filtered.length/perPage);
  const totalRev=HISTORY_DATA.reduce((s,d)=>s+d.revenue,0);
  const avgRating=(HISTORY_DATA.reduce((s,d)=>s+d.rating,0)/HISTORY_DATA.length).toFixed(1);

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Delivery History</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{HISTORY_DATA.length} completed deliveries</p></div>
        <button onClick={() => exportToCSV('delivery_history.csv', HISTORY_DATA)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}><Download style={{width:14,height:14}}/>Export CSV</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        {[{label:'Total Deliveries',value:String(HISTORY_DATA.length),color:ds.blue,bg:ds.blueLt},{label:'Total Revenue',value:`Rs ${(totalRev/1000).toFixed(0)}K`,color:ds.green,bg:ds.greenLt},{label:'Avg Rating',value:`${avgRating} ⭐`,color:ds.amber,bg:ds.amberLt},{label:'Success Rate',value:'98%',color:ds.teal,bg:ds.tealLt}].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:12,padding:'16px',border:`1px solid ${s.color}20`}}>
            <p style={{fontFamily:ds.fontM,fontSize:22,fontWeight:700,color:s.color,margin:'0 0 4px'}}>{s.value}</p>
            <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:0}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',marginBottom:16}}>
        <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by farmer, product, ID…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
          <thead><tr style={{background:ds.bg}}>{['Delivery ID','Farmer','Customer','Product','Route','Date','Revenue','Rating'].map(h=><th key={h} style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.06em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{paged.map((d,i)=>(
            <tr key={d.id} style={{borderBottom:i<paged.length-1?`1px solid ${ds.borderLt}`:'none'}}>
              <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.blue}}>{d.id}</td>
              <td style={{padding:'13px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:16}}>{d.farmerIcon}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{d.farmer}</span></div></td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{d.customer}</td>
              <td style={{padding:'13px 16px'}}><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:ds.bg,borderRadius:6,color:ds.textSec}}>{d.product}</span></td>
              <td style={{padding:'13px 16px'}}><div style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}><span style={{color:ds.green}}>📍{d.from}</span> → <span style={{color:ds.red}}>📍{d.to}</span></div></td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{d.date}</td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:13,fontWeight:700,color:ds.green}}>Rs {d.revenue.toLocaleString()}</td>
              <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:13}}>{'⭐'.repeat(d.rating)}{'☆'.repeat(5-d.rating)}</td>
            </tr>
          ))}</tbody>
        </table></div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===1?ds.textTer:ds.text,cursor:page===1?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Prev</button>
            {Array.from({length:total},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${page===i+1?ds.blue:ds.border}`,background:page===i+1?ds.blue:ds.surface,color:page===i+1?'#fff':ds.text,cursor:'pointer',fontFamily:ds.fontB,fontSize:12}}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===total?ds.textTer:ds.text,cursor:page===total?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Messages ─────────────────────────────────────────────────────────
const DEL_CONVOS = [
  {id:'dc1',name:'Sunil Perera',    icon:'👨‍🌾',lastMsg:'Can you deliver tomorrow instead?',        time:'5 min ago',  unread:2,online:true },
  {id:'dc2',name:'Kamala Silva',    icon:'👩‍🌾',lastMsg:'The vegetables arrived fresh, thank you!',  time:'1 hr ago',   unread:0,online:false},
  {id:'dc3',name:'Nimal Fernando',  icon:'👨‍🌾',lastMsg:'What is the export documentation status?',  time:'3 hr ago',   unread:1,online:true },
  {id:'dc4',name:'Priya Kumar',     icon:'👩‍🌾',lastMsg:'Can we reschedule pickup to 7 AM?',          time:'Yesterday',  unread:0,online:false},
  {id:'dc5',name:'Export Agent',    icon:'🏢', lastMsg:'Customs cleared. Ready for dispatch.',       time:'Yesterday',  unread:0,online:true },
];
const DEL_MSGS: Record<string,{from:'me'|'them';text:string;time:string}[]> = {
  dc1:[{from:'them',text:'My paddy is ready for pickup, 2 tonnes.',time:'8:00 AM'},{from:'me',text:'We will be there by 9 AM tomorrow.',time:'8:10 AM'},{from:'them',text:'Can you deliver tomorrow instead?',time:'9:30 AM'}],
  dc3:[{from:'them',text:'What is the export documentation status?',time:'Yesterday 2 PM'}],
};

function DeliveryMessages() {
  const [active,setActive]=useState('dc1');
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState(DEL_MSGS);
  const send=()=>{ if(!input.trim()) return; setMsgs(p=>({...p,[active]:[...(p[active]||[]),{from:'me',text:input.trim(),time:'Just now'}]})); setInput(''); };
  const convo=DEL_CONVOS.find(c=>c.id===active)!;
  const thread=msgs[active]||[];
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Messages</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Chat with farmers, customers and export agents</p></div>
      <div style={{display:'flex',background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow,height:560}}>
        <div style={{width:280,flexShrink:0,borderRight:`1px solid ${ds.borderLt}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${ds.borderLt}`}}><div style={{display:'flex',alignItems:'center',gap:7,background:ds.bg,borderRadius:8,padding:'7px 10px'}}><Search style={{width:13,height:13,color:ds.textTer}}/><input placeholder="Search…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:12,color:ds.text,background:'transparent',width:'100%'}}/></div></div>
          <div style={{flex:1,overflowY:'auto'}}>
            {DEL_CONVOS.map(conv=>(
              <div key={conv.id} onClick={()=>setActive(conv.id)} style={{display:'flex',gap:10,padding:'12px 16px',cursor:'pointer',background:active===conv.id?ds.blueLt:'transparent',borderBottom:`1px solid ${ds.borderLt}`}}>
                <div style={{position:'relative',flexShrink:0}}><div style={{width:40,height:40,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{conv.icon}</div>{conv.online&&<span style={{position:'absolute',bottom:0,right:0,width:10,height:10,background:'#22c55e',borderRadius:'50%',border:`2px solid ${ds.surface}`}}/>}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{conv.name}</span><span style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer}}>{conv.time}</span></div>
                  <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conv.lastMsg}</p>
                </div>
                {conv.unread>0&&<span style={{alignSelf:'center',minWidth:18,height:18,background:ds.blue,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ds.fontB,fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{conv.unread}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 20px',borderBottom:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{convo.icon}</div>
            <div><p style={{fontFamily:ds.fontB,fontSize:14,fontWeight:600,color:ds.text,margin:0}}>{convo.name}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:convo.online?'#22c55e':ds.textTer,margin:0}}>{convo.online?'Online':'Offline'}</p></div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
            {thread.length===0&&<p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textTer,textAlign:'center',marginTop:40}}>No messages yet. 👋</p>}
            {thread.map((msg,i)=>(
              <div key={i} style={{display:'flex',justifyContent:msg.from==='me'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'70%',background:msg.from==='me'?ds.blue:ds.bg,color:msg.from==='me'?'#fff':ds.text,borderRadius:msg.from==='me'?'16px 16px 4px 16px':'16px 16px 16px 4px',padding:'10px 14px'}}>
                  <p style={{fontFamily:ds.fontB,fontSize:13,margin:0,lineHeight:1.5}}>{msg.text}</p>
                  <p style={{fontFamily:ds.fontB,fontSize:10,color:msg.from==='me'?'rgba(255,255,255,0.7)':ds.textTer,margin:'4px 0 0',textAlign:'right'}}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message…" style={{flex:1,padding:'10px 14px',border:`1px solid ${ds.border}`,borderRadius:10,fontFamily:ds.fontB,fontSize:13,color:ds.text,outline:'none'}}/>
            <button onClick={send} style={{padding:'10px 20px',background:ds.blue,color:'#fff',border:'none',borderRadius:10,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Settings ─────────────────────────────────────────────────────────
function DeliverySettings() {
  const bizName=localStorage.getItem('businessName')||localStorage.getItem('userName')||'My Delivery Service';
  const [profile,setProfile]=useState({name:bizName,phone:'+94 77 000 0000',email:localStorage.getItem('userEmail')||'',district:localStorage.getItem('userDistrict')||'',description:'Providing reliable agri-produce delivery and export logistics services across Sri Lanka.',serviceAreas:'Colombo, Kandy, Galle, Jaffna'});
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontSize:14,color:ds.text,outline:'none',boxSizing:'border-box'};
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Settings</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Manage your delivery business profile and preferences</p></div>
      {saved&&<div style={{background:ds.greenLt,border:`1px solid ${ds.greenBd}`,borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}><CheckCircle style={{width:16,height:16,color:ds.green}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.green,fontWeight:600}}>Changes saved successfully!</span></div>}
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        {/* Company Profile */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>🚚 Company Profile</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[{label:'Company Name',key:'name'},{label:'Phone Number',key:'phone'},{label:'Email Address',key:'email'},{label:'District / Base Location',key:'district'}].map(f=>(
              <div key={f.key}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.label}</label><input value={(profile as any)[f.key]} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} style={inp}/></div>
            ))}
            <div style={{gridColumn:'1/-1'}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>Service Description</label><textarea value={profile.description} onChange={e=>setProfile(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:'vertical'}}/></div>
            <div style={{gridColumn:'1/-1'}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>Delivery Areas Covered</label><input value={profile.serviceAreas} onChange={e=>setProfile(p=>({...p,serviceAreas:e.target.value}))} style={inp}/></div>
          </div>
        </div>
        {/* Vehicle Settings */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>🚛 Vehicle & Operational Settings</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[{label:'Fleet Size',placeholder:'e.g. 5 vehicles'},{label:'Max Load Capacity (kg)',placeholder:'e.g. 50,000'},{label:'Base Delivery Rate (Rs/km)',placeholder:'e.g. 120'},{label:'Minimum Order Value (Rs)',placeholder:'e.g. 5,000'}].map((f,i)=>(
              <div key={i}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.label}</label><input placeholder={f.placeholder} style={inp}/></div>
            ))}
          </div>
        </div>
        {/* Notifications */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>🔔 Notification Preferences</p>
          {['New delivery request received','Shipment dispatched','Delivery completed','Export customs update','Payment confirmed','Driver check-in alert'].map((n,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<5?`1px solid ${ds.borderLt}`:'none'}}>
              <span style={{fontFamily:ds.fontB,fontSize:13,color:ds.text}}>{n}</span>
              <div onClick={() => {
                const isChecked = profile[n as keyof typeof profile] !== false;
                setProfile(p => ({...p, [n]: !isChecked}));
              }} style={{width:44,height:24,background:profile[n as keyof typeof profile] !== false?ds.blue:'#e5e7eb',borderRadius:99,position:'relative',cursor:'pointer',transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:2,left:profile[n as keyof typeof profile] !== false?22:2,width:20,height:20,background:'#fff',borderRadius:'50%',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s'}}/>
              </div>
            </div>
          ))}
        </div>
        {/* Security */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>🔐 Security</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:600}}>
            {[{label:'Current Password'},{label:'New Password'},{label:'Confirm New Password'}].map((f,i)=>(
              <div key={i} style={i===2?{gridColumn:'1/2'}:{}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.label}</label><input type="password" placeholder="••••••••" style={inp}/></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}><button onClick={save} style={{padding:'10px 28px',background:ds.blue,color:'#fff',border:'none',borderRadius:10,fontFamily:ds.fontB,fontWeight:700,fontSize:14,cursor:'pointer'}}>Save Changes</button><button style={{padding:'10px 20px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:10,fontFamily:ds.fontB,fontSize:14,cursor:'pointer'}}>Reset</button></div>
      </div>
    </div>
  );
}

export function DeliveryExportDashboard({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const [collapsed,setCollapsed]=useState(false);
  const [section,setSection]=useState('dashboard');
  const render=()=>{
    switch(section){
      case 'dashboard': return <DashboardHome setSection={setSection}/>;
      case 'delivery':  return <DeliveryRequests/>;
      case 'export':    return <ExportRequests/>;
      case 'tracking':  return <ShipmentTracking/>;
      case 'vehicles':  return <VehiclesDrivers/>;
      case 'history':   return <DeliveryHistory/>;
      case 'analytics': return <AnalyticsSection/>;
      case 'messages':  return <DeliveryMessages/>;
      case 'settings':  return <DeliverySettings/>;
      default: return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'40vh',gap:12}}><span style={{fontSize:48}}>🚧</span><p style={{fontFamily:ds.fontD,fontSize:18,fontWeight:700,color:ds.text}}>Coming Soon</p></div>;
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
