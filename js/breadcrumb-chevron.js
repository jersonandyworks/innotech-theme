(function () {
	"use strict";

	var CHEVRON_SVG =
		'<svg class="innotech-breadcrumb-sep" xmlns="http://www.w3.org/2000/svg" ' +
		'width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
		'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ' +
		'aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

	function replaceSeparators(nav) {
		if (nav.dataset.chevronSwapped === "1") return;
		nav.dataset.chevronSwapped = "1";

		var walker = document.createTreeWalker(nav, NodeFilter.SHOW_TEXT, null);
		var nodes = [];
		var n;
		while ((n = walker.nextNode())) nodes.push(n);

		nodes.forEach(function (textNode) {
			var t = textNode.nodeValue;
			if (!t || t.indexOf("/") === -1) return;
			// Match common WC separators: "/", " /", "/ ", " / ", "&nbsp;/&nbsp;".
			if (!/(^|\s)\/(\s|$)/.test(t)) return;

			var parent = textNode.parentNode;
			var parts = t.split(/(\s*\/\s*)/);
			parts.forEach(function (part) {
				if (/^\s*\/\s*$/.test(part)) {
					var sep = document.createElement("span");
					sep.className = "innotech-breadcrumb-sep-wrap";
					sep.innerHTML = CHEVRON_SVG;
					parent.insertBefore(sep, textNode);
				} else if (part.length) {
					parent.insertBefore(document.createTextNode(part), textNode);
				}
			});
			parent.removeChild(textNode);
		});
	}

	function init() {
		document
			.querySelectorAll(".woocommerce-breadcrumb")
			.forEach(replaceSeparators);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);

	// Re-run on DOM mutations (Divi may re-render).
	var mo = new MutationObserver(init);
	mo.observe(document.body, { childList: true, subtree: true });
})();
