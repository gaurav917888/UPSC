(function(){
  'use strict';
  function calcAnalytics(attempts){
    const completed=(attempts||[]).filter(a=>a && a.status==='completed' && a.result);
    const scores=completed.map(a=>Number(a.result.score||0));
    const totalQs=completed.reduce((s,a)=>s+Number(a.result.attempted||0),0);
    const correct=completed.reduce((s,a)=>s+Number(a.result.correct||0),0);
    const avgScore=scores.length?scores.reduce((s,n)=>s+n,0)/scores.length:0;
    const best=scores.length?Math.max(...scores):0;
    const avgAccuracy=completed.length?completed.reduce((s,a)=>s+Number(a.result.accuracy||0),0)/completed.length:0;
    const topicMap={}; const yearMap={};
    completed.forEach(a=>{
      const year=a.year||'Custom';
      if(!yearMap[year]) yearMap[year]={year:String(year),tests:0,score:0,accuracy:0};
      yearMap[year].tests++;yearMap[year].score+=Number(a.result.score||0);yearMap[year].accuracy+=Number(a.result.accuracy||0);
      (a.result.details||[]).forEach(d=>{
        const topic=(d.question && (d.question.topic||d.question.subtopic)) || d.topic || 'Unclassified';
        if(!topicMap[topic]) topicMap[topic]={topic,attempted:0,correct:0,time:0};
        if(d.answer){topicMap[topic].attempted++;if(d.result==='correct') topicMap[topic].correct++;}
        topicMap[topic].time+=Number(d.time||0);
      });
    });
    Object.values(yearMap).forEach(y=>{y.score/=y.tests;y.accuracy/=y.tests;});
    const topics=Object.values(topicMap).map(t=>({...t,accuracy:t.attempted?t.correct/t.attempted*100:0,avgTime:t.attempted?t.time/t.attempted:0}));
    return {tests:completed.length,questionsAttempted:totalQs,averageScore:avgScore,bestScore:best,accuracy:avgAccuracy,topics,years:Object.values(yearMap).sort((a,b)=>a.year.localeCompare(b.year))};
  }
  function barChart(items,label,value,maxValue){
    if(!items.length)return '<div class="empty-state"><strong>No completed tests yet</strong><p>Finish a test to populate this chart.</p></div>';
    const max=Math.max(maxValue||0,...items.map(i=>Number(i[value]||0)),1);
    return `<div class="bar-list">${items.map(i=>`<div class="bar-row"><span>${esc(i[label])}</span><div class="bar-track"><span style="width:${Math.max(0,Math.min(100,Number(i[value]||0)/max*100))}%"></span></div><strong>${Number(i[value]||0).toFixed(1)}${value==='accuracy'?'%':''}</strong></div>`).join('')}</div>`;
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  window.CSATAnalytics={calcAnalytics,barChart};
})();
