/* Frame Works · cambio de idioma (inglés por defecto, español opcional).
   El HTML está escrito en español; al cargar, cada texto se cambia por su versión en inglés
   (diccionario en js/i18n-en.js). La elección del visitante se recuerda en este navegador. */
(function () {
  'use strict';

  var EN = window.FW_EN || {};
  var STORE_KEY = 'fw-lang';
  var root = document.documentElement;
  var norm = function (t) { return t.replace(/\s+/g, ' ').trim(); };

  // Idioma: ?lang=es|en en la dirección > elección guardada > inglés
  var lang = 'en';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    var saved = localStorage.getItem(STORE_KEY);
    lang = (q === 'es' || q === 'en') ? q : (saved === 'es' || saved === 'en') ? saved : 'en';
  } catch (e) { /* almacenamiento bloqueado: se queda en inglés */ }

  function translate(es, to) {
    if (to !== 'en') return es;
    var key = norm(es);
    if (!key || !EN[key]) return es;
    // conserva los espacios del original alrededor del texto
    var lead = es.match(/^\s*/)[0], trail = es.match(/\s*$/)[0];
    return lead + EN[key] + trail;
  }

  // Textos de la página (se guarda el original en español para poder volver)
  var nodes = [];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (n.parentElement.closest('script, style, [data-split]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) nodes.push({ node: walker.currentNode, es: walker.currentNode.nodeValue });

  // Titulares animados palabra por palabra: se guarda su HTML original completo
  var splits = Array.prototype.map.call(document.querySelectorAll('[data-split]'), function (el) {
    return { el: el, es: el.innerHTML };
  });

  // Atributos visibles para lectores de pantalla y buscadores
  var ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'data-alt'];
  var attrs = [];
  document.querySelectorAll(ATTRS.map(function (a) { return '[' + a + ']'; }).join(',')).forEach(function (el) {
    ATTRS.forEach(function (a) { if (el.hasAttribute(a)) attrs.push({ el: el, a: a, es: el.getAttribute(a) }); });
  });
  var metas = Array.prototype.map.call(document.querySelectorAll('meta[name="description"], meta[property="og:description"]'), function (m) {
    return { el: m, es: m.getAttribute('content') };
  });
  var titleEs = document.title;

  function translateFragment(html, to) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
    var list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (n) { n.nodeValue = translate(n.nodeValue, to); });
    return tpl.innerHTML;
  }

  function apply(to, initial) {
    lang = to;
    nodes.forEach(function (it) { it.node.nodeValue = translate(it.es, to); });
    attrs.forEach(function (it) { it.el.setAttribute(it.a, translate(it.es, to)); });
    metas.forEach(function (it) { it.el.setAttribute('content', translate(it.es, to)); });
    document.title = translate(titleEs, to);
    splits.forEach(function (it) {
      var wasIn = it.el.classList.contains('is-in');
      it.el.innerHTML = translateFragment(it.es, to);
      // en el primer arranque main.js divide las palabras; al cambiar de idioma lo hacemos aquí
      if (!initial && typeof window.FW_split === 'function') window.FW_split(it.el);
      if (wasIn) it.el.classList.add('is-in');
    });
    root.setAttribute('lang', to === 'en' ? 'en' : 'es-419');
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === to));
    });
    try { localStorage.setItem(STORE_KEY, to); } catch (e) { /* sin almacenamiento */ }
    if (!initial) document.dispatchEvent(new CustomEvent('fw:lang', { detail: to }));
  }

  // Traducción para los mensajes que genera el código (formulario, menú…)
  window.FW_T = function (es) { return translate(es, lang); };
  window.FW_LANG = function () { return lang; };

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { if (b.dataset.lang !== lang) apply(b.dataset.lang, false); });
  });

  apply(lang, true);
})();
