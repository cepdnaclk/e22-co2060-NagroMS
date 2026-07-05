import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Archive, Calendar, Thermometer,
  BarChart2, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Plus,
  Eye, Check, X, Download, TrendingUp, Clock,
  CheckCircle, ArrowUpRight, AlertTriangle, Droplets,
  Package, Shield, MapPin,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ds = {
  sidebar:    'linear-gradient(170deg,#0a2e1a 0%,#134d2e 50%,#0e3d24 100%)',
  green:      '#16a34a', greenDk:'#15803d', greenLt:'#f0fdf4', greenBd:'#dcfce7',
  bg:         '#f8fafc', surface:'#ffffff',
  border:     '#e2e8f0', borderLt:'#f1f5f9',
  text:       '#0f172a', textSec:'#475569', textTer:'#94a3b8',
  shadow:     '0 1px 3px rgba(0,0,0,0.07)', shadowMd:'0 4px 16px rgba(0,0,0,0.08)',
  fontD:      "'Plus Jakarta Sans',sans-serif",
  fontB:      "'Inter',sans-serif",
  fontM:      "'JetBrains Mono',monospace",
  amber:      '#f59e0b', amberLt:'#fffbeb', amberBd:'#fde68a',
  red:        '#ef4444', redLt:'#fef2f2',   redBd:'#fecaca',
  blue:       '#3b82f6', blueLt:'#eff6ff',  blueBd:'#bfdbfe',
  purple:     '#8b5cf6', purpleLt:'#f5f3ff',purpleBd:'#ddd6fe',
  teal:       '#0891b2', tealLt:'#ecfeff',  tealBd:'#a5f3fc',
};

type UnitStatus = 'Available'|'Occupied'|'Reserved'|'Maintenance';
type ZoneType   = 'Dry'|'Cold'|'Freezer';
type ReqStatus  = 'Pending'|'Accepted'|'Rejected';

interface StorageUnit {
  id:string; zone:string; zoneType:ZoneType; size:'S'|'M'|'L';
  status:UnitStatus; capacity:string; contents?:string; customer?:string; daysLeft?:number;
}
interface StorageRequest {
  id:string; farmer:string; icon:string; district:string; contact:string;
  storageType:ZoneType; spaceNeeded:number; spaceUnit:string; duration:string;
  product:string; date:string; status:ReqStatus; price:number;
}
interface Zone { id:string; name:string; emoji:string; type:ZoneType; temp:number; targetMin:number; targetMax:number; humidity:number; humMin:number; humMax:number; }

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const UNITS: StorageUnit[] = [
  {id:'A1',zone:'A',zoneType:'Dry',    size:'L',status:'Occupied',    capacity:'500 bags', contents:'Paddy (50 bags)',      customer:'Sunil Perera',    daysLeft:12},
  {id:'A2',zone:'A',zoneType:'Dry',    size:'L',status:'Occupied',    capacity:'500 bags', contents:'Maize (30 bags)',       customer:'Kamala Silva',    daysLeft:5},
  {id:'A3',zone:'A',zoneType:'Dry',    size:'L',status:'Available',   capacity:'500 bags'},
  {id:'A4',zone:'A',zoneType:'Dry',    size:'L',status:'Reserved',    capacity:'500 bags', customer:'Nimal Fernando'},
  {id:'B1',zone:'B',zoneType:'Cold',   size:'M',status:'Occupied',    capacity:'200 crates',contents:'Tomatoes (20 crates)', customer:'Priya Kumar',     daysLeft:3},
  {id:'B2',zone:'B',zoneType:'Cold',   size:'M',status:'Occupied',    capacity:'200 crates',contents:'Beans (15 crates)',    customer:'Amara Jayaweera', daysLeft:8},
  {id:'B3',zone:'B',zoneType:'Cold',   size:'M',status:'Available',   capacity:'200 crates'},
  {id:'B4',zone:'B',zoneType:'Cold',   size:'M',status:'Maintenance', capacity:'200 crates'},
  {id:'C1',zone:'C',zoneType:'Cold',   size:'M',status:'Occupied',    capacity:'200 crates',contents:'Cabbage (25 crates)',  customer:'Rajan Muthu',     daysLeft:6},
  {id:'C2',zone:'C',zoneType:'Cold',   size:'M',status:'Available',   capacity:'200 crates'},
  {id:'C3',zone:'C',zoneType:'Cold',   size:'M',status:'Available',   capacity:'200 crates'},
  {id:'C4',zone:'C',zoneType:'Cold',   size:'M',status:'Occupied',    capacity:'200 crates',contents:'Carrot (18 bags)',     customer:'Sunil Perera',    daysLeft:14},
  {id:'D1',zone:'D',zoneType:'Freezer',size:'S',status:'Occupied',    capacity:'50 crates', contents:'Fish (10 crates)',    customer:'Sea Fresh Ltd',   daysLeft:20},
  {id:'D2',zone:'D',zoneType:'Freezer',size:'S',status:'Available',   capacity:'50 crates'},
  {id:'D3',zone:'D',zoneType:'Freezer',size:'S',status:'Available',   capacity:'50 crates'},
  {id:'D4',zone:'D',zoneType:'Freezer',size:'S',status:'Maintenance', capacity:'50 crates'},
];

