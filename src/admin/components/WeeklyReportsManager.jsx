import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, X, FileText, Calendar,
  ChevronLeft, ChevronRight, Image as ImageIcon,
  UploadCloud, AlertTriangle,
} from 'lucide-react';

import { CATEGORY_OPTIONS } from '../../utils/types';
import { getWeeklyReports, saveWeeklyReport, deleteWeeklyReport } from '../../utils/storage';
import { toast } from 'sonner';

// ─── Z-index layers ────────────────────────────────────────────────────────────
// FormModal   → backdrop: 999990 / dialog: 999991
// DeleteModal → backdrop: 999992 / dialog: 999993  ← always on top
const Z = {
  formBackdrop:   999990,
  formDialog:     999991,
  deleteBackdrop: 999992,
  deleteDialog:   999993,
};

// ─── Image compression ────────────────────────────────────────────────────────
// Firestore documents have a 1 MB limit. Raw base64 images easily exceed this.
// This compresses each image to a max dimension of 1200px and 0.82 JPEG quality
// before saving — keeping file sizes well within limits.
function compressImage(dataUrl, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback: keep original if compression fails
    img.src = dataUrl;
  });
}

async function compressAll(images) {
  return Promise.all(images.map(src => compressImage(src)));
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  Event:       { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Training:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  Advisory:    { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Achievement: { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border border-violet-200' },
};
const getCategoryStyle = (cat) =>
  CATEGORY_STYLES[cat] || { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border border-stone-200' };

const fmtDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function getImages(report) {
  if (Array.isArray(report.images) && report.images.length > 0) return report.images;
  if (report.coverImage) return [report.coverImage];
  return [];
}

// ─── shared field / label styles ─────────────────────────────────────────────
const FIELD = {
  width: '100%',
  background: '#fafaf9',
  border: '1.5px solid #e8ddd8',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 13.5,
  color: '#1a1714',
  outline: 'none',
  transition: 'all 0.18s',
  fontFamily: 'inherit',
  lineHeight: 1.5,
};
const LBL = {
  display: 'block',
  fontSize: 10,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: '#9ca3af',
  marginBottom: 7,
};

// ─── Section card wrapper ─────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 14, background: 'white',
      border: '1px solid #f0e8e5', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: 15,
    }}>
      <p style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c0392b', margin: 0 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);

  const addFiles = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Compress immediately on upload so the preview is also the compressed version
        compressImage(reader.result).then(compressed => {
          onChange((prev) => [...prev, compressed]);
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const remove = (idx) => onChange((prev) => prev.filter((_, i) => i !== idx));
  const move = (from, to) => onChange((prev) => {
    const next = [...prev];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {images.map((src, i) => (
            <div key={i} className="wrm-thumb"
              style={{
                position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1',
                border: i === 0 ? '2px solid #b91c1c' : '1.5px solid #e7e5e4',
              }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {i === 0 && (
                <span style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(185,28,28,0.88)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>
                  Cover
                </span>
              )}
              <div className="wrm-thumb-ctrl"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {i > 0 && (
                  <button type="button" onClick={() => move(i, i - 1)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={12} style={{ color: '#1c1917' }} />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: '#c0392b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} color="white" />
                </button>
                {i < images.length - 1 && (
                  <button type="button" onClick={() => move(i, i + 1)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={12} style={{ color: '#1c1917' }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '20px 12px', cursor: 'pointer', borderRadius: 12, background: '#fdf9f8', border: '1.5px dashed #e8d8d3', transition: 'border-color 0.18s' }}>
        <UploadCloud size={22} style={{ color: '#c4b5b0' }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#a8a29e' }}>
          {images.length === 0 ? 'Upload images' : `Add more images (${images.length} uploaded)`}
        </span>
        <span style={{ fontSize: 10.5, color: '#c4b5b0' }}>First image becomes the cover · Hover to reorder</span>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={addFiles} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

// ─── Card image mini-slider ───────────────────────────────────────────────────
function CardImages({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return <div style={{ height: 192, background: '#f5f0ed' }} />;
  return (
    <div style={{ position: 'relative', height: 192, background: '#f5f0ed', overflow: 'hidden', flexShrink: 0 }}>
      <img src={images[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(28,25,23,0.4),transparent 55%)' }} />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(p => (p - 1 + images.length) % images.length); }}
            style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(p => (p + 1) % images.length); }}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={13} />
          </button>
          <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 3 }}>
            <ImageIcon size={9} /> {idx + 1}/{images.length}
          </span>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {images.slice(0, 6).map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 14 : 6, height: 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.18s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ editingReport, formData, setFormData, saving, onSubmit, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [saving, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { if (!saving) onClose(); }}
        style={{
          position: 'fixed', inset: 0,
          zIndex: Z.formBackdrop,
          background: 'rgba(10,6,4,0.72)',
          backdropFilter: 'blur(12px)',
        }}
      />

      {/* Dialog
          • maxHeight (not height) — grows with content, capped at viewport
          • overflow: hidden — clips border-radius; body child handles its own scroll
      */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: Z.formDialog,
          width: 'min(680px, calc(100vw - 32px))',
          maxHeight: 'min(780px, calc(100dvh - 40px))',
          borderRadius: 22,
          boxShadow: '0 40px 100px rgba(0,0,0,0.55)',
          background: 'white',
          animation: 'wrmOmIn 0.22s cubic-bezier(0.34,1.4,0.64,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}
      >
        {/* Top gradient stripe — never shrinks */}
        <div style={{ height: 4, flexShrink: 0, background: 'linear-gradient(90deg,#c0392b 0%,#e67e22 55%,#f39c12 100%)' }} />

        {/* Header — flexShrink:0 keeps it always fully visible */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 22px 12px',
          borderBottom: '1px solid #f5ede9',
          background: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.28)' }}>
              <FileText size={17} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', margin: '0 0 2px' }}>
                {editingReport ? 'Edit Record' : 'New Report'}
              </p>
              <h3 style={{ fontWeight: 700, fontSize: 15.5, color: '#1a1714', margin: 0 }}>
                {editingReport ? 'Update Report' : 'Add Weekly Report'}
              </h3>
            </div>
          </div>
          <button onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0ed', border: '1px solid #ede8e5', color: '#78716c', cursor: 'pointer', transition: 'all 0.15s' }}>
            <X size={14} />
          </button>
        </div>

        {/* Body
            • flex: 1 1 0  — fills space between header & footer
            • minHeight: 0 — CRITICAL: allows flex child to shrink so header/footer
              are never pushed out of view. Default min-height:auto breaks this.
            • overflowY: auto — scroll only when content overflows
        */}
        <div style={{
          flex: '1 1 0',
          minHeight: 400,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 26px',
          background: '#fdfaf9',
        }}>
          <form id="wrm-form" onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Section label="Report Images">
              <ImageUploader
                images={formData.images}
                onChange={(updater) => setFormData(p => ({ ...p, images: typeof updater === 'function' ? updater(p.images) : updater }))}
              />
            </Section>

            <Section label="Report Details">
              <div>
                <label style={LBL}>Title</label>
                <input type="text" className="wrm-field" value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={FIELD} placeholder="e.g. Fire Prevention Month Campaign" required />
              </div>
              <div>
                <label style={LBL}>Description</label>
                <textarea className="wrm-field" value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  style={{ ...FIELD, resize: 'vertical', minHeight: 88, lineHeight: 1.65 }}
                  placeholder="Brief description of the activity or event…" rows={3} required />
              </div>
            </Section>

            <Section label="Classification">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }} className="wrm-2col">
                <div>
                  <label style={LBL}>Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#c4b5b0', pointerEvents: 'none' }} />
                    <input type="date" className="wrm-field" value={formData.date}
                      onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                      style={{ ...FIELD, paddingLeft: 36 }} required />
                  </div>
                </div>
                <div>
                  <label style={LBL}>Category</label>
                  <select className="wrm-field" value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    style={FIELD} required>
                    {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </Section>

          </form>
        </div>

        {/* Footer — flexShrink:0 keeps it always fully visible */}
        <div style={{
          flexShrink: 0,
          padding: '15px 26px 20px',
          borderTop: '1px solid #f0e8e5',
          background: 'white',
          display: 'flex', gap: 11,
        }}>
          <button type="submit" form="wrm-form" disabled={saving}
            style={{
              flex: 1, fontWeight: 700, padding: '14px 0', borderRadius: 12, fontSize: 14,
              color: 'white', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: saving
                ? 'linear-gradient(135deg,#dba8a1,#e8b8a8)'
                : 'linear-gradient(135deg,#c0392b 0%,#e67e22 100%)',
              boxShadow: saving ? 'none' : '0 4px 18px rgba(192,57,43,0.3)',
              transition: 'all 0.18s', fontFamily: 'inherit',
            }}>
            {saving && (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.5)', borderTopColor: 'white', animation: 'wrmSpin 0.8s linear infinite' }} />
            )}
            {saving ? 'Saving…' : editingReport ? '✓  Update Report' : '+  Publish Report'}
          </button>
          <button type="button" onClick={onClose} disabled={saving}
            style={{ flex: 1, fontWeight: 700, padding: '14px 0', borderRadius: 12, fontSize: 14, background: '#f5f0ed', border: '1px solid #e8ddd8', color: '#57534e', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ report, onConfirm, onCancel, deleting }) {
  const images = getImages(report);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !deleting) onCancel(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [deleting, onCancel]);

  return (
    <>
      {/* Backdrop — higher z than FormModal so it fully covers it */}
      <div
        onClick={() => { if (!deleting) onCancel(); }}
        style={{
          position: 'fixed', inset: 0,
          zIndex: Z.deleteBackdrop,
          background: 'rgba(10,6,4,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog — highest z-index of all */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: Z.deleteDialog,
          width: 'min(460px, calc(100vw - 32px))',
          borderRadius: 22,
          boxShadow: '0 40px 100px rgba(0,0,0,0.65)',
          background: 'white',
          animation: 'wrmOmIn 0.22s cubic-bezier(0.34,1.4,0.64,1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          fontFamily: 'inherit',
        }}
      >
        {/* Top gradient stripe */}
        <div style={{ height: 4, flexShrink: 0, background: 'linear-gradient(90deg,#c0392b 0%,#e67e22 55%,#f39c12 100%)' }} />

        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px 18px', borderBottom: '1px solid #f5ede9', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
              <Trash2 size={18} style={{ color: '#c0392b' }} />
            </div>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', margin: '0 0 2px' }}>Confirm Action</p>
              <h3 style={{ fontWeight: 700, fontSize: 15.5, color: '#1a1714', margin: 0 }}>Delete this report?</h3>
            </div>
          </div>
          {!deleting && (
            <button onClick={onCancel}
              style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0ed', border: '1px solid #ede8e5', color: '#78716c', cursor: 'pointer', transition: 'all 0.15s' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 26px', background: '#fdfaf9', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Report preview */}
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #f0e8e5', background: 'white' }}>
            {images.length > 0 && (
              <div style={{ height: 96, overflow: 'hidden', position: 'relative' }}>
                <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)' }} />
                {images.length > 1 && (
                  <span style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'white', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ImageIcon size={9} /> {images.length} photos
                  </span>
                )}
              </div>
            )}
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1714', margin: '0 0 5px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {report.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Calendar size={10} style={{ color: '#c4b5b0' }} />
                <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>{fmtDate(report.date)}</span>
                {report.category && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d6ccc8' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#78716c' }}>{report.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(192,57,43,0.05)', border: '1.5px solid rgba(192,57,43,0.14)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={15} style={{ color: '#c0392b', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: '#78716c', lineHeight: 1.65, margin: 0 }}>
              <strong style={{ color: '#44403c' }}>This action cannot be undone.</strong> The report and all its images will be permanently removed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '15px 26px 22px', borderTop: '1px solid #f0e8e5', background: 'white', display: 'flex', gap: 11 }}>
          <button onClick={onConfirm} disabled={deleting}
            style={{
              flex: 1, fontWeight: 700, padding: '14px 0', borderRadius: 12, fontSize: 14,
              color: 'white', border: 'none',
              cursor: deleting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: deleting
                ? 'linear-gradient(135deg,#dba8a1,#e8b8a8)'
                : 'linear-gradient(135deg,#c0392b 0%,#a93226 100%)',
              boxShadow: deleting ? 'none' : '0 4px 18px rgba(192,57,43,0.3)',
              transition: 'all 0.18s', fontFamily: 'inherit',
            }}>
            {deleting
              ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.5)', borderTopColor: 'white', animation: 'wrmSpin 0.8s linear infinite' }} />Deleting…</>
              : <><Trash2 size={14} />Yes, Delete</>}
          </button>
          <button onClick={onCancel} disabled={deleting}
            style={{ flex: 1, fontWeight: 700, padding: '14px 0', borderRadius: 12, fontSize: 14, background: '#f5f0ed', border: '1px solid #e8ddd8', color: '#57534e', cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', opacity: deleting ? 0.6 : 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WeeklyReportsManager() {
  const [reports,       setReports]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [isFormOpen,    setIsFormOpen]    = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  const [formData, setFormData] = useState({
    images: [], title: '', description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Event',
  });

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyReports();
      setReports(data.sort((a, b) => {
        const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return db - da;
      }));
    } catch (err) {
      console.error('[WeeklyReports] loadReports failed:', err);
      toast.error('Failed to load reports');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) { toast.error('Please upload at least one image!'); return; }
    setSaving(true);
    try {
      // Images are already compressed on upload, but compress once more
      // as a safety pass in case any raw images slipped through
      const compressedImages = await compressAll(formData.images);

      const payload = {
        images: compressedImages,
        coverImage: compressedImages[0],
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        category: formData.category,
      };

      if (editingReport) {
        await saveWeeklyReport(editingReport.id, payload);
        setReports(prev => prev.map(r => r.id === editingReport.id ? { ...payload, id: editingReport.id } : r));
        toast.success('Report updated!');
      } else {
        const newId = Date.now().toString();
        await saveWeeklyReport(newId, payload);
        setReports(prev => [{ ...payload, id: newId }, ...prev]);
        toast.success('Report published!');
      }
      resetForm();
    } catch (err) {
      console.error('[WeeklyReports] save failed:', err);
      // Show the actual error message so the user knows what went wrong
      const msg = err?.message || 'Unknown error';
      toast.error(`Failed to save: ${msg}`);
    } finally { setSaving(false); }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    const dateVal = report.date?.toDate
      ? report.date.toDate().toISOString().split('T')[0]
      : report.date;
    setFormData({
      images: getImages(report),
      title: report.title,
      description: report.description,
      date: dateVal,
      category: report.category,
    });
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWeeklyReport(deleteTarget.id);
      setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
      toast.success('Report deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('[WeeklyReports] delete failed:', err);
      toast.error(`Failed to delete: ${err?.message || 'Unknown error'}`);
    } finally { setDeleting(false); }
  };

  const resetForm = () => {
    setFormData({ images: [], title: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Event' });
    setEditingReport(null);
    setIsFormOpen(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: '32px 16px', maxWidth: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes wrmSpin  { to { transform: rotate(360deg); } }
        @keyframes wrmOmIn  { from { opacity: 0; transform: translate(-50%,-50%) scale(0.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }

        .report-card { background: white; border: 1.5px solid #f0e8e5; border-radius: 16px; overflow: hidden; transition: all 0.22s ease; display: flex; flex-direction: column; }
        .report-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(192,57,43,0.1); border-color: #e8c4bc; }

        .wrm-field:focus { border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.08); outline: none; }

        .wrm-thumb-ctrl { opacity: 0; transition: opacity 0.18s; }
        .wrm-thumb:hover .wrm-thumb-ctrl { opacity: 1; }

        .wrm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        @media (max-width: 900px) { .wrm-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 580px) { .wrm-grid { grid-template-columns: 1fr !important; } }

        @media (max-width: 480px) { .wrm-2col { grid-template-columns: 1fr !important; } }

        .wrm-ph { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 30px; }
        @media (max-width: 480px) { .wrm-ph { flex-direction: column; align-items: stretch; } .wrm-ph button { width: 100%; justify-content: center; } }
      `}</style>

      {/* Page header */}
      <div className="wrm-ph">
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c0392b', marginBottom: 4 }}>Content Management</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', fontSize: '2.2rem', color: '#1c1917', lineHeight: 1, margin: 0 }}>Weekly Reports</h2>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4, marginBottom: 0 }}>{reports.length} report{reports.length !== 1 ? 's' : ''} published</p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, padding: '11px 22px', borderRadius: 12, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.3)', fontFamily: 'inherit' }}>
          <Plus size={15} /> Add Report
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', background: 'white', borderRadius: 20, border: '1.5px solid #f0e8e5' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid #c0392b', borderTopColor: 'transparent', animation: 'wrmSpin 0.9s linear infinite', marginBottom: 12 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#a8a29e', margin: 0 }}>Loading reports...</p>
        </div>

      ) : reports.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', background: 'white', borderRadius: 20, border: '1.5px dashed #f0d8d3' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
            <FileText size={22} style={{ color: '#d4b8b3' }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#a8a29e', margin: 0 }}>No reports yet</p>
          <p style={{ fontSize: 12, color: '#c4b5b0', marginTop: 4, marginBottom: 0 }}>Click "Add Report" to publish your first update</p>
        </div>

      ) : (
        <div className="wrm-grid">
          {reports.map((report) => {
            const s    = getCategoryStyle(report.category);
            const imgs = getImages(report);
            return (
              <div key={report.id} className="report-card">
                <div style={{ position: 'relative' }}>
                  <CardImages images={imgs} />
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{report.category}
                  </span>
                </div>

                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Calendar size={11} style={{ color: '#c4b5b0' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e' }}>{fmtDate(report.date)}</span>
                    {imgs.length > 1 && (
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#c4b5b0' }}>
                        <ImageIcon size={10} /> {imgs.length}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: '#1c1917', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.title}
                  </h3>
                  <p style={{ fontSize: 12, lineHeight: 1.7, color: '#78716c', margin: '0 0 auto', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description}
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f5ede9' }}>
                    <button onClick={() => handleEdit(report)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '10px 0', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1.5px solid rgba(59,130,246,0.15)', color: '#2563eb', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(report)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '10px 0', borderRadius: 10, background: 'rgba(192,57,43,0.05)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <FormModal
          editingReport={editingReport}
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />
      )}

      {/* Delete Modal — rendered last in DOM + higher z-indices = always on top */}
      {deleteTarget && (
        <DeleteModal
          report={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleting) setDeleteTarget(null); }}
          deleting={deleting}
        />
      )}
    </div>
  );
}