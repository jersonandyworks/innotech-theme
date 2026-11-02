(function () {
	"use strict";

	// Videos inside the --native-controls variant keep the browser chrome;
	// we only manage the initial play overlay for them.
	function hasNativeControls(v) {
		return !!v.closest(".innotech-product-video--native-controls");
	}

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
			// QA: play WITH sound — user-initiated playback is allowed to be
			// audible; clear any muted state left by autoplay helpers or the
			// browser restoring a previous session.
			vid.muted = false;
			vid.removeAttribute("muted");
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
		// Click directly on the playing video pauses it — but not when native
		// controls are on (the browser already handles clicks there).
		var media = e.target.closest(".innotech-product-video__media");
		if (media && !hasNativeControls(media)) toggle(media);
	});

	// Document-level media events — covers dynamically-added videos.
	["play", "pause", "ended"].forEach(function (ev) {
		document.addEventListener(
			ev,
			function (e) {
				var v = e.target;
				if (!v.classList || !v.classList.contains("innotech-product-video__media")) return;
				if (!hasNativeControls(v)) v.controls = false;
				syncOverlay(v);
			},
			true,
		);
	});
})();
