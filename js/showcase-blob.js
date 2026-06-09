/**
 * Showcase blob — appends _assets/blob.svg near the left cards of the
 * .showcase-second-section rows and makes it follow the mouse vertically only
 * (elastic, GSAP), mirroring the home-page blob behaviour. The blob sits on the
 * right edge of the left column and is shown only while the cursor is within the
 * vertical span of the showcase rows.
 */
document.addEventListener("DOMContentLoaded", function () {
	if (typeof gsap === "undefined") return;

	var rows = document.querySelectorAll(".showcase-second-section");
	if (rows.length < 2) return;

	var first = rows[0];
	var last = rows[rows.length - 1];
	var leftCol = first.querySelector(".et_pb_column");
	if (!leftCol) return;

	var themeUrl =
		(window.innotechTheme && innotechTheme.themeUrl) ||
		(window.blobAnimationData && blobAnimationData.themeUrl) ||
		"";

	var blob = document.createElement("img");
	blob.src = themeUrl + "/_assets/blob.svg";
	blob.alt = "";
	blob.className = "showcase-blob";
	document.body.appendChild(blob);

	// Centre the image on its (left, top) coordinate.
	gsap.set(blob, { xPercent: -50, yPercent: -50, opacity: 0 });

	var PAD = 30;
	var DELAY = 0.12;
	var visible = false;

	// ── Color-box highlight ────────────────────────────────────────────────
	// When the blob (vertical position) is over a .showcase-color-box, fade its
	// background to #0080c7; fade back to transparent when it leaves.
	var ON = "rgba(0, 128, 199, 1)"; // #0080c7
	var OFF = "rgba(0, 128, 199, 0)"; // same hue, fully transparent (smooth alpha fade)
	var activeBox = null;

	function fadeBox(box, on) {
		box.classList.toggle("is-blob-active", on); // CSS drops the border when active
		gsap.to(box, {
			backgroundColor: on ? ON : OFF,
			duration: 0.6,
			ease: "power2.out",
			overwrite: "auto",
		});
	}

	function updateColorBox(y) {
		var boxes = document.querySelectorAll(".showcase-color-box");
		var found = null;
		for (var i = 0; i < boxes.length; i++) {
			var r = boxes[i].getBoundingClientRect();
			if (y >= r.top && y <= r.bottom) {
				found = boxes[i];
				break;
			}
		}
		if (found === activeBox) return;
		if (activeBox) fadeBox(activeBox, false);
		if (found) fadeBox(found, true);
		activeBox = found;
	}

	document.addEventListener("mousemove", function (e) {
		var fr = first.getBoundingClientRect();
		var lr = last.getBoundingClientRect();
		var cr = leftCol.getBoundingClientRect();

		// Show only while the cursor is within the rows' vertical band.
		var inBand = e.clientY >= fr.top && e.clientY <= lr.bottom;
		if (!inBand) {
			if (visible) {
				visible = false;
				gsap.to(blob, { opacity: 0, duration: 0.3, overwrite: "auto" });
			}
			if (activeBox) {
				fadeBox(activeBox, false);
				activeBox = null;
			}
			return;
		}
		if (!visible) {
			visible = true;
			gsap.to(blob, { opacity: 1, duration: 0.4, overwrite: "auto" });
		}

		var minY = fr.top + PAD;
		var maxY = lr.bottom - PAD;
		var y = Math.max(minY, Math.min(maxY, e.clientY));

		updateColorBox(e.clientY);

		// Vertical follow only; x locked to the left card's right edge.
		gsap.to(blob, {
			left: cr.right,
			top: y,
			duration: 0.8,
			delay: DELAY,
			ease: "elastic.out(0.8, 0.5)",
			overwrite: "auto",
		});
	});
});
