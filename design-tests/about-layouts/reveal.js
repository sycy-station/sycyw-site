(function () {
  var els = document.querySelectorAll(".reveal-line, .reveal-item");
  if (!els.length) return;
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach(function (el) { io.observe(el); });
})();
