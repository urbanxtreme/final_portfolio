/* The Issue. Sreehari S portfolio.
   No dependencies. Everything here is progressive: the page reads fully without it. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var two = function (n) { return n < 10 ? '0' + n : String(n); };

  /* Contents menu */
  var toggle = $('#navToggle');
  var menu = $('#menu');
  var label = $('#navLabel');
  var inertTargets = [$('#main'), $('#contact')];
  function setMenu(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Contents';
    root.style.overflow = open ? 'hidden' : '';
    inertTargets.forEach(function (el) { if (el) el.inert = open; });
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });

  /* Folio in the pill and the current item in the menu follow the scroll position */
  var sections = $$('[data-folio]');
  var folio = $('#folio');
  var spyLinks = $$('[data-spy]');
  var seen = {};
  function updateFolio() {
    var current = null;
    sections.forEach(function (el, i) { if (seen[i]) current = el; });
    if (!current) return;
    folio.textContent = current.getAttribute('data-folio');
    var host = current.closest('section[id], footer[id]');
    var id = host ? host.id : current.id;
    spyLinks.forEach(function (a) {
      if (a.getAttribute('data-spy').split(' ').indexOf(id) > -1) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    var folioObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[sections.indexOf(e.target)] = e.isIntersecting; });
      updateFolio();
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (el) { folioObserver.observe(el); });
  }

  /* Scroll reveals: each block rises once */
  var risers = $$('.rv');
  if ('IntersectionObserver' in window) {
    var riseObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); riseObserver.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    risers.forEach(function (el) { riseObserver.observe(el); });
  } else {
    risers.forEach(function (el) { el.classList.add('in'); });
  }

  /* Contents index: a plate follows the pointer */
  var index = $('#index');
  var plate = $('#plate');
  if (index && plate && window.matchMedia('(hover: hover)').matches) {
    var plateImg = $('#plateImg');
    var plateLabel = $('#plateLabel');
    var frame = 0, px = 0, py = 0, shown = '', preloaded = false;
    index.addEventListener('pointerenter', function () {
      if (preloaded) return;
      preloaded = true;
      $$('.row', index).forEach(function (r) { new Image().src = r.getAttribute('data-plate'); });
    });
    index.addEventListener('pointermove', function (e) {
      var row = e.target.closest('.row');
      if (!row) { plate.classList.remove('on'); return; }
      var r = index.getBoundingClientRect();
      px = Math.max(0, Math.min(e.clientX - r.left + 24, r.width - 200));
      py = Math.max(0, e.clientY - r.top - 64);
      var src = row.getAttribute('data-plate');
      if (shown !== src) {
        shown = src;
        plateImg.src = src;
        plateLabel.textContent = 'Feature ' + row.getAttribute('data-no') + ', ' + row.getAttribute('data-title');
      }
      plate.classList.add('on');
      if (!frame) {
        frame = requestAnimationFrame(function () {
          frame = 0;
          plate.style.transform = 'translate(' + px + 'px,' + py + 'px)';
        });
      }
    });
    index.addEventListener('pointerleave', function () { plate.classList.remove('on'); });
  }

  /* Tagline: each word lights up once as it crosses the trigger line */
  var tagline = $('#taglineText');
  if (tagline) {
    var words = [];
    $$('.line', tagline).forEach(function (line) {
      var parts = line.textContent.split(' ');
      line.textContent = '';
      parts.forEach(function (word, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = word;
        s.style.transitionDelay = Math.min(words.length * 45, 400) + 'ms';
        line.appendChild(s);
        if (i < parts.length - 1) line.appendChild(document.createTextNode(' '));
        words.push(s);
      });
    });
    if (reduce || !('IntersectionObserver' in window)) {
      words.forEach(function (w) { w.classList.add('lit'); });
    } else {
      var lighter = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add('lit');
            lighter.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -35% 0px' });
      words.forEach(function (w) { lighter.observe(w); });
    }
  }

  /* Story mode: choose your path. Every stop and fact comes from this page. */
  var pathApp = $('#pathApp');
  if (pathApp) {
    var stage = $('#pathStage');
    var stepLabel = $('#pathStep');
    var backBtn = $('#pathBack');
    var ROLES = [
      { id: 'hiring', title: 'I am hiring', note: 'Recruiter or hiring manager', subject: 'Hello Sreehari, I am hiring', stops: [
        { t: 'Recognition', h: '#recognition', d: 'NASA Space Apps global nominee and ARCANE third prize.' },
        { t: 'The masthead', h: '#roles', d: 'Eight roles, including a frontend internship at Logixmotion from Nov 2024 to Aug 2026.' },
        { t: 'Fortis Fortuna Adiuvat', h: '#f-fortis', d: 'The NASA Space Apps entry, with its code.' },
        { t: 'Hybrid Vision Hub', h: '#f-hybrid', d: 'The ARCANE third prize project.' },
        { t: 'The resume', h: 'assets/resume.pdf', d: 'The full list as a PDF.', dl: true }] },
      { id: 'build', title: 'I want to build something together', note: 'Collaborator', subject: 'Hello Sreehari, let us build something', stops: [
        { t: 'SigNet', h: '#f-signet', d: 'Software for sign language communication.' },
        { t: 'Kavach', h: '#f-kavach', d: 'Emergency reporting for accidents and disasters.' },
        { t: 'Health Vigilance Hub', h: '#f-hvh', d: 'Disease outbreak prediction and healthcare assistance.' },
        { t: 'Fortis Fortuna Adiuvat', h: '#f-fortis', d: 'A WebGL solar system and deep zoom NASA imagery.' },
        { t: 'Contact', h: '#contact', d: 'Tell me what you are building.' }] },
      { id: 'community', title: 'I run a community or an event', note: 'Organizer or club lead', subject: 'Hello Sreehari, about a community or event', stops: [
        { t: 'The masthead', h: '#roles', d: 'Founder of Hack404, plus roles in IEEE RAS, IEDC, FOSS, TinkerHub and ISTE.' },
        { t: 'The editor’s letter', h: '#about', d: 'How I describe my work as an organizer.' },
        { t: 'Questions', h: '#faq', d: 'Short answers, including what Hack404 is.' },
        { t: 'Off the clock', h: '#music', d: 'Layam Music Club, and a beat maker to play.' },
        { t: 'Contact', h: '#contact', d: 'Tell me about your community.' }] },
      { id: 'curious', title: 'I am just curious', note: 'Visitor', subject: 'Hello Sreehari', stops: [
        { t: 'The editor’s letter', h: '#about', d: 'Five ways to describe one person.' },
        { t: 'Fortis Fortuna Adiuvat', h: '#f-fortis', d: 'The most visual project, a solar system you can explore.' },
        { t: 'Off the clock', h: '#music', d: 'Make a beat in the beat maker.' },
        { t: 'JWST Multimedia Application', h: '#f-sirius', d: 'James Webb discoveries for the public.' },
        { t: 'Contact', h: '#contact', d: 'Say hello.' }] }
    ];
    var TIMES = [
      { id: 1, title: 'A glance', note: 'One stop' },
      { id: 3, title: 'A coffee', note: 'Three stops' },
      { id: 5, title: 'All of it', note: 'Five stops' }
    ];
    var choice = { role: null, time: null };
    var arrowSvg = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
    var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

    var clearMarks = function () { $$('.row.on-path').forEach(function (r) { r.classList.remove('on-path'); }); };
    var setStage = function (heading, node, focus) {
      stage.textContent = '';
      var h = el('h3', 'path-q heading-4', heading);
      h.tabIndex = -1;
      stage.appendChild(h);
      stage.appendChild(node);
      stage.style.animation = 'none';
      void stage.offsetWidth;
      stage.style.animation = '';
      if (focus) h.focus({ preventScroll: true });
    };
    var optionList = function (items, onPick) {
      var ol = el('ol', 'rows');
      items.forEach(function (it, i) {
        var li = el('li');
        var b = el('button', 'opt');
        b.type = 'button';
        b.appendChild(el('span', 'n mono', two(i + 1)));
        b.appendChild(el('span', 'title-2', it.title));
        b.appendChild(el('span', 'd body-6', it.note));
        b.addEventListener('click', function () { onPick(it); });
        li.appendChild(b);
        ol.appendChild(li);
      });
      return ol;
    };
    var showRole = function (focus) {
      choice.role = null; choice.time = null; clearMarks();
      stepLabel.textContent = 'Question 1 of 2';
      backBtn.hidden = true;
      setStage('Who is reading?', optionList(ROLES, function (r) { choice.role = r; showTime(true); }), focus);
    };
    var showTime = function (focus) {
      choice.time = null; clearMarks();
      stepLabel.textContent = 'Question 2 of 2';
      backBtn.hidden = false;
      setStage('How much time do you have?', optionList(TIMES, function (t) { choice.time = t; showResult(true); }), focus);
    };
    var showResult = function (focus) {
      clearMarks();
      stepLabel.textContent = 'Your path';
      backBtn.hidden = false;
      var wrap = el('div');
      wrap.style.display = 'grid';
      wrap.style.gap = 'var(--sp-200)';
      wrap.appendChild(el('p', 'body-3 muted', choice.role.note + ', ' + choice.time.note.toLowerCase() + '.'));
      var ol = el('ol', 'rows');
      choice.role.stops.slice(0, choice.time.id).forEach(function (s, i) {
        var li = el('li', 'led');
        li.style.setProperty('--i', i);
        li.appendChild(el('span', 'mono', two(i + 1)));
        var a = el('a', 'title-2', s.t);
        a.href = s.h;
        if (s.dl) a.setAttribute('download', '');
        li.appendChild(a);
        li.appendChild(el('p', 'body-6 muted', s.d));
        ol.appendChild(li);
        var row = $('.row[href="' + s.h + '"]');
        if (row) row.classList.add('on-path');
      });
      wrap.appendChild(ol);
      var actions = el('div', 'path-actions');
      var mail = el('a', 'btn button-md');
      mail.href = 'mailto:skrhari2020@gmail.com?subject=' + encodeURIComponent(choice.role.subject);
      mail.innerHTML = 'Start a conversation' + arrowSvg;
      var again = el('button', 'btn btn-quiet button-md', 'Start over');
      again.type = 'button';
      again.addEventListener('click', function () { showRole(true); });
      actions.appendChild(mail);
      actions.appendChild(again);
      wrap.appendChild(actions);
      setStage('Your reading list', wrap, focus);
    };
    backBtn.addEventListener('click', function () {
      if (choice.time) showTime(true); else showRole(true);
    });
    showRole(false);
  }

  /* Beat maker. Silent until the visitor turns sound on. */
  var rowsHost = $('#stripRows');
  if (rowsHost) {
    var TRACKS = [
      { name: 'Kick', kind: 'kick', lit: [0, 3, 8, 10] },
      { name: 'Snare', kind: 'snare', lit: [4, 12] },
      { name: 'Hat', kind: 'hat', lit: [0, 2, 4, 6, 8, 10, 12, 14] }
    ];
    var playBtn = $('#stripPlay');
    var soundBtn = $('#soundBtn');
    var bpmInput = $('#bpm');
    var bpmVal = $('#bpmVal');
    var stepEl = $('#stripStep');
    var phone = window.matchMedia('(max-width: 639px)');
    var cells = [], timer = null, pending = [], step = 0, nextAt = 0, bpm = 110;
    var ctx = null, master = null, noise = null, soundOn = false;
    var steps = function () { return phone.matches ? 8 : 16; };
    var stepMs = function () { return 60000 / bpm / 4; };
    var stepText = function (s) { return 'Sound ' + (soundOn ? 'on' : 'off') + '. Step ' + two(s + 1) + ' of ' + steps(); };

    TRACKS.forEach(function (t, r) {
      var row = document.createElement('div');
      row.className = 'strip-row';
      var lab = document.createElement('span');
      lab.className = 'strip-label caption-4';
      lab.textContent = t.name;
      var pads = document.createElement('div');
      pads.className = 'strip-pads';
      cells[r] = [];
      for (var i = 0; i < 16; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pad' + (i >= 8 ? ' x16' : '');
        b.setAttribute('aria-pressed', t.lit.indexOf(i) > -1 ? 'true' : 'false');
        b.setAttribute('aria-label', t.name + ', step ' + (i + 1));
        b.setAttribute('data-r', r);
        b.setAttribute('data-i', i);
        b.tabIndex = (r === 0 && i === 0) ? 0 : -1;
        pads.appendChild(b);
        cells[r].push(b);
      }
      row.appendChild(lab);
      row.appendChild(pads);
      rowsHost.appendChild(row);
    });

    /* Synthesised drums, no samples and no libraries */
    var ensureAudio = function () {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
      var len = Math.floor(ctx.sampleRate * 0.5);
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noise.getChannelData(0);
      for (var k = 0; k < len; k++) d[k] = Math.random() * 2 - 1;
      return true;
    };
    var noiseHit = function (when, hp, level, decay) {
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noise; f.type = 'highpass'; f.frequency.value = hp;
      g.gain.setValueAtTime(level, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + decay);
      src.connect(f); f.connect(g); g.connect(master);
      src.start(when); src.stop(when + decay + 0.02);
    };
    var toneHit = function (when, type, from, to, level, decay) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(from, when);
      o.frequency.exponentialRampToValueAtTime(to, when + Math.min(decay, 0.14));
      g.gain.setValueAtTime(level, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + decay);
      o.connect(g); g.connect(master);
      o.start(when); o.stop(when + decay + 0.02);
    };
    var hit = function (kind, when) {
      if (!ctx) return;
      if (kind === 'kick') toneHit(when, 'sine', 150, 45, 0.9, 0.34);
      else if (kind === 'snare') { noiseHit(when, 1500, 0.45, 0.18); toneHit(when, 'triangle', 200, 140, 0.25, 0.1); }
      else noiseHit(when, 7000, 0.2, 0.05);
    };

    var paint = function (s) {
      cells.forEach(function (row) {
        row.forEach(function (c, k) {
          c.classList.toggle('col', k === s);
          if (k === s && c.getAttribute('aria-pressed') === 'true') {
            c.classList.add('fire');
            setTimeout(function () { c.classList.remove('fire'); }, 110);
          }
        });
      });
      stepEl.textContent = stepText(s);
    };
    var fire = function (s, delay) {
      if (soundOn && ctx) {
        var when = ctx.currentTime + delay / 1000;
        TRACKS.forEach(function (t, r) { if (cells[r][s].getAttribute('aria-pressed') === 'true') hit(t.kind, when); });
      }
      pending.push(setTimeout(function () { paint(s); }, delay));
      if (pending.length > 48) pending.shift();
    };
    var schedule = function () {
      var now = performance.now();
      while (nextAt < now + 80) {
        fire(step, Math.max(0, nextAt - now));
        step = (step + 1) % steps();
        nextAt += stepMs();
      }
      timer = setTimeout(schedule, 25);
    };
    var start = function () {
      if (timer) return;
      if (soundOn && ctx && ctx.state === 'suspended') ctx.resume();
      playBtn.textContent = 'Stop pattern';
      nextAt = performance.now() + 30;
      schedule();
    };
    var stop = function () {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      pending.forEach(clearTimeout);
      pending = [];
      playBtn.textContent = 'Play pattern';
      cells.forEach(function (row) { row.forEach(function (c) { c.classList.remove('col', 'fire'); }); });
      step = 0;
      stepEl.textContent = stepText(0);
    };
    stepEl.textContent = stepText(0);
    playBtn.addEventListener('click', function () { if (timer) stop(); else start(); });

    soundBtn.addEventListener('click', function () {
      if (soundOn) {
        soundOn = false;
        soundBtn.textContent = 'Turn sound on';
      } else if (ensureAudio()) {
        if (ctx.state === 'suspended') ctx.resume();
        soundOn = true;
        soundBtn.textContent = 'Turn sound off';
        hit('kick', ctx.currentTime + 0.02);
      } else {
        stepEl.textContent = 'Sound is not available in this browser.';
        return;
      }
      stepEl.textContent = stepText(timer ? step : 0);
    });
    bpmInput.addEventListener('input', function () {
      bpm = +bpmInput.value;
      bpmVal.textContent = String(bpm);
    });

    rowsHost.addEventListener('click', function (e) {
      var c = e.target.closest('.pad');
      if (!c) return;
      var on = c.getAttribute('aria-pressed') === 'true';
      c.setAttribute('aria-pressed', on ? 'false' : 'true');
      if (!on && soundOn && ctx) hit(TRACKS[+c.getAttribute('data-r')].kind, ctx.currentTime + 0.01);
    });
    rowsHost.addEventListener('keydown', function (e) {
      var c = e.target.closest('.pad');
      if (!c) return;
      var r = +c.getAttribute('data-r'), k = +c.getAttribute('data-i'), nr = r, nk = k;
      if (e.key === 'ArrowRight') nk = Math.min(k + 1, steps() - 1);
      else if (e.key === 'ArrowLeft') nk = Math.max(k - 1, 0);
      else if (e.key === 'ArrowDown') nr = Math.min(r + 1, cells.length - 1);
      else if (e.key === 'ArrowUp') nr = Math.max(r - 1, 0);
      else return;
      e.preventDefault();
      cells[r][k].tabIndex = -1;
      cells[nr][nk].tabIndex = 0;
      cells[nr][nk].focus();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) stop(); }).observe(rowsHost);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    phone.addEventListener('change', stop);
  }

  /* Copy the email address */
  var copyBtn = $('#copyEmail');
  if (copyBtn) {
    var status = $('#copyStatus');
    var emailText = $('#emailText');
    copyBtn.addEventListener('click', function () {
      var text = emailText.textContent.trim();
      var done = function () { status.textContent = 'Email address copied.'; };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(emailText);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        status.textContent = 'Copying is blocked here. The address is selected, so use your copy shortcut.';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  }
})();
