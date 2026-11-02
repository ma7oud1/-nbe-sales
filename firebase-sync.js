import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEJJuIWsxmJzArbaoq7Bn0jb9C9XyBONdY",
  authDomain: "nbe-sales-41784.firebaseapp.com",
  projectId: "nbe-sales-41784",
  storageBucket: "nbe-sales-41784.firebasestorage.app",
  messagingSenderId: "637487106411",
  appId: "1:637487106411:web:30f32dc9aa8b2b722ee42e",
  measurementId: "G-V4RWFYQ85R"
};

const STORAGE_KEYS = {
  reports: "NBE_SALES_REPORTS_V1",
  targets: "NBE_SALES_TARGETS_V1",
  followups: "NBE_SALES_FOLLOWUPS_V1",
  crm: "nbe_crm_demo_customers_v1"
};
const BASELINE_PREFIX = "NBE_SALES_SYNC_BASELINE_V1_";
const KDF_ITERATIONS = 310000;

const panel = document.createElement("section");
panel.className = "nbe-firebase-panel";
panel.innerHTML =
  '<div class="nbe-firebase-head"><div><h3>ربط Firebase والمزامنة الآمنة</h3><p>تسجيل Google ومزامنة يدوية مشفرة بين أجهزتك</p></div><span class="nbe-firebase-mark">CLOUD</span></div>' +
  '<div id="nbeFirebaseStatus" class="nbe-firebase-status" role="status">جارٍ تجهيز الاتصال...</div>' +
  '<div id="nbeFirebaseAccount" class="nbe-firebase-account">لم يتم تسجيل الدخول</div>' +
  '<div class="nbe-firebase-actions"><button type="button" class="btn primary" id="nbeGoogleLogin">تسجيل الدخول باستخدام Google</button><button type="button" class="btn secondary" id="nbeFirebaseTest" disabled>اختبار اتصال Firestore</button><button type="button" class="btn light-btn" id="nbeGoogleLogout" hidden>تسجيل الخروج</button></div>' +
  '<div class="nbe-sync-crypto"><h4>اختبار تشفير المزامنة</h4><p>اختبار محلي فقط: لا يتم حفظ كلمة المرور أو رفع أي بيانات.</p><label for="nbeSyncPass">كلمة مرور الاختبار (12 حرفًا على الأقل)</label><input id="nbeSyncPass" type="password" minlength="12" autocomplete="new-password" placeholder="اكتب كلمة مرور تجريبية"><label for="nbeSyncPassConfirm">تأكيد كلمة المرور</label><input id="nbeSyncPassConfirm" type="password" minlength="12" autocomplete="new-password" placeholder="أعد كتابة كلمة المرور"><button type="button" class="btn secondary" id="nbeSyncCryptoTest">اختبار التشفير محليًا</button></div>' +
  '<div class="nbe-sync-live"><h4>المزامنة المشفرة بين الأجهزة</h4><p>استخدم نفس كلمة المرور على أجهزتك. لا تُحفظ كلمة المرور ولا تُرسل إلى Google؛ البيانات تُشفّر على جهازك قبل رفعها.</p><label for="nbeSyncRunPass">كلمة مرور المزامنة (12 حرفًا على الأقل)</label><input id="nbeSyncRunPass" type="password" minlength="12" autocomplete="new-password" placeholder="أدخل كلمة مرور المزامنة"><button type="button" class="btn primary" id="nbeSyncRun" disabled>فحص ومزامنة الآن</button></div>' +
  '<p class="nbe-firebase-note">المزامنة يدوية فقط ولا تعمل في الخلفية. لا تُرفع البيانات إلا بعد تسجيل الدخول والضغط على زر المزامنة. عند وجود تعديلين مختلفين على جهازين، تتوقف المزامنة بدل استبدال أحدهما تلقائيًا. لن تُستبدل بيانات جهازك عند الاستعادة إلا بعد تأكيد واضح. التشفير يحمي النسخة السحابية؛ أما التخزين المحلي في المتصفح فيظل كما هو حاليًا.</p>';
