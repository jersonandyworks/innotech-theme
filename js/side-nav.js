(function () {
	var scrollTriggers = [];

	function initSideNav() {
		// Check if GSAP plugins are loaded
		if (
			typeof gsap === "undefined" ||
			typeof ScrollTrigger === "undefined" ||
			typeof ScrollToPlugin === "undefined"
		) {
			setTimeout(initSideNav, 100);
			return;
		}

		gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

		var navContainer = document.querySelector(".side-nav .nav-list");
		if (!navContainer) return;

		// Get all sections with IDs that start with "section"
		var sectionElements = document.querySelectorAll('[id^="section"]');

		if (!sectionElements.length) return;

		// Kill existing ScrollTriggers
		for (var i = 0; i < scrollTriggers.length; i++) {
			scrollTriggers[i].kill();
		}
		scrollTriggers = [];

		// Clear any existing content
		navContainer.innerHTML = "";

		// Build sections array from DOM
		var sections = [];
		for (var j = 0; j < sectionElements.length; j++) {
			var section = sectionElements[j];
			if (section.id && section.id.indexOf("section") === 0) {
				sections.push({
					id: section.id,
					num: String(sections.length + 1).padStart(2, "0"),
					element: section,
				});
			}
		}

		if (!sections.length) return;

		// Store sub-dot groups between nav items
		var subDotGroups = [];

		// Build navigation HTML
		for (var k = 0; k < sections.length; k++) {
			var sec = sections[k];

			// Main Item
			var li = document.createElement("li");
			li.className = "nav-item";
			li.setAttribute("data-index", k);
			li.innerHTML =
				'<div class="dot-main"></div><span class="nav-num">' +
				sec.num +
				"</span>";
			navContainer.appendChild(li);

			// Sub-dots between items
			if (k < sections.length - 1) {
				var currentSubDots = [];
				for (var s = 0; s < 3; s++) {
					var sub = document.createElement("div");
					sub.className = "sub-dot";
					sub.setAttribute("data-group", k);
					navContainer.appendChild(sub);
					currentSubDots.push(sub);
				}
				subDotGroups.push(currentSubDots);
			}
		}

		// Get all nav items after building
		var navItems = navContainer.querySelectorAll(".nav-item");

		// Animate sub-dots on scroll using class toggle
		function animateSubDots(fromIndex, toIndex) {
			// Determine which sub-dot group to animate
			var groupIndex = Math.min(fromIndex, toIndex);
			if (groupIndex >= 0 && groupIndex < subDotGroups.length) {
				var dots = subDotGroups[groupIndex];

				// Determine scroll direction: down = toIndex > fromIndex
				var isScrollingDown = toIndex > fromIndex;

				// Create array of indices based on direction
				var indices = [];
				for (var i = 0; i < dots.length; i++) {
					indices.push(i);
				}

				// Reverse order if scrolling up (animate bottom to top)
				if (!isScrollingDown) {
					indices.reverse();
				}

				// Add pulse class with stagger in the correct direction
				indices.forEach(function (dotIndex, i) {
					setTimeout(function () {
						dots[dotIndex].classList.add("pulse");

						// Remove pulse class after animation
						setTimeout(function () {
							dots[dotIndex].classList.remove("pulse");
						}, 400);
					}, i * 80);
				});
			}
		}

		// Track current active index
		var currentActiveIndex = 0;

		// Attach events to each nav item
		for (var m = 0; m < navItems.length; m++) {
			(function (index) {
				var item = navItems[index];
				var targetElement = sections[index] ? sections[index].element : null;

				if (!targetElement) return;

				// Mouseenter to scroll
				item.addEventListener("click", function () {
					// Animate sub-dots when hovering to scroll
					animateSubDots(currentActiveIndex, index);

					gsap.to(window, {
						duration: 1,
						scrollTo: { y: targetElement, offsetY: 0 },
						ease: "power3.inOut",
					});
				});

				// ScrollTrigger for active state
				var st = ScrollTrigger.create({
					trigger: targetElement,
					start: "top center",
					end: "bottom center",
					onEnter: function () {
						if (currentActiveIndex !== index) {
							animateSubDots(currentActiveIndex, index);
						}
						setActive(index);
						currentActiveIndex = index;
					},
					onEnterBack: function () {
						if (currentActiveIndex !== index) {
							animateSubDots(currentActiveIndex, index);
						}
						setActive(index);
						currentActiveIndex = index;
					},
				});

				scrollTriggers.push(st);
			})(m);
		}

		function setActive(activeIndex) {
			for (var n = 0; n < navItems.length; n++) {
				var ni = navItems[n];
				var d = ni.querySelector(".dot-main");
				if (n === activeIndex) {
					ni.classList.add("active");
					gsap.to(d, { scale: 1.5, duration: 0.4, ease: "back.out(3)" });
				} else {
					ni.classList.remove("active");
					gsap.to(d, { scale: 1, duration: 0.4 });
				}
			}
		}

		// Set initial active based on scroll position
		ScrollTrigger.refresh();
	}

	// Wait for window load
	window.addEventListener("load", function () {
		setTimeout(initSideNav, 500);
	});
})();
