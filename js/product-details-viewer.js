// Product Details 3D viewer + label/text switcher.
// Three.js + GLTFLoader loaded via ESM importmap (registered in wp_head).
// RAF only runs while viewer is in viewport (IntersectionObserver).
(function () {
	"use strict";

	// ---- Label/text switcher (vanilla DOM) ----
	function bindSwitcher(section) {
		if (section.dataset.pdBound === "1") return;
		section.dataset.pdBound = "1";

		var links = section.querySelectorAll(".kit-menu a[data-pd-target]");
		var panels = section.querySelectorAll(".product-details__panel");
		links.forEach(function (a) {
			a.addEventListener("click", function (e) {
				e.preventDefault();
				var target = a.getAttribute("data-pd-target");

				section.querySelectorAll(".kit-menu li").forEach(function (li) {
					li.classList.toggle(
						"active",
						li.getAttribute("data-index") === target,
					);
				});
				panels.forEach(function (p) {
					p.classList.toggle(
						"is-active",
						p.getAttribute("data-index") === target,
					);
				});
			});
		});
	}

	function initSwitchers() {
		document.querySelectorAll(".product-details").forEach(bindSwitcher);
	}

	if (document.readyState !== "loading") initSwitchers();
	else document.addEventListener("DOMContentLoaded", initSwitchers);

	new MutationObserver(initSwitchers).observe(document.body, {
		childList: true,
		subtree: true,
	});

	// ---- 3D viewers — lazy init via IntersectionObserver ----
	var modulesPromise = null;
	function loadModules() {
		if (modulesPromise) return modulesPromise;
		modulesPromise = Promise.all([
			import("three"),
			import("three/addons/loaders/GLTFLoader.js"),
			import("three/addons/loaders/DRACOLoader.js").catch(function () {
				return null;
			}),
		]).then(function (mods) {
			return {
				THREE: mods[0],
				GLTFLoader: mods[1].GLTFLoader,
				DRACOLoader: mods[2] ? mods[2].DRACOLoader : null,
			};
		});
		return modulesPromise;
	}

	function scheduleViewers() {
		var holders = document.querySelectorAll(
			".product-details__3d:not([data-pd-3d-scheduled])",
		);
		if (!holders.length) return;

		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (e) {
					if (!e.isIntersecting) return;
					var host = e.target;
					io.unobserve(host);
					loadModules()
						.then(function (m) {
							setupViewer(m.THREE, m.GLTFLoader, m.DRACOLoader, host);
						})
						.catch(function (err) {
							console.warn("[product-details] module load failed:", err);
						});
				});
			},
			{ rootMargin: "200px" },
		);

		holders.forEach(function (h) {
			h.dataset.pd3dScheduled = "1";
			io.observe(h);
		});
	}

	function setupViewer(THREE, GLTFLoader, DRACOLoader, host) {
		if (host.dataset.pd3dInit === "1") return;
		host.dataset.pd3dInit = "1";

		var url = host.getAttribute("data-glb");
		if (!url) return;

		var rect = host.getBoundingClientRect();
		var W = rect.width || 400;
		var H = rect.height || 400;

		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(45, W / H, 0.05, 200);
		camera.position.set(0, 0, 5);

		// Zoom state (wheel + pinch). camDist is the live camera distance; the
		// min/max are derived from the auto-fit distance once the model loads.
		var camDist = 5;
		var zoomMin = 1;
		var zoomMax = 50;
		function applyZoom() {
			camDist = Math.min(zoomMax, Math.max(zoomMin, camDist));
			camera.position.z = camDist;
		}

		var renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});
		// Cap pixel ratio aggressively — big GLBs + high DPI = browser hang.
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
		renderer.setSize(W, H, false);
		renderer.setClearColor(0x000000, 0);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		host.appendChild(renderer.domElement);

		// Soft three-point lighting.
		scene.add(new THREE.AmbientLight(0xffffff, 0.9));
		var key = new THREE.DirectionalLight(0xffffff, 1.5);
		key.position.set(3, 4, 5);
		scene.add(key);
		var fill = new THREE.DirectionalLight(0xccddff, 0.6);
		fill.position.set(-4, -1, 3);
		scene.add(fill);
		var rim = new THREE.DirectionalLight(0xffffff, 0.4);
		rim.position.set(0, -3, -5);
		scene.add(rim);

		var pivot = new THREE.Group();
		scene.add(pivot);

		var modelLoaded = false;
		var loader = new GLTFLoader();
		if (DRACOLoader) {
			var draco = new DRACOLoader();
			// Use Google CDN decoder (most reliable, ~200KB cached).
			draco.setDecoderPath(
				"https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
			);
			loader.setDRACOLoader(draco);
		}
		loader.load(
			url,
			function (gltf) {
				var model = gltf.scene;
				model.traverse(function (n) {
					if (n.isMesh && n.material) {
						n.material.needsUpdate = true;
					}
				});

				// Center + auto-fit to camera.
				var box = new THREE.Box3().setFromObject(model);
				var size = box.getSize(new THREE.Vector3());
				var center = box.getCenter(new THREE.Vector3());
				model.position.sub(center);

				// Frame the model to BOTH viewport height and width so it fills
				// the viewer at any aspect (the old height-only fit left big side
				// margins — a small-looking model — on wide viewers). The model
				// spins around Y, so its horizontal silhouette swings out to the
				// XZ diagonal; fit to that so it never clips mid-rotation.
				// FIT_MARGIN is the zoom knob: 1.0 = edge-to-edge, lower = closer
				// (bigger), higher = more breathing room (smaller).
				var FIT_MARGIN = 1.1;
				var sweptWidth = Math.hypot(size.x, size.z) || 1; // widest silhouette while rotating
				var fov = (camera.fov * Math.PI) / 180;
				var distForHeight = size.y / 2 / Math.tan(fov / 2);
				var distForWidth =
					sweptWidth / 2 / (Math.tan(fov / 2) * camera.aspect);
				var dist = Math.max(distForHeight, distForWidth) * FIT_MARGIN;
				camera.position.set(0, 0, dist);
				camera.lookAt(0, 0, 0);

				// Seed zoom bounds from the fitted distance: closer for zoom-in,
				// a bit further than the fit for zoom-out.
				camDist = dist;
				zoomMin = dist * 0.35; // how far the user can zoom IN
				zoomMax = dist * 1.6; // how far the user can zoom OUT

				pivot.add(model);
				modelLoaded = true;
				host.classList.add("is-loaded");
			},
			undefined,
			function (err) {
				console.warn("[product-details] GLB load failed:", url, err);
			},
		);

		// Horizontal-only drag rotation.
		var isDown = false;
		var lastX = 0;
		var velocity = 0;
		var autoSpeed = 0.005;

		function getX(e) {
			return e.touches ? e.touches[0].clientX : e.clientX;
		}
		function onDown(e) {
			isDown = true;
			lastX = getX(e);
			velocity = 0;
		}
		function onMove(e) {
			if (!isDown) return;
			var x = getX(e);
			var dx = x - lastX;
			lastX = x;
			velocity = dx * 0.006;
			pivot.rotation.y += velocity;
		}
		function onUp() {
			isDown = false;
		}

		// ---- Zoom: mouse wheel ----
		function onWheel(e) {
			e.preventDefault(); // don't scroll the page while zooming the model
			// Multiplicative step → smooth, frame-rate independent.
			camDist *= Math.exp(e.deltaY * 0.0012);
			applyZoom();
		}

		// ---- Zoom: two-finger pinch ----
		var pinchStartDist = 0;
		var pinchStartCam = 0;
		function touchSpread(e) {
			var dx = e.touches[0].clientX - e.touches[1].clientX;
			var dy = e.touches[0].clientY - e.touches[1].clientY;
			return Math.hypot(dx, dy);
		}
		function onTouchStart(e) {
			if (e.touches.length === 2) {
				pinchStartDist = touchSpread(e);
				pinchStartCam = camDist;
				isDown = false; // suspend rotation during pinch
			} else {
				onDown(e);
			}
		}
		function onTouchMove(e) {
			if (e.touches.length === 2) {
				e.preventDefault(); // block the browser's page pinch-zoom
				if (pinchStartDist > 0) {
					camDist = pinchStartCam * (pinchStartDist / touchSpread(e));
					applyZoom();
				}
			} else {
				onMove(e);
			}
		}
		function onTouchEnd(e) {
			if (e.touches.length < 2) pinchStartDist = 0;
			onUp(e);
		}

		host.addEventListener("mousedown", onDown);
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		host.addEventListener("wheel", onWheel, { passive: false });
		host.addEventListener("touchstart", onTouchStart, { passive: false });
		host.addEventListener("touchmove", onTouchMove, { passive: false });
		host.addEventListener("touchend", onTouchEnd);

		// Resize.
		new ResizeObserver(function () {
			var r = host.getBoundingClientRect();
			if (!r.width || !r.height) return;
			renderer.setSize(r.width, r.height, false);
			camera.aspect = r.width / r.height;
			camera.updateProjectionMatrix();
		}).observe(host);

		// Pause RAF when viewer leaves viewport.
		var isVisible = true;
		new IntersectionObserver(function (entries) {
			isVisible = entries[0].isIntersecting;
			if (isVisible && !rafId) loop();
		}).observe(host);

		var rafId = null;
		function loop() {
			if (!isVisible || document.hidden) {
				rafId = null;
				return;
			}
			if (modelLoaded && !isDown) {
				if (Math.abs(velocity) > 0.0005) {
					pivot.rotation.y += velocity;
					velocity *= 0.94;
				} else {
					pivot.rotation.y += autoSpeed;
				}
			}
			renderer.render(scene, camera);
			rafId = requestAnimationFrame(loop);
		}
		loop();

		document.addEventListener("visibilitychange", function () {
			if (!document.hidden && isVisible && !rafId) loop();
		});
	}

	if (document.readyState !== "loading") scheduleViewers();
	else document.addEventListener("DOMContentLoaded", scheduleViewers);
	window.addEventListener("load", scheduleViewers);
	new MutationObserver(scheduleViewers).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
