import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, FileText, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, ImagePlus } from 'lucide-react';

import { CATEGORY_OPTIONS } from '../../utils/types';
import { getWeeklyReports, saveWeeklyReport, deleteWeeklyReport } from '../../utils/storage';
import { toast } from 'sonner';

const CATEGORY_STYLES = {
  Event:       { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Training:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  Advisory:    { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Achievement: { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border border-violet-200' },
};
const getCategoryStyle = (cat) =>
  CATEGORY_STYLES[cat] || { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border border-stone-200' };

const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function getImages(report) {
  if (Array.isArray(report.images) && report.images.length > 0) return report.images;
  if (report.coverImage) return [report.coverImage];
  return [];
}

// ─── Image uploader section inside the form ────────────────────────────────
function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);

  const addFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        onChange((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const remove = (idx) => onChange((prev) => prev.filter((_, i) => i !== idx));

  const move = (from, to) =>
    onChange((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });

  return (
    <div>
      {/* Uploaded thumbnails */}
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
          {images.map((src, i) => (
            <div
              key={i}
              className="img-thumb-wrap"
              style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: i === 0 ? '2px solid #b91c1c' : '1.5px solid #e7e5e4' }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {/* Cover label */}
              {i === 0 && (
                <span style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(185,28,28,0.88)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>
                  Cover
                </span>
              )}
              {/* Hover controls */}
              <div className="img-hover-ctrl" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {i > 0 && (
                  <button type="button" onClick={() => move(i, i - 1)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={12} style={{ color: '#1c1917' }} />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: '#c0392b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} style={{ color: 'white' }} />
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

      {/* Add more button */}
      <label
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '18px 12px', cursor: 'pointer', borderRadius: 12, background: '#fdf9f8', border: '1.5px dashed #e8d8d3', transition: 'border-color 0.18s' }}
      >
        <ImagePlus size={20} style={{ color: '#c4b5b0' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#a8a29e' }}>
          {images.length === 0 ? 'Upload images' : `Add more images (${images.length} uploaded)`}
        </span>
        <span style={{ fontSize: 10, color: '#c4b5b0' }}>First image = cover · Hover thumbnails to reorder</span>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={addFiles} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

// ─── Card image mini-slider ────────────────────────────────────────────────
function CardImages({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return <div style={{ height: 192, background: '#f5f0ed' }} />;

  return (
    <div style={{ position: 'relative', height: 192, background: '#f5f0ed', overflow: 'hidden', flexShrink: 0 }}>
      <img src={images[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.4), transparent 55%)' }} />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIdx((p) => (p - 1 + images.length) % images.length); }}
            style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % images.length); }}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={13} />
          </button>
          <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 3 }}>
            <ImageIcon size={9} /> {idx + 1}/{images.length}
          </span>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {images.slice(0, 6).map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 14 : 6, height: 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.18s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WeeklyReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    images: [],
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Event',
  });

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyReports();
      const sorted = data.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
      setReports(sorted);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) { toast.error('Please upload at least one image!'); return; }
    setSaving(true);
    try {
      const payload = {
        images: formData.images,
        coverImage: formData.images[0],   // backward compat
        title: formData.title,
        description: formData.description,
        date: formData.date,
        category: formData.category,
      };
      if (editingReport) {
        await saveWeeklyReport(editingReport.id, payload);
        setReports((prev) => prev.map((r) => r.id === editingReport.id ? { ...payload, id: editingReport.id } : r));
        toast.success('Report updated!');
      } else {
        const newId = Date.now().toString();
        await saveWeeklyReport(newId, payload);
        setReports((prev) => [{ ...payload, id: newId }, ...prev]);
        toast.success('Report published!');
      }
      resetForm();
    } catch {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteWeeklyReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ images: [], title: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Event' });
    setEditingReport(null);
    setIsFormOpen(false);
  };

  const inp = { background: 'white', border: '1.5px solid #e8ddd8', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#1c1917', outline: 'none', width: '100%', transition: 'border-color 0.2s' };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .report-card { background:white; border:1.5px solid #f0e8e5; border-radius:16px; overflow:hidden; transition:all 0.22s ease; display:flex; flex-direction:column; }
        .report-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(192,57,43,0.1); border-color:#e8c4bc; }
        .modal-input:focus { border-color:#c0392b !important; box-shadow:0 0 0 3px rgba(192,57,43,0.08); }
        .label-style { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.16em; color:#a8a29e; margin-bottom:6px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .img-hover-ctrl { opacity: 0; transition: opacity 0.18s; }
        .img-thumb-wrap:hover .img-hover-ctrl { opacity: 1; }
      `}</style>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#c0392b' }}>Content Management</p>
          <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', fontSize: '2.2rem', color: '#1c1917' }}>Weekly Reports</h2>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>{reports.length} report{reports.length !== 1 ? 's' : ''} published</p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.3)' }}>
          <Plus size={15} /> Add Report
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent mb-3" style={{ borderColor: '#c0392b', animation: 'spin 1s linear infinite' }} />
          <p className="text-sm font-semibold" style={{ color: '#a8a29e' }}>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: 'white', border: '1.5px dashed #f0d8d3' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
            <FileText size={22} style={{ color: '#d4b8b3' }} />
          </div>
          <p className="font-semibold text-sm" style={{ color: '#a8a29e' }}>No reports yet</p>
          <p className="text-xs mt-1" style={{ color: '#c4b5b0' }}>Click "Add Report" to publish your first update</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reports.map((report) => {
            const s = getCategoryStyle(report.category);
            const imgs = getImages(report);
            return (
              <div key={report.id} className="report-card">
                {/* Category badge absolutely positioned over the image */}
                <div style={{ position: 'relative' }}>
                  <CardImages images={imgs} />
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{report.category}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar size={11} style={{ color: '#c4b5b0' }} />
                    <span className="text-[11px] font-semibold" style={{ color: '#a8a29e' }}>{formatDate(report.date)}</span>
                    {imgs.length > 1 && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#c4b5b0' }}>
                        <ImageIcon size={10} /> {imgs.length}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2" style={{ color: '#1c1917' }}>{report.title}</h3>
                  <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: '#78716c' }}>{report.description}</p>
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #f5ede9' }}>
                    <button onClick={() => handleEdit(report)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1.5px solid rgba(59,130,246,0.15)', color: '#2563eb' }}>
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(report.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl"
                      style={{ background: 'rgba(192,57,43,0.05)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(2px)' }}>
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'white', border: '1.5px solid #f0e8e5', marginTop: 0 }}>

            {/* Modal header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 z-10" style={{ borderBottom: '1.5px solid #f5ede9' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}>
                  <FileText size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>{editingReport ? 'Editing' : 'New Report'}</p>
                  <h3 className="font-bold text-sm" style={{ color: '#1c1917' }}>{editingReport ? 'Update Report' : 'Add Weekly Report'}</h3>
                </div>
              </div>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="label-style">Images <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: '#c4b5b0' }}>(first = cover)</span></label>
                <ImageUploader
                  images={formData.images}
                  onChange={(updater) =>
                    setFormData((p) => ({ ...p, images: typeof updater === 'function' ? updater(p.images) : updater }))
                  }
                />
              </div>

              {/* Title */}
              <div>
                <label className="label-style">Title</label>
                <input type="text" className="modal-input" value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  style={inp} placeholder="e.g. Fire Prevention Month Campaign" required />
              </div>

              {/* Description */}
              <div>
                <label className="label-style">Description</label>
                <textarea className="modal-input" value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  style={{ ...inp, resize: 'none' }} placeholder="Brief description of the activity or event..." rows={4} required />
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-style">Date</label>
                  <input type="date" className="modal-input" value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    style={inp} required />
                </div>
                <div>
                  <label className="label-style">Category</label>
                  <select className="modal-input" value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    style={inp} required>
                    {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.25)', opacity: saving ? 0.7 : 1 }}>
                  {saving && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: 'spin 1s linear infinite' }} />}
                  {editingReport ? 'Update Report' : 'Publish Report'}
                </button>
                <button type="button" onClick={resetForm}
                  className="flex-1 font-bold py-3 rounded-xl text-sm"
                  style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}