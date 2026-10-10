/* Frame Works · interacciones del sitio. Sin dependencias. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = window.FW_T || function (s) { return s; };
  window.scrollTo(0, 0);

  /* ---------- Entrada del logo: se retira tras la animación (o al hacer clic) ---------- */
  var intro = document.getElementById('intro');
  var root = document.documentElement;
  function endIntro() {
    if (!intro || intro.classList.contains('is-done')) return;
    intro.classList.add('is-done');
    root.classList.remove('intro-playing');
    setTimeout(function () { if (intro) intro.remove(); }, 700);
  }
  if (intro) {
    if (!root.classList.contains('intro-playing')) intro.remove();
    else {
      setTimeout(endIntro, 1450);
      intro.addEventListener('click', endIntro);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') endIntro(); }, { once: true });
    }
  }

  /* ---------- Header: fondo al hacer scroll, se oculta al bajar y aparece al subir ---------- */
  var header = document.getElementById('header');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    var menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen && y > 320 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 320) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menú para celular ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-btn__label').textContent = open ? T('Cerrar') : T('Menú');
    mobileNav.hidden = !open;
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    header.classList.add('is-scrolled');
    if (open) header.classList.remove('is-hidden');
    else onScroll();
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Aparición al hacer scroll ---------- */
  /* Titulares palabra por palabra: envuelve cada palabra en una máscara */
  window.FW_split = function (el) {
    var i = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'w';
        var inner = document.createElement('span'); inner.className = 'w__in';
        inner.style.setProperty('--wi', i++);
        inner.textContent = part;
        w.appendChild(inner); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  };
  document.querySelectorAll('[data-split]').forEach(window.FW_split);
  /* Listas en cascada: cada elemento entra un poco después del anterior */
  document.querySelectorAll('[data-stagger]').forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (child, i) { child.style.setProperty('--si', i); });
  });

  var revealEls = document.querySelectorAll('[data-reveal], [data-split], [data-stagger]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Navegación: marca la sección activa ---------- */
  var navLinks = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['metodo', 'servicios', 'casos', 'nosotros', 'problema', 'por-que', 'oferta', 'para-quien', 'faq', 'contacto', 'top'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionIO.observe(el);
    });
  }

  /* ---------- Método: tarjetas apiladas; la activa actualiza contador y barra ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var methodNum = document.getElementById('methodNum');
  var methodBar = document.getElementById('methodBar');
  var current = 0;
  var stackMQ = window.matchMedia('(min-width: 901px)');

  function setStep(i) {
    if (i === current) return;
    current = i;
    methodBar.style.width = (i / steps.length) * 100 + '%';
    var label = String(i).padStart(2, '0');
    if (reduceMotion) { methodNum.textContent = label; return; }
    methodNum.classList.add('is-changing');
    setTimeout(function () { methodNum.textContent = label; methodNum.classList.remove('is-changing'); }, 180);
  }

  function updateSteps() {
    if (!steps.length) return;
    var active = 1;
    steps.forEach(function (step, idx) {
      var stickyTop = parseFloat(getComputedStyle(step).top) || 0;
      if (step.getBoundingClientRect().top <= stickyTop + 2) active = idx + 1;
    });
    // Primera tarjeta activa hasta que la siguiente llega a su sitio
    steps.forEach(function (step, idx) {
      step.classList.toggle('is-past', stackMQ.matches && idx + 1 < active);
    });
    setStep(active);
  }

  /* ---------- Parallax suave en fotos grandes ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.parallax'));
  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var progress = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
      el.style.setProperty('--py', (progress * -60).toFixed(1) + 'px');
    });
  }

  var scrollTicking = false;
  /* Barra de progreso, texto gigante en movimiento y botón flotante */
  var progressBar = document.getElementById('progressBar');
  var kinetic = document.querySelector('.kinetic__row');
  var floatCta = document.getElementById('floatCta');
  var heroEl = document.querySelector('.hero');
  var contactEl = document.getElementById('contacto');
  if (floatCta && floatCta.dataset.whatsapp) {
    floatCta.href = 'https://wa.me/' + floatCta.dataset.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(T('Hola, quiero información sobre los servicios de Frame Works.'));
    floatCta.target = '_blank';
    floatCta.rel = 'noopener';
  }
  function updateScrollUI() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) + ')';
    if (kinetic && !reduceMotion) {
      var r = kinetic.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        kinetic.style.transform = 'translate3d(' + (-p * 35) + '%,0,0)';
      }
    }
    if (floatCta) {
      var pastHero = heroEl ? heroEl.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      var atContact = contactEl ? contactEl.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      floatCta.classList.toggle('is-on', pastHero && !atContact);
    }
  }

  function onScrollEffects() {
    updateScrollUI();
    updateSteps();
    updateParallax();
    scrollTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (!scrollTicking) { requestAnimationFrame(onScrollEffects); scrollTicking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScrollEffects);
  onScrollEffects();

  /* ---------- Servicios: categorías desplegables; la abierta cambia la foto ---------- */
  var services = Array.prototype.slice.call(document.querySelectorAll('.service'));
  var servicePhoto = document.getElementById('servicePhoto');
  // Precarga para que el cambio de foto sea instantáneo
  services.forEach(function (s) { if (s.dataset.img) { var i = new Image(); i.src = s.dataset.img; } });

  function swapServicePhoto(src) {
    if (!servicePhoto || !src) return;
    var old = servicePhoto.querySelector('img:not(.is-leaving)');
    if (old && old.getAttribute('src') === src) return;
    var img = new Image();
    img.alt = '';
    img.className = 'is-entering';
    img.onerror = function () { img.remove(); };
    img.src = src;
    servicePhoto.appendChild(img);
    requestAnimationFrame(function () { requestAnimationFrame(function () { img.classList.remove('is-entering'); }); });
    if (old) {
      old.classList.add('is-leaving');
      setTimeout(function () { old.remove(); }, 800);
    }
  }

  function setService(row, open) {
    services.forEach(function (s) {
      var isOpen = s === row && open;
      s.classList.toggle('is-active', isOpen);
      s.querySelector('.service__head').setAttribute('aria-expanded', String(isOpen));
    });
    if (open) swapServicePhoto(row.dataset.img);
  }

  services.forEach(function (row) {
    var head = row.querySelector('.service__head');
    head.addEventListener('click', function () {
      var willOpen = !row.classList.contains('is-active');
      setService(row, willOpen);
      // En pantallas estrechas, lleva la categoría abierta a la vista cuando termina de desplegarse
      if (willOpen && !stackMQ.matches) {
        setTimeout(function () {
          var top = row.getBoundingClientRect().top;
          if (top < 72 || top > window.innerHeight * 0.4) {
            window.scrollTo({ top: window.scrollY + top - 88, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }, 760);
      }
    });
    // Con ratón, pasar por encima adelanta la foto de la categoría
    head.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) swapServicePhoto(row.dataset.img);
    });
  });
  var servicesList = document.querySelector('.services');
  if (servicesList) {
    servicesList.addEventListener('mouseleave', function () {
      var open = document.querySelector('.service.is-active');
      if (open) swapServicePhoto(open.dataset.img);
    });
  }

  /* ---------- Servicios: detalle de cada servicio (uno abierto por categoría) ---------- */
  document.querySelectorAll('.svc-items').forEach(function (list) {
    var heads = Array.prototype.slice.call(list.querySelectorAll('.svc-item__head'));
    heads.forEach(function (h) {
      h.addEventListener('click', function () {
        var open = h.getAttribute('aria-expanded') !== 'true';
        heads.forEach(function (o) { o.setAttribute('aria-expanded', String(o === h && open)); });
      });
    });
  });

  /* ---------- Servicios: el tablero se proyecta en la pantalla del portátil (perspectiva) ----------
     Se calcula una homografía que lleva el rectángulo del tablero (1000 × 625) a las cuatro
     esquinas de la pantalla en la foto, y se aplica como matrix3d. */
  var lapScreen = document.getElementById('lapScreen');
  if (lapScreen) {
    var lap = document.getElementById('lap');
    var quad = lapScreen.dataset.quad.split(' ').map(function (p) { return p.split(',').map(Number); });
    var SW = 1000, SH = 625;
    function solve(A, b) {   // eliminación de Gauss para el sistema 8 × 8
      var n = b.length, i, j, k;
      for (i = 0; i < n; i++) {
        var max = i; for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[max][i])) max = k;
        var t = A[i]; A[i] = A[max]; A[max] = t; var tb = b[i]; b[i] = b[max]; b[max] = tb;
        for (k = i + 1; k < n; k++) { var f = A[k][i] / A[i][i]; b[k] -= f * b[i]; for (j = i; j < n; j++) A[k][j] -= f * A[i][j]; }
      }
      var x = new Array(n);
      for (i = n - 1; i >= 0; i--) { var sum = b[i]; for (j = i + 1; j < n; j++) sum -= A[i][j] * x[j]; x[i] = sum / A[i][i]; }
      return x;
    }
    function fitScreen() {
      var W = lap.clientWidth, H = lap.querySelector('.lap__img').clientHeight;
      if (!W || !H) return;
      var src = [[0, 0], [SW, 0], [SW, SH], [0, SH]];
      var dst = quad.map(function (q) { return [q[0] / 100 * W, q[1] / 100 * H]; });
      var A = [], b = [];
      for (var i = 0; i < 4; i++) {
        var x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
        A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
      }
      var h = solve(A, b);
      var m = [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1];
      lapScreen.style.transform = 'matrix3d(' + m.map(function (n) { return n.toFixed(10); }).join(',') + ')';
    }
    var lapImg = lap.querySelector('.lap__img');
    if (lapImg.complete) fitScreen(); else lapImg.addEventListener('load', fitScreen);
    window.addEventListener('resize', fitScreen);
    if ('ResizeObserver' in window) new ResizeObserver(fitScreen).observe(lap);
  }

  /* ---------- Casos: galería horizontal con arrastre, botones y progreso ---------- */
  var cases = document.getElementById('cases');
  if (cases) {
    var bar = document.getElementById('casesBar');
    var prev = document.getElementById('casesPrev');
    var next = document.getElementById('casesNext');

    function updateCases() {
      var max = cases.scrollWidth - cases.clientWidth;
      var ratio = cases.clientWidth / cases.scrollWidth;
      var pos = max > 0 ? cases.scrollLeft / max : 0;
      bar.style.width = (ratio * 100) + '%';
      bar.style.left = (pos * (1 - ratio) * 100) + '%';
      prev.disabled = cases.scrollLeft <= 4;
      next.disabled = cases.scrollLeft >= max - 4;
    }
    function step(dir) {
      var card = cases.querySelector('.case');
      var gap = parseFloat(getComputedStyle(cases).columnGap) || 24;
      cases.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    cases.addEventListener('scroll', updateCases, { passive: true });
    window.addEventListener('resize', updateCases);
    cases.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });

    // Arrastrar con el ratón
    var down = false, startX = 0, startLeft = 0, moved = false;
    cases.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = cases.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; cases.classList.add('is-dragging'); }
      if (moved) cases.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        cases.classList.remove('is-dragging');
        // Ajusta a la tarjeta más cercana
        var card = cases.querySelector('.case');
        var gap = parseFloat(getComputedStyle(cases).columnGap) || 24;
        var w = card.offsetWidth + gap;
        cases.scrollTo({ left: Math.round(cases.scrollLeft / w) * w, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
    updateCases();
  }

  /* ---------- Conversación de ejemplo: se reproduce al entrar en pantalla ---------- */
  var showcase = document.querySelector('.showcase');
  if (showcase && 'IntersectionObserver' in window) {
    var chatIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { showcase.classList.add('is-chat'); chatIO.disconnect(); }
    }, { threshold: 0.35 });
    chatIO.observe(showcase.querySelector('.phone') || showcase);
  } else if (showcase) { showcase.classList.add('is-chat'); }

  /* ---------- Cifras que cuentan hacia arriba (solo si la sección está visible) ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (el.closest('[hidden]')) return;
    var target = parseFloat(el.dataset.count) || 0, suffix = el.dataset.suffix || '';
    var run = function () {
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if (!('IntersectionObserver' in window)) return run();
    var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.5 });
    o.observe(el);
  });

  /* ---------- Botones magnéticos: se inclinan suavemente hacia el cursor ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.btn, .circle-btn, .float-cta').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (x * 10).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Formulario de contacto ----------
     Se envía a FormSubmit (data-endpoint), que reenvía el mensaje al correo de Frame Works.
     Si está vacío, abre el correo del visitante con el mensaje ya redactado. */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');

    function fieldError(input, msg) {
      var field = input.closest('.field');
      var err = field.querySelector('.err');
      field.classList.toggle('is-invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) {
        if (!err) {
          err = document.createElement('span');
          err.className = 'err';
          err.id = input.id + '-err';
          field.appendChild(err);
          input.setAttribute('aria-describedby', err.id);
        }
        err.textContent = msg;
      } else if (err) {
        err.remove();
        input.removeAttribute('aria-describedby');
      }
    }

    function validate() {
      var ok = true;
      var name = form.elements.nombre, email = form.elements.email, msg = form.elements.mensaje;
      fieldError(name, name.value.trim() ? '' : T('Escribe tu nombre.'));
      if (!name.value.trim()) ok = false;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      fieldError(email, emailOk ? '' : T('Revisa el correo: parece incompleto.'));
      if (!emailOk) ok = false;
      fieldError(msg, msg.value.trim() ? '' : T('Cuéntanos brevemente qué te gustaría mejorar.'));
      if (!msg.value.trim()) ok = false;
      return ok;
    }

    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.is-invalid')) validate();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';
      if (!validate()) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      var endpoint = form.dataset.endpoint;
      var data = new FormData(form);

      if (!endpoint) {
        var body = 'Idioma: ' + (window.FW_LANG ? window.FW_LANG() : 'es') + '\nNombre: ' + data.get('nombre') + '\nCorreo: ' + data.get('email') +
          '\nEmpresa: ' + (data.get('empresa') || '-') +
          '\nMe interesa: ' + (data.getAll('interes').join(', ') || '-') + '\n\n' + data.get('mensaje');
        window.location.href = 'mailto:' + form.dataset.mailto +
          '?subject=' + encodeURIComponent('Diagnóstico · ' + data.get('nombre')) +
          '&body=' + encodeURIComponent(body);
        status.textContent = T('Se abrió tu correo con el mensaje listo. Si no se abrió, escríbenos a') + ' ' + form.dataset.mailto + '.';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.textContent = T('Enviando…');
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function (d) {
          // FormSubmit responde success "false" si el envío no se aceptó (por ejemplo, antes de activar el correo)
          if (d && String(d.success) === 'false') throw new Error(d.message || 'rechazado');
          form.reset();
          status.className = 'form__status is-ok';
          status.textContent = T('Gracias. Recibimos tu mensaje y te escribiremos pronto para agendar la llamada.');
        })
        .catch(function () {
          status.textContent = T('No se pudo enviar. Inténtalo de nuevo o escríbenos a') + ' ' + form.dataset.mailto + '.';
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  /* ---------- Titular del inicio: tamaño ajustado para que cada línea quepa sin partirse ---------- */
  var heroTitle = document.querySelector('.hero__title');
  var wideMQ = window.matchMedia('(min-width: 901px)');
  function fitHeroTitle() {
    if (!heroTitle) return;
    if (!wideMQ.matches) { heroTitle.style.fontSize = ''; return; }
    heroTitle.style.fontSize = '100px';
    var avail = heroTitle.getBoundingClientRect().width;
    var widest = 0;
    heroTitle.querySelectorAll('.line > span').forEach(function (s) { widest = Math.max(widest, s.getBoundingClientRect().width); });
    if (widest > 0) heroTitle.style.fontSize = Math.max(40, Math.min(112, Math.floor(100 * avail / widest) - 1)) + 'px';
  }
  fitHeroTitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroTitle);
  window.addEventListener('resize', fitHeroTitle);
  document.addEventListener('fw:lang', fitHeroTitle);

  /* ---------- Computador del inicio: "arranque" de Frame Works ----------
     Reposo con el logo → se escriben líneas de terminal → del centro sale una red que
     conecta los servicios → mensaje final → la red se recoge y vuelve al reposo.
     Se repite solo; al pasar el cursor arranca de inmediato. */
  var boot = document.getElementById('boot');
  if (boot) {
    var bootLines = Array.prototype.slice.call(boot.querySelectorAll('.boot__l'));
    var bootReady = boot.querySelector('.boot__ready');
    var bootMotions = Array.prototype.slice.call(boot.querySelectorAll('animateMotion'));
    var bootT = [], bootBusy = false, bootVisible = false;
    var bAt = function (ms, fn) { bootT.push(setTimeout(fn, ms)); };
    function typeInto(el, txt, ms) {
      var i = 0; el.textContent = '';
      el.classList.add('is-typing');
      (function tick() {
        el.textContent = txt.slice(0, ++i);
        if (i < txt.length) bootT.push(setTimeout(tick, ms));
        else el.classList.remove('is-typing');
      })();
    }
    function bootReset() {
      bootT.forEach(clearTimeout); bootT = [];
      boot.className = 'boot';
      bootLines.forEach(function (l) { l.textContent = ''; l.classList.remove('is-typing'); });
      bootReady.textContent = '';
      bootBusy = false;
    }
    function bootRun() {
      if (bootBusy) return;
      bootReset(); bootBusy = true;
      var t = 0, CH = 22;
      bAt(t, function () { boot.classList.add('is-term'); });
      bootLines.forEach(function (l) {
        var txt = T(l.dataset.t);
        (function (start, txt) { bAt(start, function () { typeInto(l, '> ' + txt, CH); }); })(t + 250, txt);
        t += 250 + (txt.length + 2) * CH;
      });
      bAt(t + 300, function () { boot.classList.add('is-hub'); });
      bAt(t + 700, function () { boot.classList.add('is-net'); });
      bAt(t + 1700, function () {
        boot.classList.add('is-live');
        bootMotions.forEach(function (m, i) { try { m.beginElement(); } catch (e) {} });
        typeInto(bootReady, '> ' + T(bootReady.dataset.t), 18);
      });
      bAt(t + 5600, function () { boot.classList.add('is-out'); });
      bAt(t + 6600, function () { bootReset(); bAt(2600, function () { if (bootVisible) bootRun(); }); });
    }
    if (reduceMotion) {
      boot.classList.add('is-term', 'is-hub', 'is-net', 'is-live');
      bootLines.forEach(function (l) { l.textContent = '> ' + T(l.dataset.t); });
      bootReady.textContent = '> ' + T(bootReady.dataset.t);
    } else {
      var startBoot = function () { if (!bootBusy && bootVisible) bootRun(); };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          bootVisible = en[0].isIntersecting;
          if (bootVisible) setTimeout(startBoot, document.documentElement.classList.contains('intro-playing') ? 1600 : 600);
          else bootReset();
        }, { threshold: .3 }).observe(boot);
      } else { bootVisible = true; startBoot(); }
      boot.closest('.mac').addEventListener('mouseenter', startBoot);
    }
  }

  /* ---------- Casos: demo animada (WhatsApp → CRM, marketing de contenido y desarrollo web) ----------
     Una línea de tiempo con reloj virtual: al pasar el cursor el reloj va más lento
     (y --slow alarga las transiciones CSS), así se aprecian mejor los detalles. */
  var demo = document.getElementById('demo');
  if (demo) {
    var $d = function (id) { return document.getElementById(id); };
    var cam = $d('demoCam'), msgs = $d('dMsgs'), cap = $d('dCap'), row = $d('dRow'), badge = $d('dBadge');
    var pulseEl = $d('dPulse'), stepEl = $d('dStep');
    var stepBars = demo.querySelectorAll('.demo__steps i');
    var bubbles = ['dUnread', 'dIn', 'dAutoTag', 'dTyping', 'dOut'].map($d);
    bubbles.forEach(function (el) { el.setAttribute('data-in', ''); });
    var fields = Array.prototype.slice.call(cap.querySelectorAll('dd'));

    // Planos de cámara: [x, y, escala] en cqw (1cqw = 1 % del ancho de la pantalla)
    var SHOT = {
      wa: [23, -14.5, 1.5],        // conversación de WhatsApp de cerca
      flow: [11.6, -4.75, 1.2],    // WhatsApp + captura del lead
      all: [0, 0, 1],              // flujo completo
      crm: [-92.6, -16, 1.75]      // CRM de cerca
    };
    var shot = function (k) { var v = SHOT[k]; cam.style.transform = 'translate(' + v[0] + 'cqw,' + v[1] + 'cqw) scale(' + v[2] + ')'; };
    var STEPS = ['Mensaje recibido', 'Capturando lead', 'Registrando en CRM', 'Clasificando lead', 'Respuesta enviada'];
    var curStep = 0;
    var step = function (i) {
      curStep = i;
      stepEl.classList.add('is-swap');
      setTimeout(function () { stepEl.textContent = T(STEPS[i]); stepEl.classList.remove('is-swap'); }, 200);
      stepBars.forEach(function (b, j) { b.classList.toggle('is-on', j <= i); });
    };

    var show = function (el) { el.classList.remove('is-gone'); void el.offsetWidth; el.classList.add('is-on'); };
    var on = function (el, c) { el.classList.add(c || 'is-on'); };
    var off = function (el, c) { el.classList.remove(c || 'is-on'); };

    // ----- reloj virtual -----
    var vt = 0, last = null, speed = 1, fired = 0, raf = 0, visible = false, EV = [], tweens = [];
    var TS = .84;                 // ritmo general: < 1 = más rápido
    var BRAND_AT = 17000 * TS, BRAND_MS = 1700;   // la marca dura siempre lo mismo, sin importar el ritmo
    var REEL_MS = 3800, MKT_AT = BRAND_AT + BRAND_MS + 250;   // después de la marca: brochure de videos
    var MKT_END = MKT_AT + reelCount() * REEL_MS;
    var DEV_AT = MKT_END + BRAND_MS, DEV_MS = 11200, DEV_END = DEV_AT + DEV_MS;   // tercera parte: desarrollo web
    var CYCLE = DEV_END + BRAND_MS;
    function reelCount() { return demo.querySelectorAll('.reel').length; }
    var at = function (t, fn) { EV.push([t * TS, fn]); };
    var tween = function (dur, fn) { tweens.push({ s: vt, d: dur * TS, fn: fn }); };
    var ease = function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; };

    function pulse(id, dur) {
      var path = $d(id), len = path.getTotalLength();
      on(path, 'is-hot'); on(pulseEl);
      tween(dur, function (p) {
        var pt = path.getPointAtLength(ease(p) * len);
        pulseEl.setAttribute('cx', pt.x); pulseEl.setAttribute('cy', pt.y);
        if (p >= 1) { off(pulseEl); off(path, 'is-hot'); }
      });
    }
    function type(dd, dur) {
      if (dd.hasAttribute('data-badge')) { dd.innerHTML = '<span class="crm__badge" data-s="new">' + T(dd.dataset.v) + '</span>'; return; }
      tween(dur, function (p) {
        var txt = T(dd.dataset.v);   // se traduce en cada cuadro: si cambia el idioma a mitad, sigue en el nuevo
        dd.textContent = txt.slice(0, Math.max(1, Math.ceil(p * txt.length)));
        dd.classList.toggle('is-typing', p < 1);
      });
    }
    function setBadge(s, txt) { badge.dataset.s = s; badge.textContent = T(txt); }

    function hardReset() {
      off(demo, 'is-mkt'); if (typeof setReel === 'function') setReel(-1);
      if (typeof devReset === 'function') devReset();
      off(demo, 'is-brand');
      msgs.style.transition = 'none';
      off(msgs, 'is-out');
      bubbles.forEach(function (el) { off(el); el.classList.add('is-gone'); });
      void msgs.offsetWidth; msgs.style.transition = '';
      off($d('dIn'), 'is-captured');
      off($d('dTicks'), 'is-read');
    }
    function resetSystem() {   // ocurre fuera de cuadro, con la cámara sobre WhatsApp
      ['dl1', 'dl2', 'dl3'].forEach(function (id) { off($d(id)); off($d(id), 'is-hot'); });
      off(demo, 'is-wired'); off($d('dBackTag'));
      off(cap); off(cap, 'is-live');
      fields.forEach(function (dd) { dd.textContent = ''; dd.classList.remove('is-typing'); });
      off(row); off(row.firstElementChild, 'is-settled'); off($d('dPrio'));
      off($d('dProg'), 'is-run');
      setBadge('new', 'Nuevo');
      $d('dCount').textContent = '24';
    }

    // ----- guion -----
    // 1 · llega el mensaje
    at(0, function () { hardReset(); shot('wa'); step(0); });
    at(350, function () { show(bubbles[0]); });
    at(600, function () { show(bubbles[1]); });
    // 2 · zoom out: WhatsApp es solo la entrada; se captura el lead
    at(2000, function () { shot('flow'); step(1); });
    at(2500, function () { on(demo, 'is-wired'); on($d('dl1')); on(cap); });
    at(2900, function () { on($d('dIn'), 'is-captured'); off(bubbles[0]); pulse('dl1', 700); });
    at(3600, function () { on(cap, 'is-live'); type(fields[0], 500); });
    at(4200, function () { type(fields[1], 350); });
    at(4650, function () { type(fields[2], 350); });
    at(5100, function () { type(fields[3]); });
    // 3 · zoom out de nuevo: el lead entra al CRM
    at(5500, function () { shot('all'); step(2); off($d('dIn'), 'is-captured'); });
    at(5900, function () { on($d('dl2')); });
    at(6200, function () { pulse('dl2', 600); });
    at(6800, function () { on(row); $d('dCount').textContent = '25'; on($d('dCount'), 'is-bump'); off(cap, 'is-live'); });
    // 4 · zoom al CRM: el sistema clasifica el lead
    at(7400, function () { shot('crm'); off($d('dCount'), 'is-bump'); });
    at(8500, function () { step(3); setBadge('busy', 'Analizando consulta'); on($d('dProg'), 'is-run'); });
    at(10100, function () { setBadge('ok', 'Calificado'); on($d('dPrio')); off($d('dProg'), 'is-run'); on(row.firstElementChild, 'is-settled'); });
    // 5 · de vuelta a WhatsApp: respuesta automática
    at(11100, function () { shot('all'); });
    at(11500, function () { on($d('dl3')); on($d('dBackTag')); });
    at(11800, function () { pulse('dl3', 1100); });
    at(12900, function () { shot('wa'); });
    at(13900, function () { show(bubbles[2]); show(bubbles[3]); });
    at(15200, function () { bubbles[3].classList.add('is-gone'); show(bubbles[4]); step(4); });
    at(16100, function () { on($d('dTicks'), 'is-read'); });
    // 6 · cierre con la marca; debajo se archiva la conversación y empieza un nuevo ciclo
    at(17000, function () { on(demo, 'is-brand'); });
    at(17700, function () { on(msgs, 'is-out'); resetSystem(); });
    EV.push([BRAND_AT + BRAND_MS, function () { off(demo, 'is-brand'); }]);
    // 7 · brochure de marketing: los videos se reproducen uno tras otro y vuelve la automatización
    EV.push([BRAND_AT + BRAND_MS - 400, function () { posters(); on(demo, 'is-mkt'); }]);
    for (var ri = 0; ri < reelCount(); ri++) (function (i) { EV.push([MKT_AT + i * REEL_MS, function () { setReel(i); }]); })(ri);
    // 8 · logo y luego desarrollo web: el código se escribe y aparece la página publicada
    var dev = $d('dDev'), DEV_CLS = ['is-html', 'is-js', 'is-run', 'is-full', 'is-scroll'];
    var devTab = function (js) { $d('dTabHtml').classList.toggle('is-on', !js); $d('dTabJs').classList.toggle('is-on', js); };
    var devReset = function () { DEV_CLS.forEach(function (c) { off(dev, c); }); devTab(false); off(demo, 'is-dev'); };
    EV.push([MKT_END, function () { on(demo, 'is-brand'); }]);
    EV.push([MKT_END + BRAND_MS - 400, function () { setReel(-1); off(demo, 'is-mkt'); devReset(); on(demo, 'is-dev'); }]);
    EV.push([DEV_AT, function () { off(demo, 'is-brand'); on(dev, 'is-html'); }]);
    EV.push([DEV_AT + 3900, function () { devTab(true); on(dev, 'is-js'); }]);
    EV.push([DEV_AT + 6600, function () { on(dev, 'is-run'); }]);
    EV.push([DEV_AT + 8500, function () { on(dev, 'is-full'); }]);
    EV.push([DEV_AT + 9300, function () { on(dev, 'is-scroll'); }]);
    // 9 · logo y vuelve a empezar con la automatización (bucle infinito)
    EV.push([DEV_END, function () { on(demo, 'is-brand'); }]);
    EV.push([DEV_END + BRAND_MS - 400, devReset]);
    EV.sort(function (x, y) { return x[0] - y[0]; });

    /* ----- Brochure de anuncios: cada uno se anima con CSS mientras está activo ----- */
    var reels = Array.prototype.slice.call(demo.querySelectorAll('.reel'));
    var reelBars = reels.map(function (r) { return r.querySelector('.reel__bar i'); });
    var activeReel = -1, reelT0 = 0;
    function posters() { reelBars.forEach(function (b) { b.style.width = '0%'; }); }
    function setReel(i) {
      if (activeReel >= 0) reelBars[activeReel].style.width = '100%';
      activeReel = i; reelT0 = vt;
      reels.forEach(function (r, j) { r.classList.toggle('is-on', j === i); });
    }

    /* ----- Casos: cada escena es un caso; las pestañas la siguen y permiten saltar a ella ----- */
    var caseTabs = Array.prototype.slice.call(document.querySelectorAll('.case-studio__tab'));
    var SCENES = [0, BRAND_AT + BRAND_MS - 400, MKT_END + BRAND_MS - 400, CYCLE];
    var curScene = -1;
    function sceneSync() {
      var k = vt < SCENES[1] ? 0 : vt < SCENES[2] ? 1 : 2;
      if (k !== curScene) {
        curScene = k;
        caseTabs.forEach(function (t, i) { t.classList.toggle('is-on', i === k); t.setAttribute('aria-selected', String(i === k)); });
      }
      var bar = caseTabs[k] && caseTabs[k].querySelector('.case-studio__bar');
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, (vt - SCENES[k]) / (SCENES[k + 1] - SCENES[k])) + ')';
    }
    function jumpTo(t) {
      resetSystem(); hardReset(); vt = 0; fired = 0; tweens = [];
      while (fired < EV.length && EV[fired][0] <= t) { vt = EV[fired][0]; EV[fired][1](); fired++; }
      vt = t; tweens.forEach(function (tw) { tw.fn(1); }); tweens = [];
      sceneSync();
    }
    caseTabs.forEach(function (t, i) {
      t.addEventListener('click', function () { jumpTo(i === 0 ? 0 : SCENES[i] - 1); });
    });

    function frame(now) {
      if (!visible) { raf = 0; last = null; return; }
      if (last === null) last = now;
      vt += Math.min(now - last, 100) * speed; last = now;
      while (fired < EV.length && EV[fired][0] <= vt) { EV[fired][1](); fired++; }
      tweens = tweens.filter(function (tw) { var p = Math.min(1, (vt - tw.s) / tw.d); tw.fn(p); return p < 1; });
      if (activeReel >= 0) {
        reelBars[activeReel].style.width = Math.min(100, (vt - reelT0) * 100 / REEL_MS) + '%';
      }
      if (vt >= CYCLE) { vt = 0; fired = 0; tweens = []; }
      if (caseTabs.length) sceneSync();
      raf = requestAnimationFrame(frame);
    }
    var play = function () { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };

    if (reduceMotion) {
      // Sin movimiento: se muestra el flujo completo ya resuelto
      shot('all'); on(demo, 'is-wired'); ['dl1', 'dl2', 'dl3'].forEach(function (id) { on($d(id)); });
      on(cap); fields.forEach(function (dd) { if (dd.hasAttribute('data-badge')) type(dd); else dd.textContent = T(dd.dataset.v); });
      on(row); setBadge('ok', 'Calificado'); on($d('dPrio')); on($d('dBackTag'));
      [0, 1, 2, 4].forEach(function (i) { show(bubbles[i]); }); bubbles[3].classList.add('is-gone'); on($d('dTicks'), 'is-read');
      step(4);
    } else {
      hardReset(); shot('wa');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; play(); }, { threshold: .15 }).observe(demo);
      } else { visible = true; play(); }
      document.addEventListener('visibilitychange', play);
    }
    document.addEventListener('fw:lang', function () {
      stepEl.textContent = T(STEPS[curStep]);
      fields.forEach(function (dd) {
        if (!dd.textContent) return;
        if (dd.hasAttribute('data-badge')) dd.firstElementChild.textContent = T(dd.dataset.v);
        else if (!dd.classList.contains('is-typing')) dd.textContent = T(dd.dataset.v);
      });
      badge.textContent = T({ 'new': 'Nuevo', busy: 'Analizando consulta', ok: 'Calificado' }[badge.dataset.s]);
    });
  }

  /* ---------- Al cambiar de idioma: actualizar textos generados por el código ---------- */
  document.addEventListener('fw:lang', function () {
    var label = document.querySelector('.menu-btn__label');
    if (label) label.textContent = document.body.classList.contains('menu-open') ? T('Cerrar') : T('Menú');
    document.querySelectorAll('.field .err').forEach(function (e) { e.remove(); });
    document.querySelectorAll('.field.is-invalid').forEach(function (f) { f.classList.remove('is-invalid'); });
    var st = document.getElementById('formStatus'); if (st) st.textContent = '';
  });

  /* ---------- Año del footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
