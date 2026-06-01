(function () {
	gsap.registerPlugin(ScrollTrigger);

	var MOBILE_BREAKPOINT = 768;

	window.addEventListener("load", function () {
		// Skip mask reveal on mobile — clip-path animation disabled below
		// breakpoint. Image/video shown unmasked.
		if (window.innerWidth < MOBILE_BREAKPOINT) {
			document.querySelectorAll(".mask-reveal-row .mask-reveal").forEach(
				function (el) {
					el.style.clipPath = "none";
				},
			);
			return;
		}

		var rows = document.querySelectorAll(".mask-reveal-row");
		if (!rows.length) return;

		// Start crop values (must match _mask-reveal.scss initial clip-path)
		var X_START = 30;
		var Y_TOP_START = 20;
		var Y_BOTTOM_START = 30;
		var TOP_PX_OFFSET = 150; // subtracted from top inset → extends mask up
		var BOTTOM_PX_OFFSET = 300; // subtracted from bottom inset → extends mask down

		// How long the pin holds — multiplier of viewport height.
		// Higher = slower reveal / longer scroll lock.
		var PIN_LENGTH = 1.5;

		rows.forEach(function (row) {
			// Animate clip-path on .mask-reveal container — works for image,
			// video, and iframe modules without nesting conflicts.
			var img = row.querySelector(".mask-reveal");
			if (!img) return;

			var state = {
				x: X_START,
				yTop: Y_TOP_START,
				yBottom: Y_BOTTOM_START,
			};

			gsap.to(state, {
				x: 0,
				yTop: 0,
				yBottom: 0,
				ease: "none",
				scrollTrigger: {
					trigger: row,
					pin: true,
					pinSpacing: true,
					start: "top top",
					end: function () {
						return "+=" + window.innerHeight * PIN_LENGTH;
					},
					scrub: true,
					anticipatePin: 1,
					invalidateOnRefresh: true,
				},
				onUpdate: function () {
					// Asymmetric top/bottom insets with pixel offsets → taller mask.
					img.style.clipPath =
						"inset(calc(" +
						state.yTop +
						"% - " +
						TOP_PX_OFFSET +
						"px) " +
						state.x +
						"% calc(" +
						state.yBottom +
						"% - " +
						BOTTOM_PX_OFFSET +
						"px) " +
						state.x +
						"% round 30px)";
				},
			});
		});

		ScrollTrigger.refresh();
	});
})();
