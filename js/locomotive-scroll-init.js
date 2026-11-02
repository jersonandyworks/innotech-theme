(function () {
	gsap.registerPlugin(ScrollTrigger);

	window.addEventListener("load", function () {
		var pinWrap = document.querySelector(".pin-wrap");
		if (!pinWrap) return;

		// Scroll until 3/4 of the 2nd child is off-screen (1/4 still visible)
		var secondChild = pinWrap.children[1];
		var horizontalScrollLength =
			secondChild.offsetLeft + secondChild.offsetWidth * 0.65;

		// Fade out .dot-nav just before the pin scroll starts. The text column
		// slides left over the label as soon as the pin engages (~2.6px per scroll
		// px at 1920), so the label has to be gone by the pin's start offset.
		gsap.to("#section4 .dot-nav", {
			scrollTrigger: {
				trigger: "#section4",
				start: "top top+=200",
				end: "top top+=180",
				scrub: true,
			},
			opacity: 0,
			ease: "none",
		});

		// Pin #section4 and scroll .pin-wrap horizontally
		gsap.to(".pin-wrap", {
			scrollTrigger: {
				scrub: true,
				trigger: "#section4",
				pin: true,
				start: "top top+=180",
				end: "+=" + horizontalScrollLength * 0.75,
				invalidateOnRefresh: true,
			},
			x: -horizontalScrollLength,
			ease: "power1",
		});

		ScrollTrigger.refresh();
	});
})();
