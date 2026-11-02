# Mask Zoom-Out Scroll Effect

Production-ready GSAP + ScrollTrigger implementation for cinematic mask zoom-out effects.

## 🎯 Features

- ✅ Smooth scroll-triggered mask animation
- ✅ Section pinning during animation
- ✅ Mobile responsive
- ✅ GPU-accelerated (will-change, transform3d)
- ✅ Accessibility-aware (prefers-reduced-motion)
- ✅ Locomotive Scroll compatible
- ✅ Zero janky transitions
- ✅ Reusable function-based API
- ✅ Configurable mask shape (circle/ellipse)

## 📦 Installation

1. Include GSAP and ScrollTrigger:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

2. Include the mask effect styles:
```html
<link rel="stylesheet" href="/wp-content/themes/innotech-divi-child/includes/modules/MaskZoomEffect/style.css">
```

3. Include the mask effect script:
```html
<script src="/wp-content/themes/innotech-divi-child/js/mask-zoom-effect.js"></script>
```

## 🎬 Basic Usage

### HTML Structure

```html
<!-- Section with ID -->
<section id="section-6">
  <!-- Element with mask-zoom-out class -->
  <div class="mask-zoom-out">
    <!-- Background image or content -->
    <img src="path/to/background.jpg" alt="Background">

    <!-- Optional: Content overlay -->
    <div class="content">
      <h1>Where Innovation Protects Integrity</h1>
    </div>
  </div>
</section>
```

### Minimal JavaScript

```javascript
// Auto-initializes on page load if element exists
// Or manually initialize:
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 20,      // 20% initial mask size
  endSize: 100,       // 100% final reveal
  duration: 1000,     // 1000px scroll distance
  easing: 'power1.inOut'
});
```

## ⚙️ Configuration Options

```javascript
const options = {
  // Initial mask size (percentage)
  startSize: 20,

  // Final mask size (percentage) - usually 100 for full reveal
  endSize: 100,

  // ScrollTrigger start point
  triggerStart: 'top top',

  // Scroll distance (px) to complete animation
  duration: 1000,

  // GSAP easing function
  easing: 'power1.inOut',  // other options: 'power2.out', 'expo.out', 'sine.inOut'

  // No extra spacing after pin
  pinSpacing: false,

  // Scrub value (0-3) - higher = smoother but more latency
  scrub: 1,

  // Show ScrollTrigger debug markers
  markers: false,

  // Mask shape: 'circle' or 'ellipse'
  maskShape: 'circle'
};

initMaskZoomEffect('.mask-zoom-out', options);
```

## 🎨 Advanced Usage

### Multiple Mask Effects

```javascript
// Auto-initialize all .mask-zoom-out elements
initAllMaskEffects('body', {
  startSize: 15,
  endSize: 100,
  duration: 800,
  easing: 'power2.out'
});
```

### Custom CSS Classes

```html
<!-- With dark overlay -->
<div class="mask-zoom-out dark-overlay">
  <img src="background.jpg" alt="">
</div>

<!-- With light overlay -->
<div class="mask-zoom-out light-overlay">
  <img src="background.jpg" alt="">
</div>
```

### Event Listeners

```javascript
const element = document.querySelector('.mask-zoom-out');

// Fired when animation starts
element.addEventListener('maskZoomStart', () => {
  console.log('Mask zoom started');
});

// Fired when animation completes
element.addEventListener('maskZoomEnd', () => {
  console.log('Mask zoom ended');
});
```

## 📱 Responsive Behavior

The effect automatically adapts to viewport changes:

```javascript
// Mobile-specific config
const mobileConfig = window.innerWidth < 768 ? {
  startSize: 25,
  endSize: 100,
  duration: 600,
  scrub: 1.5
} : {
  startSize: 20,
  endSize: 100,
  duration: 1000,
  scrub: 1
};

initMaskZoomEffect('.mask-zoom-out', mobileConfig);
```

## 🚂 Locomotive Scroll Integration

If using Locomotive Scroll:

```html
<!-- Locomotive Scroll container -->
<div data-scroll-container>
  <section id="section-6">
    <div class="mask-zoom-out">
      <img src="background.jpg" alt="">
    </div>
  </section>
</div>

<!-- Include Locomotive Scroll -->
<script src="https://cdn.jsdelivr.net/npm/locomotive-scroll@4/dist/locomotive-scroll.min.js"></script>
```

The mask-zoom-effect.js script automatically detects and integrates with Locomotive Scroll.

## 🎯 Common Configurations

### Aggressive (Fast Reveal)
```javascript
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 5,
  endSize: 100,
  duration: 600,
  easing: 'power2.out',
  scrub: 0.5
});
```

### Cinematic (Slow & Smooth)
```javascript
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 15,
  endSize: 100,
  duration: 1500,
  easing: 'expo.out',
  scrub: 2
});
```

### Subtle (Minimal Effect)
```javascript
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 40,
  endSize: 100,
  duration: 800,
  easing: 'power1.inOut',
  scrub: 1
});
```

### Ellipse (Oval Mask)
```javascript
initMaskZoomEffect('.mask-zoom-out', {
  maskShape: 'ellipse',
  startSize: 20,
  endSize: 100,
  duration: 1000
});
```

## 🔧 Cleanup & Destruction

```javascript
// Remove all mask zoom effects
destroyAllMaskEffects();

// Manual ScrollTrigger refresh (e.g., after DOM changes)
if (typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.refresh();
}
```

## ♿ Accessibility

- Respects `prefers-reduced-motion` media query
- On reduced motion devices, mask is set to 100% immediately
- No animation interference with assistive technologies

## 🐛 Debugging

Enable ScrollTrigger debug markers:

```javascript
initMaskZoomEffect('.mask-zoom-out', {
  markers: true  // Shows timeline start/end markers
});
```

Check browser DevTools:
- **Performance**: Watch for GPU acceleration (transform, clip-path)
- **Rendering**: Should not trigger reflows during scroll
- **Console**: Check for warnings about missing elements

## 📊 Performance Tips

1. **Lazy load background images** within the mask
2. **Use optimized, compressed images** (WebP format with fallbacks)
3. **Avoid heavy filters** (blur, shadow) on mask element
4. **Minimize nested elements** inside .mask-zoom-out
5. **Use `pinSpacing: false`** to avoid layout shift
6. **Consider `scrub: 1`** instead of higher values for mobile

## ❌ Common Mistakes

```javascript
// ❌ DON'T: Hardcode magic numbers
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 19.5,
  endSize: 100.2,
  duration: 987
});

// ✅ DO: Use clear, maintainable values
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 20,
  endSize: 100,
  duration: 1000
});

// ❌ DON'T: Use setTimeout for animations
setTimeout(() => {
  element.style.clipPath = 'circle(100%)';
}, 1000);

// ✅ DO: Use GSAP for animations
gsap.to(element, {
  clipPath: 'circle(100%)',
  duration: 1
});
```

## 🎥 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (use -webkit- prefix, auto-handled by CSS)
- Mobile browsers: ✅ Full support (iOS Safari 13+, Chrome Mobile)

## 📝 License

Part of the InnoTech Divi Child Theme. Production-ready for commercial use.