const style = document.createElement("style");
style.textContent =
  ".nbe-firebase-panel{margin-top:22px;padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--bg)}" +
  ".nbe-firebase-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}" +
  ".nbe-firebase-head h3{margin:0;color:var(--green);font-size:16px}.nbe-firebase-head p{margin:6px 0 0;color:var(--muted);font-size:12px}" +
  ".nbe-firebase-mark{font-size:10px;letter-spacing:1px;font-weight:bold;color:var(--green);background:rgba(8,116,67,.1);padding:7px 10px;border-radius:20px}" +
  ".nbe-firebase-status{margin-top:15px;padding:11px 13px;border-radius:10px;background:var(--card);border:1px solid var(--border);font-size:13px;line-height:1.8;overflow-wrap:anywhere}.nbe-firebase-status.ok{border-color:#8ac9a8;color:#087443}.nbe-firebase-status.error{border-color:#e6aaa4;color:#b43d31}" +
  ".nbe-firebase-account{margin-top:9px;color:var(--muted);font-size:12px;overflow-wrap:anywhere}.nbe-firebase-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.nbe-firebase-actions button:disabled,.nbe-sync-live button:disabled{opacity:.55;cursor:not-allowed}" +
  ".nbe-firebase-note{margin:13px 0 0;color:var(--muted);font-size:11px;line-height:1.9}.nbe-sync-crypto,.nbe-sync-live{display:grid;gap:8px;margin-top:18px;padding-top:15px;border-top:1px solid var(--border)}" +
  ".nbe-sync-crypto h4,.nbe-sync-live h4{margin:0;color:var(--green);font-size:14px}.nbe-sync-crypto p,.nbe-sync-live p{margin:0;color:var(--muted);font-size:11px;line-height:1.9}.nbe-sync-crypto label,.nbe-sync-live label{font-size:12px;font-weight:700;color:var(--text)}" +
  ".nbe-sync-crypto input,.nbe-sync-live input{width:100%;box-sizing:border-box;padding:11px;border:1px solid var(--border);border-radius:9px;background:var(--card);color:var(--text);direction:ltr;text-align:left}";
document.head.append(style);
const settingsPanel = document.querySelector(".settings-panel");
if (settingsPanel) settingsPanel.append(panel);

const statusEl = document.getElementById("nbeFirebaseStatus");
const accountEl = document.getElementById("nbeFirebaseAccount");
const loginBtn = document.getElementById("nbeGoogleLogin");
const testBtn = document.getElementById("nbeFirebaseTest");
const logoutBtn = document.getElementById("nbeGoogleLogout");
const cryptoPass = document.getElementById("nbeSyncPass");
const cryptoConfirm = document.getElementById("nbeSyncPassConfirm");
const cryptoTestBtn = document.getElementById("nbeSyncCryptoTest");
const syncPass = document.getElementById("nbeSyncRunPass");
const syncBtn = document.getElementById("nbeSyncRun");

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
    "permission-denied": "تم تسجيل الدخول، لكن قواعد Firestore لا تسمح بالعملية. راجع قواعد Rules.",
    "unavailable": "خدمة Firestore غير متاحة حاليًا. تحقق من الإنترنت وحاول مرة أخرى."
  };
  return messages[code] || (error && error.message) || "حدث خطأ غير متوقع.";
}

let app, auth, db;
function bytesToBase64(bytes) {
  let binary = "";
  new Uint8Array(bytes).forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}
