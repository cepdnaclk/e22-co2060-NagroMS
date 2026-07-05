import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Landmark, FileText, Percent, BarChart2,
  MessageSquare, FolderOpen, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Plus, Edit2,
  Trash2, Eye, Check, X, Download, TrendingUp, Clock,
  CheckCircle, AlertTriangle, ArrowUpRight, Info,
  ShieldCheck, Users,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ds = {
  sidebar:   'linear-gradient(170deg,#0a1628 0%,#0f2a4a 50%,#0a1e38 100%)',
  primary:   '#1d4ed8',
  primaryLt: '#eff6ff',
  primaryBd: '#bfdbfe',
  green:     '#16a34a', greenLt: '#f0fdf4', greenBd: '#dcfce7',
  bg:        '#f8fafc', surface:  '#ffffff',
  border:    '#e2e8f0', borderLt: '#f1f5f9',
  text:      '#0f172a', textSec:  '#475569', textTer: '#94a3b8',
  shadow:    '0 1px 3px rgba(0,0,0,0.07)',
  shadowMd:  '0 4px 16px rgba(0,0,0,0.08)',
  fontD:     "'Plus Jakarta Sans',sans-serif",
  fontB:     "'Inter',sans-serif",
  fontM:     "'JetBrains Mono',monospace",
  amber:     '#f59e0b', amberLt: '#fffbeb', amberBd: '#fde68a',
  red:       '#ef4444', redLt:   '#fef2f2', redBd:   '#fecaca',
  purple:    '#8b5cf6', purpleLt:'#f5f3ff', purpleBd:'#ddd6fe',
  teal:      '#0891b2', tealLt:  '#ecfeff', tealBd:  '#a5f3fc',
};

// ─── Types ─────────────────────────────────────────────────────────────────────
type AppStatus = 'Pending'|'Under Review'|'Approved'|'Rejected'|'Info Requested';
type SchemeStatus = 'Active'|'Inactive';

