(function () {
	window.addEventListener("load", function () {
		var swirl = document.querySelector("#map-swirl");
		if (!swirl) return;

		var swirlImg = swirl.querySelector(".et_pb_image_wrap > img");
		if (!swirlImg) return;
		// Add blur to the swirl image
		gsap.set(swirlImg, {
			webkitMaskImage: "radial-gradient(circle, black 65%, transparent 70%)",
			maskImage: "radial-gradient(circle, black 65%, transparent 70%)",
		});

		// Make the swirl spin 3 times smoothly
		gsap.to(swirlImg, {
			rotation: 1080,
			duration: 1800,
			ease: "none",
			transformOrigin: "center center",
		});
		// Append hoz-line.png image to the swirl element
		var themeUrl = window.innotechTheme ? window.innotechTheme.themeUrl : "";
		console.log("Theme URL x:", themeUrl + "/_assets/hoz-line.png"); // Debugging line to check the theme URL
		var hozLineImg = document.createElement("img");
		hozLineImg.src = themeUrl + "/_assets/hoz-line.png";
		hozLineImg.className = "swirl-hoz-line";
		hozLineImg.style.position = "absolute";
		hozLineImg.style.top = "50%";
		hozLineImg.style.left = "50%";
		hozLineImg.style.height = "85vh"; // Adjust width as needed
		hozLineImg.style.transform = "translate(-50%, -50%)";
		swirl.appendChild(hozLineImg);

		var vertLineImg = document.createElement("img");
		vertLineImg.src = themeUrl + "/_assets/ver-line.png";
		vertLineImg.className = "swirl-vert-line";
		vertLineImg.style.position = "absolute";
		vertLineImg.style.top = "50%";
		vertLineImg.style.left = "50%";
		vertLineImg.style.transform = "translate(-50%, -50%)";
		swirl.appendChild(vertLineImg);

		function appendChart() {
			var chartImg = document.createElement("img");
			chartImg.src = themeUrl + "/_assets/chart.png";
			chartImg.className = "swirl-chart";

			var chartContainer = document.createElement("div");
			chartContainer.id = "chartContainer";
			chartContainer.style.position = "absolute";
			chartContainer.style.padding = "0 0 60px 0";
			chartContainer.style.background = "#000";
			chartContainer.style.top = "26.8%";
			chartContainer.style.left = "35%";
			chartContainer.style.transform = "translate(-50%, -50%)";
			chartContainer.style.width = "30%";
			chartContainer.appendChild(chartImg);
			swirl.appendChild(chartContainer);

			// Animate the bar raising
			gsap.fromTo(
				chartImg,
				{ clipPath: "inset(100% 0 0 0)" },
				{
					clipPath: "inset(0% 0 0 0)",
					duration: 2,
					ease: "power2.out",
					delay: 2.5,
				},
			);
		}

		if (typeof ScrollTrigger !== "undefined") {
			ScrollTrigger.create({
				trigger: document.querySelector("#section6") || swirl,
				start: "top 75%",
				onEnter: appendChart,
				once: true,
			});
		} else {
			appendChart();
		}
	});
})();
