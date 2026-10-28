/**
 * Runs in <head> before the first paint, in both root layouts (app/(legacy) and app/(kin)), so the saved
 * theme never flashes and the splash is part of the first frame on a device that has not seen it.
 * Both layouts share this one string, so moving between old and new pages keeps the same theme and the
 * splash plays once per device, never again.
 */
export const BOOT_SCRIPT = `try{var q=new URLSearchParams(location.search).get("theme");if(q==="dark"||q==="light"||q==="system")localStorage.setItem("ak:theme",q);var m=localStorage.getItem("ak:theme")||"light";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";if(!localStorage.getItem("ak:splashed"))document.documentElement.dataset.splash="1"}catch(e){}`;
