#!/usr/bin/env node
'use strict';
/* Deterministic graph validation V1.4.3 */
function isObj(x){return x&&typeof x==='object'&&!Array.isArray(x);}
function effectivePages(cfg){const s=isObj(cfg.savedState)?cfg.savedState:{}; return Array.isArray(s.SP)?s.SP:(Array.isArray(cfg.pages)?cfg.pages:[]);}
function analyze(cfg){
 const s=isObj(cfg.savedState)?cfg.savedState:{}; const pages=effectivePages(cfg); const boxes=isObj(s.B)?s.B:{};
 const tt=Array.isArray(s.ttLinks)?s.ttLinks:[]; const how=Array.isArray(s.howLinks)?s.howLinks:[];
 const pageByRef={}; pages.forEach(p=>{(p.cols||[]).forEach((c,ci)=>(c.boxes||[]).forEach((_,bi)=>pageByRef[`${p.id}-c${ci}-b${bi}`]={pageId:p.id,pageLabel:p.label,col:ci,type:p.pageType||'this_then'}));});
 const refs=Object.keys(boxes).filter(r=>pageByRef[r]&&pageByRef[r].type==='this_then');
 const degree={}; refs.forEach(r=>degree[r]={in:0,out:0}); const errors=[], warnings=[]; const seen=new Set(); let cross=0;
 tt.forEach((l,i)=>{ if(!l||!l.from||!l.to){errors.push(`This-Then link ${i} is incomplete`);return;} const k=l.from+'>'+l.to; if(seen.has(k)) errors.push(`Duplicate This-Then link ${k}`); seen.add(k); if(l.from===l.to) errors.push(`Self-link ${k}`); if(!boxes[l.from]||!boxes[l.to]) errors.push(`Unresolved endpoint ${k}`); if(degree[l.from])degree[l.from].out++; if(degree[l.to])degree[l.to].in++; const a=pageByRef[l.from],b=pageByRef[l.to]; if(a&&b){if(a.pageId!==b.pageId)cross++; else if(b.col<=a.col) errors.push(`Reverse or non-forward causal link ${k}`);} });
 const isolated=refs.filter(r=>degree[r].in+degree[r].out===0); if(isolated.length) errors.push(`Isolated This-Then boxes: ${isolated.join(', ')}`);
 // undirected components across TT boxes
 const adj={}; refs.forEach(r=>adj[r]=[]); tt.forEach(l=>{if(adj[l.from]&&adj[l.to]){adj[l.from].push(l.to);adj[l.to].push(l.from);}});
 const comps=[]; const vis=new Set(); refs.forEach(r=>{if(vis.has(r))return; const q=[r],c=[];vis.add(r);while(q.length){const x=q.pop();c.push(x);adj[x].forEach(y=>{if(!vis.has(y)){vis.add(y);q.push(y)}})} comps.push(c)});
 if(comps.length>1) warnings.push(`This-Then graph has ${comps.length} disconnected components`);
 const substantial=refs.length>=40 && new Set(refs.map(r=>pageByRef[r].pageId)).size>=3;
 if(substantial&&cross===0) errors.push('Substantial multi-page board has zero cross-page This-Then links');
 const finalRefs=refs.filter(r=>pageByRef[r].pageId==='final'||/final outcome/i.test(pageByRef[r].pageLabel||''));
 const disconnectedFinal=finalRefs.filter(r=>degree[r].in+degree[r].out===0); if(disconnectedFinal.length) errors.push(`Disconnected Final Outcomes: ${disconnectedFinal.join(', ')}`);
 const maxFanIn=Math.max(0,...refs.map(r=>degree[r].in)), maxFanOut=Math.max(0,...refs.map(r=>degree[r].out));
 if(maxFanIn>6)warnings.push(`Maximum This-Then fan-in is ${maxFanIn}`); if(maxFanOut>6)warnings.push(`Maximum This-Then fan-out is ${maxFanOut}`);
 return {errors,warnings,metrics:{thisThenBoxCount:refs.length,thisThenLinkCount:tt.length,howLinkCount:how.length,crossPageLinkCount:cross,componentCount:comps.length,isolatedThisThenRefs:isolated,disconnectedFinalOutcomeRefs:disconnectedFinal,maxFanIn,maxFanOut}};
}
module.exports={analyze};
if(require.main===module){const fs=require('fs');const r=analyze(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));console.log(JSON.stringify(r,null,2));process.exit(r.errors.length?1:0)}
