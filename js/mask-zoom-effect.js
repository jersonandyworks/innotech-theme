(function () {
	gsap.registerPlugin(ScrollTrigger);

	window.addEventListener("load", function () {
		var section = document.getElementById("section8");
		if (!section) return;

		// Mobile/tablet: skip the pin + horizontal slide + mask zoom entirely so
		// the content stacks vertically and stays readable. CSS handles the
		// stacked layout (see _section8-responsive.scss).
		if (window.innerWidth <= 980) return;

		var pinCreated = false;

		// Slide ratios — defined here so they are shared between the immediate
		// gsap.set below and the ScrollTrigger created later inside createPin().
		var X_START_RATIO = 0.785;
		var X_END_RATIO = 0.424;

		// ── Set slide start position IMMEDIATELY on load ───────────────────────
		// Must run before the 600ms MutationObserver delay so the wrapper is
		// already at the correct position when the page first renders.
		var pinContent = section.querySelector(".pin-content-wrapper");
		if (pinContent) {
			gsap.set(pinContent, { x: window.innerWidth * X_START_RATIO });
		}

		// Mask size range (matches _components.scss fallback → user-specified max)
		var W_START = 650,
			W_END = 2980;
		var H_START = 650,
			H_END = 2980;

		// ── CSS-variable helpers ───────────────────────────────────────────────
		function setMaskSize(w, h) {
			section.style.setProperty("--s8-mask-w", w + "px");
			section.style.setProperty("--s8-mask-h", h + "px");
		}

		function setMaskPos(x, y) {
			section.style.setProperty("--s8-mask-x", x + "%");
			section.style.setProperty("--s8-mask-y", y + "%");
		}

		function pauseAnim() {
			section.style.setProperty("--s8-anim-state", "paused");
		}
		function resumeAnim() {
			section.style.setProperty("--s8-anim-state", "running");
		}

		// ── Mouse-follow (mask-position tracks cursor) ─────────────────────────
		var mousePos = { x: 50, y: 50 };

		section.addEventListener("mousemove", function (e) {
			var rect = section.getBoundingClientRect();
			gsap.to(mousePos, {
				x: ((e.clientX - rect.left) / rect.width) * 100,
				y: ((e.clientY - rect.top) / rect.height) * 100,
				duration: 2,
				ease: "power3.out",
				overwrite: true,
				onUpdate: function () {
					setMaskPos(mousePos.x, mousePos.y);
				},
			});
		});

		section.addEventListener("mouseleave", function () {
			gsap.to(mousePos, {
				x: 50,
				y: 50,
				duration: 0.6,
				ease: "power2.out",
				overwrite: true,
				onUpdate: function () {
					setMaskPos(mousePos.x, mousePos.y);
				},
			});
		});

		// ── createPin — called once when side-nav reaches section 8 ───────────
		function createPin() {
			if (pinCreated) return;
			pinCreated = true;

			var END_DISTANCE = window.innerHeight * 8;

			ScrollTrigger.create({
				trigger: "#section8",
				pin: true,
				start: "top top",
				end: "+=" + END_DISTANCE,
				invalidateOnRefresh: true,

				onEnter: pauseAnim,
				onEnterBack: pauseAnim,
				onLeave: resumeAnim,
				onLeaveBack: function () {
					setMaskSize(W_START, H_START);
					resumeAnim();
				},

				onUpdate: function (self) {
					var p = self.progress;
					setMaskSize(
						W_START + (W_END - W_START) * p,
						H_START + (H_END - H_START) * p,
					);
				},
			});

			// ── Horizontal slide for .pin-content-wrapper (locomotive pattern) ─────
			// Each child is 100vw wide; translate the wrapper left by (n-1) × 100vw,
			// scrubbed to the same trigger/start/end as the pin above.
			var pinContent = section.querySelector(".pin-content-wrapper");
			if (pinContent && pinContent.children.length > 1) {
				// X_START_RATIO / X_END_RATIO declared at the top of the load handler

				gsap.to(pinContent, {
					x: function () {
						return -window.innerWidth * X_END_RATIO;
					},
					ease: "none",
					scrollTrigger: {
						trigger: "#section8",
						start: "top top",
						end: "+=" + END_DISTANCE,
						scrub: true,
						invalidateOnRefresh: true,
						onRefresh: function () {
							// Re-apply start position on resize so it stays proportional
							gsap.set(pinContent, { x: window.innerWidth * X_START_RATIO });
						},
					},
				});
			}

			ScrollTrigger.refresh();
		}

		// ── Mirror side-nav.js: find section8's index in the same DOM list ─────
		var allSections = document.querySelectorAll('[id^="section"]');
		var s8Index = -1;
		for (var i = 0; i < allSections.length; i++) {
			if (allSections[i].id === "section8") {
				s8Index = i;
				break;
			}
		}

		// ── Wait for side-nav to initialise (it has a 500 ms delay) ───────────
		setTimeout(function () {
			var navItem =
				s8Index >= 0
					? document.querySelector(
							'.side-nav .nav-item[data-index="' + s8Index + '"]',
						)
					: null;

			if (!navItem) {
				createPin();
				return;
			}

			var observer = new MutationObserver(function () {
				if (navItem.classList.contains("active")) {
					createPin();
					observer.disconnect();
				}
			});
			observer.observe(navItem, {
				attributes: true,
				attributeFilter: ["class"],
			});

			if (navItem.classList.contains("active")) {
				createPin();
				observer.disconnect();
			}
		}, 600);
	});
})();
