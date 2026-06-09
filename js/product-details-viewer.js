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

				var maxDim = Math.max(size.x, size.y, size.z) || 1;
				var fov = (camera.fov * Math.PI) / 180;
				var dist = maxDim / 2 / Math.tan(fov / 2);
				camera.position.set(0, 0, dist * 1.6);
				camera.lookAt(0, 0, 0);

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

		host.addEventListener("mousedown", onDown);
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		host.addEventListener("touchstart", onDown, { passive: true });
		host.addEventListener("touchmove", onMove, { passive: true });
		host.addEventListener("touchend", onUp);

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
