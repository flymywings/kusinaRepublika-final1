export type Scene = 'field' | 'office' | 'london';
export type Beat = 'hook' | 'plant' | 'journey' | 'diamond' | 'ruby' | 'collect' | 'expert' | 'payout' | 'cashout' | 'investigate' | 'clue' | 'london' | 'empty' | 'payoff';
export type Person = 'arnold' | 'slack' | 'investorA' | 'investorB' | 'engineer' | 'king';
export const FPS = 30;
export const FRAMES = 952;
export const CAMERA_NEAR = .035;
export const CAMERA_FAR = 180;
export const CARD_HEIGHT = 2.25;
export const TABLE_Y = 1.04;
export const INTERACTIVE_GEMS = {
  main: {id:'main',kind:'diamond' as const,size:.055,x:0,z:.5},
  ruby: {id:'ruby',kind:'ruby' as const,size:.047,x:.74,z:-.55},
};
export const MARKS = {
  field: {arnold:[-.86,0,0],slack:[.96,0,-.35],investorA:[-.52,0,.75],investorB:[1.13,0,.22],engineer:[-.88,0,-.78],king:[-.53,0,.75]},
  office: {arnold:[-.83,0,-.9],slack:[.1,0,-.9],investorA:[.92,0,-.9],investorB:[1.65,0,-1.15],engineer:[-1.8,0,-1.6],king:[0,0,-2]},
  london: {arnold:[-.65,0,-.9],slack:[.65,0,-.9],investorA:[-2,0,-1.5],investorB:[2,0,-1.5],engineer:[0,0,-2],king:[0,0,-2]},
} satisfies Record<Scene,Record<Person,[number,number,number]>>;
export const TARGETS = {plant:[0,.08,.5], table:[0,1.1,.15], clue:[0,.03,-.35], untouched:[.48,.02,.7]} as const;
export const GEM_EVENTS = {plantStart:818,plantRest:833,mainPick:0,mainHeld:39,rubyPick:285,rubyHeld:313,passStart:340,engineerHeld:365};
export const TIMING = {hookEnd:137,discovery:212,expert:365,approval:392,payment:425,bagTake:478,departure:502,investigate:554,digStart:670,digEnd:727,london:740,plant:815,payoff:890} as const;
export const fieldHeight = (x: number, z: number) => .025 * Math.sin(x * .65) * Math.cos(z * .43);
export const PATCHES = [{id: 'main', x: 0, z: .5, r: .38}, {id: 'ruby', x: .74, z: -.55, r: .32}, {id: 'rear', x: -.65, z: -1.35, r: .4}];
export const SECONDARY_GEMS = [
  {id:'g3',kind:'diamond' as const,x:.18,z:.6}, {id:'g4',kind:'ruby' as const,x:.61,z:-.52},
  {id:'g5',kind:'diamond' as const,x:-.52,z:-1.24}, {id:'g6',kind:'ruby' as const,x:-.75,z:-1.4},
];
export const SHOTS: {a:number;b:number;beat:Beat;scene:Scene}[] = [
  {a:0,b:137,beat:'hook',scene:'field'}, {a:137,b:212,beat:'journey',scene:'field'},
  {a:212,b:276,beat:'diamond',scene:'field'}, {a:276,b:320,beat:'ruby',scene:'field'},
  {a:320,b:365,beat:'collect',scene:'field'}, {a:365,b:425,beat:'expert',scene:'field'},
  {a:425,b:502,beat:'payout',scene:'office'}, {a:502,b:554,beat:'cashout',scene:'office'},
  {a:554,b:670,beat:'investigate',scene:'field'}, {a:670,b:740,beat:'clue',scene:'field'},
  {a:740,b:815,beat:'london',scene:'london'}, {a:815,b:840,beat:'plant',scene:'field'},
  {a:840,b:890,beat:'empty',scene:'field'}, {a:890,b:952,beat:'payoff',scene:'office'},
];
export const shotAt = (f:number) => SHOTS.find(s => f>=s.a && f<s.b) || SHOTS[SHOTS.length-1];
export const sceneAt = (f:number) => shotAt(f).scene;
