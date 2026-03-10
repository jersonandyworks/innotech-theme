/**
 * Footer Background Sway Effect
 *
 * Creates a smooth, natural swaying illusion on the footer background image
 * by animating an oversized background layer with two independent GSAP tweens
 * (different durations → figure-8 / Lissajous path → no distortion).
 *
 * Targets: div.et_pb_section.et_pb_section_0_tb_footer
 */
(function () {
	"use strict";

	function initFooterBgSway() {
		var section = document.querySelector(
			"div.et_pb_section.et_pb_section_0_tb_footer",
		);
		if (!section) return;

		// Respect user's reduced-motion OS preference
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		// ── 1. Extract the background image URL ───────────────────────────────
		// Divi sets it as an inline style with !important, so read from getAttribute
		var inlineStyle = section.getAttribute("style") || "";
		var bgMatch = inlineStyle.match(
			/background-image\s*:\s*url\(\s*(['"]?)(.+?)\1\s*\)/i,
		);

		// Fallback to computed style if not found inline
		if (!bgMatch) {
			var computed = window.getComputedStyle(section).backgroundImage;
			bgMatch = computed.match(/url\(\s*(['"]?)(.+?)\1\s*\)/i);
		}

		if (!bgMatch) return; // no background image found — bail out

		var bgUrl = bgMatch[2];

		// ── 2. Prepare the section container ──────────────────────────────────
		var pos = window.getComputedStyle(section).position;
		if (pos === "static") section.style.position = "relative";
		// Do NOT set overflow:hidden on the section itself — that can still
		// contribute to page scroll width. The clip wrapper below handles it.

		// ── 3. Clip wrapper — sits flush with the section, owns overflow:hidden ─
		// Because the wrapper has no overflow of its own (inset 0), it never
		// adds to the page scroll width. The bg layer overflows inside the
		// wrapper, which clips it cleanly with no horizontal scrollbar.
		var clipWrapper = document.createElement("div");
		clipWrapper.className = "footer-bg-sway-clip";
		Object.assign(clipWrapper.style, {
			position: "absolute",
			top: "0",
			left: "0",
			right: "0",
			bottom: "0",
			overflow: "hidden",
			zIndex: "0",
			pointerEvents: "none",
		});

		// ── 4. Build the animated background layer ────────────────────────────
		// Oversized by 40px on every side — larger than max travel (22px x, 14px y)
		// so edges are never revealed. Lives inside the clip wrapper.
		var bgLayer = document.createElement("div");
		bgLayer.className = "footer-bg-sway-layer";
		Object.assign(bgLayer.style, {
			position: "absolute",
			top: "-40px",
			left: "-40px",
			right: "-40px",
			bottom: "-40px",
			backgroundImage: "url(" + bgUrl + ")",
			backgroundSize: "cover",
			backgroundPosition: "center",
			willChange: "transform",
			pointerEvents: "none",
		});

		clipWrapper.appendChild(bgLayer);

		// ── 5. Strip the original background-image from the section ──────────
		// Removes only the background-image declaration so other inline styles
		// (padding, etc.) set by Divi remain intact.
		var cleanedStyle = inlineStyle
			.replace(/background-image\s*:[^;]+;?\s*/gi, "")
			.trim();
		section.setAttribute("style", cleanedStyle);

		// ── 6. Insert clip wrapper as the first child of the section ──────────
		section.insertBefore(clipWrapper, section.firstChild);

		// ── 7. Elevate existing Divi children above the clip wrapper ──────────
		Array.from(section.children).forEach(function (child) {
			if (child === clipWrapper) return;
			var childPos = window.getComputedStyle(child).position;
			if (childPos === "static") child.style.position = "relative";
			// Only set z-index if not already explicitly set
			if (!child.style.zIndex) child.style.zIndex = "1";
		});

		// ── 7. Animate — four independent tweens for a fog-wave feel ─────────────
		// Each tween runs a different axis with a prime-ish duration so the combined
		// path never exactly repeats — produces an endless, organic wave-roll.
		// All transforms are GPU-composited; the image is never warped or distorted.
		// The bgLayer has 40px buffer on every side, safely containing all travel.

		// Primary horizontal wave — 10 s main cycle
		gsap.to(bgLayer, {
			x: 30,
			duration: 0.5,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});

		// Secondary vertical wave — different period creates cross-roll
		gsap.to(bgLayer, {
			y: 18,
			duration: 5,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});

		// Rotation — the key ingredient for a "waving" roll feel.
		// 0.8 ° is imperceptible as tilt but reads as motion at the edges.
		// At a ~2000 px layer width, corner shift ≈ 28 px — within the 40 px buffer.
		gsap.to(bgLayer, {
			rotation: 5,
			duration: 3,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});

		// Breathing scale — very subtle depth pulse, like fog thickening/thinning
		gsap.to(bgLayer, {
			scale: 3.03,
			duration: 5,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});
	}

	// Wait for DOM if needed
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initFooterBgSway);
	} else {
		initFooterBgSway();
	}
})();
