(function () {
	"use strict";

	function toggle(item) {
		var head = item.querySelector(".innotech-product-layout__head");
		var panel = item.querySelector(".innotech-product-layout__panel");
		var willOpen = !item.classList.contains("is-open");
		item.classList.toggle("is-open", willOpen);
		head.setAttribute("aria-expanded", willOpen ? "true" : "false");
		if (willOpen) panel.removeAttribute("hidden");
		else panel.setAttribute("hidden", "");
	}

	function init(item) {
		if (item.dataset.accBound === "1") return;
		item.dataset.accBound = "1";
		var head = item.querySelector(".innotech-product-layout__head");
		if (!head) return;
		head.addEventListener("click", function () {
			toggle(item);
		});
	}

	function scan() {
		document
			.querySelectorAll(".innotech-product-layout__item")
			.forEach(init);
	}

	if (document.readyState !== "loading") scan();
	else document.addEventListener("DOMContentLoaded", scan);
	new MutationObserver(scan).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
