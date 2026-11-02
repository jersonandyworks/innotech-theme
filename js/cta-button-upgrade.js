// Upgrade Divi buttons tagged `.cta-anim` into the animated .cta-button markup
// (pill + sliding arrow circle). Styles live in scss/_products-loop.scss and are
// reused as-is. Add the class in the Divi Button module → Advanced → CSS Class.
//
// Only `.cta-anim` elements are processed, so the existing fully-built cta-buttons
// (the [innotech_products] cards, which have NO cta-anim) are never touched.
(function () {
	"use strict";

	var ICON =
		'<svg class="cta-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

	function upgrade(btn) {
		if (!btn || btn.dataset.ctaInit) return;
		// Already in cta-button form (markup present) — just flag, don't rebuild.
		if (btn.querySelector(".cta-button__text")) {
			btn.dataset.ctaInit = "1";
			return;
		}
		btn.dataset.ctaInit = "1";

		var label = (btn.textContent || "").trim() || "Read More";

		// Become a cta-button + suppress Divi's native hover icon.
		btn.classList.add("cta-button", "et_pb_button_no_icon");
		btn.removeAttribute("data-icon");

		var text = document.createElement("span");
		text.className = "cta-button__text";
		text.textContent = label;

		var wrap = document.createElement("span");
		wrap.className = "cta-button__icon-wrapper";
		wrap.setAttribute("aria-hidden", "true");
		wrap.innerHTML = ICON;

		btn.textContent = "";
		btn.appendChild(text);
		btn.appendChild(wrap);
	}

	function run() {
		var nodes = document.querySelectorAll(".cta-anim");
		for (var i = 0; i < nodes.length; i++) {
			var el = nodes[i];
			// cta-anim may sit on the anchor itself or on the module wrapper.
			var btn =
				el.matches("a, button, .et_pb_button")
					? el
					: el.querySelector(".et_pb_button, a, button");
			upgrade(btn);
		}
	}

	if (document.readyState !== "loading") run();
	else document.addEventListener("DOMContentLoaded", run);
	window.addEventListener("load", run);
})();
