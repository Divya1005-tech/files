const KEY='meridian-v1';
const T={'Residential Property':{cls:'Real Estate',d:180,c:.08,t:.125},'Gold':{cls:'Commodity',d:7,c:.02,t:.125},'FD':{cls:'Debt',d:1,c:.005,t:0},'Bond':{cls:'Debt',d:7,c:.005,t:.125},'Stocks':{cls:'Equity',d:3,c:.005,t:.125},'Equity MF':{cls:'Equity',d:3,c:.005,t:.125},'Debt MF':{cls:'Debt',d:3,c:.003,t:.3},'Mutual Fund (not split)':{cls:'Unclassified',d:3,c:.005,t:.125},'SIF':{cls:'Equity',d:30,c:.01,t:.125},'PMS':{cls:'Equity',d:30,c:.02,t:.125},'AIF':{cls:'Alternative',d:365,c:.03,t:.125},'REIT':{cls:'REIT',d:3,c:.005,t:.125}};
const COL={Equity:'#3446D4',Debt:'#0F8B6D',Commodity:'#C98A14','Real Estate':'#8A5CC2',REIT:'#2A9DC9',Alternative:'#C4476A',Unclassified:'#98A2AD'};
const B=[['Today',1],['This week',7],['This month',30],['3 months',90],['Later',1e9]];
const seed=()=>({a:[{id:1,name:'Residential property',type:'Residential Property',value:25e6},{id:2,name:'Gold',type:'Gold',value:2e6},{id:3,name:'FD holding',type:'FD',value:6e6},{id:4,name:'Mutual funds',type:'Mutual Fund (not split)',value:18.3e6},{id:5,name:'Equity holding',type:'Stocks',value:15e6},{id:6,name:'PMS holding',type:'PMS',value:7e6},{id:7,name:'AIF holding',type:'AIF',value:13e6}],i:[{id:1,k:'inc',name:'Pension (₹5 L/year)',cat:'Variable',amt:41667},{id:2,k:'exp',name:'Household',cat:'Fixed',amt:1e5},{id:3,k:'exp',name:'Medical',cat:'Variable',amt:1e5}],l:[],n:[],o:[{id:1,name:'Outstanding pension premium',amt:2e6}],none:{}});
let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.a)S=seed();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum=(a,f)=>a.reduce((s,x)=>s+(+f(x)||0),0);
const f=n=>{n=+n||0;const s=n<0?'-':'';n=Math.abs(n);return s+'₹'+(n>=1e7?(n/1e7).toFixed(2)+' Cr':n>=1e5?(n/1e5).toFixed(2)+' L':n.toLocaleString('en-IN',{maximumFractionDigits:0}))};
let tab='home';
const LIST={asset:'a',item:'i',loan:'l',ins:'n',ob:'o'};

function calc(){
 const rows=S.a.map(a=>{const t=T[a.type]||T.Stocks;const inv=a.inv>0?+a.inv:+a.value;const cost=a.value*t.c+Math.max(0,a.value-inv)*t.t;return{...a,cls:t.cls,d:t.d,net:a.value-cost}});
 const gross=sum(S.a,x=>x.value),debt=sum(S.l,x=>x.out)+sum(S.o,x=>x.amt);
 const exp=sum(S.i.filter(x=>x.k=='exp'),x=>x.amt),inc=sum(S.i.filter(x=>x.k=='inc'),x=>x.amt);
 const real=sum(rows,r=>r.net)-debt,burn=Math.max(0,exp-inc),liq=sum(rows.filter(r=>r.d<=90),r=>r.net);
 const checks=[
  {t:'Split your mutual funds into equity and debt',u:'Unlocks accurate allocation',tab:'assets',done:!S.a.some(a=>a.type=='Mutual Fund (not split)')},
  {t:'Add amount invested for each asset',u:'Unlocks returns and accurate exit-tax estimates',tab:'assets',done:S.a.every(a=>a.inv>0)},
  {t:'Add salary or business income',u:'Unlocks monthly surplus',tab:'cash',done:S.i.some(x=>x.k=='inc'&&x.cat!='Variable')},
  {t:'Add your loans, or mark none',u:'Unlocks true net worth and EMI load',tab:'liab',done:S.l.length>0||!!S.none.l},
  {t:'Add insurance policies, or mark none',u:'Unlocks cover review',tab:'liab',done:S.n.length>0||!!S.none.n},
  {t:'Add AIF commitments or other dues, or mark none',u:'Unlocks complete obligations view',tab:'liab',done:S.o.length>1||!!S.none.o}];
 const done=checks.filter(c=>c.done).length;
 return{rows,gross,debt,adj:gross-debt,real,exp,inc,burn,liq,checks,score:Math.round(done/checks.length*100),next:checks.find(c=>!c.done)};
}

