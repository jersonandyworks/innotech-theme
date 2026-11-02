(function () {
	// Map a file extension to the correct MIME type.
	var MIME = { mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg", ogv: "video/ogg", mov: "video/mp4" };

	// Divi can emit a <source> whose `type` doesn't match the actual file — the
	// hero MP4s ship with type="video/webm". iOS Safari trusts the type, decides
	// it can't play WebM, skips the only source, and the hero renders blank on
	// iPhone (fine on desktop Chrome, which is lenient). Rewrite each source's
	// type from its file extension so Safari attempts the source it can play.
	// Returns true if any type was corrected (caller must reload to re-evaluate).
	function normalizeSources(v) {
		var changed = false;
		v.querySelectorAll("source").forEach(function (s) {
			var src = s.getAttribute("src") || "";
			var ext = (src.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();
			var correct = MIME[ext];
			if (correct && s.getAttribute("type") !== correct) {
				s.setAttribute("type", correct);
				changed = true;
			}
		});
		return changed;
	}

	function init() {
		var vids = document.querySelectorAll(
			".autoplay-video video, .et_pb_video.autoplay-video video",
		);
		vids.forEach(function (v) {
			if (v.dataset.autoplayBound === "1") return;
			v.dataset.autoplayBound = "1";

			v.muted = true;
			v.autoplay = true;
			v.loop = true;
			v.playsInline = true;
			v.setAttribute("muted", "");
			v.setAttribute("autoplay", "");
			v.setAttribute("loop", "");
			v.setAttribute("playsinline", "");
			v.removeAttribute("controls");

			// Fix mislabeled source MIME types, then reload so the media element
			// re-picks a source it can actually decode (needed for iOS Safari).
			if (normalizeSources(v)) v.load();

			var p = v.play();
			if (p && typeof p.catch === "function") {
				p.catch(function () {
					// Browser blocked — retry on first user interaction
					var resume = function () {
						v.play().catch(function () {});
						window.removeEventListener("scroll", resume);
						window.removeEventListener("touchstart", resume);
						window.removeEventListener("click", resume);
					};
					window.addEventListener("scroll", resume, { once: true });
					window.addEventListener("touchstart", resume, { once: true });
					window.addEventListener("click", resume, { once: true });
				});
			}
		});

		// Hide Divi play overlay on autoplay videos
		document
			.querySelectorAll(".autoplay-video .et_pb_video_overlay")
			.forEach(function (o) {
				o.style.display = "none";
			});
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	window.addEventListener("load", init);
})();
