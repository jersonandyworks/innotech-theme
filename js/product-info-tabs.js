(function () {
	"use strict";

	function activate(tabs, panels, key) {
		tabs.forEach(function (t) {
			var on = t.dataset.target === key;
			t.classList.toggle("is-active", on);
			t.setAttribute("aria-selected", on ? "true" : "false");
		});
		panels.forEach(function (p) {
			var on = p.dataset.key === key;
			p.classList.toggle("is-active", on);
			if (on) p.removeAttribute("hidden");
			else p.setAttribute("hidden", "");
		});
	}

	function init(root) {
		if (root.dataset.tabsBound === "1") return;
		root.dataset.tabsBound = "1";
		var tabs = root.querySelectorAll(".innotech-product-info-tabs__tab");
		var panels = root.querySelectorAll(".innotech-product-info-tabs__panel");
		tabs.forEach(function (t) {
			t.addEventListener("click", function () {
				activate(tabs, panels, t.dataset.target);
			});
		});
	}

	function scan() {
		document
			.querySelectorAll(".innotech-product-info-tabs")
			.forEach(init);
	}

	if (document.readyState !== "loading") scan();
	else document.addEventListener("DOMContentLoaded", scan);
	new MutationObserver(scan).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
