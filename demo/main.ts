import { WatercolorRenderer } from '../src';
import type { WatercolorOptions } from '../src';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <main>
    <header><span class="eyebrow">WATERCOLOR LAB</span><h1>Paint with light,<br><em>water</em> and time.</h1></header>
    <section class="scroll-scene">
      <div class="painting-layout">
        <section class="stage"><canvas></canvas><div class="wash-label">wet on wet · layered impasto</div><div class="scroll-progress">Scroll to paint · <span>0%</span></div></section>
        <aside>
          <label>Paint medium <select class="mode"><option value="oil" selected>Oil / impasto</option><option value="watercolor">Watercolor</option></select></label>
          <label class="upload">Choose an image<input type="file" accept="image/*"></label>
          <small class="privacy">Your image stays in this browser. Nothing is uploaded or stored.</small>
          <button class="repaint">Paint another variation</button>
          <button class="scroll-draw" aria-pressed="false">Draw from page scroll</button>
          <label>Timeline <input class="timeline" type="range" min="0" max="1" step="0.001" value="0"></label>
          <label><span class="bloom-name">Wet mixing</span><input class="bloom" type="range" min="0" max="1" step="0.01" value="0.70"></label>
          <label><span class="grain-name">Impasto depth</span><input class="grain" type="range" min="0" max="1" step="0.01" value="0.68"></label>
          <details class="tuning" open>
            <summary>Fine tuning dials</summary>
            <div class="dial-scroll">
            <div class="dial-group"><h2>Performance</h2>
              <label>Render workload <select class="quality"><option value="fast" selected>Fast</option><option value="balanced">Balanced</option><option value="high">High fidelity</option></select></label>
              <label><span>Render scale <output>100</output></span><input data-option="pixelRatio" type="range" min="0.5" max="1.5" step="0.05" value="1"></label>
            </div>
            <div class="dial-group"><h2>Stroke planner</h2>
              <label><span>Stroke economy <output>72</output></span><input data-option="strokeEconomy" type="range" min="0" max="1" step="0.01" value="0.72"></label>
              <label><span>Shape simplification <output>62</output></span><input data-option="shapeSimplification" type="range" min="0" max="1" step="0.01" value="0.62"></label>
              <label><span>Stroke length <output>58</output></span><input data-option="strokeLength" type="range" min="0" max="1" step="0.01" value="0.58"></label>
              <label><span>Brush width <output>58</output></span><input data-option="strokeWidth" type="range" min="0" max="1" step="0.01" value="0.58"></label>
              <label><span>Stroke draw time <output>16</output></span><input data-option="strokeDuration" type="range" min="0.04" max="0.30" step="0.01" value="0.16"></label>
              <label><span>Boundary fidelity <output>72</output></span><input data-option="boundaryFidelity" type="range" min="0" max="1" step="0.01" value="0.72"></label>
              <label><span>Gesture curvature <output>34</output></span><input data-option="strokeCurvature" type="range" min="0" max="1" step="0.01" value="0.34"></label>
            </div>
            <div class="dial-group"><h2>Selective detail</h2>
              <label><span>Detail budget <output>42</output></span><input data-option="detailBudget" type="range" min="0" max="1" step="0.01" value="0.42"></label>
              <label><span>Detail multiplier <output>1×</output></span><input data-option="detailMultiplier" data-format="multiplier" type="range" min="1" max="10" step="0.5" value="1"></label>
              <label><span>Source accuracy <output>65</output></span><input data-option="sourceAccuracy" type="range" min="0" max="1" step="0.01" value="0.65"></label>
              <label><span>Detail precision <output>78</output></span><input data-option="detailPrecision" type="range" min="0" max="1" step="0.01" value="0.78"></label>
            </div>
            <div class="dial-group"><h2>Brush and surface</h2>
              <label><span>Paint load <output>70</output></span><input data-option="paintLoad" type="range" min="0" max="1" step="0.01" value="0.70"></label>
              <label class="oil-control"><span>Dry brush <output>20</output></span><input data-option="dryBrush" type="range" min="0" max="1" step="0.01" value="0.20"></label>
              <label><span>Bristle definition <output>58</output></span><input data-option="bristleStrength" type="range" min="0" max="1" step="0.01" value="0.58"></label>
              <label class="oil-control"><span>Oil gloss <output>48</output></span><input data-option="gloss" type="range" min="0" max="1" step="0.01" value="0.48"></label>
              <label><span>Paper roughness <output>78</output></span><input data-option="paperRoughness" type="range" min="0" max="1" step="0.01" value="0.78"></label>
              <label class="water-control"><span>Paper showing through <output>12</output></span><input data-option="transparency" type="range" min="0" max="1" step="0.01" value="0.12"></label>
              <label class="water-control"><span>Wet edge pooling <output>68</output></span><input data-option="edgeDarkening" type="range" min="0" max="1" step="0.01" value="0.68"></label>
            </div>
            </div>
          </details>
          <p>Every repaint uses a fresh seed. Pigment follows a new path through the paper each time.</p>
        </aside>
      </div>
    </section>
  </main>`;

const canvas = app.querySelector('canvas')!;
const timeline = app.querySelector<HTMLInputElement>('.timeline')!;
const stage = app.querySelector<HTMLElement>('.stage')!;
const scrollScene = app.querySelector<HTMLElement>('.scroll-scene')!;
const paintingLayout = app.querySelector<HTMLElement>('.painting-layout')!;
const repaintButton = app.querySelector<HTMLButtonElement>('.repaint')!;
const scrollButton = app.querySelector<HTMLButtonElement>('.scroll-draw')!;
const scrollProgress = app.querySelector<HTMLElement>('.scroll-progress span')!;
const controls = app.querySelector<HTMLElement>('aside')!;
let scrollMode = false;
let scrollUpdate = 0;
let scrollValue = 0;
const watercolor = new WatercolorRenderer(canvas, { mode: 'oil', duration: 14, onProgress: p => timeline.value = String(p) });

function protectMobileRangeTrack(input:HTMLInputElement){
  let pointer=-1,startX=0,startY=0,startValue=0,gesture:'pending'|'drag'|'scroll'='pending';
  const geometry=()=>{const rect=input.getBoundingClientRect(),thumb=25,min=Number(input.min)||0,max=Number(input.max)||1,value=Number(input.value),ratio=(value-min)/Math.max(.0001,max-min);return{rect,thumb,min,max,center:rect.left+thumb/2+ratio*(rect.width-thumb)};};
  input.addEventListener('pointerdown',event=>{if(!matchMedia('(pointer:coarse), (max-width:760px)').matches)return;const {center,thumb}=geometry();pointer=event.pointerId;startX=event.clientX;startY=event.clientY;startValue=Number(input.value);gesture=Math.abs(event.clientX-center)>thumb*.72?'scroll':'pending';},{capture:true});
  input.addEventListener('input',event=>{if(pointer!==-1&&gesture!=='drag'){input.value=String(startValue);event.stopImmediatePropagation();}},{capture:true});
  window.addEventListener('pointermove',event=>{if(event.pointerId!==pointer)return;const dx=event.clientX-startX,dy=event.clientY-startY;if(gesture==='pending'&&Math.hypot(dx,dy)>4)gesture=Math.abs(dx)>Math.abs(dy)?'drag':'scroll';if(gesture==='scroll'){if(Number(input.value)!==startValue)input.value=String(startValue);return;}if(gesture!=='drag')return;
    event.preventDefault();const {rect,thumb,min,max}=geometry(),ratio=Math.max(0,Math.min(1,(event.clientX-rect.left-thumb/2)/Math.max(1,rect.width-thumb))),step=Number(input.step)||.01,next=min+ratio*(max-min);input.value=String(Math.round(next/step)*step);input.dispatchEvent(new Event('input',{bubbles:true}));
  },{passive:false});
  window.addEventListener('pointerup',event=>{if(event.pointerId!==pointer)return;if(gesture==='drag')input.dispatchEvent(new Event('change',{bubbles:true}));pointer=-1;gesture='pending';});
}
app.querySelectorAll<HTMLInputElement>('input[type=range]').forEach(protectMobileRangeTrack);

const demoSample = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="wall" x2="0" y2="1"><stop stop-color="#d8cbb4"/><stop offset="1" stop-color="#a9977c"/></linearGradient>
      <radialGradient id="bowl"><stop stop-color="#e5ad58"/><stop offset=".7" stop-color="#a95734"/><stop offset="1" stop-color="#613429"/></radialGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#wall)"/>
    <rect y="610" width="1200" height="290" fill="#725a43"/>
    <path d="M0 646 Q300 594 620 640 T1200 625 V900 H0Z" fill="#8d7357"/>
    <ellipse cx="608" cy="700" rx="340" ry="70" fill="#493b32" opacity=".35"/>
    <path d="M405 556 Q600 488 797 556 L750 716 Q600 780 453 716Z" fill="url(#bowl)"/>
    <path d="M405 556 Q600 485 797 556 Q600 636 405 556Z" fill="#452f2a"/>
    <circle cx="510" cy="516" r="92" fill="#b7442d"/><circle cx="632" cy="500" r="104" fill="#d08c35"/>
    <circle cx="714" cy="529" r="82" fill="#7c9b48"/><circle cx="575" cy="555" r="76" fill="#d4b442"/>
    <path d="M620 405 Q672 330 730 350 Q690 418 620 448Z" fill="#395d3b"/>
    <path d="M612 414 Q570 344 516 361 Q549 423 614 449Z" fill="#547342"/>
    <path d="M287 213 C346 170 413 190 438 252 L407 523 C370 549 317 545 282 515Z" fill="#284f5a"/>
    <path d="M306 244 Q360 216 414 250 L397 488 Q350 518 300 486Z" fill="#447a7f"/>
    <ellipse cx="360" cy="217" rx="77" ry="31" fill="#1d3d46"/>
    <path d="M798 254 Q878 198 957 259 L923 568 Q871 600 814 563Z" fill="#aa6743"/>
    <ellipse cx="877" cy="254" rx="80" ry="28" fill="#68412f"/>
    <path d="M823 287 Q873 258 932 287 L912 534 Q868 563 832 535Z" fill="#c37c4e"/>
  </svg>`)}`;

function scrollPainting(){
  scrollUpdate=0;if(!scrollMode)return;const sceneTop=scrollScene.getBoundingClientRect().top+window.scrollY,travel=Math.max(1,scrollScene.offsetHeight-paintingLayout.offsetHeight);
  const progress=Math.max(0,Math.min(1,(window.scrollY-sceneTop)/travel));scrollValue=progress;watercolor.seek(progress);timeline.value=String(progress);scrollProgress.textContent=`${Math.round(progress*100)}%`;
}
function requestScrollPainting(){if(scrollMode&&!scrollUpdate)scrollUpdate=requestAnimationFrame(scrollPainting);}
function setScrollMode(enabled:boolean){
  scrollMode=enabled;document.body.classList.toggle('scroll-mode',enabled);scrollButton.classList.toggle('active',enabled);scrollButton.setAttribute('aria-pressed',String(enabled));
  scrollButton.textContent=enabled?'Exit scroll drawing':'Draw from page scroll';timeline.disabled=enabled;
  if(enabled){watercolor.pause();requestAnimationFrame(()=>{const sceneTop=scrollScene.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:sceneTop,behavior:'smooth'});requestScrollPainting();});}
  else {timeline.value=String(scrollValue);scrollProgress.textContent=`${Math.round(scrollValue*100)}%`;watercolor.play();}
}
function clearRepaintPrompt(){repaintButton.classList.remove('settings-changed');repaintButton.textContent='Paint another variation';}
function promptRepaint(){repaintButton.classList.remove('settings-changed');void repaintButton.offsetWidth;repaintButton.classList.add('settings-changed');repaintButton.textContent='Settings changed · paint again';}
async function setSource(source: string) { clearRepaintPrompt();await watercolor.setImage(source); if(scrollMode)requestScrollPainting();else watercolor.play(); }
setSource(demoSample).catch(() => {});
app.querySelector<HTMLInputElement>('input[type=file]')!.onchange = event => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl).finally(() => URL.revokeObjectURL(objectUrl));
  }
};
repaintButton.onclick = () => {clearRepaintPrompt();watercolor.restart();};
scrollButton.onclick=()=>setScrollMode(!scrollMode);
window.addEventListener('scroll',requestScrollPainting,{passive:true});
window.addEventListener('resize',requestScrollPainting);
timeline.oninput = () => watercolor.seek(Number(timeline.value));
timeline.onchange=()=>{if(!scrollMode)watercolor.play();};
app.querySelector<HTMLInputElement>('.bloom')!.oninput = event => {watercolor.setOptions({ bloom: Number((event.target as HTMLInputElement).value) });promptRepaint();};
app.querySelector<HTMLInputElement>('.grain')!.oninput = event => {watercolor.setOptions({ granulation: Number((event.target as HTMLInputElement).value) });promptRepaint();};
app.querySelector<HTMLSelectElement>('.quality')!.onchange=event=>{watercolor.setOptions({renderQuality:(event.target as HTMLSelectElement).value as 'fast'|'balanced'|'high'});promptRepaint();};
const plannerDials=new Set(['strokeEconomy','shapeSimplification','strokeLength','strokeWidth','boundaryFidelity','detailBudget','detailMultiplier','sourceAccuracy','detailPrecision','strokeCurvature']);
let plannerTimer=0;const pendingPlannerOptions:Partial<WatercolorOptions>={};
app.querySelectorAll<HTMLInputElement>('[data-option]').forEach(input=>{let dialTimer=0;input.setAttribute('aria-label',input.closest('label')?.querySelector('span')?.firstChild?.textContent?.trim()??input.dataset.option!);input.oninput=()=>{
  const value=Number(input.value),display=input.dataset.format==='multiplier'?`${value.toFixed(value%1?1:0)}×`:String(Math.round(value*100));input.closest('label')?.querySelector('output')!.replaceChildren(display);const option=input.dataset.option as keyof WatercolorOptions;
  promptRepaint();
  if(plannerDials.has(option)){Object.assign(pendingPlannerOptions,{[option]:value});window.clearTimeout(plannerTimer);plannerTimer=window.setTimeout(()=>{watercolor.setOptions({...pendingPlannerOptions});for(const key of Object.keys(pendingPlannerOptions))delete pendingPlannerOptions[key as keyof WatercolorOptions];},180);}
  else {window.clearTimeout(dialTimer);dialTimer=window.setTimeout(()=>watercolor.setOptions({[option]:value} as Partial<WatercolorOptions>),60);}
};});
app.querySelector<HTMLSelectElement>('.mode')!.onchange = event => {
  const mode = (event.target as HTMLSelectElement).value as 'oil' | 'watercolor';
  watercolor.setOptions({ mode });
  promptRepaint();
  controls.dataset.mode=mode;
  app.querySelector('.wash-label')!.textContent = mode === 'oil' ? 'wet on wet · layered impasto' : 'wet on dry · five washes';
  app.querySelector('.bloom-name')!.textContent = mode === 'oil' ? 'Wet mixing' : 'Water bloom';
  app.querySelector('.grain-name')!.textContent = mode === 'oil' ? 'Impasto depth' : 'Granulation';
};
controls.dataset.mode='oil';
