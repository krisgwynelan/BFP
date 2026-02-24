import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Edit, Trash2, X, UploadCloud, Users, Phone, CreditCard,
  Shield, Search, Filter, ChevronDown, AlertTriangle, MoreVertical, Calendar,
} from 'lucide-react';
import { RANK_OPTIONS, RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers, saveOfficer, deleteOfficer } from '../../utils/storage';
import { toast } from 'sonner';

/* ─── Global styles ────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes omSpin { to { transform: rotate(360deg); } }
  @keyframes omIn   { from{opacity:0;transform:translate(-50%,-54%) scale(0.96);} to{opacity:1;transform:translate(-50%,-50%) scale(1);} }
  @keyframes omFU   { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
  .om-row-hover:hover td { background: rgba(192,57,43,0.018) !important; }
  .om-name-cell { font-size:14px; font-weight:700; color:#1a1714; line-height:1.25; letter-spacing:-0.01em; }
  .om-rank-sub  { font-size:11px; font-weight:500; color:#a8a29e; margin-top:2px; }
  .om-field:focus { border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.10)!important; background:#fff!important; outline:none!important; }
  .om-si:focus  { border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.09)!important; outline:none!important; }
  .om-save-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 8px 26px rgba(192,57,43,0.44)!important; }
  .om-cancel-btn:hover { background:#eee8e4!important; }
  .om-close-btn:hover  { background:#eee8e4!important; }
  .om-upload-btn:not(:disabled):hover { background:#eee8e4!important; }
  .om-modal-body::-webkit-scrollbar { width:4px; }
  .om-modal-body::-webkit-scrollbar-thumb { background:#dcc8c0; border-radius:4px; }
  .om-fdd  { animation:omFU 0.13s ease; }
  .om-catbtn { transition:all 0.18s; cursor:pointer; }
  .om-catbtn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.09); }
  .om-add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 26px rgba(192,57,43,0.44)!important; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#f5f0ed; }
  ::-webkit-scrollbar-thumb { background:#dcc8c0; border-radius:4px; }
  input[type="date"] { color-scheme:light; }
`;

/* ─── Category config ──────────────────────────────────────────── */
const CATEGORY_OPTIONS = ['STATION COMMANDER','ADMIN','EMS','INSPECTOR','OPERATION'];
const CAT = {
  'STATION COMMANDER': { color:'#7c2d12', light:'rgba(124,45,18,0.08)',  border:'rgba(124,45,18,0.22)', dot:'#c2410c', label:'Station Commander', desc:'Station Commander',    short:'CMD'  },
  'ADMIN':             { color:'#1e3a8a', light:'rgba(30,58,138,0.08)',  border:'rgba(30,58,138,0.22)', dot:'#2563eb', label:'Administration',     desc:'Admin',     short:'ADM'  },
  'EMS':               { color:'#14532d', light:'rgba(20,83,45,0.08)',   border:'rgba(20,83,45,0.22)',  dot:'#16a34a', label:'Emergency Medical',  desc:'Medical',   short:'EMS'  },
  'INSPECTOR':         { color:'#78350f', light:'rgba(120,53,15,0.08)',  border:'rgba(120,53,15,0.22)', dot:'#d97706', label:'Fire Inspector',     desc:'Inspector', short:'INSP' },
  'OPERATION':         { color:'#7f1d1d', light:'rgba(127,29,29,0.08)', border:'rgba(127,29,29,0.22)', dot:'#c0392b', label:'Operations',         desc:'Operations',       short:'OPS'  },
};
const getCat = c => CAT[c] || { color:'#57534e', light:'rgba(87,83,78,0.07)', border:'rgba(87,83,78,0.18)', dot:'#a8a29e', label:c||'Unassigned', desc:'—', short:'—' };

function compressImage(file, mW=400, mH=400, q=0.72) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>{ const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); let{width:w,height:h}=img; if(w>mW||h>mH){const rt=Math.min(mW/w,mH/h);w=Math.round(w*rt);h=Math.round(h*rt);} c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',q)); };img.onerror=rej;img.src=e.target.result; };r.onerror=rej;r.readAsDataURL(file); });
}

