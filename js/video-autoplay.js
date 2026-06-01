(function () {
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
