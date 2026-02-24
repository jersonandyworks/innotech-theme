(function () {
	console.log("blurb.js loaded");
	var blurbSections = document.querySelectorAll(".mining-blurb-img");

	if (blurbSections.length === 0) return;

	var themeUrl = window.innotechTheme ? window.innotechTheme.themeUrl : "";

	blurbSections.forEach(function (section) {
		var blurbContainer = section.querySelector(".et_pb_blurb_content");
		if (!blurbContainer) return;

		var blurbIcon = document.createElement("img");
		blurbIcon.src = themeUrl + "/_assets/icn-blurb.svg";

		blurbContainer.style.position = "relative";

		var blurImgWrapper = document.createElement("div");
		blurImgWrapper.className = "blurb-custom-icon";
		blurImgWrapper.style.position = "absolute";
		blurImgWrapper.style.top = "10%";
		blurImgWrapper.style.left = "8%";
		blurImgWrapper.style.transform = "translate(-50%, -50%)";
		blurImgWrapper.style.zIndex = "10";
		blurImgWrapper.appendChild(blurbIcon);
		blurbContainer.appendChild(blurImgWrapper);
	});
})();
