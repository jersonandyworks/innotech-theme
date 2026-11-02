// Wraps consecutive .char elements into .word spans so line breaks only
// happen at real spaces — prevents "Unknown" splitting into "Un" + "known".
(function () {
	"use strict";

	function wrap(h) {
		if (h.dataset.wordsWrapped === "1") return;
		var children = Array.prototype.slice.call(h.childNodes);
		var hasChar = children.some(function (n) {
			return n.nodeType === 1 && n.classList && n.classList.contains("char");
		});
		if (!hasChar) return;

		h.dataset.wordsWrapped = "1";

		var word = null;
		children.forEach(function (n) {
			if (
				n.nodeType === 1 &&
				n.classList &&
				n.classList.contains("char") &&
				(n.textContent || "").trim() !== ""
			) {
				if (!word) {
					word = document.createElement("span");
					word.className = "word";
					h.insertBefore(word, n);
				}
				word.appendChild(n);
			} else {
				// Space text node or empty char — end current word.
				word = null;
			}
		});
	}

	function run() {
		document
			.querySelectorAll(".text-heading-effect-1 .et_pb_module_heading")
			.forEach(wrap);
	}

	if (document.readyState !== "loading") run();
	else document.addEventListener("DOMContentLoaded", run);
	window.addEventListener("load", run);
	new MutationObserver(run).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
