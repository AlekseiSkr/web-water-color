export type DetailFocus = 'auto' | 'uniform' | 'portrait';

const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));

function skinLikelihood(data:Uint8ClampedArray,index:number){
  const r=data[index],g=data[index+1],b=data[index+2],max=Math.max(r,g,b),min=Math.min(r,g,b);
  const cb=128-.168736*r-.331264*g+.5*b,cr=128+.5*r-.418688*g-.081312*b;
  if(r<48||max-min<12||cr<128||cr>181||cb<72||cb>137)return 0;
  return clamp((r-g+18)/70)*clamp((cr-128)/24)*clamp((137-cb)/28);
}

function gaussian(map:Float32Array,width:number,height:number,cx:number,cy:number,rx:number,ry:number,amount:number){
  const left=Math.max(0,Math.floor(cx-rx*2.5)),right=Math.min(width-1,Math.ceil(cx+rx*2.5)),top=Math.max(0,Math.floor(cy-ry*2.5)),bottom=Math.min(height-1,Math.ceil(cy+ry*2.5));
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry,value=amount*Math.exp(-(dx*dx+dy*dy)*.5),index=y*width+x;map[index]=Math.max(map[index],value);}
}

function largestSkinRegion(data:Uint8ClampedArray,width:number,height:number){
  const step=Math.max(2,Math.round(Math.min(width,height)/150)),gridWidth=Math.ceil(width/step),gridHeight=Math.ceil(height/step),skin=new Uint8Array(gridWidth*gridHeight),visited=new Uint8Array(gridWidth*gridHeight);
  for(let gy=0;gy<gridHeight;gy++)for(let gx=0;gx<gridWidth;gx++){const x=Math.min(width-1,Math.round((gx+.5)*step)),y=Math.min(height-1,Math.round((gy+.5)*step));skin[gy*gridWidth+gx]=skinLikelihood(data,(y*width+x)*4)>.17?1:0;}
  let best:number[]=[];
  for(let origin=0;origin<skin.length;origin++){if(visited[origin]||!skin[origin])continue;const cells:number[]=[],stack=[origin];visited[origin]=1;
    while(stack.length){const cell=stack.pop()!,x=cell%gridWidth;cells.push(cell);for(const neighbor of [cell-1,cell+1,cell-gridWidth,cell+gridWidth]){if(neighbor<0||neighbor>=skin.length||visited[neighbor]||!skin[neighbor]||Math.abs(neighbor%gridWidth-x)>1)continue;visited[neighbor]=1;stack.push(neighbor);}}
    if(cells.length>best.length)best=cells;
  }
  if(best.length<Math.max(18,skin.length*.012))return undefined;
  let minX=gridWidth,minY=gridHeight,maxX=0,maxY=0;for(const cell of best){const x=cell%gridWidth,y=Math.floor(cell/gridWidth);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  let left=minX*step,right=Math.min(width,(maxX+1)*step),top=minY*step,bottom=Math.min(height,(maxY+1)*step),regionWidth=right-left,regionHeight=bottom-top;
  // Connected neck/shoulder skin can make the region too tall. Preserve the upper face-sized portion.
  if(regionHeight>regionWidth*1.48)bottom=Math.min(bottom,top+regionWidth*1.48);
  regionHeight=bottom-top;if(regionWidth<width*.12||regionHeight<height*.12)return undefined;
  left=Math.max(0,left-regionWidth*.13);right=Math.min(width,right+regionWidth*.13);top=Math.max(0,top-regionHeight*.18);bottom=Math.min(height,bottom+regionHeight*.08);
  return {left,right,top,bottom,width:right-left,height:bottom-top};
}

function darkestFeature(data:Uint8ClampedArray,width:number,height:number,left:number,right:number,top:number,bottom:number,fallbackX:number,fallbackY:number){
  const candidates:Array<{x:number;y:number;score:number}>=[],radius=Math.max(2,Math.round((right-left)*.055));
  for(let y=Math.max(radius,Math.round(top));y<Math.min(height-radius,Math.round(bottom));y+=2)for(let x=Math.max(radius,Math.round(left));x<Math.min(width-radius,Math.round(right));x+=2){const index=(y*width+x)*4,luma=data[index]*.2126+data[index+1]*.7152+data[index+2]*.0722;
    let surround=0,count=0;for(const [dx,dy] of [[-radius,0],[radius,0],[0,-radius],[0,radius]]){const p=((y+dy)*width+x+dx)*4;surround+=data[p]*.2126+data[p+1]*.7152+data[p+2]*.0722;count++;}
    const score=surround/count-luma;if(score>5)candidates.push({x,y,score});}
  candidates.sort((a,b)=>b.score-a.score);const chosen=candidates.slice(0,Math.max(4,Math.ceil(candidates.length*.04)));if(!chosen.length)return{x:fallbackX,y:fallbackY};
  const total=chosen.reduce((sum,item)=>sum+item.score,0);return{x:chosen.reduce((sum,item)=>sum+item.x*item.score,0)/total,y:chosen.reduce((sum,item)=>sum+item.y*item.score,0)/total};
}

/** Lightweight semantic prior with a saliency fallback. It intentionally adds no ML runtime to the library. */
export function createSemanticAttentionMap(data:Uint8ClampedArray,width:number,height:number,focus:DetailFocus='auto'){
  const map=new Float32Array(width*height);if(focus==='uniform'){map.fill(1);return map;}
  const luma=new Float32Array(width*height);for(let i=0;i<luma.length;i++){const p=i*4;luma[i]=data[p]*.2126+data[p+1]*.7152+data[p+2]*.0722;}
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const index=y*width+x,p=index*4,gradient=Math.hypot(luma[index+1]-luma[index-1],luma[index+width]-luma[index-width])/255,saturation=(Math.max(data[p],data[p+1],data[p+2])-Math.min(data[p],data[p+1],data[p+2]))/255;
    map[index]=clamp(.08+gradient*1.45+saturation*.10,0,.48);}
  const face=largestSkinRegion(data,width,height);if(!face)return map;
  const {left,right,top,bottom}=face,fw=face.width,fh=face.height,cx=(left+right)*.5;
  gaussian(map,width,height,cx,top+fh*.50,fw*.48,fh*.50,.58);
  const leftEye=darkestFeature(data,width,height,left+fw*.10,cx-fw*.03,top+fh*.25,top+fh*.53,left+fw*.32,top+fh*.40);
  const rightEye=darkestFeature(data,width,height,cx+fw*.03,right-fw*.10,top+fh*.25,top+fh*.53,left+fw*.68,top+fh*.40);
  gaussian(map,width,height,leftEye.x,leftEye.y,fw*.105,fh*.065,1);
  gaussian(map,width,height,rightEye.x,rightEye.y,fw*.105,fh*.065,1);
  gaussian(map,width,height,leftEye.x,leftEye.y-fh*.09,fw*.14,fh*.045,.82);
  gaussian(map,width,height,rightEye.x,rightEye.y-fh*.09,fw*.14,fh*.045,.82);
  gaussian(map,width,height,cx,top+fh*.59,fw*.10,fh*.16,.72);
  const mouth=darkestFeature(data,width,height,left+fw*.25,right-fw*.25,top+fh*.62,top+fh*.86,cx,top+fh*.75);
  gaussian(map,width,height,mouth.x,mouth.y,fw*.18,fh*.072,.96);
  // Preserve the face silhouette, while keeping hair interiors and background subordinate.
  gaussian(map,width,height,cx,top+fh*.51,fw*.55,fh*.55,.62);
  return map;
}