function home(){
 const c=calc(),tot=sum(c.rows,r=>r.net)||1;let cum=0;
 const lad=B.map(([n,max],i)=>{const lo=i?B[i-1][1]:0;const v=sum(c.rows.filter(r=>r.d>lo&&r.d<=max),r=>r.net);cum+=v;return`<span>${n}</span><div class="bar"><i style="width:${Math.max(0,cum/tot*100)}%"></i></div><span class="v">${f(cum)}</span>`}).join('');
 const g={};c.rows.forEach(r=>g[r.cls]=(g[r.cls]||0)+ +r.value);
 const ents=Object.entries(g).sort((a,b)=>b[1]-a[1]);
 const stack=ents.map(([k,v])=>`<i style="width:${v/c.gross*100}%;background:${COL[k]}"></i>`).join('');
 const leg=ents.map(([k,v])=>`<span><i style="background:${COL[k]}"></i>${k}<em>${(v/c.gross*100).toFixed(1)}%</em></span>`).join('');
 const run=c.burn?(c.liq/c.burn/12).toFixed(1)+' years':'Income covers expenses';
 return`<section class="hero"><p class="lbl">Realizable net worth</p><h1 class="num">${f(c.real)}</h1><p class="sub">Headline net worth ${f(c.adj)}. The gap is estimated exit costs and tax.</p></section>
 ${c.next?`<button class="next" data-act="tab" data-k="${c.next.tab}"><b>${c.next.t}</b><span>${c.next.u}</span></button>`:''}
 <section class="card"><h2>How fast can you reach your money?</h2><div class="lad">${lad}</div><p class="note">Cumulative cash after estimated costs. Rates are rough estimates, not tax advice.</p></section>
 <section class="card"><h2>What your wealth is made of</h2><div class="stack">${stack}</div><div class="leg">${leg}</div></section>
 <section class="grid"><div class="card"><p class="lbl">Gross assets</p><p class="num">${f(c.gross)}</p></div><div class="card"><p class="lbl">Loans and dues</p><p class="num">${f(c.debt)}</p></div><div class="card"><p class="lbl">Monthly expenses</p><p class="num">${f(c.exp)}</p></div><div class="card"><p class="lbl">Runway (assets under 90 days)</p><p class="num">${run}</p></div></section>`;
}

const row=(t,x,title,sub,val)=>`<div class="row"><div><b>${esc(title)}</b><small>${sub}</small></div><div class="r"><b>${val}</b><span>${t=='asset'&&x.type=='Mutual Fund (not split)'?`<button data-act="split" data-id="${x.id}">Split</button>`:''}<button data-act="edit" data-t="${t}" data-id="${x.id}">Edit</button><button data-act="del" data-t="${t}" data-id="${x.id}">Delete</button></span></div></div>`;
const head=(h,t,k='',l='Add')=>`<div class="head"><h2>${h}</h2><button class="add" data-act="add" data-t="${t}" data-k="${k}">${l}</button></div>`;

function assets(){
 const c=calc();
 return`<section class="card">${head('Assets','asset')}${c.rows.map(r=>row('asset',r,r.name,`<span class="chip${r.cls=='Unclassified'?' warn':''}">${r.cls}</span>${esc(r.type)}${r.inv>0?'':' · invested amount missing'}`,f(r.value))).join('')||'<p class="note">No assets yet.</p>'}<div class="tot"><span>Total</span><span>${f(c.gross)}</span></div></section>`;
}
function cash(){
 const c=calc(),L=k=>S.i.filter(x=>x.k==k);
 const sec=(h,k)=>`<section class="card">${head(h,'item',k)}${L(k).map(x=>row('item',x,x.name,`<span class="chip">${x.cat}</span>per month`,f(x.amt))).join('')||'<p class="note">Nothing added yet.</p>'}</section>`;
 return sec('Income','inc')+sec('Expenses','exp')+`<section class="card"><div class="tot"><span>Monthly surplus</span><span style="color:var(--${c.inc-c.exp>=0?'ok':'bad'})">${f(c.inc-c.exp)}</span></div></section>`;
}
function liab(){
 const none=(k,t)=>S.none[k]?'<p class="note">Marked as none.</p>':`<p class="note">Nothing added. <button class="lnk" data-act="none" data-id="${k}">I have none</button></p>`;
 return`<section class="card">${head('Loans','loan')}${S.l.map(x=>row('loan',x,x.name,`<span class="chip">${x.cat}</span>EMI ${f(x.emi)} · ${x.rate||0}%`,f(x.out))).join('')||none('l')}</section>
 <section class="card">${head('Insurance','ins')}${S.n.map(x=>row('ins',x,x.name,`<span class="chip">${x.cat}</span>Premium ${f(x.prem)} a year`,f(x.sum))).join('')||none('n')}</section>
 <section class="card">${head('Other dues and commitments','ob')}${S.o.map(x=>row('ob',x,x.name,'Counted against net worth',f(x.amt))).join('')||none('o')}<p class="note">Include premiums owed and undrawn AIF commitments.</p></section>`;
}
function health(){
 const c=calc();
 return`<section class="card"><div class="head"><div class="ring" style="background:conic-gradient(var(--acc) ${c.score*3.6}deg,var(--line) 0)"><b>${c.score}%</b></div><div style="flex:1;margin-left:16px"><h2 style="margin:0">Data health</h2><p class="note">Each item you complete unlocks more accurate insights.</p></div></div>${c.checks.map(k=>`<button class="chk ${k.done?'d':''}" data-act="tab" data-k="${k.tab}"><i>${k.done?'✓':''}</i><span>${k.t}<small>${k.u}</small></span></button>`).join('')}</section>
 <section class="card"><h2>Your data</h2><p class="note">Saved only in this browser on this device.</p><div class="acts" style="justify-content:flex-start"><button class="ghost" data-act="reset">Reset to sample data</button></div></section>`;
}

