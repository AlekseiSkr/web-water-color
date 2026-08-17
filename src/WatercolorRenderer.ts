import gsap from 'gsap';
import { planStrokes, type PaintSegment, type StrokePlan } from './StrokePlanner';
import type { ImageSource, WatercolorControls, WatercolorOptions } from './types';

const defaults:Required<Omit<WatercolorOptions,'onProgress'|'onComplete'|'onPhaseChange'|'seed'|'detailMap'>>={
  mode:'watercolor',duration:12,paperColor:'#f3eadb',paperRoughness:.78,edgeDarkening:.68,granulation:.72,bloom:.72,
  transparency:.12,washes:4,speed:1,pixelRatio:1,renderQuality:'fast',analysisResolution:360,strokesPerFrame:24,strokeDuration:.16,strokeEase:[.22,1,.36,1],detailFocus:'auto',imageFit:'contain',
  strokeEconomy:.72,shapeSimplification:.62,strokeLength:.58,strokeWidth:.58,boundaryFidelity:.72,detailBudget:.42,detailMultiplier:1,sourceAccuracy:.65,detailPrecision:.78,detailDelay:.82,
  strokeCurvature:.34,paintLoad:.70,dryBrush:.20,bristleStrength:.58,gloss:.48,
};
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,n));
const randomSeed=()=>Math.random()*10_000;
const cubicBezierEase=(progress:number,[x1,y1,x2,y2]:[number,number,number,number])=>{
  const sample=(t:number,a:number,b:number)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
  const slope=(t:number,a:number,b:number)=>3*(1-t)*(1-t)*a+6*(1-t)*t*(b-a)+3*t*t*(1-b);
  const x=clamp(progress);let t=x;
  for(let iteration=0;iteration<5;iteration++){const derivative=slope(t,x1,x2);if(Math.abs(derivative)<1e-5)break;t=clamp(t-(sample(t,x1,x2)-x)/derivative);}
  return clamp(sample(t,y1,y2));
};

class Random {
  constructor(private state:number){this.state=(state*1_000_003)|0||1;}
  next(){let x=this.state;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x|0;return(x>>>0)/4_294_967_296;}
}

export class WatercolorRenderer implements WatercolorControls {
  private context:CanvasRenderingContext2D;
  private pigment=document.createElement('canvas');
  private pigmentContext=this.pigment.getContext('2d')!;
  private livePaint=document.createElement('canvas');
  private livePaintContext=this.livePaint.getContext('2d')!;
  private paper=document.createElement('canvas');
  private paperContext=this.paper.getContext('2d')!;
  private options:WatercolorOptions & typeof defaults;
  private source?:ImageSource;
  private plan?:StrokePlan;
  private timeline?:gsap.core.Tween;
  private resizeObserver:ResizeObserver;
  private progressState={progress:0};
  private seed:number;
  private drawnSegments=0;
  private phase='complete';
  private destroyed=false;
  private width=1;
  private height=1;
  private wetMarks:Array<{segments:PaintSegment[];strokeId:number;age:number}>=[];
  private completionFrame=0;
  private timelineFinished=false;
  private scrubFrame=0;
  private scrubTarget=0;
  private checkpoints:Array<{segment:number;surface:HTMLCanvasElement}>=[];
  private cpuPaintMs=0;
  private timelineWork=new Float64Array([0]);
  private imageRequest=0;

  constructor(public readonly canvas:HTMLCanvasElement,options:WatercolorOptions={}){
    const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('watercolor-timelapse requires a 2D canvas context.');
    this.context=context;this.options={...defaults,...options};this.seed=options.seed??randomSeed();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
  }

