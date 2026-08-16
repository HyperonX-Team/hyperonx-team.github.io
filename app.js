"use strict";

(function () {
  var ORG = "HyperonX-Team";
  var ORG_URL = "https://github.com/" + ORG;
  var API_REPOS = "https://api.github.com/orgs/" + ORG + "/repos?per_page=100&sort=updated";
  var SITE_REPO = "hyperonx-team.github.io";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function timeAgo(iso) {
    if (!iso) return "\u2014";
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return Math.max(0, Math.floor(s)) + "s ago";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }

  function fmtInt(n) { return n == null ? "\u2014" : Intl.NumberFormat("en-US").format(n); }

  function cleanParagraphs(raw) {
    var s = raw
      .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "\n\n")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    var out = [];
    s.split(/\n{2,}/).forEach(function (p) {
      var clean = p
        .replace(/^\s{0,4}#+\s*/g, "")
        .replace(/[#>*_`~|]/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (clean.length < 18) return;
      out.push(clean);
    });
    return out;
  }

  function summarize(paras, max) {
    var joined = paras[0] || "";
    if (joined.length < 60 && paras[1]) joined += ". " + paras[1];
    if (joined.length > max) joined = joined.slice(0, max - 1) + "\u2026";
    return joined || null;
  }

  /* =====================================================================
     Nav: scroll progress, raised topbar, active section, mobile menu
     ===================================================================== */

  var progressBar = $(".progress__bar");
  var topbar = $("#topbar");
  var navToggle = $(".nav-toggle");
  var mobileMenu = $("#mobile-menu");
  var navLinks = $$(".topnav__link");
  var sectionIds = ["systems", "projects", "research", "opensource"];

  function openMenu(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
    if (open) setTimeout(function () {
      var first = $(".mobile-menu__link", mobileMenu);
      if (first) first.focus();
    }, 60);
  }

  navToggle.addEventListener("click", function () {
    openMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  $$(".mobile-menu__link").forEach(function (l) {
    l.addEventListener("click", function () { openMenu(false); });
  });

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    topbar.classList.toggle("is-raised", y > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      navLinks.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* =====================================================================
     Reveal on scroll
     ===================================================================== */

  var revealEls = $$(".reveal");
  if (revealEls.length) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-inview");
          revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* =====================================================================
     Hero canvas — a centralized hub that breaks apart and re-forms
     into a distributed mesh. Settled frame is drawn when reduced motion
     is requested (the page is fully meaningful without the animation).
     ===================================================================== */

  var HERO_METRICS = ["LATENCY", "ENERGY", "COST", "CONTROL", "WASTE"];
  var canvas = document.getElementById("hero-canvas");
  var viz = null;

  function HeroViz(cv) {
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, DPR = 1;
    var N = 46, HUB = Math.floor(46 / 2);
    var nodes = [];
    var raf = 0, visible = false, startedAt = 0;
    var cursorX = 0.5, cursorY = 0.5;
    var DUR = 8500;
    var lastTick = 0, frameGap = 30;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function layout() {
      for (var i = 0; i < N; i++) {
        var angle = (i / N) * Math.PI * 2;
        var radius = rand(0.14, 0.5) * Math.min(W, H);
        nodes[i] = {
          cx: W * 0.5 + Math.cos(angle) * radius,
          cy: H * 0.5 + Math.sin(angle) * radius * 0.9,
          x: W * 0.5, y: H * 0.5,
          phase: rand(0, Math.PI * 2),
          amp: rand(0.7, 1.6)
        };
      }
      nodes[HUB].cx = W * 0.38;
      nodes[HUB].cy = H * 0.5;
      nodes.forEach(function (n) { n.x = n.cx; n.y = n.cy; });
      buildPairs();
    }

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth || 1;
      H = cv.clientHeight || 1;
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      layout();
      if (REDUCED) drawFrame(1, 1, 0);
    }

    function easeIO(x) { return 1 - Math.pow(1 - x, 3); }

    function targetFor(phase, i, tick) {
      var n = nodes[i];
      if (phase < 0.34) return { x: n.cx, y: n.cy };
      if (phase < 0.62) {
        var k = easeIO((phase - 0.34) / 0.28);
        var away = 1 + k * 1.8;
        var shake = k * 30;
        return {
          x: W * 0.5 + (n.cx - W * 0.5) * away + Math.sin(n.phase + tick * 0.05) * shake,
          y: H * 0.5 + (n.cy - H * 0.5) * away + Math.cos(n.phase + tick * 0.042) * shake
        };
      }
      var k2 = easeIO(Math.min(1, (phase - 0.62) / 0.38));
      var cols = 6;
      var gx = (i % cols) / (cols - 1);
      var gy = Math.floor(i / cols) / (Math.ceil(N / cols) - 1);
      var tx = W * 0.12 + gx * (W * 0.6);
      var ty = H * 0.16 + gy * (H * 0.56);
      var ambient = phase >= 1 ? Math.sin(tick * 0.0004 + n.phase) * n.amp * 3 : 0;
      return {
        x: n.cx + (tx - n.cx) * k2 + ambient,
        y: n.cy + (ty - n.cy) * k2 + Math.cos(tick * 0.0003 + n.phase) * n.amp * 2
      };
    }

    function linkAlpha(a, b) {
      var center = Math.min(W, H) * 0.5;
      return Math.max(0, 1 - Math.hypot(a.x - b.x, a.y - b.y) / (center * 1.5));
    }

    var pairs = [];
    function buildPairs() {
      pairs.length = 0;
      for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) pairs.push([i, j]);
      }
    }

    function drawFrame(phase, settle, tick) {
      ctx.clearRect(0, 0, W, H);

      var mby = H * 0.16;
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.textBaseline = "middle";
      for (var m = 0; m < HERO_METRICS.length; m++) {
        var yy = mby + m * 22;
        var flutter = phase >= 1 ? Math.sin(tick * 0.0009 + m * 1.7) * 0.014 : 0;
        var level = Math.max(0.06, 1 - settle * (0.5 + m * 0.07) + flutter * m);
        ctx.fillStyle = "rgba(155,160,163,0.55)";
        ctx.fillText(HERO_METRICS[m], W * 0.8, yy);
        ctx.fillStyle = "rgba(90,94,90,0.35)";
        ctx.fillRect(W * 0.8 + 92, yy - 3, 52, 6);
        ctx.fillStyle = m === 0 ? "rgba(255,197,61,0.92)" : "rgba(233,233,230," + (0.5 + 0.25 * (1 - m / 5)).toFixed(3) + ")";
        ctx.fillRect(W * 0.8 + 92, yy - 3, 52 * level, 6);
      }

      ctx.lineWidth = phase < 0.34 ? 0.8 : 0.5;
      for (var p = 0; p < pairs.length; p++) {
        var i = pairs[p][0]; var j = pairs[p][1];
        var a = nodes[i]; var b = nodes[j];
        var dx = a.x - b.x; var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        var farCut = (Math.min(W, H) * 0.62) * (phase < 0.34 ? 0.5 : 1);
        if (d2 > farCut * farCut) continue;
        var base;
        if (phase < 0.34) base = linkAlpha(a, b) * 0.42;
        else if (phase < 0.62) base = 0.05;
        else base = 0.05 + 0.3 * linkAlpha(a, b) * (Math.max(0, 1 - phase) + 0.5);
        if (base < 0.02) continue;
        var hubLink = i === HUB || j === HUB;
        if (phase < 0.34) {
          ctx.strokeStyle = "rgba(233,233,230," + base.toFixed(3) + ")";
        } else {
          ctx.strokeStyle = "rgba(255,197,61," + (base * (hubLink ? 1 : 0.55)).toFixed(3) + ")";
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (var k = 0; k < N; k++) {
        var n = nodes[k];
        var t = targetFor(phase, k, tick);
        n.x += (t.x - n.x) * 0.055;
        n.y += (t.y - n.y) * 0.055;
        var isHub = k === HUB;
        var r = isHub ? 5 + (phase < 0.34 ? 1 : -Math.min(1, (phase - 0.34) * 3) * 3) : 2;
        var px = n.x + (cursorX - 0.5) * 12;
        var py = n.y + (cursorY - 0.5) * 8;
        ctx.fillStyle = phase < 0.34
          ? (isHub ? "#FFC53D" : "rgba(233,233,230,0.72)")
          : (isHub && phase < 0.62 ? "rgba(255,90,78,0.85)" : "rgba(233,233,230,0.6)");
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }

      var stage = phase < 0.34 ? "PHASE 1 \u00B7 CENTRALIZED"
        : phase < 0.62 ? "PHASE 2 \u00B7 FRAGMENTING"
        : "PHASE 3 \u00B7 DISTRIBUTED";
      ctx.fillStyle = "rgba(111,115,119,0.9)";
      ctx.fillText(stage + "  [" + Math.round(phase * 100) + "%]", 16, H - 22);
    }

    var phase = 0;
    var settle = 0;

    function frame(tick) {
      if (!visible) return;
      if (tick - lastTick < frameGap) { raf = requestAnimationFrame(frame); return; }
      lastTick = tick;
      var elapsed = startedAt ? tick - startedAt : 0;
      phase = Math.min(1, elapsed / DUR);
      settle = Math.min(1, elapsed / (DUR * 0.85));
      drawFrame(phase, settle, tick);
      if (phase >= 1) frameGap = 48;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      visible = true;
      if (REDUCED) return;
      cancelAnimationFrame(raf);
      startedAt = null;
      frameGap = 30;
      raf = requestAnimationFrame(function (t) { startedAt = t; frame(t); });
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(raf);
    }

    cv.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect();
      cursorX = (e.clientX - r.left) / r.width;
      cursorY = (e.clientY - r.top) / r.height;
    }, { passive: true });

    window.addEventListener("resize", resize, { passive: true });
    resize();
    if (REDUCED) drawFrame(1, 1, 0);
    return { start: start, stop: stop };
  }

  if (canvas) {
    viz = HeroViz(canvas);
    if (!REDUCED && viz) {
      function startWhenIdle() {
        var idleFn = window.requestIdleCallback || function (cb) { setTimeout(cb, 400); };
        idleFn(function () { viz.start(); });
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (en.target.dataset.booting !== "1") { en.target.dataset.booting = "1"; startWhenIdle(); }
          } else {
            viz.stop();
          }
        });
      }, { threshold: 0.05 });
      io.observe(canvas);
    }
  }

  /* =====================================================================
     GitHub integration — live repository index.
     One API call per load (repo list); READMEs come from
     raw.githubusercontent.com which is not rate-limited.
     ===================================================================== */

  var state = { repos: [], ok: null, fetchedAt: null };

  var grid = $("#projects-grid");
  var fallbackNode = $("#projects-fallback");
  var indexDot = $("#index-dot");
  var indexLine = $("#index-line");
  var indexSync = $("#index-sync");

  function setStatus(kind, text) {
    indexDot.className = "dot dot--" + kind;
    indexLine.textContent = text;
  }

  function score(r) {
    var days = (Date.now() - new Date(r.pushed).getTime()) / 864e5;
    return r.stars * 6 + Math.max(0, 30 - days) + (r.desc.length > 30 ? 6 : 0) + (r.lang ? 2 : 0);
  }

  function normalize(list) {
    return list
      .filter(function (r) {
        return !r.fork && r.name !== SITE_REPO && r.size > 0 && (r.description || r.language);
      })
      .map(function (r) {
        return {
          name: r.name,
          url: r.html_url,
          desc: r.description || "(no description provided)",
          lang: r.language || null,
          stars: r.stargazers_count,
          forks: r.forks_count,
          issues: r.open_issues_count,
          pushed: r.pushed_at,
          license: r.license && r.license.spdx_id ? r.license.spdx_id : null,
          branch: r.default_branch || "HEAD",
          readmeSummary: null,
          readmeFull: null,
          hasReadme: false
        };
      })
      .sort(function (a, b) { return score(b) - score(a); });
  }

  function classify(r) {
    var hay = ((r.desc || "") + " " + (r.readmeSummary || "") + " " + (r.readmeFull || "")).toUpperCase();
    var rules = [
      ["COMMUNICATIONS", /LTE|5G|NETWORK|CARRIER|RADIO|SDR|WIRELESS|FREQUENCY|CELLULAR|ANTENNA|SPECTRUM|COMMUNICAT/, "OPEN INFRASTRUCTURE"],
      ["BIOTECH / HEALTH", /HEALTH|MEDICAL|BIOMARKER|DIAGNOS|CLINICAL|PHYSIOLOG|PATIENT|BIO-SENSOR/, "INSTRUMENTATION"],
      ["HARDWARE", /ESP32|SENSOR|HARDWARE|FIRMWARE|PCB|EMBEDDED|MICROCONTROLLER|GPIO|I2C|UART/, "SENSING"],
      ["COMPUTE", /LANGUAGE MODEL|LLM|PODEM|MODEL|MEMORY|TRANSFORMER|TOKEN|ATTENTION|INFERENCE|NEURAL|SIMULAT/, "SIMULATION"]
    ];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][1].test(hay)) return { primary: rules[i][0], tag: rules[i][2] };
    }
    return { primary: "RESEARCH", tag: "OPEN" };
  }

  var KEYWORDS = {
    "COMMUNICATIONS": ["LTE", "5G", "RADIO", "SDR", "NETWORK", "CARRIER", "WIRELESS", "SPECTRUM"],
    "BIOTECH / HEALTH": ["HEALTH", "BIOMARKER", "MEDICAL", "SENSING", "BIO"],
    "HARDWARE": ["ESP32", "HARDWARE", "FIRMWARE", "EMBEDDED", "SENSOR"],
    "COMPUTE": ["LLM", "MODEL", "MEMORY", "INFERENCE", "SIMULATION", "PODEM"]
  };

  function buildTags(r, cls) {
    var hay = ((r.desc || "") + " " + (r.readmeSummary || "")).toUpperCase();
    var tags = [];
    (KEYWORDS[cls.primary] || []).forEach(function (k) {
      if (tags.length < 3 && hay.indexOf(k) !== -1) tags.push(k);
    });
    if (r.lang) tags.push(r.lang.toUpperCase());
    if (r.license && tags.length < 4) tags.push(r.license.toUpperCase());
    return tags.slice(0, 4);
  }

  function fetchReadme(r) {
    return fetch("https://raw.githubusercontent.com/" + ORG + "/" + r.name + "/" + r.branch + "/README.md")
      .then(function (res) { return res.ok ? res.text() : null; })
      .then(function (text) {
        if (!text) return;
        var paras = cleanParagraphs(text);
        r.readmeSummary = summarize(paras, 240);
        var full = paras.slice(0, 3).join(" ");
        r.readmeFull = full.length > 700 ? full.slice(0, 699) + "\u2026" : full || null;
        r.hasReadme = true;
        if (r.readmeFull === r.readmeSummary) r.readmeFull = null;
      })
      .catch(function () {});
  }

  /* =====================================================================
     Project grid — render verified GitHub data into R&D artifact cards
     ===================================================================== */

  var THESIS = {
    "COMMUNICATIONS": "Hypothesis to test against: a community-owned, local radio mesh removes both the tower rent and the per-subscriber tax of a centralized carrier. The 10\u00D7 target is cost and control, not peak throughput.",
    "BIOTECH / HEALTH": "Hypothesis to test against: personal medical sensing belongs in the home, owned by the patient. Removing the clinic-and-cloud middlemen targets access, latency, and data ownership in one move.",
    "HARDWARE": "Hypothesis to test against: commodity sensing hardware plus open firmware can replace closed, proprietary instruments. The 10\u00D7 target is cost per sensor and the right to repair.",
    "COMPUTE": "Hypothesis to test against: inference and data architecture do not need to be centralized or black-boxed. The 10\u00D7 target is efficiency and control over the model itself.",
    "RESEARCH": "Hypothesis to test against: the current architecture of this system is more expensive and more fragile than it has to be. The experiment will say where the inefficiency actually lives."
  };

  function setCardText(el, sel, text) { el.querySelector(sel).textContent = text; }

  function renderGrid() {
    if (fallbackNode && fallbackNode.parentNode) fallbackNode.parentNode.removeChild(fallbackNode);
    var tpl = $("#project-card");
    if (!tpl) { renderError("Template missing"); return; }
    var frag = document.createDocumentFragment();

    state.repos.forEach(function (r, i) {
      var el = tpl.content.firstElementChild.cloneNode(true);
      el.classList.remove("project--tpl");
      el.classList.add(i === 0 ? "project--featured" : "project--std");
      el.classList.add("reveal");
      el.style.setProperty("--stagger", String(Math.min(i, 6)));
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Open project details for " + r.name);

      var cls = classify(r);
      setCardText(el, ".project__category", cls.primary + " / " + cls.tag);
      setCardText(el, ".project__name", r.name);
      setCardText(el, ".project__summary", r.readmeSummary || r.desc);
      setCardText(el, ".project__lang", r.lang || "UNKNOWN");
      setCardText(el, ".project__stars", "\u2605 " + (r.stars > 0 ? fmtInt(r.stars) : "0"));
      setCardText(el, ".project__updated", "UPD " + timeAgo(r.pushed).toUpperCase());

      var ul = el.querySelector(".taglist");
      ul.setAttribute("aria-label", "Technologies");
      buildTags(r, cls).forEach(function (t) {
        var li = document.createElement("li");
        li.className = "taglist__tag" + (r.lang && t === r.lang.toUpperCase() ? " taglist__tag--accent" : "");
        li.textContent = t;
        ul.appendChild(li);
      });

      var open = el.querySelector(".project__open");
      open.href = r.url;
      open.addEventListener("click", function (e) { e.stopPropagation(); });

      el.addEventListener("click", function () { openDetail(r, el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(r, el); }
      });

      frag.appendChild(el);
    });

    grid.appendChild(frag);
    grid.setAttribute("aria-busy", "false");

    phaseStagger();
  }

  function phaseStagger() {
    var els = $$("#projects-grid .reveal");
    if (REDUCED) {
      els.forEach(function (el) { el.classList.add("is-inview"); });
      return;
    }
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-inview");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function renderError(msg) {
    grid.setAttribute("aria-busy", "false");
    var div = document.createElement("p");
    div.className = "grid-error";
    div.textContent = msg;
    grid.appendChild(div);
  }

  /* =====================================================================
     Detail panel (modal) — verified data separated from thesis
     ===================================================================== */

  var modal = $("#modal");
  var lastFocus = null;

  var SOURCE_LABEL = {
    summary: $("#modal-summary"),
    source: $("#modal-source"),
    readme: $("#modal-readme"),
    title: $("#modal-title"),
    category: $("#modal-category"),
    stars: $("#modal-stars"),
    language: $("#modal-language"),
    license: $("#modal-license"),
    pushed: $("#modal-pushed"),
    forks: $("#modal-forks"),
    issues: $("#modal-issues"),
    tags: $("#modal-tags"),
    thesis: $("#modal-thesis"),
    link: $("#modal-link")
  };

  function openDetail(r, trigger) {
    lastFocus = trigger;
    var cls = classify(r);

    SOURCE_LABEL.title.textContent = r.name;
    SOURCE_LABEL.category.textContent = cls.primary + " / " + cls.tag;
    SOURCE_LABEL.source.textContent = r.hasReadme
      ? "SUMMARY: README \u00B7 VERIFIED FROM REPOSITORY"
      : "SUMMARY: GITHUB DESCRIPTION \u00B7 VERIFIED FROM REPOSITORY";
    SOURCE_LABEL.summary.textContent = r.readmeSummary || r.desc;
    SOURCE_LABEL.readme.textContent = r.readmeFull || (r.hasReadme
      ? "README contains no prose summary beyond the repository description."
      : "No README summary available for this repository.");
    SOURCE_LABEL.stars.textContent = fmtInt(r.stars);
    SOURCE_LABEL.language.textContent = r.lang || "—";
    SOURCE_LABEL.license.textContent = r.license || "Not specified";
    SOURCE_LABEL.pushed.textContent = timeAgo(r.pushed);
    SOURCE_LABEL.forks.textContent = fmtInt(r.forks);
    SOURCE_LABEL.issues.textContent = fmtInt(r.issues);
    SOURCE_LABEL.thesis.textContent = THESIS[cls.primary] || THESIS.RESEARCH;
    SOURCE_LABEL.link.href = r.url;

    SOURCE_LABEL.tags.innerHTML = "";
    buildTags(r, cls).forEach(function (t) {
      var li = document.createElement("li");
      li.className = "taglist__tag";
      li.textContent = t;
      SOURCE_LABEL.tags.appendChild(li);
    });

    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  $$("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var focusables = $$("button, a, [tabindex]:not([tabindex='-1'])", modal).filter(function (n) {
        return !n.disabled && n.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* =====================================================================
     Open-source statistics (real values only)
     ===================================================================== */

  function buildOSStats() {
    var langs = new Set();
    var cats = new Set();
    state.repos.forEach(function (r) {
      if (r.lang) langs.add(r.lang);
      cats.add(classify(r).primary);
    });

    var countEl = $("[data-count]");
    var languagesEl = $("#os-languages");
    var categoriesEl = $("#os-categories");
    var activityEl = $("#os-activity");
    var latest = state.repos.reduce(function (a, r) { return !a || r.pushed > a ? r.pushed : a; }, null);

    languagesEl.textContent = fmtInt(langs.size);
    categoriesEl.textContent = fmtInt(cats.size);
    activityEl.textContent = latest ? timeAgo(latest).toUpperCase() : "—";

    if (countEl && !REDUCED && countEl.dataset.counted !== "1") {
      countEl.dataset.counted = "1";
      var target = state.repos.length;
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 700);
        countEl.textContent = String(Math.round(p * target));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else if (countEl) {
      countEl.textContent = String(state.repos.length);
    }
  }

  /* =====================================================================
     Boot — fetch once, cache in memory, never let failure break the page
     ===================================================================== */

  function onOrgFail() {
    setStatus("down", "REPOSITORY INDEX OFFLINE");
    indexSync.textContent = "LAST SYNC \u2014";
    grid.setAttribute("aria-busy", "false");
  }

  function loadOrg() {
    setStatus("pending", "SYNCING PUBLIC REPOSITORY INDEX\u2026");
    fetch(API_REPOS, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error("Bad payload");
        state.repos = normalize(list);
        state.fetchedAt = Date.now();
        var curated = state.repos.slice(0, 6);
        return Promise.all(curated.map(fetchReadme)).then(function () {
          renderGrid();
          buildOSStats();
        });
      })
      .then(function () {
        setStatus("ok", state.repos.length + " PUBLIC SYSTEMS INDEXED");
        indexSync.textContent = "LAST SYNC 0S AGO";
        setInterval(function () {
          if (!state.fetchedAt) return;
          var s = Math.floor((Date.now() - state.fetchedAt) / 1000);
          indexSync.textContent = "LAST SYNC " + s + "S AGO";
        }, 1000);
      })
      .catch(onOrgFail);
  }

  /* =====================================================================
     Broken → Rebuilt — data-driven transformation registry
     ===================================================================== */

  var TRANSFORMATIONS = [
    {
      id: "telecom",
      title: "Telecom access",
      before: {
        nodes: [
          { id: "tower", x: 320, y: 40, label: "TOWER" },
          { id: "carrier", x: 320, y: 110, label: "CARRIER" },
          { id: "sim", x: 320, y: 180, label: "SIM" },
          { id: "user", x: 320, y: 240, label: "USER" }
        ],
        edges: [["tower", "carrier"], ["carrier", "sim"], ["sim", "user"]]
      },
      after: {
        nodes: [
          { id: "n1", x: 90, y: 60, label: "NODE" },
          { id: "n2", x: 230, y: 40, label: "NODE" },
          { id: "n3", x: 370, y: 70, label: "NODE" },
          { id: "n4", x: 90, y: 170, label: "NODE" },
          { id: "n5", x: 230, y: 195, label: "NODE" },
          { id: "n6", x: 370, y: 175, label: "NODE" },
          { id: "u1", x: 150, y: 230, label: "USER" },
          { id: "u2", x: 300, y: 228, label: "USER" }
        ],
        edges: [
          ["n1", "n2"], ["n2", "n3"], ["n1", "n4"], ["n2", "n5"],
          ["n3", "n6"], ["n4", "n5"], ["n5", "n6"], ["n4", "u1"], ["n5", "u2"], ["n6", "u2"]
        ]
      }
    }
  ];

  function buildTransformSVG(svg, topo, accent) {
    var NS = "http://www.w3.org/2000/svg";
    var i;
    var nodeMap = {};
    topo.nodes.forEach(function (n) { nodeMap[n.id] = n; });

    topo.edges.forEach(function (e) {
      var a = nodeMap[e[0]], b = nodeMap[e[1]];
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      line.setAttribute("class", accent ? "link link--accent" : "link");
      svg.appendChild(line);
    });

    topo.nodes.forEach(function (n) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", accent ? "node node--accent" : "node");
      var rect = document.createElementNS(NS, "rect");
      var size = n.label === "USER" ? 7 : 9;
      rect.setAttribute("x", n.x - size / 2); rect.setAttribute("y", n.y - size / 2);
      rect.setAttribute("width", size); rect.setAttribute("height", size);
      g.appendChild(rect);
      var text = document.createElementNS(NS, "text");
      text.setAttribute("x", n.x + 14); text.setAttribute("y", n.y + 3);
      text.textContent = n.label;
      g.appendChild(text);
      svg.appendChild(g);
    });
  }

  var slider = $("#rebuilt-slider");
  var readout = $("#rebuilt-readout");
  var poleB = $("#pole-before");
  var poleA = $("#pole-after");
  var svgZoneB = $(".rebuilt__zone--before");
  var svgZoneA = $(".rebuilt__zone--after");
  var storyB = $(".rebuilt__story[data-state='before']");
  var storyA = $(".rebuilt__story[data-state='after']");
  var progressLine = null;

  function rebuild() {
    var v = parseInt(slider.value, 10) / 100;
    slider.style.setProperty("--p", (v * 100) + "%");
    readout.textContent = "REBUILD " + String(Math.round(v * 100)).padStart(3, "0") + "%";
    slider.setAttribute("aria-valuetext", Math.round(v * 100) + " percent rebuilt");
    poleB.classList.toggle("is-live", v < 0.5);
    poleA.classList.toggle("is-live", v >= 0.5);
    svgZoneB.style.opacity = String(1 - v * 0.92);
    svgZoneA.style.opacity = String(0.22 + v * 0.78);
    if (v >= 0.5) { storyA.hidden = false; storyB.hidden = true; }
    else { storyA.hidden = true; storyB.hidden = false; }
    if (progressLine) {
      progressLine.style.strokeDashoffset = String(340 * (1 - v));
    }
  }

  if (slider) {
    var active = TRANSFORMATIONS[0];
    var beforeSvg = $("#rebuilt-svg");
    var afterSvg = $("#rebuilt-svg-after");
    buildTransformSVG(beforeSvg, active.before, false);
    buildTransformSVG(afterSvg, active.after, true);

    var NS = "http://www.w3.org/2000/svg";
    progressLine = document.createElementNS(NS, "line");
    progressLine.setAttribute("x1", 40); progressLine.setAttribute("y1", 130);
    progressLine.setAttribute("x2", 600); progressLine.setAttribute("y2", 130);
    progressLine.setAttribute("stroke", "#FFC53D");
    progressLine.setAttribute("stroke-width", "1.5");
    progressLine.setAttribute("stroke-dasharray", "340");
    progressLine.setAttribute("stroke-dashoffset", "340");
    progressLine.setAttribute("class", "link--accent");
    afterSvg.appendChild(progressLine);

    svgZoneA.style.opacity = "0.22";
    svgZoneB.style.opacity = "1";
    slider.addEventListener("input", rebuild);
    rebuild();
  }

  loadOrg();
})();

