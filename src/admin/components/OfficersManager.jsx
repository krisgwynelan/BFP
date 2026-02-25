import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Edit, Trash2, X, UploadCloud, Users, Phone, CreditCard,
  Shield, Search, Filter, ChevronDown, AlertTriangle, MoreVertical, Calendar, Crown,
} from 'lucide-react';
import { RANK_OPTIONS, RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers, saveOfficer, deleteOfficer } from '../../utils/storage';
import { toast } from 'sonner';

/* ─── Global styles ─────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes omSpin { to { transform: rotate(360deg); } }
  @keyframes omIn   { from{opacity:0;transform:translate(-50%,-54%) scale(0.96);} to{opacity:1;transform:translate(-50%,-50%) scale(1);} }
  @keyframes omFU   { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
  @keyframes omFUup { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
  .om-row-hover:hover td { background: rgba(192,57,43,0.018) !important; }
  .om-name-cell { font-size:13px; font-weight:700; color:#1a1714; line-height:1.25; letter-spacing:-0.01em; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .om-rank-sub  { font-size:10px; font-weight:500; color:#a8a29e; margin:1px 0 0; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .om-field:focus { border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.10)!important; background:#fff!important; outline:none!important; }
  .om-si:focus  { border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.09)!important; outline:none!important; }
  .om-save-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 8px 26px rgba(192,57,43,0.44)!important; }
  .om-cancel-btn:hover { background:#eee8e4!important; }
  .om-close-btn:hover  { background:#eee8e4!important; }
  .om-upload-btn:not(:disabled):hover { background:#eee8e4!important; }
  .om-modal-body::-webkit-scrollbar { width:4px; }
  .om-modal-body::-webkit-scrollbar-thumb { background:#dcc8c0; border-radius:4px; }
  .om-fdd   { animation:omFU 0.13s ease; }
  .om-fdup  { animation:omFUup 0.13s ease; }
  .om-catbtn { transition:all 0.18s; cursor:pointer; }
  .om-catbtn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.09); }
  .om-add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 26px rgba(192,57,43,0.44)!important; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#f5f0ed; }
  ::-webkit-scrollbar-thumb { background:#dcc8c0; border-radius:4px; }
  input[type="date"] { color-scheme:light; }
  .om-leader-toggle { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:11px; cursor:pointer; user-select:none; transition:background 0.15s; }
  .om-leader-toggle:hover { background:rgba(192,57,43,0.04); }
  .om-row-action-btn { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; background:transparent; border:1px solid transparent; color:#9a8a84; cursor:pointer; transition:all 0.15s; }
  .om-row-action-btn:hover { background:rgba(192,57,43,0.07); border-color:rgba(192,57,43,0.18); color:#c0392b; }

  /* ── Table base ── */
  .om-table { width:100%; border-collapse:collapse; table-layout:fixed; }
  .om-table th, .om-table td { vertical-align:middle; }
  .om-table th {
    text-align:left; white-space:nowrap; padding:10px 10px;
    font-size:8.5px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.13em; color:#b0a09a; background:#fdf9f8;
  }
  .om-table td { padding:10px 10px; }
  .om-table tr:not(:last-child) td { border-bottom:1px solid #faf5f3; }
  .om-table th.c-ctr, .om-table td.c-ctr { text-align:center; }
  .om-table th.c-right, .om-table td.c-right { text-align:right; }

  /* Compact badge */
  .om-badge {
    display:inline-flex; align-items:center; gap:3px;
    padding:2px 7px; border-radius:5px;
    font-size:9px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.05em; white-space:nowrap; line-height:1.4;
  }

  /* Role expand button */
  .om-more-btn {
    font-size:9.5px; font-weight:700; color:#c0392b;
    background:none; border:none; cursor:pointer;
    padding:2px 0 0; line-height:1; display:block; font-family:inherit;
  }
  .om-more-btn:hover { text-decoration:underline; }
`;

/* ─── Category config ───────────────────────────────────────────── */
const CATEGORY_OPTIONS = ['STATION COMMANDER','ADMIN','EMS','INSPECTOR','OPERATION'];
const LEADER_CATEGORIES = ['STATION COMMANDER'];

const CAT = {
  'STATION COMMANDER': { color:'#7c2d12', light:'rgba(124,45,18,0.08)',  border:'rgba(124,45,18,0.22)', dot:'#c2410c', label:'Station Commander', desc:'Station Cmdr', short:'CMD'  },
  'ADMIN':             { color:'#1e3a8a', light:'rgba(30,58,138,0.08)',  border:'rgba(30,58,138,0.22)', dot:'#2563eb', label:'Administration',     desc:'Admin',       short:'ADM'  },
  'EMS':               { color:'#14532d', light:'rgba(20,83,45,0.08)',   border:'rgba(20,83,45,0.22)',  dot:'#16a34a', label:'Emergency Medical',  desc:'Medical',     short:'EMS'  },
  'INSPECTOR':         { color:'#78350f', light:'rgba(120,53,15,0.08)',  border:'rgba(120,53,15,0.22)', dot:'#d97706', label:'Fire Inspector',     desc:'Inspector',   short:'INSP' },
  'OPERATION':         { color:'#7f1d1d', light:'rgba(127,29,29,0.08)', border:'rgba(127,29,29,0.22)', dot:'#c0392b', label:'Operations',         desc:'Operations',  short:'OPS'  },
};
const getCat = c => CAT[c] || { color:'#57534e', light:'rgba(87,83,78,0.07)', border:'rgba(87,83,78,0.18)', dot:'#a8a29e', label:c||'Unassigned', desc:'—', short:'—' };
const isAutoLeaderCat = (cat) => LEADER_CATEGORIES.includes(cat);

function compressImage(file, mW=400, mH=400, q=0.72) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>{ const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); let{width:w,height:h}=img; if(w>mW||h>mH){const rt=Math.min(mW/w,mH/h);w=Math.round(w*rt);h=Math.round(h*rt);} c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',q)); };img.onerror=rej;img.src=e.target.result; };r.onerror=rej;r.readAsDataURL(file); });
}

/* ─── Avatar ────────────────────────────────────────────────────── */
function Avatar({ src, name, size=34, circle=false, sx={} }) {
  const [broken, setBroken] = useState(false);
  useEffect(()=>{ setBroken(false); }, [src]);
  const initials = (name||'?').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const r = circle ? '50%' : 8;
  if (!src || broken)
    return <div style={{ width:size, height:size, borderRadius:r, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:size>60?24:11, background:'linear-gradient(135deg,rgba(192,57,43,0.1),rgba(230,126,34,0.1))', border:'1.5px solid rgba(192,57,43,0.14)', color:'#c0392b', letterSpacing:0, ...sx }}>{initials}</div>;
  return <img src={src} alt={name} onError={()=>setBroken(true)} style={{ width:size, height:size, borderRadius:r, objectFit:'cover', flexShrink:0, ...sx }} />;
}

function fmtDate(s) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}); }
  catch { return s; }
}

/* ─── Leader Toggle ─────────────────────────────────────────────── */
function LeaderToggle({ value, onChange, disabled }) {
  return (
    <label className={disabled ? '' : 'om-leader-toggle'}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:11, cursor:disabled?'default':'pointer', userSelect:'none', border:`1.5px solid ${value?'rgba(192,57,43,0.28)':'#e8ddd8'}`, background:disabled?'#faf8f7':value?'rgba(192,57,43,0.04)':'white', opacity:disabled?0.75:1 }}>
      <div onClick={disabled?undefined:onChange}
        style={{ width:42, height:24, borderRadius:12, position:'relative', flexShrink:0, background:value?'linear-gradient(135deg,#c0392b,#e67e22)':'#e8ddd8', transition:'background 0.2s', cursor:disabled?'default':'pointer', boxShadow:value?'0 2px 8px rgba(192,57,43,0.3)':'none' }}>
        <div style={{ position:'absolute', top:3, left:value?21:3, width:18, height:18, borderRadius:'50%', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.2s' }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:11, color:'#a8a29e', margin:'3px 0 0', fontWeight:500, lineHeight:1.4 }}>
          {disabled?'This category is automatically assigned as the leader':value?'Shown prominently at the top of the org chart section':'Toggle on to designate as the category leader'}
        </p>
      </div>
    </label>
  );
}

/* ─── Portal Row Actions dropdown ── */
function RowActions({ officer, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top:0, left:0, above:false });
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menuH = 90, spaceBelow = window.innerHeight - r.bottom, above = spaceBelow < menuH + 12;
    setPos({ top:above?r.top+window.scrollY-menuH-6:r.bottom+window.scrollY+6, left:r.right+window.scrollX-148, above });
  }, []);

  const handleOpen = useCallback((e) => { e.stopPropagation(); calcPos(); setOpen(p=>!p); }, [calcPos]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (menuRef.current&&!menuRef.current.contains(e.target)&&triggerRef.current&&!triggerRef.current.contains(e.target)) setOpen(false); };
    const cls = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('scroll', cls, true);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('scroll', cls, true); };
  }, [open]);

  const bRow = { width:'100%', textAlign:'left', padding:'9px 15px', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' };

  return (
    <>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button ref={triggerRef} onClick={handleOpen} className="om-row-action-btn"
          style={{ background:open?'rgba(192,57,43,0.07)':'transparent', borderColor:open?'rgba(192,57,43,0.2)':'transparent', color:open?'#c0392b':'#9a8a84' }}>
          <MoreVertical size={13} />
        </button>
      </div>
      {open && createPortal(
        <div ref={menuRef} className={pos.above?'om-fdup':'om-fdd'}
          style={{ position:'absolute', top:pos.top, left:pos.left, zIndex:2147483647, background:'white', border:'1px solid #f0e8e5', borderRadius:12, overflow:'hidden', boxShadow:'0 16px 40px rgba(0,0,0,0.16),0 4px 12px rgba(0,0,0,0.08)', minWidth:148, padding:'4px 0' }}>
          <button style={{...bRow,color:'#2563eb'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(37,99,235,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'} onClick={()=>{setOpen(false);onEdit(officer);}}><Edit size={13}/>Edit Record</button>
          <button style={{...bRow,color:'#c0392b'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(192,57,43,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'} onClick={()=>{setOpen(false);onDelete(officer);}}><Trash2 size={13}/>Delete</button>
        </div>, document.body
      )}
    </>
  );
}

function ModalPortal({ children }) { return createPortal(children, document.body); }

/* ─── Delete Modal ──────────────────────────────────────────────── */
function DeleteModal({ officer, onConfirm, onCancel, deleting }) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; },[]);
  return (
    <ModalPortal>
      <div onClick={()=>{ if(!deleting) onCancel(); }} style={{ position:'fixed', inset:0, zIndex:999990, background:'rgba(10,6,4,0.65)', backdropFilter:'blur(10px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:999991, width:'min(420px,calc(100vw - 32px))', borderRadius:22, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.5)', background:'white', animation:'omIn 0.22s cubic-bezier(0.34,1.5,0.64,1)', fontFamily:'inherit' }}>
        <div style={{ height:4, background:'linear-gradient(90deg,#c0392b,#e74c3c,#e67e22)' }} />
        <div style={{ padding:'28px 28px 24px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
            <div style={{ width:60, height:60, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(192,57,43,0.07)', border:'1.5px solid rgba(192,57,43,0.15)' }}><AlertTriangle size={26} style={{ color:'#c0392b' }} /></div>
          </div>
          <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.7rem', letterSpacing:'0.06em', color:'#1a1714', textAlign:'center', margin:'0 0 6px' }}>Delete Officer?</h3>
          <p style={{ textAlign:'center', fontSize:13, color:'#78716c', margin:'0 0 16px', lineHeight:1.65 }}>This action cannot be undone. The officer will be permanently removed.</p>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, background:'#fdf8f6', border:'1.5px solid #f0e8e5', marginBottom:20 }}>
            <Avatar src={officer.profileImage} name={officer.fullName} size={42} circle sx={{ border:'2px solid #ede8e5', flexShrink:0 }} />
            <div style={{ minWidth:0 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#1a1714', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{officer.fullName}</p>
              <p style={{ fontSize:11.5, color:'#a8a29e', margin:'3px 0 0', fontWeight:500 }}>{officer.rank}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onCancel} disabled={deleting} style={{ flex:1, fontWeight:700, padding:'12px 0', borderRadius:11, fontSize:13, background:'#f5f0ed', border:'1px solid #e8ddd8', color:'#57534e', cursor:deleting?'not-allowed':'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting} style={{ flex:1, fontWeight:700, padding:'12px 0', borderRadius:11, fontSize:13, color:'white', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:7, background:deleting?'#e8c4bc':'linear-gradient(135deg,#c0392b,#e74c3c)', boxShadow:deleting?'none':'0 4px 18px rgba(192,57,43,0.35)', cursor:deleting?'not-allowed':'pointer', fontFamily:'inherit' }}>
              {deleting?<><div style={{ width:13,height:13,borderRadius:'50%',border:'2px solid white',borderTopColor:'transparent',animation:'omSpin 0.8s linear infinite' }}/>Deleting…</>:<><Trash2 size={13}/>Yes, Delete</>}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── Form Modal ────────────────────────────────────────────────── */
function FormModal({ editingOfficer, form, setForm, fileRef, uploading, saving, onSubmit, onClose }) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; },[]);
  const autoLeader = isAutoLeaderCat(form.category);
  const field = { width:'100%', background:'#fafaf9', border:'1.5px solid #e8ddd8', borderRadius:10, padding:'10px 13px', fontSize:13, color:'#1a1714', outline:'none', transition:'all 0.18s', fontFamily:'inherit', lineHeight:1.5 };
  const lbl = { display:'block', fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'#9ca3af', marginBottom:6 };
  const section = { padding:'16px 18px', borderRadius:14, background:'white', border:'1px solid #f0e8e5', boxShadow:'0 1px 4px rgba(0,0,0,0.03)', display:'flex', flexDirection:'column', gap:13 };
  const sectionTitle = { fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#c0392b', margin:0 };
  return (
    <ModalPortal>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999990, background:'rgba(10,6,4,0.72)', backdropFilter:'blur(12px)' }} />
      <div onClick={e=>e.stopPropagation()} style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:999991, width:'min(660px,calc(100vw - 32px))', height:'min(840px,calc(100dvh - 40px))', borderRadius:22, boxShadow:'0 40px 100px rgba(0,0,0,0.55)', background:'white', animation:'omIn 0.22s cubic-bezier(0.34,1.4,0.64,1)', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'inherit' }}>
        <div style={{ height:4, background:'linear-gradient(90deg,#c0392b 0%,#e67e22 55%,#f39c12 100%)', flexShrink:0 }} />
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px 16px', borderBottom:'1px solid #f5ede9' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow:'0 4px 14px rgba(192,57,43,0.28)', flexShrink:0 }}><Users size={16} color="white" /></div>
            <div>
              <p style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', color:'#c0392b', margin:'0 0 2px', lineHeight:1 }}>{editingOfficer?'Edit Record':'New Officer'}</p>
              <h3 style={{ fontWeight:700, fontSize:15, color:'#1a1714', margin:0, lineHeight:1.2 }}>{editingOfficer?'Update Officer Record':'Add New Officer'}</h3>
            </div>
          </div>
          <button className="om-close-btn" onClick={onClose} style={{ width:32, height:32, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f0ed', border:'1px solid #ede8e5', color:'#78716c', cursor:'pointer', transition:'all 0.15s', flexShrink:0 }}><X size={13} /></button>
        </div>
        <div className="om-modal-body" style={{ flex:'1 1 0', minHeight:0, overflowY:'auto', padding:'18px 24px', background:'#fdfaf9' }}>
          <form id="om-form" onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{...section}}>
              <p style={sectionTitle}>Profile Photo</p>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                {form.profileImage?<Avatar src={form.profileImage} name={form.fullName||'Preview'} size={64} circle sx={{ border:'3px solid #f0e8e5', flexShrink:0 }} />:<div style={{ width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f0ed', border:'2px dashed #d8ccc8', flexShrink:0 }}><Users size={22} style={{ color:'#d4b8b3' }} /></div>}
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  <button type="button" className="om-upload-btn" onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:700, padding:'8px 15px', borderRadius:9, background:uploading?'#fdf3f0':'#f5f0ed', border:`1px solid ${uploading?'rgba(192,57,43,0.25)':'#e8ddd8'}`, color:uploading?'#c0392b':'#57534e', cursor:uploading?'not-allowed':'pointer', fontFamily:'inherit' }}>
                    {uploading?<><div style={{ width:11,height:11,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',animation:'omSpin 0.8s linear infinite' }}/>Processing…</>:<><UploadCloud size={12}/>{form.profileImage?'Change Photo':'Upload Photo'}</>}
                  </button>
                  <p style={{ fontSize:10.5, color:'#b5a8a3', margin:0, fontWeight:500, lineHeight:1.5 }}>Any size — auto-compressed</p>
                </div>
              </div>
            </div>
            <div style={{...section}}>
              <p style={sectionTitle}>Personal Information</p>
              <div><label style={lbl}>Full Name</label><input type="text" className="om-field" value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} style={field} placeholder="e.g. Juan Dela Cruz" required /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lbl}>Rank</label><select className="om-field" value={form.rank} onChange={e=>setForm(p=>({...p,rank:e.target.value}))} style={field} required>{RANK_OPTIONS.map(r=><option key={r} value={r}>{r} ({RANK_ABBREVIATIONS[r]})</option>)}</select></div>
                <div><label style={lbl}>Birthdate</label><div style={{ position:'relative' }}><Calendar size={12} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} /><input type="date" className="om-field" value={form.birthdate} onChange={e=>setForm(p=>({...p,birthdate:e.target.value}))} style={{...field,paddingLeft:34}} /></div></div>
              </div>
              <div><label style={lbl}>Category</label><select className="om-field" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value,isLeader:isAutoLeaderCat(e.target.value)?true:p.isLeader}))} style={field}><option value="">— Select category —</option>{CATEGORY_OPTIONS.map(cat=>{const c=getCat(cat);return<option key={cat} value={cat}>{c.label} ({c.short})</option>;})}</select></div>
            </div>
            <div style={{...section}}>
              <p style={sectionTitle}>Assignment & Contact</p>
              <div>
                <label style={lbl}>Role / Assignment</label>
                <textarea className="om-field" value={form.roleAssignment} onChange={e=>setForm(p=>({...p,roleAssignment:e.target.value}))} style={{...field,resize:'vertical',minHeight:64,lineHeight:1.6}} placeholder="e.g. Station Commander, Shift A Nozzleman" required rows={2} />
                <p style={{ fontSize:10.5, color:'#b5a8a3', margin:'4px 0 0', fontWeight:500, lineHeight:1.4 }}>Separate multiple roles with commas.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lbl}>Contact Number</label><div style={{ position:'relative' }}><Phone size={12} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} /><input type="tel" className="om-field" value={form.contactNumber} onChange={e=>setForm(p=>({...p,contactNumber:e.target.value}))} style={{...field,paddingLeft:34}} placeholder="+63 912 345 6789" required /></div></div>
                <div><label style={lbl}>Account Number</label><div style={{ position:'relative' }}><CreditCard size={12} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} /><input type="text" className="om-field" value={form.accountNumber} onChange={e=>setForm(p=>({...p,accountNumber:e.target.value}))} style={{...field,paddingLeft:34,fontFamily:'monospace'}} placeholder="BFP-CDO-001" required /></div></div>
              </div>
            </div>
            <div style={{...section}}>
              <p style={{...sectionTitle,marginBottom:0}}>Leadership Role</p>
              {autoLeader?(
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:11, background:'rgba(192,57,43,0.04)', border:'1.5px solid rgba(192,57,43,0.2)' }}>
                  <div><p style={{ fontSize:13, fontWeight:700, color:'#c0392b', margin:0, lineHeight:1.4 }}>Station Commander — Always Category Leader</p><p style={{ fontSize:11, color:'#a8a29e', margin:'3px 0 0', fontWeight:500, lineHeight:1.4 }}>Officers in this category are automatically set as the category leader in the org chart.</p></div>
                </div>
              ):(
                <LeaderToggle value={!!form.isLeader} onChange={()=>setForm(p=>({...p,isLeader:!p.isLeader}))} />
              )}
              {form.isLeader&&!autoLeader&&!form.category&&<p style={{ fontSize:11, color:'#d97706', margin:'4px 0 0', fontWeight:600, display:'flex', alignItems:'center', gap:5, lineHeight:1.5 }}>⚠ Assign a category so the leader is placed correctly.</p>}
            </div>
          </form>
        </div>
        <div style={{ flexShrink:0, padding:'14px 24px 18px', borderTop:'1px solid #f0e8e5', background:'white', display:'flex', gap:10 }}>
          <button type="submit" form="om-form" disabled={saving||uploading} className="om-save-btn"
            style={{ flex:1, fontWeight:700, padding:'13px 0', borderRadius:12, fontSize:13.5, color:'white', border:'none', cursor:saving||uploading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:saving||uploading?'linear-gradient(135deg,#dba8a1,#e8b8a8)':'linear-gradient(135deg,#c0392b 0%,#e67e22 100%)', boxShadow:saving||uploading?'none':'0 4px 18px rgba(192,57,43,0.3)', transition:'all 0.18s', fontFamily:'inherit' }}>
            {saving&&<div style={{ width:13,height:13,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.5)',borderTopColor:'white',animation:'omSpin 0.8s linear infinite' }} />}
            {uploading?'Processing image…':saving?'Saving…':editingOfficer?'Update Officer':'Add Officer'}
          </button>
          <button type="button" onClick={onClose} className="om-cancel-btn"
            style={{ flex:1, fontWeight:700, padding:'13px 0', borderRadius:12, fontSize:13.5, background:'#f5f0ed', border:'1px solid #e8ddd8', color:'#57534e', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>Cancel</button>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── MAIN EXPORT ───────────────────────────────────────────────── */
export function OfficersManager() {
  const [officers,  setOfficers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen,setIsFormOpen]= useState(false);
  const [editingOfficer, setEditing]     = useState(null);
  const [deleteTarget,   setDeleteTarget]= useState(null);
  const [deleting,       setDeleting]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [selRank,   setSelRank]   = useState('All Ranks');
  const [selCat,    setSelCat]    = useState('All');
  const [rankOpen,  setRankOpen]  = useState(false);
  const [expandedRole, setExpanded] = useState(null);

  const [form, setForm] = useState({
    profileImage:'', fullName:'', rank:'Fire Officer I', category:'',
    roleAssignment:'', contactNumber:'', accountNumber:'', birthdate:'', isLeader:false,
  });
  const fileRef = useRef(null);

  const RANKS = [
    'Chief Fire Officer','Chief Fire Inspector','Senior Fire Inspector','Fire Inspector',
    'Senior Fire Officer III','Senior Fire Officer II','Senior Fire Officer I',
    'Fire Officer III','Fire Officer II','Fire Officer I',
  ];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setOfficers(await getOfficers()); }
    catch { toast.error('Failed to load officers'); }
    finally { setLoading(false); }
  }

  async function handleFile(e) {
    const f = e.target.files[0]; if (!f) return; e.target.value='';
    if (!f.type.startsWith('image/')) { toast.error('Please select a valid image.'); return; }
    setUploading(true);
    try {
      setForm(p=>({...p,profileImage:URL.createObjectURL(f)}));
      const b64 = await compressImage(f);
      setForm(p=>({...p,profileImage:b64}));
      toast.success('Image ready!');
    } catch { toast.error('Failed to process image.'); setForm(p=>({...p,profileImage:''})); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (uploading) { toast.error('Wait for image to finish.'); return; }
    if (!form.profileImage) { toast.error('Please upload a profile image!'); return; }
    const finalForm = { ...form, isLeader: isAutoLeaderCat(form.category)?true:form.isLeader };
    if (finalForm.isLeader && finalForm.category) {
      const conflicting = officers.find(o=>o.isLeader&&o.category===finalForm.category&&(!editingOfficer||o.id!==editingOfficer.id));
      if (conflicting) {
        toast.warning(`${conflicting.fullName} was replaced as ${getCat(finalForm.category).label} leader.`);
        const updatedOld = {...conflicting,isLeader:false};
        await saveOfficer(conflicting.id, updatedOld);
        setOfficers(p=>p.map(o=>o.id===conflicting.id?updatedOld:o));
      }
    }
    setSaving(true);
    try {
      if (editingOfficer) {
        await saveOfficer(editingOfficer.id, finalForm);
        setOfficers(p=>p.map(o=>o.id===editingOfficer.id?{...finalForm,id:editingOfficer.id}:o));
        toast.success('Officer updated!');
      } else {
        const id = Date.now().toString();
        await saveOfficer(id, finalForm);
        setOfficers(p=>[...p,{...finalForm,id}]);
        toast.success('Officer added!');
      }
      reset();
    } catch { toast.error('Failed to save officer'); }
    finally { setSaving(false); }
  }

  function openEdit(o) {
    setEditing(o);
    setForm({ profileImage:o.profileImage||'', fullName:o.fullName||'', rank:o.rank||'Fire Officer I', category:o.category||'', roleAssignment:o.roleAssignment||'', contactNumber:o.contactNumber||'', accountNumber:o.accountNumber||'', birthdate:o.birthdate||'', isLeader:!!o.isLeader });
    setIsFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOfficer(deleteTarget.id);
      setOfficers(p=>p.filter(o=>o.id!==deleteTarget.id));
      toast.success('Officer deleted!');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete officer'); }
    finally { setDeleting(false); }
  }

  function reset() {
    setForm({ profileImage:'', fullName:'', rank:'Fire Officer I', category:'', roleAssignment:'', contactNumber:'', accountNumber:'', birthdate:'', isLeader:false });
    setEditing(null); setIsFormOpen(false); setUploading(false);
  }

  const sorted   = [...officers].sort((a,b)=>{ const ia=RANKS.indexOf(a.rank),ib=RANKS.indexOf(b.rank); if(ia===-1)return 1; if(ib===-1)return -1; return ia-ib; });
  const filtered = sorted.filter(o=>{
    const q=search.toLowerCase();
    const ms=!q||[o.fullName,o.rank,o.roleAssignment,o.contactNumber,o.accountNumber,o.category].some(v=>v?.toLowerCase().includes(q));
    return ms&&(selRank==='All Ranks'||o.rank===selRank)&&(selCat==='All'||o.category===selCat);
  });
  const uRanks = ['All Ranks', ...RANKS.filter(r=>officers.some(o=>o.rank===r))];

  return (
    <div style={{ padding:'22px 18px', fontFamily:"'DM Sans', sans-serif", minHeight:'100vh', background:'#f5f3f0' }}>
      <style>{STYLES}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:14, marginBottom:18 }}>
        <div>
          <p style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.22em', color:'#c0392b', margin:'0 0 3px', display:'flex', alignItems:'center', gap:8, lineHeight:1 }}>
            <span style={{ display:'inline-block', width:16, height:2, background:'#c0392b', borderRadius:2 }} />
            Personnel Management
          </p>
          <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#1a1714', lineHeight:1, margin:'2px 0 0' }}>Officers Management</h2>
          <p style={{ fontSize:12, color:'#9a8a84', margin:'4px 0 0', lineHeight:1 }}>{officers.length} officer{officers.length!==1?'s':''} on record</p>
        </div>
        <button onClick={()=>setIsFormOpen(true)} className="om-add-btn"
          style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:700, padding:'9px 18px', borderRadius:11, color:'white', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow:'0 4px 16px rgba(192,57,43,0.3)', transition:'all 0.18s', fontFamily:'inherit', flexShrink:0 }}>
          <Plus size={14} /> Add Officer
        </button>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        <button onClick={()=>setSelCat('All')} className="om-catbtn"
          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:999, border:'none', background:selCat==='All'?'#1a1714':'white', boxShadow:selCat==='All'?'0 3px 12px rgba(28,25,23,0.22)':'0 1px 4px rgba(0,0,0,0.06)', outline:selCat==='All'?'none':'1px solid #e8e0dc', fontFamily:'inherit' }}>
          <Users size={10} style={{ color:selCat==='All'?'white':'#78716c' }} />
          <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:selCat==='All'?'white':'#57534e' }}>All</span>
          <span style={{ fontSize:9, fontWeight:800, minWidth:16, height:14, padding:'0 4px', borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', background:selCat==='All'?'rgba(255,255,255,0.18)':'rgba(28,25,23,0.07)', color:selCat==='All'?'white':'#78716c' }}>{officers.length}</span>
        </button>
        {CATEGORY_OPTIONS.map(cat=>{
          const c=getCat(cat), cnt=officers.filter(o=>o.category===cat).length, on=selCat===cat;
          return (
            <button key={cat} onClick={()=>setSelCat(on?'All':cat)} className="om-catbtn"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:999, border:'none', background:on?c.dot:'white', boxShadow:on?'0 3px 14px rgba(0,0,0,0.18)':'0 1px 4px rgba(0,0,0,0.06)', outline:on?'none':`1px solid ${c.border}`, fontFamily:'inherit' }}>
              <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:on?'white':c.color }}>{c.short}</span>
              <span style={{ fontSize:9, fontWeight:800, minWidth:16, height:14, padding:'0 4px', borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', background:on?'rgba(255,255,255,0.22)':c.light, color:on?'white':c.dot }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH + RANK FILTER ── */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
        <div style={{ position:'relative', flex:1, minWidth:160 }}>
          <Search size={12} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#c0392b', pointerEvents:'none' }} />
          <input type="text" className="om-si" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, rank, role, contact…"
            style={{ width:'100%', background:'white', border:'1px solid #ece6e0', borderRadius:9, padding:'8px 12px 8px 32px', fontSize:12, color:'#1a1714', outline:'none', fontFamily:'inherit' }} />
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setRankOpen(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 13px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', minWidth:140, justifyContent:'space-between', background:selRank!=='All Ranks'?'rgba(192,57,43,0.07)':'white', border:`1px solid ${selRank!=='All Ranks'?'rgba(192,57,43,0.25)':'#ece6e0'}`, color:selRank!=='All Ranks'?'#c0392b':'#78716c', fontFamily:'inherit' }}>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}><Filter size={10} />{selRank!=='All Ranks'?(RANK_ABBREVIATIONS[selRank]||selRank):'All Ranks'}</span>
            <ChevronDown size={10} style={{ transform:rankOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }} />
          </button>
          {rankOpen && (
            <div className="om-fdd" style={{ position:'absolute', right:0, top:'calc(100% + 5px)', borderRadius:10, overflow:'hidden', zIndex:30, background:'white', border:'1px solid #ece6e0', boxShadow:'0 12px 30px rgba(0,0,0,0.1)', minWidth:200, padding:'4px 0' }}>
              {uRanks.map(rk=>(
                <button key={rk} onClick={()=>{ setSelRank(rk); setRankOpen(false); }}
                  style={{ width:'100%', textAlign:'left', padding:'7px 13px', fontSize:12, fontWeight:selRank===rk?700:400, color:selRank===rk?'#c0392b':'#44403c', background:selRank===rk?'rgba(192,57,43,0.06)':'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
                  onMouseEnter={e=>{ if(selRank!==rk) e.currentTarget.style.background='rgba(192,57,43,0.03)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=selRank===rk?'rgba(192,57,43,0.06)':'none'; }}>
                  {rk}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(search||selRank!=='All Ranks'||selCat!=='All')&&!loading&&(
        <p style={{ marginBottom:8, fontSize:11, fontWeight:600, color:'#a8a29e', lineHeight:1 }}>
          Showing <span style={{ color:'#c0392b' }}>{filtered.length}</span> of {officers.length} officers
        </p>
      )}

      {/* ── TABLE ── no overflowX, fixed layout, % widths sum to 100% ── */}
      <div style={{ borderRadius:14, overflow:'hidden', background:'white', border:'1px solid #ece6e0', boxShadow:'0 2px 14px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 0' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',border:'2.5px solid rgba(192,57,43,0.2)',borderTopColor:'#c0392b',animation:'omSpin 0.8s linear infinite',marginBottom:10 }} />
            <p style={{ fontSize:12, fontWeight:600, color:'#a8a29e', margin:0 }}>Loading officers…</p>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 0', textAlign:'center' }}>
            <div style={{ width:52,height:52,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:11,background:'rgba(192,57,43,0.06)',border:'1.5px dashed rgba(192,57,43,0.18)' }}>
              {officers.length===0?<Users size={20} style={{ color:'#d4b8b3' }} />:<Search size={20} style={{ color:'#d4b8b3' }} />}
            </div>
            <p style={{ fontWeight:700, fontSize:13, color:'#a8a29e', margin:0 }}>{officers.length===0?'No officers registered':'No officers match your search'}</p>
            <p style={{ fontSize:11, color:'#c4b5b0', margin:'4px 0 0' }}>{officers.length===0?'Click "Add Officer" to get started':'Try adjusting your filters'}</p>
          </div>
        ) : (
          <table className="om-table">
            {/*
              Column widths — fixed layout, must fit 100% with no overflow.
              Officer 22% | Rank 10% | Cat 7% | Leader 7% | Role 20% | Contact 13% | Account 11% | Birthdate 7% | Actions 3%
              Total = 100%
            */}
            <colgroup>
              <col style={{ width:'22%' }} />
              <col style={{ width:'10%' }} />
              <col style={{ width:'7%'  }} />
              <col style={{ width:'7%'  }} />
              <col style={{ width:'20%' }} />
              <col style={{ width:'13%' }} />
              <col style={{ width:'11%' }} />
              <col style={{ width:'7%'  }} />
              <col style={{ width:'3%'  }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom:'1.5px solid #f5ede9' }}>
                <th style={{ textAlign:'left' }}>Officer</th>
                <th className="c-ctr">Rank</th>
                <th className="c-ctr">Category</th>
                <th className="c-ctr">Leader</th>
                <th style={{ textAlign:'left' }}>Role / Assignment</th>
                <th style={{ textAlign:'left' }}>Contact</th>
                <th style={{ textAlign:'left' }}>Account No.</th>
                <th style={{ textAlign:'left' }}>Birthdate</th>
                <th className="c-right"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, idx) => {
                const exp      = expandedRole === o.id;
                const roles    = o.roleAssignment ? o.roleAssignment.split(',').map(r=>r.trim()).filter(Boolean) : [];
                const hasMore  = roles.length > 1;
                const cc       = o.category ? getCat(o.category) : null;
                const rankAbbr = RANK_ABBREVIATIONS[o.rank] || o.rank;
                const isLdr    = !!o.isLeader;

                return (
                  <tr key={o.id} className="om-row-hover"
                    style={{ background: isLdr?'rgba(192,57,43,0.012)':'transparent' }}>

                    {/* ── Officer ── */}
                    <td style={{ verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, minWidth:0 }}>
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <Avatar src={o.profileImage} name={o.fullName} size={34} sx={{ border:'1.5px solid #f0e8e5' }} />
                          {cc && <span style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8, borderRadius:'50%', background:cc.dot, border:'2px solid white' }} />}
                        </div>
                        <div style={{ minWidth:0, flex:1, overflow:'hidden' }}>
                          <p className="om-name-cell" title={o.fullName}>{o.fullName}</p>
                          <p className="om-rank-sub"  title={o.rank}>{rankAbbr}</p>
                        </div>
                      </div>
                    </td>

                    {/* ── Rank ── */}
                    <td className="c-ctr" style={{ verticalAlign:'middle' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <span className="om-badge" style={{ background:'rgba(192,57,43,0.07)', border:'1px solid rgba(192,57,43,0.14)', color:'#c0392b' }}>
                          <Shield size={7} />{rankAbbr}
                        </span>
                        <span title={o.rank} style={{ fontSize:9, color:'#c4b5b0', lineHeight:1.2, width:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block', textAlign:'center', padding:'0 2px' }}>{o.rank}</span>
                      </div>
                    </td>

                    {/* ── Category ── */}
                    <td className="c-ctr" style={{ verticalAlign:'middle' }}>
                      {o.category && cc ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          <span className="om-badge" style={{ background:cc.light, border:`1px solid ${cc.border}`, color:cc.color }}>{cc.short}</span>
                          <span style={{ fontSize:9, color:'#c4b5b0', lineHeight:1.2, whiteSpace:'nowrap', textAlign:'center' }}>{cc.desc}</span>
                        </div>
                      ) : <span style={{ fontSize:11, color:'#d6ccc8' }}>—</span>}
                    </td>

                    {/* ── Leader ── */}
                    <td className="c-ctr" style={{ verticalAlign:'middle' }}>
                      {isLdr ? (
                        <span className="om-badge" style={{ background:'linear-gradient(135deg,rgba(192,57,43,0.09),rgba(230,126,34,0.09))', border:'1px solid rgba(192,57,43,0.2)', color:'#c0392b' }}>
                         Ldr
                        </span>
                      ) : (
                        <span style={{ fontSize:11, color:'#d6ccc8' }}>—</span>
                      )}
                    </td>

                    {/* ── Role / Assignment ── */}
                    <td style={{ verticalAlign: exp?'top':'middle', paddingTop: exp?12:10 }}>
                      {exp ? (
                        <>
                          <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:3 }}>
                            {roles.map((r,i) => (
                              <span key={i} style={{ fontSize:11.5, fontWeight:500, color:'#44403c', lineHeight:1.45, display:'block', wordBreak:'break-word' }}>
                                {r}
                              </span>
                            ))}
                          </div>
                          <button className="om-more-btn" onClick={()=>setExpanded(null)}>Show less</button>
                        </>
                      ) : (
                        <>
                          <span title={o.roleAssignment} style={{ fontSize:11.5, fontWeight:500, color:'#44403c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block', lineHeight:1.4 }}>
                            {roles[0] || '—'}
                          </span>
                          {hasMore && (
                            <button className="om-more-btn" onClick={()=>setExpanded(o.id)}>
                              +{roles.length-1} more
                            </button>
                          )}
                        </>
                      )}
                    </td>

                    {/* ── Contact ── */}
                    <td style={{ verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, minWidth:0, overflow:'hidden' }}>
                        <Phone size={9} style={{ color:'#c4b5b0', flexShrink:0 }} />
                        <span title={o.contactNumber} style={{ fontSize:11.5, color:'#57534e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.4 }}>
                          {o.contactNumber||'—'}
                        </span>
                      </div>
                    </td>

                    {/* ── Account ── */}
                    <td style={{ verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, minWidth:0, overflow:'hidden' }}>
                        <CreditCard size={9} style={{ color:'#d1c4be', flexShrink:0 }} />
                        <span title={o.accountNumber} style={{ fontSize:11, color:'#78716c', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.4 }}>
                          {o.accountNumber||'—'}
                        </span>
                      </div>
                    </td>

                    {/* ── Birthdate ── */}
                    <td style={{ verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, minWidth:0 }}>
                        <Calendar size={9} style={{ color:'#d1c4be', flexShrink:0 }} />
                        <span title={fmtDate(o.birthdate)} style={{ fontSize:11, color:'#78716c', whiteSpace:'nowrap', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis' }}>
                          {fmtDate(o.birthdate)}
                        </span>
                      </div>
                    </td>

                    {/* ── Actions ── */}
                    <td style={{ verticalAlign:'middle', textAlign:'right' }}>
                      <RowActions officer={o} onEdit={openEdit} onDelete={o=>setDeleteTarget(o)} />
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p style={{ textAlign:'right', fontSize:10, color:'#c4b5b0', margin:'6px 0 0', fontWeight:500, lineHeight:1 }}>
          {filtered.length} officer{filtered.length!==1?'s':''} shown
        </p>
      )}

      {/* ── MODALS ── */}
      {deleteTarget && (
        <DeleteModal officer={deleteTarget} onConfirm={confirmDelete} onCancel={()=>{ if(!deleting) setDeleteTarget(null); }} deleting={deleting} />
      )}
      {isFormOpen && (
        <FormModal editingOfficer={editingOfficer} form={form} setForm={setForm} fileRef={fileRef} uploading={uploading} saving={saving} onSubmit={handleSubmit} onClose={reset} />
      )}

      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleFile} />
      {rankOpen && <div style={{ position:'fixed', inset:0, zIndex:25 }} onClick={()=>setRankOpen(false)} />}
    </div>
  );
}