function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
function randomId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, "0")).join("");
}
async function deriveEncryptionKey(password, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}
async function digestSnapshot(snapshot) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(snapshot)));
  return bytesToBase64(digest);
}
function readLocalSnapshot() {
  const values = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (name === "reports" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) throw new Error("صيغة تقارير المبيعات المحلية غير سليمة؛ لم يتم رفع أي شيء.");
      if (name === "targets" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) throw new Error("صيغة المستهدفات المحلية غير سليمة؛ لم يتم رفع أي شيء.");
      if ((name === "followups" || name === "crm") && !Array.isArray(parsed)) throw new Error("صيغة سجل العملاء أو المتابعات غير سليمة؛ لم يتم رفع أي شيء.");
    }
    values[name] = raw;
  });
  return { format: "NBE-SALES-ENCRYPTED-SYNC", version: 1, values };
}
function validateRemoteSnapshot(snapshot) {
  if (!snapshot || snapshot.format !== "NBE-SALES-ENCRYPTED-SYNC" || snapshot.version !== 1 || !snapshot.values) throw new Error("نسخة السحابة غير متوافقة أو تالفة. لم يتم تغيير البيانات المحلية.");
  Object.entries(STORAGE_KEYS).forEach(([name]) => {
    const raw = snapshot.values[name];
    if (raw !== null && typeof raw !== "string") throw new Error("محتوى النسخة غير صالح. لم يتم تغيير البيانات المحلية.");
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (name === "reports" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) throw new Error("بيانات التقارير في النسخة غير سليمة.");
      if (name === "targets" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) throw new Error("بيانات المستهدفات في النسخة غير سليمة.");
      if ((name === "followups" || name === "crm") && !Array.isArray(parsed)) throw new Error("بيانات العملاء أو المتابعات في النسخة غير سليمة.");
    }
  });
}
function snapshotSummary(snapshot) {
  const v = snapshot.values;
  let reports = {}, followups = [], crm = [];
  try { reports = JSON.parse(v.reports || "{}"); } catch (_) {}
  try { followups = JSON.parse(v.followups || "[]"); } catch (_) {}
  try { crm = JSON.parse(v.crm || "[]"); } catch (_) {}
  const days = Object.values(reports);
  const cards = days.reduce((n, r) => n + (r && Array.isArray(r.cards) ? r.cards.length : 0), 0);
  const loans = days.reduce((n, r) => n + (r && Array.isArray(r.loans) ? r.loans.length : 0), 0);
  return cards + " كارت، " + loans + " قرض، " + followups.length + " متابعة، " + crm.length + " عميل";
}
async function encryptSnapshot(snapshot, password, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const aad = new TextEncoder().encode("NBE-SALES-SYNC|v1");
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
    key, new TextEncoder().encode(JSON.stringify(snapshot))
  );
  return { iv: bytesToBase64(iv), ciphertext: bytesToBase64(encrypted) };
}
async function decryptCloudRecord(record, password) {
  if (record.format !== "NBE-SALES-ENCRYPTED-SYNC" || record.version !== 1 || record.kdf !== "PBKDF2-SHA256" ||
      record.iterations !== KDF_ITERATIONS || record.cipher !== "AES-256-GCM" || !record.salt || !record.iv || !record.ciphertext || !record.revision) {
    throw new Error("صيغة بيانات السحابة غير معروفة. لم يتم تغيير البيانات المحلية.");
  }
  try {
    const key = await deriveEncryptionKey(password, base64ToBytes(record.salt));
    const aad = new TextEncoder().encode("NBE-SALES-SYNC|v1");
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(record.iv), additionalData: aad, tagLength: 128 },
      key, base64ToBytes(record.ciphertext)
    );
    const snapshot = JSON.parse(new TextDecoder().decode(plain));
    validateRemoteSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    if (error && error.message && error.message.includes("لم يتم تغيير البيانات المحلية")) throw error;
    throw new Error("تعذر فك التشفير. تأكد من كلمة مرور المزامنة نفسها على الجهازين.");
  }
}
function applyLocalSnapshot(snapshot) {
  const before = {};
  Object.values(STORAGE_KEYS).forEach(key => before[key] = localStorage.getItem(key));
  try {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = snapshot.values[name];
      if (raw === null) localStorage.removeItem(key);
      else localStorage.setItem(key, raw);
    });
  } catch (error) {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (before[key] === null) localStorage.removeItem(key);
      else localStorage.setItem(key, before[key]);
    });
    throw new Error("تعذر تطبيق النسخة على هذا الجهاز؛ تمت إعادة القيم المحلية السابقة.");
  }
}
async function saveCloudSnapshot(ref, snapshot, password, salt, expectedRevision) {
  const encrypted = await encryptSnapshot(snapshot, password, salt);
  const revision = randomId();
  await runTransaction(db, async transaction => {
    const latest = await transaction.get(ref);
    const currentRevision = latest.exists() ? latest.data().revision : null;
    if (currentRevision !== expectedRevision) throw new Error("sync-concurrent-change");
    const payload = {
      format: "NBE-SALES-ENCRYPTED-SYNC", version: 1, cipher: "AES-256-GCM",
      kdf: "PBKDF2-SHA256", iterations: KDF_ITERATIONS, salt: bytesToBase64(salt),
      iv: encrypted.iv, ciphertext: encrypted.ciphertext, revision,
      updatedAt: serverTimestamp()
    };
    if (!latest.exists()) payload.createdAt = serverTimestamp();
    transaction.set(ref, payload);
  });
}
function baselineKey(uid) { return BASELINE_PREFIX + uid; }

