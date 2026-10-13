(function () {
	function initLiquidBackground() {
		var section = document.getElementById("section1");
		if (!section) {
			setTimeout(initLiquidBackground, 100);
			return;
		}

		// Create canvas element
		var canvas = document.createElement("canvas");
		canvas.id = "liquid-canvas";
		canvas.className = "liquid-background-canvas";

		// Insert canvas as first child of section1
		section.style.position = "relative";
		section.insertBefore(canvas, section.firstChild);

		// Dynamically import and initialize LiquidBackground
		import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js")
			.then(function (module) {
				var LiquidBackground = module.default;
				var app = LiquidBackground(canvas);

				// Get theme directory URL from localized data or construct it
				var themeUrl = window.innotechTheme
					? window.innotechTheme.themeUrl
					: "";
				var imageUrl = themeUrl + "/_assets/background.png";

				app.loadImage(imageUrl);
				app.liquidPlane.material.metalness = 1;
				app.liquidPlane.material.roughness = 5;
				app.liquidPlane.uniforms.displacementScale.value = 4.08;
				app.setRain(false);

				// Handle resize
				function handleResize() {
					canvas.width = section.offsetWidth;
					canvas.height = section.offsetHeight;
				}

				handleResize();
				window.addEventListener("resize", handleResize);
			})
			.catch(function (error) {
				console.error("Failed to load LiquidBackground:", error);
			});
	}

	// Wait for DOM ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initLiquidBackground);
	} else {
		initLiquidBackground();
	}
})();
