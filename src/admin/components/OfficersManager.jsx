import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, UploadCloud, Users, Phone, CreditCard, Shield } from 'lucide-react';
import { RANK_OPTIONS, RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers, saveOfficer, deleteOfficer } from '../../utils/storage';
import { toast } from 'sonner';

// ─── Compress image using canvas before converting to base64 ─────────────────
// Resizes to max 400x400 and compresses to JPEG quality 0.7
// Result is typically 20–60KB — well within Firestore's 1MB limit
function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down proportionally
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Safe image with initials fallback ───────────────────────────────────────
function OfficerAvatar({ src, name, wrapClass = '', wrapStyle = {}, size = 40, circle = false }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || '?').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const radius = circle ? '50%' : '10px';

  useEffect(() => { setBroken(false); }, [src]);

  if (!src || broken) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 font-bold ${wrapClass}`}
        style={{
          width: size, height: size,
          borderRadius: radius,
          background: 'linear-gradient(135deg, rgba(192,57,43,0.12), rgba(230,126,34,0.12))',
          border: '1.5px solid rgba(192,57,43,0.15)',
          color: '#c0392b',
          fontSize: size > 60 ? 26 : 13,
          ...wrapStyle,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="shrink-0"
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', ...wrapStyle }}
      onError={() => setBroken(true)}
    />
  );
}

export function OfficersManager() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({
    profileImage: '',
    fullName: '',
    rank: 'Fire Officer I',
    roleAssignment: '',
    contactNumber: '',
    accountNumber: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => { loadOfficers(); }, []);

  const loadOfficers = async () => {
    setLoading(true);
    try {
      const data = await getOfficers();
      setOfficers(data);
    } catch (err) {
      console.error('Failed to load officers:', err);
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  // ─── Compress + convert to base64 — stored directly in Firestore ─────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // allow re-selecting same file

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    setUploading(true);

    try {
      // Show local preview immediately
      setFormData(prev => ({ ...prev, profileImage: URL.createObjectURL(file) }));

      // Compress to ~20–60KB base64 string
      const base64 = await compressImage(file);

      // Update with the actual compressed base64
      setFormData(prev => ({ ...prev, profileImage: base64 }));
      toast.success('Image ready!');
    } catch (err) {
      console.error('Image processing failed:', err);
      toast.error('Failed to process image. Please try again.');
      setFormData(prev => ({ ...prev, profileImage: '' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) { toast.error('Please wait for the image to finish processing.'); return; }
    if (!formData.profileImage) { toast.error('Please upload a profile image!'); return; }

    setSaving(true);
    try {
      if (editingOfficer) {
        await saveOfficer(editingOfficer.id, formData);
        setOfficers(prev => prev.map(o => o.id === editingOfficer.id ? { ...formData, id: editingOfficer.id } : o));
        toast.success('Officer updated successfully!');
      } else {
        const newId = Date.now().toString();
        await saveOfficer(newId, formData);
        setOfficers(prev => [...prev, { ...formData, id: newId }]);
        toast.success('Officer added successfully!');
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save officer:', err);
      toast.error('Failed to save officer');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({ ...officer });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this officer?')) return;
    try {
      await deleteOfficer(id);
      setOfficers(prev => prev.filter(o => o.id !== id));
      toast.success('Officer deleted successfully!');
    } catch (err) {
      console.error('Failed to delete officer:', err);
      toast.error('Failed to delete officer');
    }
  };

  const resetForm = () => {
    setFormData({ profileImage: '', fullName: '', rank: 'Fire Officer I', roleAssignment: '', contactNumber: '', accountNumber: '' });
    setEditingOfficer(null);
    setIsFormOpen(false);
    setUploading(false);
  };

  const inputStyle = {
    width: '100%',
    background: 'white',
    border: '1.5px solid #e8ddd8',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#1c1917',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f5f0ed; }
        ::-webkit-scrollbar-thumb { background: #e2c4b8; border-radius: 4px; }
        .officer-row { transition: background 0.15s; }
        .officer-row:hover { background: rgba(192,57,43,0.025); }
        .modal-inp:focus { border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.08) !important; }
        .action-btn-edit { background: rgba(59,130,246,0.06); border: 1.5px solid rgba(59,130,246,0.2); color: #2563eb; }
        .action-btn-edit:hover { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.35); }
        .action-btn-del { background: rgba(192,57,43,0.05); border: 1.5px solid rgba(192,57,43,0.18); color: #c0392b; }
        .action-btn-del:hover { background: rgba(192,57,43,0.1); border-color: rgba(192,57,43,0.35); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#c0392b' }}>Personnel Management</p>
          <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', fontSize: '2.2rem', color: '#1c1917' }}>
            Officers
          </h2>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>
            {officers.length} officer{officers.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.3)' }}
        >
          <Plus size={15} /> Add Officer
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #f0e8e5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent mb-3"
              style={{ borderColor: '#c0392b', animation: 'spin 1s linear infinite' }} />
            <p className="text-sm font-semibold" style={{ color: '#a8a29e' }}>Loading officers...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
              <Users size={24} style={{ color: '#d4b8b3' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: '#a8a29e' }}>No officers registered</p>
            <p className="text-xs mt-1" style={{ color: '#c4b5b0' }}>Click "Add Officer" to add the first record</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr style={{ borderBottom: '1.5px solid #f5ede9', background: '#fdf9f8' }}>
                  {['Officer', 'Rank', 'Role / Assignment', 'Contact', 'Account No.', 'Actions'].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#a8a29e' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {officers.map((officer, idx) => (
                  <tr key={officer.id} className="officer-row"
                    style={{ borderBottom: idx !== officers.length - 1 ? '1px solid #faf5f3' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <OfficerAvatar
                          src={officer.profileImage}
                          name={officer.fullName}
                          size={40}
                          wrapStyle={{ border: '1.5px solid #f0e8e5' }}
                        />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#1c1917' }}>{officer.fullName}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{RANK_ABBREVIATIONS[officer.rank]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                        <Shield size={9} />{RANK_ABBREVIATIONS[officer.rank]}
                      </span>
                      <p className="text-[11px] mt-1" style={{ color: '#c4b5b0' }}>{officer.rank}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium" style={{ color: '#44403c' }}>{officer.roleAssignment}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: '#57534e' }}>
                        <Phone size={12} style={{ color: '#c4b5b0' }} />{officer.contactNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#78716c' }}>
                        <CreditCard size={11} style={{ color: '#d1c4be' }} />{officer.accountNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(officer)}
                          className="action-btn-edit flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200">
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(officer.id)}
                          className="action-btn-del flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(28,25,23,0.1)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-2xl mt-80 max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>

            {/* Modal Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 z-10"
              style={{ borderBottom: '1.5px solid #f5ede9' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
                  <Users size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>
                    {editingOfficer ? 'Editing Officer' : 'New Officer'}
                  </p>
                  <h3 className="font-bold text-sm" style={{ color: '#1c1917' }}>
                    {editingOfficer ? 'Update Officer Record' : 'Add New Officer'}
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

              {/* ── Profile Image ── */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                  Profile Image
                </label>

                <div className="flex gap-3 items-center">
                  {/* Preview */}
                  {formData.profileImage ? (
                    <OfficerAvatar
                      src={formData.profileImage}
                      name={formData.fullName || 'Preview'}
                      size={72}
                      circle
                      wrapStyle={{ border: '1.5px solid #ede8e5', flexShrink: 0 }}
                    />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#f5f0ed', border: '1.5px dashed #d8ccc8' }}>
                      <Users size={24} style={{ color: '#d4b8b3' }} />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                      style={{
                        background: uploading ? '#fdf3f0' : '#f5f0ed',
                        border: `1.5px solid ${uploading ? 'rgba(192,57,43,0.3)' : '#ede8e5'}`,
                        color: uploading ? '#c0392b' : '#78716c',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                            style={{ animation: 'spin 1s linear infinite' }} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={15} />
                          {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                        </>
                      )}
                    </button>
                    <p className="text-[10px]" style={{ color: '#c4b5b0' }}>
                      Any size — auto compressed before saving
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* ── Other fields ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Full Name</label>
                  <input type="text" className="modal-inp" value={formData.fullName}
                    onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    style={inputStyle} placeholder="Enter Name" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Rank</label>
                  <select className="modal-inp" value={formData.rank}
                    onChange={(e) => setFormData(p => ({ ...p, rank: e.target.value }))}
                    style={inputStyle} required>
                    {RANK_OPTIONS.map(rank => (
                      <option key={rank} value={rank}>{rank} ({RANK_ABBREVIATIONS[rank]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Role / Assignment</label>
                  <input type="text" className="modal-inp" value={formData.roleAssignment}
                    onChange={(e) => setFormData(p => ({ ...p, roleAssignment: e.target.value }))}
                    style={inputStyle} placeholder="e.g. Station Commander" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Contact Number</label>
                  <input type="tel" className="modal-inp" value={formData.contactNumber}
                    onChange={(e) => setFormData(p => ({ ...p, contactNumber: e.target.value }))}
                    style={inputStyle} placeholder="+63 912 345 6789" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Account Number</label>
                  <input type="text" className="modal-inp" value={formData.accountNumber}
                    onChange={(e) => setFormData(p => ({ ...p, accountNumber: e.target.value }))}
                    style={inputStyle} placeholder="BFP-CDO-001" required />
                </div>
              </div>

              {/* ── Submit ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  style={{
                    background: saving || uploading ? '#e8c4bc' : 'linear-gradient(135deg, #c0392b, #e67e22)',
                    boxShadow: '0 4px 14px rgba(192,57,43,0.25)',
                    cursor: saving || uploading ? 'not-allowed' : 'pointer',
                  }}>
                  {saving && (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                      style={{ animation: 'spin 1s linear infinite' }} />
                  )}
                  {uploading ? 'Processing image...' : saving ? 'Saving...' : editingOfficer ? 'Update Officer' : 'Add Officer'}
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