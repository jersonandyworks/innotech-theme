// Footer nav on mobile/tablet: Divi hides the desktop footer menu below 980px
// (and the theme hides Divi's hamburger), so the links vanished. Clone the
// menu into the lower footer bar, right above the Privacy/Terms row — CSS
// shows the clone only below 980px, desktop keeps the original menu row.
(function () {
	"use strict";

	function init() {
		var src = document.querySelector("footer ul#menu-footer-menu");
		var container = document.querySelector("footer .innotech-nested-container");
		if (!src || !container) return;
		if (container.querySelector(".innotech-footer-nav-clone")) return;

		var lower = container.querySelector(".innotech-lower-footer-menu");
		var lowerItem = lower ? lower.closest(".innotech-nested-item") : null;

		var item = document.createElement("div");
		item.className = "innotech-nested-item innotech-footer-nav-clone";

		var ul = src.cloneNode(true);
		// Strip ids so the page keeps a single #menu-footer-menu / #menu-item-*.
		ul.removeAttribute("id");
		ul.querySelectorAll("[id]").forEach(function (el) {
			el.removeAttribute("id");
		});
		ul.className = "innotech-footer-nav-clone__menu";

		item.appendChild(ul);
		container.insertBefore(item, lowerItem);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
})();
