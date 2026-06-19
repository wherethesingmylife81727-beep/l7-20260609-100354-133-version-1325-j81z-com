const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

const setupNavigation = () => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
};

const setupHero = () => {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
        return;
    }
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    let active = 0;
    let timer;
    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === active);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === active);
        });
    };
    const schedule = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(active + 1), 5200);
    };
    if (prev) {
        prev.addEventListener("click", () => {
            show(active - 1);
            schedule();
        });
    }
    if (next) {
        next.addEventListener("click", () => {
            show(active + 1);
            schedule();
        });
    }
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            schedule();
        });
    });
    show(0);
    schedule();
};

const setupSearch = () => {
    const panels = Array.from(document.querySelectorAll("[data-movie-search]"));
    panels.forEach((panel) => {
        const input = panel.querySelector("[data-search-input]");
        const typeFilter = panel.querySelector("[data-type-filter]");
        const categoryFilter = panel.querySelector("[data-category-filter]");
        const area = panel.parentElement || document;
        const cards = Array.from(area.querySelectorAll("[data-movie-card]"));
        const empty = area.querySelector("[data-empty-state]");
        const params = new URLSearchParams(window.location.search);
        if (input && params.get("q") && !input.value) {
            input.value = params.get("q") || "";
        }
        const apply = () => {
            const query = (input && input.value ? input.value : "").trim().toLowerCase();
            const typeValue = typeFilter ? typeFilter.value : "";
            const categoryValue = categoryFilter ? categoryFilter.value : "";
            let visible = 0;
            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title || "",
                    card.dataset.type || "",
                    card.dataset.category || "",
                    card.dataset.tags || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                const matchText = !query || haystack.includes(query);
                const matchType = !typeValue || card.dataset.type === typeValue;
                const matchCategory = !categoryValue || card.dataset.category === categoryValue;
                const shouldShow = matchText && matchType && matchCategory;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", apply);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener("change", apply);
        }
        apply();
    });
};

const initializeMoviePlayer = ({ videoId, overlayId, stream }) => {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    if (!video || !overlay || !stream) {
        return;
    }
    let prepared = false;
    let preparing = false;
    const prepare = () => {
        if (prepared || preparing) {
            return;
        }
        preparing = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
            video.load();
        }
        prepared = true;
        preparing = false;
    };
    const start = async () => {
        overlay.classList.add("is-hidden");
        prepare();
        try {
            await video.play();
        } catch (error) {
            overlay.classList.remove("is-hidden");
        }
    };
    overlay.addEventListener("click", start);
    video.addEventListener("click", () => {
        if (!prepared) {
            start();
        }
    });
};

window.QiqiSite = {
    initializeMoviePlayer
};

ready(() => {
    setupNavigation();
    setupHero();
    setupSearch();
});
