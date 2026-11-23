const units=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
// Display-only formatting: the approved narration and its word timings stay untouched.
export function displayCaptionWord(word:string){
 return word.replace(/\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-(?:one|two|three|four|five|six|seven|eight|nine))?\b/gi,match=>{
  const parts=match.toLowerCase().split('-'),first=units.indexOf(parts[0]);
  return String(first>=0?first:tens.indexOf(parts[0])*10+(parts[1]?units.indexOf(parts[1]):0));
 });
}
