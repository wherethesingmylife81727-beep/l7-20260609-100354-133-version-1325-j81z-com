(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(isOpen));
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var searchInput = document.querySelector("[data-filter-input]");
        if (searchInput && query) {
            searchInput.value = query;
        }

        var filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var empty = document.querySelector(".empty-state");
            var controls = Array.prototype.slice.call(filterPanel.querySelectorAll("input, select"));

            function applyFilters() {
                var text = normalize((filterPanel.querySelector("[data-filter-input]") || {}).value);
                var year = (filterPanel.querySelector("[data-year-filter]") || {}).value || "";
                var region = (filterPanel.querySelector("[data-region-filter]") || {}).value || "";
                var type = (filterPanel.querySelector("[data-type-filter]") || {}).value || "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matched = true;

                    if (text && haystack.indexOf(text) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }

                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            controls.forEach(function (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            });

            applyFilters();
        }
    });

    window.setupMoviePlayer = function (source) {
        var video = document.querySelector(".movie-video");
        var layer = document.querySelector(".play-layer");
        if (!video || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && layer) {
                layer.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
