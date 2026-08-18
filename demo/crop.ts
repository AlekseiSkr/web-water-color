export interface CropRect { x:number; y:number; width:number; height:number }

export function cropSourceRect(crop:CropRect,imageWidth:number,imageHeight:number){
  const x=Math.max(0,Math.min(imageWidth-1,Math.round(crop.x*imageWidth))),y=Math.max(0,Math.min(imageHeight-1,Math.round(crop.y*imageHeight)));
  return{x,y,width:Math.max(1,Math.min(imageWidth-x,Math.round(crop.width*imageWidth))),height:Math.max(1,Math.min(imageHeight-y,Math.round(crop.height*imageHeight)))};
}
