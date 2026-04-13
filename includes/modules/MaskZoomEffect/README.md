# Mask Zoom-Out Scroll Effect Module

A production-ready, reusable scroll effect module for InnoTech Divi Child Theme.

## 📁 Module Structure

```
MaskZoomEffect/
├── style.css          # CSS for mask styling & GPU optimization
├── README.md          # This file
├── USAGE.md           # Detailed usage guide
├── example.html       # Interactive demo
└── icon.svg           # Module icon (if used in Divi builder)
```

## 🎯 What It Does

Creates a cinematic mask zoom-out animation that:
- Starts with a small circular mask (revealing only a portion of the background)
- Expands smoothly as the user scrolls
- Pins the section during animation
- Reveals the full content when animation completes
- Feels premium and smooth (Apple-like quality)

## ⚡ Quick Start

### 1. Include Dependencies
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

### 2. Include Module
```html
<link rel="stylesheet" href="/path/to/MaskZoomEffect/style.css">
<script src="/path/to/mask-zoom-effect.js"></script>
```

### 3. HTML
```html
<section id="section-6">
  <div class="mask-zoom-out">
    <img src="background.jpg" alt="">
    <div class="content">
      <h1>Your Title</h1>
    </div>
  </div>
</section>
```

### 4. Initialize
```javascript
initMaskZoomEffect('.mask-zoom-out', {
  startSize: 20,
  endSize: 100,
  duration: 1000,
  easing: 'power1.inOut'
});
```

## 🔧 Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `startSize` | `20` | Initial mask size (%) |
| `endSize` | `100` | Final mask size (%) |
| `duration` | `1000` | Scroll distance (px) to complete |
| `easing` | `'power1.inOut'` | GSAP easing function |
| `scrub` | `1` | Smooth scrub (0-3) |
| `maskShape` | `'circle'` | `'circle'` or `'ellipse'` |
| `triggerStart` | `'top top'` | ScrollTrigger start |
| `pinSpacing` | `false` | Extra spacing after pin |
| `markers` | `false` | Show debug markers |

## 🎨 CSS Classes

### Overlay Options
```html
<!-- Dark overlay -->
<div class="mask-zoom-out dark-overlay">

<!-- Light overlay -->
<div class="mask-zoom-out light-overlay">
```

## 🚀 Performance

- ✅ GPU-accelerated (clip-path, transform)
- ✅ No reflows during scroll
- ✅ Optimized will-change usage
- ✅ Mobile-friendly
- ✅ Lazy-loadable backgrounds

## ♿ Accessibility

- Respects `prefers-reduced-motion`
- No animation interference with screen readers
- Proper semantic HTML structure

## 🔗 Locomotive Scroll Integration

The script automatically detects Locomotive Scroll and integrates properly:

```html
<div data-scroll-container>
  <section id="section-6">
    <div class="mask-zoom-out">...</div>
  </section>
</div>
```

The effect will automatically work with Locomotive Scroll without additional configuration.

## 📊 Use Cases

- **Hero sections** with background reveals
- **Portfolio** item showcases
- **Product launches** with cinematic reveals
- **Section transitions** with premium feel
- **Image galleries** with progressive reveals

## 🐛 Troubleshooting

### Effect not showing?
- Ensure GSAP and ScrollTrigger are loaded
- Check that `.mask-zoom-out` element exists
- Verify ScrollTrigger.refresh() is called

### Animation jittery on mobile?
- Increase `scrub` value (1.5 or 2)
- Reduce animation `duration`
- Check device performance in DevTools

### Not working with Locomotive Scroll?
- Ensure Locomotive Scroll is loaded before the effect script
- Check `data-scroll-container` is present
- Refresh ScrollTrigger after Locomotive initializes

## 🔄 API Reference

### initMaskZoomEffect(selector, options)
Initializes a single mask effect.

**Returns:** GSAP Timeline

**Example:**
```javascript
const tl = initMaskZoomEffect('.mask-zoom-out', {
  startSize: 20,
  endSize: 100
});
```

### initAllMaskEffects(containerSelector, globalOptions)
Initializes all `.mask-zoom-out` elements in a container.

**Returns:** Array of timelines

**Example:**
```javascript
const timelines = initAllMaskEffects('body', {
  duration: 800
});
```

### destroyAllMaskEffects()
Removes all mask effects and cleans up ScrollTriggers.

**Example:**
```javascript
destroyAllMaskEffects();
```

## 📱 Responsive Breakpoints

Automatically adapts to:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎬 Animation Presets

### Aggressive (Fast & Bold)
```javascript
{
  startSize: 5,
  endSize: 100,
  duration: 600,
  easing: 'power2.out'
}
```

### Cinematic (Slow & Dramatic)
```javascript
{
  startSize: 15,
  endSize: 100,
  duration: 1500,
  easing: 'expo.out',
  scrub: 2
}
```

### Subtle (Smooth & Minimal)
```javascript
{
  startSize: 40,
  endSize: 100,
  duration: 800,
  easing: 'sine.inOut'
}
```

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| iOS Safari | ✅ 13+ |
| Chrome Mobile | ✅ Full |

## 📄 License

Part of InnoTech Divi Child Theme. Production-ready for commercial use.

## 👨‍💻 Credits

Built with:
- **GSAP** - Animation library
- **ScrollTrigger** - Scroll animation plugin
- **CSS clip-path** - Mask implementation
- **GPU acceleration** - Performance optimization

## 📞 Support

For issues or questions, refer to [USAGE.md](USAGE.md) or check the [example.html](example.html) demo.
