(function () {
	"use strict";

	// Software pin-scroll (#section4): the builder pulls the paragraph block and
	// the photo up with a fixed margin-top:-400px, but the column is centred in
	// 100vh, so on shorter desktop viewports (≤ ~830px tall) the block ends up
	// above the section's top edge and #section4's overflow:hidden slices off the
	// first lines. Nudge the block (and the photo) back down just far enough to
	// clear that edge, and push the list below only if the block would otherwise
	// run into it. `translate` is used, not margin, so layout and the GSAP pin
	// maths (offsetLeft / offsetWidth) are untouched.
	var DESKTOP = window.matchMedia("(min-width: 981px)");
	var MIN_INSET = 24; // px kept clear above the paragraph / photo
	var MIN_GAP = 24; // px kept between the button and the list below

	function setShift(el, px) {
		if (el) el.style.translate = px > 0 ? "0 " + Math.round(px) + "px" : "";
	}

	function fit(section) {
		var wrap = section.querySelector(".pin-wrap");
		if (!wrap) return;
		var items = wrap.querySelectorAll(".scroll-description .innotech-nested-item");
		var photo = wrap.querySelector(":scope > .et_pb_image");
		var textItem = items[0];
		var listItem = items[1];

		// Pin-scroll is off below the tablet breakpoint — leave the stack alone.
		if (!DESKTOP.matches) {
			setShift(textItem, 0);
			setShift(listItem, 0);
			setShift(photo, 0);
			return;
		}
		if (!textItem) return;

		// Drop the previous nudge so the rects read the un-shifted layout.
		setShift(textItem, 0);
		setShift(listItem, 0);
		setShift(photo, 0);

		var top = section.getBoundingClientRect().top;
		var textBox = (textItem.querySelector(".item-content") || textItem).getBoundingClientRect();
		var textShift = Math.max(0, MIN_INSET - (textBox.top - top));
		setShift(textItem, textShift);

		if (listItem && textShift) {
			var listBox = (listItem.querySelector(".item-content") || listItem).getBoundingClientRect();
			var listShift = textBox.bottom + textShift + MIN_GAP - listBox.top;
			setShift(listItem, listShift);
		}

		if (photo) {
			setShift(photo, Math.max(0, MIN_INSET - (photo.getBoundingClientRect().top - top)));
		}
	}

	function init() {
		var section = document.getElementById("section4");
		if (!section) return;

		var timer;
		function run() {
			fit(section);
		}
		function schedule() {
			clearTimeout(timer);
			timer = setTimeout(run, 100);
		}

		run();
		window.addEventListener("load", run);
		window.addEventListener("resize", schedule);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
