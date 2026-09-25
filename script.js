/* XoX-style UTAU site — front-end (no dependencies) */
(function () {
  "use strict";

  /* faint red particle field (matches reference bg) */
  var dc = document.getElementById("dots");
  if (dc && dc.getContext) {
    var dx = dc.getContext("2d"), dots = [], DPR = Math.min(2, window.devicePixelRatio || 1);
    var acc = (getComputedStyle(document.body).getPropertyValue("--accent") || "#fb2c36").trim();
    var hx = acc.replace("#", ""); if (hx.length === 3) hx = hx.replace(/./g, "$&$&");
    var num = parseInt(hx, 16), RGB = [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
    function dsize() {
      dc.width = innerWidth * DPR; dc.height = innerHeight * DPR;
      dx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.round((innerWidth * innerHeight) / 26000);
      dots = [];
      for (var i = 0; i < n; i++) dots.push({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        r: Math.random() * 2 + 0.6, a: Math.random() * 0.5 + 0.12,
        vy: -(Math.random() * 0.25 + 0.05), tw: Math.random() * Math.PI * 2
      });
    }
    dsize(); addEventListener("resize", dsize);
    (function loop() {
      dx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i]; d.y += d.vy; d.tw += 0.02;
        if (d.y < -5) { d.y = innerHeight + 5; d.x = Math.random() * innerWidth; }
        var a = d.a * (0.6 + 0.4 * Math.sin(d.tw));
        dx.beginPath(); dx.arc(d.x, d.y, d.r, 0, 6.283);
        dx.fillStyle = "rgba(" + RGB + "," + a + ")"; dx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* loading overlay fade */
  window.addEventListener("load", function () {
    var l = document.getElementById("loader");
    if (l) setTimeout(function () { l.classList.add("done"); }, 900);
  });

  /* language toggle (KO / JP) on the terms page */
  var langBtns = document.querySelectorAll(".langbtn");
  if (langBtns.length) {
    langBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        document.body.classList.toggle("jp", b.getAttribute("data-lang") === "jp");
        langBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
        if (typeof runType === "function") runType();   // retype tagline in new language
      });
    });
  }

  /* clock */
  var c = document.getElementById("clock");
  function tick() {
    if (!c) return;
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    c.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick(); setInterval(tick, 1000);

  /* typewriter tagline (language-aware, restartable) */
  var tl = document.getElementById("type");
  var typeRun = 0;
  function runType() {
    if (!tl) return;
    var full = (document.body.classList.contains("jp")
      ? tl.getAttribute("data-jp") : tl.getAttribute("data-ko"))
      || tl.getAttribute("data-text") || "";
    var myRun = ++typeRun, i = 0;
    (function step() {
      if (myRun !== typeRun) return;            // a newer run cancels this one
      if (i <= full.length) {
        tl.innerHTML = full.slice(0, i) + '<span class="cur">▌</span>';
        i++;
        setTimeout(step, 90 + Math.random() * 60);
      } else {
        tl.innerHTML = full + '<span class="cur">▌</span>';
      }
    })();
  }
  runType();

  /* character costume swap (e.g. XoX bag on/off) */
  var swapFig = document.querySelector(".figure[data-a][data-b]");
  if (swapFig) {
    var swapImg = swapFig.querySelector("img.char");
    var swapBtn = swapFig.querySelector(".poseswap");
    var altOn = false;
    // preload the alternate so the swap is instant
    var pre = new Image(); pre.src = swapFig.getAttribute("data-b");
    function applyPose() {
      var src = swapFig.getAttribute(altOn ? "data-b" : "data-a");
      swapImg.src = src;
      swapFig.style.setProperty("--char", "url('" + src + "')");
      if (swapBtn) swapBtn.classList.toggle("alt", altOn);
    }
    function togglePose() { altOn = !altOn; applyPose(); }
    if (swapBtn) swapBtn.addEventListener("click", togglePose);
    swapImg.addEventListener("click", togglePose);
  }

  /* lazy-load youtube on first hover/click to keep it light */
  document.querySelectorAll(".tube[data-embed]").forEach(function (t) {
    function load() {
      if (t.dataset.loaded) return;
      t.dataset.loaded = "1";
      var f = document.createElement("iframe");
      f.src = t.getAttribute("data-embed");
      f.title = "YouTube video player";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.setAttribute("allowfullscreen", "");
      t.appendChild(f);
    }
    t.addEventListener("mouseenter", load, { once: true });
    t.addEventListener("click", load, { once: true });
    // also auto-load shortly after the loader clears
    setTimeout(load, 1600);
  });
})();
