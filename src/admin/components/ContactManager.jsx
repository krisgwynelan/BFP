import { useState, useEffect } from 'react';
import {
  Save, Edit, Plus, Trash2, X, AlertCircle, Globe,
  Phone, Mail, MapPin, Clock, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { getContactInfo, saveContactInfo } from '../../utils/storage';
import { toast } from 'sonner';

const EMPTY_HOUR = { type: '', time: '' };

// Always returns a safe object — officeHours and barangays are guaranteed arrays
function normalise(raw) {
  if (!raw) raw = {};
  return {
    id: raw.id || '1',
    nationalEmergency: raw.nationalEmergency || '',
    localHotline:      raw.localHotline      || '',
    email:             raw.email             || '',
    facebookPage:      raw.facebookPage      || '',
    location:          raw.location          || '',
    officeHours: Array.isArray(raw.officeHours) ? raw.officeHours : [],
    barangays:   Array.isArray(raw.barangays)   ? raw.barangays   : [],
  };
}

export function ContactManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState(null);
  const [newBarangay, setNewBarangay] = useState('');
  const [showHoursEditor, setShowHoursEditor] = useState(false);

  // ── Load from storage on mount ─────────────────────────────────────────────
  useEffect(() => {
    const saved = normalise(getContactInfo());
    setContact(saved);
    setFormData(JSON.parse(JSON.stringify(saved)));
  }, []);

  if (!contact || !formData) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: '#c0392b', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  // ── Save to localStorage → immediately visible on ContactPage ─────────────
  const handleSave = () => {
    const clean = normalise(formData);
    saveContactInfo(clean);
    setContact(JSON.parse(JSON.stringify(clean)));
    setFormData(JSON.parse(JSON.stringify(clean)));
    setIsEditing(false);
    setShowHoursEditor(false);
    toast.success('Contact information saved! Changes are now live on the public site.');
  };

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(contact)));
    setIsEditing(false);
    setShowHoursEditor(false);
  };

  // ── Generic field setter ───────────────────────────────────────────────────
  const setField = (key, value) =>
    setFormData(p => ({ ...p, [key]: value }));

  // ── Office Hours CRUD ──────────────────────────────────────────────────────
  const addHour = () =>
    setFormData(p => ({
      ...p,
      officeHours: [...(p.officeHours || []), { ...EMPTY_HOUR }],
    }));

  const updateHour = (idx, key, val) =>
    setFormData(p => {
      const hours = [...(p.officeHours || [])];
      hours[idx] = { ...hours[idx], [key]: val };
      return { ...p, officeHours: hours };
    });

  const removeHour = (idx) =>
    setFormData(p => ({
      ...p,
      officeHours: p.officeHours.filter((_, i) => i !== idx),
    }));

  // ── Barangay CRUD ──────────────────────────────────────────────────────────
  const addBarangay = () => {
    const name = newBarangay.trim();
    if (!name) return;
    if ((formData.barangays || []).includes(name)) {
      toast.error('Barangay already exists!');
      return;
    }
    setFormData(p => ({ ...p, barangays: [...(p.barangays || []), name] }));
    setNewBarangay('');
  };

  const removeBarangay = (idx) =>
    setFormData(p => ({
      ...p,
      barangays: p.barangays.filter((_, i) => i !== idx),
    }));

  // ── Shared styles ──────────────────────────────────────────────────────────
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

  const readonlyStyle = {
    background: '#fdf9f8',
    border: '1.5px solid #f5ede9',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#44403c',
  };

  const cardStyle = {
    background: 'white',
    border: '1.5px solid #f0e8e5',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  // Decide which data to show (live contact or in-progress formData)
  const displayed = isEditing ? formData : contact;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cm-inp:focus { border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.08) !important; }
        .field-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: #a8a29e; margin-bottom: 6px; }
        .hour-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: center; }
        .del-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(192,57,43,0.07); border: 1.5px solid rgba(192,57,43,0.18); color: #c0392b; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
        .del-btn:hover { background: rgba(192,57,43,0.14); }
        .bgy-tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px 5px 8px; border-radius: 8px; background: white; border: 1.5px solid #f0e8e5; font-size: 12px; font-weight: 600; color: #44403c; }
        .bgy-x { color: #c4b5b0; cursor: pointer; transition: color 0.15s; display: flex; align-items: center; }
        .bgy-x:hover { color: #c0392b; }
        .add-row-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; background: rgba(192,57,43,0.05); border: 1.5px dashed rgba(192,57,43,0.25); color: #c0392b; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .add-row-btn:hover { background: rgba(192,57,43,0.1); }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#c0392b' }}>
            Station Management
          </p>
          <h2 className="font-black leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif', letterSpacing: '0.05em", fontSize: '2.2rem', color: '#1c1917' }}>
            Contact Information
          </h2>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>
            Manage public-facing emergency contact details
          </p>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 4px 14px rgba(192,57,43,0.3)' }}>
              <Edit size={14} /> Edit Info
            </button>
          ) : (
            <>
              <button onClick={handleSave}
                className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', boxShadow: '0 4px 14px rgba(39,174,96,0.25)' }}>
                <Save size={14} /> Save Changes
              </button>
              <button onClick={handleCancel}
                className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: '#f5f0ed', border: '1.5px solid #ede8e5', color: '#78716c' }}>
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit mode notice */}
      {isEditing && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6"
          style={{ background: 'rgba(39,174,96,0.07)', border: '1.5px solid rgba(39,174,96,0.2)' }}>
          <Edit size={13} style={{ color: '#27ae60', flexShrink: 0 }} />
          <p className="text-xs font-semibold" style={{ color: '#27ae60' }}>
            Edit mode — Save when done. Changes will appear instantly on the public Contact page.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ══ PREVIEW CARD ══ */}
        <div className="xl:col-span-1">
          <div className="sticky top-6 rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1.5px solid #f0e8e5', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22, #f39c12)' }} />
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#c0392b' }}>
                Live Preview
              </p>

              {/* 911 */}
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid #f5ede9' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', boxShadow: '0 3px 10px rgba(192,57,43,0.28)' }}>
                  <Phone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>Emergency</p>
                  <p className="font-black text-2xl leading-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em', color: '#1c1917' }}>
                    {contact.nationalEmergency || '—'}
                  </p>
                </div>
              </div>

              {[
                { icon: MapPin, label: 'Address', val: contact.location },
                { icon: Phone, label: 'Hotline', val: contact.localHotline },
                { icon: Mail, label: 'Email', val: contact.email },
                { icon: Globe, label: 'Facebook', val: contact.facebookPage },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(192,57,43,0.07)' }}>
                    <Icon size={11} style={{ color: '#c0392b' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#c4b5b0' }}>{label}</p>
                    <p className="text-xs font-medium mt-0.5 break-all leading-snug"
                      style={{ color: val ? '#44403c' : '#d4b8b3', fontStyle: val ? 'normal' : 'italic' }}>
                      {val || 'Not set'}
                    </p>
                  </div>
                </div>
              ))}

              {contact.officeHours?.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f5ede9' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: '#c4b5b0' }}>
                    <Clock size={9} className="inline mr-1" /> Office Hours
                  </p>
                  {contact.officeHours.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span style={{ color: '#78716c' }}>{h.type}</span>
                      <span className="font-semibold"
                        style={{ color: h.time === '24 / 7' ? '#16a34a' : h.time === 'Closed' ? '#c0392b' : '#1c1917' }}>
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid #f5ede9' }}>
                <Shield size={11} style={{ color: '#c0392b' }} />
                <p className="text-[11px] font-semibold" style={{ color: '#a8a29e' }}>
                  {contact.barangays?.length || 0} barangays under jurisdiction
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ EDITOR PANELS ══ */}
        <div className="xl:col-span-2 space-y-5">

          {/* ── BASIC FIELDS ── */}
          <div style={cardStyle}>
            <div className="px-6 py-4" style={{ borderBottom: '1.5px solid #f5ede9', background: '#fdf9f8' }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>
                Basic Contact Details
              </p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'nationalEmergency', label: 'National Emergency Number', icon: Phone, placeholder: '911', accent: '#c0392b' },
                { key: 'localHotline',      label: 'Local Station Hotline',     icon: Phone, placeholder: '(088) 856-FIRE' },
                { key: 'email',             label: 'Email Address',             icon: Mail,  placeholder: 'station@bfp.gov.ph' },
                { key: 'facebookPage',      label: 'Facebook Page URL',         icon: Globe, placeholder: 'facebook.com/BFPCogonStation' },
                { key: 'location',          label: 'Station Address',           icon: MapPin, placeholder: 'Street, Barangay, City' },
              ].map(({ key, label, icon: Icon, placeholder, accent }) => (
                <div key={key}>
                  <label className="field-label">
                    <Icon size={9} className="inline mr-1" style={{ color: accent || '#d4b8b3' }} />
                    {label}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="cm-inp"
                      value={formData[key] || ''}
                      onChange={e => setField(key, e.target.value)}
                      style={{ ...inputStyle, ...(accent ? { borderColor: `${accent}30` } : {}) }}
                      placeholder={placeholder}
                    />
                  ) : (
                    <p style={readonlyStyle}>
                      {contact[key] || <span style={{ color: '#c4b5b0', fontStyle: 'italic', fontSize: '12px' }}>Not set</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── OFFICE HOURS ── */}
          <div style={cardStyle}>
            <button
              className="w-full flex items-center justify-between px-6 py-4 transition-colors"
              onClick={() => setShowHoursEditor(v => !v)}
              style={{ background: '#fdf9f8', borderBottom: showHoursEditor ? '1.5px solid #f5ede9' : 'none', cursor: 'pointer' }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>
                <Clock size={10} className="inline mr-1.5" />
                Office Hours &nbsp;·&nbsp; {displayed.officeHours?.length || 0} entries
              </p>
              {showHoursEditor
                ? <ChevronUp size={15} style={{ color: '#a8a29e' }} />
                : <ChevronDown size={15} style={{ color: '#a8a29e' }} />}
            </button>

            {showHoursEditor && (
              <div className="p-6 space-y-3">
                {isEditing && (
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#c4b5b0' }}>Day / Period</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#c4b5b0' }}>Time</p>
                  </div>
                )}

                {displayed.officeHours?.map((hour, idx) => (
                  <div key={idx} className="hour-grid">
                    {isEditing ? (
                      <>
                        <input className="cm-inp" type="text" value={hour.type}
                          onChange={e => updateHour(idx, 'type', e.target.value)}
                          style={inputStyle} placeholder="e.g. Monday – Friday" />
                        <input className="cm-inp" type="text" value={hour.time}
                          onChange={e => updateHour(idx, 'time', e.target.value)}
                          style={inputStyle} placeholder="e.g. 8:00 AM – 5:00 PM" />
                        <button onClick={() => removeHour(idx)} className="del-btn">
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <div className="col-span-3 flex justify-between items-center px-3 py-2.5 rounded-xl"
                        style={{ background: '#fdf9f8', border: '1.5px solid #f5ede9' }}>
                        <span className="text-sm" style={{ color: '#57534e' }}>{hour.type}</span>
                        <span className="text-sm font-bold"
                          style={{ color: hour.time === '24 / 7' ? '#16a34a' : hour.time === 'Closed' ? '#c0392b' : '#1c1917' }}>
                          {hour.time}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <button onClick={addHour} className="add-row-btn">
                    <Plus size={13} /> Add Office Hour Row
                  </button>
                )}

                {!displayed.officeHours?.length && !isEditing && (
                  <p className="text-sm py-3 text-center" style={{ color: '#c4b5b0', fontStyle: 'italic' }}>
                    No office hours set — click Edit to add
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── BARANGAYS ── */}
          <div style={cardStyle}>
            <div className="px-6 py-4" style={{ borderBottom: '1.5px solid #f5ede9', background: '#fdf9f8' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>
                  <Shield size={10} className="inline mr-1.5" />
                  Barangay Coverage
                </p>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: '1.5px solid rgba(192,57,43,0.15)' }}>
                  {displayed.barangays?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-6">
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="cm-inp flex-1"
                    style={{ ...inputStyle, flex: 1 }}
                    value={newBarangay}
                    onChange={e => setNewBarangay(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBarangay(); } }}
                    placeholder="Type barangay name, then press Enter or click Add"
                  />
                  <button onClick={addBarangay}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
                    <Plus size={13} /> Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {displayed.barangays?.map((b, i) => (
                  <span key={i} className="bgy-tag">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(192,57,43,0.45)' }} />
                    {b}
                    {isEditing && (
                      <button onClick={() => removeBarangay(i)} className="bgy-x">
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
                {!displayed.barangays?.length && (
                  <p className="text-sm" style={{ color: '#c4b5b0', fontStyle: 'italic' }}>
                    No barangays added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── INFO NOTE ── */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(192,57,43,0.04)', border: '1.5px solid rgba(192,57,43,0.12)' }}>
            <AlertCircle size={13} style={{ color: '#c0392b', marginTop: 1, flexShrink: 0 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#78716c' }}>
              Data is stored under{' '}
              <code style={{ background: '#f5ede9', padding: '1px 5px', borderRadius: '4px', color: '#c0392b', fontSize: '11px' }}>
                bfp_contact_info
              </code>{' '}
              in localStorage. The public <strong>Contact page</strong> reads from the same key every 2 seconds, so updates appear within moments of saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}