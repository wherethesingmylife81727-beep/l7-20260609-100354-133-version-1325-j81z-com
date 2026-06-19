(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase();
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('active', Number(dot.getAttribute('data-hero-dot')) === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }
    schedule();
  }

  function setupFilters() {
    var input = qs('[data-search-input]');
    var year = qs('[data-filter-year]');
    var type = qs('[data-filter-type]');
    var category = qs('[data-filter-category]');
    var cards = qsa('[data-card]');
    var empty = qs('[data-empty-state]');
    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }

    function match(card) {
      var keyword = text(input.value);
      var yearValue = year ? year.value : '';
      var typeValue = type ? text(type.value) : '';
      var categoryValue = category ? text(category.value) : '';
      var body = text([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var ok = true;
      if (keyword && body.indexOf(keyword) === -1) {
        ok = false;
      }
      if (yearValue && text(card.getAttribute('data-year')).indexOf(yearValue) === -1) {
        ok = false;
      }
      if (typeValue && body.indexOf(typeValue) === -1) {
        ok = false;
      }
      if (categoryValue && body.indexOf(categoryValue) === -1) {
        ok = false;
      }
      return ok;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
