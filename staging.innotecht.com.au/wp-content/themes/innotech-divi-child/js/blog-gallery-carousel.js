// Blog post image gallery — mobile only (QA). The post template's second row
// (.et_pb_row_1_tb_body) stacks its three case-study image modules under each
// other on phones; convert them into a single swipe carousel with prev/next
// arrows (same look as the product-showcase-slider arrows). Above 767px the
// modules are moved back into their original columns, so desktop/tablet render
// exactly as built.
(function () {
	"use strict";

	var MQ = "(max-width: 767px)";

	function init() {
		if (!document.body.classList.contains("single-post")) return;

		var row = document.querySelector(".et_pb_row_1_tb_body");
		if (!row || row.querySelector(".innotech-blog-gallery")) return;

		var modules = [].slice.call(
			row.querySelectorAll('.et_pb_image[class*="_tb_body"]'),
		);
		if (modules.length < 2) return;

		// Remember each module's original position for the desktop restore.
		var homes = modules.map(function (m) {
			return { el: m, parent: m.parentElement, next: m.nextElementSibling };
		});

		var gallery = document.createElement("div");
		gallery.className = "innotech-blog-gallery";

		var track = document.createElement("div");
		track.className = "innotech-blog-gallery__track";
		gallery.appendChild(track);

		var arrows = document.createElement("div");
		arrows.className = "innotech-blog-gallery__arrows";
		var chevron =
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
		var prev = document.createElement("button");
		prev.type = "button";
		prev.className = "innotech-blog-gallery__arrow";
		prev.setAttribute("aria-label", "Previous image");
		prev.innerHTML = chevron + '<path d="M15 18l-6-6 6-6"/></svg>';
		var next = document.createElement("button");
		next.type = "button";
		next.className = "innotech-blog-gallery__arrow";
		next.setAttribute("aria-label", "Next image");
		next.innerHTML = chevron + '<path d="M9 6l6 6-6 6"/></svg>';
		arrows.appendChild(prev);
		arrows.appendChild(next);
		gallery.appendChild(arrows);

		row.appendChild(gallery);

		function slideBy(dir) {
			track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
		}
		prev.addEventListener("click", function () {
			slideBy(-1);
		});
		next.addEventListener("click", function () {
			slideBy(1);
		});

		function enable() {
			homes.forEach(function (h) {
				track.appendChild(h.el);
			});
			row.classList.add("innotech-blog-gallery-active");
		}
		function disable() {
			// Reverse order: a module's stored next-sibling can be another moved
			// module (image_1's next is image_2, both in col_4). Restoring back to
			// front guarantees the anchor is already home; if it still isn't a
			// child of the parent, fall back to appendChild.
			homes
				.slice()
				.reverse()
				.forEach(function (h) {
					if (h.next && h.next.parentElement === h.parent) {
						h.parent.insertBefore(h.el, h.next);
					} else {
						h.parent.appendChild(h.el);
					}
				});
			row.classList.remove("innotech-blog-gallery-active");
		}

		var mq = window.matchMedia(MQ);
		function apply() {
			if (mq.matches) enable();
			else disable();
		}
		if (mq.addEventListener) mq.addEventListener("change", apply);
		else mq.addListener(apply);
		apply();
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
})();
