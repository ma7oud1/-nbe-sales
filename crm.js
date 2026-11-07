
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
if(!page)return;
page.insertAdjacentHTML("beforeend",''+
'<div class="section crm-section">'+
'<div class="section-title"><h2 id="crmFormTitle">إضافة عميل جديد</h2><span class="badge">CUSTOMER CRM</span></div>'+
'<form id="crmForm" class="crm-form">'+
'<div class="field"><label>اسم العميل بالكامل *</label><input id="crmName" required maxlength="120"></div>'+
'<div class="field"><label>الرقم القومي (14 رقمًا) *</label><input id="crmNational" required inputmode="numeric" maxlength="14" minlength="14" pattern="[0-9]{14}"></div>'+
'<div class="field"><label>رقم الهاتف *</label><input id="crmPhone" required inputmode="tel" maxlength="20"></div>'+
'<div class="field"><label>الوظيفة</label><input id="crmJob" maxlength="100"></div>'+
'<div class="field"><label>جهة العمل</label><input id="crmEmployer" maxlength="120"></div>'+
'<div class="field"><label>الفرع</label><input id="crmBranch" maxlength="100"></div>'+
'<div class="field"><label>حالة العميل</label><select id="crmStatus"><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div class="field"><label>ملاحظات</label><input id="crmNotes" maxlength="500"></div>'+
'<div class="crm-form-actions"><button class="btn primary" type="submit" id="crmSubmit">حفظ العميل</button><button class="btn light-btn" type="button" id="crmCancel">تفريغ الحقول</button></div><input type="hidden" id="crmEditId"></form>'+
'<div class="section-title" style="margin-top:25px"><h2>سجل العملاء</h2><span class="badge" id="crmCount">0 عميل</span></div>'+
'<div class="crm-toolbar"><input id="crmSearch" type="search" placeholder="بحث بالاسم أو الهاتف أو الرقم القومي أو جهة العمل"><select id="crmFilter"><option value="all">كل الحالات</option><option>جديد</option><option>جاري التواصل</option><option>مستوفي</option><option>تم البيع</option><option>غير نشط</option></select></div>'+
'<div id="crmList" class="crm-list"></div>'+
'</div>');
function el(id){return document.getElementById(id);}
function safe(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function load(){try{const x=JSON.parse(NBEStore.getItem(KEY)||"[]");customers=Array.isArray(x)?x:[];}catch(e){customers=[];}render();}
window.refreshNbeCrm=load;
function save(){NBEStore.setItem(KEY,JSON.stringify(customers));render();}
function reset(){el("crmForm").reset();el("crmEditId").value="";el("crmNational").readOnly=false;el("crmSubmit").textContent="حفظ العميل";el("crmFormTitle").textContent="إضافة عميل جديد";}
function render(){
 const q=(el("crmSearch").value||"").trim().toLowerCase(),filter=el("crmFilter").value;
 const rows=customers.filter(c=>(filter==="all"||c.status===filter)&&[c.name,c.national,c.phone,c.employer,c.job].some(v=>String(v||"").toLowerCase().includes(q)));
 el("crmCount").textContent=customers.length+" عميل";
 if(!rows.length){el("crmList").innerHTML='<div class="crm-empty">لا توجد نتائج</div>';return;}
 el("crmList").innerHTML=rows.map(c=>'<article class="crm-card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3>'+safe(c.name)+'</h3><span class="follow-status">'+safe(c.status)+'</span></div><small>آخر تحديث: '+new Date(c.updatedAt||c.createdAt).toLocaleDateString("ar-EG")+'</small></div><div class="crm-meta"><span>الرقم القومي: '+safe(c.national)+'</span><span>الهاتف: '+safe(c.phone)+'</span><span>الوظيفة: '+safe(c.job||"—")+'</span><span>جهة العمل: '+safe(c.employer||"—")+'</span><span>الفرع: '+safe(c.branch||"—")+'</span><span>ملاحظات: '+safe(c.notes||"—")+'</span></div><div class="crm-actions no-print"><button class="btn light-btn" data-edit="'+safe(c.id)+'">تعديل</button><button class="btn light-btn" data-archive="'+safe(c.id)+'">'+(c.archived?"إعادة تنشيط":"تعطيل العميل")+'</button><button class="btn light-btn" data-history="'+safe(c.id)+'">سجل التعديلات</button></div></article>').join("");
}
el("crmForm").addEventListener("submit",function(e){
 e.preventDefault();
 const id=el("crmEditId").value,name=el("crmName").value.trim(),national=el("crmNational").value.trim(),phone=el("crmPhone").value.trim();
 if(!name||!/^\d{14}$/.test(national)||!phone){alert("أدخل الاسم والرقم القومي المكوّن من 14 رقمًا ورقم الهاتف.");return;}
 if(customers.some(c=>c.national===national&&c.id!==id)){alert("هذا الرقم القومي مسجل بالفعل ولا يمكن تكراره.");return;}
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
 renderVisitCustomerOptions();
}
function renderVisitReports(){
 const list=el("visitList");if(!list)return;
 const query=(el("visitSearch")?.value||"").trim().toLowerCase();
 const rows=visitReports.filter(v=>[v.customerName,v.entity,v.contact,v.outcome,v.notes,v.product].some(x=>String(x||"").toLowerCase().includes(query)));
 el("visitCount").textContent=visitReports.length+" زيارة";
 if(!rows.length){list.innerHTML='<div class="crm-empty">لا توجد زيارات مسجلة حتى الآن</div>';return;}
 list.innerHTML=rows.slice().sort((a,b)=>String(b.visitDate||"").localeCompare(String(a.visitDate||""))).map(v=>{
  const customer=customers.find(c=>String(c.id)===String(v.customerId));
  return '<article class="crm-card visit-card"><div class="visit-card-head"><div><h3>'+safe(v.entity||"زيارة")+'</h3><span class="follow-status">'+safe(v.visitType||"زيارة تسويقية")+'</span></div><strong>'+safe(v.visitDate||"—")+'</strong></div>'+
  '<div class="crm-meta"><span>العميل المرتبط: '+safe(customer?.name||v.customerName||"—")+'</span><span>جهة العمل: '+safe(v.entity||"—")+'</span><span>المسؤول: '+safe(v.contact||"—")+'</span><span>المنتج: '+safe(v.product||"—")+'</span><span>العملاء المتوقعون: '+safe(v.expected||"0")+'</span><span>المتابعة القادمة: '+safe(v.nextDate||"—")+'</span><span>نتيجة الزيارة: '+safe(v.outcome||"—")+'</span><span>ملاحظات: '+safe(v.notes||"—")+'</span></div>'+
  '<div class="crm-actions no-print"><button class="btn light-btn" type="button" data-visit-edit="'+safe(v.id)+'">تعديل</button><button class="btn light-btn" type="button" data-visit-print="'+safe(v.id)+'">طباعة التقرير</button><button class="btn danger small-btn" type="button" data-visit-delete="'+safe(v.id)+'">حذف</button></div></article>';
 }).join("");
}
function printVisitReport(id){
 const v=visitReports.find(x=>String(x.id)===String(id));if(!v)return;
 const customer=customers.find(c=>String(c.id)===String(v.customerId));
 const fields=[["اسم العميل",customer?.name||v.customerName||"—"],["رقم الهاتف",customer?.phone||"—"],["جهة العمل",v.entity||"—"],["المسؤول",v.contact||"—"],["تاريخ الزيارة",v.visitDate||"—"],["نوع الزيارة",v.visitType||"—"],["المنتج",v.product||"—"],["عدد العملاء المتوقعين",v.expected||"0"],["موعد المتابعة",v.nextDate||"—"],["نتيجة الزيارة",v.outcome||"—"],["ملاحظات",v.notes||"—"]];
 const esc=x=>String(x??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const w=window.open("","_blank","width=850,height=900");
 if(!w){alert("اسمح بفتح نافذة الطباعة لهذا الموقع ثم حاول مرة أخرى.");return;}
 w.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تقرير زيارة</title><style>body{font-family:Tahoma,Arial;padding:32px;color:#18352b}header{background:#087443;color:#fff;padding:22px;border-radius:14px}h1{font-size:22px;margin:0 0 8px}p{margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}.item{border:1px solid #dce7e0;border-radius:9px;padding:13px;min-height:45px}.label{font-size:12px;color:#718087;margin-bottom:8px}.value{font-size:15px;white-space:pre-wrap;line-height:1.7}.wide{grid-column:1/-1}</style><header><h1>تقرير زيارة – NBE MY SALES PORTFOLIO</h1><p>تقرير متابعة زيارة عميل / جهة</p></header><div class="grid">'+fields.map((f,i)=>'<div class="item '+(i>=9?"wide":"")+'"><div class="label">'+esc(f[0])+'</div><div class="value">'+esc(f[1])+'</div></div>').join("")+'</div><script>window.onload=()=>window.print()<\/script></html>');
 w.document.close();
}
function editVisit(id){
 const v=visitReports.find(x=>String(x.id)===String(id));if(!v)return;
 visitEditId=v.id;renderVisitCustomerOptions(v.customerId);el("visitCustomer").value=v.customerId||"";
 el("visitDate").value=v.visitDate||"";el("visitEntity").value=v.entity||"";el("visitContact").value=v.contact||"";
 el("visitType").value=v.visitType||"زيارة تسويقية";el("visitProduct").value=v.product||"كارت ائتمان";
 el("visitExpected").value=v.expected??"";el("visitOutcome").value=v.outcome||"";el("visitNextDate").value=v.nextDate||"";
 el("visitNotes").value=v.notes||"";el("visitFormTitle").textContent="تعديل تقرير الزيارة";
 el("visitSave").textContent="حفظ التعديلات";el("visitForm").scrollIntoView({behavior:"smooth",block:"start"});
}
page.insertAdjacentHTML("beforeend",''+
'<section class="section crm-section visit-section">'+
'<div class="section-title"><h2>تقارير الزيارات</h2><span class="badge">VISIT REPORTS</span></div>'+
'<div class="crm-warning">كل تقرير زيارة مستقل ومرتبط بملف عميل موجود في سجل العملاء. احفظ بيانات الزيارة ونتيجتها وموعد المتابعة.</div>'+
'<div class="section-title"><h2 id="visitFormTitle">تسجيل زيارة جديدة</h2></div>'+
'<form id="visitForm" class="crm-form">'+
'<div class="field"><label>العميل المسجل *</label><select id="visitCustomer" required><option value="">اختر عميلاً مسجلاً</option></select></div>'+
'<div class="field"><label>تاريخ الزيارة *</label><input id="visitDate" type="date" required></div>'+
'<div class="field"><label>اسم الجهة / الشركة *</label><input id="visitEntity" required maxlength="150" placeholder="اسم جهة العمل أو الشركة"></div>'+
'<div class="field"><label>المسؤول الذي تمت مقابلته</label><input id="visitContact" maxlength="120"></div>'+
'<div class="field"><label>نوع الزيارة</label><select id="visitType"><option>زيارة تسويقية</option><option>زيارة متابعة</option><option>زيارة استكمال مستندات</option><option>زيارة تعاقد / تفعيل</option><option>زيارة أخرى</option></select></div>'+
'<div class="field"><label>المنتج الذي تم تسويقه</label><select id="visitProduct"><option>كارت ائتمان</option><option>قرض شخصي</option><option>كارت ائتمان وقرض شخصي</option><option>منتج آخر</option></select></div>'+
'<div class="field"><label>عدد العملاء المتوقعين</label><input id="visitExpected" type="number" min="0" step="1" placeholder="0"></div>'+
'<div class="field"><label>موعد المتابعة القادمة</label><input id="visitNextDate" type="date"></div>'+
'<div class="field" style="grid-column:1/-1"><label>نتيجة الزيارة</label><input id="visitOutcome" maxlength="500" placeholder="ملخص ما تم خلال الزيارة"></div>'+
'<div class="field" style="grid-column:1/-1"><label>ملاحظات إضافية</label><input id="visitNotes" maxlength="1000" placeholder="التفاصيل والخطوات المطلوبة"></div>'+
'<div class="crm-form-actions"><button class="btn primary" type="submit" id="visitSave">حفظ الزيارة</button><button class="btn light-btn" type="button" id="visitCancel">إلغاء / تفريغ</button></div></form>'+
'<div class="section-title" style="margin-top:25px"><h2>سجل الزيارات السابقة</h2><span class="badge" id="visitCount">0 زيارة</span></div>'+
'<div class="crm-toolbar"><input id="visitSearch" type="search" placeholder="بحث باسم العميل أو الجهة أو المسؤول أو النتيجة"></div>'+
'<div id="visitList" class="crm-list"></div></section>');
style.textContent += ".visit-section{margin-top:22px}.visit-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.visit-card-head strong{color:var(--muted);font-size:12px}.visit-section .crm-form select{width:100%;min-width:0;padding:13px 14px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text)}.visit-section .crm-form input{background:var(--card)}@media print{.visit-section{display:none!important}}";
el("visitDate").value=new Date().toISOString().slice(0,10);
el("visitForm").addEventListener("submit",function(e){
 e.preventDefault();const customer=customers.find(c=>String(c.id)===String(el("visitCustomer").value));
 if(!customer){alert("اختر عميلاً مسجلاً أولاً.");return;}
 const data={customerId:customer.id,customerName:customer.name,visitDate:el("visitDate").value,entity:el("visitEntity").value.trim(),contact:el("visitContact").value.trim(),visitType:el("visitType").value,product:el("visitProduct").value,expected:el("visitExpected").value,outcome:el("visitOutcome").value.trim(),nextDate:el("visitNextDate").value,notes:el("visitNotes").value.trim(),updatedAt:new Date().toISOString()};
 if(!data.visitDate||!data.entity){alert("أكمل تاريخ الزيارة واسم الجهة.");return;}
 const editing=!!visitEditId;
 if(editing){const old=visitReports.find(v=>String(v.id)===String(visitEditId));if(!old)return;Object.assign(old,data);}
 else visitReports.unshift({...data,id:"visit_"+Date.now()+"_"+Math.random().toString(36).slice(2,8),createdAt:new Date().toISOString()});
 saveVisitReports();resetVisitForm();alert(editing?"تم تحديث تقرير الزيارة.":"تم حفظ تقرير الزيارة.");
});
el("visitCancel").addEventListener("click",resetVisitForm);
el("visitSearch").addEventListener("input",renderVisitReports);
el("visitCustomer").addEventListener("change",()=>{const c=customers.find(x=>String(x.id)===String(el("visitCustomer").value));if(c&&!el("visitEntity").value)el("visitEntity").value=c.employer||"";});
el("visitList").addEventListener("click",function(e){
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.visitEdit)editVisit(b.dataset.visitEdit);
 if(b.dataset.visitPrint)printVisitReport(b.dataset.visitPrint);
 if(b.dataset.visitDelete){const v=visitReports.find(x=>String(x.id)===String(b.dataset.visitDelete));if(v&&confirm("هل تريد حذف تقرير الزيارة؟")){visitReports=visitReports.filter(x=>String(x.id)!==String(v.id));saveVisitReports();}}
});
loadVisitReports();

if(window.NBEStorageReady)window.NBEStorageReady.then(load).catch(()=>load());else load();
})();
