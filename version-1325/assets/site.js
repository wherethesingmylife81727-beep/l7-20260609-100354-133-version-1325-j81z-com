(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setHero(index, slides, thumbs) {
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    thumbs.forEach(function (thumb, current) {
      thumb.classList.toggle('is-active', current === index);
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function move(step) {
      index = (index + step + slides.length) % slides.length;
      setHero(index, slides, thumbs);
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 6200);
    }
    thumbs.forEach(function (thumb, current) {
      thumb.addEventListener('click', function () {
        index = current;
        setHero(index, slides, thumbs);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }
    setHero(index, slides, thumbs);
    restart();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
    inputs.forEach(function (input) {
      var scope = document.querySelector(input.getAttribute('data-local-filter')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = document.querySelector('[data-empty-state]');
      input.addEventListener('input', function () {
        var term = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !term || haystack.indexOf(term) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      });
    });
  }

  function cardHtml(movie) {
    var tags = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].join(' ');
    return '' +
      '<a class="movie-card" href="' + movie.url + '" data-movie-card data-search="' + escapeAttr(tags) + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + movie.cover + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">' +
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="movie-line">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="movie-meta"><span>' + escapeHtml(movie.genre.split(/[，,、/]/)[0] || '影视') + '</span><span>' + escapeHtml(movie.year) + '</span></span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/
/g, ' ');
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var results = page.querySelector('[data-search-results]');
    var empty = page.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function render() {
      var term = (input && input.value ? input.value : '').trim().toLowerCase();
      var data = window.SEARCH_DATA || [];
      var matched = data.filter(function (movie) {
        if (!term) {
          return true;
        }
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(cardHtml).join('');
      if (empty) {
        empty.classList.toggle('is-visible', matched.length === 0);
      }
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
