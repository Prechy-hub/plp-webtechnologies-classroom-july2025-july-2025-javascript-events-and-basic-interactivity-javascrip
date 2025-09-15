/* helpers */
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));
const on = (el, ev, fn, opts)=>el.addEventListener(ev, fn, opts);
const debounce = (fn, wait=300)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };
const toastEl = qs('#toast');
function toast(msg, ms=1500){ toastEl.textContent=msg; toastEl.hidden=false; clearTimeout(toastEl._t); toastEl._t=setTimeout(()=>toastEl.hidden=true, ms); }

/* theme toggle */
const themeBtn = qs('#themeToggle');
function applyTheme(mode){ document.documentElement.classList.toggle('dark', mode==='dark'); themeBtn.textContent = mode==='dark'?'🌙 Dark':'🌞 Light'; themeBtn.setAttribute('aria-pressed', String(mode==='dark')); }
applyTheme(localStorage.getItem('theme')||'light');
on(themeBtn,'click',()=>{ const next=document.documentElement.classList.contains('dark')?'light':'dark'; localStorage.setItem('theme',next); applyTheme(next); });

/* header dropdown */
const menuBtn=qs('#menuBtn'), menuList=qs('#menuList');
function toggleMenu(show){ const s = show ?? menuList.hidden; menuList.hidden=!s; menuBtn.setAttribute('aria-expanded', String(s)); }
on(menuBtn,'click',()=>toggleMenu());
on(menuBtn,'keydown',e=>{ if(e.key==='ArrowDown'){ toggleMenu(true); qsa('#menuList a')[0]?.focus(); }});
on(document,'click',e=>{ if(!menuBtn.contains(e.target)&&!menuList.contains(e.target)) toggleMenu(false); });

/* Part 1: event handling */
on(qs('#clickMe'),'click',()=>toast('Clicked!'));
const hoverBox=qs('#hoverBox');
on(hoverBox,'mouseover',()=>hoverBox.style.borderColor='var(--primary)');
on(hoverBox,'mouseout',()=>hoverBox.style.borderColor='var(--ghost)');
on(hoverBox,'focus',()=>hoverBox.style.background='rgba(37,99,235,.08)');
on(hoverBox,'blur',()=>hoverBox.style.background='transparent');
const inlineBtn=qs('#inlineBtn'); inlineBtn.removeAttribute('onclick'); on(inlineBtn,'click',()=>toast('Handled by addEventListener ✅'));
on(qs('#listenerBtn'),'click',()=>toast('Event listener clicked'));
on(qs('#preventForm'),'submit',e=>{ if(!e.target.stub.value.trim()){ e.preventDefault(); toast('Form prevented: please type something'); }});

/* Tabs */
const tabBtns=qsa('.tab'), tabPanels=qsa('.tabpanel');
function activateTab(i){ tabBtns.forEach((b,idx)=>{ const active=idx===i; b.classList.toggle('is-active',active); b.setAttribute('aria-selected',String(active)); b.tabIndex=active?0:-1; tabPanels[idx].classList.toggle('is-active',active);}); tabBtns[i].focus(); }
tabBtns.forEach((btn,i)=>{ on(btn,'click',()=>activateTab(i)); on(btn,'keydown',e=>{ if(e.key==='ArrowRight') activateTab((i+1)%tabBtns.length); if(e.key==='ArrowLeft') activateTab((i-1+tabBtns.length)%tabBtns.length); }); });

/* Counter */
let score=0; const scoreEl=qs('#score'); const render=()=>scoreEl.textContent=String(score);
on(qs('#inc'),'click',()=>{score++;render();});
on(qs('#dec'),'click',()=>{score--;render();});
on(qs('#reset'),'click',()=>{score=0;render();});
on(document,'keydown',e=>{ if(e.key==='ArrowUp'){score++;render();} if(e.key==='ArrowDown'){score--;render();} });

/* Slider */
const range=qs('#range'), out=qs('#rangeValue');
on(range,'input',()=>{ out.textContent=range.value; });

/* Modal */
const modal=qs('#modal'), openModal=qs('#openModal'), closeModal=qs('#closeModal'), modalAction=qs('#modalAction'); let lastFocused;
function trapFocus(box){ const f=qsa('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',box).filter(el=>!el.disabled); const first=f[0], last=f[f.length-1]; on(box,'keydown',e=>{ if(e.key==='Tab'){ if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}} }); }
function openM(){ lastFocused=document.activeElement; modal.hidden=false; trapFocus(modal); modal.querySelector('button,[href],input')?.focus(); }
function closeM(){ modal.hidden=true; lastFocused?.focus(); }
on(openModal,'click',openM); on(closeModal,'click',closeM);
on(modal,'click',e=>{ if(e.target===modal) closeM(); });
on(document,'keydown',e=>{ if(!modal.hidden && e.key==='Escape') closeM(); });
on(modalAction,'click',()=>toast('Modal action done'));

