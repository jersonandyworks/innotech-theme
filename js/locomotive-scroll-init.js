(function () {
	gsap.registerPlugin(ScrollTrigger);

	window.addEventListener("load", function () {
		var pinWrap = document.querySelector(".pin-wrap");
		if (!pinWrap) return;

		// Scroll until 3/4 of the 2nd child is off-screen (1/4 still visible)
		var secondChild = pinWrap.children[1];
		var horizontalScrollLength =
			secondChild.offsetLeft + secondChild.offsetWidth * 0.65;

		// Fade out .dot-nav when pin scroll starts
		gsap.to("#section4 .dot-nav", {
			scrollTrigger: {
				trigger: "#section4",
				start: "top top+=80",
				end: "+=200",
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
