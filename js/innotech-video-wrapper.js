// Styling + play overlay for Divi Video modules carrying class
// .innotech-product-video-wrapper. Injects a centered play button, hides
// native controls, and binds play/pause/ended → overlay swap.
(function () {
	"use strict";

	function getIcon() {
		// Derive theme root from any asset URL that contains it. Match
		// up-to-and-including `/innotech-divi-child/` so we don't get fooled
		// by stylesheets nested in submodule folders.
		var links = document.querySelectorAll(
			'link[rel="stylesheet"][href*="innotech-divi-child"], script[src*="innotech-divi-child"]',
		);
		var themeRoot = "";
		for (var i = 0; i < links.length; i++) {
			var url = links[i].href || links[i].src || "";
			var m = url.match(/^(.*\/themes\/innotech-divi-child)\//);
			if (m) {
				themeRoot = m[1];
				break;
			}
		}
		if (!themeRoot) themeRoot = "/wp-content/themes/innotech-divi-child";
		return themeRoot + "/_assets/icn-video-play.png";
	}

	function decorate(wrap) {
		if (wrap.dataset.innotechVidBound === "1") return;
		wrap.dataset.innotechVidBound = "1";

		var vid = wrap.querySelector("video");
		if (!vid) return;

		// Strip native chrome.
		vid.removeAttribute("controls");
		vid.controls = false;
		vid.playsInline = true;
		vid.setAttribute("playsinline", "");

		// Inject play overlay.
		var btn = document.createElement("button");
		btn.type = "button";
		btn.className = "innotech-product-video-wrapper__play";
		btn.setAttribute("aria-label", "Play video");
		var img = document.createElement("img");
		img.src = getIcon();
		img.alt = "";
		img.width = 80;
		img.height = 80;
		img.className = "innotech-product-video-wrapper__play-icon";
		btn.appendChild(img);
		wrap.appendChild(btn);
	}

	function toggle(vid) {
		if (vid.paused) {
			var p = vid.play();
			if (p && typeof p.catch === "function") p.catch(function () {});
		} else {
			vid.pause();
		}
	}

	function syncOverlay(vid) {
		var wrap = vid.closest(".innotech-product-video-wrapper");
		if (!wrap) return;
		if (vid.paused || vid.ended) wrap.classList.remove("is-playing");
		else wrap.classList.add("is-playing");
	}

	function scan() {
		document
			.querySelectorAll(".innotech-product-video-wrapper")
			.forEach(decorate);
	}

	document.addEventListener("click", function (e) {
		var btn = e.target.closest(".innotech-product-video-wrapper__play");
		if (btn) {
			var wrap = btn.closest(".innotech-product-video-wrapper");
			var vid = wrap && wrap.querySelector("video");
			if (vid) toggle(vid);
			return;
		}
		// Click on the video itself toggles too.
		var media = e.target.closest(".innotech-product-video-wrapper video");
		if (media) toggle(media);
	});

	["play", "pause", "ended"].forEach(function (ev) {
		document.addEventListener(
			ev,
			function (e) {
				var v = e.target;
				if (!v || v.tagName !== "VIDEO") return;
				if (!v.closest(".innotech-product-video-wrapper")) return;
				v.controls = false;
				syncOverlay(v);
			},
			true,
		);
	});

	if (document.readyState !== "loading") scan();
	else document.addEventListener("DOMContentLoaded", scan);
	window.addEventListener("load", scan);
	new MutationObserver(scan).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
