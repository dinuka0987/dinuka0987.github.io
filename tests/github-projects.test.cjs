const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const api = require('../github-projects.js');
const repo = (name, extra = {}) => ({name, language:'JavaScript', topics:[], created_at:'2026-11-25T00:00:00Z', ...extra});
const config = {featured:['old'], projects:[{repo:'old',name:'Custom title',description:'Curated copy',category:'Security',tags:['Python'],visual:'scanner'}]};
const response = data => ({ok:true,json:async()=>data});
test('discovers new repos, preserves curated cards and featured ordering, newest first', async () => {
  const result = await api.load(config,{storage:null,fetch:async()=>response([repo('new'),repo('old'),repo('older',{created_at:'2020-01-01'})])});
  assert.equal(result.source,'github');
  assert.deepEqual(result.projects.map(p=>p.repo),['old','new','older']);
  assert.equal(result.projects[0].name,'Custom title');
  assert.equal(result.projects[0].description,'Curated copy');
  assert.equal(result.projects[1].category,'Web');
});
test('paginates beyond 100 without losing projects',async()=>{
  const urls=[];
  const result=await api.load(config,{storage:null,fetch:async url=>{
    urls.push(url); return response(urls.length===1?Array.from({length:100},(_,i)=>repo('project-'+i)):[repo('last')]);
  }});
  assert.equal(result.projects.length,101);
  assert.match(urls[1],/page=2$/);
});
test('does not keep deleted/private/excluded repositories or duplicates after a successful sync',()=>{
  const projects=api.merge([repo('new'),repo('NEW'),repo('private',{private:true}),repo('hidden')],{...config,github:{excludeRepos:['HIDDEN']}});
  assert.deepEqual(projects.map(p=>p.repo),['new']);
});
test('GitHub failure falls back to cache with current presentation settings',async()=>{
  let cached;
  const storage={getItem:()=>cached,setItem:(_,value)=>cached=value};
  await api.load(config,{storage,fetch:async()=>response([repo('old'),repo('new')])});
  const result=await api.load(config,{storage,fetch:async()=>({ok:false,status:403})});
  assert.equal(result.source,'cache');
  assert.equal(result.projects.length,2);
  assert.equal(result.projects[0].name,'Custom title');
});
test('offline first visit, broken cache, and blocked storage retain bundled projects',async()=>{
  const result=await api.load(config,{storage:{getItem:()=>'{broken'},fetch:async()=>{throw new Error('offline');}});
  assert.equal(result.source,'snapshot');
  assert.equal(result.projects[0].repo,'old');
  const blocked=await api.load(config,{storage:{getItem:()=>{throw Error();},setItem:()=>{throw Error();}},fetch:async()=>response([repo('new')])});
  assert.equal(blocked.source,'github');
});
test('failed later page does not replace a complete cache with partial data',async()=>{
  let cached=JSON.stringify([repo('cached')]); let calls=0;
  const result=await api.load(config,{storage:{getItem:()=>cached,setItem:(_,v)=>cached=v},fetch:async()=>++calls===1?response(Array.from({length:100},(_,i)=>repo('partial-'+i))):{ok:false,status:500}});
  assert.equal(result.source,'cache');
  assert.deepEqual(result.projects.map(p=>p.repo),['cached']);
});
test('a valid empty account clears old cards; malformed responses preserve fallback',async()=>{
  const empty=await api.load(config,{storage:null,fetch:async()=>response([])});
  assert.deepEqual(empty.projects,[]);
  assert.equal(empty.source,'github');
  const bad=await api.load(config,{storage:null,fetch:async()=>response({message:'error'})});
  assert.equal(bad.source,'snapshot');
});
test('page keeps active filters during periodic updates and skips background tabs',async()=>{
  const elements=new Map();
  function element(key){if(!elements.has(key)) elements.set(key,{innerHTML:'',textContent:'',attributes:{},setAttribute(name,value){this.attributes[name]=value;},addEventListener(){}});return elements.get(key);}
  const buttons=['All','Featured','Security'].map(filter=>({dataset:{filter},classList:{toggle(){}},setAttribute(){},addEventListener(event,fn){this.click=fn;}}));
  let refresh;let calls=0;
  const document={hidden:false,querySelector:element,querySelectorAll:selector=>selector==='[data-filter]'?buttons:[]};
  const context={document,URL,location:{href:'https://dinuka0987.github.io/'},Date,fetch:async()=>response({...config,certificates:[]}),GitHubProjects:{load:async()=>({projects:[...config.projects,{repo:'new',name:'New project',category:'Web',description:'New',tags:[],visual:'java'}],source:'github',call:++calls})},setInterval(fn,delay){assert.equal(delay,300000);refresh=fn;}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
  await new Promise(setImmediate);
  assert.match(element('#project-grid').innerHTML,/New project/);
  assert.equal(element('#project-grid').attributes['aria-busy'],'false');
  assert.equal(element('#project-sync-status').attributes['aria-busy'],'false');
  buttons[2].click();
  assert.doesNotMatch(element('#project-grid').innerHTML,/New project/);
  refresh();await new Promise(setImmediate);
  assert.equal(element('#project-status').textContent,'1 projects shown: Security.');
  document.hidden=true;refresh();assert.equal(calls,2);
});
test('soft UI text and control boundaries have sufficient contrast',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');
  function color(token){return css.match(new RegExp('--'+token+':\\s*(#[0-9a-f]{6})','i'))[1];}
  function luminance(hex){const [r,g,b]=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;}
  function ratio(a,b){const x=luminance(color(a)),y=luminance(color(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  for(const foreground of ['text','muted','green','error']){
    for(const background of ['bg','panel','surface-inset']) assert.ok(ratio(foreground,background)>=4.5,`${foreground} on ${background}`);
  }
  assert.ok(ratio('green','on-primary')>=4.5);
  assert.ok(ratio('disabled-text','disabled-bg')>=4.5);
  assert.ok(ratio('control-line','bg')>=3);
  assert.ok(ratio('control-line','panel')>=3);
});
test('deployment and both pages include the shared GitHub loader',()=>{
  for (const [file,next] of [['index.html','app.js'],['editor.html','editor.js']]){
    const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
    assert.ok(html.indexOf('src="github-projects.js') < html.indexOf(`src="${next}`));
    assert.match(html,/src="github-projects.js/);
  }
  assert.match(fs.readFileSync(path.join(__dirname,'../.github/workflows/pages.yml'),'utf8'),/cp .*github-projects\.js/);
});