const ZONES: Zone[] = [
  {id:'A',name:'Dry Warehouse',  emoji:'🏠',type:'Dry',    temp:27,   targetMin:25, targetMax:30, humidity:55, humMin:50, humMax:60},
  {id:'B',name:'Cold Room 1',    emoji:'🧊',type:'Cold',   temp:6.5,  targetMin:5,  targetMax:8,  humidity:87, humMin:85, humMax:90},
  {id:'C',name:'Cold Room 2',    emoji:'❄️',type:'Cold',   temp:13.2, targetMin:8,  targetMax:12, humidity:82, humMin:80, humMax:85},
  {id:'D',name:'Freezer',        emoji:'🥶',type:'Freezer',temp:-16.8,targetMin:-18,targetMax:-15,humidity:72, humMin:70, humMax:75},
];

const REQUESTS: StorageRequest[] = [
  {id:'SR-001',farmer:'Ranjith Bandara',icon:'👨‍🌾',district:'Anuradhapura',contact:'077 234 5678',storageType:'Dry',    spaceNeeded:40, spaceUnit:'bags',   duration:'2 months', product:'Paddy',    date:'2026-07-05',status:'Pending',  price:20000},
  {id:'SR-002',farmer:'Preethi Herath', icon:'👩‍🌾',district:'Kandy',        contact:'071 345 6789',storageType:'Cold',   spaceNeeded:15, spaceUnit:'crates', duration:'1 month',  product:'Tomatoes', date:'2026-07-04',status:'Pending',  price:12000},
  {id:'SR-003',farmer:'Lasith Mendis',  icon:'👨‍🌾',district:'Badulla',       contact:'076 456 7890',storageType:'Freezer',spaceNeeded:8,  spaceUnit:'crates', duration:'3 months', product:'Fish',     date:'2026-07-03',status:'Accepted', price:24000},
  {id:'SR-004',farmer:'Chamari Sena',   icon:'👩‍🌾',district:'Kurunegala',    contact:'070 567 8901',storageType:'Dry',    spaceNeeded:80, spaceUnit:'bags',   duration:'6 months', product:'Maize',    date:'2026-07-02',status:'Rejected', price:48000},
];

const OCCUPANCY_DATA = [
  {month:'Jan',occupied:68,revenue:125},{month:'Feb',occupied:72,revenue:138},{month:'Mar',occupied:81,revenue:158},
  {month:'Apr',occupied:75,revenue:142},{month:'May',occupied:88,revenue:172},{month:'Jun',occupied:94,revenue:188},
  {month:'Jul',occupied:87,revenue:178},
];

const REVENUE_DATA_STOR = [
  {month:'Jan',dry:45,cold:55,freezer:25},{month:'Feb',dry:52,cold:58,freezer:28},{month:'Mar',dry:61,cold:68,freezer:29},
  {month:'Apr',dry:55,cold:62,freezer:25},{month:'May',dry:70,cold:74,freezer:28},{month:'Jun',dry:78,cold:82,freezer:28},
  {month:'Jul',dry:72,cold:78,freezer:28},
];

const unitStatusCfg: Record<UnitStatus,{bg:string;color:string;border:string;label:string}> = {
  Available:   {bg:ds.greenLt,  color:'#166534', border:ds.greenBd,  label:'✅ Available'},
  Occupied:    {bg:ds.amberLt,  color:'#92400e', border:ds.amberBd,  label:'📦 Occupied'},
  Reserved:    {bg:ds.blueLt,   color:'#1e40af', border:ds.blueBd,   label:'🔒 Reserved'},
  Maintenance: {bg:'#f3f4f6',   color:ds.textSec,border:ds.border,   label:'🔧 Maintenance'},
};
const reqStatusCfg: Record<ReqStatus,{bg:string;color:string;dot:string}> = {
  Pending:  {bg:ds.amberLt,  color:'#92400e', dot:ds.amber},
  Accepted: {bg:ds.greenLt,  color:'#166534', dot:ds.green},
  Rejected: {bg:ds.redLt,    color:'#991b1b', dot:ds.red},
};

