import { WatercolorRenderer } from '../src';
import type { WatercolorOptions } from '../src';
import { cropSourceRect, type CropRect } from './crop';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <main>
    <header><span class="eyebrow">WATERCOLOR LAB</span><h1>Paint with light,<br><em>water</em> and time.</h1></header>
    <section class="scroll-scene">
      <div class="painting-layout">
        <section class="stage">
          <div class="canvas-frame"><canvas></canvas></div>
          <div class="stage-footer">
            <div class="stage-caption"><div class="wash-label">wet on wet · layered impasto</div><div class="scroll-progress">Scroll to paint · <span>0%</span></div></div>
            <button class="preview-artwork">Preview artwork</button>
          </div>
        </section>
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
              <label><span>Paper texture <output>78</output></span><input data-option="paperRoughness" type="range" min="0" max="1" step="0.01" value="0.78"></label>
              <label class="water-control"><span>Paper showing through <output>12</output></span><input data-option="transparency" type="range" min="0" max="1" step="0.01" value="0.12"></label>
              <label class="water-control"><span>Wet edge pooling <output>68</output></span><input data-option="edgeDarkening" type="range" min="0" max="1" step="0.01" value="0.68"></label>
            </div>
            </div>
          </details>
          <p>Every repaint uses a fresh seed. Pigment follows a new path through the paper each time.</p>
        </aside>
      </div>
    </section>
    <dialog class="artwork-preview" aria-label="Artwork preview">
      <div class="preview-shell">
        <div class="preview-toolbar">
          <div><strong>Artwork preview</strong><span class="preview-size"></span></div>
          <div class="preview-actions"><button class="crop-reset">Reset crop</button><button class="preview-download-paper">Download crop</button><button class="preview-download-transparent">Download without paper</button><button class="preview-close">Close</button></div>
        </div>
        <div class="preview-image-wrap">
          <div class="preview-crop-stage">
            <img class="preview-image" alt="Full-resolution preview of the drawn artwork">
            <div class="crop-selection" role="region" tabindex="0" aria-label="Crop selection. Drag to move; drag a corner to resize. Arrow keys move; minus and plus resize.">
              <i data-handle="nw"></i><i data-handle="ne"></i><i data-handle="se"></i><i data-handle="sw"></i>
            </div>
          </div>
        </div>
      </div>
    </dialog>
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
const previewButton = app.querySelector<HTMLButtonElement>('.preview-artwork')!;
const previewDialog = app.querySelector<HTMLDialogElement>('.artwork-preview')!;
const previewImage = app.querySelector<HTMLImageElement>('.preview-image')!;
const previewStage = app.querySelector<HTMLElement>('.preview-crop-stage')!;
const previewWrap = app.querySelector<HTMLElement>('.preview-image-wrap')!;
const cropSelection = app.querySelector<HTMLElement>('.crop-selection')!;
const previewDownloadPaper = app.querySelector<HTMLButtonElement>('.preview-download-paper')!;
const previewDownloadTransparent = app.querySelector<HTMLButtonElement>('.preview-download-transparent')!;
const previewSize = app.querySelector<HTMLElement>('.preview-size')!;
let previewPaperUrl: string | undefined;
let previewTransparentUrl: string | undefined;
let previewTransparentImage: HTMLImageElement | undefined;
let previewCrop:CropRect={x:0,y:0,width:1,height:1};
let scrollMode = false;
let scrollUpdate = 0;
let scrollValue = 0;
const watercolor = new WatercolorRenderer(canvas, {
  mode: 'oil',
  duration: 14,
  onProgress: progress => timeline.value = String(progress),
  onPhaseChange: phase => {
    if (phase === 'painting' && repaintButton.classList.contains('is-loading')) clearRepaintPrompt();
  },
});

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
function clearRepaintPrompt(){repaintButton.classList.remove('settings-changed','is-loading');repaintButton.textContent='Paint another variation';}
function promptRepaint(){repaintButton.classList.remove('settings-changed','is-loading');void repaintButton.offsetWidth;repaintButton.classList.add('settings-changed');repaintButton.textContent='Settings changed · paint again';}
async function setSource(source: string) { clearRepaintPrompt();await watercolor.setImage(source); if(scrollMode)requestScrollPainting();else watercolor.play(); }
setSource(demoSample).catch(() => {});
let uploadedObjectUrl: string | undefined;
app.querySelector<HTMLInputElement>('input[type=file]')!.onchange = event => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    const previousObjectUrl = uploadedObjectUrl;
    uploadedObjectUrl = objectUrl;
    void setSource(objectUrl).then(() => {
      if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
    }).catch(error => {
      if (uploadedObjectUrl === objectUrl) uploadedObjectUrl = previousObjectUrl;
      URL.revokeObjectURL(objectUrl);
      console.error('Unable to process the selected image.', error);
    });
  }
};
window.addEventListener('beforeunload', () => { if (uploadedObjectUrl) URL.revokeObjectURL(uploadedObjectUrl); });
const clampCrop=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));
function cropPixels(){return cropSourceRect(previewCrop,previewImage.naturalWidth,previewImage.naturalHeight);}
function updateCropSelection(){
  cropSelection.style.left=`${previewCrop.x*100}%`;cropSelection.style.top=`${previewCrop.y*100}%`;cropSelection.style.width=`${previewCrop.width*100}%`;cropSelection.style.height=`${previewCrop.height*100}%`;
  const size=cropPixels();previewSize.textContent=`Crop ${size.width} × ${size.height} · source ${previewImage.naturalWidth} × ${previewImage.naturalHeight}`;
}
function layoutPreviewStage(){
  if(!previewImage.naturalWidth)return;const availableWidth=Math.max(1,previewWrap.clientWidth-40),availableHeight=Math.max(1,previewWrap.clientHeight-40),scale=Math.min(availableWidth/previewImage.naturalWidth,availableHeight/previewImage.naturalHeight);
  previewStage.style.width=`${Math.max(1,previewImage.naturalWidth*scale)}px`;previewStage.style.height=`${Math.max(1,previewImage.naturalHeight*scale)}px`;updateCropSelection();
}
new ResizeObserver(layoutPreviewStage).observe(previewWrap);
app.querySelector<HTMLButtonElement>('.crop-reset')!.onclick=()=>{previewCrop={x:0,y:0,width:1,height:1};updateCropSelection();};
let cropPointer=-1,cropMode='move',cropStartX=0,cropStartY=0,cropStart:CropRect={...previewCrop};
cropSelection.addEventListener('pointerdown',event=>{
  cropPointer=event.pointerId;cropMode=(event.target as HTMLElement).dataset.handle??'move';cropStartX=event.clientX;cropStartY=event.clientY;cropStart={...previewCrop};cropSelection.setPointerCapture(event.pointerId);event.preventDefault();
});
cropSelection.addEventListener('pointermove',event=>{
  if(event.pointerId!==cropPointer)return;const rect=previewStage.getBoundingClientRect(),dx=(event.clientX-cropStartX)/Math.max(1,rect.width),dy=(event.clientY-cropStartY)/Math.max(1,rect.height),minWidth=Math.min(.5,32/Math.max(1,rect.width)),minHeight=Math.min(.5,32/Math.max(1,rect.height));
  if(cropMode==='move'){previewCrop.x=clampCrop(cropStart.x+dx,0,1-cropStart.width);previewCrop.y=clampCrop(cropStart.y+dy,0,1-cropStart.height);}
  else {const right=cropStart.x+cropStart.width,bottom=cropStart.y+cropStart.height;if(cropMode.includes('w')){previewCrop.x=clampCrop(cropStart.x+dx,0,right-minWidth);previewCrop.width=right-previewCrop.x;}if(cropMode.includes('e'))previewCrop.width=clampCrop(cropStart.width+dx,minWidth,1-cropStart.x);if(cropMode.includes('n')){previewCrop.y=clampCrop(cropStart.y+dy,0,bottom-minHeight);previewCrop.height=bottom-previewCrop.y;}if(cropMode.includes('s'))previewCrop.height=clampCrop(cropStart.height+dy,minHeight,1-cropStart.y);}
  updateCropSelection();event.preventDefault();
});
cropSelection.addEventListener('pointerup',event=>{if(event.pointerId===cropPointer)cropPointer=-1;});
cropSelection.addEventListener('pointercancel',()=>cropPointer=-1);
cropSelection.addEventListener('keydown',event=>{
  const step=event.shiftKey?.025:.01;if(event.key==='ArrowLeft')previewCrop.x=clampCrop(previewCrop.x-step,0,1-previewCrop.width);else if(event.key==='ArrowRight')previewCrop.x=clampCrop(previewCrop.x+step,0,1-previewCrop.width);else if(event.key==='ArrowUp')previewCrop.y=clampCrop(previewCrop.y-step,0,1-previewCrop.height);else if(event.key==='ArrowDown')previewCrop.y=clampCrop(previewCrop.y+step,0,1-previewCrop.height);else if(event.key==='-'||event.key==='_'){previewCrop.width=Math.max(.05,previewCrop.width-step*2);previewCrop.height=Math.max(.05,previewCrop.height-step*2);previewCrop.x=clampCrop(previewCrop.x+step,0,1-previewCrop.width);previewCrop.y=clampCrop(previewCrop.y+step,0,1-previewCrop.height);}else if(event.key==='+'||event.key==='='){const right=previewCrop.x+previewCrop.width,bottom=previewCrop.y+previewCrop.height;previewCrop.x=Math.max(0,previewCrop.x-step);previewCrop.y=Math.max(0,previewCrop.y-step);previewCrop.width=Math.min(1-previewCrop.x,right-previewCrop.x+step);previewCrop.height=Math.min(1-previewCrop.y,bottom-previewCrop.y+step);}else return;updateCropSelection();event.preventDefault();
});
async function croppedPng(image:HTMLImageElement){
  const source=cropSourceRect(previewCrop,image.naturalWidth,image.naturalHeight),output=document.createElement('canvas');output.width=source.width;output.height=source.height;
  output.getContext('2d')!.drawImage(image,source.x,source.y,source.width,source.height,0,0,source.width,source.height);return await new Promise<Blob>((resolve,reject)=>output.toBlob(blob=>blob?resolve(blob):reject(new Error('Unable to encode cropped PNG.')),'image/png'));
}
async function downloadCrop(transparent:boolean){
  const source=transparent?previewTransparentImage:previewImage;if(!source)return;const button=transparent?previewDownloadTransparent:previewDownloadPaper,original=button.textContent;button.disabled=true;button.textContent='Preparing…';
  try{const blob=await croppedPng(source),url=URL.createObjectURL(blob),link=document.createElement('a'),size=cropPixels();link.href=url;link.download=transparent?'watercolor-artwork-cropped-transparent.png':'watercolor-artwork-cropped.png';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);previewSize.textContent=`Downloaded ${size.width} × ${size.height} ${transparent?'transparent':'paper'} PNG`;}
  catch(error){console.error('Unable to export the crop.',error);previewSize.textContent='Unable to export crop';}
  finally{button.disabled=false;button.textContent=original;}
}
previewDownloadPaper.onclick=()=>void downloadCrop(false);
previewDownloadTransparent.onclick=()=>void downloadCrop(true);
previewButton.onclick = async () => {
  previewButton.disabled = true;
  previewButton.textContent = 'Rendering full quality…';
  try {
    const capture = await watercolor.captureHighQualityLayers(2048);
    if (!capture) return;
    if (previewPaperUrl) URL.revokeObjectURL(previewPaperUrl);if(previewTransparentUrl) URL.revokeObjectURL(previewTransparentUrl);
    previewPaperUrl=URL.createObjectURL(capture.withPaper);previewTransparentUrl=URL.createObjectURL(capture.transparent);previewTransparentImage=new Image();previewImage.src=previewPaperUrl;previewTransparentImage.src=previewTransparentUrl;
    await Promise.all([previewImage.decode(),previewTransparentImage.decode()]);previewCrop={x:0,y:0,width:1,height:1};
    previewDialog.showModal();
    requestAnimationFrame(layoutPreviewStage);
  } catch (error) {
    console.error('Unable to render the full-quality preview.', error);
  } finally {
    previewButton.disabled = false;
    previewButton.textContent = 'Preview artwork';
  }
};
app.querySelector<HTMLButtonElement>('.preview-close')!.onclick = () => previewDialog.close();
previewDialog.onclick = event => { if (event.target === previewDialog) previewDialog.close(); };
window.addEventListener('beforeunload', () => { if (previewPaperUrl) URL.revokeObjectURL(previewPaperUrl);if(previewTransparentUrl) URL.revokeObjectURL(previewTransparentUrl); });
repaintButton.onclick = () => {
  window.clearTimeout(plannerTimer);
  timeline.value = '0';
  scrollValue = 0;
  scrollProgress.textContent = '0%';
  const pending = {...pendingPlannerOptions};
  for (const key of Object.keys(pendingPlannerOptions)) delete pendingPlannerOptions[key as keyof WatercolorOptions];
  repaintButton.classList.remove('settings-changed');
  repaintButton.classList.add('is-loading');
  repaintButton.textContent = 'Replanning new variation…';
  if (Object.keys(pending).length) watercolor.setOptions({...pending, seed: Math.random() * 10_000});
  else watercolor.restart();
};
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
