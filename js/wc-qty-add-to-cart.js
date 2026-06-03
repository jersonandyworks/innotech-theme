// Inject minus / plus buttons into WC quantity inputs (form.cart, group buy).
(function () {
	"use strict";

	function decorate(input) {
		if (input.dataset.innotechQty === "1") return;
		input.dataset.innotechQty = "1";

		var wrap = input.parentNode;
		if (!wrap) return;

		var minus = document.createElement("button");
		minus.type = "button";
		minus.className = "innotech-qty-btn innotech-qty-btn--minus";
		minus.setAttribute("aria-label", "Decrease quantity");
		minus.textContent = "−"; // −

		var plus = document.createElement("button");
		plus.type = "button";
		plus.className = "innotech-qty-btn innotech-qty-btn--plus";
		plus.setAttribute("aria-label", "Increase quantity");
		plus.textContent = "+";

		wrap.insertBefore(minus, input);
		wrap.appendChild(plus);

		function step(delta) {
			var min = parseInt(input.getAttribute("min"), 10);
			if (isNaN(min)) min = 1;
			var max = parseInt(input.getAttribute("max"), 10);
			if (isNaN(max)) max = 99999;
			var cur = parseInt(input.value, 10);
			if (isNaN(cur)) cur = min;
			var next = Math.max(min, Math.min(max, cur + delta));
			if (next !== cur) {
				input.value = next;
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		}

		minus.addEventListener("click", function () {
			step(-1);
		});
		plus.addEventListener("click", function () {
			step(1);
		});
	}

	function scan() {
		document
			.querySelectorAll(
				"form.cart .quantity input.qty, form.cart .quantity input[type='number']",
			)
			.forEach(decorate);
	}

	if (document.readyState !== "loading") scan();
	else document.addEventListener("DOMContentLoaded", scan);

	new MutationObserver(scan).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
