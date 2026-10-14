(function(){
  'use strict';
  const DEFAULT_SCHEME={marksCorrect:2.5,negativeFraction:1/3,qualifyingPercent:33,durationMinutes:120,totalMarks:200,totalQuestions:80};
  function scoreAttempt(test, questions){
    let correct=0,incorrect=0,unattempted=0,unkeyedAttempted=0,positiveMarks=0,negativeMarks=0,knownKeyCount=0,attempted=0,totalTime=0;
    const details=[];
    const qById=new Map(questions.map(q=>[String(q.id),q]));
    const list=(test.questionIds||[]).map(id=>qById.get(String(id))).filter(Boolean);
    const scheme={...DEFAULT_SCHEME,...(test.scheme||{})};
    list.forEach(q=>{
      const id=String(q.id), answer=(test.answers||{})[id]||null, key=q.correct_option||q.correctOption||null;
      const time=Number((test.questionTimes||{})[id]||0); totalTime+=time;
      let result='unattempted';
      if(answer){ attempted++; if(key){knownKeyCount++; if(String(answer).toUpperCase()===String(key).toUpperCase()){correct++;positiveMarks+=scheme.marksCorrect;result='correct';}else{incorrect++;negativeMarks+=(scheme.marksCorrect*scheme.negativeFraction);result='incorrect';}}else{unkeyedAttempted++;result='unkeyed';} }
      else unattempted++;
      details.push({question:q,answer,key,result,time});
    });
    const score=positiveMarks-negativeMarks;
    const scored=correct+incorrect;
    const total=list.length;
    return {total,attempted,correct,incorrect,unattempted,unkeyedAttempted,knownKeyCount,positiveMarks,negativeMarks,score,totalMarks:total*scheme.marksCorrect,fullPaper:!!test.fullPaper,
      accuracy:scored?correct/scored*100:0,attemptRate:total?attempted/total*100:0,qualifyingScore:scheme.totalMarks*scheme.qualifyingPercent/100,
      qualificationKnown:!!test.fullPaper && list.length===scheme.totalQuestions && unkeyedAttempted===0 && knownKeyCount===attempted,qualified:!!test.fullPaper && list.length===scheme.totalQuestions && unkeyedAttempted===0 && knownKeyCount===attempted && score>=scheme.totalMarks*scheme.qualifyingPercent/100,
      totalTime,averageTime:total?totalTime/total:0,details,scheme};
  }
  function fmtTime(seconds){ seconds=Math.max(0,Math.floor(seconds||0)); const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60; return h?`${h}h ${String(m).padStart(2,'0')}m`:`${m}m ${String(s).padStart(2,'0')}s`; }
  function fmtDate(iso){try{return new Date(iso).toLocaleString(undefined,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return '—';}}
  window.CSATScoring={DEFAULT_SCHEME,scoreAttempt,fmtTime,fmtDate};
})();
