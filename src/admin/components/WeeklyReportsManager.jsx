import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, UploadCloud } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../../utils/types';
import { getWeeklyReports, saveWeeklyReports } from '../../utils/storage';
import { toast } from 'sonner';

export function WeeklyReportsManager() {
  const [reports, setReports] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    coverImage: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Event'
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(getWeeklyReports());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.coverImage) {
      toast.error('Please upload a cover image!');
      return;
    }

    if (editingReport) {
      const updated = reports.map(r => 
        r.id === editingReport.id ? { ...formData, id: editingReport.id } : r
      );
      saveWeeklyReports(updated);
      setReports(updated);
      toast.success('Report updated successfully!');
    } else {
      const newReport = {
        ...formData,
        id: Date.now().toString()
      };
      const updated = [...reports, newReport];
      saveWeeklyReports(updated);
      setReports(updated);
      toast.success('Report added successfully!');
    }

    resetForm();
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      coverImage: report.coverImage,
      title: report.title,
      description: report.description,
      date: report.date,
      category: report.category
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this report?')) {
      const updated = reports.filter(r => r.id !== id);
      saveWeeklyReports(updated);
      setReports(updated);
      toast.success('Report deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      coverImage: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Event'
    });
    setEditingReport(null);
    setIsFormOpen(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Event': return 'bg-blue-100 text-blue-800';
      case 'Training': return 'bg-green-100 text-green-800';
      case 'Advisory': return 'bg-yellow-100 text-yellow-800';
      case 'Achievement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, coverImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Reports Management</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Report
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
            <div className="relative h-48">
              <img
                src={report.coverImage}
                alt={report.title}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(report.category)}`}>
                {report.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
              <p className="text-xs text-gray-500 mb-4">
                {new Date(report.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(report)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No weekly reports yet. Add your first report!</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingReport ? 'Edit Weekly Report' : 'Add New Weekly Report'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-red-600 file:text-white file:font-semibold hover:file:bg-red-700 cursor-pointer"
                  />
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg shadow"
                    />
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Fire Safety Seminar at Local Schools"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Brief description of the activity..."
                  rows={4}
                  required
                />
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {editingReport ? 'Update Report' : 'Add Report'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                >
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
