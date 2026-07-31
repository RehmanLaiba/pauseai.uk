(function () {
  var tip = document.createElement("div");
  tip.className = "fn-tooltip";
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);

  var hideTimer;

  function reposition(sup) {
    var supRect = sup.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var scrollY = window.scrollY;
    var scrollX = window.scrollX;

    var left = supRect.left + supRect.width / 2 - tipRect.width / 2 + scrollX;
    var top = supRect.top - tipRect.height - 10 + scrollY;

    if (supRect.top < tipRect.height + 20) {
      top = supRect.bottom + 8 + scrollY;
    }

    var maxLeft = window.innerWidth - tipRect.width - 12 + scrollX;
    left = Math.max(12 + scrollX, Math.min(left, maxLeft));

    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function show(sup) {
    clearTimeout(hideTimer);
    var n = sup.textContent.trim();
    var fn = document.getElementById("fn" + n);
    if (!fn) return;
    tip.innerHTML = fn.innerHTML;
    tip.classList.add("fn-tooltip--visible");
    reposition(sup);
  }

  function hide() {
    hideTimer = setTimeout(function () {
      tip.classList.remove("fn-tooltip--visible");
    }, 150);
  }

  document.querySelectorAll("sup").forEach(function (sup) {
    var n = sup.textContent.trim();
    if (!document.getElementById("fn" + n)) return;
    sup.classList.add("fn-ref");
    sup.addEventListener("mouseenter", function () { show(sup); });
    sup.addEventListener("mouseleave", hide);
  });

  tip.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  tip.addEventListener("mouseleave", hide);
})();