/* FAQ Delegation */
const faqList=qs('#faqList');
on(faqList,'click',e=>{ const btn=e.target.closest('.faq__q'); if(!btn) return; const content=btn.nextElementSibling; const exp=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded',String(!exp)); content.hidden=exp; });

/* Mini dropdown inside page */
const ddBtn=qs('[data-dd-btn]'), ddMenu=qs('[data-dd-menu]');
on(ddBtn,'click',()=>{ const show=ddMenu.hidden; ddMenu.hidden=!show; ddBtn.setAttribute('aria-expanded',String(show)); });
on(ddMenu,'click',e=>{ const msg=e.target.closest('[data-toast]')?.dataset.toast; if(msg){ toast(msg); ddMenu.hidden=true; ddBtn.setAttribute('aria-expanded','false'); }});
on(document,'click',e=>{ if(!ddBtn.contains(e.target)&&!ddMenu.contains(e.target)){ ddMenu.hidden=true; ddBtn.setAttribute('aria-expanded','false'); }});

/* Todo Delegation */
const todoInput=qs('#todoInput'), addTodo=qs('#addTodo'), todoList=qs('#todoList');
function addTask(text){ const li=document.createElement('li'); li.innerHTML=`<span>${text}</span> <span class="tag">new</span> <button class="icon-btn" data-remove>🗑</button>`; todoList.appendChild(li); }
on(addTodo,'click',()=>{ const t=todoInput.value.trim(); if(!t) return toast('Type a task first'); addTask(t); todoInput.value=''; todoInput.focus(); });
on(todoList,'click',e=>{ if(e.target.matches('[data-remove]')) e.target.closest('li').remove(); });

/* Form Validation */
const form=qs('#registerForm');
const nameI=qs('#name'), emailI=qs('#email'), pwdI=qs('#password'), confirmI=qs('#confirm');
const nameE=qs('#nameError'), emailE=qs('#emailError'), pwdE=qs('#passwordError'), confirmE=qs('#confirmError');
const bar=qs('#strengthBar'), togglePwd=qs('#togglePwd');

function vName(){ const v=nameI.value.trim(); const ok=v.length>=2; nameI.setCustomValidity(ok?'':'Name must be at least 2 characters'); nameE.textContent=nameI.validationMessage; return ok; }
function vEmail(){ const v=emailI.value.trim(); const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); emailI.setCustomValidity(ok?'':'Enter a valid email like name@example.com'); emailE.textContent=emailI.validationMessage; return ok; }
function pwScore(p){ let s=0; if(p.length>=8) s++; if(/[A-Z]/.test(p)) s++; if(/[a-z]/.test(p)) s++; if(/[0-9]/.test(p)) s++; if(/[^A-Za-z0-9]/.test(p)) s++; return s; }
function vPwd(){ const p=pwdI.value; const s=pwScore(p); bar.style.width=(s/5*100)+'%'; bar.style.background= s>=4?'var(--accent)': s>=2?'orange':'var(--danger)'; const ok=s>=3; pwdI.setCustomValidity(ok?'':'Password too weak: use 8+ chars incl. upper, lower, number'); pwdE.textContent=pwdI.validationMessage; return ok; }
function vConfirm(){ const ok=confirmI.value===pwdI.value && confirmI.value.length>0; confirmI.setCustomValidity(ok?'':'Passwords do not match'); confirmE.textContent=confirmI.validationMessage; return ok; }

on(nameI,'input',debounce(vName,200));
on(emailI,'input',debounce(vEmail,200));
on(pwdI,'input',debounce(()=>{ vPwd(); vConfirm(); },150));
on(confirmI,'input',debounce(vConfirm,150));
on(togglePwd,'click',()=>{ const show=pwdI.type==='password'; pwdI.type=show?'text':'password'; togglePwd.setAttribute('aria-pressed',String(show)); });

on(form,'submit',e=>{
  const ok = vName() & vEmail() & vPwd() & vConfirm();
  if(!ok){ e.preventDefault(); toast('Fix errors before submitting'); }
  else{ e.preventDefault(); qs('#formMsg').textContent='✅ Registered successfully (demo).'; toast('Form OK'); form.reset(); bar.style.width='0%'; }
});