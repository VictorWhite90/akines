// Inline this in <head> before any stylesheet is applied. It adds `js` to <html> so motion.css may hide
// elements that script will reveal, and `hero-ready` once the hero photograph has loaded (or after 4 s),
// so the hero entrance plays with the photo on screen. Without it nothing is ever hidden.
(function () {
  var d = document, h = d.documentElement;
  h.classList.add('js');
  var r = function () { h.classList.add('hero-ready'); };
  d.addEventListener('load', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('hero__img')) r(); }, true);
  d.addEventListener('error', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('hero__img')) r(); }, true);
  setTimeout(r, 4000);
})();
