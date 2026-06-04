// Liquid blob indicator that follows the cursor inside .carousel-menu-container.
// Default: small circle. Hover .system-components-btn (or any *-btn): stretches
// into an oil-bubble droplet between cursor and the hovered button.
// Renders via Three.js shader (smooth-min metaball SDF + wobble).
(function () {
	"use strict";

	function init() {
		if (typeof THREE === "undefined") return;
		document
			.querySelectorAll(".carousel-menu-container")
			.forEach(setup);
	}

	function setup(container) {
		if (container.dataset.blobInit === "1") return;
		container.dataset.blobInit = "1";

		if (getComputedStyle(container).position === "static") {
			container.style.position = "relative";
		}

		var canvas = document.createElement("canvas");
		canvas.className = "carousel-menu-blob-canvas";
		canvas.style.cssText =
			"position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;display:block;";
		container.insertBefore(canvas, container.firstChild);

		// Lift inline children above the canvas.
		Array.prototype.forEach.call(container.children, function (child) {
			if (child === canvas) return;
			var cs = getComputedStyle(child);
			if (cs.position === "static") child.style.position = "relative";
			if (cs.zIndex === "auto") child.style.zIndex = "1";
		});

		var renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true,
			premultipliedAlpha: false,
		});
		renderer.setClearColor(0x000000, 0);

		var scene = new THREE.Scene();
		var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		var uniforms = {
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(1, 1) },
			uBlobPos: { value: new THREE.Vector2(0.5, 0.5) },
			uTargetPos: { value: new THREE.Vector2(0.5, 0.5) },
			uRadius: { value: 0.05 },
			uTargetRadius: { value: 0.05 },
			uMorph: { value: 0 },
			uColor: { value: new THREE.Color(0x0084cd) },
		};

		var material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			vertexShader: [
				"varying vec2 vUv;",
				"void main() {",
				"  vUv = uv;",
				"  gl_Position = vec4(position, 1.0);",
				"}",
			].join("\n"),
			fragmentShader: [
				"precision highp float;",
				"uniform vec2 uResolution;",
				"uniform vec2 uBlobPos;",
				"uniform vec2 uTargetPos;",
				"uniform float uRadius;",
				"uniform float uTargetRadius;",
				"uniform float uMorph;",
				"uniform float uTime;",
				"uniform vec3 uColor;",
				"varying vec2 vUv;",
				"",
				"// Capsule SDF: distance to line segment a..b minus radius.",
				"// Renders a solid pill connecting two points — true liquid",
				"// stretch even at large separation. r interpolates along.",
				"float capsule(vec2 p, vec2 a, vec2 b, float ra, float rb) {",
				"  vec2 pa = p - a;",
				"  vec2 ba = b - a;",
				"  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);",
				"  float r = mix(ra, rb, h);",
				"  return length(pa - ba * h) - r;",
				"}",
				"",
				"void main() {",
				"  vec2 px = vUv * uResolution;",
				"  vec2 p1 = uBlobPos * uResolution;",
				"  vec2 p2 = uTargetPos * uResolution;",
				"",
				"  float H = uResolution.y;",
				"  float r1 = uRadius * H;",
				"  float r2 = mix(r1, uTargetRadius * H, uMorph);",
				"",
				"  // Oil-bubble surface wobble.",
				"  vec2 pSample = px;",
				"  float w = sin(uTime * 3.5 + vUv.x * 22.0 + vUv.y * 18.0) * H * 0.025 * uMorph;",
				"  pSample.y += w;",
				"",
				"  float d = capsule(pSample, p1, p2, r1, r2);",
				"",
				"  float aa = fwidth(d) * 1.2;",
				"  float alpha = smoothstep(aa, -aa, d);",
				"  gl_FragColor = vec4(uColor, alpha);",
				"}",
			].join("\n"),
			extensions: { derivatives: true },
		});

		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
		scene.add(mesh);

		var W = 1, H = 1;
		function resize() {
			var r = container.getBoundingClientRect();
			if (!r.width || !r.height) return;
			W = r.width; H = r.height;
			var dpr = Math.min(window.devicePixelRatio || 1, 2);
			renderer.setPixelRatio(dpr);
			renderer.setSize(W, H, false);
			uniforms.uResolution.value.set(W, H);
			// Radius as fraction of container height (pixel space in shader).
			uniforms.uRadius.value = 0.32;
		}
		resize();
		new ResizeObserver(resize).observe(container);

		// Color: read from container `data-blob-color` (hex) or fall back to brand blue.
		var colorAttr = container.dataset.blobColor;
		var color = 0x0084cd;
		if (colorAttr) {
			var hex = parseInt(colorAttr.replace(/^#/, ""), 16);
			if (!isNaN(hex)) color = hex;
		} else {
			var sample = container.querySelector(".system-components-btn, [class*='-btn']");
			if (sample) {
				var bg = getComputedStyle(sample).backgroundColor;
				var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
				if (m) {
					var a = m[4] === undefined ? 1 : parseFloat(m[4]);
					// Only use sampled color if not transparent.
					if (a > 0.1) {
						uniforms.uColor.value.setRGB(m[1] / 255, m[2] / 255, m[3] / 255);
						color = null;
					}
				}
			}
		}
		if (color !== null) uniforms.uColor.value.setHex(color);

		var mx = 0.5, my = 0.5;
		var hoveredBtn = null;
		var prevBp = { x: 0.5, y: 0.5 };
		var isInside = false;

		// Home button: currently active button (if carousel marks one),
		// else .system-components-btn, else first found.
		function getHomeBtn() {
			return (
				container.querySelector(".active") ||
				container.querySelector(".system-components-btn") ||
				container.querySelector("[class*='-btn']")
			);
		}
		var homeBtn = getHomeBtn();

		function homePos() {
			// Re-resolve every call so blob follows the active button as it
			// changes via the carousel.
			homeBtn = getHomeBtn();
			if (!homeBtn) return { x: 0.5, y: 0.5 };
			var br = homeBtn.getBoundingClientRect();
			var cr = container.getBoundingClientRect();
			if (!cr.width || !cr.height) return { x: 0.5, y: 0.5 };
			return {
				x: (br.left - cr.left + br.width / 2) / cr.width,
				y: 1.0 - (br.top - cr.top + br.height / 2) / cr.height,
			};
		}

		// Initialize blob + cursor target at home button so first paint is
		// already parked there (no flash from container center).
		var hp = homePos();
		uniforms.uBlobPos.value.set(hp.x, hp.y);
		uniforms.uTargetPos.value.set(hp.x, hp.y);
		mx = hp.x;
		my = hp.y;

		container.addEventListener("pointerenter", function () {
			isInside = true;
		});

		container.addEventListener("pointermove", function (e) {
			isInside = true;
			var r = container.getBoundingClientRect();
			mx = (e.clientX - r.left) / r.width;
			my = 1.0 - (e.clientY - r.top) / r.height;
		});

		container.addEventListener("pointerleave", function () {
			// Mouse left — blob will lerp back to home button each frame.
			isInside = false;
			hoveredBtn = null;
		});

		function bindButtons() {
			var btns = container.querySelectorAll(
				".system-components-btn, [class*='-btn']:not(.carousel-menu-blob-canvas)",
			);
			btns.forEach(function (b) {
				if (b.dataset.blobBound === "1") return;
				b.dataset.blobBound = "1";
				b.addEventListener("pointerenter", function () {
					hoveredBtn = b;
				});
				b.addEventListener("pointerleave", function () {
					if (hoveredBtn === b) hoveredBtn = null;
				});
			});
		}
		bindButtons();
		new MutationObserver(bindButtons).observe(container, {
			childList: true,
			subtree: true,
		});

		function animate(t) {
			uniforms.uTime.value = t * 0.001;

			// Resolve cursor target: when mouse is outside container, drift
			// mx/my back to the home button so blob parks there smoothly.
			if (!isInside) {
				var hp2 = homePos();
				mx += (hp2.x - mx) * 0.08;
				my += (hp2.y - my) * 0.08;
			}

			// Primary blob always tracks cursor — no snapping.
			var bp = uniforms.uBlobPos.value;
			bp.x += (mx - bp.x) * 0.18;
			bp.y += (my - bp.y) * 0.18;

			// Velocity for trailing-tail metaball.
			var vx = bp.x - prevBp.x;
			var vy = bp.y - prevBp.y;
			var speed = Math.sqrt(vx * vx + vy * vy);
			prevBp.x = bp.x;
			prevBp.y = bp.y;

			var tp = uniforms.uTargetPos.value;
			var targetR;
			var targetTx, targetTy;
			var targetMorph;

			if (hoveredBtn) {
				// Anchor capsule end at the hovered button center.
				var br = hoveredBtn.getBoundingClientRect();
				var cr = container.getBoundingClientRect();
				targetTx = (br.left - cr.left + br.width / 2) / cr.width;
				targetTy =
					1.0 - (br.top - cr.top + br.height / 2) / cr.height;
				targetR = uniforms.uRadius.value * 1.3;
				targetMorph = 1;
			} else {
				// Default: tail trails behind cursor along velocity vector.
				targetTx = bp.x - vx * 6;
				targetTy = bp.y - vy * 6;
				var trail = Math.min(speed * 30, 0.4);
				targetR = uniforms.uRadius.value * (0.55 + trail);
				// Morph follows speed → clean circle at rest, oil drop in motion.
				targetMorph = Math.min(speed * 80, 1);
			}

			tp.x += (targetTx - tp.x) * 0.22;
			tp.y += (targetTy - tp.y) * 0.22;
			uniforms.uTargetRadius.value +=
				(targetR - uniforms.uTargetRadius.value) * 0.18;
			uniforms.uMorph.value +=
				(targetMorph - uniforms.uMorph.value) * 0.15;

			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		}
		requestAnimationFrame(animate);
	}

	if (document.readyState !== "loading") init();
	else document.addEventListener("DOMContentLoaded", init);
	new MutationObserver(init).observe(document.body, {
		childList: true,
		subtree: true,
	});
})();
