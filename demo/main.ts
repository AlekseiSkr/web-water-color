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
          <button class="repaint">Paint another variation</button>
          <button class="pause">Pause</button>
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
              <label><span>Boundary fidelity <output>72</output></span><input data-option="boundaryFidelity" type="range" min="0" max="1" step="0.01" value="0.72"></label>
              <label><span>Gesture curvature <output>34</output></span><input data-option="strokeCurvature" type="range" min="0" max="1" step="0.01" value="0.34"></label>
            </div>
            <div class="dial-group"><h2>Selective detail</h2>
              <label><span>Detail budget <output>42</output></span><input data-option="detailBudget" type="range" min="0" max="1" step="0.01" value="0.42"></label>
              <label><span>Detail precision <output>78</output></span><input data-option="detailPrecision" type="range" min="0" max="1" step="0.01" value="0.78"></label>
              <label><span>Detail delay <output>82</output></span><input data-option="detailDelay" type="range" min="0" max="1" step="0.01" value="0.82"></label>
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
const pauseButton = app.querySelector<HTMLButtonElement>('.pause')!;
const scrollButton = app.querySelector<HTMLButtonElement>('.scroll-draw')!;
const scrollProgress = app.querySelector<HTMLElement>('.scroll-progress span')!;
const controls = app.querySelector<HTMLElement>('aside')!;
let scrollMode = false;
let scrollUpdate = 0;
let scrollValue = 0;
const watercolor = new WatercolorRenderer(canvas, { mode: 'oil', duration: 14, onProgress: p => timeline.value = String(p) });

function scrollPainting(){
  scrollUpdate=0;if(!scrollMode)return;const sceneTop=scrollScene.getBoundingClientRect().top+window.scrollY,travel=Math.max(1,scrollScene.offsetHeight-paintingLayout.offsetHeight);
  const progress=Math.max(0,Math.min(1,(window.scrollY-sceneTop)/travel));scrollValue=progress;watercolor.seek(progress);timeline.value=String(progress);scrollProgress.textContent=`${Math.round(progress*100)}%`;
}
function requestScrollPainting(){if(scrollMode&&!scrollUpdate)scrollUpdate=requestAnimationFrame(scrollPainting);}
function setScrollMode(enabled:boolean){
  scrollMode=enabled;document.body.classList.toggle('scroll-mode',enabled);scrollButton.classList.toggle('active',enabled);scrollButton.setAttribute('aria-pressed',String(enabled));
  scrollButton.textContent=enabled?'Exit scroll drawing':'Draw from page scroll';pauseButton.disabled=enabled;timeline.disabled=enabled;
  if(enabled){watercolor.pause();pauseButton.textContent='Continue';requestAnimationFrame(()=>{const sceneTop=scrollScene.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:sceneTop,behavior:'smooth'});requestScrollPainting();});}
  else {timeline.value=String(scrollValue);scrollProgress.textContent=`${Math.round(scrollValue*100)}%`;}
}
async function setSource(source: string) { await watercolor.setImage(source); if(scrollMode)requestScrollPainting();else watercolor.play(); }
setSource('/reference.png').catch(() => {});
app.querySelector<HTMLInputElement>('input[type=file]')!.onchange = event => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) setSource(URL.createObjectURL(file));
};
app.querySelector<HTMLButtonElement>('.repaint')!.onclick = () => watercolor.restart();
pauseButton.onclick = event => {
  const button = event.currentTarget as HTMLButtonElement;
  if (button.textContent === 'Pause') { watercolor.pause(); button.textContent = 'Continue'; }
  else { watercolor.play(); button.textContent = 'Pause'; }
};
scrollButton.onclick=()=>setScrollMode(!scrollMode);
window.addEventListener('scroll',requestScrollPainting,{passive:true});
window.addEventListener('resize',requestScrollPainting);
timeline.oninput = () => watercolor.seek(Number(timeline.value));
app.querySelector<HTMLInputElement>('.bloom')!.oninput = event => watercolor.setOptions({ bloom: Number((event.target as HTMLInputElement).value) });
app.querySelector<HTMLInputElement>('.grain')!.oninput = event => watercolor.setOptions({ granulation: Number((event.target as HTMLInputElement).value) });
app.querySelector<HTMLSelectElement>('.quality')!.onchange=event=>watercolor.setOptions({renderQuality:(event.target as HTMLSelectElement).value as 'fast'|'balanced'|'high'});
const plannerDials=new Set(['strokeEconomy','shapeSimplification','strokeLength','strokeWidth','boundaryFidelity','detailBudget','detailPrecision','strokeCurvature']);
let dialTimer=0;
app.querySelectorAll<HTMLInputElement>('[data-option]').forEach(input=>{input.setAttribute('aria-label',input.closest('label')?.querySelector('span')?.firstChild?.textContent?.trim()??input.dataset.option!);input.oninput=()=>{
  input.closest('label')?.querySelector('output')!.replaceChildren(String(Math.round(Number(input.value)*100)));const option=input.dataset.option as keyof WatercolorOptions,value=Number(input.value);
  window.clearTimeout(dialTimer);dialTimer=window.setTimeout(()=>watercolor.setOptions({[option]:value} as Partial<WatercolorOptions>),plannerDials.has(option)?180:60);
};});
app.querySelector<HTMLSelectElement>('.mode')!.onchange = event => {
  const mode = (event.target as HTMLSelectElement).value as 'oil' | 'watercolor';
  watercolor.setOptions({ mode });
  controls.dataset.mode=mode;
  app.querySelector('.wash-label')!.textContent = mode === 'oil' ? 'wet on wet · layered impasto' : 'wet on dry · five washes';
  app.querySelector('.bloom-name')!.textContent = mode === 'oil' ? 'Wet mixing' : 'Water bloom';
  app.querySelector('.grain-name')!.textContent = mode === 'oil' ? 'Impasto depth' : 'Granulation';
};
controls.dataset.mode='oil';
