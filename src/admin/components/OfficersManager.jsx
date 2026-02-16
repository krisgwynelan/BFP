import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, UploadCloud } from 'lucide-react';
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
    accountNumber: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = () => {
    setOfficers(getOfficers());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingOfficer) {
      const updated = officers.map(o =>
        o.id === editingOfficer.id ? { ...formData, id: editingOfficer.id } : o
      );
      saveOfficers(updated);
      setOfficers(updated);
      toast.success('Officer updated successfully!');
    } else {
      const newOfficer = { ...formData, id: Date.now().toString() };
      const updated = [...officers, newOfficer];
      saveOfficers(updated);
      setOfficers(updated);
      toast.success('Officer added successfully!');
    }

    resetForm();
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({ ...officer });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this officer?')) {
      const updated = officers.filter(o => o.id !== id);
      saveOfficers(updated);
      setOfficers(updated);
      toast.success('Officer deleted successfully!');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profileImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      profileImage: '',
      fullName: '',
      rank: 'Fire Officer I',
      roleAssignment: '',
      contactNumber: '',
      accountNumber: ''
    });
    setEditingOfficer(null);
    setIsFormOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Officers Management</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} /> Add Officer
        </button>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role/Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officers.map((officer) => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <img src={officer.profileImage} alt={officer.fullName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="font-medium text-gray-900">{officer.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                      {RANK_ABBREVIATIONS[officer.rank]}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{officer.rank}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{officer.roleAssignment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{officer.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{officer.accountNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    <button onClick={() => handleEdit(officer)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(officer.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingOfficer ? 'Edit Officer' : 'Add New Officer'}</h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                {formData.profileImage && (
                  <img src={formData.profileImage} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-2 border" />
                )}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <UploadCloud size={16} /> Upload
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Other Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  >
                    {RANK_OPTIONS.map(rank => (
                      <option key={rank} value={rank}>{rank} ({RANK_ABBREVIATIONS[rank]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role/Assignment</label>
                  <input
                    type="text"
                    value={formData.roleAssignment}
                    onChange={(e) => setFormData({ ...formData, roleAssignment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Station Commander"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="BFP-CDO-001"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  {editingOfficer ? 'Update Officer' : 'Add Officer'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors">
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
