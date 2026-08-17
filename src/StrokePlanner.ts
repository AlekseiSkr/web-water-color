import { createSemanticAttentionMap } from './AttentionPlanner';
import type { DetailMapProvider, ImageSource } from './types';

export interface PaintSegment {
  start: [number, number]; end: [number, number]; color: [number, number, number];
  radius: number; opacity: number; water: number; layer: number; strokeId: number;
}
export interface StrokePlan { segments: PaintSegment[]; sourceAspect: number; layerEnds: number[]; bounds: [number,number,number,number]; }
export interface StrokeTuning {
  strokeEconomy:number;shapeSimplification:number;strokeLength:number;strokeWidth:number;boundaryFidelity:number;
  detailBudget:number;detailMultiplier:number;sourceAccuracy:number;detailPrecision:number;strokeCurvature:number;
}

class Random {
  constructor(private state: number) { this.state = (state * 1_000_003) | 0 || 1; }
  next() { let x=this.state; x^=x<<13; x^=x>>>17; x^=x<<5; this.state=x|0; return (x>>>0)/4_294_967_296; }
  between(a:number,b:number){return a+(b-a)*this.next();}
}
async function resolveImage(source:ImageSource):Promise<CanvasImageSource & {width:number;height:number}>{
  if(typeof source!=='string') return source as CanvasImageSource & {width:number;height:number};
  const image=new Image(); image.crossOrigin='anonymous'; image.src=source; await image.decode(); return image;
}
function pixel(data:Uint8ClampedArray,width:number,height:number,x:number,y:number){
  x=Math.max(0,Math.min(width-1,Math.round(x))); y=Math.max(0,Math.min(height-1,Math.round(y)));
  const i=(y*width+x)*4; return [data[i]/255,data[i+1]/255,data[i+2]/255] as [number,number,number];
}
function mapPoint(x:number,y:number,sourceAspect:number,targetAspect:number,fit:'cover'|'contain'):[number,number]{
  let sx=1,sy=1;
  if(fit==='cover'){if(sourceAspect>targetAspect)sx=sourceAspect/targetAspect;else sy=targetAspect/sourceAspect;}
  else {if(sourceAspect>targetAspect)sy=targetAspect/sourceAspect;else sx=sourceAspect/targetAspect;}
  return [(x-.5)*sx+.5,(y-.5)*sy+.5];
}

function blurPixels(source:Uint8ClampedArray,width:number,height:number,radius:number){
  if(radius<=0)return new Uint8ClampedArray(source);const temporary=new Float32Array(source.length),result=new Uint8ClampedArray(source.length),size=radius*2+1;
  for(let y=0;y<height;y++)for(let channel=0;channel<4;channel++){let sum=0;for(let x=-radius;x<=radius;x++)sum+=source[(y*width+Math.max(0,Math.min(width-1,x)))*4+channel];
    for(let x=0;x<width;x++){temporary[(y*width+x)*4+channel]=sum/size;sum-=source[(y*width+Math.max(0,x-radius))*4+channel];sum+=source[(y*width+Math.min(width-1,x+radius+1))*4+channel];}}
  for(let x=0;x<width;x++)for(let channel=0;channel<4;channel++){let sum=0;for(let y=-radius;y<=radius;y++)sum+=temporary[(Math.max(0,Math.min(height-1,y))*width+x)*4+channel];
    for(let y=0;y<height;y++){result[(y*width+x)*4+channel]=sum/size;sum-=temporary[(Math.max(0,y-radius)*width+x)*4+channel];sum+=temporary[(Math.min(height-1,y+radius+1)*width+x)*4+channel];}}
  return result;
}

function structureField(data:Uint8ClampedArray,width:number,height:number){
  const count=width*height,luma=new Float32Array(count),gx=new Float32Array(count),gy=new Float32Array(count);
  for(let i=0;i<count;i++){const p=i*4;luma[i]=data[p]*.0008337+data[p+1]*.002805+data[p+2]*.000283;}
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const i=y*width+x;
    gx[i]=-luma[i-width-1]-2*luma[i-1]-luma[i+width-1]+luma[i-width+1]+2*luma[i+1]+luma[i+width+1];
    gy[i]=-luma[i-width-1]-2*luma[i-width]-luma[i-width+1]+luma[i+width-1]+2*luma[i+width]+luma[i+width+1];}
  return {luma,gx,gy};
}

