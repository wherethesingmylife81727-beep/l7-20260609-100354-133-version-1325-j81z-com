(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-carousel-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var searchInput = document.querySelector('.js-search');
    var activeChip = document.querySelector('.filter-chip.is-active');
    var query = normalize(searchInput ? searchInput.value : '');
    var chipValue = activeChip ? activeChip.getAttribute('data-filter-value') : 'all';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-filter'));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesChip = !chipValue || chipValue === 'all' || text.indexOf(normalize(chipValue)) !== -1;
      var showCard = matchesQuery && matchesChip;
      card.style.display = showCard ? '' : 'none';
      if (showCard) {
        visible += 1;
      }
    });

    document.querySelectorAll('[data-empty-state]').forEach(function (empty) {
      empty.style.display = visible ? 'none' : 'block';
    });
  }

  var searchInput = document.querySelector('.js-search');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applyFilter);
  }

  document.querySelectorAll('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.filter-chip').forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      applyFilter();
    });
  });

  if (searchInput || document.querySelector('.filter-chip')) {
    applyFilter();
  }

  function initVideo(wrapper) {
    var video = wrapper.querySelector('.player-video');
    var cover = wrapper.querySelector('.player-cover');
    if (!video) {
      return;
    }

    function load() {
      if (video.dataset.ready === 'yes') {
        return Promise.resolve();
      }
      var source = video.getAttribute('data-hls-url');
      video.dataset.ready = 'yes';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsPlayer = hls;
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
          } else {
            resolve();
          }
        });
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      load().then(function () {
        var started = video.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        wrapper.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      wrapper.classList.remove('is-playing');
    });
  }

  document.querySelectorAll('.player-card').forEach(initVideo);
})();
