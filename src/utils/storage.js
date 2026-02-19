// src/utils/storage.js
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";

/* ================= OFFICERS ================= */

const officersCol = collection(db, "officers");

export const getOfficers = async () => {
  const snapshot = await getDocs(officersCol);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
};

export const saveOfficer = async (id, officerData) => {
  await setDoc(doc(db, "officers", id), officerData, { merge: true });
};

export const deleteOfficer = async (id) => {
  await deleteDoc(doc(db, "officers", id));
};

/* ================= WEEKLY REPORTS ================= */

const reportsCol = collection(db, "weeklyReports");

export const getWeeklyReports = async () => {
  const snapshot = await getDocs(reportsCol);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
};

export const saveWeeklyReport = async (id, reportData) => {
  await setDoc(doc(db, "weeklyReports", id), reportData, { merge: true });
};

export const deleteWeeklyReport = async (id) => {
  await deleteDoc(doc(db, "weeklyReports", id));
};

/* ================= CONTACT INFO ================= */

const contactDoc = doc(db, "settings", "contact");

export const getContactInfo = async () => {
  const snapshot = await getDoc(contactDoc);
  if (!snapshot.exists()) {
    const empty = {
      nationalEmergency: "",
      localHotline: "",
      email: "",
      facebookPage: "",
      location: "",
      officeHours: [],
      barangays: [],
    };
    await setDoc(contactDoc, empty);
    return empty;
  }
  return snapshot.data();
};

export const saveContactInfo = async (data) => {
  await setDoc(contactDoc, data, { merge: true });
};

/* ================= ADMIN PASSWORD ================= */

const adminPassDoc = doc(db, "settings", "adminPassword");

export const getAdminPassword = async () => {
  const snapshot = await getDoc(adminPassDoc);
  return snapshot.exists() ? snapshot.data().password : "admin123";
};

export const setAdminPassword = async (password) => {
  await setDoc(adminPassDoc, { password });
};
