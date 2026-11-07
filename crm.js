
(function(){
"use strict";
const KEY="nbe_crm_demo_customers_v1";
let customers=[];
const style=document.createElement("style");
style.textContent=".crm-warning{padding:13px;border:1px solid #d7a84b;background:#fff8e7;color:#704d08;border-radius:12px;line-height:1.8;font-size:13px;margin-bottom:18px}.crm-section{margin-top:18px}.crm-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.crm-form input,.crm-toolbar input,.crm-toolbar select{width:100%;min-width:0;padding:11px;border:1px solid var(--border);border-radius:9px;background:var(--card);color:var(--text)}.crm-form-actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}.crm-toolbar{display:grid;grid-template-columns:1fr 180px;gap:10px;margin:12px 0}.crm-list{display:grid;gap:10px}.crm-card{border:1px solid var(--border);border-radius:12px;padding:14px;background:var(--card)}.crm-card h3{margin:0 0 8px;color:var(--green);font-size:16px}.crm-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;font-size:12px;color:var(--muted);line-height:1.7;margin-top:10px}.crm-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.crm-empty{text-align:center;color:var(--muted);padding:25px;border:1px dashed var(--border);border-radius:12px}body.dark .crm-warning{background:#3b301c;color:#f6dda0;border-color:#80652c}@media(max-width:620px){.crm-form,.crm-toolbar{grid-template-columns:1fr}.crm-meta{grid-template-columns:1fr 1fr}}";

/* Premium CRM cards and form */
style.textContent += ".crm-warning{border-radius:14px;padding:14px 16px;line-height:1.9}.crm-section{border-radius:19px}.crm-form{gap:14px}.crm-form input,.crm-toolbar input,.crm-toolbar select{border-radius:12px;padding:13px 14px}.crm-card{border-radius:16px;padding:17px;box-shadow:0 5px 18px rgba(20,50,40,.045);transition:transform .18s,border-color .18s}.crm-card:hover{transform:translateY(-2px);border-color:rgba(8,116,67,.35)}.crm-card h3{font-size:17px;font-weight:800}.crm-meta{gap:9px}.crm-meta span{background:var(--bg);padding:8px 10px;border-radius:9px;overflow-wrap:anywhere}.crm-actions .btn{border-radius:10px}.crm-empty{border-radius:15px;padding:32px}@media(max-width:620px){.crm-form{gap:11px}.crm-card{padding:14px}.crm-meta{grid-template-columns:1fr 1fr}}";
document.head.appendChild(style);
const host=document.getElementById("pageHost");
if(!host)return;
const page=host.querySelector('.app-page[data-page="customers"]');
const visitsPage=host.querySelector('.app-page[data-page="visits"]');
if(!page||!visitsPage)return;
page.insertAdjacentHTML("beforeend",''+
'<div class="section crm-section">'+
'<div class="section-title"><h2 id="crmFormTitle">إضافة عميل جديد</h2><span class="badge">CUSTOMER CRM</span></div>'+
'<form id="crmForm" class="crm-form">'+
'<div class="field"><label>اسم العميل بالكامل *</label><input id="crmName" required maxlength="120"></div>'+
'<div class="field"><label>الرقم القومي (14 رقمًا) *</label><input id="crmNational" required inputmode="numeric" maxlength="14" minlength="14" pattern="[0-9٠-٩۰-۹]{14}"></div>'+
'<div class="field"><label>رقم الهاتف *</label><input id="crmPhone" required inputmode="tel" maxlength="20"></div>'+
'<div class="field"><label>الوظيفة</label><input id="crmJob" maxlength="100"></div>'+
'<div class="field"><label>جهة العمل</label><input id="crmEmployer" maxlength="120"></div>'+
'<div class="field"><label>الفرع</label><input id="crmBranch" value="رشيد - 394" readonly></div>'+
'<div class="field"><label>حالة العميل</label><select id="crmStatus"><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div class="field"><label>ملاحظات</label><input id="crmNotes" maxlength="500"></div>'+
'<div class="crm-form-actions"><button class="btn primary" type="submit" id="crmSubmit">حفظ العميل</button><button class="btn light-btn" type="button" id="crmCancel">تفريغ الحقول</button></div><input type="hidden" id="crmEditId"></form>'+
'<div class="section-title" style="margin-top:25px"><h2>سجل العملاء</h2><span class="badge" id="crmCount">0 عميل</span></div>'+
'<div class="crm-toolbar"><input id="crmSearch" type="search" placeholder="بحث بالاسم أو الهاتف أو الرقم القومي أو جهة العمل"><select id="crmFilter"><option value="all">كل الحالات</option><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div id="crmList" class="crm-list"></div>'+
'</div>');
function el(id){return document.getElementById(id);}
function safe(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function normalizeDigits(v){return String(v||"").replace(/[٠-٩۰-۹]/g,function(d){return String("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d)%10);});}
function load(){try{const x=JSON.parse(NBEStore.getItem(KEY)||"[]");customers=Array.isArray(x)?x:[];}catch(e){customers=[];}render();}
window.refreshNbeCrm=load;
function save(){NBEStore.setItem(KEY,JSON.stringify(customers));render();if(typeof renderVisitCustomerOptions==="function")renderVisitCustomerOptions();if(typeof renderVisitReports==="function")renderVisitReports();}
function reset(){el("crmForm").reset();el("crmEditId").value="";el("crmNational").readOnly=false;el("crmSubmit").textContent="حفظ العميل";el("crmFormTitle").textContent="إضافة عميل جديد";}
function render(){
 const q=(el("crmSearch").value||"").trim().toLowerCase(),filter=el("crmFilter").value;
 const rows=customers.filter(c=>(filter==="all"||c.status===filter)&&[c.name,c.national,c.phone,c.employer,c.job].some(v=>String(v||"").toLowerCase().includes(q)));
 el("crmCount").textContent=customers.length+" عميل";
 if(!rows.length){el("crmList").innerHTML='<div class="crm-empty">لا توجد نتائج</div>';return;}
 el("crmList").innerHTML=rows.map(c=>'<article class="crm-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3>'+safe(c.name)+'</h3><span class="follow-status">'+safe(c.status)+'</span></div><small>آخر تحديث: '+new Date(c.updatedAt||c.createdAt).toLocaleDateString("ar-EG")+'</small></div><div class="crm-meta"><span>الرقم القومي: '+safe(c.national)+'</span><span>الهاتف: '+safe(c.phone)+'</span><span>الوظيفة: '+safe(c.job||"—")+'</span><span>جهة العمل: '+safe(c.employer||"—")+'</span><span>الفرع: رشيد - 394</span><span>ملاحظات: '+safe(c.notes||"—")+'</span></div><div class="crm-actions no-print"><button class="btn light-btn" data-edit="'+safe(c.id)+'">تعديل</button><button class="btn light-btn" data-archive="'+safe(c.id)+'">'+(c.archived?"إعادة تنشيط":"تعطيل العميل")+'</button><button class="btn light-btn" data-history="'+safe(c.id)+'">سجل التعديلات</button></div></article>').join("");
}
el("crmForm").addEventListener("submit",function(e){
 e.preventDefault();
 const id=el("crmEditId").value,name=el("crmName").value.trim(),national=normalizeDigits(el("crmNational").value.trim()),phone=el("crmPhone").value.trim();
 el("crmNational").value=national;
 if(!name||!/^\d{14}$/.test(national)||!phone){alert("أدخل الاسم والرقم القومي المكوّن من 14 رقمًا ورقم الهاتف.");return;}
 if(customers.some(c=>c.national===national&&c.id!==id)){alert("هذا الرقم القومي مسجل بالفعل ولا يمكن تكراره.");return;}
 const data={name:national?name:name,national:national,phone:phone,job:el("crmJob").value.trim(),employer:el("crmEmployer").value.trim(),branch:"رشيد - 394",status:el("crmStatus").value,notes:el("crmNotes").value.trim()};
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
 if(b.dataset.edit){el("crmEditId").value=c.id;el("crmName").value=c.name;el("crmNational").value=c.national;el("crmNational").readOnly=true;el("crmPhone").value=c.phone;el("crmJob").value=c.job||"";el("crmEmployer").value=c.employer||"";el("crmBranch").value="رشيد - 394";el("crmStatus").value=c.status||"جديد";el("crmNotes").value=c.notes||"";el("crmSubmit").textContent="حفظ التعديلات";el("crmFormTitle").textContent="تعديل بيانات العميل";el("crmForm").scrollIntoView({behavior:"smooth"});}
 if(b.dataset.archive){c.archived=!c.archived;c.status=c.archived?"غير نشط":(c.status==="غير نشط"?"جاري التواصل":c.status);c.updatedAt=new Date().toISOString();c.history=(c.history||[]).concat([{at:c.updatedAt,action:c.archived?"تعطيل العميل":"إعادة تنشيط العميل"}]);save();}
 if(b.dataset.history){alert("سجل العميل: "+c.name+"\\n"+(c.history||[]).map(h=>new Date(h.at).toLocaleString("ar-EG")+" — "+h.action).join("\\n"));}
});

/* Visit reports linked to existing CRM customers */
const VISIT_KEY="NBE_VISIT_REPORTS_V1";
let visitReports=[];
let visitEditId="";
function loadVisitReports(){
 try{const rows=JSON.parse(NBEStore.getItem(VISIT_KEY)||"[]");visitReports=Array.isArray(rows)?rows:[];}
 catch(_){visitReports=[];}
 renderVisitCustomerOptions();
 renderVisitReports();
}
function saveVisitReports(){NBEStore.setItem(VISIT_KEY,JSON.stringify(visitReports));renderVisitReports();}
window.refreshNbeVisits=loadVisitReports;
function renderVisitCustomerOptions(selected){
 const select=el("visitCustomer");if(!select)return;
 const old=selected??select.value;
 const available=customers.filter(c=>!c.archived);
 select.innerHTML='<option value="">اختر عميلاً مسجلاً</option>'+available.map(c=>'<option value="'+safe(c.id)+'">'+safe(c.name)+' — '+safe(c.phone||"بدون هاتف")+'</option>').join("");
 if(old&&available.some(c=>String(c.id)===String(old)))select.value=old;
}
function resetVisitForm(){
 const form=el("visitForm");if(!form)return;
 form.reset();visitEditId="";
 el("visitDate").value=new Date().toISOString().slice(0,10);
 el("visitFormTitle").textContent="تسجيل زيارة جديدة";el("visitSave").textContent="حفظ الزيارة";
}
function renderVisitReports(){
 const list=el("visitList");if(!list)return;
 const query=(el("visitSearch")?.value||"").trim().toLowerCase();
 const rows=visitReports.filter(v=>[v.customerName,v.customerPhone,v.entity,v.contact,v.outcome,v.notes,v.product].some(x=>String(x||"").toLowerCase().includes(query)));
 el("visitCount").textContent=visitReports.length+" زيارة";
 if(!rows.length){list.innerHTML='<div class="crm-empty">لا توجد زيارات مسجلة حتى الآن</div>';return;}
 list.innerHTML=rows.slice().sort((a,b)=>String(b.visitDate||"").localeCompare(String(a.visitDate||""))).map(v=>{
  const customer=customers.find(c=>String(c.id)===String(v.customerId));
  return '<article class="crm-card visit-card"><div class="visit-card-head"><div><h3>'+safe(v.entity||"زيارة")+'</h3><span class="follow-status">'+safe(v.visitType||"زيارة تسويقية")+'</span></div><strong>'+safe(v.visitDate||"—")+'</strong></div>'+
  '<div class="crm-meta"><span>العميل المرتبط: '+safe(customer?.name||v.customerName||"—")+'</span><span>رقم الهاتف: '+safe(v.customerPhone||customer?.phone||"—")+'</span><span>الفرع: رشيد - 394</span><span>جهة العمل: '+safe(v.entity||"—")+'</span><span>المسؤول: '+safe(v.contact||"—")+'</span><span>المنتج: '+safe(v.product||"—")+'</span><span>العملاء المتوقعون: '+safe(v.expected||"0")+'</span><span>المتابعة القادمة: '+safe(v.nextDate||"—")+'</span><span>نتيجة الزيارة: '+safe(v.outcome||"—")+'</span><span>ملاحظات: '+safe(v.notes||"—")+'</span></div>'+
  '<div class="crm-actions no-print"><button class="btn light-btn" type="button" data-visit-edit="'+safe(v.id)+'">تعديل</button><button class="btn light-btn" type="button" data-visit-print="'+safe(v.id)+'">طباعة التقرير</button><button class="btn danger small-btn" type="button" data-visit-delete="'+safe(v.id)+'">حذف</button></div></article>';
 }).join("");
}
function printVisitReport(id){
 const v=visitReports.find(x=>String(x.id)===String(id));if(!v)return;
 const customer=customers.find(c=>String(c.id)===String(v.customerId));
 const fields=[["اسم العميل",customer?.name||v.customerName||"—"],["رقم الهاتف",v.customerPhone||customer?.phone||"—"],["الفرع","رشيد - 394"],["جهة العمل",v.entity||customer?.employer||"—"],["نوع المنتج",v.product||"—"],["تاريخ الزيارة",v.visitDate||"—"],["ملاحظات",v.notes||"—"]];
 const esc=x=>String(x??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const w=window.open("","_blank","width=850,height=900");
 if(!w){alert("اسمح بفتح نافذة الطباعة لهذا الموقع ثم حاول مرة أخرى.");return;}
 w.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تقرير زيارة</title><style>body{font-family:Tahoma,Arial;padding:32px;color:#18352b}header{background:#087443;color:#fff;padding:22px;border-radius:14px}h1{font-size:22px;margin:0 0 8px}p{margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}.item{border:1px solid #dce7e0;border-radius:9px;padding:13px;min-height:45px}.label{font-size:12px;color:#718087;margin-bottom:8px}.value{font-size:15px;white-space:pre-wrap;line-height:1.7}.wide{grid-column:1/-1}@media print{body{padding:12mm}}</style><header><h1>تقرير زيارة – NBE MY SALES PORTFOLIO</h1><p>بيانات الزيارة المسجلة</p></header><div class="grid">'+fields.map((f,i)=>'<div class="item '+(i===6?"wide":"")+'"><div class="label">'+esc(f[0])+'</div><div class="value">'+esc(f[1])+'</div></div>').join("")+'</div><script>window.onload=()=>window.print()<\\/script></html>');
 w.document.close();
}
function printAllVisitReports(){
 const query=(el("visitSearch")?.value||"").trim().toLowerCase();
 const rows=visitReports.filter(v=>[v.customerName,v.customerPhone,v.entity,v.notes,v.product].some(x=>String(x||"").toLowerCase().includes(query))).slice().sort((a,b)=>String(b.visitDate||"").localeCompare(String(a.visitDate||"")));
 if(!rows.length){alert("لا توجد زيارات لطباعتها.");return;}
 const esc=x=>String(x??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const body=rows.map((v,i)=>{const customer=customers.find(c=>String(c.id)===String(v.customerId));return '<tr><td>'+(i+1)+'</td><td>'+esc(v.visitDate)+'</td><td>'+esc(customer?.name||v.customerName)+'</td><td>'+esc(v.customerPhone||customer?.phone||"—")+'</td><td>رشيد - 394</td><td>'+esc(v.entity||customer?.employer||"—")+'</td><td>'+esc(v.product)+'</td><td>'+esc(v.notes||"—")+'</td></tr>';}).join("");
 const w=window.open("","_blank","width=1100,height=850");
 if(!w){alert("اسمح بفتح نافذة الطباعة لهذا الموقع ثم حاول مرة أخرى.");return;}
 w.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>سجل الزيارات</title><style>body{font-family:Tahoma,Arial;padding:24px;color:#18352b}h1{color:#087443}p{color:#64756c}table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}th,td{border:1px solid #dce7e0;padding:9px;text-align:right;vertical-align:top;white-space:pre-wrap}th{background:#087443;color:white}tr:nth-child(even){background:#f2f7f4}@media print{body{padding:0}}</style><h1>سجل الزيارات – NBE MY SALES PORTFOLIO</h1><p>عدد الزيارات: '+rows.length+'</p><table><thead><tr><th>م</th><th>التاريخ</th><th>اسم العميل</th><th>رقم الهاتف</th><th>الفرع</th><th>جهة العمل</th><th>نوع المنتج</th><th>ملاحظات</th></tr></thead><tbody>'+body+'</tbody></table><script>window.onload=()=>window.print()<\\/script></html>');
 w.document.close();
}
function editVisit(id){
 const v=visitReports.find(x=>String(x.id)===String(id));if(!v)return;
 visitEditId=v.id;
 const linked=customers.find(c=>String(c.id)===String(v.customerId));
 el("visitName").value=linked?.name||v.customerName||"";
 el("visitNational").value=linked?.national||v.customerNational||"";
 el("visitPhone").value=v.customerPhone||linked?.phone||"";
 el("visitJob").value=linked?.job||v.customerJob||"";
 el("visitEmployer").value=linked?.employer||v.entity||"";
 el("visitBranch").value="رشيد - 394";
 el("visitDate").value=v.visitDate||"";
 el("visitProduct").value=v.product==="قرض"?"قرض":"كريدت";
 el("visitNotes").value=v.notes||"";
 el("visitFormTitle").textContent="تعديل تقرير الزيارة";
 el("visitSave").textContent="حفظ التعديلات";el("visitForm").scrollIntoView({behavior:"smooth",block:"start"});
}
visitsPage.insertAdjacentHTML("beforeend",''+
'<section class="section crm-section visit-section">'+
'<div class="section-title"><h2>تقارير الزيارات</h2><span class="badge">VISIT REPORTS</span></div>'+

'<div class="section-title"><h2 id="visitFormTitle">تسجيل زيارة جديدة</h2></div>'+
'<form id="visitForm" class="crm-form">'+
'<div class="field"><label>اسم العميل بالكامل *</label><input id="visitName" required maxlength="120" placeholder="اسم العميل"></div>'+
'<div class="field"><label>الرقم القومي (14 رقمًا) *</label><input id="visitNational" required inputmode="numeric" maxlength="14" minlength="14" pattern="[0-9٠-٩۰-۹]{14}" placeholder="الرقم القومي"></div>'+
'<div class="field"><label>رقم هاتف العميل *</label><input id="visitPhone" type="tel" inputmode="tel" maxlength="20" required placeholder="رقم الهاتف"></div>'+
'<div class="field"><label>الوظيفة</label><input id="visitJob" maxlength="100"></div>'+
'<div class="field"><label>جهة العمل</label><input id="visitEmployer" maxlength="120"></div>'+
'<div class="field"><label>الفرع</label><input id="visitBranch" value="رشيد - 394" readonly></div>'+
'<div class="field"><label>نوع المنتج *</label><select id="visitProduct" required><option value="كريدت">كريدت</option><option value="قرض">قرض</option></select></div>'+
'<div class="field"><label>تاريخ الزيارة *</label><input id="visitDate" type="date" required></div>'+
'<div class="field" style="grid-column:1/-1"><label>ملاحظات</label><textarea id="visitNotes" rows="3" maxlength="1000" placeholder="اكتب أي ملاحظات عن الزيارة أو العميل"></textarea></div>'+
'<div class="crm-form-actions"><button class="btn primary" type="submit" id="visitSave">حفظ الزيارة</button><button class="btn light-btn" type="button" id="visitCancel">إلغاء / تفريغ</button></div></form>'+
'<div class="section-title" style="margin-top:25px"><h2>سجل الزيارات السابقة</h2><span class="badge" id="visitCount">0 زيارة</span><button class="btn primary no-print" type="button" id="printAllVisits">طباعة الزيارات</button></div>'+
'<div class="crm-toolbar"><input id="visitSearch" type="search" placeholder="بحث باسم العميل أو الجهة أو المسؤول أو النتيجة"></div>'+
'<div id="visitList" class="crm-list"></div></section>');
style.textContent += ".visit-section{margin-top:22px}.visit-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.visit-card-head strong{color:var(--muted);font-size:12px}.visit-section .crm-form select{width:100%;min-width:0;padding:13px 14px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text)}.visit-section .crm-form input{background:var(--card)}@media print{.visit-section{display:none!important}}";
el("visitDate").value=new Date().toISOString().slice(0,10);
el("visitForm").addEventListener("submit",function(e){
 e.preventDefault();
 const name=el("visitName").value.trim(),national=normalizeDigits(el("visitNational").value.trim()),phone=el("visitPhone").value.trim();
 el("visitNational").value=national;
 if(!name||!/^\d{14}$/.test(national)||!phone){alert("أدخل اسم العميل والرقم القومي المكوّن من 14 رقمًا ورقم الهاتف.");return;}
 if(!el("visitDate").value){alert("أدخل تاريخ الزيارة.");return;}
 const now=new Date().toISOString();
 let customer=customers.find(c=>String(c.national)===national);
 const customerData={name,national,phone,job:el("visitJob").value.trim(),employer:el("visitEmployer").value.trim(),branch:"رشيد - 394"};
 if(customer){
  Object.assign(customer,customerData,{updatedAt:now});
  customer.history=(customer.history||[]).concat([{at:now,action:"تحديث بيانات العميل من تقرير زيارة"}]);
 }else{
  customer=Object.assign({id:"crm_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),createdAt:now,updatedAt:now,archived:false,status:"جديد",notes:"",history:[{at:now,action:"إضافة العميل من تقرير زيارة"}]},customerData);
  customers.unshift(customer);
 }
 NBEStore.setItem(KEY,JSON.stringify(customers));
 render();
 const data={customerId:customer.id,customerName:customer.name,customerNational:customer.national,customerPhone:customer.phone,customerJob:customer.job,customerBranch:"رشيد - 394",branchName:"رشيد",branchCode:"394",visitDate:el("visitDate").value,entity:el("visitEmployer").value.trim()||"—",contact:"",visitType:"زيارة تسويقية",product:el("visitProduct").value,expected:"",outcome:"",nextDate:"",notes:el("visitNotes").value.trim(),updatedAt:now};
 const editing=!!visitEditId;
 if(editing){const old=visitReports.find(v=>String(v.id)===String(visitEditId));if(!old)return;Object.assign(old,data);}
 else visitReports.unshift({...data,id:"visit_"+Date.now()+"_"+Math.random().toString(36).slice(2,8),createdAt:now});
 saveVisitReports();resetVisitForm();alert(editing?"تم تحديث بيانات العميل في CRM وتحديث تقرير الزيارة.":"تم حفظ الزيارة وإضافة/تحديث بيانات العميل في CRM.");
});
el("visitCancel").addEventListener("click",resetVisitForm);
el("visitSearch").addEventListener("input",renderVisitReports);
el("visitNational").addEventListener("change",()=>{const n=normalizeDigits(el("visitNational").value.trim());el("visitNational").value=n;const c=customers.find(x=>String(x.national)===n);if(c){el("visitName").value=c.name||"";el("visitPhone").value=c.phone||"";el("visitJob").value=c.job||"";el("visitEmployer").value=c.employer||"";el("visitBranch").value=c.branch||"";}});
 el("printAllVisits").addEventListener("click",printAllVisitReports);
el("visitList").addEventListener("click",function(e){
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.visitEdit)editVisit(b.dataset.visitEdit);
 if(b.dataset.visitPrint)printVisitReport(b.dataset.visitPrint);
 if(b.dataset.visitDelete){const v=visitReports.find(x=>String(x.id)===String(b.dataset.visitDelete));if(v&&confirm("هل تريد حذف تقرير الزيارة؟")){visitReports=visitReports.filter(x=>String(x.id)!==String(v.id));saveVisitReports();}}
});
if(window.NBEStorageReady)window.NBEStorageReady.then(loadVisitReports).catch(()=>loadVisitReports());else loadVisitReports();

if(window.NBEStorageReady)window.NBEStorageReady.then(load).catch(()=>load());else load();
})();
