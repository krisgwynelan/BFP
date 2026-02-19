import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, UploadCloud, FileText, Calendar, Tag } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../../utils/types';
import { getWeeklyReports, saveWeeklyReport, deleteWeeklyReport } from '../../utils/storage';
import { toast } from 'sonner';

const CATEGORY_STYLES = {
  Event:       { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Training:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  Advisory:    { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Achievement: { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border border-violet-200' },
};
const getCategoryStyle = (cat) => CATEGORY_STYLES[cat] || { dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600 border border-stone-200' };

export function WeeklyReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    coverImage: '',
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
      // Sort by date descending
      const sorted = data.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
      setReports(sorted);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coverImage) { toast.error('Please upload a cover image!'); return; }
    setSaving(true);
    try {
      if (editingReport) {
        await saveWeeklyReport(editingReport.id, formData);
        setReports(prev => prev.map(r => r.id === editingReport.id ? { ...formData, id: editingReport.id } : r));
        toast.success('Report updated successfully!');
      } else {
        const newId = Date.now().toString();
        await saveWeeklyReport(newId, formData);
        setReports(prev => [{ ...formData, id: newId }, ...prev]);
        toast.success('Report added successfully!');
      }
      resetForm();
    } catch (err) {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    // Normalize date from Firestore Timestamp if needed
    const dateVal = report.date?.toDate
      ? report.date.toDate().toISOString().split('T')[0]
      : report.date;
    setFormData({
      coverImage: report.coverImage,
      title: report.title,
      description: report.description,
      date: dateVal,
      category: report.category,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteWeeklyReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Report deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const resetForm = () => {
    setFormData({ coverImage: '', title: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Event' });
    setEditingReport(null);
    setIsFormOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(p => ({ ...p, coverImage: reader.result }));
    reader.readAsDataURL(file);
  };

  // Helper to format date from Firestore Timestamp or string
  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const inputClass = {
    background: 'white',
    border: '1.5px solid #e8ddd8',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#1c1917',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .report-card {
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.22s ease;
          display: flex;
          flex-direction: column;
        }
        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(192,57,43,0.1);
          border-color: #e8c4bc;
        }
        .modal-input:focus { border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.08); }
        .label-style {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #a8a29e;
          margin-bottom: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#c0392b' }}>Content Management</p>
          <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', fontSize: '2.2rem', color: '#1c1917' }}>
            Weekly Reports
          </h2>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>
            {reports.length} report{reports.length !== 1 ? 's' : ''} published
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.3)' }}
        >
          <Plus size={15} /> Add Report
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent mb-3"
            style={{ borderColor: '#c0392b', animation: 'spin 1s linear infinite' }} />
          <p className="text-sm font-semibold" style={{ color: '#a8a29e' }}>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'white', border: '1.5px dashed #f0d8d3' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
            <FileText size={22} style={{ color: '#d4b8b3' }} />
          </div>
          <p className="font-semibold text-sm" style={{ color: '#a8a29e' }}>No reports yet</p>
          <p className="text-xs mt-1" style={{ color: '#c4b5b0' }}>Click "Add Report" to publish your first update</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reports.map((report) => {
            const s = getCategoryStyle(report.category);
            return (
              <div key={report.id} className="report-card">
                <div className="relative h-48 overflow-hidden shrink-0" style={{ background: '#f5f0ed' }}>
                  <img src={report.coverImage} alt={report.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.4) 0%, transparent 55%)' }} />
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{report.category}
                  </span>
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/90 font-semibold bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Calendar size={11} />
                    {formatDate(report.date)}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2" style={{ color: '#1c1917' }}>{report.title}</h3>
                  <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: '#78716c' }}>{report.description}</p>
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #f5ede9' }}>
                    <button onClick={() => handleEdit(report)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all duration-200"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1.5px solid rgba(59,130,246,0.15)', color: '#2563eb' }}>
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(report.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all duration-200"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(28, 25, 23, 0.1)', backdropFilter: 'blur(2px)' }}>
          <div className="w-full max-w-2xl mt-40 max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>

            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 z-10"
              style={{ borderBottom: '1.5px solid #f5ede9' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
                  <FileText size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>
                    {editingReport ? 'Editing Report' : 'New Report'}
                  </p>
                  <h3 className="font-bold text-sm" style={{ color: '#1c1917' }}>
                    {editingReport ? 'Update Weekly Report' : 'Add Weekly Report'}
                  </h3>
                </div>
              </div>
              <button onClick={resetForm}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="label-style">Cover Image</label>
                <div className="flex gap-3 items-start">
                  <label className="flex-1 flex flex-col items-center justify-center gap-2 py-5 px-4 cursor-pointer rounded-xl transition-all"
                    style={{ background: '#fdf9f8', border: '1.5px dashed #e8d8d3' }}>
                    <UploadCloud size={20} style={{ color: '#c4b5b0' }} />
                    <span className="text-xs font-semibold" style={{ color: '#a8a29e' }}>Click to upload image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Preview" className="w-24 h-24 rounded-xl object-cover shrink-0"
                      style={{ border: '1.5px solid #ede8e5' }} />
                  )}
                </div>
              </div>

              <div>
                <label className="label-style">Title</label>
                <input type="text" className="modal-input" value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={inputClass} placeholder="e.g. Fire Prevention Month Campaign" required />
              </div>

              <div>
                <label className="label-style">Description</label>
                <textarea className="modal-input" value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  style={{ ...inputClass, resize: 'none' }}
                  placeholder="Brief description of the activity or event..."
                  rows={4} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-style">Date</label>
                  <input type="date" className="modal-input" value={formData.date}
                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                    style={inputClass} required />
                </div>
                <div>
                  <label className="label-style">Category</label>
                  <select className="modal-input" value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    style={inputClass} required>
                    {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.25)', opacity: saving ? 0.7 : 1 }}>
                  {saving && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: 'spin 1s linear infinite' }} />}
                  {editingReport ? 'Update Report' : 'Publish Report'}
                </button>
                <button type="button" onClick={resetForm}
                  className="flex-1 font-bold py-3 rounded-xl text-sm transition-all"
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