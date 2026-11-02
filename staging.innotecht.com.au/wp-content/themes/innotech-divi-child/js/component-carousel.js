// Slot-machine carousel for .component-carousell-slider-wrapper.
// Desktop: menu buttons (.carousel-menu-container) drive slides.
// Mobile (≤768px): nav arrows + counter rendered inside wrapper.
(function () {
	"use strict";

	function init() {
		document
			.querySelectorAll(".component-carousell-slider-wrapper")
			.forEach(setup);
	}

	function setup(wrapper) {
		if (wrapper.dataset.carouselInit === "1") return;
		wrapper.dataset.carouselInit = "1";

		var rows = Array.prototype.slice.call(
			wrapper.querySelectorAll(":scope > .component-carousell-slider, :scope > .et_pb_row.component-carousell-slider"),
		);
		if (rows.length < 2) return;

		var viewport = document.createElement("div");
		viewport.className = "component-carousell-viewport";
		var track = document.createElement("div");
		track.className = "component-carousell-track";

		rows[0].parentNode.insertBefore(viewport, rows[0]);
		viewport.appendChild(track);
		rows.forEach(function (row) {
			track.appendChild(row);
		});

		var menu = document.querySelector(".carousel-menu-container");
		var buttons = menu
			? menu.querySelectorAll(
					".et_pb_button, button, a[class*='-btn']",
			  )
			: [];
		buttons = Array.prototype.slice.call(buttons).slice(0, rows.length);

		// Mobile arrow nav — appended to .carousel-menu-container so it
		// replaces the desktop menu in the same on-page slot. Visibility
		// toggled via SCSS @media.
		var navWrap = document.createElement("div");
		navWrap.className = "component-carousell-nav";
		navWrap.innerHTML =
			'<button type="button" class="component-carousell-nav__btn component-carousell-nav__btn--prev" aria-label="Previous">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
			"</button>" +
			'<div class="component-carousell-nav__count"><span class="component-carousell-nav__cur">1</span> / <span class="component-carousell-nav__total">' +
			rows.length +
			"</span></div>" +
			'<button type="button" class="component-carousell-nav__btn component-carousell-nav__btn--next" aria-label="Next">' +
			'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
			"</button>";
		(menu || wrapper).appendChild(navWrap);

		var prevBtn = navWrap.querySelector(".component-carousell-nav__btn--prev");
		var nextBtn = navWrap.querySelector(".component-carousell-nav__btn--next");
		var curEl = navWrap.querySelector(".component-carousell-nav__cur");

		var current = 0;

		function rowH(i) {
			return rows[i] ? rows[i].offsetHeight : 0;
		}

		function go(i) {
			if (i < 0) i = rows.length - 1;
			if (i >= rows.length) i = 0;
			current = i;
			var targetY = 0;
			for (var k = 0; k < i; k++) targetY -= rowH(k);

			if (typeof gsap !== "undefined") {
				gsap.to(track, {
					y: targetY,
					duration: 0.85,
					ease: "power3.inOut",
				});
				gsap.to(viewport, {
					height: rowH(i),
					duration: 0.85,
					ease: "power3.inOut",
				});
			} else {
				track.style.transform = "translateY(" + targetY + "px)";
				viewport.style.height = rowH(i) + "px";
			}

			buttons.forEach(function (b, idx) {
				b.classList.toggle("active", idx === i);
			});
			if (curEl) curEl.textContent = i + 1;
		}

		buttons.forEach(function (b, i) {
			b.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				go(i);
			});
		});

		prevBtn.addEventListener("click", function () {
			go(current - 1);
		});
		nextBtn.addEventListener("click", function () {
			go(current + 1);
		});

		if (buttons.length) buttons[0].classList.add("active");
		viewport.style.height = rowH(0) + "px";

		new ResizeObserver(function () {
			var y = 0;
			for (var k = 0; k < current; k++) y -= rowH(k);
			if (typeof gsap !== "undefined") {
				gsap.set(track, { y: y });
			} else {
				track.style.transform = "translateY(" + y + "px)";
			}
			viewport.style.height = rowH(current) + "px";
		}).observe(track);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	new MutationObserver(init).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