interface RegionStroke { points:Array<[number,number]>; color:[number,number,number]; }

/** Finds connected color masses and fills each with parallel sweeps along its principal axis. */
function regionDragStrokes(data:Uint8ClampedArray,width:number,height:number,step:number,levels:number,radius:number,minCells:number,random:Random){
  const gridWidth=Math.ceil(width/step),gridHeight=Math.ceil(height/step),cellCount=gridWidth*gridHeight,labels=new Int16Array(cellCount),visited=new Uint8Array(cellCount);
  for(let gy=0;gy<gridHeight;gy++)for(let gx=0;gx<gridWidth;gx++){const x=Math.min(width-1,Math.round((gx+.5)*step)),y=Math.min(height-1,Math.round((gy+.5)*step)),i=(y*width+x)*4;
    const qr=Math.min(levels-1,Math.floor(data[i]/256*levels)),qg=Math.min(levels-1,Math.floor(data[i+1]/256*levels)),qb=Math.min(levels-1,Math.floor(data[i+2]/256*levels));labels[gy*gridWidth+gx]=qr+qg*levels+qb*levels*levels;}
  const components:Array<{cells:number[];color:[number,number,number]}>=[];
  for(let origin=0;origin<cellCount;origin++){if(visited[origin])continue;const label=labels[origin],stack=[origin],cells:number[]=[];visited[origin]=1;let red=0,green=0,blue=0;
    while(stack.length){const cell=stack.pop()!,gx=cell%gridWidth,gy=Math.floor(cell/gridWidth),x=Math.min(width-1,Math.round((gx+.5)*step)),y=Math.min(height-1,Math.round((gy+.5)*step)),p=(y*width+x)*4;
      cells.push(cell);red+=data[p];green+=data[p+1];blue+=data[p+2];for(const neighbor of [cell-1,cell+1,cell-gridWidth,cell+gridWidth]){if(neighbor<0||neighbor>=cellCount||visited[neighbor]||labels[neighbor]!==label)continue;
        const nx=neighbor%gridWidth;if(Math.abs(nx-gx)>1)continue;visited[neighbor]=1;stack.push(neighbor);}}
    if(cells.length>=minCells){const color:[number,number,number]=[red/cells.length/255,green/cells.length/255,blue/cells.length/255],max=Math.max(...color),min=Math.min(...color),lum=color[0]*.2126+color[1]*.7152+color[2]*.0722;
      if(!(lum>.88&&max-min<.10))components.push({cells,color});}}
  components.sort((a,b)=>b.cells.length-a.cells.length);
  const strokes:RegionStroke[]=[];
  for(const component of components){let cx=0,cy=0;const points=component.cells.map(cell=>{const p:[number,number]=[((cell%gridWidth)+.5)*step,(Math.floor(cell/gridWidth)+.5)*step];cx+=p[0];cy+=p[1];return p;});cx/=points.length;cy/=points.length;
    let xx=0,yy=0,xy=0;for(const point of points){const dx=point[0]-cx,dy=point[1]-cy;xx+=dx*dx;yy+=dy*dy;xy+=dx*dy;}const angle=.5*Math.atan2(2*xy,xx-yy),ux=Math.cos(angle),uy=Math.sin(angle),vx=-uy,vy=ux;
    const bins=new Map<number,{min:number;max:number;v:number;count:number}>(),spacing=Math.max(step,radius*1.22);
    for(const point of points){const dx=point[0]-cx,dy=point[1]-cy,u=dx*ux+dy*uy,v=dx*vx+dy*vy,bin=Math.round(v/spacing),entry=bins.get(bin);
      if(entry){entry.min=Math.min(entry.min,u);entry.max=Math.max(entry.max,u);entry.v+=v;entry.count++;}else bins.set(bin,{min:u,max:u,v,count:1});}
    for(const entry of [...bins.values()].sort((a,b)=>a.v/a.count-b.v/b.count)){let minU=entry.min+radius*.65,maxU=entry.max-radius*.65;if(entry.count<2||maxU-minU<radius*1.65)continue;const centerV=entry.v/entry.count,curve=random.between(-.10,.10)*radius,path:Array<[number,number]>=[];
      for(let point=0;point<=6;point++){const t=point/6,u=minU+(maxU-minU)*t,bend=Math.sin(Math.PI*t)*curve,x=cx+ux*u+vx*(centerV+bend),y=cy+uy*u+vy*(centerV+bend);path.push([x,y]);}
      const margin=radius*1.1;if(path.some(point=>point[0]<margin||point[0]>width-margin||point[1]<margin||point[1]>height-margin))continue;strokes.push({points:path,color:component.color});}
  }
  return strokes;
}

