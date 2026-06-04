(function () {
	"use strict";

	function syncOverlay(v) {
		var wrap = v.closest(".innotech-product-video");
		if (!wrap) return;
		if (v.paused || v.ended) {
			wrap.classList.remove("is-playing");
		} else {
			wrap.classList.add("is-playing");
		}
	}

	function toggle(vid) {
		if (vid.paused) {
			var p = vid.play();
			if (p && typeof p.catch === "function") p.catch(function () {});
		} else {
			vid.pause();
		}
	}

	document.addEventListener("click", function (e) {
		var btn = e.target.closest(".innotech-product-video__play");
		if (btn) {
			var wrap = btn.closest(".innotech-product-video");
			var vid = wrap && wrap.querySelector(".innotech-product-video__media");
			if (vid) toggle(vid);
			return;
		}
		// Click directly on the playing video pauses it.
		var media = e.target.closest(".innotech-product-video__media");
		if (media) toggle(media);
	});

	// Document-level media events — covers dynamically-added videos.
	["play", "pause", "ended"].forEach(function (ev) {
		document.addEventListener(
			ev,
			function (e) {
				var v = e.target;
				if (!v.classList || !v.classList.contains("innotech-product-video__media")) return;
				v.controls = false;
				syncOverlay(v);
			},
			true,
		);
	});
})();
