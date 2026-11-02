
(function(){
"use strict";
const KEY="nbe_crm_demo_customers_v1";
let customers=[];
const style=document.createElement("style");
style.textContent=".crm-warning{padding:13px;border:1px solid #d7a84b;background:#fff8e7;color:#704d08;border-radius:12px;line-height:1.8;font-size:13px;margin-bottom:18px}.crm-section{margin-top:18px}.crm-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.crm-form input,.crm-toolbar input,.crm-toolbar select{width:100%;min-width:0;padding:11px;border:1px solid var(--border);border-radius:9px;background:var(--card);color:var(--text)}.crm-form-actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}.crm-toolbar{display:grid;grid-template-columns:1fr 180px;gap:10px;margin:12px 0}.crm-list{display:grid;gap:10px}.crm-card{border:1px solid var(--border);border-radius:12px;padding:14px;background:var(--card)}.crm-card h3{margin:0 0 8px;color:var(--green);font-size:16px}.crm-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;font-size:12px;color:var(--muted);line-height:1.7;margin-top:10px}.crm-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.crm-backup{border-top:1px solid var(--border);margin-top:24px;padding-top:16px}.crm-empty{text-align:center;color:var(--muted);padding:25px;border:1px dashed var(--border);border-radius:12px}body.dark .crm-warning{background:#3b301c;color:#f6dda0;border-color:#80652c}@media(max-width:620px){.crm-form,.crm-toolbar{grid-template-columns:1fr}.crm-meta{grid-template-columns:1fr 1fr}}";

/* Premium CRM cards and form */
style.textContent += ".crm-warning{border-radius:14px;padding:14px 16px;line-height:1.9}.crm-section{border-radius:19px}.crm-form{gap:14px}.crm-form input,.crm-toolbar input,.crm-toolbar select{border-radius:12px;padding:13px 14px}.crm-card{border-radius:16px;padding:17px;box-shadow:0 5px 18px rgba(20,50,40,.045);transition:transform .18s,border-color .18s}.crm-card:hover{transform:translateY(-2px);border-color:rgba(8,116,67,.35)}.crm-card h3{font-size:17px;font-weight:800}.crm-meta{gap:9px}.crm-meta span{background:var(--bg);padding:8px 10px;border-radius:9px;overflow-wrap:anywhere}.crm-actions .btn{border-radius:10px}.crm-empty{border-radius:15px;padding:32px}.crm-backup{padding-top:20px}.crm-backup p{color:var(--muted);line-height:1.9;font-size:13px}@media(max-width:620px){.crm-form{gap:11px}.crm-card{padding:14px}.crm-meta{grid-template-columns:1fr 1fr}}";
document.head.appendChild(style);
const host=document.getElementById("pageHost");
if(!host)return;
const page=host.querySelector('.app-page[data-page="customers"]');
if(!page)return;
page.insertAdjacentHTML("beforeend",''+
'<div class="section crm-section"><div class="crm-warning"><strong>تنبيه أمان:</strong> هذه نسخة تجريبية فقط. لا تدخل بيانات عملاء حقيقية أو أرقامًا قومية أو بيانات بنكية، ولا ترفعها إلى Google Drive شخصي. استخدم أرقامًا وهمية للاختبار.</div>'+
'<div class="section-title"><h2 id="crmFormTitle">إضافة عميل جديد</h2><span class="badge">CUSTOMER CRM</span></div>'+
'<form id="crmForm" class="crm-form">'+
'<div class="field"><label>اسم العميل بالكامل *</label><input id="crmName" required maxlength="120"></div>'+
'<div class="field"><label>رقم قومي تجريبي (14 رقمًا) *</label><input id="crmNational" required inputmode="numeric" maxlength="14" minlength="14" pattern="[0-9]{14}"></div>'+
'<div class="field"><label>رقم الهاتف *</label><input id="crmPhone" required inputmode="tel" maxlength="20"></div>'+
'<div class="field"><label>الوظيفة</label><input id="crmJob" maxlength="100"></div>'+
'<div class="field"><label>جهة العمل</label><input id="crmEmployer" maxlength="120"></div>'+
'<div class="field"><label>الفرع</label><input id="crmBranch" maxlength="100"></div>'+
'<div class="field"><label>حالة العميل</label><select id="crmStatus"><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div class="field"><label>ملاحظات</label><input id="crmNotes" maxlength="500"></div>'+
'<div class="crm-form-actions"><button class="btn primary" type="submit" id="crmSubmit">حفظ العميل</button><button class="btn light-btn" type="button" id="crmCancel">تفريغ الحقول</button></div><input type="hidden" id="crmEditId"></form>'+
'<div class="section-title" style="margin-top:25px"><h2>سجل العملاء</h2><span class="badge" id="crmCount">0 عميل</span></div>'+
'<div class="crm-toolbar"><input id="crmSearch" type="search" placeholder="بحث بالاسم أو الهاتف أو الرقم التجريبي أو جهة العمل"><select id="crmFilter"><option value="all">كل الحالات</option><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div id="crmList" class="crm-list"></div>'+
'<div class="crm-backup"><h3>النسخ الاحتياطي التجريبي</h3><p>نزّل ملف JSON ثم ارفعه يدويًا إلى Google Drive. للاستعادة، اختر ملف النسخة من جهازك. هذه ليست مزامنة تلقائية أو قاعدة بيانات مباشرة.</p>'+
'<div class="actions no-print"><button class="btn primary" type="button" id="crmExport">تنزيل نسخة احتياطية</button><button class="btn light-btn" type="button" id="crmImportBtn">استعادة نسخة</button><button class="btn light-btn" type="button" id="crmDrive">فتح Google Drive</button><input id="crmFile" type="file" accept="application/json,.json" hidden></div></div></div>');
function el(id){return document.getElementById(id);}
function safe(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");customers=Array.isArray(x)?x:[];}catch(e){customers=[];}render();}
window.refreshNbeCrm=load;
function save(){localStorage.setItem(KEY,JSON.stringify(customers));render();}
function reset(){el("crmForm").reset();el("crmEditId").value="";el("crmNational").readOnly=false;el("crmSubmit").textContent="حفظ العميل";el("crmFormTitle").textContent="إضافة عميل جديد";}
function render(){
 const q=(el("crmSearch").value||"").trim().toLowerCase(),filter=el("crmFilter").value;
 const rows=customers.filter(c=>(filter==="all"||c.status===filter)&&[c.name,c.national,c.phone,c.employer,c.job].some(v=>String(v||"").toLowerCase().includes(q)));
 el("crmCount").textContent=customers.length+" عميل";
 if(!rows.length){el("crmList").innerHTML='<div class="crm-empty">لا توجد نتائج. أضف سجلًا تجريبيًا للبدء.</div>';return;}
 el("crmList").innerHTML=rows.map(c=>'<article class="crm-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3>'+safe(c.name)+'</h3><span class="follow-status">'+safe(c.status)+'</span></div><small>آخر تحديث: '+new Date(c.updatedAt||c.createdAt).toLocaleDateString("ar-EG")+'</small></div><div class="crm-meta"><span>الرقم التجريبي: '+safe(c.national)+'</span><span>الهاتف: '+safe(c.phone)+'</span><span>الوظيفة: '+safe(c.job||"—")+'</span><span>جهة العمل: '+safe(c.employer||"—")+'</span><span>الفرع: '+safe(c.branch||"—")+'</span><span>ملاحظات: '+safe(c.notes||"—")+'</span></div><div class="crm-actions no-print"><button class="btn light-btn" data-edit="'+safe(c.id)+'">تعديل</button><button class="btn light-btn" data-archive="'+safe(c.id)+'">'+(c.archived?"إعادة تنشيط":"تعطيل العميل")+'</button><button class="btn light-btn" data-history="'+safe(c.id)+'">سجل التعديلات</button></div></article>').join("");
}
el("crmForm").addEventListener("submit",function(e){
 e.preventDefault();
 const id=el("crmEditId").value,name=el("crmName").value.trim(),national=el("crmNational").value.trim(),phone=el("crmPhone").value.trim();
 if(!name||!/^\d{14}$/.test(national)||!phone){alert("أدخل الاسم والرقم التجريبي المكوّن من 14 رقمًا والهاتف.");return;}
 if(customers.some(c=>c.national===national&&c.id!==id)){alert("هذا الرقم التجريبي مسجل بالفعل ولا يمكن تكراره.");return;}
 const data={name:national?name:name,national:national,phone:phone,job:el("crmJob").value.trim(),employer:el("crmEmployer").value.trim(),branch:el("crmBranch").value.trim(),status:el("crmStatus").value,notes:el("crmNotes").value.trim()};
 const now=new Date().toISOString();
 if(id){const c=customers.find(x=>x.id===id);if(!c)return;Object.assign(c,data,{national:c.national,updatedAt:now});c.history=(c.history||[]).concat([{at:now,action:"تعديل بيانات العميل"}]);}
 else{customers.unshift(Object.assign({id:"crm_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),createdAt:now,updatedAt:now,archived:false,history:[{at:now,action:"تسجيل العميل"}]},data));}
 save();reset();alert(id?"تم تحديث العميل.":"تم حفظ العميل.");
});
el("crmCancel").addEventListener("click",reset);
el("crmSearch").addEventListener("input",render);
el("crmFilter").addEventListener("change",render);
el("crmList").addEventListener("click",function(e){
 const b=e.target.closest("button");if(!b)return;
 const c=customers.find(x=>x.id===b.dataset.edit||x.id===b.dataset.archive||x.id===b.dataset.history);if(!c)return;
 if(b.dataset.edit){el("crmEditId").value=c.id;el("crmName").value=c.name;el("crmNational").value=c.national;el("crmNational").readOnly=true;el("crmPhone").value=c.phone;el("crmJob").value=c.job||"";el("crmEmployer").value=c.employer||"";el("crmBranch").value=c.branch||"";el("crmStatus").value=c.status||"جديد";el("crmNotes").value=c.notes||"";el("crmSubmit").textContent="حفظ التعديلات";el("crmFormTitle").textContent="تعديل بيانات العميل";el("crmForm").scrollIntoView({behavior:"smooth"});}
 if(b.dataset.archive){c.archived=!c.archived;c.status=c.archived?"غير نشط":(c.status==="غير نشط"?"جاري التواصل":c.status);c.updatedAt=new Date().toISOString();c.history=(c.history||[]).concat([{at:c.updatedAt,action:c.archived?"تعطيل العميل":"إعادة تنشيط العميل"}]);save();}
 if(b.dataset.history){alert("سجل العميل: "+c.name+"\\n"+(c.history||[]).map(h=>new Date(h.at).toLocaleString("ar-EG")+" — "+h.action).join("\\n"));}
});
el("crmExport").addEventListener("click",function(){
 if(!confirm("سيتم تنزيل نسخة CRM غير مشفرة. لا تضع فيها بيانات عملاء حقيقية. هل تريد المتابعة؟"))return;
 const payload={app:"NBE Sales CRM Demo",version:1,exportedAt:new Date().toISOString(),customers:customers};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="nbe-crm-demo-backup.json";a.click();URL.revokeObjectURL(url);
});
el("crmImportBtn").addEventListener("click",function(){el("crmFile").click();});
el("crmDrive").addEventListener("click",function(){window.open("https://drive.google.com/drive/my-drive","_blank","noopener");});
el("crmFile").addEventListener("change",function(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const reader=new FileReader();reader.onload=function(){
  try{const p=JSON.parse(reader.result);if(!confirm("سيتم استيراد نسخة CRM تجريبية غير مشفرة. هل تريد المتابعة؟")){e.target.value="";return;}if(p.app!=="NBE Sales CRM Demo"||!Array.isArray(p.customers))throw new Error("bad");
   const seen=new Set();p.customers.forEach(c=>{if(!c.id||!/^\d{14}$/.test(String(c.national||""))||seen.has(c.national))throw new Error("bad");seen.add(c.national);});
   if(confirm("سيتم استبدال السجل الحالي بالنسخة المختارة. هل تريد المتابعة؟")){customers=p.customers;save();alert("تمت استعادة النسخة التجريبية.");}
  }catch(err){alert("ملف النسخة غير صالح أو لا يخص CRM التجريبي.");}e.target.value="";
 };reader.readAsText(file);
});
load();
})();
