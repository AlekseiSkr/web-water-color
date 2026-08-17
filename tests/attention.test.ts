import { describe, expect, it } from 'vitest';
import { createSemanticAttentionMap } from '../src/AttentionPlanner';

function portraitFixture(width=100,height=120){
  const data=new Uint8ClampedArray(width*height*4);for(let i=0;i<data.length;i+=4){data[i]=232;data[i+1]=226;data[i+2]=214;data[i+3]=255;}
  for(let y=15;y<105;y++)for(let x=22;x<78;x++){const p=(y*width+x)*4;data[p]=188;data[p+1]=126;data[p+2]=96;}
  for(const [left,right,top,bottom] of [[31,42,46,51],[58,69,46,51],[42,59,79,84]])for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const p=(y*width+x)*4;data[p]=55;data[p+1]=38;data[p+2]=32;}
  return data;
}

describe('semantic attention planning',()=>{
  it('reserves more finishing detail for portrait features than background',()=>{
    const width=100,height=120,map=createSemanticAttentionMap(portraitFixture(width,height),width,height,'portrait');
    expect(map[48*width+36]).toBeGreaterThan(map[5*width+5]);
    expect(map[81*width+50]).toBeGreaterThan(map[5*width+90]);
    expect(map[48*width+36]).toBeGreaterThan(.7);
  });

  it('can explicitly restore uniform detail allocation',()=>{
    const map=createSemanticAttentionMap(portraitFixture(20,24),20,24,'uniform');
    expect([...map].every(value=>value===1)).toBe(true);
  });
});
