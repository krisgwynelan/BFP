import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, UploadCloud, Users, Phone, CreditCard, Shield, Search } from 'lucide-react';
import { RANK_OPTIONS, RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers, saveOfficers } from '../../utils/storage';
import { toast } from 'sonner';

export function OfficersManager() {
  const [officers, setOfficers] = useState([]);
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
  const loadOfficers = () => setOfficers(getOfficers());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOfficer) {
      const updated = officers.map(o => o.id === editingOfficer.id ? { ...formData, id: editingOfficer.id } : o);
      saveOfficers(updated); setOfficers(updated); toast.success('Officer updated successfully!');
    } else {
      const newOfficer = { ...formData, id: Date.now().toString() };
      const updated = [...officers, newOfficer];
      saveOfficers(updated); setOfficers(updated); toast.success('Officer added successfully!');
    }
    resetForm();
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer); setFormData({ ...officer }); setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this officer?')) {
      const updated = officers.filter(o => o.id !== id);
      saveOfficers(updated); setOfficers(updated); toast.success('Officer deleted successfully!');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFormData(p => ({ ...p, profileImage: event.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ profileImage: '', fullName: '', rank: 'Fire Officer I', roleAssignment: '', contactNumber: '', accountNumber: '' });
    setEditingOfficer(null); setIsFormOpen(false);
  };

  const AvatarFallback = ({ name }) => {
    const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?';
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ background: 'linear-gradient(135deg, rgba(192,57,43,0.12), rgba(230,126,34,0.12))', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
        {initials}
      </div>
    );
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
      `}</style>

      {/* Header */}
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

      {/* Table container */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #f0e8e5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {officers.length === 0 ? (
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
                    {/* Officer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {officer.profileImage ? (
                          <img src={officer.profileImage} alt={officer.fullName}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                            style={{ border: '1.5px solid #f0e8e5' }} />
                        ) : (
                          <AvatarFallback name={officer.fullName} />
                        )}
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#1c1917' }}>{officer.fullName}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{RANK_ABBREVIATIONS[officer.rank]}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                        <Shield size={9} />{RANK_ABBREVIATIONS[officer.rank]}
                      </span>
                      <p className="text-[11px] mt-1" style={{ color: '#c4b5b0' }}>{officer.rank}</p>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium" style={{ color: '#44403c' }}>{officer.roleAssignment}</span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: '#57534e' }}>
                        <Phone size={12} style={{ color: '#c4b5b0' }} />{officer.contactNumber}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#78716c' }}>
                        <CreditCard size={11} style={{ color: '#d1c4be' }} />{officer.accountNumber}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(officer)}
                          className="action-btn-edit flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(officer.id)}
                          className="action-btn-del flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
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

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>

            {/* Modal header */}
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
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Profile Image */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                  Profile Image
                </label>
                <div className="flex gap-3 items-center">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      style={{ border: '1.5px solid #ede8e5' }} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#f5f0ed', border: '1.5px dashed #e8d8d3' }}>
                      <Users size={22} style={{ color: '#d4b8b3' }} />
                    </div>
                  )}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={formData.profileImage}
                      onChange={(e) => setFormData(p => ({ ...p, profileImage: e.target.value }))}
                      className="modal-inp flex-1 min-w-0"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl shrink-0 transition-all"
                      style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}
                    >
                      <UploadCloud size={14} /> Upload
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>Full Name</label>
                  <input type="text" className="modal-inp" value={formData.fullName}
                    onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    style={inputStyle} placeholder="e.g. Juan M. Dela Cruz" required />
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

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 text-white font-bold py-3 rounded-xl text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.25)' }}>
                  {editingOfficer ? 'Update Officer' : 'Add Officer'}
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