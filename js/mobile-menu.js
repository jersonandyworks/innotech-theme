(function () {
	function init() {
		var row = document.querySelector(".et_pb_row_0_tb_header");
		if (!row) return;
		if (document.querySelector(".innotech-hamburger")) return;

		// 1. Build hamburger button, append to body (fixed position above overlay).
		var btn = document.createElement("button");
		btn.className = "innotech-hamburger";
		btn.setAttribute("aria-label", "Toggle menu");
		btn.setAttribute("aria-expanded", "false");
		btn.innerHTML = "<span></span><span></span><span></span>";
		document.body.appendChild(btn);

		// 2. Build overlay panel with cloned menu links + CTA buttons.
		var overlay = document.createElement("div");
		overlay.className = "innotech-mobile-overlay";

		var inner = document.createElement("div");
		inner.className = "innotech-mobile-overlay__inner";

		var menu = document.querySelector("#menu-main-menu");
		if (menu) {
			var clone = menu.cloneNode(true);
			clone.removeAttribute("id");
			clone.className = "innotech-mobile-overlay__menu";
			inner.appendChild(clone);
		}

		// Clone Divi header buttons (Profile, Get in Touch)
		var headerBtns = row.querySelectorAll(
			".et_pb_column_2_tb_header .et_pb_button",
		);
		if (headerBtns.length) {
			var btnWrap = document.createElement("div");
			btnWrap.className = "innotech-mobile-overlay__buttons";
			headerBtns.forEach(function (b) {
				btnWrap.appendChild(b.cloneNode(true));
			});
			inner.appendChild(btnWrap);
		}

		overlay.appendChild(inner);
		document.body.appendChild(overlay);

		// 3. Toggle logic
		function open() {
			btn.classList.add("is-open");
			overlay.classList.add("is-open");
			document.body.classList.add("mobile-menu-open");
			btn.setAttribute("aria-expanded", "true");
		}
		function close() {
			btn.classList.remove("is-open");
			overlay.classList.remove("is-open");
			document.body.classList.remove("mobile-menu-open");
			btn.setAttribute("aria-expanded", "false");
		}

		btn.addEventListener("click", function () {
			if (overlay.classList.contains("is-open")) close();
			else open();
		});

		// Sync hamburger vertical position to logo center.
		function syncPosition() {
			var logo = row.querySelector(".et_pb_column_0_tb_header");
			if (!logo) return;
			var r = logo.getBoundingClientRect();
			var btnH = btn.offsetHeight || 44;
			var top = r.top + r.height / 2 - btnH / 2;
			top = Math.max(8, top);
			btn.style.top = top + "px";
			overlay.style.setProperty("--hamb-y", top + btnH / 2 + "px");
		}
		syncPosition();
		window.addEventListener("resize", syncPosition);
		window.addEventListener("scroll", syncPosition, { passive: true });

		// Close on menu-link click
		overlay.querySelectorAll("a").forEach(function (a) {
			a.addEventListener("click", close);
		});

		// Close on Esc
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") close();
		});
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
})();