async function runSecureSync() {
  const user = auth && auth.currentUser;
  const password = syncPass.value;
  if (!user) { setStatus("سجّل الدخول بحساب Google أولًا.", "error"); return; }
  if (password.length < 12) { setStatus("كلمة مرور المزامنة يجب ألا تقل عن 12 حرفًا.", "error"); return; }
  if (!window.crypto || !crypto.subtle) { setStatus("التشفير غير مدعوم في هذا المتصفح.", "error"); return; }

  syncBtn.disabled = true;
  setStatus("جارٍ فحص بيانات جهازك وحالة النسخة المشفرة...");
  try {
    const localSnapshot = readLocalSnapshot();
    const localHash = await digestSnapshot(localSnapshot);
    const ref = doc(db, "users", user.uid, "sync", "vault-v1");
    const cloudDoc = await getDoc(ref);
    const baseline = localStorage.getItem(baselineKey(user.uid));

    if (!cloudDoc.exists()) {
      const count = snapshotSummary(localSnapshot);
      if (!confirm("لا توجد نسخة سحابية لهذا الحساب. سيتم رفع نسخة مشفرة من بيانات هذا الجهاز (" + count + "). لن تُرفع كلمة المرور. هل توافق؟")) {
        setStatus("تم الإلغاء. لم يتم رفع أو تغيير أي بيانات.");
        return;
      }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      await saveCloudSnapshot(ref, localSnapshot, password, salt, null);
      localStorage.setItem(baselineKey(user.uid), localHash);
      setStatus("تم إنشاء أول نسخة سحابية مشفرة بنجاح. لم تُحفظ كلمة المرور، ويمكنك استخدام كلمة المرور نفسها على جهازك الآخر.", "ok");
      return;
    }

    const record = cloudDoc.data();
    const cloudSnapshot = await decryptCloudRecord(record, password);
    const cloudHash = await digestSnapshot(cloudSnapshot);
    if (localHash === cloudHash) {
      localStorage.setItem(baselineKey(user.uid), cloudHash);
      setStatus("الجهاز والسحابة لديهما نفس البيانات بالفعل. لا توجد تغييرات تحتاج إلى مزامنة.", "ok");
      return;
    }

    if (!baseline) {
      const localCount = snapshotSummary(localSnapshot);
      const cloudCount = snapshotSummary(cloudSnapshot);
      if (!confirm("هذه أول مزامنة لهذا الجهاز. النسخة المشفرة في السحابة تحتوي على (" + cloudCount + ")، وهذا الجهاز يحتوي على (" + localCount + "). إذا تابعت سيتم استبدال بيانات هذا الجهاز بالنسخة السحابية. خذ نسخة احتياطية أولًا إذا كانت لديك بيانات مهمة. هل تريد الاستعادة؟")) {
        setStatus("لم يتم تغيير أي بيانات. ألغيت الاستعادة بأمان.");
        return;
      }
      const latest = await getDoc(ref);
      if (!latest.exists() || latest.data().revision !== record.revision) throw new Error("sync-concurrent-change");
      applyLocalSnapshot(cloudSnapshot);
      localStorage.setItem(baselineKey(user.uid), cloudHash);
      setStatus("تمت استعادة النسخة المشفرة على هذا الجهاز. سيتم تحديث الصفحة لعرض البيانات.", "ok");
      syncPass.value = "";
      setTimeout(() => location.reload(), 900);
      return;
    }

    const localChanged = localHash !== baseline;
    const cloudChanged = cloudHash !== baseline;
    if (localChanged && cloudChanged) {
      throw new Error("وجدنا تعديلات مختلفة على الجهاز والسحابة منذ آخر مزامنة. أوقفنا العملية لحماية النسختين. لم يتم استبدال أو حذف أي بيانات؛ نزّل نسخة احتياطية من الجهازين قبل اختيار النسخة التي ستعتمدها.");
    }
    if (localChanged && !cloudChanged) {
      await saveCloudSnapshot(ref, localSnapshot, password, base64ToBytes(record.salt), record.revision);
      localStorage.setItem(baselineKey(user.uid), localHash);
      setStatus("تم رفع تعديلات هذا الجهاز مشفرة بنجاح. افتح الجهاز الآخر واضغط المزامنة لتنزيلها.", "ok");
      return;
    }
    if (!localChanged && cloudChanged) {
      const latest = await getDoc(ref);
      if (!latest.exists() || latest.data().revision !== record.revision) throw new Error("sync-concurrent-change");
      applyLocalSnapshot(cloudSnapshot);
      localStorage.setItem(baselineKey(user.uid), cloudHash);
      setStatus("تم تنزيل التعديلات المشفرة من السحابة. سيتم تحديث الصفحة لعرض البيانات.", "ok");
      syncPass.value = "";
      setTimeout(() => location.reload(), 900);
    }
  } catch (error) {
    if (error.message === "sync-concurrent-change") {
      setStatus("تغيرت النسخة السحابية أثناء المزامنة. لم نستبدل أي بيانات؛ اضغط المزامنة مرة أخرى بعد مراجعة الجهاز الآخر.", "error");
    } else {
      setStatus(explainError(error), "error");
    }
  } finally {
    syncPass.value = "";
    syncBtn.disabled = !auth || !auth.currentUser;
  }
}

