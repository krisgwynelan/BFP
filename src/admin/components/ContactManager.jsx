import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getContactInfo, saveContactInfo } from '../../utils/storage';
import { toast } from 'sonner';

export function ContactManager() {
  const [formData, setFormData] = useState({
    id: '1',
    emergencyHotline: '',
    nationalEmergency: '',
    localHotline: '',
    email: '',
    facebookPage: '',
    location: '',
    officeHours: ''
  });

  useEffect(() => {
    const contactInfo = getContactInfo();
    setFormData(contactInfo);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveContactInfo(formData);
    toast.success('Contact information updated successfully!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information Management</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National Emergency Number
              </label>
              <input
                type="text"
                value={formData.nationalEmergency}
                onChange={(e) => setFormData({ ...formData, nationalEmergency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="911"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Hotline
              </label>
              <input
                type="text"
                value={formData.localHotline}
                onChange={(e) => setFormData({ ...formData, localHotline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="(088) 856-FIRE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Hotline
              </label>
              <input
                type="text"
                value={formData.emergencyHotline}
                onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="(088) 856-1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="bfp.station1.cogon@bfp.gov.ph"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Page
              </label>
              <input
                type="text"
                value={formData.facebookPage}
                onChange={(e) => setFormData({ ...formData, facebookPage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="fb.com/BFPCagayanDeOro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Hours
              </label>
              <input
                type="text"
                value={formData.officeHours}
                onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Open 24/7 for emergencies"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location/Address
            </label>
            <textarea
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Capt. Vicente Roa, Brgy. 33, Cagayan de Oro City"
              rows={2}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Save size={20} />
              Save Contact Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
