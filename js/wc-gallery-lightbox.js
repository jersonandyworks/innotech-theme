(function () {
	"use strict";

	var hasGsap = typeof gsap !== "undefined";
	var URLS = [];
	var LB = null;
	var IMG = null;
	var WRAP = null;
	var COUNTER = null;
	var CURRENT = 0;
	var IS_OPEN = false;

	function rebuild(gallery) {
		if (gallery.dataset.innotechRebuilt === "1") return null;
		var items = gallery.querySelectorAll(".woocommerce-product-gallery__image");
		if (!items.length) return null;
		gallery.dataset.innotechRebuilt = "1";

		var urls = [];
		items.forEach(function (item) {
			var a = item.querySelector("a");
			var img = item.querySelector("img");
			var full =
				(a && a.getAttribute("href")) ||
				(img && img.getAttribute("data-large_image")) ||
				(img && img.getAttribute("src"));
			// Use the full-size image for thumbnails too — browser downsamples
			// crisply at the displayed size. Avoids the 100x100 pixelated WC
			// `data-thumb` value. CSS `aspect-ratio + object-fit: cover` clips.
			var thumb = full;
			var alt = (img && img.getAttribute("alt")) || "";
			urls.push({ full: full, thumb: thumb, alt: alt });
		});
		if (!urls.length) return null;

		gallery.innerHTML = "";
		gallery.classList.add("innotech-product-gallery");
		gallery.style.opacity = "1";

		var main = document.createElement("button");
		main.type = "button";
		main.className = "innotech-product-gallery__main";
		main.dataset.index = "0";
		main.innerHTML =
			'<img class="innotech-product-gallery__main-img" src="' +
			urls[0].full + '" alt="' + urls[0].alt + '">';
		gallery.appendChild(main);

		if (urls.length > 1) {
			var grid = document.createElement("div");
			grid.className = "innotech-product-gallery__thumbs";
			for (var i = 1; i < urls.length; i++) {
				var btn = document.createElement("button");
				btn.type = "button";
				btn.className = "innotech-product-gallery__thumb";
				btn.dataset.index = String(i);
				btn.innerHTML =
					'<img src="' + (urls[i].thumb || urls[i].full) + '" alt="' + urls[i].alt + '">';
				grid.appendChild(btn);
			}
			gallery.appendChild(grid);

			// Smooth-scroll thumbs back to top when mouse leaves the gallery
			// or focus moves out, so the partially-hidden state is restored.
			attachAutoScrollReset();
		}

		return urls;
	}

	// Document-level scroll-reset tracker. Works even if gallery wrapper is
	// replaced by Divi/WC mid-session (per-element listeners would be lost).
	var SR_STATE = {
		inside: false,
		leaveTimer: null,
		rafId: null,
		attached: false,
	};

	function srGetThumbs() {
		return document.querySelector(".innotech-product-gallery__thumbs");
	}

	function srAnimate(target, duration) {
		var thumbs = srGetThumbs();
		if (!thumbs) return;
		if (SR_STATE.rafId) cancelAnimationFrame(SR_STATE.rafId);
		var start = thumbs.scrollTop;
		var change = target - start;
		if (Math.abs(change) < 1) return;
		var t0 = performance.now();
		function tick(now) {
			var p = Math.min(1, (now - t0) / duration);
			var eased = 1 - Math.pow(1 - p, 3);
			thumbs.scrollTop = start + change * eased;
			if (p < 1) SR_STATE.rafId = requestAnimationFrame(tick);
			else SR_STATE.rafId = null;
		}
		SR_STATE.rafId = requestAnimationFrame(tick);
	}

	function srScrollToTop() {
		var thumbs = srGetThumbs();
		if (!thumbs || thumbs.scrollTop <= 0) return;
		srAnimate(0, 600);
	}

	function srSchedule() {
		if (SR_STATE.leaveTimer) clearTimeout(SR_STATE.leaveTimer);
		SR_STATE.leaveTimer = setTimeout(srScrollToTop, 200);
	}

	function srCancel() {
		if (SR_STATE.leaveTimer) {
			clearTimeout(SR_STATE.leaveTimer);
			SR_STATE.leaveTimer = null;
		}
		if (SR_STATE.rafId) {
			cancelAnimationFrame(SR_STATE.rafId);
			SR_STATE.rafId = null;
		}
	}

	function attachAutoScrollReset() {
		if (SR_STATE.attached) return;
		SR_STATE.attached = true;
		// Document-level delegation — survives gallery DOM rebuild by Divi/WC.

		// Use bubbling mouseover/mouseout — bubble lets us delegate from
		// document regardless of gallery DOM identity.
		document.addEventListener("mouseover", function (e) {
			var inGallery = !!e.target.closest(".innotech-product-gallery");
			if (inGallery && !SR_STATE.inside) {
				SR_STATE.inside = true;
				srCancel();
			}
		});
		document.addEventListener("mouseout", function (e) {
			var leftGallery =
				!!e.target.closest(".innotech-product-gallery") &&
				!(e.relatedTarget && e.relatedTarget.closest(".innotech-product-gallery"));
			if (leftGallery && SR_STATE.inside) {
				SR_STATE.inside = false;
				srSchedule();
			}
		});
		document.addEventListener("focusin", function (e) {
			if (e.target.closest(".innotech-product-gallery")) srCancel();
		});
		document.addEventListener("focusout", function (e) {
			var leftGallery =
				e.target.closest(".innotech-product-gallery") &&
				!(e.relatedTarget && e.relatedTarget.closest(".innotech-product-gallery"));
			if (leftGallery) srSchedule();
		});
	}

	function buildLightbox() {
		var lb = document.createElement("div");
		lb.className = "innotech-lightbox";
		lb.style.cssText = [
			"position:fixed",
			"inset:0",
			"background:rgba(0,5,27,0.95)",
			"-webkit-backdrop-filter:blur(8px)",
			"backdrop-filter:blur(8px)",
			"z-index:999999",
			"display:flex",
			"align-items:center",
			"justify-content:center",
			"opacity:0",
			"visibility:hidden",
			"pointer-events:none",
		].join(";");
		lb.innerHTML =
			'<button class="innotech-lightbox__close" aria-label="Close">' +
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
			"</button>" +
			'<button class="innotech-lightbox__nav innotech-lightbox__nav--prev" aria-label="Previous">' +
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>' +
			"</button>" +
			'<button class="innotech-lightbox__nav innotech-lightbox__nav--next" aria-label="Next">' +
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>' +
			"</button>" +
			'<div class="innotech-lightbox__img-wrap"><img class="innotech-lightbox__img" alt=""/></div>' +
			'<div class="innotech-lightbox__counter"></div>';
		document.body.appendChild(lb);
		return lb;
	}

	function show(i, animate) {
		if (!URLS.length) return;
		CURRENT = (i + URLS.length) % URLS.length;
		COUNTER.textContent = CURRENT + 1 + " / " + URLS.length;
		if (hasGsap && animate) {
			gsap.fromTo(
				IMG,
				{ opacity: 0, scale: 0.95 },
				{
					opacity: 1,
					scale: 1,
					duration: 0.35,
					ease: "power2.out",
					onStart: function () {
						IMG.src = URLS[CURRENT].full;
						IMG.alt = URLS[CURRENT].alt;
					},
				},
			);
		} else {
			IMG.src = URLS[CURRENT].full;
			IMG.alt = URLS[CURRENT].alt;
		}
	}

	function open(i) {
		if (IS_OPEN || !LB) return;
		IS_OPEN = true;
		LB.style.visibility = "visible";
		LB.style.pointerEvents = "auto";
		document.body.style.overflow = "hidden";

		show(i, false);

		if (hasGsap) {
			gsap.fromTo(
				LB,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.3, ease: "power2.out" },
			);
			gsap.fromTo(
				WRAP,
				{ scale: 0.85, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.45,
					ease: "back.out(1.4)",
					delay: 0.05,
				},
			);
		} else {
			LB.style.opacity = "1";
		}
	}

	function close() {
		if (!IS_OPEN || !LB) return;
		IS_OPEN = false;
		document.body.style.overflow = "";

		if (hasGsap) {
			gsap.to(WRAP, {
				scale: 0.9,
				opacity: 0,
				duration: 0.25,
				ease: "power2.in",
			});
			gsap.to(LB, {
				opacity: 0,
				duration: 0.3,
				ease: "power2.in",
				onComplete: function () {
					LB.style.visibility = "hidden";
					LB.style.pointerEvents = "none";
				},
			});
		} else {
			LB.style.opacity = "0";
			LB.style.visibility = "hidden";
			LB.style.pointerEvents = "none";
		}
	}

	function attachLightboxHandlers() {
		LB.querySelector(".innotech-lightbox__close").addEventListener("click", close);
		LB.querySelector(".innotech-lightbox__nav--prev").addEventListener(
			"click",
			function () {
				show(CURRENT - 1, true);
			},
		);
		LB.querySelector(".innotech-lightbox__nav--next").addEventListener(
			"click",
			function () {
				show(CURRENT + 1, true);
			},
		);
		LB.addEventListener("click", function (e) {
			if (e.target === LB || e.target === WRAP) close();
		});
	}

	function setupGallery(gallery) {
		var urls = rebuild(gallery);
		if (!urls || !urls.length) return false;
		URLS = urls;
		if (!LB) {
			LB = buildLightbox();
			IMG = LB.querySelector(".innotech-lightbox__img");
			WRAP = LB.querySelector(".innotech-lightbox__img-wrap");
			COUNTER = LB.querySelector(".innotech-lightbox__counter");
			attachLightboxHandlers();
		}
		return true;
	}

	function tryInit() {
		var galleries = document.querySelectorAll(".woocommerce-product-gallery");
		var ok = false;
		galleries.forEach(function (g) {
			if (g.dataset.innotechRebuilt !== "1") {
				if (setupGallery(g)) ok = true;
			}
		});
		return ok;
	}

	// Document-level delegated click — survives any gallery DOM rebuild.
	document.addEventListener(
		"click",
		function (e) {
			var t = e.target.closest(
				".innotech-product-gallery__main, .innotech-product-gallery__thumb",
			);
			if (!t) return;
			e.preventDefault();
			e.stopPropagation();
			var idx = parseInt(t.dataset.index, 10) || 0;
			open(idx);
		},
		true,
	);

	document.addEventListener("keydown", function (e) {
		if (!IS_OPEN) return;
		if (e.key === "Escape") close();
		else if (e.key === "ArrowLeft") show(CURRENT - 1, true);
		else if (e.key === "ArrowRight") show(CURRENT + 1, true);
	});

	function init() {
		tryInit();
		// Divi WC may render/swap gallery after DOMContentLoaded — observe long.
		var observer = new MutationObserver(function () {
			tryInit();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	window.addEventListener("load", tryInit);
})();
