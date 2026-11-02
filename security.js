(function(){
"use strict";
const META="nbe_security_meta_v1",VAULT="nbe_security_vault_v1",SESSION="nbe_security_session_key";
const overlay=document.getElementById("nbeSecurityOverlay"),form=document.getElementById("nbeSecurityForm");
const password=document.getElementById("nbePassword"),confirmWrap=document.getElementById("nbeConfirmWrap");
const confirmInput=document.getElementById("nbePasswordConfirm"),title=document.getElementById("nbeSecurityTitle");
const message=document.getElementById("nbeSecurityText"),error=document.getElementById("nbeSecurityError");
const submit=document.getElementById("nbeUnlockBtn"),bioButton=document.getElementById("nbeBiometricBtn");
let meta=null,rawKey=null,idleTimer=null,hiddenTimer=null;
const enc=new TextEncoder(),dec=new TextDecoder();
function b64(bytes){let s="";new Uint8Array(bytes).forEach(b=>s+=String.fromCharCode(b));return btoa(s);}
function un64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function b64url(bytes){return b64(bytes).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function fromB64url(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return un64(s);}
function random(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a;}
async function derive(passwordText,salt){
 const base=await crypto.subtle.importKey("raw",enc.encode(passwordText),"PBKDF2",false,["deriveKey"]);
 return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:310000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
}
async function encrypt(data,key){
 const iv=random(12),plain=enc.encode(JSON.stringify(data));
 const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},key,plain);
 return {iv:b64(iv),data:b64(cipher),version:1};
}
async function decrypt(blob,key){
 const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:un64(blob.iv)},key,un64(blob.data));
 return JSON.parse(dec.decode(plain));
}
function snapshot(){
 const data={};
 for(let i=0;i<localStorage.length;i++){
  const k=localStorage.key(i);if(k&&k!==META&&k!==VAULT)data[k]=localStorage.getItem(k);
 }
 return data;
}
function clearAppStorage(){
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k!==META&&k!==VAULT)keys.push(k);}
 keys.forEach(k=>localStorage.removeItem(k));
}
function restore(data){clearAppStorage();Object.keys(data||{}).forEach(k=>localStorage.setItem(k,data[k]));}
function show(){overlay.hidden=false;document.body.classList.add("nbe-locked");setTimeout(()=>password.focus(),80);}
function hide(){overlay.hidden=true;document.body.classList.remove("nbe-locked");password.value="";confirmInput.value="";error.textContent="";startIdle();}
function fail(text){error.textContent=text;submit.disabled=false;submit.textContent=meta?"فتح البرنامج":"إنشاء كلمة المرور";}
function setBusy(v){submit.disabled=v;submit.textContent=v?"جارٍ التحقق...":(meta?"فتح البرنامج":"إنشاء كلمة المرور");}
function refreshApp(){
 try{if(typeof loadStorage==="function")loadStorage();if(typeof loadTargets==="function")loadTargets();if(typeof loadFollowups==="function")loadFollowups();if(typeof renderAll==="function")renderAll();if(typeof window.refreshNbeCrm==="function")window.refreshNbeCrm();}catch(e){console.warn("Refresh after unlock:",e);}
}
async function doSetup(pass){
 const salt=random(16),key=await derive(pass,salt),data=snapshot();
 meta={version:1,salt:b64(salt),biometricId:null,createdAt:new Date().toISOString()};
 localStorage.setItem(META,JSON.stringify(meta));
 localStorage.setItem(VAULT,JSON.stringify(await encrypt(data,key)));
 rawKey=key;sessionStorage.setItem(SESSION,b64(await crypto.subtle.exportKey("raw",key)));
 restore(data);hide();bioButton.hidden=false;
}
async function doUnlock(pass){
 const blob=JSON.parse(localStorage.getItem(VAULT)||"null");if(!blob)throw new Error("لا توجد خزنة مشفرة. قد تكون النسخة الاحتياطية غير مكتملة.");
 const key=await derive(pass,un64(meta.salt));
 const data=await decrypt(blob,key);
 if(meta.biometricId){try{await verifyBiometric(meta.biometricId);}catch(bioError){if(confirm("تعذر التحقق بالبصمة. هل تريد المتابعة بكلمة المرور فقط وتعطيل البصمة لهذا الجهاز؟")){meta.biometricId=null;localStorage.setItem(META,JSON.stringify(meta));}else throw bioError;}}
 rawKey=key;sessionStorage.setItem(SESSION,b64(await crypto.subtle.exportKey("raw",key)));
 restore(data);hide();refreshApp();bioButton.hidden=!!meta.biometricId;syncBiometricSettings();
}
async function lock(){
 if(!rawKey)return;
 try{
  const data=snapshot(),blob=await encrypt(data,rawKey);
  localStorage.setItem(VAULT,JSON.stringify(blob));clearAppStorage();
  sessionStorage.removeItem(SESSION);rawKey=null;location.reload();
 }catch(e){alert("تعذر قفل وتشفير البيانات. لا تغلق الصفحة الآن. "+e.message);}
}
function startIdle(){
 clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(rawKey)lock();},5*60*1000);
}
function activity(){if(rawKey)startIdle();}
async function registerBiometric(){
 try{
  if(!window.PublicKeyCredential||!navigator.credentials)throw new Error("هذا المتصفح لا يدعم تسجيل البصمة عبر WebAuthn.");
  const available=await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if(!available)throw new Error("لا توجد بصمة/وسيلة تحقق بيومترية مدعومة على هذا الجهاز.");
  const cred=await navigator.credentials.create({publicKey:{
   challenge:random(32),rp:{name:"NBE Sales Personal Vault",id:location.hostname},
   user:{id:random(16),name:"nbe-sales-user",displayName:"NBE Sales User"},
   pubKeyCredParams:[{type:"public-key",alg:-7},{type:"public-key",alg:-257}],
   authenticatorSelection:{authenticatorAttachment:"platform",residentKey:"preferred",userVerification:"required"},
   timeout:60000,attestation:"none"
  }});
  if(!cred)throw new Error("لم يكتمل تسجيل البصمة.");
  meta.biometricId=b64url(cred.rawId);localStorage.setItem(META,JSON.stringify(meta));
  bioButton.textContent="✓ البصمة مفعّلة على هذا الجهاز";bioButton.disabled=true;
  const settingsBio=document.getElementById("nbeBiometricSettingsBtn"),bioStatus=document.getElementById("nbeBioStatus");
  if(settingsBio){settingsBio.textContent="✓ البصمة مفعّلة على هذا الجهاز";settingsBio.disabled=true;}
  if(bioStatus)bioStatus.textContent="تم تسجيل وسيلة التحقق على هذا الجهاز.";
  alert("تم تسجيل وسيلة التحقق على هذا الجهاز. عند فتح البرنامج ستحتاج كلمة المرور ثم تأكيد البصمة.");
 }catch(e){alert(e.message||"تعذر تفعيل البصمة.");}
}
async function verifyBiometric(id){
 if(!window.PublicKeyCredential||!navigator.credentials)throw new Error("ميزة البصمة غير متاحة هنا. افتح البرنامج على الجهاز الذي سجلت عليه البصمة.");
 const result=await navigator.credentials.get({publicKey:{challenge:random(32),allowCredentials:[{type:"public-key",id:fromB64url(id)}],userVerification:"required",timeout:60000}});
 if(!result)throw new Error("لم يتم تأكيد البصمة.");
}
form.addEventListener("submit",async function(e){
 e.preventDefault();error.textContent="";setBusy(true);
 try{
  const pass=password.value;
  if(pass.length<10)throw new Error("استخدم كلمة مرور من 10 أحرف على الأقل.");
  if(!meta){
   if(pass!==confirmInput.value)throw new Error("كلمتا المرور غير متطابقتين.");
   await doSetup(pass);
  }else await doUnlock(pass);
 }catch(e){fail(e.message==="OperationError"?"كلمة المرور غير صحيحة أو تعذر فك تشفير البيانات.":(e.message||"تعذر فتح الخزنة."));}
});
bioButton.addEventListener("click",registerBiometric);
const resetButton=document.getElementById("nbeResetSecurityBtn");
if(resetButton)resetButton.addEventListener("click",function(){
 if(!confirm("سيتم حذف كلمة المرور القديمة والخزنة المشفرة نهائيًا، ولن يمكن استعادة أي بيانات بداخلها. هل تريد إعادة تهيئة الحماية؟"))return;
 localStorage.removeItem(META);localStorage.removeItem(VAULT);sessionStorage.removeItem(SESSION);location.reload();
});
async function encryptBackup(payload,pass){
 if(!pass||pass.length<10)throw new Error("كلمة مرور النسخة يجب ألا تقل عن 10 أحرف.");
 const salt=random(16),key=await derive(pass,salt),blob=await encrypt(payload,key);
 return {app:"NBE Sales Encrypted Backup",version:1,salt:b64(salt),iv:blob.iv,data:blob.data};
}
async function decryptBackup(payload,pass){
 if(!payload||payload.app!=="NBE Sales Encrypted Backup"||payload.version!==1)throw new Error("صيغة النسخة المشفرة غير صحيحة.");
 const key=await derive(pass,un64(payload.salt));
 return decrypt({iv:payload.iv,data:payload.data},key);
}
window.NBESecurity={lock:lock,registerBiometric:registerBiometric,encryptBackup:encryptBackup,decryptBackup:decryptBackup};
function syncBiometricSettings(){
 const btn=document.getElementById("nbeBiometricSettingsBtn"),status=document.getElementById("nbeBioStatus");
 if(btn&&meta&&meta.biometricId){btn.textContent="✓ البصمة مفعّلة على هذا الجهاز";btn.disabled=true;}
 if(status&&meta&&meta.biometricId)status.textContent="تم تسجيل وسيلة التحقق على هذا الجهاز.";
}
async function init(){
 try{
  if(!crypto.subtle||!location.protocol.startsWith("https"))throw new Error("يلزم فتح البرنامج عبر HTTPS لتشغيل التشفير والبصمة.");
  meta=JSON.parse(localStorage.getItem(META)||"null");
  if(!meta){
   title.textContent="إنشاء كلمة مرور رئيسية";
   message.textContent="أنشئ كلمة مرور قوية لحماية بيانات هذا الجهاز. لن نستطيع استعادتها إذا نسيتها.";
   confirmWrap.hidden=false;submit.textContent="إنشاء الخزنة المشفرة";show();return;
  }
  confirmWrap.hidden=true;submit.textContent="فتح البرنامج";
  const sessionKey=sessionStorage.getItem(SESSION);
  if(sessionKey){
   rawKey=await crypto.subtle.importKey("raw",un64(sessionKey),{name:"AES-GCM"},false,["encrypt","decrypt"]);
   hide();bioButton.hidden=!!meta.biometricId;syncBiometricSettings();return;
  }
  title.textContent="البرنامج مقفول";
  message.textContent=meta.biometricId?"أدخل كلمة المرور ثم أكد هويتك بالبصمة.":"أدخل كلمة المرور لفك تشفير بياناتك وفتح البرنامج.";
  bioButton.hidden=true;show();
 }catch(e){title.textContent="تعذر تشغيل الحماية";message.textContent=e.message;show();}
}
["pointerdown","keydown","touchstart"].forEach(ev=>document.addEventListener(ev,activity,{passive:true}));
document.addEventListener("visibilitychange",function(){
 if(document.hidden&&rawKey){hiddenTimer=setTimeout(()=>{if(document.hidden)lock();},60000);}
 else clearTimeout(hiddenTimer);
});
window.addEventListener("beforeunload",function(){clearTimeout(idleTimer);});
init();
})();