/* ─── Avatar ───────────────────────────────────────────────────── */
function Avatar({ src, name, size=44, circle=false, sx={} }) {
  const [broken, setBroken] = useState(false);
  useEffect(()=>{ setBroken(false); }, [src]);
  const initials = (name||'?').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const r = circle ? '50%' : 10;
  if (!src || broken)
    return <div style={{ width:size, height:size, borderRadius:r, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:size>60?26:14, background:'linear-gradient(135deg,rgba(192,57,43,0.1),rgba(230,126,34,0.1))', border:'1.5px solid rgba(192,57,43,0.14)', color:'#c0392b', letterSpacing:0, ...sx }}>{initials}</div>;
  return <img src={src} alt={name} onError={()=>setBroken(true)} style={{ width:size, height:size, borderRadius:r, objectFit:'cover', flexShrink:0, ...sx }} />;
}

function fmtDate(s) { if (!s) return '—'; try { return new Date(s).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}); } catch { return s; } }

function CatBadge({ cat }) {
  if (!cat) return <span style={{ color:'#c4b5b0', fontSize:11 }}>—</span>;
  const c = getCat(cat);
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:7, fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:c.light, border:`1px solid ${c.border}`, color:c.color, whiteSpace:'nowrap' }}><span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }} />{c.short}</span>;
}

