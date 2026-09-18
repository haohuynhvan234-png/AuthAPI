import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

let firebaseApp = null;

const getFirebaseApp = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = admin.getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      const serviceAccount = typeof raw === "string" ? JSON.parse(raw) : raw;

      firebaseApp = admin.initializeApp({
        credential: admin.cert(serviceAccount),
      });
      return firebaseApp;
    } catch (error) {
      console.error(
        "[Firebase Error] Không thể parse FIREBASE_SERVICE_ACCOUNT:",
        error.message,
      );
      return null;
    }
  }

  console.warn(
    "[Firebase Warning] Thiếu biến môi trường FIREBASE_SERVICE_ACCOUNT.",
  );
  return null;
};

export const getAdminAuth = () => {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase Admin chưa được khởi tạo. Vui lòng kiểm tra biến FIREBASE_SERVICE_ACCOUNT.");
  }
  return getAuth(app);
};

export default getFirebaseApp;