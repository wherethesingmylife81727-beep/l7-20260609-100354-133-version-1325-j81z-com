(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var nextButton = document.querySelector("[data-hero-next]");
    var prevButton = document.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startAuto() {
      if (slides.length < 2) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startAuto();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(current + 1);
        startAuto();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(current - 1);
        startAuto();
      });
    }

    startAuto();

    Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var scope = input.closest("section") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));

        if (!cards.length) {
          cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        }

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    });
  });
})();
