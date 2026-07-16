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

		// Homepage keeps the original hand-tuned translate ratios — its §8
		// composes with other homepage-only transforms, so measurement-based
		// values regress it. Internal pages (Industries etc. reuse this template
		// with #section8 inside a centred 1440px row, ~1200px right of the
		// homepage geometry) compute from the wrapper's measured offset instead:
		//   pin START → slide 1 sits at 0.29 × vw, which centres its 30%-wide
		//               "Contact our sales team…" heading in the viewport
		//   pin END   → slide 2 lands at 0.09 × vw: its copy card starts right
		//               of the GET IN TOUCH eyebrow (no overlap), and slide 1's
		//               heading has fully exited off the left edge
		var isHome = document.body.classList.contains("home");
		var X_START_RATIO = 0.785;
		var X_END_RATIO = 0.424;
		var CHILD1_START_LEFT = 0.29;
		var CHILD2_END_LEFT = 0.09;

		var pinContent = section.querySelector(".pin-content-wrapper");

		function naturalLeft() {
			// Wrapper's untransformed viewport-left (subtract the current tween x).
			var x = parseFloat(gsap.getProperty(pinContent, "x")) || 0;
			return pinContent.getBoundingClientRect().left - x;
		}
		function slideStartX() {
			if (isHome) return window.innerWidth * X_START_RATIO;
			// Centre slide 1's heading in the viewport by measuring it, so the
			// start position stays correct whatever width/size the heading has.
			var slide1 = pinContent.children[0];
			var h1 = slide1 && slide1.querySelector("h1, .et_pb_module_heading");
			if (h1) {
				var padLeft = parseFloat(getComputedStyle(slide1).paddingLeft) || 0;
				var w = h1.getBoundingClientRect().width;
				return (window.innerWidth - w) / 2 - padLeft - naturalLeft();
			}
			return window.innerWidth * CHILD1_START_LEFT - naturalLeft();
		}
		function slideEndX() {
			if (isHome) return -window.innerWidth * X_END_RATIO;
			// Slide 2 sits one viewport-width after slide 1 inside the wrapper.
			return (
				window.innerWidth * CHILD2_END_LEFT -
				naturalLeft() -
				window.innerWidth
			);
		}

		// ── Set slide start position IMMEDIATELY on load ───────────────────────
		// Must run before the 600ms MutationObserver delay so the wrapper is
		// already at the correct position when the page first renders.
		if (pinContent) {
			gsap.set(pinContent, { x: slideStartX() });
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
			// slideStartX / slideEndX are declared at the top of the load handler.
			if (pinContent && pinContent.children.length > 1) {
				gsap.to(pinContent, {
					x: slideEndX,
					ease: "none",
					scrollTrigger: {
						trigger: "#section8",
						start: "top top",
						end: "+=" + END_DISTANCE,
						scrub: true,
						invalidateOnRefresh: true,
						onRefresh: function () {
							// Re-apply start position on resize so it stays proportional
							gsap.set(pinContent, { x: slideStartX() });
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
