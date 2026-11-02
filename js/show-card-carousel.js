// Mobile-only carousel for .show-card-container — 1 card per view + arrows.
// Wraps cols in viewport+track on mobile, restores grid on desktop.
(function () {
	"use strict";
	var BREAKPOINT = 600;
	var REGISTRY = new WeakMap();

	function build(row) {
		if (REGISTRY.has(row)) return;
		var cols = Array.prototype.slice.call(
			row.querySelectorAll(":scope > .et_pb_column"),
		);
		if (cols.length < 2) return;

		var viewport = document.createElement("div");
		viewport.className = "show-card-viewport";
		var track = document.createElement("div");
		track.className = "show-card-track";

		row.insertBefore(viewport, cols[0]);
		viewport.appendChild(track);
		cols.forEach(function (c) {
			track.appendChild(c);
		});

		var nav = document.createElement("div");
		nav.className = "show-card-nav";
		nav.innerHTML =
			'<button type="button" class="show-card-nav__btn show-card-nav__btn--prev" aria-label="Previous">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
			"</button>" +
			'<div class="show-card-nav__count"><span class="show-card-nav__cur">1</span> / <span class="show-card-nav__total">' +
			cols.length +
			"</span></div>" +
			'<button type="button" class="show-card-nav__btn show-card-nav__btn--next" aria-label="Next">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
			"</button>";
		row.appendChild(nav);

		var state = { current: 0, viewport: viewport, track: track, nav: nav, cols: cols };
		var prevBtn = nav.querySelector(".show-card-nav__btn--prev");
		var nextBtn = nav.querySelector(".show-card-nav__btn--next");
		var curEl = nav.querySelector(".show-card-nav__cur");

		function go(i) {
			if (i < 0) i = cols.length - 1;
			if (i >= cols.length) i = 0;
			state.current = i;
			track.style.transform = "translateX(" + -i * 100 + "%)";
			curEl.textContent = i + 1;
		}

		prevBtn.addEventListener("click", function () {
			go(state.current - 1);
		});
		nextBtn.addEventListener("click", function () {
			go(state.current + 1);
		});

		// Basic swipe support.
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
				if (Math.abs(dx) > 40) go(state.current + (dx < 0 ? 1 : -1));
				startX = null;
			},
			{ passive: true },
		);

		REGISTRY.set(row, state);
	}

	function destroy(row) {
		var s = REGISTRY.get(row);
		if (!s) return;
		s.cols.forEach(function (c) {
			row.appendChild(c);
		});
		s.viewport.remove();
		s.nav.remove();
		REGISTRY.delete(row);
	}

	function refresh() {
		var rows = document.querySelectorAll(".show-card-container");
		var isMobile = window.innerWidth <= BREAKPOINT;
		rows.forEach(function (row) {
			if (isMobile) build(row);
			else destroy(row);
		});
	}

	if (document.readyState !== "loading") refresh();
	else document.addEventListener("DOMContentLoaded", refresh);
	new MutationObserver(refresh).observe(document.body, {
		childList: true,
		subtree: true,
	});

	var debounceTimer;
	window.addEventListener("resize", function () {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(refresh, 200);
	});
})();