async function runLocalCryptoTest() {
  const password = cryptoPass.value;
  if (password.length < 12) { setStatus("كلمة مرور الاختبار يجب ألا تقل عن 12 حرفًا.", "error"); return; }
  if (password !== cryptoConfirm.value) { setStatus("كلمتا مرور الاختبار غير متطابقتين.", "error"); return; }
  if (!window.crypto || !crypto.subtle) { setStatus("التشفير غير مدعوم في هذا المتصفح أو السياق.", "error"); return; }
  cryptoTestBtn.disabled = true;
  setStatus("جارٍ اختبار اشتقاق المفتاح وتشفير البيانات وفكها على هذا الجهاز...");
  try {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveEncryptionKey(password, salt);
    const sample = { app: "NBE Sales", purpose: "local-crypto-self-test", sample: "لا يحتوي هذا الاختبار على بيانات عملاء", version: 1 };
    const aad = enc.encode("NBE-SALES-SYNC|v1");
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, key, enc.encode(JSON.stringify(sample)));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, key, cipher);
    const restored = JSON.parse(new TextDecoder().decode(plain));
    if (JSON.stringify(restored) !== JSON.stringify(sample)) throw new Error("لم تتطابق البيانات بعد فك التشفير.");
    setStatus("نجح الاختبار المحلي: اشتقاق مفتاح AES-256 وفك تشفير البيانات التجريبية. لم تُحفظ كلمة المرور أو المفتاح أو العينة، ولم يتم رفع أي بيانات.", "ok");
  } catch (error) {
    setStatus("فشل اختبار التشفير: " + (error.message || "خطأ غير معروف"), "error");
  } finally {
    cryptoPass.value = "";
    cryptoConfirm.value = "";
    cryptoTestBtn.disabled = false;
  }
}
cryptoTestBtn.addEventListener("click", runLocalCryptoTest);
syncBtn.addEventListener("click", runSecureSync);

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
    syncBtn.disabled = !signedIn;
    logoutBtn.hidden = !signedIn;
    accountEl.textContent = signedIn ? "تم تسجيل الدخول: " + (user.displayName || user.email || "حساب Google") : "لم يتم تسجيل الدخول";
    if (signedIn) setStatus("تم الاتصال بحساب Google بنجاح. يمكنك اختبار Firestore أو بدء المزامنة المشفرة يدويًا.", "ok");
    else setStatus("سجّل الدخول بحساب Google للانتقال إلى اختبار قاعدة البيانات والمزامنة.");
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
    try { await signOut(auth); setStatus("تم تسجيل الخروج من Google."); }
    catch (error) { setStatus(explainError(error), "error"); }
  });

  testBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) { setStatus("سجّل الدخول أولًا.", "error"); return; }
    testBtn.disabled = true;
    setStatus("جارٍ اختبار الكتابة والقراءة والحذف في Firestore...");
    const testId = "connection-test-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const testRef = doc(db, "users", user.uid, "sync", testId);
    try {
      await setDoc(testRef, { app: "NBE Sales", test: true, createdAt: serverTimestamp() });
      const result = await getDoc(testRef);
      if (!result.exists() || result.data().app !== "NBE Sales" || result.data().test !== true) throw new Error("لم يتم التحقق من قراءة سجل الاختبار.");
      await deleteDoc(testRef);
      setStatus("نجح الاختبار! تسجيل الدخول والكتابة والقراءة والحذف تعمل، وتم حذف سجل الاختبار المؤقت.", "ok");
    } catch (error) { setStatus(explainError(error), "error"); }
    finally { testBtn.disabled = !auth.currentUser; }
  });
} catch (error) {
  setStatus("تعذر تهيئة Firebase: " + explainError(error), "error");
  loginBtn.disabled = true;
  testBtn.disabled = true;
  syncBtn.disabled = true;
}