const VIEWS={home,assets,cash,liab,health},NAMES={home:'Home',assets:'Assets',cash:'Cash flow',liab:'Liabilities',health:'Data health'};
function render(){
 $('#v').innerHTML=VIEWS[tab]();
 $('#nav').innerHTML=Object.keys(NAMES).map(k=>`<button data-act="tab" data-k="${k}" ${k==tab?'aria-current="page"':''}>${NAMES[k]}</button>`).join('');
}

const CATS={loan:['Home','Business','Vehicle','Personal','Education','Other'],ins:['Life','Health','General','Pension / Annuity']};
function fields(t,k){
 if(t=='asset')return[['name','Name','text'],['type','Type','sel',Object.keys(T)],['value','Current value (₹)','number'],['inv','Amount invested (₹, optional)','number']];
 if(t=='item')return[['name','Name','text'],['cat','Category','sel',k=='inc'?['Salary','Business','Variable']:['Fixed','Variable','Business']],['amt','Amount per month (₹)','number']];
 if(t=='loan')return[['name','Loan name','text'],['cat','Category','sel',CATS.loan],['out','Outstanding principal (₹)','number'],['emi','EMI per month (₹)','number'],['rate','Interest rate (%)','number']];
 if(t=='ins')return[['name','Policy name','text'],['cat','Category','sel',CATS.ins],['sum','Sum assured or current value (₹)','number'],['prem','Premium per year (₹)','number']];
 if(t=='ob')return[['name','Description','text'],['amt','Amount (₹)','number']];
 return[['pct','Equity share of this holding (%)','number']];
}
let ctx=null;
function openForm(t,id,k){
 const item=id?S[LIST[t]].find(x=>x.id==id):{};
 ctx={t,id,k:k||item.k};
 $('#dt').textContent=t=='split'?'Split mutual funds':(id?'Edit ':'Add ')+({asset:'asset',item:'entry',loan:'loan',ins:'policy',ob:'due'})[t];
 $('#df').innerHTML=fields(t,ctx.k).map(([n,l,ty,o])=>`<label for="f_${n}">${l}</label>`+(ty=='sel'?`<select id="f_${n}">${o.map(v=>`<option${item[n]==v?' selected':''}>${v}</option>`).join('')}</select>`:`<input id="f_${n}" type="${ty}" ${ty=='number'?'inputmode="decimal" min="0"':''} value="${esc(item[n]==null?'':item[n])}">`)).join('');
 $('#dlg').showModal();
}
$('#dx').onclick=()=>$('#dlg').close();
$('#ds').onclick=()=>{
 const {t,id,k}=ctx,v={};
 fields(t,k).forEach(([n,,ty])=>{const e=$('#f_'+n).value;v[n]=ty=='number'?(parseFloat(e)||0):e.trim()});
 if(t=='split'){
  const a=S.a.find(x=>x.id==id),p=Math.min(100,Math.max(0,v.pct))/100;
  S.a=S.a.filter(x=>x.id!=id);
  const m=(s,r)=>({id:Date.now()+s,name:a.name+(s?' (debt)':' (equity)'),type:s?'Debt MF':'Equity MF',value:Math.round(a.value*r),inv:a.inv>0?Math.round(a.inv*r):0});
  if(p>0)S.a.push(m(0,p));if(p<1)S.a.push(m(1,1-p));
 }else{
  if(t=='item')v.k=k;
  const L=S[LIST[t]];
  if(id)Object.assign(L.find(x=>x.id==id),v);else L.push({id:Date.now(),...v});
  if(t=='loan')delete S.none.l;if(t=='ins')delete S.none.n;if(t=='ob')delete S.none.o;
 }
 save();$('#dlg').close();render();
};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;
 const a=b.dataset.act,d=b.dataset;
 if(a=='tab'){tab=d.k;render();window.scrollTo(0,0)}
 else if(a=='add')openForm(d.t,null,d.k);
 else if(a=='edit')openForm(d.t,d.id);
 else if(a=='split')openForm('split',d.id);
 else if(a=='del'){const L=LIST[d.t];S[L]=S[L].filter(x=>x.id!=d.id);save();render()}
 else if(a=='none'){S.none[d.id]=1;save();render()}
 else if(a=='reset'){S=seed();save();render()}
});
render();
