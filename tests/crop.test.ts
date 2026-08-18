import { describe, expect, it } from 'vitest';
import { cropSourceRect } from '../demo/crop';

describe('preview crop geometry',()=>{
  it('preserves the full export by default',()=>{
    expect(cropSourceRect({x:0,y:0,width:1,height:1},2048,2048)).toEqual({x:0,y:0,width:2048,height:2048});
  });

  it('converts a normalized crop to exact source pixels',()=>{
    expect(cropSourceRect({x:.25,y:.1,width:.5,height:.6},2048,1024)).toEqual({x:512,y:102,width:1024,height:614});
  });

  it('clamps rounding at the source boundary',()=>{
    expect(cropSourceRect({x:.9,y:.9,width:.2,height:.2},100,80)).toEqual({x:90,y:72,width:10,height:8});
  });
});
