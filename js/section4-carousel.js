// Mobile-only carousel for #section4. Each .innotech-nested-item becomes
// a slide. Image stays pinned at top above the carousel.
(function () {
	"use strict";
	var BREAKPOINT = 980;
	var STATE = { built: false, viewport: null, track: null, nav: null, items: [], origins: [], current: 0 };

	function getRoot() {
		return document.querySelector("#section4 .pin-wrap");
	}

	function build() {
		if (STATE.built) return;
		var root = getRoot();
		if (!root) return;

		var items = Array.prototype.slice.call(
			root.querySelectorAll(".innotech-nested-item"),
		);
		if (items.length < 2) return;

		// Remember each item's original parent so we can restore on desktop.
		STATE.origins = items.map(function (el) {
			return { el: el, parent: el.parentNode, next: el.nextSibling };
		});

		var viewport = document.createElement("div");
		viewport.className = "section4-carousel__viewport";
		var track = document.createElement("div");
		track.className = "section4-carousel__track";
		viewport.appendChild(track);

		items.forEach(function (item) {
			var slide = document.createElement("div");
			slide.className = "section4-carousel__slide";
			slide.appendChild(item);
			track.appendChild(slide);
		});

		var nav = document.createElement("div");
		nav.className = "section4-carousel__nav";
		nav.innerHTML =
			'<button type="button" class="section4-carousel__btn section4-carousel__btn--prev" aria-label="Previous">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
			"</button>" +
			'<div class="section4-carousel__count"><span class="section4-carousel__cur">1</span> / <span class="section4-carousel__total">' +
			items.length +
			"</span></div>" +
			'<button type="button" class="section4-carousel__btn section4-carousel__btn--next" aria-label="Next">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
			"</button>";

		root.appendChild(viewport);
		root.appendChild(nav);

		var prev = nav.querySelector(".section4-carousel__btn--prev");
		var next = nav.querySelector(".section4-carousel__btn--next");
		var curEl = nav.querySelector(".section4-carousel__cur");
		STATE.current = 0;

		var slides = track.querySelectorAll(".section4-carousel__slide");

		function syncHeight() {
			var active = slides[STATE.current];
			if (!active) return;
			viewport.style.height = active.offsetHeight + "px";
		}

		function go(i) {
			if (i < 0) i = items.length - 1;
			if (i >= items.length) i = 0;
			STATE.current = i;
			track.style.transform = "translateX(" + -i * 100 + "%)";
			curEl.textContent = i + 1;
			syncHeight();
		}

		// Initial height + observer to handle image-load reflows.
		syncHeight();
		var ro = new ResizeObserver(syncHeight);
		slides.forEach(function (s) {
			ro.observe(s);
		});
		STATE.resizeObserver = ro;

		// Autoplay — advances every AUTOPLAY_MS. Stops permanently on first
		// user interaction so taps on links/buttons inside slides land.
		var AUTOPLAY_MS = 4500;
		STATE.autoplayStopped = false;
		STATE.autoplay = setInterval(function () {
			if (STATE.autoplayStopped) return;
			if (document.hidden) return;
			go(STATE.current + 1);
		}, AUTOPLAY_MS);

		function stopAutoplay() {
			STATE.autoplayStopped = true;
			if (STATE.autoplay) {
				clearInterval(STATE.autoplay);
				STATE.autoplay = null;
			}
		}
		// Document-level listeners so taps anywhere inside section4 stop autoplay,
		// even on translated/off-screen slide content.
		var section4 = document.getElementById("section4");
		(section4 || viewport).addEventListener("pointerdown", stopAutoplay, true);
		(section4 || viewport).addEventListener("touchstart", stopAutoplay, true);
		(section4 || viewport).addEventListener("click", stopAutoplay, true);
		prev.addEventListener("click", function () {
			go(STATE.current - 1);
		});
		next.addEventListener("click", function () {
			go(STATE.current + 1);
		});

		// Swipe.
		var startX = null;
		viewport.addEventListener(
			"touchstart",
			function (e) {
				startX = e.touches[0].clientX;
			},
			{ passive: true },
		);
		viewport.addEventListener(
			"touchend",
			function (e) {
				if (startX == null) return;
				var dx = e.changedTouches[0].clientX - startX;
				if (Math.abs(dx) > 40) go(STATE.current + (dx < 0 ? 1 : -1));
				startX = null;
			},
			{ passive: true },
		);

		STATE.built = true;
		STATE.viewport = viewport;
		STATE.track = track;
		STATE.nav = nav;
		STATE.items = items;
	}

	function destroy() {
		if (!STATE.built) return;
		// Move each item back to original parent so desktop layout restores.
		STATE.origins.forEach(function (o) {
			if (o.next && o.next.parentNode === o.parent) {
				o.parent.insertBefore(o.el, o.next);
			} else {
				o.parent.appendChild(o.el);
			}
		});
		if (STATE.resizeObserver) {
			STATE.resizeObserver.disconnect();
			STATE.resizeObserver = null;
		}
		if (STATE.autoplay) {
			clearInterval(STATE.autoplay);
			STATE.autoplay = null;
		}
		if (STATE.viewport) STATE.viewport.remove();
		if (STATE.nav) STATE.nav.remove();
		STATE.built = false;
		STATE.viewport = null;
		STATE.track = null;
		STATE.nav = null;
		STATE.items = [];
		STATE.origins = [];
	}

	function refresh() {
		if (window.innerWidth <= BREAKPOINT) build();
		else destroy();
	}

	function init() {
		setTimeout(refresh, 300);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	window.addEventListener("load", init);

	var t;
	window.addEventListener("resize", function () {
		clearTimeout(t);
		t = setTimeout(refresh, 200);
	});
})();
