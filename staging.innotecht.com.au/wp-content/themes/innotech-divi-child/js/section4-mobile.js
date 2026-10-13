// Disable #section4 horizontal pin-scroll on mobile/tablet.
(function () {
	"use strict";
	var BREAKPOINT = 980;

	function killPinIfMobile() {
		if (window.innerWidth > BREAKPOINT) return;
		if (typeof ScrollTrigger === "undefined") return;
		ScrollTrigger.getAll().forEach(function (st) {
			var trig = st.trigger;
			if (
				trig &&
				(trig.id === "section4" ||
					trig.classList.contains("pin-wrap") ||
					(trig.closest && trig.closest("#section4")))
			) {
				st.kill(true);
			}
		});
		// Reset inline transforms gsap set.
		var pinWrap = document.querySelector("#section4 .pin-wrap");
		if (pinWrap && typeof gsap !== "undefined") {
			gsap.set(pinWrap, { clearProps: "all" });
		}
		var section = document.getElementById("section4");
		if (section && typeof gsap !== "undefined") {
			gsap.set(section, { clearProps: "all" });
		}
	}

	function run() {
		// Defer slightly to let locomotive-scroll-init register its triggers.
		setTimeout(killPinIfMobile, 250);
	}

	if (document.readyState !== "loading") run();
	else document.addEventListener("DOMContentLoaded", run);
	window.addEventListener("load", run);

	var t;
	window.addEventListener("resize", function () {
		clearTimeout(t);
		t = setTimeout(killPinIfMobile, 200);
	});
})();
