(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function setupFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]"));
    sections.forEach(function (section) {
      var keyword = section.querySelector("[data-filter-keyword]");
      var year = section.querySelector("[data-filter-year]");
      var type = section.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchedKeyword = !q || haystack.indexOf(q) !== -1;
          var matchedYear = !y || normalize(card.getAttribute("data-year")) === y;
          var matchedType = !t || normalize(card.getAttribute("data-type")).indexOf(t) !== -1;
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedType));
        });
      }
      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !status || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    renderSearch(query);
  }

  function renderSearch(query) {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var q = normalize(query);
    var list = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
    var matched = list.filter(function (item) {
      if (!q) {
        return true;
      }
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        (item.tags || []).join(" "),
        item.oneLine,
        item.category
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    }).slice(0, 120);
    status.textContent = q ? "搜索结果" : "热门影片";
    results.innerHTML = matched.map(function (item) {
      return [
        "<article class="movie-card">",
        "<a href="" + escapeHtml(item.url) + "" class="poster-link" aria-label="观看" + escapeHtml(item.title) + "">",
        "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
        "<span class="poster-shade"></span>",
        "<span class="watch-now">立即观看</span>",
        "<span class="type-badge">" + escapeHtml(item.type) + "</span>",
        "</a>",
        "<div class="card-body">",
        "<h2><a href="" + escapeHtml(item.url) + "">" + escapeHtml(item.title) + "</a></h2>",
        "<p>" + escapeHtml(item.oneLine) + "</p>",
        "<div class="card-meta"><a href="" + escapeHtml(item.categoryUrl) + "">" + escapeHtml(item.category) + "</a><span>" + escapeHtml(item.year) + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  window.MoviePlayer = {
    init: function (options) {
      var video = document.getElementById("movie-player-video");
      var button = document.querySelector("[data-player-button]");
      if (!video || !button || !options || !options.url) {
        return;
      }
      var loaded = false;
      var hls = null;
      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(options.url);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = options.url;
        } else {
          video.src = options.url;
        }
      }
      function start() {
        load();
        button.classList.add("is-hidden");
        video.play().catch(function () {
          button.classList.remove("is-hidden");
        });
      }
      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