/* ─── Row actions ──────────────────────────────────────────────── */
function RowActions({ officer, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ if(!open)return; const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h); },[open]);
  const bRow = { width:'100%', textAlign:'left', padding:'9px 15px', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' };
  return (
    <div ref={ref} style={{ position:'relative', display:'flex', justifyContent:'flex-end' }}>
      <button onClick={()=>setOpen(p=>!p)} style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:open?'rgba(192,57,43,0.07)':'transparent', border:`1px solid ${open?'rgba(192,57,43,0.2)':'transparent'}`, color:'#9a8a84', cursor:'pointer', transition:'all 0.15s' }}>
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="om-fdd" style={{ position:'absolute', right:0, top:'calc(100% + 6px)', zIndex:9999, background:'white', border:'1px solid #f0e8e5', borderRadius:12, overflow:'hidden', boxShadow:'0 12px 32px rgba(0,0,0,0.12)', minWidth:140, padding:'4px 0' }}>
          <button style={{ ...bRow, color:'#2563eb' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(37,99,235,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'} onClick={()=>{setOpen(false);onEdit(officer);}}><Edit size={13}/>Edit Record</button>
          <button style={{ ...bRow, color:'#c0392b' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(192,57,43,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'} onClick={()=>{setOpen(false);onDelete(officer);}}><Trash2 size={13}/>Delete</button>
        </div>
      )}
    </div>
  );
}

function ModalPortal({ children }) { return createPortal(children, document.body); }

/* ─── Delete Modal ─────────────────────────────────────────────── */
function DeleteModal({ officer, onConfirm, onCancel, deleting }) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; },[]);
  return (
    <ModalPortal>
      <div onClick={()=>{ if(!deleting)onCancel(); }} style={{ position:'fixed', inset:0, zIndex:999990, background:'rgba(10,6,4,0.65)', backdropFilter:'blur(10px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:999991, width:'min(420px,calc(100vw - 32px))', borderRadius:22, overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.5)', background:'white', animation:'omIn 0.22s cubic-bezier(0.34,1.5,0.64,1)', fontFamily:'inherit' }}>
        <div style={{ height:4, background:'linear-gradient(90deg,#c0392b,#e74c3c,#e67e22)' }} />
        <div style={{ padding:'32px 30px 28px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
            <div style={{ width:68, height:68, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(192,57,43,0.07)', border:'1.5px solid rgba(192,57,43,0.15)' }}>
              <AlertTriangle size={30} style={{ color:'#c0392b' }} />
            </div>
          </div>
          <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.06em', color:'#1a1714', textAlign:'center', margin:'0 0 8px' }}>Delete Officer?</h3>
          <p style={{ textAlign:'center', fontSize:13, color:'#78716c', margin:'0 0 18px', lineHeight:1.65 }}>This action cannot be undone. The officer will be permanently removed.</p>
          <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px', borderRadius:13, background:'#fdf8f6', border:'1.5px solid #f0e8e5', marginBottom:22 }}>
            <Avatar src={officer.profileImage} name={officer.fullName} size={44} circle sx={{ border:'2px solid #ede8e5' }} />
            <div>
              <p style={{ fontWeight:700, fontSize:15, color:'#1a1714', margin:0 }}>{officer.fullName}</p>
              <p style={{ fontSize:12, color:'#a8a29e', margin:'3px 0 0', fontWeight:500 }}>{officer.rank}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onCancel} disabled={deleting} style={{ flex:1, fontWeight:700, padding:'13px 0', borderRadius:12, fontSize:13.5, background:'#f5f0ed', border:'1px solid #e8ddd8', color:'#57534e', cursor:deleting?'not-allowed':'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting} style={{ flex:1, fontWeight:700, padding:'13px 0', borderRadius:12, fontSize:13.5, color:'white', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:7, background:deleting?'#e8c4bc':'linear-gradient(135deg,#c0392b,#e74c3c)', boxShadow:deleting?'none':'0 4px 18px rgba(192,57,43,0.35)', cursor:deleting?'not-allowed':'pointer', fontFamily:'inherit' }}>
              {deleting?<><div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid white',borderTopColor:'transparent',animation:'omSpin 0.8s linear infinite' }}/>Deleting…</>:<><Trash2 size={14}/>Yes, Delete</>}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── Form Modal ───────────────────────────────────────────────── */
function FormModal({ editingOfficer, form, setForm, fileRef, uploading, saving, onSubmit, onClose }) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; },[]);
  const field = { width:'100%', background:'#fafaf9', border:'1.5px solid #e8ddd8', borderRadius:10, padding:'11px 14px', fontSize:13.5, color:'#1a1714', outline:'none', transition:'all 0.18s', fontFamily:'inherit', lineHeight:1.5 };
  const lbl = { display:'block', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'#9ca3af', marginBottom:7 };
  return (
    <ModalPortal>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999990, background:'rgba(10,6,4,0.72)', backdropFilter:'blur(12px)' }} />
      <div onClick={e=>e.stopPropagation()} style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:999991, width:'min(680px,calc(100vw - 32px))', height:'min(780px,calc(100dvh - 40px))', borderRadius:22, boxShadow:'0 40px 100px rgba(0,0,0,0.55)', background:'white', animation:'omIn 0.22s cubic-bezier(0.34,1.4,0.64,1)', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'inherit' }}>

        <div style={{ height:4, background:'linear-gradient(90deg,#c0392b 0%,#e67e22 55%,#f39c12 100%)', flexShrink:0 }} />

        {/* Header */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 26px 18px', borderBottom:'1px solid #f5ede9', background:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            <div style={{ width:40, height:40, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow:'0 4px 14px rgba(192,57,43,0.28)' }}>
              <Users size={17} color="white" />
            </div>
            <div>
              <p style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', color:'#c0392b', margin:'0 0 2px' }}>{editingOfficer?'Edit Record':'New Officer'}</p>
              <h3 style={{ fontWeight:700, fontSize:15.5, color:'#1a1714', margin:0 }}>{editingOfficer?'Update Officer Record':'Add New Officer'}</h3>
            </div>
          </div>
          <button className="om-close-btn" onClick={onClose} style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f0ed', border:'1px solid #ede8e5', color:'#78716c', cursor:'pointer', transition:'all 0.15s' }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="om-modal-body" style={{ flex:'1 1 0', minHeight:0, overflowY:'auto', padding:'20px 26px', background:'#fdfaf9' }}>
          <form id="om-form" onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Photo */}
            <div style={{ padding:'18px 20px', borderRadius:14, background:'white', border:'1px solid #f0e8e5', boxShadow:'0 1px 4px rgba(0,0,0,0.03)' }}>
              <p style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#c0392b', margin:'0 0 14px' }}>Profile Photo</p>
              <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                {form.profileImage
                  ? <Avatar src={form.profileImage} name={form.fullName||'Preview'} size={70} circle sx={{ border:'3px solid #f0e8e5' }} />
                  : <div style={{ width:70, height:70, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f0ed', border:'2px dashed #d8ccc8', flexShrink:0 }}><Users size={24} style={{ color:'#d4b8b3' }} /></div>
                }
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <button type="button" className="om-upload-btn" onClick={()=>fileRef.current?.click()} disabled={uploading}
                    style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:700, padding:'9px 16px', borderRadius:10, background:uploading?'#fdf3f0':'#f5f0ed', border:`1px solid ${uploading?'rgba(192,57,43,0.25)':'#e8ddd8'}`, color:uploading?'#c0392b':'#57534e', cursor:uploading?'not-allowed':'pointer', fontFamily:'inherit' }}>
                    {uploading?<><div style={{ width:12,height:12,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',animation:'omSpin 0.8s linear infinite' }}/>Processing…</>:<><UploadCloud size={13}/>{form.profileImage?'Change Photo':'Upload Photo'}</>}
                  </button>
                  <p style={{ fontSize:11, color:'#b5a8a3', margin:0, fontWeight:500 }}>Any size — auto-compressed to optimal quality</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div style={{ padding:'18px 20px', borderRadius:14, background:'white', border:'1px solid #f0e8e5', boxShadow:'0 1px 4px rgba(0,0,0,0.03)', display:'flex', flexDirection:'column', gap:15 }}>
              <p style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#c0392b', margin:0 }}>Personal Information</p>
              <div>
                <label style={lbl}>Full Name</label>
                <input type="text" className="om-field" value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} style={field} placeholder="e.g. Juan Dela Cruz" required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
                <div>
                  <label style={lbl}>Rank</label>
                  <select className="om-field" value={form.rank} onChange={e=>setForm(p=>({...p,rank:e.target.value}))} style={field} required>
                    {RANK_OPTIONS.map(r=><option key={r} value={r}>{r} ({RANK_ABBREVIATIONS[r]})</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Birthdate</label>
                  <div style={{ position:'relative' }}>
                    <Calendar size={13} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} />
                    <input type="date" className="om-field" value={form.birthdate} onChange={e=>setForm(p=>({...p,birthdate:e.target.value}))} style={{ ...field, paddingLeft:36 }} />
                  </div>
                </div>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select className="om-field" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={field}>
                  <option value="">— Select category —</option>
                  {CATEGORY_OPTIONS.map(cat=>{ const c=getCat(cat); return <option key={cat} value={cat}>{c.label} ({c.short})</option>; })}
                </select>
              </div>
            </div>

            {/* Assignment & Contact */}
            <div style={{ padding:'18px 20px', borderRadius:14, background:'white', border:'1px solid #f0e8e5', boxShadow:'0 1px 4px rgba(0,0,0,0.03)', display:'flex', flexDirection:'column', gap:15 }}>
              <p style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#c0392b', margin:0 }}>Assignment & Contact</p>
              <div>
                <label style={lbl}>Role / Assignment</label>
                <textarea className="om-field" value={form.roleAssignment} onChange={e=>setForm(p=>({...p,roleAssignment:e.target.value}))} style={{ ...field, resize:'vertical', minHeight:68, lineHeight:1.6 }} placeholder="e.g. Station Commander, Shift A Nozzleman" required rows={2} />
                <p style={{ fontSize:11, color:'#b5a8a3', marginTop:4, fontWeight:500 }}>Separate multiple roles with commas.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
                <div>
                  <label style={lbl}>Contact Number</label>
                  <div style={{ position:'relative' }}>
                    <Phone size={13} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} />
                    <input type="tel" className="om-field" value={form.contactNumber} onChange={e=>setForm(p=>({...p,contactNumber:e.target.value}))} style={{ ...field, paddingLeft:36 }} placeholder="+63 912 345 6789" required />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Account Number</label>
                  <div style={{ position:'relative' }}>
                    <CreditCard size={13} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c4b5b0', pointerEvents:'none' }} />
                    <input type="text" className="om-field" value={form.accountNumber} onChange={e=>setForm(p=>({...p,accountNumber:e.target.value}))} style={{ ...field, paddingLeft:36, fontFamily:'monospace' }} placeholder="BFP-CDO-001" required />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ flexShrink:0, padding:'15px 26px 20px', borderTop:'1px solid #f0e8e5', background:'white', display:'flex', gap:11 }}>
          <button type="submit" form="om-form" disabled={saving||uploading} className="om-save-btn"
            style={{ flex:1, fontWeight:700, padding:'14px 0', borderRadius:12, fontSize:14, color:'white', border:'none', cursor:saving||uploading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:saving||uploading?'linear-gradient(135deg,#dba8a1,#e8b8a8)':'linear-gradient(135deg,#c0392b 0%,#e67e22 100%)', boxShadow:saving||uploading?'none':'0 4px 18px rgba(192,57,43,0.3)', transition:'all 0.18s', fontFamily:'inherit' }}>
            {saving&&<div style={{ width:14,height:14,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.5)',borderTopColor:'white',animation:'omSpin 0.8s linear infinite' }} />}
            {uploading?'Processing image…':saving?'Saving…':editingOfficer?'  Update Officer':'  Add Officer'}
          </button>
          <button type="button" onClick={onClose} className="om-cancel-btn"
            style={{ flex:1, fontWeight:700, padding:'14px 0', borderRadius:12, fontSize:14, background:'#f5f0ed', border:'1px solid #e8ddd8', color:'#57534e', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>
            Cancel
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── MAIN EXPORT ──────────────────────────────────────────────── */
export function OfficersManager() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOfficer, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch]     = useState('');
  const [selRank, setSelRank]   = useState('All Ranks');
  const [selCat, setSelCat]     = useState('All');
  const [rankOpen, setRankOpen] = useState(false);
  const [expandedRole, setExpanded] = useState(null);
  const [form, setForm] = useState({ profileImage:'', fullName:'', rank:'Fire Officer I', category:'', roleAssignment:'', contactNumber:'', accountNumber:'', birthdate:'' });
  const fileRef = useRef(null);

  const RANKS = ['Chief Fire Officer','Chief Fire Inspector','Senior Fire Inspector','Fire Inspector','Senior Fire Officer III','Senior Fire Officer II','Senior Fire Officer I','Fire Officer III','Fire Officer II','Fire Officer I'];

  useEffect(()=>{ load(); },[]);

  async function load() {
    setLoading(true);
    try { setOfficers(await getOfficers()); } catch { toast.error('Failed to load officers'); } finally { setLoading(false); }
  }

  async function handleFile(e) {
    const f=e.target.files[0]; if(!f)return; e.target.value='';
    if(!f.type.startsWith('image/')){ toast.error('Please select a valid image.'); return; }
    setUploading(true);
    try {
      setForm(p=>({...p,profileImage:URL.createObjectURL(f)}));
      const b64=await compressImage(f);
      setForm(p=>({...p,profileImage:b64}));
      toast.success('Image ready!');
    } catch { toast.error('Failed to process image.'); setForm(p=>({...p,profileImage:''})); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if(uploading){ toast.error('Wait for image to finish.'); return; }
    if(!form.profileImage){ toast.error('Please upload a profile image!'); return; }
    setSaving(true);
    try {
      if(editingOfficer){
        await saveOfficer(editingOfficer.id, form);
        setOfficers(p=>p.map(o=>o.id===editingOfficer.id?{...form,id:editingOfficer.id}:o));
        toast.success('Officer updated!');
      } else {
        const id=Date.now().toString();
        await saveOfficer(id,form);
        setOfficers(p=>[...p,{...form,id}]);
        toast.success('Officer added!');
      }
      reset();
    } catch { toast.error('Failed to save officer'); } finally { setSaving(false); }
  }

  function openEdit(o) {
    setEditing(o);
    setForm({ profileImage:o.profileImage||'', fullName:o.fullName||'', rank:o.rank||'Fire Officer I', category:o.category||'', roleAssignment:o.roleAssignment||'', contactNumber:o.contactNumber||'', accountNumber:o.accountNumber||'', birthdate:o.birthdate||'' });
    setIsFormOpen(true);
  }

  async function confirmDelete() {
    if(!deleteTarget)return; setDeleting(true);
    try { await deleteOfficer(deleteTarget.id); setOfficers(p=>p.filter(o=>o.id!==deleteTarget.id)); toast.success('Officer deleted!'); setDeleteTarget(null); }
    catch { toast.error('Failed to delete officer'); } finally { setDeleting(false); }
  }

  function reset() { setForm({ profileImage:'', fullName:'', rank:'Fire Officer I', category:'', roleAssignment:'', contactNumber:'', accountNumber:'', birthdate:'' }); setEditing(null); setIsFormOpen(false); setUploading(false); }

  const sorted   = [...officers].sort((a,b)=>{ const ia=RANKS.indexOf(a.rank),ib=RANKS.indexOf(b.rank); if(ia===-1)return 1; if(ib===-1)return -1; return ia-ib; });
  const filtered = sorted.filter(o=>{ const q=search.toLowerCase(); const ms=!q||[o.fullName,o.rank,o.roleAssignment,o.contactNumber,o.accountNumber,o.category].some(v=>v?.toLowerCase().includes(q)); return ms&&(selRank==='All Ranks'||o.rank===selRank)&&(selCat==='All'||o.category===selCat); });
  const uRanks   = ['All Ranks',...RANKS.filter(r=>officers.some(o=>o.rank===r))];

  return (
    <div style={{ padding:'28px 24px', fontFamily:"'DM Sans', sans-serif", minHeight:'100vh', background:'#f5f3f0' }}>
      <style>{STYLES}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <p style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.22em', color:'#c0392b', margin:'0 0 3px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ display:'inline-block', width:18, height:2, background:'#c0392b', borderRadius:2 }} />
            Personnel Management
          </p>
          <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.2rem', letterSpacing:'0.05em', color:'#1a1714', lineHeight:1, margin:0 }}>Officers Management</h2>
          <p style={{ fontSize:13, color:'#9a8a84', margin:'4px 0 0' }}>{officers.length} officer{officers.length!==1?'s':''} on record</p>
        </div>
        <button onClick={()=>setIsFormOpen(true)} className="om-add-btn"
          style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700, padding:'11px 22px', borderRadius:12, color:'white', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow:'0 4px 16px rgba(192,57,43,0.3)', transition:'all 0.18s', fontFamily:'inherit' }}>
          Add Officer
        </button>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
        <button onClick={()=>setSelCat('All')} className="om-catbtn"
          style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 15px', borderRadius:999, border:'none', background:selCat==='All'?'#1a1714':'white', boxShadow:selCat==='All'?'0 3px 12px rgba(28,25,23,0.22)':'0 1px 4px rgba(0,0,0,0.06)', outline:selCat==='All'?'none':'1px solid #e8e0dc', fontFamily:'inherit' }}>
          <Users size={12} style={{ color:selCat==='All'?'white':'#78716c' }} />
          <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:selCat==='All'?'white':'#57534e' }}>All</span>
          <span style={{ fontSize:10, fontWeight:800, minWidth:20, height:17, padding:'0 5px', borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', background:selCat==='All'?'rgba(255,255,255,0.18)':'rgba(28,25,23,0.07)', color:selCat==='All'?'white':'#78716c' }}>{officers.length}</span>
        </button>
        {CATEGORY_OPTIONS.map(cat=>{
          const c=getCat(cat); const cnt=officers.filter(o=>o.category===cat).length; const on=selCat===cat;
          return (
            <button key={cat} onClick={()=>setSelCat(on?'All':cat)} className="om-catbtn"
              style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 15px', borderRadius:999, border:'none', background:on?c.dot:'white', boxShadow:on?`0 3px 14px rgba(0,0,0,0.18)`:'0 1px 4px rgba(0,0,0,0.06)', outline:on?'none':`1px solid ${c.border}`, fontFamily:'inherit' }}>
              <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:on?'white':c.color }}>{c.short}</span>
              <span style={{ fontSize:10, fontWeight:800, minWidth:17, height:17, padding:'0 5px', borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', background:on?'rgba(255,255,255,0.22)':c.light, color:on?'white':c.dot }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH + RANK FILTER ── */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c0392b', pointerEvents:'none' }} />
          <input type="text" className="om-si" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, rank, role, contact…"
            style={{ width:'100%', background:'white', border:'1px solid #ece6e0', borderRadius:11, padding:'10px 14px 10px 38px', fontSize:13, color:'#1a1714', outline:'none', fontFamily:'inherit' }} />
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setRankOpen(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 15px', borderRadius:11, fontSize:13, fontWeight:700, cursor:'pointer', minWidth:155, justifyContent:'space-between', background:selRank!=='All Ranks'?'rgba(192,57,43,0.07)':'white', border:`1px solid ${selRank!=='All Ranks'?'rgba(192,57,43,0.25)':'#ece6e0'}`, color:selRank!=='All Ranks'?'#c0392b':'#78716c', fontFamily:'inherit' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}><Filter size={12}/>{selRank!=='All Ranks'?(RANK_ABBREVIATIONS[selRank]||selRank):'All Ranks'}</span>
            <ChevronDown size={12} style={{ transform:rankOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }} />
          </button>
          {rankOpen && (
            <div className="om-fdd" style={{ position:'absolute', right:0, top:'calc(100% + 6px)', borderRadius:12, overflow:'hidden', zIndex:30, background:'white', border:'1px solid #ece6e0', boxShadow:'0 12px 30px rgba(0,0,0,0.1)', minWidth:220, padding:'4px 0' }}>
              {uRanks.map(rk=>(
                <button key={rk} onClick={()=>{ setSelRank(rk); setRankOpen(false); }}
                  style={{ width:'100%', textAlign:'left', padding:'9px 15px', fontSize:13, fontWeight:selRank===rk?700:400, color:selRank===rk?'#c0392b':'#44403c', background:selRank===rk?'rgba(192,57,43,0.06)':'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
                  onMouseEnter={e=>{ if(selRank!==rk)e.currentTarget.style.background='rgba(192,57,43,0.03)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=selRank===rk?'rgba(192,57,43,0.06)':'none'; }}>
                  {rk}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(search||selRank!=='All Ranks'||selCat!=='All')&&!loading&&(
        <p style={{ marginBottom:12, fontSize:12, fontWeight:600, color:'#a8a29e' }}>
          Showing <span style={{ color:'#c0392b' }}>{filtered.length}</span> of {officers.length} officers
        </p>
      )}

      {/* ── TABLE ── */}
      <div style={{ borderRadius:16, overflow:'hidden', background:'white', border:'1px solid #ece6e0', boxShadow:'0 2px 14px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0' }}>
            <div style={{ width:32,height:32,borderRadius:'50%',border:'2.5px solid rgba(192,57,43,0.2)',borderTopColor:'#c0392b',animation:'omSpin 0.8s linear infinite',marginBottom:12 }} />
            <p style={{ fontSize:13, fontWeight:600, color:'#a8a29e' }}>Loading officers…</p>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', textAlign:'center' }}>
            <div style={{ width:60,height:60,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,background:'rgba(192,57,43,0.06)',border:'1.5px dashed rgba(192,57,43,0.18)' }}>
              {officers.length===0?<Users size={24} style={{ color:'#d4b8b3' }} />:<Search size={24} style={{ color:'#d4b8b3' }} />}
            </div>
            <p style={{ fontWeight:700, fontSize:14, color:'#a8a29e', margin:0 }}>{officers.length===0?'No officers registered':'No officers match your search'}</p>
            <p style={{ fontSize:12, marginTop:4, color:'#c4b5b0' }}>{officers.length===0?'Click "Add Officer" to get started':'Try adjusting your filters'}</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ tableLayout:'fixed', width:'100%', borderCollapse:'collapse', minWidth:1000 }}>
              <colgroup>
                <col style={{ width:'35%' }} />{/* Officer — wider for name prominence */}
                <col style={{ width:'15%' }} />{/* Rank */}
                <col style={{ width:'10%' }} />{/* Category */}
                <col style={{ width:'25%' }} />{/* Role */}
                <col style={{ width:'20%' }} />{/* Contact */}
                <col style={{ width:'11%' }} />{/* Account */}
                <col style={{ width:'15%' }}  />{/* Birthdate */}
                <col style={{ width:'5%' }}  />{/* Actions */}
              </colgroup>
              <thead>
                <tr style={{ background:'#fdf9f8', borderBottom:'1.5px solid #f5ede9' }}>
                  {['Officer','Rank','Category','Role / Assignment','Contact','Account No.','Birthdate',''].map((h,i)=>(
                    <th key={i} style={{ padding:'13px 16px', textAlign:i===7?'right':'left', fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#b0a09a', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o,idx)=>{
                  const exp = expandedRole===o.id;
                  const hasMore = o.roleAssignment?.includes(',');
                  const firstRole = hasMore ? o.roleAssignment.substring(0,o.roleAssignment.indexOf(',')) : o.roleAssignment;
                  const cc = o.category ? getCat(o.category) : null;
                  const abbr = RANK_ABBREVIATIONS[o.rank] || o.rank;
                  return (
                    <tr key={o.id} className="om-row-hover" style={{ borderBottom:idx<filtered.length-1?'1px solid #faf5f3':'none' }}>

                      {/* ── OFFICER (name prominently displayed) ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                          <div style={{ position:'relative', flexShrink:0 }}>
                            <Avatar src={o.profileImage} name={o.fullName} size={42} sx={{ border:'1.5px solid #f0e8e5' }} />
                            {cc && <span style={{ position:'absolute', bottom:-1, right:-1, width:11, height:11, borderRadius:'50%', background:cc.dot, border:'2px solid white' }} />}
                          </div>
                          <div style={{ minWidth:0 }}>
                            {/* ★ Name — large, bold, clearly readable ★ */}
                            <p className="om-name-cell" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%', margin:0 }} title={o.fullName}>
                              {o.fullName}
                            </p>
                            <p className="om-rank-sub" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%', margin:0 }}>{abbr}</p>
                          </div>
                        </div>
                      </td>

                      {/* ── RANK ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:800, padding:'3px 9px', borderRadius:7, background:'rgba(192,57,43,0.07)', border:'1px solid rgba(192,57,43,0.14)', color:'#c0392b', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                          <Shield size={9}/>{abbr}
                        </div>
                        <p style={{ fontSize:10, color:'#c4b5b0', margin:'3px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }} title={o.rank}>{o.rank}</p>
                      </td>

                      {/* ── CATEGORY ── */}
                      <td style={{ padding:'14px 16px' }}>
                        {o.category && cc ? (
                          <div>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:7, fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:cc.light, border:`1px solid ${cc.border}`, color:cc.color, whiteSpace:'nowrap' }}>{cc.short}</span>
                            <p style={{ fontSize:10, color:'#c4b5b0', margin:'3px 0 0' }}>{cc.desc}</p>
                          </div>
                        ) : <CatBadge cat={o.category} />}
                      </td>

                      {/* ── ROLE ── */}
                      <td style={{ padding:'14px 16px', verticalAlign:'top' }}>
                        {exp
                          ? <><span style={{ fontSize:13, fontWeight:500, color:'#44403c', display:'block', wordBreak:'break-word', lineHeight:1.55 }}>{o.roleAssignment}</span><button onClick={()=>setExpanded(null)} style={{ fontSize:10, fontWeight:700, color:'#c0392b', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:3 }}>▲ Less</button></>
                          : <><span style={{ fontSize:13, fontWeight:500, color:'#44403c', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }} title={o.roleAssignment}>{firstRole}</span>{hasMore&&<button onClick={()=>setExpanded(o.id)} style={{ fontSize:10, fontWeight:700, color:'#c0392b', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:2 }}>▼ More</button>}</>
                        }
                      </td>

                      {/* ── CONTACT ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <Phone size={10} style={{ color:'#c4b5b0', flexShrink:0 }} />
                          <span style={{ fontSize:12.5, color:'#57534e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.contactNumber || '—'}</span>
                        </div>
                      </td>

                      {/* ── ACCOUNT ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <CreditCard size={10} style={{ color:'#d1c4be', flexShrink:0 }} />
                          <span style={{ fontSize:12, color:'#78716c', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.accountNumber || '—'}</span>
                        </div>
                      </td>

                      {/* ── BIRTHDATE ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <Calendar size={10} style={{ color:'#d1c4be', flexShrink:0 }} />
                          <span style={{ fontSize:12, color:'#78716c' }}>{fmtDate(o.birthdate)}</span>
                        </div>
                      </td>

                      {/* ── ACTIONS ── */}
                      <td style={{ padding:'14px 16px' }}>
                        <RowActions officer={o} onEdit={openEdit} onDelete={o=>setDeleteTarget(o)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p style={{ textAlign:'right', fontSize:11, color:'#c4b5b0', margin:'10px 0 0', fontWeight:500 }}>
          {filtered.length} officer{filtered.length!==1?'s':''} shown
        </p>
      )}

      {/* ── MODALS ── */}
      {deleteTarget && <DeleteModal officer={deleteTarget} onConfirm={confirmDelete} onCancel={()=>{ if(!deleting)setDeleteTarget(null); }} deleting={deleting} />}
      {isFormOpen   && <FormModal editingOfficer={editingOfficer} form={form} setForm={setForm} fileRef={fileRef} uploading={uploading} saving={saving} onSubmit={handleSubmit} onClose={reset} />}

      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleFile} />
      {rankOpen && <div style={{ position:'fixed', inset:0, zIndex:25 }} onClick={()=>setRankOpen(false)} />}
    </div>
  );
}