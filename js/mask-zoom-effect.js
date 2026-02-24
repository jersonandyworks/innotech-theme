(function () {
	gsap.registerPlugin(ScrollTrigger);

	window.addEventListener("load", function () {
		var section = document.getElementById("section8");
		if (!section) return;

		var pinCreated = false;

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

			var END_DISTANCE = window.innerHeight * 10;

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
					// reset mask to resting size when scrolled back above section
					setMaskSize(W_START, H_START);
					resumeAnim();
				},

				// self.progress 0→1 maps mask-size from start→max
				onUpdate: function (self) {
					var p = self.progress;
					setMaskSize(
						W_START + (W_END - W_START) * p,
						H_START + (H_END - H_START) * p,
					);
				},
			});

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
