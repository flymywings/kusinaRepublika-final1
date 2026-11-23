// Shared constants, kept free of rendering imports so scripts can load the story in node.
export type V3=[number,number,number];
export const SET={
 seat:[.8,-.22,-2.45] as V3,stand:[.8,0,-.45] as V3,table:{x:.8,z:-1.68,top:.75},
 caseAt:[-1.5,0,-1.5] as V3,behindCase:[-1.5,0,-2.08] as V3,door:{x:-1.2,z:3.2,w:1.05,h:2.25},
};
/** The old mirror behind her booth. His reflected card lives in front of the glass, clipped to its rectangle. */
export const MIRROR={x:.88,y:1.57,w:1.3,h:1.4,z:-3.105,card:-3.09};
