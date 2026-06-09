// Carousel for [product_showcase_slider]. Cross-fade slides, side-nav-style
// numbered dots, prev/next arrows, counter, autoplay (pauses on hover/tab),
// touch swipe. Supports multiple instances per page. No dependencies.
(function () {
	"use strict";

	var AUTOPLAY_MS = 6000;

	function pad(n) {
		return String(n).length < 2 ? "0" + n : String(n);
	}

	function initSlider(root) {
		if (root.dataset.pssInit) return;
		root.dataset.pssInit = "1";

		var slides = [].slice.call(root.querySelectorAll(".pss-slide"));
		var dots = [].slice.call(root.querySelectorAll(".pss-nav-item"));
		var curEl = root.querySelector(".pss-cur");
		var prevBtn = root.querySelector(".pss-prev");
		var nextBtn = root.querySelector(".pss-next");
		var total = slides.length;
		if (!total) return;

		var index = 0;
		var timer = null;

		function go(i) {
			index = (i + total) % total;
			for (var s = 0; s < slides.length; s++) {
				slides[s].classList.toggle("is-active", s === index);
			}
			for (var d = 0; d < dots.length; d++) {
				dots[d].classList.toggle("active", d === index);
			}
			if (curEl) curEl.textContent = pad(index + 1);
		}

		function next() {
			go(index + 1);
		}
		function prev() {
			go(index - 1);
		}

		function startAuto() {
			stopAuto();
			if (total <= 1) return;
			timer = setInterval(function () {
				if (!document.hidden) next();
			}, AUTOPLAY_MS);
		}
		function stopAuto() {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}
		// Restart the timer after any manual navigation so the next auto-advance
		// is a full interval away (avoids an immediate jump).
		function restart() {
			startAuto();
		}

		for (var k = 0; k < dots.length; k++) {
			(function (el) {
				function activate() {
					go(parseInt(el.getAttribute("data-index"), 10) || 0);
					restart();
				}
				el.addEventListener("click", activate);
				el.addEventListener("keydown", function (e) {
					if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
						e.preventDefault();
						activate();
					}
				});
			})(dots[k]);
		}

		if (nextBtn)
			nextBtn.addEventListener("click", function () {
				next();
				restart();
			});
		if (prevBtn)
			prevBtn.addEventListener("click", function () {
				prev();
				restart();
			});

		// Pause while hovered / re-arm on leave.
		root.addEventListener("mouseenter", stopAuto);
		root.addEventListener("mouseleave", startAuto);

		// Touch swipe.
		var startX = null;
		root.addEventListener(
			"touchstart",
			function (e) {
				startX = e.touches[0].clientX;
			},
			{ passive: true },
		);
		root.addEventListener(
			"touchend",
			function (e) {
				if (startX == null) return;
				var dx = e.changedTouches[0].clientX - startX;
				if (Math.abs(dx) > 40) {
					dx < 0 ? next() : prev();
					restart();
				}
				startX = null;
			},
			{ passive: true },
		);

		go(0);
		startAuto();
	}

	function initAll() {
		var nodes = document.querySelectorAll(".product-showcase-slider");
		for (var i = 0; i < nodes.length; i++) initSlider(nodes[i]);
	}

	if (document.readyState !== "loading") initAll();
	else document.addEventListener("DOMContentLoaded", initAll);
})();
