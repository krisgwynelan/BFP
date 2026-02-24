// src/utils/storage.js
import { db } from "../firebase"; // adjust path if needed
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

/* ─────────────────────────────────────────────────────────────────
   OFFICERS
   Collection: /officers/{id}
───────────────────────────────────────────────────────────────── */

export const getOfficers = async () => {
  const snapshot = await getDocs(collection(db, "officers"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const saveOfficer = async (id, officerData) => {
  await setDoc(doc(db, "officers", id), officerData, { merge: true });
};

export const deleteOfficer = async (id) => {
  await deleteDoc(doc(db, "officers", id));
};

/* ─────────────────────────────────────────────────────────────────
   WEEKLY REPORTS
   Collection: /weeklyReports/{id}
───────────────────────────────────────────────────────────────── */

export const getWeeklyReports = async () => {
  const snapshot = await getDocs(collection(db, "weeklyReports"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const saveWeeklyReport = async (id, reportData) => {
  await setDoc(doc(db, "weeklyReports", id), reportData, { merge: true });
};

export const deleteWeeklyReport = async (id) => {
  await deleteDoc(doc(db, "weeklyReports", id));
};

/* ─────────────────────────────────────────────────────────────────
   CONTACT INFO
   Document: /settings/contact  (single document)
───────────────────────────────────────────────────────────────── */

const CONTACT_DOC = doc(db, "settings", "contact");

const CONTACT_DEFAULTS = {
  nationalEmergency: "",
  localHotline: "",
  email: "",
  facebookPage: "",
  location: "",
  officeHours: [],
  barangays: [],
};

export const getContactInfo = async () => {
  const snapshot = await getDoc(CONTACT_DOC);
  if (!snapshot.exists()) {
    // First time — seed with empty defaults
    await setDoc(CONTACT_DOC, CONTACT_DEFAULTS);
    return CONTACT_DEFAULTS;
  }
  return snapshot.data();
};

export const saveContactInfo = async (data) => {
  await setDoc(CONTACT_DOC, data, { merge: true });
};