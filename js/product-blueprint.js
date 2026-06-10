(function () {
	"use strict";

	// Hotspot config — coords in % relative to image bounds (0–100).
	// `mobile: { terminusX, bendOffset }` is an optional override applied
	// when image width < MOBILE_BREAKPOINT. Desktop/tablet use top-level
	// values unchanged.
	var MOBILE_BREAKPOINT = 768;
	var HOTSPOTS = [
		{
			x: 54,
			y: 26,
			side: "right",
			terminusX: 96,
			bendOffset: 12,
			mobile: { terminusX: 78, bendOffset: 8 },
			number: 2,
			label: "Corrosion Status Display",
		},
		{
			x: 20,
			y: 30,
			side: "left",
			terminusX: -40,
			bendOffset: 12,
			mobile: { terminusX: 4, bendOffset: 8 },
			number: 1,
			label: "LED Indicators",
		},
		{
			x: 68,
			y: 86,
			side: "right",
			terminusX: 96,
			bendOffset: 14,
			bendRise: -1,
			mobile: { terminusX: 78, bendOffset: 8 },
			number: 4,
			label: "External Corrosion Probe",
		},
		{
			x: 4,
			y: 64,
			side: "left",
			terminusX: -40,
			bendOffset: 14,
			bendRise: -1,
			mobile: { terminusX: 4, bendOffset: 8 },
			number: 3,
			label: "Secure Mounting Screws",
		},
	];

	var SVG_NS = "http://www.w3.org/2000/svg";

	function buildHotspot(svg, cards, h, idx) {
		var isRight = h.side === "right";

		var poly = document.createElementNS(SVG_NS, "polyline");
		poly.setAttribute("class", "product-blueprint__line");
		poly.setAttribute("fill", "none");
		svg.appendChild(poly);

		var beacon = document.createElementNS(SVG_NS, "circle");
		beacon.setAttribute("class", "product-blueprint__beacon");
		svg.appendChild(beacon);

		var pulse = document.createElementNS(SVG_NS, "circle");
		pulse.setAttribute("class", "product-blueprint__pulse");
		pulse.setAttribute("fill", "none");
		svg.appendChild(pulse);

		var card = document.createElement("div");
		card.className =
			"product-blueprint__callout-card product-blueprint__callout-card--" +
			(isRight ? "right" : "left");
		card.dataset.num = h.number != null ? h.number : idx + 1;
		card.textContent = h.label;
		cards.appendChild(card);

		return {
			h: h,
			idx: idx,
			isRight: isRight,
			poly: poly,
			beacon: beacon,
			pulse: pulse,
			card: card,
			length: 0,
			beaconR: 4,
		};
	}

	function layoutHotspot(node, W, H) {
		var h = node.h;
		var isRight = node.isRight;

		// Apply mobile override only when below breakpoint; desktop/tablet
		// preserve current long-line config. Use viewport width (not image
		// width) so desktop with a narrow image still gets desktop config.
		var useMobile =
			window.innerWidth < MOBILE_BREAKPOINT && h.mobile;
		var bendOff = useMobile ? h.mobile.bendOffset : h.bendOffset;
		var termX = useMobile ? h.mobile.terminusX : h.terminusX;

		var targetX = (h.x / 100) * W;
		var targetY = (h.y / 100) * H;
		var bendX = targetX + (isRight ? bendOff : -bendOff) * (W / 100);
		// bendRise > 0 → bend ABOVE hotspot (incline up). Negative → below.
		// Multiplier of bendOffset; defaults to 0.55. Override per-hotspot.
		var rise = typeof h.bendRise === "number" ? h.bendRise : 0.55;
		var bendY = targetY - bendOff * rise * (H / 100);
		var endX = (termX / 100) * W;
		var endY = bendY;

		node.poly.setAttribute(
			"points",
			targetX + "," + targetY + " " +
				bendX + "," + bendY + " " +
				endX + "," + endY,
		);

		var r = Math.max(5, W * 0.006);
		node.beaconR = r;
		node.beacon.setAttribute("cx", targetX);
		node.beacon.setAttribute("cy", targetY);
		node.beacon.setAttribute("r", r);

		node.pulse.setAttribute("cx", targetX);
		node.pulse.setAttribute("cy", targetY);
		node.pulse.setAttribute("r", r);

		node.length = node.poly.getTotalLength() || 0;

		node.card.style.left = endX + "px";
		node.card.style.top = endY + "px";
	}

	function init() {
		if (typeof gsap === "undefined") {
			console.warn("[product-blueprint] gsap not available");
			return;
		}

		var container = document.querySelector(".cmap-system-container");
		if (!container) return;
		var imageWrap = container.querySelector(".et_pb_image");
		if (!imageWrap) return;
		if (imageWrap.dataset.blueprintInit === "1") return;
		imageWrap.dataset.blueprintInit = "1";
		imageWrap.classList.add("product-blueprint");

		var svg = document.createElementNS(SVG_NS, "svg");
		svg.setAttribute("class", "product-blueprint__svg-canvas");
		svg.setAttribute("aria-hidden", "true");

		var cards = document.createElement("div");
		cards.className = "product-blueprint__cards";

		var nodes = HOTSPOTS.map(function (h, i) {
			return buildHotspot(svg, cards, h, i);
		});

		imageWrap.appendChild(svg);
		imageWrap.appendChild(cards);

		var timeline = null;
		var pulseTweens = [];

		function applyInitialState() {
			nodes.forEach(function (n) {
				// SVG presentation attrs — set via attr plugin for reliability.
				gsap.set(n.poly, {
					attr: {
						"stroke-dasharray": n.length,
						"stroke-dashoffset": n.length,
					},
				});
				gsap.set(n.beacon, {
					scale: 0,
					opacity: 0,
					transformOrigin: "50% 50%",
					svgOrigin: n.beacon.getAttribute("cx") + " " + n.beacon.getAttribute("cy"),
				});
				gsap.set(n.pulse, {
					scale: 1,
					opacity: 0,
					transformOrigin: "50% 50%",
					svgOrigin: n.pulse.getAttribute("cx") + " " + n.pulse.getAttribute("cy"),
				});
				gsap.set(n.card, {
					xPercent: n.isRight ? 0 : -100,
					yPercent: -50,
					x: n.isRight ? -10 : 10,
					opacity: 0,
				});
			});
		}

		function killPulses() {
			pulseTweens.forEach(function (t) {
				t.kill();
			});
			pulseTweens = [];
			nodes.forEach(function (n) {
				gsap.set(n.pulse, { scale: 1, opacity: 0 });
			});
		}

		function startPulses() {
			killPulses();
			nodes.forEach(function (n, i) {
				// Re-bake the scale origin from the CURRENT circle centre so the
				// pulse stays centred after any relayout (cx/cy can shift slightly
				// once the responsive image/scrollbar settles).
				gsap.set(n.pulse, {
					transformOrigin: "50% 50%",
					svgOrigin:
						n.pulse.getAttribute("cx") + " " + n.pulse.getAttribute("cy"),
				});
				var t = i * 0.2;
				var tween = gsap.fromTo(
					n.pulse,
					{ scale: 1, opacity: 0.9 },
					{
						scale: 3.5,
						opacity: 0,
						duration: 2,
						delay: t,
						repeat: -1,
						ease: "power2.out",
					},
				);
				pulseTweens.push(tween);
			});
		}

		function relayout() {
			var img = imageWrap.querySelector("img");
			if (!img) return;
			var W = img.clientWidth || imageWrap.clientWidth;
			var H = img.clientHeight || imageWrap.clientHeight;
			if (!W || !H) return;

			svg.setAttribute("viewBox", "0 0 " + W + " " + H);
			svg.setAttribute("width", W);
			svg.setAttribute("height", H);

			nodes.forEach(function (n) {
				layoutHotspot(n, W, H);
			});

			applyInitialState();
		}

		function buildTimeline() {
			var tl = gsap.timeline({ paused: true });
			nodes.forEach(function (n, i) {
				var t = i * 0.2;
				tl.to(
					n.poly,
					{
						attr: { "stroke-dashoffset": 0 },
						duration: 1.1,
						ease: "power2.inOut",
					},
					t,
				)
					.to(
						n.beacon,
						{
							scale: 1,
							opacity: 1,
							duration: 0.4,
							ease: "back.out(2.2)",
						},
						t + 0.6,
					)
					.to(
						n.card,
						{
							x: n.isRight ? 14 : -14,
							opacity: 1,
							duration: 0.5,
							ease: "power3.out",
						},
						t + 0.8,
					);
			});
			return tl;
		}

		// Initial layout — defer to next frame so image dims resolve.
		requestAnimationFrame(function () {
			relayout();
			timeline = buildTimeline();

			var imgEl = imageWrap.querySelector("img");
			if (imgEl && !imgEl.complete) {
				imgEl.addEventListener("load", function () {
					relayout();
				});
			}

			// ScrollTrigger drives forward/reverse on enter / leave-back so
			// lines undraw and hotspots fade out when scrolling up past
			// the section's focus band.
			var section = imageWrap.closest("#section3, .et_pb_section") || imageWrap;

			// Delay before line draw kicks in after entering section (sec).
			var DRAW_DELAY = 0.6;
			var pendingPlay = null;

			function schedulePlay() {
				if (pendingPlay) pendingPlay.kill();
				pendingPlay = gsap.delayedCall(DRAW_DELAY, function () {
					timeline.play();
					startPulses();
					pendingPlay = null;
				});
			}

			function cancelAndReverse() {
				if (pendingPlay) {
					pendingPlay.kill();
					pendingPlay = null;
				}
				timeline.reverse();
				killPulses();
			}

			if (typeof ScrollTrigger !== "undefined") {
				gsap.registerPlugin(ScrollTrigger);
				ScrollTrigger.create({
					trigger: section,
					// Fires only after section top reaches viewport top —
					// user is actively scrolling WITHIN the section, not just past it.
					start: "top top",
					end: "bottom top",
					onEnter: schedulePlay,
					onLeaveBack: cancelAndReverse,
				});
			} else {
				// Fallback: play once section top reaches viewport top.
				var entered = false;
				function check() {
					var r = section.getBoundingClientRect();
					var inside = r.top <= 0 && r.bottom > 0;
					if (inside && !entered) {
						schedulePlay();
						entered = true;
					} else if (!inside && entered && r.top > 0) {
						cancelAndReverse();
						entered = false;
					}
				}
				window.addEventListener("scroll", check, { passive: true });
				check();
			}
		});

		// Resize-aware layout updates (preserves dash progress mid-animation).
		var ro = new ResizeObserver(function () {
			var img = imageWrap.querySelector("img");
			if (!img) return;
			var W = img.clientWidth || imageWrap.clientWidth;
			var H = img.clientHeight || imageWrap.clientHeight;
			if (!W || !H) return;

			svg.setAttribute("viewBox", "0 0 " + W + " " + H);
			svg.setAttribute("width", W);
			svg.setAttribute("height", H);
			var progress = timeline ? timeline.progress() : 0;
			nodes.forEach(function (n) {
				layoutHotspot(n, W, H);
				// Sync dasharray + dashoffset to new length, scaled by current
				// timeline progress so drawn state stays consistent across resize.
				gsap.set(n.poly, {
					attr: {
						"stroke-dasharray": n.length,
						"stroke-dashoffset": n.length * (1 - progress),
					},
				});
			});
			// Restart the pulses so they re-bake their origin on the new centres.
			// (The beacon is timeline-controlled and rests at scale 1, so it needs
			// no origin re-bake — touching it here introduced a small offset.)
			if (pulseTweens.length) startPulses();
		});
		ro.observe(imageWrap);
		var imgEl = imageWrap.querySelector("img");
		if (imgEl) ro.observe(imgEl);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	window.addEventListener("load", init);
})();
