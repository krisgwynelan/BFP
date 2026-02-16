const STORAGE_KEYS = {
  OFFICERS: 'bfp_officers',
  WEEKLY_REPORTS: 'bfp_weekly_reports',
  CONTACT_INFO: 'bfp_contact_info',
  ADMIN_PASSWORD: 'bfp_admin_password'
};

// Initialize with default data
const DEFAULT_OFFICERS = [
  {
    id: '1',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    fullName: 'Juan Donasco',
    rank: 'Senior Fire Inspector',
    roleAssignment: 'Station Commander',
    contactNumber: '+63 912 345 6789',
    accountNumber: 'BFP-CDO-001'
  },
  {
    id: '2',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    fullName: 'Maria Santos',
    rank: 'Senior Fire Officer I',
    roleAssignment: 'Operations Officer',
    contactNumber: '+63 912 345 6790',
    accountNumber: 'BFP-CDO-002'
  },
  {
    id: '3',
    profileImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
    fullName: 'Pedro Cruz',
    rank: 'Fire Officer III',
    roleAssignment: 'Fire Safety Inspector',
    contactNumber: '+63 912 345 6791',
    accountNumber: 'BFP-CDO-003'
  }
];

const DEFAULT_WEEKLY_REPORTS = [
  {
    id: '1',
    coverImage: 'https://images.unsplash.com/photo-1742578754019-d9c352bae2d0?w=800',
    title: 'Fire Safety Seminar at Local Schools',
    description: 'Conducted fire safety awareness seminar for 500+ students across three elementary schools in Cogon.',
    date: '2026-02-10',
    category: 'Training'
  },
  {
    id: '2',
    coverImage: 'https://images.unsplash.com/photo-1764239652391-e1153c215236?w=800',
    title: 'Emergency Response Exercise',
    description: 'Successfully completed quarterly emergency response drill with simulated building fire scenario.',
    date: '2026-02-08',
    category: 'Event'
  },
  {
    id: '3',
    coverImage: 'https://images.unsplash.com/photo-1766862769365-64368bf24df0?w=800',
    title: 'Community Fire Prevention Month',
    description: 'Celebrating Fire Prevention Month with community outreach programs and inspection drives.',
    date: '2026-02-05',
    category: 'Advisory'
  }
];

const DEFAULT_CONTACT_INFO = {
  id: '1',
  emergencyHotline: '(088) 856-1234',
  nationalEmergency: '911',
  localHotline: '(088) 856-FIRE',
  email: 'bfp.station1.cogon@bfp.gov.ph',
  facebookPage: 'fb.com/BFPCagayanDeOro',
  location: 'Capt. Vicente Roa, Brgy. 33, Cagayan de Oro City',
  officeHours: 'Open 24/7 for emergencies'
};

export const getOfficers = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.OFFICERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(DEFAULT_OFFICERS));
    return DEFAULT_OFFICERS;
  }
  return JSON.parse(stored);
};

export const saveOfficers = (officers) => {
  localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
};

export const getWeeklyReports = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY_REPORTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REPORTS, JSON.stringify(DEFAULT_WEEKLY_REPORTS));
    return DEFAULT_WEEKLY_REPORTS;
  }
  return JSON.parse(stored);
};

export const saveWeeklyReports = (reports) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_REPORTS, JSON.stringify(reports));
};

export const getContactInfo = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(DEFAULT_CONTACT_INFO));
    return DEFAULT_CONTACT_INFO;
  }
  return JSON.parse(stored);
};

export const saveContactInfo = (contactInfo) => {
  localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(contactInfo));
};

export const getAdminPassword = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
  return stored || 'admin123'; // Default password
};

export const setAdminPassword = (password) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
};
