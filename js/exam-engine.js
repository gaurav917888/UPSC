(function(){
  'use strict';
  let interval=null, onTick=null, onTimeUp=null;
  function active(){return CSATStorage.parse(CSATStorage.KEYS.active,null);}
  function persist(test){if(test) return CSATStorage.save(CSATStorage.KEYS.active,test);localStorage.removeItem(CSATStorage.KEYS.active);return true;}
  function flushElapsed(test){
    if(!test || test.status!=='active') return test;
    const now=Date.now(); const last=Number(test.lastTickAt||now); const elapsed=Math.max(0,Math.floor((now-last)/1000));
    if(elapsed){test.remainingSeconds=Math.max(0,Number(test.remainingSeconds||0)-elapsed);const id=String(test.questionIds[test.currentIndex]||'');test.questionTimes[id]=Number(test.questionTimes[id]||0)+elapsed;test.lastTickAt=now;persist(test);}
    return test;
  }
  function startClock(tickCb,timeUpCb){
    stopClock();onTick=tickCb||null;onTimeUp=timeUpCb||null;
    interval=setInterval(()=>{
      let test=active();if(!test||test.status!=='active'){stopClock();return;}
      test=flushElapsed(test);
      if(test.remainingSeconds<=0){test.remainingSeconds=0;persist(test);stopClock();if(onTimeUp)onTimeUp();return;}
      if(onTick)onTick(test);
    },1000);
  }
  function stopClock(){if(interval)clearInterval(interval);interval=null;}
  function start({year,mode='exam',title,questions,durationMinutes,scheme,fullPaper=false}){
    if(!Array.isArray(questions)||!questions.length)throw new Error('No questions are available for this selection. Import a verified question bank first.');
    const ids=questions.map(q=>String(q.id));
    if(new Set(ids).size!==ids.length)throw new Error('Duplicate question IDs were found. Fix the dataset before starting.');
    const now=Date.now();
    const test={id:`attempt-${now}-${Math.random().toString(36).slice(2,7)}`,year:year||'Custom',mode,title:title||`CSAT ${year||'Custom Mock'}`,
      questionIds:ids,currentIndex:0,answers:{},reviewIds:[],questionTimes:{},startedAt:new Date(now).toISOString(),
      durationSeconds:Math.max(0,Number(durationMinutes||120))*60,remainingSeconds:Math.max(0,Number(durationMinutes||120))*60,
      lastTickAt:now,status:'active',scheme:scheme||CSATScoring.DEFAULT_SCHEME,questionCount:questions.length,fullPaper:!!fullPaper,revealedIds:[],visitedIds:[ids[0]]};
    persist(test);return test;
  }
  function moveTo(index){let test=active();if(!test)return null;test=flushElapsed(test);test.currentIndex=Math.max(0,Math.min(test.questionIds.length-1,Number(index)||0));test.visitedIds=[...new Set([...(test.visitedIds||[]),String(test.questionIds[test.currentIndex])])];test.lastTickAt=Date.now();persist(test);return test;}
  function answer(optionId){let test=active();if(!test)return null;test=flushElapsed(test);const id=String(test.questionIds[test.currentIndex]);if(optionId===null||optionId===undefined||optionId==='')delete test.answers[id];else test.answers[id]=String(optionId);test.lastTickAt=Date.now();persist(test);return test;}
  function toggleReview(){let test=active();if(!test)return null;test=flushElapsed(test);const id=String(test.questionIds[test.currentIndex]);const set=new Set(test.reviewIds||[]);set.has(id)?set.delete(id):set.add(id);test.reviewIds=[...set];test.lastTickAt=Date.now();persist(test);return test;}
  function clearAnswer(){return answer(null);}
  function revealCurrent(){let test=active();if(!test)return null;const id=String(test.questionIds[test.currentIndex]);const set=new Set(test.revealedIds||[]);set.add(id);test.revealedIds=[...set];persist(test);return test;}
  function submit(){let test=active();if(!test)return null;test=flushElapsed(test);test.status='completed';test.finishedAt=new Date().toISOString();persist(test);stopClock();return test;}
  function discard(){stopClock();persist(null);}
  function resume(tickCb,timeUpCb){let test=active();if(!test||test.status!=='active')return null;test=flushElapsed(test);test.lastTickAt=Date.now();persist(test);startClock(tickCb,timeUpCb);return test;}
  function counts(test){const qs=test.questionIds||[],a=test.answers||{},r=new Set(test.reviewIds||[]),v=new Set(test.visitedIds||[]);let answered=0,visited=0;qs.forEach((id,i)=>{if(a[String(id)])answered++;if(v.has(String(id)))visited++;});return {total:qs.length,answered,remaining:qs.length-answered,review:r.size,visited};}
  window.CSATExamEngine={active,persist,flushElapsed,start,startClock,stopClock,moveTo,answer,toggleReview,clearAnswer,revealCurrent,submit,discard,resume,counts};
})();
