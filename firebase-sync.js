import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEJJuIWsxmJzArbaoq7Bn0jbC9XyBONdY",
  authDomain: "nbe-sales-41784.firebaseapp.com",
  projectId: "nbe-sales-41784",
  storageBucket: "nbe-sales-41784.firebasestorage.app",
  messagingSenderId: "637487106411",
  appId: "1:637487106411:web:30f32dc9aa8b2b722ee42e",
  measurementId: "G-V4RWFYQ85R"
};

const panel = document.createElement("section");
panel.className = "nbe-firebase-panel";
panel.innerHTML =
  '<div class="nbe-firebase-head"><div><h3>ربط Firebase</h3><p>المرحلة الأولى: تسجيل Google واختبار الاتصال الآمن فقط</p></div><span class="nbe-firebase-mark">CLOUD</span></div>' +
  '<div id="nbeFirebaseStatus" class="nbe-firebase-status" role="status">جارٍ تجهيز الاتصال...</div>' +
  '<div id="nbeFirebaseAccount" class="nbe-firebase-account">لم يتم تسجيل الدخول</div>' +
  '<div class="nbe-firebase-actions">' +
    '<button type="button" class="btn primary" id="nbeGoogleLogin">تسجيل الدخول باستخدام Google</button>' +
    '<button type="button" class="btn secondary" id="nbeFirebaseTest" disabled>اختبار اتصال Firestore</button>' +
    '<button type="button" class="btn light-btn" id="nbeGoogleLogout" hidden>تسجيل الخروج</button>' +
  '</div>' +
  '<p class="nbe-firebase-note">لن يتم رفع تقارير المبيعات أو العملاء في هذه المرحلة. اختبار الاتصال ينشئ سجلًا تجريبيًا مؤقتًا ثم يحذفه. سنضيف المزامنة لاحقًا بعد تشفير البيانات على جهازك.</p>';
const style = document.createElement("style");
style.textContent =
  ".nbe-firebase-panel{margin-top:22px;padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--bg)}" +
  ".nbe-firebase-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}" +
  ".nbe-firebase-head h3{margin:0;color:var(--green);font-size:16px}.nbe-firebase-head p{margin:6px 0 0;color:var(--muted);font-size:12px}" +
  ".nbe-firebase-mark{font-size:10px;letter-spacing:1px;font-weight:bold;color:var(--green);background:rgba(8,116,67,.1);padding:7px 10px;border-radius:20px}" +
  ".nbe-firebase-status{margin-top:15px;padding:11px 13px;border-radius:10px;background:var(--card);border:1px solid var(--border);font-size:13px;line-height:1.7}" +
  ".nbe-firebase-status.ok{border-color:#8ac9a8;color:#087443}.nbe-firebase-status.error{border-color:#e6aaa4;color:#b43d31}" +
  ".nbe-firebase-account{margin-top:9px;color:var(--muted);font-size:12px;overflow-wrap:anywhere}" +
  ".nbe-firebase-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.nbe-firebase-actions button:disabled{opacity:.55;cursor:not-allowed}" +
  ".nbe-firebase-note{margin:13px 0 0;color:var(--muted);font-size:11px;line-height:1.9}";
document.head.append(style);
const settingsPanel = document.querySelector(".settings-panel");
if (settingsPanel) settingsPanel.append(panel);

const statusEl = document.getElementById("nbeFirebaseStatus");
const accountEl = document.getElementById("nbeFirebaseAccount");
const loginBtn = document.getElementById("nbeGoogleLogin");
const testBtn = document.getElementById("nbeFirebaseTest");
const logoutBtn = document.getElementById("nbeGoogleLogout");

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "nbe-firebase-status" + (type ? " " + type : "");
}
function explainError(error) {
  const code = error && error.code ? error.code : "";
  const messages = {
    "auth/unauthorized-domain": "الدومين غير معتمد. راجع Authorized domains في Firebase Authentication.",
    "auth/popup-blocked": "المتصفح منع نافذة Google. حاول مرة أخرى أو اسمح بالنوافذ المنبثقة.",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.",
    "auth/network-request-failed": "الاتصال بالإنترنت غير مستقر. حاول مرة أخرى.",
    "permission-denied": "تم تسجيل الدخول، لكن قواعد Firestore لا تسمح بالعملية. راجع قواعد Rules التي نشرناها.",
    "unavailable": "خدمة Firestore غير متاحة حاليًا. تحقق من الإنترنت وحاول مرة أخرى."
  };
  return messages[code] || (error && error.message) || "حدث خطأ غير متوقع.";
}

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = "ar";
  db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  getRedirectResult(auth).catch(error => setStatus(explainError(error), "error"));

  onAuthStateChanged(auth, user => {
    const signedIn = !!user;
    loginBtn.hidden = signedIn;
    testBtn.disabled = !signedIn;
    logoutBtn.hidden = !signedIn;
    accountEl.textContent = signedIn
      ? "تم تسجيل الدخول: " + (user.displayName || user.email || "حساب Google")
      : "لم يتم تسجيل الدخول";
    if (signedIn) setStatus("تم الاتصال بحساب Google بنجاح. يمكنك الآن اختبار صلاحية Firestore.", "ok");
    else setStatus("سجّل الدخول بحساب Google للانتقال إلى اختبار قاعدة البيانات.");
  });

  loginBtn.addEventListener("click", async () => {
    loginBtn.disabled = true;
    setStatus("جارٍ فتح تسجيل الدخول باستخدام Google...");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error && (error.code === "auth/popup-blocked" || error.code === "auth/operation-not-supported-in-this-environment")) {
        await signInWithRedirect(auth, provider);
        return;
      }
      setStatus(explainError(error), "error");
    } finally {
      loginBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      setStatus("تم تسجيل الخروج من Google.");
    } catch (error) {
      setStatus(explainError(error), "error");
    }
  });

  testBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatus("سجّل الدخول أولًا.", "error");
      return;
    }
    testBtn.disabled = true;
    setStatus("جارٍ اختبار الكتابة والقراءة والحذف في Firestore...");
    const testId = "connection-test-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const testRef = doc(db, "users", user.uid, "sync", testId);
    try {
      await setDoc(testRef, {
        app: "NBE Sales",
        test: true,
        createdAt: serverTimestamp()
      });
      const result = await getDoc(testRef);
      if (!result.exists() || result.data().app !== "NBE Sales" || result.data().test !== true) {
        throw new Error("لم يتم التحقق من قراءة سجل الاختبار.");
      }
      await deleteDoc(testRef);
      setStatus("نجح الاختبار! تسجيل الدخول والكتابة والقراءة والحذف تعمل، وتم حذف سجل الاختبار المؤقت.", "ok");
    } catch (error) {
      setStatus(explainError(error), "error");
    } finally {
      testBtn.disabled = !auth.currentUser;
    }
  });

} catch (error) {
  setStatus("تعذر تهيئة Firebase: " + explainError(error), "error");
  loginBtn.disabled = true;
  testBtn.disabled = true;
}
