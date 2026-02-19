const STORAGE_KEYS = {
  OFFICERS: "bfp_officers",
  WEEKLY_REPORTS: "bfp_weekly_reports",
  CONTACT_INFO: "bfp_contact_info",
  ADMIN_PASSWORD: "bfp_admin_password",
};

/* ================= EMPTY DEFAULTS ================= */

const DEFAULT_CONTACT_INFO = {
  id: "1",
  
  nationalEmergency: "",
  localHotline: "",
  email: "",
  facebookPage: "",
  location: "",
  officeHours: [],
  barangays: [],
};

const DEFAULT_WEEKLY_REPORTS = []; // ✅ EMPTY (NO FIXED DATA)
const DEFAULT_OFFICERS = [];       // ✅ EMPTY (SAFE)

/* ================= CONTACT ================= */

export const getContactInfo = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
  if (!stored) {
    localStorage.setItem(
      STORAGE_KEYS.CONTACT_INFO,
      JSON.stringify(DEFAULT_CONTACT_INFO)
    );
    return DEFAULT_CONTACT_INFO;
  }
  return JSON.parse(stored);
};

export const saveContactInfo = (contactInfo) => {
  localStorage.setItem(
    STORAGE_KEYS.CONTACT_INFO,
    JSON.stringify(contactInfo)
  );
};

/* ================= WEEKLY REPORTS ================= */

export const getWeeklyReports = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY_REPORTS);
  if (!stored) {
    localStorage.setItem(
      STORAGE_KEYS.WEEKLY_REPORTS,
      JSON.stringify(DEFAULT_WEEKLY_REPORTS)
    );
    return DEFAULT_WEEKLY_REPORTS;
  }
  return JSON.parse(stored);
};

export const saveWeeklyReports = (reports) => {
  localStorage.setItem(
    STORAGE_KEYS.WEEKLY_REPORTS,
    JSON.stringify(reports)
  );
};

/* ================= OFFICERS ================= */

export const getOfficers = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.OFFICERS);
  if (!stored) {
    localStorage.setItem(
      STORAGE_KEYS.OFFICERS,
      JSON.stringify(DEFAULT_OFFICERS)
    );
    return DEFAULT_OFFICERS;
  }
  return JSON.parse(stored);
};

export const saveOfficers = (officers) => {
  localStorage.setItem(
    STORAGE_KEYS.OFFICERS,
    JSON.stringify(officers)
  );
};

/* ================= ADMIN PASSWORD ================= */

export const getAdminPassword = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || "admin123";
};

export const setAdminPassword = (password) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
};
