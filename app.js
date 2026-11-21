const TOPICS=['Заметки','Истории','Наука','Культура','Технологии','Разное'];
const ids=['3705398','4820651','1183790','1100090','1240588','4631747','4226041','2296671'];
const SEED=ids.map(n=>({id:'jr-'+n,title:'Материал JoyReactor № '+n,excerpt:'Публикация добавлена в очередь импорта. Текст и обсуждение нужно сверить с оригиналом.',topic:'Разное',tags:['JoyReactor','импорт'],status:'draft',body:'Содержание публикации пока не загружено: JoyReactor недоступен для чтения из среды публикации. Добавьте текст и полезные выдержки из комментариев через редактор.\n\nПосле проверки сохраните материал и оставьте ссылку на первоисточник.',source:'https://joyreactor.cc/post/'+n}));
const KEY='paper_articles_v1';let articles=load(),topic='all',onlyDrafts=false,desc=true;
const $=s=>document.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){try{return JSON.parse(localStorage.getItem(KEY))||SEED.slice()}catch(e){return SEED.slice()}}
function save(){localStorage.setItem(KEY,JSON.stringify(articles))}
function render(){
 const drafts=articles.filter(a=>a.status==='draft');$('#all-count').textContent=articles.length;$('#draft-count').textContent=drafts.length;$('#total').textContent=articles.length+' МАТЕРИАЛОВ';
 const counts={};articles.forEach(a=>counts[a.topic]=(counts[a.topic]||0)+1);
 $('#topics').innerHTML=TOPICS.map(t=>'<button class="nav '+(topic===t?'active':'')+'" data-topic="'+esc(t)+'">◦ '+esc(t)+' <i>'+(counts[t]||0)+'</i></button>').join('');
 $('#topics').querySelectorAll('button').forEach(b=>b.onclick=()=>{topic=b.dataset.topic;onlyDrafts=false;render()});
 $('[data-topic=all]').classList.toggle('active',topic==='all'&&!onlyDrafts);$('#drafts').classList.toggle('active',onlyDrafts);
 $('#heading').textContent=(onlyDrafts?'Черновики':topic==='all'?'Все материалы':topic)+' ↘';
 const q=$('#query').value.toLowerCase().trim();
 const list=articles.filter(a=>(topic==='all'||a.topic===topic)&&(!onlyDrafts||a.status==='draft')&&(!q||[a.title,a.excerpt,a.body,a.topic,...a.tags].join(' ').toLowerCase().includes(q)));
 list.sort((a,b)=>desc?b.id.localeCompare(a.id):a.id.localeCompare(b.id));
 $('#filter').innerHTML=(q||onlyDrafts||topic!=='all'?'Фильтр активен':'')+' <button id="clear">Сбросить ×</button>';
 $('#clear').onclick=()=>{$('#query').value='';topic='all';onlyDrafts=false;render()};
 $('#grid').innerHTML=list.map((a,i)=>card(a,i)).join('');$('#grid').hidden=!list.length;$('#empty').hidden=!!list.length;
 $('#grid').querySelectorAll('.card').forEach(el=>el.onclick=()=>read(el.dataset.id));
}
function card(a,i){
 const tones=['','lav','peach','blue','darkcard'];
 return '<article class="card '+(a.status==='draft'?'source-pending ':'')+tones[i%5]+(i===0&&topic==='all'&&!onlyDrafts?' feature':'')+'" data-id="'+esc(a.id)+'"><div class="card-top"><span class="card-topic">'+esc(a.topic)+'</span><span class="number">P.'+String(i+1).padStart(2,'0')+'</span></div>'+(a.status==='draft'?'<span class="draft">ЧЕРНОВИК · НУЖНА ПРОВЕРКА</span>':'')+'<h3>'+esc(a.title)+'</h3><p>'+esc(a.excerpt)+'</p><div class="card-bottom"><div class="tags">'+(a.tags||[]).slice(0,3).map(t=>'<span class="tag">#'+esc(t)+'</span>').join('')+'</div><span class="arrow">↗</span></div></article>';
}
function editor(a){
 $('#form').reset();$('#id').value=a?.id||'';$('#form-title').textContent=a?'Редактировать статью':'Новая статья';
 $('#title').value=a?.title||'';$('#excerpt').value=a?.excerpt||'';$('#topic').innerHTML=TOPICS.map(t=>'<option>'+t+'</option>').join('');
 $('#topic').value=a?.topic||TOPICS[0];$('#status').value=a?.status||'published';$('#tags').value=(a?.tags||[]).join(', ');
 $('#body').value=a?.body||'';$('#source').value=a?.source||'';$('#delete').hidden=!a;$('#modal').hidden=false;document.body.style.overflow='hidden';$('#title').focus();
}
function closeEditor(){$('#modal').hidden=true;document.body.style.overflow=''}
function md(s){
 s=esc(s).replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h2>$1</h2>').replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
 return s.split(/\n{2,}/).map(p=>/^<(h[23]|blockquote)/.test(p)?p:'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('');
}
function read(id){
 const a=articles.find(x=>x.id===id);if(!a)return;
 $('#reader-content').innerHTML='<div class="reader-meta">'+esc(a.topic)+' · '+(a.status==='draft'?'ЧЕРНОВИК':'PAPER JOURNAL')+'</div><h1>'+esc(a.title)+'</h1><p class="reader-excerpt">'+esc(a.excerpt)+'</p><div class="reader-tags">'+(a.tags||[]).map(t=>'<span class="tag">#'+esc(t)+'</span>').join('')+'</div><div class="reader-body">'+md(a.body)+'</div>'+(a.source?'<a class="reader-source" href="'+esc(a.source)+'" target="_blank" rel="noopener">ПЕРВОИСТОЧНИК ↗</a>':'')+'<p><button class="dark" id="edit-reader">Редактировать</button></p>';
 $('#reader').hidden=false;document.body.style.overflow='';$('#edit-reader').onclick=()=>{$('#reader').hidden=true;editor(a)};
}
function closeReader(){$('#reader').hidden=true;document.body.style.overflow=''}
$('#add').onclick=()=>editor();$('#empty-add').onclick=()=>editor();$('#close').onclick=$('#cancel').onclick=closeEditor;$('#reader-close').onclick=closeReader;
$('#form').onsubmit=e=>{
 e.preventDefault();const id=$('#id').value||'p-'+Date.now().toString(36);
 const item={id,title:$('#title').value.trim(),excerpt:$('#excerpt').value.trim(),topic:$('#topic').value,status:$('#status').value,tags:$('#tags').value.split(',').map(x=>x.trim()).filter(Boolean),body:$('#body').value,source:$('#source').value.trim()};
 const i=articles.findIndex(a=>a.id===id);if(i<0)articles.unshift(item);else articles[i]=item;save();closeEditor();render();
};
$('#delete').onclick=()=>{if(confirm('Удалить материал?')){articles=articles.filter(a=>a.id!==$('#id').value);save();closeEditor();render()}};
$('#drafts').onclick=()=>{onlyDrafts=!onlyDrafts;topic='all';render()};
$('[data-topic=all]').onclick=()=>{topic='all';onlyDrafts=false;render()};
$('#query').oninput=render;$('#search-toggle').onclick=()=>$('#query').focus();
$('#sort').onclick=()=>{desc=!desc;$('#sort').textContent=desc?'СНАЧАЛА НОВЫЕ ↓':'СНАЧАЛА СТАРЫЕ ↑';render()};
$('#export').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(articles,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='paper-articles.json';a.click();URL.revokeObjectURL(u)};
$('#import').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d))throw Error();articles=d;save();render()}catch(err){alert('Неверный JSON-файл')}e.target.value=''};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeEditor();closeReader()}});
$('#modal').onclick=e=>{if(e.target===$('#modal'))closeEditor()};$('#reader').onclick=e=>{if(e.target===$('#reader'))closeReader()};
render();