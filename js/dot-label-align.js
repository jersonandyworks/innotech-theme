(function () {
	"use strict";

	// Home "Our Methods" label (.dot-2): the builder positions it with a fixed
	// translateY, which lands it on the seam between the two cards and drifts as
	// card heights change with viewport width. Line it up with the second card's
	// title instead, measured from layout (offsetTop) so scroll-reveal
	// transforms on the cards can't skew it.
	var DESKTOP = window.matchMedia("(min-width: 981px)");

	function offsetWithin(el, root) {
		var top = 0;
		while (el && el !== root) {
			top += el.offsetTop;
			el = el.offsetParent;
		}
		return el === root ? top : null;
	}

	function align(dot) {
		var section = dot.closest(".et_pb_section");
		if (!section) return;

		// Labels are hidden below the tablet breakpoint — leave mobile untouched.
		if (!DESKTOP.matches) {
			dot.style.transform = "";
			return;
		}

		var titles = section.querySelectorAll(".item-title");
		var title = titles[titles.length - 1];
		if (!title) return;

		// Drop any previous nudge so offsetTop reads the un-shifted position.
		dot.style.transform = "none";
		var dotTop = offsetWithin(dot, section);
		var titleTop = offsetWithin(title, section);
		if (dotTop === null || titleTop === null) {
			dot.style.transform = "";
			return;
		}

		var shift = titleTop + title.offsetHeight / 2 - (dotTop + dot.offsetHeight / 2);
		dot.style.transform = "translateY(" + Math.round(shift) + "px)";
	}

	function init() {
		var dots = document.querySelectorAll(".dot-nav.dot-2");
		if (!dots.length) return;

		var timer;
		function run() {
			dots.forEach(align);
		}
		function schedule() {
			clearTimeout(timer);
			timer = setTimeout(run, 100);
		}

		run();
		window.addEventListener("load", run);
		window.addEventListener("resize", schedule);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);

		if (window.ResizeObserver) {
			var ro = new ResizeObserver(schedule);
			dots.forEach(function (dot) {
				var section = dot.closest(".et_pb_section");
				if (section) ro.observe(section);
			});
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