// ─── Primitives ────────────────────────────────────────────────────────────────
const Badge = ({label,cfg}:{label:string;cfg:{bg:string;color:string;dot?:string}}) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>
    {cfg.dot&&<span style={{width:5,height:5,borderRadius:'50%',background:cfg.dot,flexShrink:0}}/>}{label}
  </span>
);
const TH = ({c}:{c:string}) => <th style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.07em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`,background:ds.bg,whiteSpace:'nowrap'}}>{c}</th>;

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

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',  label:'Dashboard',          icon:LayoutDashboard},
  {id:'units',      label:'Storage Units',      icon:Archive},
  {id:'requests',   label:'Booking Requests',   icon:Calendar},
  {id:'temperature',label:'Temp & Humidity',    icon:Thermometer},
  {id:'rentals',    label:'Active Rentals',     icon:Package},
  {id:'analytics',  label:'Analytics',          icon:BarChart2},
  {id:'messages',   label:'Messages',           icon:MessageSquare},
  {id:'settings',   label:'Settings',           icon:Settings},
];

const STOR_CONVOS = [
  {id:'sc1',name:'Sunil Perera',   icon:'👨‍🌾',lastMsg:'When can I pick up my paddy stock?',      time:'20 min ago',unread:1,online:true},
  {id:'sc2',name:'Sea Fresh Ltd',  icon:'🏢', lastMsg:'Freezer unit D1 temperature seems off.',time:'2 hr ago',   unread:0,online:false},
  {id:'sc3',name:'Priya Kumar',    icon:'👩‍🌾',lastMsg:'Can I extend the cold storage by a week?',time:'Yesterday', unread:0,online:true},
];
const STOR_MSG: Record<string,{from:'me'|'them';text:string;time:string}[]> = {
  sc1:[{from:'them',text:'My paddy is stored in A1. When can I pick it up?',time:'9:00 AM'},{from:'me',text:'Your unit A1 is ready for pickup any time this week.',time:'9:15 AM'},{from:'them',text:'When can I pick up my paddy stock?',time:'10:30 AM'}],
};

function Sidebar({collapsed,setCollapsed,active,setActive,onNavigate}:{collapsed:boolean;setCollapsed:(v:boolean)=>void;active:string;setActive:(s:string)=>void;onNavigate:(p:string)=>void}) {
  return (
    <aside style={{width:collapsed?66:244,flexShrink:0,background:ds.sidebar,display:'flex',flexDirection:'column',transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <div style={{padding:collapsed?'20px 15px':'20px 20px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,0.08)',justifyContent:collapsed?'center':'flex-start',minHeight:68,flexShrink:0}}>
        <div style={{width:34,height:34,background:'rgba(255,255,255,0.12)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,0.15)'}}><span style={{fontSize:17}}>🏢</span></div>
        {!collapsed&&<div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:800,color:'#fff',margin:0,lineHeight:1.2}}>NagroMS</p><p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.5)',margin:0}}>Storage Facilities</p></div>}
      </div>
      <nav style={{flex:1,padding:'12px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {NAV.map(item=>{const Icon=item.icon;const isActive=active===item.id;return(
          <button key={item.id} onClick={()=>setActive(item.id)} title={collapsed?item.label:undefined} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:isActive?'rgba(255,255,255,0.14)':'transparent',color:isActive?'#fff':'rgba(255,255,255,0.55)',fontFamily:ds.fontB,fontSize:13,fontWeight:isActive?600:400,transition:'all 0.15s',boxShadow:isActive?'inset 0 0 0 1px rgba(255,255,255,0.18)':'none'}}>
            <Icon style={{width:16,height:16,flexShrink:0}}/>{!collapsed&&<span style={{flex:1,textAlign:'left',whiteSpace:'nowrap'}}>{item.label}</span>}
          </button>
        );})}
      </nav>
      <div style={{padding:'10px 8px',borderTop:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
        <button onClick={()=>onNavigate('landing')} title={collapsed?'Logout':undefined} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',background:'transparent',color:'rgba(255,255,255,0.4)',fontFamily:ds.fontB,fontSize:12}}>
          <LogOut style={{width:14,height:14,flexShrink:0}}/>{!collapsed&&'Logout'}
        </button>
        <button onClick={()=>setCollapsed(!collapsed)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',marginTop:4,fontFamily:ds.fontB,fontSize:11}}>
          {collapsed?<ChevronRight style={{width:14,height:14}}/>:<><ChevronLeft style={{width:14,height:14}}/><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

function TopNav({section}:{section:string}) {
  const labels:Record<string,string>={dashboard:'Dashboard Overview',units:'Storage Units',requests:'Booking Requests',temperature:'Temperature & Humidity',rentals:'Active Rentals',analytics:'Analytics',messages:'Messages',settings:'Settings'};
  const name=localStorage.getItem('businessName')||localStorage.getItem('userName')||'Storage Provider';
  return (
    <header style={{height:60,background:ds.surface,borderBottom:`1px solid ${ds.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:30,flexShrink:0}}>
      <div><h1 style={{fontFamily:ds.fontD,fontSize:16,fontWeight:700,color:ds.text,margin:0}}>{labels[section]||'Dashboard'}</h1><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>Storage Facilities Portal · NagroMS</p></div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',width:200}}><Search style={{width:13,height:13,color:ds.textTer}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.textTer}}>Search units…</span></div>
        <button style={{position:'relative',width:36,height:36,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Bell style={{width:15,height:15,color:ds.textSec}}/><span style={{position:'absolute',top:6,right:7,width:7,height:7,background:ds.red,borderRadius:'50%',border:`2px solid ${ds.surface}`}}/></button>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.greenLt,border:`1px solid ${ds.greenBd}`,borderRadius:9,padding:'4px 11px 4px 4px',cursor:'pointer'}}>
          <div style={{width:26,height:26,background:`linear-gradient(135deg,${ds.green},#22c55e)`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🏢</div>
          <div><p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:0}}>{name.split(' ')[0]}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>Storage Provider</p></div>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardHome({setSection}:{setSection:(s:string)=>void}) {
  const occupied=UNITS.filter(u=>u.status==='Occupied').length;
  const available=UNITS.filter(u=>u.status==='Available').length;
  const maintenance=UNITS.filter(u=>u.status==='Maintenance').length;
  const pendingReq=REQUESTS.filter(r=>r.status==='Pending').length;
  const tempAlerts=ZONES.filter(z=>z.temp<z.targetMin||z.temp>z.targetMax);
  const monthRev=OCCUPANCY_DATA[OCCUPANCY_DATA.length-1].revenue;

  return (
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#0a2e1a 0%,#15803d 50%,#16a34a 100%)',borderRadius:20,padding:'26px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.12)',borderRadius:99,padding:'3px 10px',marginBottom:10}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80'}}/><span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>Active · Storage Facility Provider</span>
            </div>
            <h2 style={{fontFamily:ds.fontD,fontSize:24,fontWeight:800,color:'#fff',margin:'0 0 6px'}}>Good morning! 🏢</h2>
            <p style={{fontFamily:ds.fontB,fontSize:13,color:'rgba(255,255,255,0.7)',margin:0}}>{pendingReq} pending booking requests · {tempAlerts.length>0?`⚠ ${tempAlerts.length} temperature alert(s)`:'All zones within target range ✓'}</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[{label:'Occupied Units',value:`${occupied}/${UNITS.length}`},{label:'Available',value:String(available)},{label:'Monthly Rev',value:`Rs ${monthRev}K`}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',borderRadius:14,padding:'12px 18px',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center',minWidth:90}}>
                <p style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 2px'}}>{s.value}</p>
                <p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.65)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {tempAlerts.length>0&&(
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <AlertTriangle style={{width:18,height:18,color:ds.red,flexShrink:0}}/>
          <p style={{fontFamily:ds.fontB,fontSize:13,color:'#991b1b',margin:0}}><strong>Temperature Alert:</strong> {tempAlerts.map(z=>`Zone ${z.id} (${z.name}): ${z.temp}°C`).join(' · ')} — outside target range</p>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:14,marginBottom:24}}>
        <KpiCard label="Total Units"       value={String(UNITS.length)} sub="Across all zones"      icon={<Archive style={{width:18,height:18}}/>}      iconBg={ds.greenLt}  iconColor={ds.green}  trend="+2 zones"/>
        <KpiCard label="Occupied"          value={String(occupied)}     sub="Currently rented"      icon={<Package style={{width:18,height:18}}/>}      iconBg={ds.amberLt}  iconColor={ds.amber}/>
        <KpiCard label="Available"         value={String(available)}    sub="Ready for rental"      icon={<CheckCircle style={{width:18,height:18}}/>}  iconBg={ds.greenLt}  iconColor={ds.green}  trend="Book now"/>
        <KpiCard label="Maintenance"       value={String(maintenance)}  sub="Under service"         icon={<AlertTriangle style={{width:18,height:18}}/>} iconBg={ds.redLt}    iconColor={ds.red}/>
        <KpiCard label="Pending Requests"  value={String(pendingReq)}   sub="Awaiting review"       icon={<Calendar style={{width:18,height:18}}/>}     iconBg={ds.blueLt}   iconColor={ds.blue}/>
        <KpiCard label="Monthly Revenue"   value={`Rs ${monthRev}K`}    sub="Jul 2026"              icon={<TrendingUp style={{width:18,height:18}}/>}   iconBg={ds.greenLt}  iconColor={ds.green}  trend="+11%"/>
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 280px',gap:16,marginBottom:24}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Monthly Occupancy Rate (%)</p>
          <ResponsiveContainer key="stor-occ" width="100%" height={175}>
            <AreaChart data={OCCUPANCY_DATA} margin={{top:2,right:4,left:-20,bottom:0}}>
              <defs><linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ds.green} stopOpacity={0.2}/><stop offset="95%" stopColor={ds.green} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'Occupancy']}/>
              <Area type="monotone" dataKey="occupied" stroke={ds.green} strokeWidth={2.5} fill="url(#occGrad)" name="stor-occupancy"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Revenue by Zone Type (Rs K)</p>
          <ResponsiveContainer key="stor-rev" width="100%" height={175}>
            <BarChart data={REVENUE_DATA_STOR} margin={{top:2,right:4,left:-20,bottom:0}} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']}/>
              <Bar dataKey="dry"     fill={ds.amber}  radius={[4,4,0,0]} name="Dry"/>
              <Bar dataKey="cold"    fill={ds.blue}   radius={[4,4,0,0]} name="Cold"/>
              <Bar dataKey="freezer" fill={ds.teal}   radius={[4,4,0,0]} name="Freezer"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Zone status */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 12px'}}>Zone Temperature</p>
          {ZONES.map(z=>{
            const ok=z.temp>=z.targetMin&&z.temp<=z.targetMax;
            return (
              <div key={z.id} style={{background:ok?ds.greenLt:'#fef2f2',borderRadius:10,padding:'10px 12px',marginBottom:8,border:`1px solid ${ok?ds.greenBd:'#fecaca'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'1rem'}}>{z.emoji}</span>
                  <span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textSec}}>Zone {z.id} · {z.name}</span>
                  <span style={{fontFamily:ds.fontM,fontSize:13,fontWeight:800,color:ok?ds.green:ds.red}}>{z.temp}°C</span>
                </div>
                <div style={{fontFamily:ds.fontB,fontSize:10,color:ok?ds.green:'#dc2626',marginTop:2,textAlign:'right'}}>{ok?'✓ Normal':'⚠ Alert'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Occupancy visual */}
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:0}}>Overall Fleet Occupancy</p>
          <span style={{fontFamily:ds.fontM,fontSize:15,fontWeight:700,color:ds.green}}>{Math.round((occupied/UNITS.length)*100)}%</span>
        </div>
        <div style={{background:ds.borderLt,borderRadius:99,height:12,overflow:'hidden',marginBottom:8}}>
          <div style={{height:'100%',width:`${(occupied/UNITS.length)*100}%`,background:`linear-gradient(to right,${ds.green},#22c55e)`,borderRadius:99}}/>
        </div>
        <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>{occupied} of {UNITS.length} units occupied · {available} available · {maintenance} in maintenance</p>
      </div>
    </div>
  );
}

// ─── Storage Units ─────────────────────────────────────────────────────────────
function StorageUnits() {
  const [units,setUnits]=useState(UNITS);
  const [selected,setSelected]=useState<string|null>(null);
  const [editUnit, setEditUnit] = useState<any>(null);
  const toggleMaint=(id:string)=>setUnits(p=>p.map(u=>u.id===id?{...u,status:u.status==='Available'?'Maintenance':'Available'}:u));
  const zones=[{id:'A',name:'Dry Warehouse 🏠'},{id:'B',name:'Cold Room 1 🧊'},{id:'C',name:'Cold Room 2 ❄️'},{id:'D',name:'Freezer 🥶'}];

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Storage Units</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Click a unit to view details or update status</p></div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {Object.entries(unitStatusCfg).map(([k,v])=><span key={k} style={{fontSize:11,padding:'3px 8px',borderRadius:99,background:v.bg,color:v.color,fontFamily:ds.fontB,fontWeight:600}}>{v.label}</span>)}
        </div>
      </div>
      {zones.map(z=>{
        const zoneUnits=units.filter(u=>u.zone===z.id);
        const zoneInfo=ZONES.find(zn=>zn.id===z.id)!;
        return (
          <div key={z.id} style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:0}}>{z.name}</p>
              <span style={{fontFamily:ds.fontB,fontSize:11,padding:'2px 8px',background:ds.greenLt,color:ds.green,borderRadius:99}}>Target: {zoneInfo.targetMin}°C – {zoneInfo.targetMax}°C</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10}}>
              {zoneUnits.map(unit=>{
                const cfg=unitStatusCfg[unit.status];
                const isSelected=selected===unit.id;
                return (
                  <div key={unit.id} onClick={()=>setEditUnit(unit)} style={{background:cfg.bg,borderRadius:10,border:`2px solid ${isSelected?ds.green:cfg.border}`,padding:'12px',cursor:'pointer',boxShadow:isSelected?`0 0 0 3px ${ds.green}20`:'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text}}>Unit {unit.id}</span>
                      <span style={{fontFamily:ds.fontB,fontSize:10,padding:'2px 6px',background:'rgba(0,0,0,0.06)',borderRadius:4,color:ds.textSec}}>{unit.size}</span>
                    </div>
                    <p style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:cfg.color,margin:'0 0 4px'}}>{cfg.label}</p>
                    {unit.contents&&<p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:'0 0 2px'}}>📦 {unit.contents}</p>}
                    {unit.customer&&<p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:'0 0 2px'}}>👤 {unit.customer}</p>}
                    {unit.daysLeft!=null&&<p style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:unit.daysLeft<=5?ds.red:ds.green,margin:0}}>⏱ {unit.daysLeft}d left</p>}
                    
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Booking Requests ──────────────────────────────────────────────────────────
function BookingRequests() {
  const [requests,setRequests]=useState(REQUESTS);
  const approve=(id:string)=>setRequests(p=>p.map(r=>r.id===id?{...r,status:'Accepted'}:r));
  const reject=(id:string)=>setRequests(p=>p.map(r=>r.id===id?{...r,status:'Rejected'}:r));
  const dryAvail=UNITS.filter(u=>u.zone==='A'&&u.status==='Available').length;
  const coldAvail=UNITS.filter(u=>(u.zone==='B'||u.zone==='C')&&u.status==='Available').length;
  const freezAvail=UNITS.filter(u=>u.zone==='D'&&u.status==='Available').length;

  const checkSpace=(req:StorageRequest)=>{
    if(req.storageType==='Dry')     return {ok:dryAvail>0&&req.spaceNeeded<=200,avail:dryAvail,cap:dryAvail*200};
    if(req.storageType==='Cold')    return {ok:coldAvail>0&&req.spaceNeeded<=100,avail:coldAvail,cap:coldAvail*100};
    return {ok:freezAvail>0&&req.spaceNeeded<=50,avail:freezAvail,cap:freezAvail*50};
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Booking Requests</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Incoming farmer storage requests — check availability before accepting</p></div>
      </div>
      {/* Availability summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[{label:'Dry Warehouse',emoji:'🏠',avail:dryAvail,zone:'Zone A'},{label:'Cold Rooms',emoji:'🧊',avail:coldAvail,zone:'Zone B & C'},{label:'Freezer',emoji:'🥶',avail:freezAvail,zone:'Zone D'}].map(z=>(
          <div key={z.label} style={{background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:12,padding:'14px',textAlign:'center',boxShadow:ds.shadow}}>
            <div style={{fontSize:'1.5rem',marginBottom:4}}>{z.emoji}</div>
            <p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:'0 0 2px'}}>{z.label}</p>
            <p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:'0 0 4px'}}>{z.zone}</p>
            <p style={{fontFamily:ds.fontM,fontSize:18,fontWeight:800,color:z.avail>0?ds.green:ds.red,margin:0}}>{z.avail} free</p>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {requests.map(req=>{
          const space=checkSpace(req);
          const sc=reqStatusCfg[req.status];
          const typeColor=req.storageType==='Dry'?'#92400e':req.storageType==='Cold'?'#1e40af':'#164e63';
          const typeBg=req.storageType==='Dry'?ds.amberLt:req.storageType==='Cold'?ds.blueLt:ds.tealLt;
          return (
            <div key={req.id} style={{background:ds.surface,borderRadius:14,border:`2px solid ${req.status==='Accepted'?ds.greenBd:req.status==='Rejected'?ds.redBd:ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
                <div style={{display:'flex',gap:10}}>
                  <div style={{fontSize:'2rem',background:typeBg,borderRadius:10,width:52,height:52,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {req.storageType==='Dry'?'🏠':req.storageType==='Cold'?'🧊':'🥶'}
                  </div>
                  <div>
                    <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
                      <span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.green}}>{req.id}</span>
                      <span style={{fontFamily:ds.fontB,fontSize:11,padding:'2px 7px',borderRadius:99,background:typeBg,color:typeColor,fontWeight:700}}>{req.storageType}</span>
                      <Badge label={req.status} cfg={sc}/>
                    </div>
                    <p style={{fontFamily:ds.fontB,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 2px'}}>👤 {req.farmer}</p>
                    <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>📍 {req.district} · 📞 {req.contact} · 📅 {req.date}</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}><p style={{fontFamily:ds.fontM,fontSize:16,fontWeight:800,color:ds.green,margin:'0 0 2px'}}>Rs {req.price.toLocaleString()}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{req.duration}</p></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginBottom:12}}>
                {[{icon:'📦',label:'Product',val:req.product},{icon:'📐',label:'Space Needed',val:`${req.spaceNeeded} ${req.spaceUnit}`},{icon:'⏳',label:'Duration',val:req.duration}].map(d=>(
                  <div key={d.label} style={{background:ds.bg,borderRadius:8,padding:'8px 10px'}}><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>{d.icon} {d.label}</p><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:'2px 0 0'}}>{d.val}</p></div>
                ))}
              </div>
              <div style={{background:space.ok?ds.greenLt:'#fef2f2',border:`1px solid ${space.ok?ds.greenBd:'#fecaca'}`,borderRadius:8,padding:'10px 12px',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:'1.2rem'}}>{space.ok?'✅':'❌'}</span>
                <div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:700,color:space.ok?ds.green:ds.red,margin:0}}>{space.ok?'Space Available':'Not Enough Space'}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:0}}>{space.avail} free unit(s) · capacity {space.cap} {req.spaceUnit} · requested {req.spaceNeeded} {req.spaceUnit}</p></div>
              </div>
              {req.status==='Pending'&&(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>approve(req.id)} disabled={!space.ok} style={{flex:1,padding:'8px',background:space.ok?ds.green:'#d1d5db',color:'#fff',border:'none',borderRadius:8,fontFamily:ds.fontB,fontWeight:700,fontSize:13,cursor:space.ok?'pointer':'not-allowed'}}>✅ Accept</button>
                  <button onClick={()=>reject(req.id)} style={{flex:1,padding:'8px',background:'#fef2f2',color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:700,fontSize:13,cursor:'pointer'}}>❌ Decline</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Temperature Monitor ───────────────────────────────────────────────────────
function TemperatureMonitor() {
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Temperature & Humidity Monitor</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Live readings from all storage zones</p></div>
      {ZONES.filter(z=>z.temp<z.targetMin||z.temp>z.targetMax).length>0&&(
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:8,alignItems:'flex-start'}}>
          <AlertTriangle style={{width:18,height:18,color:ds.red,flexShrink:0,marginTop:1}}/>
          <div>{ZONES.filter(z=>z.temp<z.targetMin||z.temp>z.targetMax).map(z=><p key={z.id} style={{fontFamily:ds.fontB,fontSize:12,color:'#7f1d1d',margin:0}}>⚠ Zone {z.id} ({z.name}): {z.temp}°C — target {z.targetMin}°C to {z.targetMax}°C</p>)}</div>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {ZONES.map(z=>{
          const tempOk=z.temp>=z.targetMin&&z.temp<=z.targetMax;
          const humOk=z.humidity>=z.humMin&&z.humidity<=z.humMax;
          const tempPct=Math.min(100,Math.max(0,((z.temp-z.targetMin+5)/(z.targetMax-z.targetMin+10))*100));
          const humPct=Math.min(100,Math.max(0,((z.humidity-z.humMin+5)/(z.humMax-z.humMin+10))*100));
          return (
            <div key={z.id} style={{background:ds.surface,borderRadius:14,border:`1px solid ${tempOk&&humOk?ds.border:'#fecaca'}`,padding:'20px',boxShadow:ds.shadow}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <span style={{fontSize:'1.8rem'}}>{z.emoji}</span>
                  <div><p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:0}}>Zone {z.id} — {z.name}</p><p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0}}>Target: {z.targetMin}°C – {z.targetMax}°C</p></div>
                </div>
                <span style={{padding:'4px 10px',borderRadius:99,fontFamily:ds.fontB,fontSize:12,fontWeight:700,background:tempOk&&humOk?ds.greenLt:'#fef2f2',color:tempOk&&humOk?ds.green:ds.red}}>{tempOk&&humOk?'✓ Normal':'⚠ Alert'}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[{label:'Temperature',value:`${z.temp}°C`,pct:tempPct,ok:tempOk,range:`${z.targetMin}°C – ${z.targetMax}°C`,color:tempOk?ds.green:ds.red,icon:<Thermometer style={{width:15,height:15}}/>},
                  {label:'Humidity',value:`${z.humidity}%`,pct:humPct,ok:humOk,range:`${z.humMin}% – ${z.humMax}%`,color:humOk?ds.blue:ds.red,icon:<Droplets style={{width:15,height:15}}/>}].map(m=>(
                  <div key={m.label}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:4,color:m.color}}>{m.icon}<span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600}}>{m.label}</span></div>
                      <span style={{fontFamily:ds.fontM,fontSize:14,fontWeight:800,color:m.color}}>{m.value}</span>
                    </div>
                    <div style={{background:ds.borderLt,borderRadius:99,height:8,overflow:'hidden'}}><div style={{width:`${m.pct}%`,height:'100%',background:m.color,borderRadius:99}}/></div>
                    <p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:'4px 0 0'}}>Range: {m.range}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Active Rentals ────────────────────────────────────────────────────────────
function ActiveRentals() {
  const [units,setUnits]=useState(UNITS);
  const occupied=units.filter(u=>u.status==='Occupied');
  const reserved=units.filter(u=>u.status==='Reserved');
  const endRental=(id:string)=>setUnits(p=>p.map(u=>u.id===id?{...u,status:'Available',contents:undefined,customer:undefined,daysLeft:undefined}:u));

  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Active Rentals</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{occupied.length} occupied · {reserved.length} reserved</p></div>
      {occupied.map(u=>{
        const zone=ZONES.find(z=>z.id===u.zone)!;
        const urgent=(u.daysLeft??99)<=5;
        return (
          <div key={u.id} style={{background:ds.surface,borderRadius:14,border:`2px solid ${urgent?ds.amberBd:ds.greenBd}`,padding:'18px 20px',marginBottom:12,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',boxShadow:ds.shadow}}>
            <div style={{fontSize:'1.8rem',background:urgent?ds.amberLt:ds.greenLt,borderRadius:10,width:50,height:50,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{zone.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}><strong style={{fontFamily:ds.fontM,color:ds.green}}>Unit {u.id}</strong><span style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec}}>— {zone.name}</span></div>
              <p style={{fontFamily:ds.fontB,fontSize:13,color:ds.text,margin:'0 0 2px'}}>👤 {u.customer}</p>
              <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:'0 0 2px'}}>📦 {u.contents}</p>
              <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>🌡 {zone.temp}°C (target {u.zoneType==='Dry'?'25–30':u.zoneType==='Cold'?'5–12':'-18 to -15'}°C)</p>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <p style={{fontFamily:ds.fontM,fontSize:14,fontWeight:700,color:ds.green,margin:'0 0 4px'}}>Rs {u.zoneType==='Dry'?'500/bag/mo':u.zoneType==='Cold'?'800/crate/mo':'300/unit/mo'}</p>
              <p style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:urgent?ds.red:ds.green,margin:'0 0 8px'}}>⏱ {u.daysLeft} days left</p>
              <div style={{display:'flex',gap:6}}>
                <button style={{padding:'5px 10px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Extend</button>
                <button onClick={()=>endRental(u.id)} style={{padding:'5px 10px',background:'#fef2f2',color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>End</button>
              </div>
            </div>
          </div>
        );
      })}
      {reserved.length>0&&<>
        <p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.textTer,textTransform:'uppercase',letterSpacing:'0.06em',margin:'16px 0 8px'}}>Reserved</p>
        {reserved.map(u=>(
          <div key={u.id} style={{background:'#eff6ff',borderRadius:12,border:`1px solid ${ds.blueBd}`,padding:'14px 16px',marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>Unit {u.id} · 🔒 Reserved for {u.customer}</p>
            <div style={{display:'flex',gap:6}}>
              <button style={{padding:'5px 10px',background:ds.green,color:'#fff',border:'none',borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Confirm</button>
              <button style={{padding:'5px 10px',background:ds.surface,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function StorageAnalytics() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Analytics</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Storage performance and revenue insights</p></div><button style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}><Download style={{width:14,height:14}}/>Export</button></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Occupancy Rate Trend (%)</p>
          <ResponsiveContainer key="stor-an-occ" width="100%" height={200}>
            <AreaChart data={OCCUPANCY_DATA} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs><linearGradient id="occGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ds.green} stopOpacity={0.2}/><stop offset="95%" stopColor={ds.green} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'Occupancy']}/>
              <Area type="monotone" dataKey="occupied" stroke={ds.green} strokeWidth={2.5} fill="url(#occGrad2)" name="stor-occ2"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Revenue by Zone Type (Rs K)</p>
          <ResponsiveContainer key="stor-an-rev" width="100%" height={200}>
            <BarChart data={REVENUE_DATA_STOR} margin={{top:4,right:4,left:-20,bottom:0}} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/><XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/><YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`Rs ${v}K`,'']}/>
              <Bar dataKey="dry" fill={ds.amber} radius={[4,4,0,0]} name="Dry"/><Bar dataKey="cold" fill={ds.blue} radius={[4,4,0,0]} name="Cold"/><Bar dataKey="freezer" fill={ds.teal} radius={[4,4,0,0]} name="Freezer"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
        <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 16px'}}>Unit Utilization by Zone</p>
        {[{zone:'A',name:'Dry Warehouse',emoji:'🏠',occupied:UNITS.filter(u=>u.zone==='A'&&u.status==='Occupied').length,total:4},{zone:'B',name:'Cold Room 1',emoji:'🧊',occupied:UNITS.filter(u=>u.zone==='B'&&u.status==='Occupied').length,total:4},{zone:'C',name:'Cold Room 2',emoji:'❄️',occupied:UNITS.filter(u=>u.zone==='C'&&u.status==='Occupied').length,total:4},{zone:'D',name:'Freezer',emoji:'🥶',occupied:UNITS.filter(u=>u.zone==='D'&&u.status==='Occupied').length,total:4}].map(z=>(
          <div key={z.zone} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:500,color:ds.text}}>{z.emoji} Zone {z.zone} — {z.name}</span><span style={{fontFamily:ds.fontM,fontSize:13,fontWeight:700,color:ds.green}}>{z.occupied}/{z.total}</span></div>
            <div style={{background:ds.borderLt,borderRadius:99,height:8}}><div style={{width:`${(z.occupied/z.total)*100}%`,height:'100%',background:ds.green,borderRadius:99}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages ─────────────────────────────────────────────────────────────────
function StorageMessages() {
  const [active,setActive]=useState('sc1');
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState(STOR_MSG);
  const send=()=>{if(!input.trim())return;setMsgs(p=>({...p,[active]:[...(p[active]||[]),{from:'me',text:input.trim(),time:'Just now'}]}));setInput('');};
  const convo=STOR_CONVOS.find(c=>c.id===active)!;
  const thread=msgs[active]||[];
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Messages</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Chat with customers about storage bookings</p></div>
      <div style={{display:'flex',background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow,height:520}}>
        <div style={{width:260,flexShrink:0,borderRight:`1px solid ${ds.borderLt}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:`1px solid ${ds.borderLt}`}}><div style={{display:'flex',alignItems:'center',gap:6,background:ds.bg,borderRadius:7,padding:'6px 10px'}}><Search style={{width:12,height:12,color:ds.textTer}}/><input placeholder="Search…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:12,background:'transparent',width:'100%'}}/></div></div>
          <div style={{flex:1,overflowY:'auto'}}>
            {STOR_CONVOS.map(c=>(
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
function StorageSettings() {
  const bizName=localStorage.getItem('businessName')||localStorage.getItem('userName')||'My Cold Storage';
  const [profile,setProfile]=useState({name:bizName,phone:'+94 77 456 7890',email:localStorage.getItem('userEmail')||'',district:localStorage.getItem('userDistrict')||'Nuwara Eliya',address:'No. 12, Cold Storage Road',capacity:'16 units (4 zones)'});
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontSize:14,color:ds.text,outline:'none',boxSizing:'border-box'};
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Settings</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Manage your storage facility profile and preferences</p></div>
      {saved&&<div style={{background:ds.greenLt,border:`1px solid ${ds.greenBd}`,borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}><CheckCircle style={{width:16,height:16,color:ds.green}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.green,fontWeight:600}}>Changes saved successfully!</span></div>}
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>🏢 Facility Profile</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[{l:'Facility Name',k:'name'},{l:'Phone',k:'phone'},{l:'Email',k:'email'},{l:'District',k:'district'},{l:'Address',k:'address'},{l:'Total Capacity',k:'capacity'}].map(f=>(
              <div key={f.k}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.l}</label><input value={(profile as any)[f.k]} onChange={e=>setProfile(p=>({...p,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
          </div>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>🔔 Notifications</p>
          {['New booking request','Temperature alert triggered','Rental expiring (3 days)','Payment received','Customer message'].map((n,i)=>(
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
        <div style={{display:'flex',gap:10}}><button onClick={save} style={{padding:'10px 28px',background:ds.green,color:'#fff',border:'none',borderRadius:10,fontFamily:ds.fontB,fontWeight:700,fontSize:14,cursor:'pointer'}}>Save Changes</button><button style={{padding:'10px 20px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:10,fontFamily:ds.fontB,fontSize:14,cursor:'pointer'}}>Reset</button></div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function StorageFacilitiesDashboard({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const [collapsed,setCollapsed]=useState(false);
  const [section,setSection]=useState('dashboard');
  const render=()=>{
    switch(section){
      case 'dashboard':    return <DashboardHome setSection={setSection}/>;
      case 'units':        return <StorageUnits/>;
      case 'requests':     return <BookingRequests/>;
      case 'temperature':  return <TemperatureMonitor/>;
      case 'rentals':      return <ActiveRentals/>;
      case 'analytics':    return <StorageAnalytics/>;
      case 'messages':     return <StorageMessages/>;
      case 'settings':     return <StorageSettings/>;
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