  async setImage(source:ImageSource){
    const request=++this.imageRequest;this.source=source;this.timeline?.kill();this.cancelCompletion();this.cancelScrub();this.progressState.progress=0;this.setPhase('analyzing');
    const detailScale=1+(Math.sqrt(clamp(this.options.detailMultiplier,1,10))-1)*(.35+clamp(this.options.sourceAccuracy)*.65),analysisResolution=Math.min(720,Math.round(this.options.analysisResolution*detailScale));
    const plan=await planStrokes(source,this.seed,this.canvasAspect(),analysisResolution,this.options.imageFit,this.options.mode,this.options.detailFocus,this.options.detailMap,{
      strokeEconomy:this.options.strokeEconomy,shapeSimplification:this.options.shapeSimplification,strokeLength:this.options.strokeLength,strokeWidth:this.options.strokeWidth,
      boundaryFidelity:this.options.boundaryFidelity,detailBudget:this.options.detailBudget,detailMultiplier:this.options.detailMultiplier,sourceAccuracy:this.options.sourceAccuracy,detailPrecision:this.options.detailPrecision,strokeCurvature:this.options.strokeCurvature,
    });
    if(this.destroyed||request!==this.imageRequest)return;this.plan=plan;this.buildTimelineWork();this.canvas.dataset.watercolorSegments=String(this.plan.segments.length);this.canvas.dataset.watercolorLayerEnds=this.plan.layerEnds.join(',');this.clearCheckpoints();this.resetPainting();this.setPhase('painting');
  }
  play(){
    if(!this.plan||this.timeline?.isActive())return;if(this.progressState.progress>=1){this.restart();return;}
    this.timeline?.kill();this.cancelCompletion();this.cancelScrub();const remaining=1-this.progressState.progress;
    this.timeline=gsap.to(this.progressState,{progress:1,duration:this.options.duration*remaining,ease:'none',onUpdate:()=>this.updatePainting(),
      onComplete:()=>{this.timelineFinished=true;this.scheduleCompletion();}});
    this.timeline.timeScale(this.options.speed);
  }
  pause(){this.timeline?.pause();}
  restart(seed=randomSeed()){
    this.timeline?.kill();this.cancelCompletion();this.cancelScrub();this.seed=seed;this.progressState.progress=0;if(this.source){const rebuild=this.setImage(this.source),request=this.imageRequest;void rebuild.then(()=>{if(request===this.imageRequest)this.play();});}
  }
  seek(progress:number){
    this.timeline?.kill();this.cancelCompletion();this.progressState.progress=clamp(progress);this.scrubTarget=this.targetSegment(this.progressState.progress);this.scheduleScrub();
    this.options.onProgress?.(this.progressState.progress);
  }
  setOptions(options:Partial<WatercolorOptions>){
    const modeChanged=options.mode!==undefined&&options.mode!==this.options.mode;
    const attentionChanged=(options.detailFocus!==undefined&&options.detailFocus!==this.options.detailFocus)||(options.detailMap!==undefined&&options.detailMap!==this.options.detailMap);
    const plannerChanged=modeChanged||attentionChanged||['analysisResolution','strokeEconomy','shapeSimplification','strokeLength','strokeWidth','boundaryFidelity','detailBudget','detailMultiplier','sourceAccuracy','detailPrecision','strokeCurvature'].some(key=>options[key as keyof WatercolorOptions]!==undefined);
    const requiresRebuild=options.paperColor!==undefined||options.paperRoughness!==undefined||options.granulation!==undefined||options.bloom!==undefined||options.transparency!==undefined||options.paintLoad!==undefined||options.dryBrush!==undefined||options.bristleStrength!==undefined||options.gloss!==undefined||options.renderQuality!==undefined;
    const preservedProgress=this.progressState.progress,wasPlaying=Boolean(this.timeline?.isActive());
    Object.assign(this.options,options);if(options.seed!==undefined){this.restart(options.seed);return;}
    if(plannerChanged&&this.source){const rebuild=this.setImage(this.source),request=this.imageRequest;void rebuild.then(()=>{if(request!==this.imageRequest)return;this.seek(preservedProgress);if(wasPlaying)this.play();});return;}
    if(options.pixelRatio!==undefined){this.resize();return;}
    if(requiresRebuild){this.createPaper();this.rebuildToAsync(this.targetSegment(this.progressState.progress));}else this.compose();
  }
  capture(type='image/png',quality=.92){return this.canvas.toDataURL(type,quality);}

