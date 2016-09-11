export function updateTimeouts(obj, mult) {
  //update timeout for api suits
  mult = mult||1;
  obj.slow(2000*mult);
  obj.timeout(5000*mult);
}