/** Converts image structure into ordered brush paths. Source pixels are never rendered. */
export async function planStrokes(source:ImageSource,seed:number,targetAspect:number,resolution=420,fit:'cover'|'contain'='cover',mode:'watercolor'|'oil'='watercolor',detailFocus:'auto'|'uniform'|'portrait'='auto',detailMap?:DetailMapProvider,tuning:Partial<StrokeTuning>={}):Promise<StrokePlan>{
  const image=await resolveImage(source); const scale=Math.min(1,resolution/Math.max(image.width,image.height));
  const width=Math.max(24,Math.round(image.width*scale)),height=Math.max(24,Math.round(image.height*scale));
  const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true})!; context.drawImage(image,0,0,width,height);
  const data=context.getImageData(0,0,width,height).data,tune:StrokeTuning={strokeEconomy:.72,shapeSimplification:.62,strokeLength:.58,strokeWidth:.58,boundaryFidelity:.72,detailBudget:.42,detailMultiplier:1,sourceAccuracy:.65,detailPrecision:.78,strokeCurvature:.34,...tuning};
  // Keep the authored default (~.72) neutral, but let zero economy become a genuinely dense reconstruction.
  const spacingScale=.48+tune.strokeEconomy*.72,chanceScale=1.55-tune.strokeEconomy*.77,detailEconomyScale=1.70-tune.strokeEconomy*.97,lengthScale=.65+tune.strokeLength*.60,widthScale=.65+tune.strokeWidth*.60;
  const detailMultiplier=Math.max(1,Math.min(10,tune.detailMultiplier)),sourceAccuracy=Math.max(0,Math.min(1,tune.sourceAccuracy));
  const attention=detailMap?await detailMap({data:new Uint8ClampedArray(data),width,height}):createSemanticAttentionMap(data,width,height,detailFocus);
  if(attention.length!==width*height)throw new Error(`detailMap returned ${attention.length} weights; expected ${width*height}.`);
  // Progressive analysis mimics a painter squinting at broad masses before resolving detail.
  const accuracyBlur=1-sourceAccuracy*.52,coarseData=blurPixels(data,width,height,Math.round((6+tune.shapeSimplification*7)*accuracyBlur)),massData=blurPixels(data,width,height,Math.round((3+tune.shapeSimplification*5)*accuracyBlur)),formData=blurPixels(data,width,height,Math.round((2+tune.shapeSimplification*2)*accuracyBlur)),refinedData=sourceAccuracy>.86?new Uint8ClampedArray(data):blurPixels(data,width,height,1);
  const fields=[structureField(formData,width,height),structureField(refinedData,width,height),structureField(data,width,height)];
  const random=new Random(seed),sourceAspect=image.width/image.height,segments:PaintSegment[]=[],layerEnds:number[]=[];
  const minSide=Math.min(width,height),analysisScale=Math.max(width,height)/360;let nextStrokeId=0;
  const appendRegionPass=(layer:number,sourceData:Uint8ClampedArray,step:number,levels:number,radius:number,minCells:number,opacity:number,water:number)=>{
    const strokes=regionDragStrokes(sourceData,width,height,step*analysisScale,levels,radius*analysisScale,minCells,random);
    for(const planned of strokes){const strokeId=nextStrokeId++,strokeRadius=radius*analysisScale/minSide*random.between(.92,1.08);
      for(let point=1;point<planned.points.length;point++){const start=planned.points[point-1],end=planned.points[point];segments.push({
        start:mapPoint(start[0]/width,start[1]/height,sourceAspect,targetAspect,fit),end:mapPoint(end[0]/width,end[1]/height,sourceAspect,targetAspect,fit),
        color:planned.color,radius:strokeRadius,opacity:opacity*random.between(.94,1.06),water:water*random.between(.92,1.08),layer,strokeId});}}
    layerEnds.push(segments.length);
  };
  if(mode==='oil'){
    appendRegionPass(0,coarseData,9*spacingScale,3,23*widthScale,3,.68,0);
    appendRegionPass(1,massData,6*spacingScale,Math.round(5-tune.shapeSimplification),15*widthScale,4,.76,0);
  }else{
    appendRegionPass(0,coarseData,9*spacingScale,3,24*widthScale,3,.027,.94);
    appendRegionPass(1,massData,6*spacingScale,Math.round(5-tune.shapeSimplification),15*widthScale,4,.038,.78);
  }
  const passes=mode==='oil'?[
    {data:formData,field:0,spacing:21,radius:8.6,length:80,opacity:.80,water:0,chance:.66,edgeOnly:false},
    {data:formData,field:0,spacing:15,radius:5.7,length:58,opacity:.85,water:0,chance:.58,edgeOnly:false},
    {data:refinedData,field:1,spacing:10,radius:3.3,length:38,opacity:.90,water:0,chance:.48,edgeOnly:false},
    {data,field:2,spacing:7,radius:1.48,length:16,opacity:.94,water:0,chance:.98,edgeOnly:true},
  ]:[
    {data:formData,field:0,spacing:20,radius:8.0,length:74,opacity:.052,water:.55,chance:.68,edgeOnly:false},
    {data:formData,field:0,spacing:14,radius:5.1,length:52,opacity:.058,water:.43,chance:.60,edgeOnly:false},
    {data:refinedData,field:1,spacing:9,radius:2.8,length:32,opacity:.063,water:.29,chance:.50,edgeOnly:false},
    {data,field:2,spacing:7,radius:1.08,length:13,opacity:.064,water:.14,chance:.98,edgeOnly:true},
  ];
  passes.forEach((pass,passIndex)=>{const layer=passIndex+2,strokes:PaintSegment[][]=[],density=passIndex===1?1+(detailMultiplier-1)*.20:passIndex>=2?detailMultiplier:1,spacing=pass.spacing*analysisScale*spacingScale/Math.sqrt(density),radius=pass.radius*analysisScale*widthScale/Math.pow(density,.10),plannedLength=pass.length*analysisScale*lengthScale,offset=random.between(0,spacing);
    const detailCells=new Set<number>();if(pass.edgeOnly){const ranked:Array<{key:number;score:number}>=[];for(let gridY=0,y=offset;y<height;gridY++,y+=spacing)for(let gridX=0,x=offset;x<width;gridX++,x+=spacing){const ix=Math.max(1,Math.min(width-2,Math.round(x))),iy=Math.max(1,Math.min(height-2,Math.round(y))),field=fields[pass.field],magnitude=Math.hypot(field.gx[iy*width+ix],field.gy[iy*width+ix]),importance=Math.max(0,Math.min(1,attention[iy*width+ix]));
      if(magnitude>.08&&importance>.25+tune.detailPrecision*.22)ranked.push({key:gridY*100000+gridX,score:Math.pow(importance,2+tune.detailPrecision*4)*(.22+Math.min(.8,magnitude))});}ranked.sort((a,b)=>b.score-a.score);const base=mode==='oil'?36:44,cap=Math.round(base*(.25+tune.detailBudget*1.8)*detailEconomyScale*detailMultiplier);ranked.slice(0,cap).forEach(candidate=>detailCells.add(candidate.key));}
    for(let gridY=0,y=offset;y<height;gridY++,y+=spacing)for(let gridX=0,x=offset;x<width;gridX++,x+=spacing){if(pass.edgeOnly&&!detailCells.has(gridY*100000+gridX))continue;
      const px=x+random.between(-spacing*.46,spacing*.46),py=y+random.between(-spacing*.46,spacing*.46);
      const ix=Math.max(1,Math.min(width-2,Math.round(px))),iy=Math.max(1,Math.min(height-2,Math.round(py)));
      const detailWeight=Math.max(0,Math.min(1,attention[iy*width+ix])),attentionMultiplier=passIndex<2?.70+detailWeight*.32:passIndex===2?.58+detailWeight*.50:.15+detailWeight*1.35;
      if(random.next()>Math.min(1,pass.chance*chanceScale*attentionMultiplier))continue;
      const field=fields[pass.field],magnitude=Math.hypot(field.gx[iy*width+ix],field.gy[iy*width+ix]);
      if(pass.edgeOnly&&(magnitude<.15||random.next()>Math.min(1,magnitude*2.1)))continue;
      if(mode==='oil'&&field.luma[iy*width+ix]>.76&&magnitude<.07&&layer<5)continue;
      let tx=-field.gy[iy*width+ix],ty=field.gx[iy*width+ix];const tm=Math.hypot(tx,ty);
      if(tm<.015){const angle=mode==='oil' ? .10+Math.sin(px*.018+seed)*.20+Math.cos(py*.016-seed*.7)*.16 : random.next()*Math.PI;tx=Math.cos(angle);ty=Math.sin(angle);}else{tx/=tm;ty/=tm;}
      if(mode==='oil'){
        const baseAngles=[.08,-.38,.10,-.18,.22,0.,0.],weights=[.76,.56,.48,.38,.24,.08,0.],weight=weights[layer],angle=baseAngles[layer];
        tx=tx*(1-weight)+Math.cos(angle)*weight;ty=ty*(1-weight)+Math.sin(angle)*weight;const length=Math.max(.001,Math.hypot(tx,ty));tx/=length;ty/=length;
      }
      const detailScale=passIndex>=3?1.16-detailWeight*.38:1,totalLength=plannedLength*detailScale*random.between(mode==='oil' ? .84 : .72,mode==='oil' ? 1.18 : 1.28),steps=layer>=5?2:(mode==='oil'?6:5),points:Array<[number,number]>=[];
      const centerColor=pixel(pass.data,width,height,px,py),coherence=[.30,.26,.20,.14,.10][passIndex]*(1.30-tune.boundaryFidelity*.55)*(1.22-sourceAccuracy*.42);
      const extent=(sign:number)=>{let accepted=0,misses=0;for(let distance=3;distance<=totalLength*.5;distance+=3){const sampleX=px+tx*distance*sign,sampleY=py+ty*distance*sign;
        if(sampleX<1||sampleX>=width-1||sampleY<1||sampleY>=height-1)break;const candidate=pixel(pass.data,width,height,sampleX,sampleY),difference=Math.hypot(candidate[0]-centerColor[0],candidate[1]-centerColor[1],candidate[2]-centerColor[2]);
        if(difference>coherence){if(++misses>=2)break;}else{accepted=distance;misses=0;}}return accepted;};
      const behind=extent(-1),ahead=extent(1);if(behind+ahead<Math.max(pass.radius*2.4,totalLength*.28))continue;
      const curvatureRange=(mode==='oil'?.055:.12)*(.35+tune.strokeCurvature*1.9),curvature=random.between(-curvatureRange,curvatureRange);
      for(let s=0;s<=steps;s++){const d=-behind+(behind+ahead)*s/steps,bend=Math.sin(s/steps*Math.PI)*curvature*(behind+ahead);points.push([px+tx*d-ty*bend,py+ty*d+tx*bend]);}
      const strokeMargin=radius*detailScale*(mode==='oil'?3.2:1.45);
      if(points.some(point=>point[0]<strokeMargin||point[0]>width-strokeMargin||point[1]<strokeMargin||point[1]>height-strokeMargin))continue;
      const color:[number,number,number]=pass.edgeOnly?centerColor.map(v=>v*.80) as [number,number,number]:centerColor;
      const stroke:PaintSegment[]=[],strokeId=nextStrokeId++;
      for(let p=1;p<points.length;p++){const a=mapPoint(points[p-1][0]/width,points[p-1][1]/height,sourceAspect,targetAspect,fit),b=mapPoint(points[p][0]/width,points[p][1]/height,sourceAspect,targetAspect,fit);
        stroke.push({start:a,end:b,color,radius:radius*detailScale/minSide*random.between(.88,1.12),opacity:pass.opacity*(.88+detailWeight*.18)*random.between(.9,1.1),water:pass.water*random.between(.85,1.15),layer,strokeId});}
      strokes.push(stroke);
    }
    for(let i=strokes.length-1;i>0;i--){const j=Math.floor(random.next()*(i+1));[strokes[i],strokes[j]]=[strokes[j],strokes[i]];}
    strokes.forEach(stroke=>segments.push(...stroke));layerEnds.push(segments.length);
  });
  const cornerA=mapPoint(0,0,sourceAspect,targetAspect,fit),cornerB=mapPoint(1,1,sourceAspect,targetAspect,fit);
  return {segments,sourceAspect,layerEnds,bounds:[Math.min(cornerA[0],cornerB[0]),Math.min(cornerA[1],cornerB[1]),Math.max(cornerA[0],cornerB[0]),Math.max(cornerA[1],cornerB[1])]};
}