  private updatePainting(){
    const target=this.targetSegment(this.progressState.progress);if(target>this.drawnSegments)this.depositBudget(target,true);
    this.advanceWetMarks();this.compose();this.setPhase(this.progressState.progress>.94?'drying':'painting');this.options.onProgress?.(this.progressState.progress);
  }
  private targetSegment(progress:number){
    if(!this.plan||progress<=0)return 0;if(progress>=1)return this.plan.segments.length;const total=this.timelineWork[this.timelineWork.length-1],target=total*clamp(progress);let low=1,high=this.timelineWork.length-1;
    while(low<high){const middle=(low+high)>>>1;if(this.timelineWork[middle]<target)low=middle+1;else high=middle;}
    const previous=this.timelineWork[low-1],weight=Math.max(1e-9,this.timelineWork[low]-previous);return low-1+(target-previous)/weight;
  }
  private buildTimelineWork(){
    if(!this.plan){this.timelineWork=new Float64Array([0]);return;}const segments=this.plan.segments,cumulative=new Float64Array(segments.length+1);let previousStroke=-1;
    for(let index=0;index<segments.length;index++){const segment=segments[index],distance=Math.hypot(segment.end[0]-segment.start[0],segment.end[1]-segment.start[1]),lift=segment.strokeId===previousStroke?0:(this.options.mode==='oil'?.0065:.005);cumulative[index+1]=cumulative[index]+Math.max(.0004,distance)+lift;previousStroke=segment.strokeId;}
    this.timelineWork=cumulative;this.canvas.dataset.watercolorTimelineWork=cumulative[cumulative.length-1].toFixed(3);
  }
  private strokeEnd(index:number){
    if(!this.plan||index>=this.plan.segments.length)return index;const strokeId=this.plan.segments[index].strokeId;while(index<this.plan.segments.length&&this.plan.segments[index].strokeId===strokeId)index++;return index;
  }
  private partialStroke(stroke:PaintSegment[],progress:number){
    const visible=clamp(progress)*stroke.length,complete=Math.floor(visible),partial=visible-complete,result=stroke.slice(0,complete);
    if(partial>0&&complete<stroke.length){const segment=stroke[complete];result.push({...segment,end:[segment.start[0]+(segment.end[0]-segment.start[0])*partial,segment.start[1]+(segment.end[1]-segment.start[1])*partial]});}
    return result;
  }
  private strokeRevealSpan(segmentCount:number){
    if(!this.plan)return segmentCount;const unitsPerSecond=this.plan.segments.length/Math.max(.1,this.options.duration)*Math.max(.1,this.options.speed);
    return Math.max(segmentCount,unitsPerSecond*Math.max(.025,this.options.strokeDuration));
  }
  private paintNextStroke(index:number,animate=false,ctx=this.pigmentContext,progress=1){
    if(!this.plan)return index;const strokeId=this.plan.segments[index].strokeId,start=index;while(index<this.plan.segments.length&&this.plan.segments[index].strokeId===strokeId)index++;
    const fullStroke=this.plan.segments.slice(start,index),stroke=progress>=1?fullStroke:this.partialStroke(fullStroke,progress);if(this.options.mode==='oil')this.paintOilStroke(stroke,strokeId,ctx);else{this.paintWatercolorStroke(stroke,strokeId,0,ctx);if(progress>=1&&ctx===this.pigmentContext&&animate&&strokeId%3===0)this.wetMarks.push({segments:fullStroke,strokeId,age:0});}
    return index;
  }
  private renderLiveStrokes(target:number){
    this.livePaintContext.clearRect(0,0,this.width,this.height);if(!this.plan)return;let index=this.drawnSegments,painted=0,scanned=0,brushProgress=0;
    const activeLimit=Math.max(4,Math.min(18,Math.round(this.options.strokesPerFrame*.65)));
    while(index<this.plan.segments.length&&painted<activeLimit&&scanned<64){const end=this.strokeEnd(index),span=this.strokeRevealSpan(end-index),raw=(target-(end-span))/span;
      if(raw>0){const eased=cubicBezierEase(clamp(raw),this.options.strokeEase);brushProgress=eased;this.paintNextStroke(index,false,this.livePaintContext,eased);painted++;}index=end;scanned++;}
    this.canvas.dataset.watercolorActiveStrokes=String(painted);this.canvas.dataset.watercolorStrokeProgress=brushProgress.toFixed(3);
  }
  private depositBudget(target:number,animate=false,budgetMs=this.options.mode==='oil'?7:8){
    const started=performance.now(),limit=Math.max(1,Math.round(this.options.strokesPerFrame));let strokes=0,index=this.drawnSegments;
    this.canvas.dataset.watercolorTargetSegment=target.toFixed(2);while(this.plan&&index<this.plan.segments.length&&this.strokeEnd(index)<=target&&strokes<limit&&(strokes===0||performance.now()-started<budgetMs)){index=this.paintNextStroke(index,animate);strokes++;}
    this.drawnSegments=index;this.renderLiveStrokes(target);if(!animate)this.maybeCheckpoint();this.cpuPaintMs+=performance.now()-started;if(this.plan&&index>=this.plan.segments.length)this.canvas.dataset.watercolorCpuMs=this.cpuPaintMs.toFixed(1);
    return !this.plan||index>=this.plan.segments.length||this.strokeEnd(index)>target;
  }
  private cancelCompletion(){
    this.timelineFinished=false;if(this.completionFrame){cancelAnimationFrame(this.completionFrame);this.completionFrame=0;}
  }
  private cancelScrub(){if(this.scrubFrame){cancelAnimationFrame(this.scrubFrame);this.scrubFrame=0;}}
  private scheduleScrub(){
    if(this.scrubFrame)return;this.scrubFrame=requestAnimationFrame(()=>{this.scrubFrame=0;if(this.destroyed||!this.plan)return;
      if(this.drawnSegments>this.scrubTarget&&!this.restoreCheckpoint(this.scrubTarget))this.resetPainting();const caughtUp=this.depositBudget(this.scrubTarget,false);this.compose();
      if(!caughtUp)this.scheduleScrub();});
  }
  private scheduleCompletion(){
    if(this.completionFrame||!this.timelineFinished)return;
    this.completionFrame=requestAnimationFrame(()=>{this.completionFrame=0;if(this.destroyed||!this.timelineFinished||!this.plan)return;
      if(this.drawnSegments<this.plan.segments.length)this.depositBudget(this.plan.segments.length,true);this.advanceWetMarks();this.compose();
      if(this.drawnSegments<this.plan.segments.length||this.wetMarks.length){this.scheduleCompletion();return;}
      this.timelineFinished=false;this.setPhase('complete');this.options.onComplete?.();});
  }
  private paintOilStroke(segments:PaintSegment[],strokeId:number,ctx=this.pigmentContext){
    if(!segments.length)return;const random=new Random(this.seed+strokeId*31.77),first=segments[0],quality=this.qualityFactor();
    const rawPoints:Array<[number,number]>=[first.start,...segments.map(segment=>segment.end)].map(point=>[point[0]*this.width,point[1]*this.height]);
    let points=this.smoothPath(rawPoints,5);const characterRoll=random.next();let character:'loaded'|'dry'|'tap'='loaded';
    const dry=clamp(this.options.dryBrush);if(first.layer>=6)character=characterRoll<.45+dry*.4?'tap':'dry';else if(first.layer===5)character=characterRoll<.12+dry*.42?'tap':(characterRoll<.24+dry*.52?'dry':'loaded');else if(first.layer===4&&characterRoll<.05+dry*.35)character='dry';else if(characterRoll<.02+dry*.25)character='dry';
    if(character==='tap'){const start=Math.floor(points.length*.34),end=Math.ceil(points.length*.66);points=points.slice(start,end);}
    const radius=Math.max(.7,first.radius*this.height),source=first.color.map(value=>Math.round(clamp(value)*255)) as [number,number,number];
    const profile=this.mixProfile(points,source),mixed=this.averageColors(profile),opacity=clamp(first.opacity)*(.55+this.options.paintLoad*.65)*(character==='dry' ? .62 : 1);
    const depth=.45+this.options.granulation*.85;
    const dark=mixed.map(value=>Math.round(value*.55)) as [number,number,number],light=mixed.map(value=>Math.round(value+(255-value)*.42)) as [number,number,number];
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    if(this.plan){const [left,top,right,bottom]=this.plan.bounds;ctx.beginPath();ctx.rect(left*this.width,top*this.height,(right-left)*this.width,(bottom-top)*this.height);ctx.clip();}
    // Cast shadow makes later strokes visibly stand above earlier paint.
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(${dark[0]},${dark[1]},${dark[2]},${.10*opacity*depth})`;
    ctx.filter=quality<.5?'none':`blur(${Math.min(2.2,radius*.055)}px)`;this.fillOilBody(ctx,this.offsetPath(points,radius*.14*depth,radius*.16*depth),radius*(1+.07*depth),character,random.next()*9);ctx.fill();ctx.filter='none';
    // A soft outer load feathers the body before the denser center is applied.
    const gradient=this.oilGradient(ctx,points,profile,.36*opacity);ctx.fillStyle=gradient;ctx.filter=quality<.5?'none':`blur(${Math.min(1.35,radius*.035)}px)`;
    this.fillOilBody(ctx,points,radius*1.035,character,random.next()*9);ctx.fill();ctx.filter='none';
    ctx.fillStyle=this.oilGradient(ctx,points,profile,(character==='dry' ? .58 : .90)*opacity);this.fillOilBody(ctx,points,radius*.92,character,random.next()*9);ctx.fill();
    // Loaded hairs create parallel ridges across the full confident stroke.
    const bristleAmount=clamp(this.options.bristleStrength),bristles=Math.max(2,Math.min(character==='dry' ? 18 : 14,Math.round(radius*(character==='dry' ? .82 : .52)*(.25+bristleAmount)*quality)));
    for(let hair=0;hair<bristles;hair++){
      const across=(hair/(bristles-1)-.5)*radius*1.72+(random.next()-.5)*radius*.10;
      if(character==='dry'&&random.next()<.28)continue;
      const carried=profile[Math.min(profile.length-1,Math.floor(random.next()*profile.length))],shade=(hair/(bristles-1)-.5)*.16+(random.next()-.5)*.06;
      const hairColor=carried.map(value=>Math.round(clamp(value/255+shade)*255)) as [number,number,number];
      ctx.strokeStyle=`rgba(${hairColor[0]},${hairColor[1]},${hairColor[2]},${(.06+random.next()*.22)*bristleAmount})`;ctx.lineWidth=Math.max(.3,radius*(.022+random.next()*.052));
      this.strokePath(ctx,this.offsetPath(points,across,0));ctx.stroke();
    }
    // Raised top ridge catches light; the opposite groove stays dark.
    ctx.globalCompositeOperation='screen';ctx.strokeStyle=`rgba(${light[0]},${light[1]},${light[2]},${.28*opacity*depth*this.options.gloss})`;ctx.lineWidth=Math.max(.45,radius*.13*depth);
    this.strokePath(ctx,this.offsetPath(points,-radius*.58*depth,-radius*.05*depth));ctx.stroke();
    ctx.globalCompositeOperation='multiply';ctx.strokeStyle=`rgba(${dark[0]},${dark[1]},${dark[2]},${.12*opacity*depth})`;ctx.lineWidth=Math.max(.4,radius*.10*depth);
    this.strokePath(ctx,this.offsetPath(points,radius*.62*depth,radius*.04*depth));ctx.stroke();
    this.paintOilSurface(ctx,points,radius,profile,random,depth,opacity);
    ctx.globalCompositeOperation='source-over';if(character==='loaded'&&random.next()<.12+this.options.paintLoad*.34)this.paintOilTrails(ctx,points,radius,mixed,random,opacity);ctx.restore();
  }
  private mixProfile(points:Array<[number,number]>,source:[number,number,number]){
    const fractions=this.options.renderQuality==='fast'?[0,.5,1]:this.options.renderQuality==='balanced'?[0,.33,.67,1]:[0,.25,.5,.75,1];return fractions.map(fraction=>{const index=Math.min(points.length-1,Math.round((points.length-1)*fraction)),point=points[index],pixel=this.pigmentContext.getImageData(clamp(Math.round(point[0]),0,this.width-1),clamp(Math.round(point[1]),0,this.height-1),1,1).data;
      if(pixel[3]<=18)return source;const amount=clamp((pixel[3]/255)*(.12+this.options.bloom*.40),.06,.46);
      return source.map((value,channel)=>Math.round(Math.exp(Math.log(Math.max(1,value))*(1-amount)+Math.log(Math.max(1,pixel[channel]))*amount))) as [number,number,number];});
  }
  private averageColors(colors:Array<[number,number,number]>):[number,number,number]{return[0,1,2].map(channel=>Math.round(colors.reduce((sum,color)=>sum+color[channel],0)/colors.length)) as [number,number,number];}
  private oilGradient(ctx:CanvasRenderingContext2D,points:Array<[number,number]>,colors:Array<[number,number,number]>,alpha:number){
    const first=points[0],last=points[points.length-1],gradient=ctx.createLinearGradient(first[0],first[1],last[0],last[1]);
    colors.forEach((color,index)=>gradient.addColorStop(index/(colors.length-1),`rgba(${color[0]},${color[1]},${color[2]},${alpha})`));return gradient;
  }
  private paintOilTrails(ctx:CanvasRenderingContext2D,points:Array<[number,number]>,radius:number,color:[number,number,number],random:Random,opacity:number){
    if(points.length<2)return;const last=points[points.length-1],previous=points[points.length-2],dx=last[0]-previous[0],dy=last[1]-previous[1],length=Math.max(1,Math.hypot(dx,dy)),tx=dx/length,ty=dy/length,nx=-ty,ny=tx;
    const trailCount=random.next()<.7?1:2;for(let trail=0;trail<trailCount;trail++){const side=trail===0?-1:1,offset=side*radius*(.65+random.next()*.24),drag=radius*(.45+random.next()*.85);
      ctx.strokeStyle=`rgba(${color[0]},${color[1]},${color[2]},${opacity*(.20+random.next()*.22)})`;ctx.lineWidth=Math.max(.35,radius*(.045+random.next()*.08));
      this.strokePath(ctx,[[previous[0]+nx*offset,previous[1]+ny*offset],[last[0]+nx*offset,last[1]+ny*offset],[last[0]+nx*offset+tx*drag,last[1]+ny*offset+ty*drag]]);ctx.stroke();}
  }
  private offsetPath(points:Array<[number,number]>,normalOffset:number,yOffset:number){
    return points.map((point,index)=>{const before=points[Math.max(0,index-1)],after=points[Math.min(points.length-1,index+1)],dx=after[0]-before[0],dy=after[1]-before[1],length=Math.max(1,Math.hypot(dx,dy));return[point[0]-dy/length*normalOffset,point[1]+dx/length*normalOffset+yOffset] as [number,number];});
  }
  private smoothPath(points:Array<[number,number]>,subdivisions:number){
    if(points.length<3)return points;const result:Array<[number,number]>=[];
    for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
      for(let step=0;step<subdivisions;step++){const t=step/subdivisions,t2=t*t,t3=t2*t;
        result.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
          .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
    result.push(points[points.length-1]);return result;
  }
  private strokePath(ctx:CanvasRenderingContext2D,points:Array<[number,number]>){
    if(points.length<2)return;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length-1;i++){const midpoint:[number,number]=[(points[i][0]+points[i+1][0])*.5,(points[i][1]+points[i+1][1])*.5];ctx.quadraticCurveTo(points[i][0],points[i][1],midpoint[0],midpoint[1]);}
    ctx.lineTo(points[points.length-1][0],points[points.length-1][1]);
  }
  private fillOilBody(ctx:CanvasRenderingContext2D,points:Array<[number,number]>,radius:number,character:'loaded'|'dry'|'tap',phase:number){
    if(points.length<2)return;const left:Array<[number,number]>=[],right:Array<[number,number]>=[];
    points.forEach((point,index)=>{const before=points[Math.max(0,index-1)],after=points[Math.min(points.length-1,index+1)],dx=after[0]-before[0],dy=after[1]-before[1],length=Math.max(1,Math.hypot(dx,dy));
      const t=index/(points.length-1),edge=Math.pow(Math.max(0,Math.sin(Math.PI*t)),character==='tap' ? .25 : .48),base=character==='dry' ? .12 : (character==='tap' ? .30 : .24);
      const pressure=(base+(1-base)*edge)*(1+.065*Math.sin(t*Math.PI*5+phase)+.035*Math.sin(t*Math.PI*11-phase*.7));
      const nx=-dy/length*radius*pressure,ny=dx/length*radius*pressure;left.push([point[0]+nx,point[1]+ny]);right.push([point[0]-nx,point[1]-ny]);});
    ctx.beginPath();ctx.moveTo(left[0][0],left[0][1]);for(let i=1;i<left.length;i++)ctx.lineTo(left[i][0],left[i][1]);
    for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i][0],right[i][1]);ctx.closePath();
  }
  private paintOilSurface(ctx:CanvasRenderingContext2D,points:Array<[number,number]>,radius:number,colors:Array<[number,number,number]>,random:Random,depth:number,opacity:number){
    const quality=this.qualityFactor(),marks=Math.max(2,Math.min(30,Math.round(radius*.48*quality)));
    ctx.globalCompositeOperation='multiply';
    for(let mark=0;mark<marks;mark++){const index=Math.min(points.length-2,Math.floor(random.next()*(points.length-1))),point=points[index],next=points[index+1],angle=Math.atan2(next[1]-point[1],next[0]-point[0]),color=colors[Math.floor(random.next()*colors.length)];
      ctx.save();ctx.translate(point[0]+(random.next()-.5)*radius,point[1]+(random.next()-.5)*radius);ctx.rotate(angle);ctx.fillStyle=`rgba(${Math.round(color[0]*.62)},${Math.round(color[1]*.62)},${Math.round(color[2]*.62)},${.025*depth*opacity})`;
      ctx.beginPath();ctx.ellipse(0,0,Math.max(.4,radius*(.04+random.next()*.12)),Math.max(.3,radius*(.025+random.next()*.06)),0,0,Math.PI*2);ctx.fill();ctx.restore();}
    // Small directional specular breaks alternate with matte pits.
    ctx.globalCompositeOperation='screen';
    for(let glint=0;glint<Math.ceil(marks*(.10+this.options.gloss*.55));glint++){const index=Math.min(points.length-2,Math.floor(random.next()*(points.length-1))),point=points[index],next=points[index+1],dx=next[0]-point[0],dy=next[1]-point[1],length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length,color=colors[Math.floor(random.next()*colors.length)],offset=-radius*(.15+random.next()*.45);
      ctx.strokeStyle=`rgba(${Math.round(color[0]+(255-color[0])*.72)},${Math.round(color[1]+(255-color[1])*.72)},${Math.round(color[2]+(255-color[2])*.72)},${.085*depth*opacity*this.options.gloss})`;ctx.lineWidth=Math.max(.35,radius*.035);
      ctx.beginPath();ctx.moveTo(point[0]+nx*offset,point[1]+ny*offset);ctx.lineTo(point[0]+nx*offset+dx*.65,point[1]+ny*offset+dy*.65);ctx.stroke();}
  }
  private paintWatercolorStroke(segments:PaintSegment[],strokeId:number,expansion=0,ctx=this.pigmentContext){
    if(!segments.length)return;const first=segments[0],random=new Random(this.seed+strokeId*19.41+expansion*997),quality=this.qualityFactor();
    const raw:[number,number][]=[first.start,...segments.map(segment=>segment.end)].map(point=>this.flowPoint(point,first.radius,random));
    const points=this.smoothPath(raw,4),radius=Math.max(.45,first.radius*this.height),color=first.color.map(value=>Math.round(clamp(value)*255)) as [number,number,number];
    const opacity=first.opacity*(1-this.options.transparency*.55)*(.55+this.options.paintLoad*.70),wetScale=1+expansion*this.options.bloom*.34;
    ctx.save();if(this.plan){const [left,top,right,bottom]=this.plan.bounds;ctx.beginPath();ctx.rect(left*this.width,top*this.height,(right-left)*this.width,(bottom-top)*this.height);ctx.clip();}
    // Diffuse water front, then a denser irregular pigment body.
    const edgeShade=.92-this.options.edgeDarkening*.20;ctx.fillStyle=`rgba(${Math.round(color[0]*edgeShade)},${Math.round(color[1]*edgeShade)},${Math.round(color[2]*edgeShade)},${opacity*(.20+this.options.edgeDarkening*.16+expansion*.05)})`;ctx.filter=quality<.5?'none':`blur(${Math.min(3.2,radius*.12)}px)`;
    this.fillOilBody(ctx,points,radius*1.20*wetScale,'loaded',random.next()*8);ctx.fill();ctx.filter='none';
    ctx.fillStyle=`rgba(${color[0]},${color[1]},${color[2]},${opacity*3.05})`;this.fillOilBody(ctx,points,radius*.86,'loaded',random.next()*8);ctx.fill();
    const bristleAmount=clamp(this.options.bristleStrength),bristles=Math.max(1,Math.min(10,Math.round(radius*.42*(.30+bristleAmount)*quality)));
    for(let hair=0;hair<bristles;hair++){if(random.next()<.18)continue;const across=(hair/(Math.max(1,bristles-1))-.5)*radius*1.5+(random.next()-.5)*radius*.12;
      ctx.strokeStyle=`rgba(${color[0]},${color[1]},${color[2]},${opacity*(.20+random.next()*.60)*bristleAmount})`;ctx.lineWidth=Math.max(.28,radius*(.025+random.next()*.07));this.strokePath(ctx,this.offsetPath(points,across,0));ctx.stroke();}
    const marks=Math.max(1,Math.min(9,Math.round(points.length*.24*quality)));
    for(let mark=0;mark<marks;mark++){const index=Math.min(points.length-2,Math.floor(random.next()*(points.length-1))),point=points[index],next=points[index+1],dx=next[0]-point[0],dy=next[1]-point[1],length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length,offset=(random.next()-.5)*radius*1.35;
      if(this.paperHeight(point[0],point[1])<.5){ctx.fillStyle=`rgba(${Math.round(color[0]*.64)},${Math.round(color[1]*.64)},${Math.round(color[2]*.64)},${opacity*(.18+random.next()*.25)})`;ctx.beginPath();ctx.arc(point[0]+nx*offset,point[1]+ny*offset,Math.max(.3,radius*(.025+random.next()*.07)),0,Math.PI*2);ctx.fill();}}
    ctx.globalCompositeOperation='destination-out';ctx.fillStyle=`rgba(0,0,0,${.02+.035*this.options.paperRoughness})`;
    for(let lift=0;lift<Math.min(6,marks);lift++){const point=points[Math.floor(random.next()*points.length)];if(this.paperHeight(point[0],point[1])>.56){ctx.beginPath();ctx.arc(point[0]+(random.next()-.5)*radius,point[1]+(random.next()-.5)*radius,Math.max(.25,radius*(.018+random.next()*.045)),0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }
  private flowPoint(point:[number,number],radius:number,random:Random):[number,number]{
    const x=point[0]*this.width,y=point[1]*this.height,e=2,hx=this.paperHeight(x+e,y)-this.paperHeight(x-e,y),hy=this.paperHeight(x,y+e)-this.paperHeight(x,y-e);
    const strength=this.options.bloom*radius*this.height*1.8;return[x-hx*strength+(random.next()-.5)*strength*.08,y-hy*strength+(random.next()-.5)*strength*.08];
  }
  private paperHeight(x:number,y:number){
    const s=this.seed*.013;return .5+.22*Math.sin(x*.021+s)*Math.sin(y*.027-s*.7)+.16*Math.sin(x*.083+y*.017+s*2.1)+.1*Math.cos(y*.14-x*.031-s);
  }
  private advanceWetMarks(){
    const survivors:typeof this.wetMarks=[];for(const mark of this.wetMarks){mark.age++;if(mark.age===2||mark.age===5)this.paintWatercolorStroke(mark.segments,mark.strokeId,mark.age/5);if(mark.age<6)survivors.push(mark);}this.wetMarks=survivors;
  }
  private compose(){
    this.context.save();this.context.globalCompositeOperation='source-over';this.context.drawImage(this.paper,0,0);
    this.context.globalCompositeOperation=this.options.mode==='oil'?'source-over':'multiply';this.context.globalAlpha=this.options.mode==='oil'?1:.96;this.context.drawImage(this.pigment,0,0);this.context.drawImage(this.livePaint,0,0);this.context.restore();
  }
  private createPaper(){
    this.paper.width=this.width;this.paper.height=this.height;const base=this.hex(this.options.paperColor),image=this.paperContext.createImageData(this.width,this.height),data=image.data;
    for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++){const i=(y*this.width+x)*4,h=this.paperHeight(x,y)-.5,fiber=Math.sin(y*.72+x*.035+this.seed)*.5;
      const variation=(h*.085+fiber*.012)*this.options.paperRoughness;data[i]=clamp(base[0]/255+variation)*255;data[i+1]=clamp(base[1]/255+variation)*255;data[i+2]=clamp(base[2]/255+variation)*255;data[i+3]=255;}
    this.paperContext.putImageData(image,0,0);this.compose();
  }
  private qualityFactor(){return this.options.renderQuality==='fast'?.38:this.options.renderQuality==='balanced'?.68:1;}
  private clearCheckpoints(){this.checkpoints=[];}
  private maybeCheckpoint(){
    if(!this.plan||this.drawnSegments>=this.plan.segments.length)return;const interval=Math.max(1,Math.ceil(this.plan.segments.length/6)),last=this.checkpoints[this.checkpoints.length-1];if(this.drawnSegments-(last?.segment??0)<interval)return;
    const surface=document.createElement('canvas');surface.width=this.width;surface.height=this.height;surface.getContext('2d')!.drawImage(this.pigment,0,0);this.checkpoints.push({segment:this.drawnSegments,surface});
  }
  private restoreCheckpoint(target:number){
    for(let index=this.checkpoints.length-1;index>=0;index--){const checkpoint=this.checkpoints[index];if(checkpoint.segment>target)continue;this.pigmentContext.clearRect(0,0,this.width,this.height);this.pigmentContext.drawImage(checkpoint.surface,0,0);this.drawnSegments=checkpoint.segment;this.wetMarks=[];return true;}return false;
  }
  private resetPainting(){this.pigmentContext.clearRect(0,0,this.width,this.height);this.livePaintContext.clearRect(0,0,this.width,this.height);this.drawnSegments=0;this.wetMarks=[];this.cpuPaintMs=0;this.canvas.dataset.watercolorCpuMs='0';this.canvas.dataset.watercolorActiveStrokes='0';this.canvas.dataset.watercolorStrokeProgress='0.000';this.compose();}
  private rebuildToAsync(target:number){
    this.cancelScrub();this.clearCheckpoints();this.resetPainting();this.scrubTarget=target;this.scheduleScrub();
  }
  private resize(){
    const cssWidth=Math.max(1,this.canvas.clientWidth||this.canvas.width),cssHeight=Math.max(1,this.canvas.clientHeight||this.canvas.height),ratio=Math.min(window.devicePixelRatio||1,this.options.pixelRatio);
    const width=Math.min(1400,Math.round(cssWidth*ratio)),height=Math.min(1400,Math.round(cssHeight*ratio));if(width===this.width&&height===this.height)return;
    this.width=width;this.height=height;this.canvas.width=width;this.canvas.height=height;this.pigment.width=width;this.pigment.height=height;this.livePaint.width=width;this.livePaint.height=height;this.clearCheckpoints();this.createPaper();if(this.plan)this.rebuildToAsync(this.targetSegment(this.progressState.progress));
  }
  private hex(value:string):[number,number,number]{const normalized=value.replace('#','');const full=normalized.length===3?normalized.split('').map(c=>c+c).join(''):normalized;const n=parseInt(full,16);return[(n>>16)&255,(n>>8)&255,n&255];}
  private canvasAspect(){return Math.max(1,this.canvas.clientWidth||this.canvas.width)/Math.max(1,this.canvas.clientHeight||this.canvas.height);}
  private setPhase(phase:'analyzing'|'painting'|'drying'|'complete'){if(this.phase===phase)return;this.phase=phase;this.options.onPhaseChange?.(phase);}
  destroy(){this.destroyed=true;this.imageRequest++;this.timeline?.kill();this.cancelCompletion();this.cancelScrub();this.clearCheckpoints();this.resizeObserver.disconnect();delete this.canvas.dataset.watercolorSegments;delete this.canvas.dataset.watercolorLayerEnds;delete this.canvas.dataset.watercolorTargetSegment;delete this.canvas.dataset.watercolorCpuMs;delete this.canvas.dataset.watercolorActiveStrokes;delete this.canvas.dataset.watercolorStrokeProgress;delete this.canvas.dataset.watercolorTimelineWork;}
}