interface LoanScheme {
  id:string; name:string; type:string; interestRate:number; minAmount:number;
  maxAmount:number; repaymentPeriod:string; eligibility:string; requiredDocs:string[];
  status:SchemeStatus; applications:number;
}
interface LoanApplication {
  id:string; farmer:string; farmerIcon:string; cropType:string; farmSize:string;
  purpose:string; requestedAmount:number; applicationDate:string; status:AppStatus;
  district:string; contact:string;
}
interface InterestRate {
  id:string; loanType:string; rate:number; period:string; lastUpdated:string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const SCHEMES: LoanScheme[] = [
  { id:'SCH-001', name:'Crop Development Loan',    type:'Seasonal',     interestRate:7.5,  minAmount:25000,   maxAmount:500000,  repaymentPeriod:'6–18 months', eligibility:'Registered farmers with NIC & land documents', requiredDocs:['NIC','Land deed','Crop plan'], status:'Active',   applications:42 },
  { id:'SCH-002', name:'Equipment Purchase Loan',  type:'Asset Finance', interestRate:8.0,  minAmount:50000,   maxAmount:2000000, repaymentPeriod:'12–60 months', eligibility:'Farmers with >2 acres land',                   requiredDocs:['NIC','Land deed','Quotation'], status:'Active',   applications:28 },
  { id:'SCH-003', name:'Greenhouse Setup Loan',    type:'Investment',   interestRate:6.5,  minAmount:100000,  maxAmount:5000000, repaymentPeriod:'24–84 months', eligibility:'Commercial agri businesses',                   requiredDocs:['Business reg','Land deed','Plan'], status:'Active', applications:15 },
  { id:'SCH-004', name:'Organic Farming Loan',     type:'Subsidised',   interestRate:5.0,  minAmount:15000,   maxAmount:300000,  repaymentPeriod:'12–36 months', eligibility:'Certified organic farmers',                    requiredDocs:['NIC','Organic cert','Farm plan'], status:'Active', applications:31 },
  { id:'SCH-005', name:'Post-Harvest Loan',        type:'Working Capital',interestRate:9.0, minAmount:10000,   maxAmount:200000,  repaymentPeriod:'3–12 months',  eligibility:'Farmers with existing harvest',                requiredDocs:['NIC','Produce estimate'],          status:'Inactive', applications:8 },
  { id:'SCH-006', name:'Irrigation Development',  type:'Infrastructure',interestRate:7.0,  minAmount:75000,   maxAmount:1500000, repaymentPeriod:'24–96 months', eligibility:'Farmer cooperatives & groups',                 requiredDocs:['Group reg','Land deed','Plan'],   status:'Active',   applications:19 },
];

const APPLICATIONS: LoanApplication[] = [
  { id:'APP-3841', farmer:'Sunil Perera',    farmerIcon:'👨‍🌾', cropType:'Paddy Rice',    farmSize:'4.5 acres', purpose:'Seasonal crop cultivation funding',      requestedAmount:85000,  applicationDate:'2026-07-04', status:'Pending',       district:'Anuradhapura', contact:'077 123 4567' },
  { id:'APP-3840', farmer:'Kamala Silva',    farmerIcon:'👩‍🌾', cropType:'Vegetables',    farmSize:'2.0 acres', purpose:'Drip irrigation system installation',     requestedAmount:145000, applicationDate:'2026-07-03', status:'Under Review',  district:'Kandy',        contact:'081 222 3344' },
  { id:'APP-3839', farmer:'Nimal Fernando',  farmerIcon:'👨‍🌾', cropType:'Cinnamon',      farmSize:'6.0 acres', purpose:'Greenhouse construction for cinnamon',    requestedAmount:480000, applicationDate:'2026-07-02', status:'Approved',      district:'Galle',        contact:'091 333 4455' },
  { id:'APP-3838', farmer:'Priya Kumar',     farmerIcon:'👩‍🌾', cropType:'Coconut',       farmSize:'3.5 acres', purpose:'Post-harvest processing equipment',        requestedAmount:62000,  applicationDate:'2026-07-01', status:'Info Requested',district:'Jaffna',       contact:'021 444 5566' },
  { id:'APP-3837', farmer:'Rajan Muthu',     farmerIcon:'👨‍🌾', cropType:'Tomatoes',      farmSize:'1.5 acres', purpose:'Organic certification & crop transition',  requestedAmount:28000,  applicationDate:'2026-06-30', status:'Approved',      district:'Batticaloa',   contact:'076 555 6677' },
  { id:'APP-3836', farmer:'Amara Jayaweera', farmerIcon:'👩‍🌾', cropType:'Banana',        farmSize:'5.0 acres', purpose:'Seasonal crop cultivation & fertiliser',   requestedAmount:55000,  applicationDate:'2026-06-28', status:'Rejected',      district:'Kurunegala',   contact:'070 666 7788' },
  { id:'APP-3835', farmer:'Saman Dias',      farmerIcon:'👨‍🌾', cropType:'Pepper',        farmSize:'2.8 acres', purpose:'Irrigation infrastructure upgrade',        requestedAmount:120000, applicationDate:'2026-06-25', status:'Pending',       district:'Badulla',      contact:'055 777 8899' },
  { id:'APP-3834', farmer:'Nilanthi Peris',  farmerIcon:'👩‍🌾', cropType:'Sweet Potato',  farmSize:'1.2 acres', purpose:'Seasonal cultivation & input purchase',    requestedAmount:18500,  applicationDate:'2026-06-22', status:'Under Review',  district:'Polonnaruwa',  contact:'027 888 9900' },
];

const INTEREST_RATES: InterestRate[] = [
  { id:'IR-01', loanType:'Seasonal Crop Loan',    rate:7.5, period:'6–18 months', lastUpdated:'2026-06-01' },
  { id:'IR-02', loanType:'Asset Finance Loan',    rate:8.0, period:'12–60 months',lastUpdated:'2026-05-15' },
  { id:'IR-03', loanType:'Investment Loan',       rate:6.5, period:'24–84 months',lastUpdated:'2026-06-15' },
  { id:'IR-04', loanType:'Subsidised Agri Loan',  rate:5.0, period:'12–36 months',lastUpdated:'2026-07-01' },
  { id:'IR-05', loanType:'Working Capital Loan',  rate:9.0, period:'3–12 months', lastUpdated:'2026-04-20' },
  { id:'IR-06', loanType:'Infrastructure Loan',  rate:7.0, period:'24–96 months',lastUpdated:'2026-05-30' },
];

const MONTHLY_APPS = [
  { month:'Jan', applications:24, approved:18 },
  { month:'Feb', applications:31, approved:22 },
  { month:'Mar', applications:44, approved:35 },
  { month:'Apr', applications:38, approved:28 },
  { month:'May', applications:52, approved:41 },
  { month:'Jun', applications:61, approved:48 },
  { month:'Jul', applications:55, approved:43 },
];

const LOAN_TYPE_DIST = [
  { name:'Seasonal',     value:34, color:ds.green   },
  { name:'Asset Finance',value:22, color:ds.primary  },
  { name:'Investment',   value:18, color:ds.purple   },
  { name:'Subsidised',   value:16, color:ds.amber    },
  { name:'Working Cap',  value:10, color:ds.teal     },
];

const AMOUNT_DIST = [
  { range:'Rs 10K–50K',  count:28 },
  { range:'Rs 50K–100K', count:41 },
  { range:'Rs 100K–500K',count:32 },
  { range:'Rs 500K+',    count:12 },
];

const ACTIVITIES = [
  { time:'8 min ago',  icon:'📋', text:'New application APP-3841 from Sunil Perera — Paddy Rice, Rs 85,000', color:ds.primary },
  { time:'45 min ago', icon:'✅', text:'Application APP-3839 marked approved for contact — Nimal Fernando',   color:ds.green  },
  { time:'2 hr ago',   icon:'📊', text:'Interest rate updated for Subsidised Agri Loan: 5.0% effective today',color:ds.amber  },
  { time:'4 hr ago',   icon:'⏳', text:'Application APP-3838 flagged: additional documents requested',          color:ds.purple },
  { time:'Yesterday',  icon:'📄', text:'Monthly report for June 2026 generated — 61 applications processed',   color:ds.teal   },
  { time:'Yesterday',  icon:'🏦', text:'New loan scheme "Organic Farming Loan" activated and published',        color:ds.green  },
];

const appStatusCfg: Record<AppStatus,{bg:string;color:string;dot:string}> = {
  'Pending':        {bg:ds.amberLt,  color:'#92400e', dot:ds.amber  },
  'Under Review':   {bg:ds.primaryLt,color:'#1e40af', dot:ds.primary},
  'Approved':       {bg:ds.greenLt,  color:'#166534', dot:ds.green  },
  'Rejected':       {bg:ds.redLt,    color:'#991b1b', dot:ds.red    },
  'Info Requested': {bg:ds.purpleLt, color:'#5b21b6', dot:ds.purple },
};

// ─── Reusable UI ───────────────────────────────────────────────────────────────
const Badge = ({label,cfg}:{label:string;cfg:{bg:string;color:string;dot?:string}}) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>
    {cfg.dot&&<span style={{width:5,height:5,borderRadius:'50%',background:cfg.dot,flexShrink:0}}/>}{label}
  </span>
);
const TH = ({children}:{children:React.ReactNode}) => <th style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.07em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`,background:ds.bg,whiteSpace:'nowrap'}}>{children}</th>;
const TD = ({children,mono}:{children:React.ReactNode;mono?:boolean}) => <td style={{padding:'13px 16px',fontFamily:mono?ds.fontM:ds.fontB,fontSize:13,color:ds.text,borderBottom:`1px solid ${ds.borderLt}`,verticalAlign:'middle'}}>{children}</td>;
const Btn = ({label,icon,variant='primary',onClick,size='md'}:{label:string;icon?:React.ReactNode;variant?:'primary'|'secondary'|'danger'|'ghost';onClick?:()=>void;size?:'sm'|'md'}) => {
  const v={primary:{background:ds.primary,color:'#fff',border:'none'},secondary:{background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`},danger:{background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`},ghost:{background:'transparent',color:ds.textSec,border:'none'}}[variant];
  const sz=size==='sm'?{padding:'5px 11px',fontSize:12}:{padding:'8px 16px',fontSize:13};
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:ds.fontB,fontWeight:600,borderRadius:8,cursor:'pointer',...v,...sz}}>{icon}{label}</button>;
};

function KpiCard({label,value,sub,icon,iconBg,iconColor,trend}:{label:string;value:string;sub:string;icon:React.ReactNode;iconBg:string;iconColor:string;trend?:string}) {
  return (
    <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'22px',boxShadow:ds.shadow}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:11,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:iconColor}}>{icon}</div>
        {trend&&<span style={{display:'flex',alignItems:'center',gap:3,fontSize:11,fontWeight:700,color:trend.includes('-')?ds.red:ds.green,fontFamily:ds.fontB}}><ArrowUpRight style={{width:12,height:12}}/>{trend}</span>}
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
  {id:'dashboard',  label:'Dashboard',         icon:LayoutDashboard},
  {id:'schemes',    label:'Loan Schemes',       icon:Landmark},
  {id:'applications',label:'Loan Applications', icon:FileText},
  {id:'rates',      label:'Interest Rates',     icon:Percent},
  {id:'analytics',  label:'Analytics',          icon:BarChart2},
  {id:'messages',   label:'Customer Messages',  icon:MessageSquare},
  {id:'documents',  label:'Documents',          icon:FolderOpen},
  {id:'notifications',label:'Notifications',   icon:Bell},
  {id:'settings',   label:'Settings',           icon:Settings},
];

function Sidebar({collapsed,setCollapsed,active,setActive,onNavigate}:{collapsed:boolean;setCollapsed:(v:boolean)=>void;active:string;setActive:(s:string)=>void;onNavigate:(p:string)=>void}) {
  return (
    <aside style={{width:collapsed?66:252,flexShrink:0,background:ds.sidebar,display:'flex',flexDirection:'column',transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <div style={{padding:collapsed?'20px 15px':'20px 20px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,0.08)',justifyContent:collapsed?'center':'flex-start',minHeight:68,flexShrink:0}}>
        <div style={{width:34,height:34,background:'rgba(255,255,255,0.12)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,0.15)'}}><span style={{fontSize:17}}>🏦</span></div>
        {!collapsed&&<div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:800,color:'#fff',margin:0,lineHeight:1.2}}>NagroMS</p><p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.5)',margin:0}}>Financial Services</p></div>}
      </div>

      {/* Institution type badge */}
      {!collapsed&&(
        <div style={{margin:'12px 12px 4px',background:'rgba(29,78,216,0.25)',borderRadius:10,padding:'8px 12px',border:'1px solid rgba(29,78,216,0.4)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}><ShieldCheck style={{width:12,height:12,color:'#93c5fd'}}/><span style={{fontFamily:ds.fontB,fontSize:10,fontWeight:700,color:'#93c5fd',textTransform:'uppercase',letterSpacing:'0.06em'}}>Verified Institution</span></div>
          <p style={{fontFamily:ds.fontB,fontSize:11,color:'rgba(255,255,255,0.7)',margin:0}}>{localStorage.getItem('businessName')||'Agricultural Bank'}</p>
        </div>
      )}

      <nav style={{flex:1,padding:'8px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {NAV.map(item=>{
          const Icon=item.icon; const isActive=active===item.id;
          return <button key={item.id} onClick={()=>setActive(item.id)} title={collapsed?item.label:undefined} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:isActive?'rgba(255,255,255,0.14)':'transparent',color:isActive?'#fff':'rgba(255,255,255,0.55)',fontFamily:ds.fontB,fontSize:13,fontWeight:isActive?600:400,transition:'all 0.15s',boxShadow:isActive?'inset 0 0 0 1px rgba(255,255,255,0.18)':'none'}}>
            <Icon style={{width:16,height:16,flexShrink:0}}/>{!collapsed&&<span style={{flex:1,textAlign:'left',whiteSpace:'nowrap'}}>{item.label}</span>}
          </button>;
        })}
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
  const labels:Record<string,string>={dashboard:'Dashboard Overview',schemes:'Loan Schemes',applications:'Loan Applications',rates:'Interest Rates',analytics:'Analytics & Reports',messages:'Customer Messages',documents:'Documents',notifications:'Notifications',settings:'Settings'};
  const name=localStorage.getItem('businessName')||localStorage.getItem('userName')||'Institution';
  return (
    <header style={{height:60,background:ds.surface,borderBottom:`1px solid ${ds.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:30,flexShrink:0}}>
      <div>
        <h1 style={{fontFamily:ds.fontD,fontSize:16,fontWeight:700,color:ds.text,margin:0}}>{labels[section]||'Dashboard'}</h1>
        <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>Financial Services Portal · NagroMS</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',width:220}}>
          <Search style={{width:13,height:13,color:ds.textTer}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:ds.textTer}}>Search applications…</span>
        </div>
        <button style={{position:'relative',width:36,height:36,background:ds.bg,border:`1px solid ${ds.border}`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Bell style={{width:15,height:15,color:ds.textSec}}/><span style={{position:'absolute',top:6,right:7,width:7,height:7,background:ds.red,borderRadius:'50%',border:`2px solid ${ds.surface}`}}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.primaryLt,border:`1px solid ${ds.primaryBd}`,borderRadius:9,padding:'4px 11px 4px 4px',cursor:'pointer'}}>
          <div style={{width:26,height:26,background:`linear-gradient(135deg,${ds.primary},#3b82f6)`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🏦</div>
          <div><p style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text,margin:0}}>{name.split(' ')[0]}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>Financial Provider</p></div>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome({ schemes, apps, setSection, onAddScheme }: { schemes: any[]; apps: any[]; setSection: (s: string) => void; onAddScheme: () => void }) {
  const activeSchemes=schemes.filter(s=>s.status==='Active').length;
  const totalApps=apps.length;
  const pending=apps.filter(a=>a.status==='Pending').length;
  const approved=apps.filter(a=>a.status==='Approved').length;
  const rejected=apps.filter(a=>a.status==='Rejected').length;
  const monthApps=MONTHLY_APPS[MONTHLY_APPS.length-1].applications;
  const approvalRate=Math.round((MONTHLY_APPS[MONTHLY_APPS.length-1].approved/monthApps)*100);

  return (
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#0a1628 0%,#1e3a6e 45%,#1d4ed8 100%)',borderRadius:20,padding:'26px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'absolute',bottom:-60,right:140,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.03)'}}/>
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.12)',borderRadius:99,padding:'3px 10px',marginBottom:10}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80'}}/><span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>Active · Agricultural Financial Institution</span>
            </div>
            <h2 style={{fontFamily:ds.fontD,fontSize:24,fontWeight:800,color:'#fff',margin:'0 0 6px'}}>Good morning! 🏦</h2>
            <p style={{fontFamily:ds.fontB,fontSize:13,color:'rgba(255,255,255,0.7)',margin:0}}>{pending} new applications pending review · {approvalRate}% approval rate this month.</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[{label:'Active Schemes',value:String(activeSchemes)},{label:'This Month',value:String(monthApps)+' apps'},{label:'Approval Rate',value:approvalRate+'%'}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',borderRadius:14,padding:'12px 18px',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center',minWidth:100}}>
                <p style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 2px'}}>{s.value}</p>
                <p style={{fontFamily:ds.fontB,fontSize:10,color:'rgba(255,255,255,0.65)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:14,marginBottom:24}}>
        <KpiCard label="Active Loan Schemes"  value={String(activeSchemes)} sub="Published on platform"      icon={<Landmark style={{width:18,height:18}}/>}     iconBg={ds.primaryLt} iconColor={ds.primary} trend="+1 this month"/>
        <KpiCard label="Total Applications"   value={String(totalApps)}    sub="All time"                    icon={<FileText style={{width:18,height:18}}/>}     iconBg={ds.greenLt}   iconColor={ds.green}   trend="+55 this month"/>
        <KpiCard label="Pending Review"       value={String(pending)}      sub="Requires attention"          icon={<Clock style={{width:18,height:18}}/>}        iconBg={ds.amberLt}   iconColor={ds.amber}/>
        <KpiCard label="Approved"             value={String(approved)}     sub="Approved for contact"        icon={<CheckCircle style={{width:18,height:18}}/>}  iconBg={ds.greenLt}   iconColor={ds.green}   trend="+43 this month"/>
        <KpiCard label="Rejected"             value={String(rejected)}     sub="Not meeting criteria"        icon={<AlertTriangle style={{width:18,height:18}}/>}iconBg={ds.redLt}     iconColor={ds.red}/>
        <KpiCard label="Monthly Applications" value={String(monthApps)}    sub="July 2026"                   icon={<TrendingUp style={{width:18,height:18}}/>}   iconBg={ds.tealLt}    iconColor={ds.teal}    trend="+14%"/>
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 300px',gap:16,marginBottom:24}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div><p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:0}}>Monthly Applications</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:'2px 0 0'}}>Total vs approved · 2026</p></div>
            <span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.green,background:ds.greenLt,padding:'3px 8px',borderRadius:99}}>+14% this month</span>
          </div>
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={MONTHLY_APPS} margin={{top:2,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/>
              <XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/>
              <Line type="monotone" dataKey="applications" stroke={ds.primary} strokeWidth={2.5} dot={{r:4,fill:ds.primary,strokeWidth:0}} name="Applications"/>
              <Line type="monotone" dataKey="approved" stroke={ds.green} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Approved"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Loan Amount Distribution</p>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={AMOUNT_DIST} margin={{top:2,right:4,left:-20,bottom:0}} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/>
              <XAxis dataKey="range" tick={{fontFamily:ds.fontB,fontSize:10,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[v+' applications','']}/>
              <Bar dataKey="count" fill={ds.primary} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 4px'}}>Loan Type Distribution</p>
          <p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:'0 0 8px'}}>By application volume</p>
          <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={LOAN_TYPE_DIST} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">{LOAN_TYPE_DIST.map((d)=><Cell key={`fin-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:6}}>
            {LOAN_TYPE_DIST.map(d=>(
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
              <div style={{flex:1}}><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.text,margin:'0 0 2px',fontWeight:500}}>{a.text}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{a.time}</p></div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
            <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Quick Actions</p>
            {[{label:'Add Loan Scheme',icon:<Plus style={{width:13,height:13}}/>,color:ds.primary,bg:ds.primaryLt, action: () => { setSection('schemes'); onAddScheme(); }},{label:'Update Interest Rates',icon:<Percent style={{width:13,height:13}}/>,color:ds.green,bg:ds.greenLt, action: () => setSection('rates')},{label:'Review Applications',icon:<FileText style={{width:13,height:13}}/>,color:ds.amber,bg:ds.amberLt, action: () => setSection('applications')},{label:'Export Reports',icon:<Download style={{width:13,height:13}}/>,color:ds.purple,bg:ds.purpleLt, action: () => exportToCSV('loan_applications_report.csv', apps)},{label:'Generate Monthly Report',icon:<BarChart2 style={{width:13,height:13}}/>,color:ds.textSec,bg:ds.bg, action: () => exportToCSV('monthly_summary.csv', schemes)}].map(a=>(
              <button key={a.label} onClick={a.action} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 12px',background:a.bg,border:`1px solid ${a.color}22`,borderRadius:10,cursor:'pointer',fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:a.color,marginBottom:8,textAlign:'left'}}>
                {a.icon}{a.label}
              </button>
            ))}
          </div>
          <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'18px 20px',boxShadow:ds.shadow}}>
            <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 12px'}}>Scheme Performance</p>
            {schemes.filter(s=>s.status==='Active').map(scheme=>(
              <div key={scheme.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.text,fontWeight:500}}>{scheme.name.split(' ').slice(0,2).join(' ')}</span>
                  <span style={{fontFamily:ds.fontM,fontSize:11,fontWeight:700,color:ds.primary}}>{scheme.applications} apps</span>
                </div>
                <div style={{background:ds.borderLt,borderRadius:99,height:5}}>
                  <div style={{width:`${(scheme.applications/42)*100}%`,height:'100%',background:ds.primary,borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loan Schemes ──────────────────────────────────────────────────────────────
function LoanSchemesSection({ schemes, setSchemes, showAddModal, setShowAddModal }: { schemes: any[]; setSchemes: any; showAddModal: boolean; setShowAddModal: (v: boolean) => void }) {
  const [editingScheme, setEditingScheme] = useState<any>(null);
  
  const handleSave = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newScheme = {
      id: editingScheme?.id || `SCH-00${schemes.length + 1}`,
      name: formData.get('name'),
      type: formData.get('type'),
      interestRate: parseFloat(formData.get('interestRate') as string),
      minAmount: parseFloat(formData.get('minAmount') as string),
      maxAmount: parseFloat(formData.get('maxAmount') as string),
      repaymentPeriod: formData.get('repaymentPeriod'),
      eligibility: formData.get('eligibility'),
      requiredDocs: (formData.get('requiredDocs') as string).split(',').map(d=>d.trim()),
      status: formData.get('status') || 'Active',
      applications: editingScheme?.applications || 0
    };
    if (editingScheme) {
      setSchemes((p: any) => p.map((s: any) => s.id === editingScheme.id ? newScheme : s));
      setEditingScheme(null);
    } else {
      setSchemes((p: any) => [...p, newScheme]);
      setShowAddModal(false);
    }
  };

  const toggle=(id:string)=>setSchemes(p=>p.map(s=>s.id===id?{...s,status:s.status==='Active'?'Inactive':'Active'}:s));
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Loan Schemes</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Manage agricultural loan products published on NagroMS</p></div><Btn label="Add Loan Scheme" icon={<Plus style={{width:13,height:13}}/>} onClick={() => setShowAddModal(true)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
        {schemes.map(scheme=>(
          <div key={scheme.id} style={{background:ds.surface,borderRadius:18,border:`1px solid ${scheme.status==='Active'?ds.primaryBd:ds.border}`,padding:'22px',boxShadow:ds.shadow}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 4px'}}>{scheme.name}</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontFamily:ds.fontB,fontSize:11,padding:'2px 7px',background:ds.primaryLt,color:ds.primary,borderRadius:99,fontWeight:600}}>{scheme.type}</span>
                  <Badge label={scheme.status} cfg={scheme.status==='Active'?{bg:ds.greenLt,color:'#166534',dot:ds.green}:{bg:'#f1f5f9',color:ds.textSec,dot:ds.textTer}}/>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <p style={{fontFamily:ds.fontM,fontSize:22,fontWeight:800,color:ds.primary,margin:0}}>{scheme.interestRate}%</p>
                <p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0}}>interest p.a.</p>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[{label:'Min Amount',value:`Rs ${(scheme.minAmount/1000).toFixed(0)}K`},{label:'Max Amount',value:`Rs ${(scheme.maxAmount/1000000)>=1?(scheme.maxAmount/1000000).toFixed(1)+'M':(scheme.maxAmount/1000).toFixed(0)+'K'}`},{label:'Repayment',value:scheme.repaymentPeriod},{label:'Applications',value:String(scheme.applications)}].map(d=>(
                <div key={d.label} style={{background:ds.bg,borderRadius:8,padding:'8px 10px'}}>
                  <p style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer,margin:0,textTransform:'uppercase',letterSpacing:'0.05em'}}>{d.label}</p>
                  <p style={{fontFamily:ds.fontM,fontSize:13,fontWeight:700,color:ds.text,margin:'2px 0 0'}}>{d.value}</p>
                </div>
              ))}
            </div>
            <div style={{background:ds.primaryLt,borderRadius:9,padding:'10px 12px',marginBottom:14,border:`1px solid ${ds.primaryBd}`}}>
              <p style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.primary,margin:'0 0 3px'}}>Eligibility</p>
              <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:'0 0 6px'}}>{scheme.eligibility}</p>
              <p style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.primary,margin:'0 0 3px'}}>Required Documents</p>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{scheme.requiredDocs.map(d=><span key={d} style={{fontFamily:ds.fontB,fontSize:10,padding:'2px 7px',background:'rgba(29,78,216,0.1)',color:ds.primary,borderRadius:99}}>{d}</span>)}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn label="Edit" icon={<Edit2 style={{width:12,height:12}}/>} variant="secondary" size="sm" onClick={() => setEditingScheme(scheme)}/>
              <button onClick={()=>toggle(scheme.id)} style={{padding:'5px 12px',background:scheme.status==='Active'?ds.redLt:ds.greenLt,color:scheme.status==='Active'?ds.red:ds.green,border:`1px solid ${scheme.status==='Active'?ds.redBd:ds.greenBd}`,borderRadius:8,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                {scheme.status==='Active'?'Deactivate':'Activate'}
              </button>
              <button onClick={() => setSchemes((p: any) => p.filter((s: any) => s.id !== scheme.id))} style={{padding:'5px 10px',background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:8,fontFamily:ds.fontB,fontSize:12,cursor:'pointer'}}><Trash2 style={{width:12,height:12}}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loan Applications ─────────────────────────────────────────────────────────
function LoanApplicationsSection({ apps, setApps }: { apps: any[]; setApps: any }) {
  const [viewingApp, setViewingApp] = useState<any>(null);
  const [filter,setFilter]=useState('All');
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1); const perPage=5;

  const update=(id:string,s:AppStatus)=>setApps(p=>p.map(a=>a.id===id?{...a,status:s}:a));
  const filtered=useMemo(()=>apps.filter(a=>(filter==='All'||a.status===filter)&&(a.farmer.toLowerCase().includes(search.toLowerCase())||a.cropType.toLowerCase().includes(search.toLowerCase())||a.id.toLowerCase().includes(search.toLowerCase()))),[apps,filter,search]);
  const paged=filtered.slice((page-1)*perPage,page*perPage);
  const total=Math.ceil(filtered.length/perPage);

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Loan Applications</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Review and manage farmer loan applications</p></div><Btn label="Export" icon={<Download style={{width:13,height:13}}/>} variant="secondary" onClick={() => exportToCSV('applications.csv', apps)}/></div>

      {/* Important disclaimer */}
      <div style={{background:ds.primaryLt,border:`1px solid ${ds.primaryBd}`,borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
        <ShieldCheck style={{width:18,height:18,color:ds.primary,flexShrink:0,marginTop:1}}/>
        <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.primary,margin:0,lineHeight:1.6}}><strong>Note:</strong> Approving an application on NagroMS means approving the farmer for direct contact and further review by your institution. Actual loan disbursement occurs through your institution's standard process outside this platform.</p>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',flex:1,minWidth:220}}>
          <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by farmer, crop, application ID…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['All','Pending','Under Review','Approved','Info Requested','Rejected'].map(f=>(
            <button key={f} onClick={()=>{setFilter(f);setPage(1);}} style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${filter===f?ds.primary:ds.border}`,background:filter===f?ds.primary:ds.surface,color:filter===f?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:1000}}>
            <thead><tr><TH>App ID</TH><TH>Farmer</TH><TH>Crop Type</TH><TH>Farm Size</TH><TH>Loan Purpose</TH><TH>Amount</TH><TH>Date</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {paged.map((a,i)=>(
                <tr key={a.id} style={{background:i%2===0?ds.surface:'#fafafa'}}>
                  <TD><span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.primary}}>{a.id}</span></TD>
                  <TD>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>{a.farmerIcon}</span>
                      <div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>{a.farmer}</p><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer,margin:0}}>{a.district}</p></div>
                    </div>
                  </TD>
                  <TD><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:ds.bg,borderRadius:6,color:ds.textSec}}>{a.cropType}</span></TD>
                  <TD><span style={{fontFamily:ds.fontM,fontSize:12,color:ds.textSec}}>{a.farmSize}</span></TD>
                  <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec}}>{a.purpose}</span></TD>
                  <TD mono><strong style={{color:ds.primary}}>Rs {a.requestedAmount.toLocaleString()}</strong></TD>
                  <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{a.applicationDate}</span></TD>
                  <TD><Badge label={a.status} cfg={appStatusCfg[a.status]}/></TD>
                  <TD>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      <button onClick={() => setViewingApp(a)} style={{padding:'4px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Eye style={{width:11,height:11}}/>View</button>
                      {(a.status==='Pending'||a.status==='Under Review')&&<>
                        <button onClick={()=>update(a.id,'Under Review')} style={{padding:'4px 8px',background:ds.primaryLt,color:ds.primary,border:`1px solid ${ds.primaryBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Review</button>
                        <button onClick={()=>update(a.id,'Approved')} style={{padding:'4px 8px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Check style={{width:11,height:11}}/>Approve</button>
                        <button onClick={()=>update(a.id,'Info Requested')} style={{padding:'4px 8px',background:ds.purpleLt,color:ds.purple,border:`1px solid ${ds.purpleBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><Info style={{width:11,height:11}}/>More Info</button>
                        <button onClick={()=>update(a.id,'Rejected')} style={{padding:'4px 8px',background:ds.redLt,color:ds.red,border:`1px solid ${ds.redBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><X style={{width:11,height:11}}/>Reject</button>
                      </>}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>Showing {(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===1?ds.textTer:ds.text,cursor:page===1?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Prev</button>
            {Array.from({length:total},(_,i)=><button key={i} onClick={()=>setPage(i+1)} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${page===i+1?ds.primary:ds.border}`,background:page===i+1?ds.primary:ds.surface,color:page===i+1?'#fff':ds.text,cursor:'pointer',fontFamily:ds.fontB,fontSize:12}}>{i+1}</button>)}
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} style={{padding:'5px 10px',borderRadius:7,border:`1px solid ${ds.border}`,background:ds.surface,color:page===total?ds.textTer:ds.text,cursor:page===total?'not-allowed':'pointer',fontFamily:ds.fontB,fontSize:12}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interest Rates ────────────────────────────────────────────────────────────
function InterestRatesSection() {
  const [rates,setRates]=useState(INTEREST_RATES);
  const [editing,setEditing]=useState<string|null>(null);
  const [editVal,setEditVal]=useState('');
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Interest Rate Management</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Update and manage rates for each loan product</p></div></div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><TH>Loan Type</TH><TH>Current Rate</TH><TH>Repayment Period</TH><TH>Last Updated</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {rates.map((r,i)=>(
              <tr key={r.id} style={{background:i%2===0?ds.surface:'#fafafa'}}>
                <TD><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{r.loanType}</span></TD>
                <TD>
                  {editing===r.id ? (
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} step="0.1" style={{width:80,padding:'5px 8px',border:`1px solid ${ds.primary}`,borderRadius:7,fontFamily:ds.fontM,fontSize:13,outline:'none'}}/>
                      <span style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec}}>% p.a.</span>
                      <button onClick={()=>{setRates(p=>p.map(x=>x.id===r.id?{...x,rate:parseFloat(editVal)||x.rate,lastUpdated:new Date().toISOString().slice(0,10)}:x));setEditing(null);}} style={{padding:'4px 10px',background:ds.greenLt,color:ds.green,border:`1px solid ${ds.greenBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>Save</button>
                      <button onClick={()=>setEditing(null)} style={{padding:'4px 8px',background:ds.bg,color:ds.textSec,border:`1px solid ${ds.border}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer'}}>Cancel</button>
                    </div>
                  ):(
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:ds.fontM,fontSize:20,fontWeight:800,color:ds.primary}}>{r.rate}%</span>
                      <span style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer}}>per annum</span>
                    </div>
                  )}
                </TD>
                <TD><span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 9px',background:ds.primaryLt,color:ds.primary,borderRadius:99}}>{r.period}</span></TD>
                <TD><span style={{fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{r.lastUpdated}</span></TD>
                <TD>
                  <button onClick={()=>{setEditing(r.id);setEditVal(String(r.rate));}} style={{padding:'5px 12px',background:ds.primaryLt,color:ds.primary,border:`1px solid ${ds.primaryBd}`,borderRadius:8,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5}}>
                    <Edit2 style={{width:12,height:12}}/>Edit Rate
                  </button>
                </TD>
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
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}><div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Analytics & Reports</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Loan application trends and demand insights</p></div><Btn label="Export Report" icon={<Download style={{width:13,height:13}}/>} variant="secondary"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Application Trends (2026)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_APPS} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt}/>
              <XAxis dataKey="month" tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}}/>
              <Line type="monotone" dataKey="applications" stroke={ds.primary} strokeWidth={2.5} dot={{r:4,fill:ds.primary,strokeWidth:0}} name="Applications"/>
              <Line type="monotone" dataKey="approved" stroke={ds.green} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Approved"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>Loan Amount Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AMOUNT_DIST} margin={{top:4,right:4,left:-20,bottom:0}} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={ds.borderLt} vertical={false}/>
              <XAxis dataKey="range" tick={{fontFamily:ds.fontB,fontSize:10,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:ds.fontB,fontSize:11,fill:ds.textTer}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[v+' applications','']}/>
              <Bar dataKey="count" fill={ds.primary} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 16px'}}>Most Requested Loan Types</p>
          {SCHEMES.filter(s=>s.applications>0).sort((a,b)=>b.applications-a.applications).map(scheme=>(
            <div key={scheme.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <span style={{fontFamily:ds.fontB,fontSize:12,padding:'3px 8px',background:ds.primaryLt,color:ds.primary,borderRadius:6,flexShrink:0}}>{scheme.type}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.text}}>{scheme.name}</span>
                  <span style={{fontFamily:ds.fontM,fontSize:12,fontWeight:700,color:ds.primary}}>{scheme.applications} apps</span>
                </div>
                <div style={{background:ds.borderLt,borderRadius:99,height:5}}>
                  <div style={{width:`${(scheme.applications/42)*100}%`,height:'100%',background:ds.primary,borderRadius:99}}/>
                </div>
              </div>
              <span style={{fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.green}}>{scheme.interestRate}% p.a.</span>
            </div>
          ))}
        </div>
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:'20px',boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:14,fontWeight:700,color:ds.text,margin:'0 0 8px'}}>Loan Type Distribution</p>
          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={LOAN_TYPE_DIST} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>{LOAN_TYPE_DIST.map((d)=><Cell key={`fin-${d.name}`} fill={d.color}/>)}</Pie><Tooltip contentStyle={{fontFamily:ds.fontB,fontSize:12,borderRadius:10,border:`1px solid ${ds.border}`}} formatter={(v:number)=>[`${v}%`,'']} /></PieChart></ResponsiveContainer>
          {LOAN_TYPE_DIST.map(d=>(
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

// ─── Customer Messages ─────────────────────────────────────────────────────────
const FIN_CONVOS = [
  {id:'fc1',name:'Sunil Perera',   icon:'👨‍🌾',lastMsg:'Can I apply for the Crop Development Loan?', time:'10 min ago',unread:2,online:true},
  {id:'fc2',name:'Kamala Silva',   icon:'👩‍🌾',lastMsg:'What documents are needed for equipment loan?',time:'1 hr ago',  unread:0,online:false},
  {id:'fc3',name:'Nimal Fernando', icon:'👨‍🌾',lastMsg:'My application APP-3839 was approved. Thank you!',time:'3 hr ago',unread:0,online:true},
  {id:'fc4',name:'Rajan Muthu',    icon:'👨‍🌾',lastMsg:'What is the interest rate for seasonal loans?',time:'Yesterday',unread:1,online:false},
];
const FIN_MSG:Record<string,{from:'me'|'them';text:string;time:string}[]>={
  fc1:[{from:'them',text:'Hello, I would like to apply for a crop loan for paddy cultivation.',time:'8:00 AM'},{from:'me',text:'Welcome! You can apply through our Crop Development Loan scheme. Please visit our office with your NIC and land deed.',time:'8:15 AM'},{from:'them',text:'Can I apply for the Crop Development Loan?',time:'9:00 AM'}],
};
function FinancialMessages() {
  const [active,setActive]=useState('fc1');
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState(FIN_MSG);
  const send=()=>{if(!input.trim())return;setMsgs(p=>({...p,[active]:[...(p[active]||[]),{from:'me',text:input.trim(),time:'Just now'}]}));setInput('');};
  const convo=FIN_CONVOS.find(c=>c.id===active)!;
  const thread=msgs[active]||[];
  return (
    <div>
      <div style={{marginBottom:20}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Customer Messages</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Banking-style secure messaging with loan applicants</p></div>
      <div style={{background:'#eff6ff',border:`1px solid ${ds.primaryBd}`,borderRadius:10,padding:'10px 14px',marginBottom:16,display:'flex',gap:8,alignItems:'center'}}>
        <ShieldCheck style={{width:15,height:15,color:ds.primary,flexShrink:0}}/><p style={{fontFamily:ds.fontB,fontSize:12,color:ds.primary,margin:0}}>All messages are encrypted and compliant with banking communication standards.</p>
      </div>
      <div style={{display:'flex',background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow,height:520}}>
        <div style={{width:270,flexShrink:0,borderRight:`1px solid ${ds.borderLt}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 14px',borderBottom:`1px solid ${ds.borderLt}`}}><div style={{display:'flex',alignItems:'center',gap:6,background:ds.bg,borderRadius:7,padding:'6px 10px'}}><Search style={{width:12,height:12,color:ds.textTer}}/><input placeholder="Search…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:12,background:'transparent',width:'100%'}}/></div></div>
          <div style={{flex:1,overflowY:'auto'}}>
            {FIN_CONVOS.map(c=>(
              <div key={c.id} onClick={()=>setActive(c.id)} style={{display:'flex',gap:9,padding:'11px 14px',cursor:'pointer',background:active===c.id?ds.primaryLt:'transparent',borderBottom:`1px solid ${ds.borderLt}`}}>
                <div style={{position:'relative',flexShrink:0}}><div style={{width:38,height:38,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{c.icon}</div>{c.online&&<span style={{position:'absolute',bottom:0,right:0,width:9,height:9,background:'#22c55e',borderRadius:'50%',border:`2px solid ${ds.surface}`}}/>}</div>
                <div style={{flex:1,minWidth:0}}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontFamily:ds.fontB,fontSize:12,fontWeight:600,color:ds.text}}>{c.name}</span><span style={{fontFamily:ds.fontB,fontSize:10,color:ds.textTer}}>{c.time}</span></div><p style={{fontFamily:ds.fontB,fontSize:11,color:ds.textSec,margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.lastMsg}</p></div>
                {c.unread>0&&<span style={{alignSelf:'center',minWidth:16,height:16,background:ds.primary,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ds.fontB,fontSize:10,fontWeight:700,color:'#fff'}}>{c.unread}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'12px 18px',borderBottom:`1px solid ${ds.borderLt}`,display:'flex',alignItems:'center',gap:9}}><div style={{width:34,height:34,borderRadius:'50%',background:ds.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{convo.icon}</div><div><p style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text,margin:0}}>{convo.name}</p><p style={{fontFamily:ds.fontB,fontSize:10,color:convo.online?'#22c55e':ds.textTer,margin:0}}>{convo.online?'Online':'Offline'}</p></div></div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
            {thread.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.from==='me'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'70%',background:m.from==='me'?ds.primary:ds.bg,color:m.from==='me'?'#fff':ds.text,borderRadius:m.from==='me'?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'9px 13px'}}>
                  <p style={{fontFamily:ds.fontB,fontSize:12,margin:0,lineHeight:1.5}}>{m.text}</p>
                  <p style={{fontFamily:ds.fontB,fontSize:9,color:m.from==='me'?'rgba(255,255,255,0.7)':ds.textTer,margin:'3px 0 0',textAlign:'right'}}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'10px 14px',borderTop:`1px solid ${ds.borderLt}`,display:'flex',gap:7}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message…" style={{flex:1,padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:9,fontFamily:ds.fontB,fontSize:12,color:ds.text,outline:'none'}}/>
            <button onClick={send} style={{padding:'9px 18px',background:ds.primary,color:'#fff',border:'none',borderRadius:9,fontFamily:ds.fontB,fontWeight:600,fontSize:12,cursor:'pointer'}}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Documents ─────────────────────────────────────────────────────────────────
const DOCUMENTS = [
  {id:'DOC-001',farmer:'Nimal Fernando', icon:'👨‍🌾',appId:'APP-3839',docType:'Land Deed',         uploadDate:'2026-07-01',status:'Approved', fileSize:'1.2 MB'},
  {id:'DOC-002',farmer:'Nimal Fernando', icon:'👨‍🌾',appId:'APP-3839',docType:'NIC Copy',           uploadDate:'2026-07-01',status:'Approved', fileSize:'0.4 MB'},
  {id:'DOC-003',farmer:'Kamala Silva',   icon:'👩‍🌾',appId:'APP-3840',docType:'Phytosanitary Cert', uploadDate:'2026-07-02',status:'Pending',  fileSize:'0.8 MB'},
  {id:'DOC-004',farmer:'Kamala Silva',   icon:'👩‍🌾',appId:'APP-3840',docType:'Quotation',           uploadDate:'2026-07-03',status:'Under Review',fileSize:'0.5 MB'},
  {id:'DOC-005',farmer:'Priya Kumar',    icon:'👩‍🌾',appId:'APP-3838',docType:'NIC Copy',           uploadDate:'2026-07-01',status:'Rejected',  fileSize:'0.3 MB'},
  {id:'DOC-006',farmer:'Sunil Perera',   icon:'👨‍🌾',appId:'APP-3841',docType:'Crop Plan',           uploadDate:'2026-07-04',status:'Pending',  fileSize:'0.6 MB'},
];
const docStatusCfg: Record<string,{bg:string;color:string;dot:string}> = {
  Approved:     {bg:ds.greenLt, color:'#166534', dot:'#16a34a'},
  Pending:      {bg:ds.amberLt, color:'#92400e', dot:'#f59e0b'},
  'Under Review':{bg:ds.primaryLt,color:'#1e40af',dot:ds.primary},
  Rejected:     {bg:ds.redLt,   color:'#991b1b', dot:'#ef4444'},
};
function DocumentsSection() {
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [docs,setDocs]=useState(DOCUMENTS);
  const approve=(id:string)=>setDocs(p=>p.map(d=>d.id===id?{...d,status:'Approved'}:d));
  const reject=(id:string)=>setDocs(p=>p.map(d=>d.id===id?{...d,status:'Rejected'}:d));
  const [search,setSearch]=useState('');
  const filtered=useMemo(()=>docs.filter(d=>d.farmer.toLowerCase().includes(search.toLowerCase())||d.docType.toLowerCase().includes(search.toLowerCase())),[docs,search]);
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Documents</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>Review and approve loan application documents</p></div>
        <button onClick={() => exportToCSV('documents.csv', docs)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}><Download style={{width:14,height:14}}/>Export</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:ds.surface,border:`1px solid ${ds.border}`,borderRadius:9,padding:'7px 12px',marginBottom:16}}>
        <Search style={{width:14,height:14,color:ds.textTer}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…" style={{border:'none',outline:'none',fontFamily:ds.fontB,fontSize:13,color:ds.text,background:'transparent',width:'100%'}}/>
      </div>
      <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,overflow:'hidden',boxShadow:ds.shadow}}>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
          <thead><tr style={{background:ds.bg}}>{['Document ID','Farmer','Application','Document Type','Uploaded','Size','Status','Actions'].map(h=><th key={h} style={{padding:'11px 16px',fontFamily:ds.fontB,fontSize:11,fontWeight:600,color:ds.textTer,textAlign:'left',letterSpacing:'0.06em',textTransform:'uppercase',borderBottom:`1px solid ${ds.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((d,i)=>{
            const sc=docStatusCfg[d.status]||docStatusCfg['Pending'];
            return (
              <tr key={d.id} style={{borderBottom:i<filtered.length-1?`1px solid ${ds.borderLt}`:'none'}}>
                <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:12,fontWeight:600,color:ds.primary}}>{d.id}</td>
                <td style={{padding:'13px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:16}}>{d.icon}</span><span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:600,color:ds.text}}>{d.farmer}</span></div></td>
                <td style={{padding:'13px 16px',fontFamily:ds.fontM,fontSize:12,color:ds.textSec}}>{d.appId}</td>
                <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:13,color:ds.text}}>{d.docType}</td>
                <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{d.uploadDate}</td>
                <td style={{padding:'13px 16px',fontFamily:ds.fontB,fontSize:12,color:ds.textTer}}>{d.fileSize}</td>
                <td style={{padding:'13px 16px'}}><span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,fontFamily:ds.fontB,padding:'3px 9px',borderRadius:99,background:sc.bg,color:sc.color,whiteSpace:'nowrap'}}><span style={{width:5,height:5,borderRadius:'50%',background:sc.dot}}/>{d.status}</span></td>
                <td style={{padding:'13px 16px'}}>
                  <div style={{display:'flex',gap:5}}>
                    <button onClick={() => setPreviewDoc(d)} style={{padding:'4px 9px',background:ds.primaryLt,color:ds.primary,border:`1px solid ${ds.primaryBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,cursor:'pointer'}}>👁 Preview</button>
                    {d.status==='Pending'&&<><button onClick={()=>approve(d.id)} style={{padding:'4px 8px',background:ds.greenLt,color:'#16a34a',border:'1px solid #86efac',borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>✓ Approve</button><button onClick={()=>reject(d.id)} style={{padding:'4px 8px',background:ds.redLt,color:'#ef4444',border:`1px solid ${ds.redBd}`,borderRadius:7,fontFamily:ds.fontB,fontSize:11,fontWeight:600,cursor:'pointer'}}>✗ Reject</button></>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      </div>
    </div>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────
const NOTIFS = [
  {id:'n1',type:'application',icon:'📋',title:'New Loan Application',  text:'Sunil Perera submitted application APP-3841 for Rs 85,000 Crop Development Loan.',    time:'10 min ago', read:false, color:'#2563eb'},
  {id:'n2',type:'document',   icon:'📄',title:'Document Uploaded',     text:'Kamala Silva uploaded Quotation document for application APP-3840.',                     time:'45 min ago', read:false, color:'#8b5cf6'},
  {id:'n3',type:'rate',       icon:'📊',title:'Interest Rate Updated', text:'Subsidised Agri Loan rate changed to 5.0% per annum. Effective immediately.',            time:'2 hr ago',   read:true,  color:'#f59e0b'},
  {id:'n4',type:'reminder',   icon:'⏰',title:'Pending Review',        text:'Application APP-3838 from Priya Kumar has been pending for 3 days. Please review.',      time:'4 hr ago',   read:true,  color:'#dc2626'},
  {id:'n5',type:'approved',   icon:'✅',title:'Application Approved',  text:'APP-3839 (Nimal Fernando) has been marked approved for contact.',                        time:'Yesterday',  read:true,  color:'#16a34a'},
  {id:'n6',type:'message',    icon:'💬',title:'New Customer Message',  text:'Rajan Muthu sent a message: "What is the interest rate for seasonal loans?"',           time:'Yesterday',  read:true,  color:'#0891b2'},
];
function NotificationsSection() {
  const [notifs,setNotifs]=useState(NOTIFS);
  const [filter,setFilter]=useState('all');
  const markAll=()=>setNotifs(p=>p.map(n=>({...n,read:true})));
  const markRead=(id:string)=>setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  const filtered=filter==='unread'?notifs.filter(n=>!n.read):notifs;
  const unreadCount=notifs.filter(n=>!n.read).length;
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Notifications</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{unreadCount} unread notifications</p></div>
        <button onClick={markAll} style={{padding:'8px 16px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontWeight:600,fontSize:13,cursor:'pointer'}}>Mark all read</button>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {[{label:'All',val:'all'},{label:`Unread (${unreadCount})`,val:'unread'}].map(f=>(
          <button key={f.val} onClick={()=>setFilter(f.val)} style={{padding:'6px 14px',borderRadius:99,border:`1px solid ${filter===f.val?ds.primary:ds.border}`,background:filter===f.val?ds.primary:ds.surface,color:filter===f.val?'#fff':ds.textSec,fontFamily:ds.fontB,fontSize:12,fontWeight:600,cursor:'pointer'}}>{f.label}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.map(n=>(
          <div key={n.id} onClick={()=>markRead(n.id)} style={{background:n.read?ds.surface:`${n.color}06`,borderRadius:12,border:`1px solid ${n.read?ds.border:n.color+'30'}`,padding:'14px 16px',display:'flex',gap:12,cursor:'pointer',boxShadow:n.read?ds.shadow:'none'}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${n.color}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontFamily:ds.fontB,fontSize:13,fontWeight:700,color:ds.text}}>{n.title}</span>
                <span style={{fontFamily:ds.fontB,fontSize:11,color:ds.textTer}}>{n.time}</span>
              </div>
              <p style={{fontFamily:ds.fontB,fontSize:12,color:ds.textSec,margin:0,lineHeight:1.5}}>{n.text}</p>
            </div>
            {!n.read&&<span style={{width:8,height:8,borderRadius:'50%',background:n.color,flexShrink:0,marginTop:4}}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function FinancialSettings() {
  const accountType=localStorage.getItem('userAccountType')||'business';
  const isBank=accountType==='business';
  const bizName=localStorage.getItem('businessName')||localStorage.getItem('userName')||'My Institution';
  const [profile,setProfile]=useState({
    name:bizName, phone:'+94 11 200 0000', email:localStorage.getItem('userEmail')||'',
    district:localStorage.getItem('userDistrict')||'',
    branch:isBank?'Main Branch — Colombo':'N/A',
    license:isBank?'CBL-AGRI-2024-0012':'IND-LENDER-2024-0088',
    description:isBank?'Leading agricultural bank providing financial solutions to Sri Lankan farmers.':'Individual agricultural lender providing micro-loans to small farmers.',
  });
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',border:`1px solid ${ds.border}`,borderRadius:8,fontFamily:ds.fontB,fontSize:14,color:ds.text,outline:'none',boxSizing:'border-box'};
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{fontFamily:ds.fontD,fontSize:18,fontWeight:800,color:ds.text,margin:0}}>Settings</h2><p style={{fontFamily:ds.fontB,fontSize:13,color:ds.textSec,margin:'3px 0 0'}}>{isBank?'Financial Institution Profile':'Individual Lender Profile'}</p></div>
      {saved&&<div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}><CheckCircle style={{width:16,height:16,color:'#16a34a'}}/><span style={{fontFamily:ds.fontB,fontSize:13,color:'#16a34a',fontWeight:600}}>Changes saved!</span></div>}
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        {/* Profile */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 18px'}}>{isBank?'🏦 Institution Profile':'👤 Lender Profile'}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[
              {l:isBank?'Institution Name':'Full Name',k:'name'},
              {l:'Phone / Hotline',k:'phone'},
              {l:'Email',k:'email'},
              {l:'District',k:'district'},
              ...(isBank?[{l:'Branch',k:'branch'},{l:'Agri License No.',k:'license'}]:[{l:'License / Reg. No.',k:'license'}]),
            ].map(f=>(
              <div key={f.k}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{f.l}</label><input value={(profile as any)[f.k]} onChange={e=>setProfile(p=>({...p,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
            <div style={{gridColumn:'1/-1'}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>About / Description</label><textarea value={profile.description} onChange={e=>setProfile(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:'vertical'}}/></div>
          </div>
        </div>
        {/* Notifications */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>🔔 Notification Preferences</p>
          {['New loan application received','Document uploaded by applicant','Application status updated','Interest rate change reminder','Monthly report generated'].map((n,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<4?`1px solid ${ds.borderLt}`:'none'}}>
              <span style={{fontFamily:ds.fontB,fontSize:13,color:ds.text}}>{n}</span>
              <div onClick={() => {
                const isChecked = profile[n as keyof typeof profile] !== false;
                setProfile(p => ({...p, [n]: !isChecked}));
              }} style={{width:44,height:24,background:profile[n as keyof typeof profile] !== false?ds.primary:'#e5e7eb',borderRadius:99,position:'relative',cursor:'pointer',transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:2,left:profile[n as keyof typeof profile] !== false?22:2,width:20,height:20,background:'#fff',borderRadius:'50%',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s'}}/>
              </div>
            </div>
          ))}
        </div>
        {/* Security */}
        <div style={{background:ds.surface,borderRadius:16,border:`1px solid ${ds.border}`,padding:24,boxShadow:ds.shadow}}>
          <p style={{fontFamily:ds.fontD,fontSize:15,fontWeight:700,color:ds.text,margin:'0 0 14px'}}>🔐 Security</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:600}}>
            {['Current Password','New Password','Confirm Password'].map((l,i)=>(
              <div key={i} style={i===2?{gridColumn:'1/2'}:{}}><label style={{display:'block',fontFamily:ds.fontB,fontSize:12,fontWeight:500,color:ds.textSec,marginBottom:5}}>{l}</label><input type="password" placeholder="••••••••" style={inp}/></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}><button onClick={save} style={{padding:'10px 28px',background:ds.primary,color:'#fff',border:'none',borderRadius:10,fontFamily:ds.fontB,fontWeight:700,fontSize:14,cursor:'pointer'}}>Save Changes</button><button style={{padding:'10px 20px',background:ds.surface,color:ds.text,border:`1px solid ${ds.border}`,borderRadius:10,fontFamily:ds.fontB,fontSize:14,cursor:'pointer'}}>Reset</button></div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function FinancialProviderDashboard({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const [collapsed,setCollapsed]=useState(false);
  const [section,setSection]=useState('dashboard');
  const [schemes, setSchemes] = useState(SCHEMES);
  const [apps, setApps] = useState(APPLICATIONS);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const renderSection=()=>{
    switch(section){
      case 'dashboard':    return <DashboardHome schemes={schemes} apps={apps} setSection={setSection} onAddScheme={() => setShowAddSchemeModal(true)} />;
      case 'schemes':      return <LoanSchemesSection schemes={schemes} setSchemes={setSchemes} showAddModal={showAddSchemeModal} setShowAddModal={setShowAddSchemeModal} />;
      case 'applications': return <LoanApplicationsSection apps={apps} setApps={setApps} />;
      case 'rates':        return <InterestRatesSection/>;
      case 'analytics':    return <AnalyticsSection/>;
      case 'messages':     return <FinancialMessages/>;
      case 'documents':    return <DocumentsSection/>;
      case 'notifications':return <NotificationsSection/>;
      case 'settings':     return <FinancialSettings/>;
      default: return null;
    }
  };
  return (
    <div style={{minHeight:'100vh',background:ds.bg,display:'flex',fontFamily:ds.fontB}}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={section} setActive={setSection} onNavigate={onNavigate}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <TopNav section={section}/>
        <main style={{flex:1,overflowY:'auto',padding:24}}>{renderSection()}</main>
      </div>
    </div>
  );
}
