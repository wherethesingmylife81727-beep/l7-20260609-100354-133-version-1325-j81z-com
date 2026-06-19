(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var state = document.getElementById('searchState');

  if (!results || !state || !Array.isArray(window.FILM_SEARCH_INDEX || FILM_SEARCH_INDEX)) {
    return;
  }

  var data = window.FILM_SEARCH_INDEX || FILM_SEARCH_INDEX;
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '<span class="poster-frame">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '<span class="poster-duration">' + escapeHtml(item.duration) + '</span>',
      '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-tags"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.views) + '热度</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render(value) {
    var key = value.trim().toLowerCase();
    var matched = data;

    if (key) {
      matched = data.filter(function (item) {
        return [item.title, item.region, item.genre, item.category, item.oneLine, String(item.year)]
          .join(' ')
          .toLowerCase()
          .indexOf(key) !== -1;
      });
    } else {
      matched = data.slice(0, 60);
    }

    state.textContent = key ? '搜索结果：' + value : '热门影片';
    results.innerHTML = matched.slice(0, 80).map(card).join('');

    Array.prototype.slice.call(results.querySelectorAll('img')).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  render(query);
})();
