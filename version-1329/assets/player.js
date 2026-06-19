(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var status = shell.querySelector('[data-player-status]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var started = false;
    var hls = null;

    function setStatus(value) {
      if (status) {
        status.textContent = value;
      }
    }

    function prepare() {
      if (started || !source) {
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('可以播放');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂时不可用');
          }
        });
      } else {
        video.src = source;
        setStatus('可以播放');
      }
    }

    function play() {
      prepare();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('请再次点击播放');
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      setStatus('已暂停');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
      setStatus('播放结束');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
