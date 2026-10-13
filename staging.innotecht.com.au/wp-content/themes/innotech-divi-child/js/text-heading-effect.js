(function () {
	document.addEventListener("DOMContentLoaded", function () {
		const headings = document.querySelectorAll(".text-heading-effect-1");

		if (!headings.length) return;

		headings.forEach((heading) => {
			// Split text into characters
			const split = new SplitType(heading, { types: "chars" });
			const chars = split.chars;

			// Set initial state
			gsap.set(chars, {
				opacity: 0,
				filter: "blur(15px)",
				letterSpacing: "20px",
			});

			// Entrance animation
			gsap.to(chars, {
				opacity: 1,
				filter: "blur(0px)",
				letterSpacing: "0px",
				duration: 1.4,
				ease: "expo.out",
				stagger: {
					each: 0.06,
					from: "start",
				},
				onComplete: () => {
					// Subtle shimmer
					chars.forEach((char) => {
						gsap.to(char, {
							opacity: 0.9,
							duration: 2 + Math.random() * 2,
							repeat: -1,
							yoyo: true,
							ease: "sine.inOut",
							delay: Math.random() * 1.5,
						});
					});
				},
			});
		});
	});
})();
