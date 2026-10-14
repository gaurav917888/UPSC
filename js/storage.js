(function(){
  'use strict';
  const KEYS = {
    settings:'csat_platform_settings', progress:'csat_platform_progress', bookmarks:'csat_platform_bookmarks',
    notes:'csat_platform_notes', attempts:'csat_platform_attempts', mistakes:'csat_platform_mistakes',
    bank:'csat_platform_questionbank', active:'csat_platform_active_test', custom:'csat_platform_custom_mock'
  };
  const defaults = {
    theme:'system', fontSize:'medium', spacing:'comfortable', timerEnabled:true, timerWarnings:true,
    autoSubmit:true, confirmSubmit:true, showPalette:true, highContrast:false, reducedMotion:true,
    keyboardShortcuts:true, sidebarCollapsed:false, lastYear:2026, confirmReset:true
  };
  function parse(key, fallback){
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch(e){ console.warn('Storage read failed:', key, e); return fallback; }
  }
  function save(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e){ console.warn('Storage write failed:', key, e); return false; }
  }
  function list(key){ const value=parse(key,[]); return Array.isArray(value)?value:[]; }
  function object(key){ const value=parse(key,{}); return value && typeof value==='object' && !Array.isArray(value)?value:{}; }
  function getSettings(){ return {...defaults, ...object(KEYS.settings)}; }
  function setSetting(name,value){ const settings=getSettings(); settings[name]=value; return save(KEYS.settings,settings); }
  function getBank(){
    const value=object(KEYS.bank);
    if(!value.papers || typeof value.papers!=='object') value.papers={};
    return value;
  }
  function getQuestions(year){ const bank=getBank(); const p=bank.papers[String(year)]; return Array.isArray(p)?p:[]; }
  function allQuestions(){ const bank=getBank(); return Object.keys(bank.papers).sort().flatMap(y=>(bank.papers[y]||[]).map(q=>({...q,year:Number(q.year||y)}))); }
  function storeQuestionBank(parsed){
    let incoming={}; const allPassages={};
    if(parsed && Array.isArray(parsed.papers)){
      parsed.papers.forEach(p=>{ if(p && p.year && Array.isArray(p.questions)) incoming[String(p.year)]=p.questions.map(q=>({...q,year:Number(q.year||p.year)})); if(p && p.year && Array.isArray(p.passages)) allPassages[String(p.year)]=p.passages; });
    } else if(parsed && parsed.papers && typeof parsed.papers==='object'){
      Object.entries(parsed.papers).forEach(([y,qs])=>{ if(Array.isArray(qs)) incoming[String(y)]=qs.map(q=>({...q,year:Number(q.year||y)})); else if(qs&&Array.isArray(qs.questions)){incoming[String(y)]=qs.questions.map(q=>({...q,year:Number(q.year||y)}));if(Array.isArray(qs.passages))allPassages[String(y)]=qs.passages;} });
    } else if(parsed && parsed.year && Array.isArray(parsed.questions)){
      incoming[String(parsed.year)]=parsed.questions.map(q=>({...q,year:Number(q.year||parsed.year)})); if(Array.isArray(parsed.passages))allPassages[String(parsed.year)]=parsed.passages;
    } else if(Array.isArray(parsed)){
      parsed.forEach(p=>{ if(p && p.year && Array.isArray(p.questions)) incoming[String(p.year)]=p.questions.map(q=>({...q,year:Number(q.year||p.year)})); });
    }
    if(parsed && Array.isArray(parsed.passages) && parsed.year) allPassages[String(parsed.year)]=parsed.passages;
    const years=Object.keys(incoming);
    if(!years.length) throw new Error('JSON structure not recognised. Use {"year": 2021, "questions": [...]} or {"papers": {"2021": [...]}}.');
    const bank=getBank();
    for(const [year,questions] of Object.entries(incoming)){
      const ids=new Set(), numbers=new Set();
      const passages=new Map((allPassages[year]||[]).map(p=>[String(p.id),p]));
      questions.forEach((q,i)=>{
        if(!q || typeof q!=='object') throw new Error(`Invalid question at ${year}, row ${i+1}.`);
        if(q.passage_id && !q.passage_text && passages.has(String(q.passage_id))) q.passage_text=passages.get(String(q.passage_id)).passage_text||passages.get(String(q.passage_id)).text||'';
        q.id=String(q.id||`${year}-Q${q.question_number||i+1}`).trim();
        if(!q.id) throw new Error(`Question at ${year}, row ${i+1} has an empty id.`);
        q.year=Number(q.year||year); q.question_number=Number(q.question_number||i+1);
        if(q.year!==Number(year)) throw new Error(`Question ${q.id} declares year ${q.year} but is stored under paper ${year}.`);
        if(!Number.isInteger(q.question_number)||q.question_number<1||q.question_number>80) throw new Error(`Question ${q.id} has invalid question_number ${q.question_number}; expected an integer from 1 to 80.`);
        if(ids.has(String(q.id))) throw new Error(`Duplicate question id ${q.id} in ${year}.`);
        if(numbers.has(q.question_number)) throw new Error(`Duplicate question number ${q.question_number} in ${year}.`);
        ids.add(String(q.id)); numbers.add(q.question_number);
        if(!q.question_text || !Array.isArray(q.options)) throw new Error(`Question ${q.id} is missing question_text or options.`);
        q.options=q.options.map((o,j)=>typeof o==='string'?{id:['A','B','C','D'][j]||String(j+1),text:o}:o);
      });
      incoming[year]=questions.sort((a,b)=>a.question_number-b.question_number);
    }
    const merged={...bank.papers,...incoming};
    const allIds=new Set();
    Object.entries(merged).forEach(([year,questions])=>(questions||[]).forEach(q=>{
      const id=String(q.id||'');
      if(id && allIds.has(id)) throw new Error(`Duplicate question id ${id} across papers. Prefix IDs with the year, such as 2023-Q1.`);
      if(id) allIds.add(id);
    }));
    const ok=save(KEYS.bank,{papers:merged,updatedAt:new Date().toISOString()});
    if(!ok) throw new Error('Browser storage is unavailable or full. Export your progress and try a smaller dataset.');
    return {years,counts:Object.fromEntries(years.map(y=>[y,incoming[y].length]))};
  }
  function exportAll(){
    return {app:'CSAT Command Centre',schema_version:1,exported_at:new Date().toISOString(),settings:getSettings(),
      progress:object(KEYS.progress),bookmarks:list(KEYS.bookmarks),notes:object(KEYS.notes),attempts:list(KEYS.attempts),
      mistakes:object(KEYS.mistakes),questionbank:getBank(),custom:object(KEYS.custom)};
  }
  function importBackup(data){
    if(!data || typeof data!=='object' || !data.app || !String(data.app).includes('CSAT')) throw new Error('This does not look like a CSAT Command Centre backup.');
    const mapping=[['settings',KEYS.settings],['progress',KEYS.progress],['bookmarks',KEYS.bookmarks],['notes',KEYS.notes],['attempts',KEYS.attempts],['mistakes',KEYS.mistakes],['questionbank',KEYS.bank],['custom',KEYS.custom]];
    mapping.forEach(([prop,key])=>{if(data[prop]!==undefined && !save(key,data[prop])) throw new Error(`Could not restore ${prop}; storage may be full.`);});
    return true;
  }
  function resetProgress(){ [KEYS.progress,KEYS.bookmarks,KEYS.notes,KEYS.attempts,KEYS.mistakes,KEYS.active,KEYS.custom].forEach(k=>localStorage.removeItem(k)); }
  function resetSettings(){ save(KEYS.settings,defaults); }
  window.CSATStorage={KEYS,defaults,parse,save,list,object,getSettings,setSetting,getBank,getQuestions,allQuestions,storeQuestionBank,exportAll,importBackup,resetProgress,resetSettings};
})();
