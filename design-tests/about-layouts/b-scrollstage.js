(function () {
  var screens = document.querySelectorAll(".bs-screen");
  var dots = document.querySelectorAll(".bs-dot");
  if (!screens.length || !dots.length) return;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        dots.forEach(function (dot) {
          dot.classList.toggle("is-current", dot.getAttribute("href") === "#" + id);
        });
      });
    },
    { threshold: 0.5 }
  );
  screens.forEach(function (s) { io.observe(s); });
})();
