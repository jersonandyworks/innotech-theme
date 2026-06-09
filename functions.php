<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );
         
if ( !function_exists( 'child_theme_configurator_css' ) ):
    function child_theme_configurator_css() {
        wp_enqueue_style( 'chld_thm_cfg_separate', trailingslashit( get_stylesheet_directory_uri() ) . 'ctc-style.css', array(  ), filemtime( trailingslashit( get_stylesheet_directory() ) . 'ctc-style.css' ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'child_theme_configurator_css', 99999998 );

// END ENQUEUE PARENT ACTION

// Enqueue external libs + the combined theme JS bundle.
//
// All of the theme's own classic scripts are concatenated into ONE minified
// file (js/min/theme.bundle.min.js) by `gulp bundle`. Only these stay separate
// because they cannot be folded in:
//   - GSAP / ScrollTo / ScrollTrigger / SplitType : external CDN
//   - three.min.js                                : vendor global lib (THREE)
//   - liquid-background                           : loaded as <script type="module">
function innotech_enqueue_animation_scripts() {
    $theme_uri = get_stylesheet_directory_uri();
    $theme_dir = get_stylesheet_directory();

    // ── External libs (CDN) — kept separate (browser-cached, parallel) ─────────
    wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', array(), '3.12.5', true);
    wp_enqueue_script('gsap-scrollto', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js', array('gsap'), '3.12.5', true);
    wp_enqueue_script('gsap-scrolltrigger', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', array('gsap'), '3.12.5', true);
    wp_enqueue_script('splittype', 'https://unpkg.com/split-type', array(), '0.3.4', true);

    // ── Vendor global — Three.js (carousel-menu-blob reads window.THREE) ───────
    wp_enqueue_script('three-js', $theme_uri . '/js/three.min.js', array(), '0.158.0', true);

    // ── Showcase carousel — registered only; the shortcode enqueues on demand ──
    $pss_js = $theme_dir . '/js/product-showcase-slider.js';
    wp_register_script(
        'product-showcase-slider',
        $theme_uri . '/js/product-showcase-slider.js',
        array(),
        file_exists($pss_js) ? filemtime($pss_js) : '1.0.0',
        true
    );

    // ── Combined theme bundle (all theme classic scripts, one file) ────────────
    $bundle_path = $theme_dir . '/js/min/theme.bundle.min.js';
    wp_enqueue_script(
        'innotech-bundle',
        $theme_uri . '/js/min/theme.bundle.min.js',
        array('jquery', 'gsap', 'gsap-scrollto', 'gsap-scrolltrigger', 'splittype', 'three-js'),
        file_exists($bundle_path) ? filemtime($bundle_path) : '1.0.0',
        true
    );
    // Inline data the bundled scripts read off window.* — printed before the bundle.
    wp_localize_script('innotech-bundle', 'innotechTheme', array(
        'themeUrl' => $theme_uri,
    ));
    wp_localize_script('innotech-bundle', 'blobAnimationData', array(
        'themeUrl' => $theme_uri,
    ));
    wp_localize_script('innotech-bundle', 'innotechBlogSearch', array(
        'postsUrl'      => rest_url('wp/v2/posts'),
        'categoriesUrl' => rest_url('wp/v2/categories'),
        'perPage'       => 10,
    ));

    // ── ES module — must stay a separate <script type="module"> (see filter) ───
    wp_enqueue_script('liquid-background', $theme_uri . '/js/min/liquid-background.min.js', array(), '1.0.0', true);
    wp_localize_script('liquid-background', 'innotechTheme', array(
        'themeUrl' => $theme_uri,
    ));
}
add_action('wp_enqueue_scripts', 'innotech_enqueue_animation_scripts');

// Add module type to liquid-background script
function innotech_add_module_type($tag, $handle, $src) {
    if ('liquid-background' === $handle) {
        return '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}
add_filter('script_loader_tag', 'innotech_add_module_type', 10, 3);

/* ─── Full-page preloader (Option B) ────────────────────────────────────────
 * Overlay covers the page until window 'load' fires, then waits ~200ms so the
 * GSAP/ScrollTrigger load-handlers run, refreshes ScrollTrigger, and fades out.
 * A 7s hard fallback guarantees it never traps the user (e.g. if a WebGL/3D
 * asset stalls). Skipped in admin, customizer, Divi Visual Builder and no-JS.
 */
function innotech_show_preloader() {
    if ( is_admin() || is_customize_preview() ) return false;
    if ( isset( $_GET['et_fb'] ) || isset( $_GET['et_bfb'] ) ) return false; // Divi builder
    if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) return false;
    return true;
}

function innotech_preloader_head() {
    if ( ! innotech_show_preloader() ) return;
    ?>
<style id="innotech-preloader-css">
html.is-preloading, html.is-preloading body { overflow: hidden !important; }
#innotech-preloader{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:#070c3b;opacity:1;transition:opacity .5s ease;}
html.is-loaded #innotech-preloader{opacity:0;pointer-events:none;}
#innotech-preloader .ip-spinner{width:48px;height:48px;border-radius:50%;border:3px solid rgba(255,255,255,.18);border-top-color:#0084cd;animation:ip-spin .8s linear infinite;}
@keyframes ip-spin{to{transform:rotate(360deg);}}
@media (prefers-reduced-motion: reduce){#innotech-preloader .ip-spinner{animation:none;}}
</style>
<noscript><style>#innotech-preloader{display:none!important;}html.is-preloading,html.is-preloading body{overflow:auto!important;}</style></noscript>
<script id="innotech-preloader-js">
(function(){
  var html=document.documentElement;
  html.classList.add('is-preloading');
  var done=false;
  function reveal(){
    if(done)return;done=true;
    try{ if(window.ScrollTrigger&&ScrollTrigger.refresh){ScrollTrigger.refresh();} }catch(e){}
    requestAnimationFrame(function(){
      html.classList.remove('is-preloading');
      html.classList.add('is-loaded');
      setTimeout(function(){
        var el=document.getElementById('innotech-preloader');
        if(el&&el.parentNode){el.parentNode.removeChild(el);}
      },600);
    });
  }
  // Option B: wait for full load, let GSAP/ScrollTrigger load-handlers run, then settle.
  if(document.readyState==='complete'){ setTimeout(reveal,200); }
  else { window.addEventListener('load',function(){ setTimeout(reveal,200); }); }
  // Hard fallback — a stalled asset/WebGL must never trap the user behind the loader.
  setTimeout(reveal,7000);
})();
</script>
    <?php
}
add_action( 'wp_head', 'innotech_preloader_head', 0 );

function innotech_preloader_markup() {
    if ( ! innotech_show_preloader() ) return;
    echo '<div id="innotech-preloader" role="status" aria-live="polite" aria-label="Loading"><div class="ip-spinner"></div></div>';
}
add_action( 'wp_body_open', 'innotech_preloader_markup', 0 );

// Mouse Animation Divi Module
require_once get_stylesheet_directory() . '/mouse-function.php';

// Nested Grid Module - Allows columns inside columns
require_once get_stylesheet_directory() . '/nested-grid-module.php';

// [product_showcase_slider] — ACF hero carousel for showcase posts
require_once get_stylesheet_directory() . '/product-showcase-slider.php';

// Mouse-follow blob for showcase posts (vertical only). Needs GSAP.
function innotech_enqueue_showcase_blob() {
    if ( ! is_singular( 'showcase' ) ) {
        return;
    }
    $path = get_stylesheet_directory() . '/js/showcase-blob.js';
    wp_enqueue_script(
        'showcase-blob',
        get_stylesheet_directory_uri() . '/js/showcase-blob.js',
        array( 'gsap' ),
        file_exists( $path ) ? filemtime( $path ) : '1.0.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'innotech_enqueue_showcase_blob' );

function innotech_mobile_menu_output() {
  if ( ! wp_is_mobile() ) return;

  echo '<div id="innotech__mobile__menu">';
  wp_nav_menu( array(
    'theme_location' => 'mobile',
    'container'      => false,
    'menu_class'     => 'innotech-mobile-menu',
    'fallback_cb'    => 'wp_page_menu',
  ) );
  echo '</div>';

  // Inline script to move the menu into the Divi column when available
  ?>
  <script>
  (function(){
    if (!window.matchMedia('(max-width:980px)').matches) return;
    function tryMove(){
      var menu = document.getElementById('innotech__mobile__menu');
      var target = document.querySelector('.et_pb_menu .et_pb_menu__wrap');
      if (menu && target) {
        target.appendChild(menu);
        return;
      }
      setTimeout(tryMove, 120);
    }
    document.addEventListener('DOMContentLoaded', tryMove);
    tryMove();
  })();
  </script>
  <?php
}
if ( function_exists( 'wp_body_open' ) ) {
  add_action( 'wp_body_open', 'innotech_mobile_menu_output', 20 );
} else {
  add_action( 'wp_footer', 'innotech_mobile_menu_output', 20 );
}

// Dot Label Divi Module
require_once get_stylesheet_directory() . '/dot-label-function.php';

// Latest Posts Shortcode [innotech_latest_posts]
require_once get_stylesheet_directory() . '/latest-posts-shortcode.php';

// Latest Post Hero Shortcode [innotech_latest_post_hero]
require_once get_stylesheet_directory() . '/latest-post-hero-shortcode.php';

// Blog Posts Listing Shortcode [innotech_blog_posts]
require_once get_stylesheet_directory() . '/blog-posts-shortcode.php';

// ACF: Show Categories field + shortcode [innotech_post_categories]
require_once get_stylesheet_directory() . '/acf-post-categories.php';

// Career Opportunities CPT + Shortcode [innotech_careers]
require_once get_stylesheet_directory() . '/career-opportunities-shortcode.php';

// Profile Carousel Shortcode [profile_carousel]
require_once get_stylesheet_directory() . '/profile-carousel-shortcode.php';

// Google Map Shortcode [innotech_google_map]
require_once get_stylesheet_directory() . '/google-map-shortcode.php';

// Register Lower Footer Menu location
function innotech_register_menus() {
    register_nav_menus( array(
        'lower-footer' => __( 'Lower Footer Menu', 'innotech-divi-child' ),
    ) );
}
add_action( 'init', 'innotech_register_menus' );

// Shortcode [innotech_lower_footer_menu]
function innotech_lower_footer_menu_shortcode() {
    ob_start();
    wp_nav_menu( array(
        'menu'        => 'Lower Footer Menu',
        'container'   => false,
        'menu_class'  => 'innotech-lower-footer-menu',
        'fallback_cb' => false,
        'depth'       => 1,
    ) );
    return ob_get_clean();
}
add_shortcode( 'innotech_lower_footer_menu', 'innotech_lower_footer_menu_shortcode' );

// Load WP admin media helpers for FakerPress REST API (media_handle_sideload lives in wp-admin)
function innotech_load_admin_media_for_rest() {
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
    }
}
add_action( 'init', 'innotech_load_admin_media_for_rest' );

// Enable SVG uploads for admin users only
function enable_svg_uploads_admin_only($mimes) {
    if (current_user_can('manage_options')) {
        $mimes['svg'] = 'image/svg+xml';
    }
    return $mimes;
}
add_filter('upload_mimes', 'enable_svg_uploads_admin_only');



function custom_social_share_buttons() {

    $permalink = get_permalink();

    // Replace local dev URL with the live site URL for social sharing.
    // Social platforms (Facebook, LinkedIn) cannot access localhost URLs.
    // Define LIVE_SITE_URL in wp-config.php when developing locally:
    //   define( 'LIVE_SITE_URL', 'https://yourdomain.com' );
    if ( defined( 'LIVE_SITE_URL' ) ) {
        $permalink = str_replace( untrailingslashit( home_url() ), untrailingslashit( LIVE_SITE_URL ), $permalink );
    }

    $url   = urlencode( $permalink );
    $title = urlencode( get_the_title() );

    ob_start();
    ?>

    <div class="custom-share-buttons">
        <a href="#" class="share-copy-link" onclick="copyShareLink()">Copy Link</a>
        <a class="share-facebook"
           href="https://www.facebook.com/sharer/sharer.php?u=<?php echo esc_attr( $url ); ?>"
           target="_blank" rel="noopener">
           Facebook
        </a>

        <a class="share-linkedin"
           href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo esc_attr( $url ); ?>&title=<?php echo esc_attr( $title ); ?>"
           target="_blank" rel="noopener">
           LinkedIn
        </a>

       
    </div>

    <script>
    function copyShareLink() {
        navigator.clipboard.writeText('<?php echo esc_js( $permalink ); ?>').then(function() {
            alert("Link copied!");
        });
    }
    </script>

    <?php
    return ob_get_clean();
}

add_shortcode('share_buttons', 'custom_social_share_buttons');
/**
 * Custom WooCommerce product loop — horizontal card layout.
 * Each product = full-width card, title/desc/button left, image right.
 *
 * Usage:
 *   [innotech_products limit="8" category="hand-tools" orderby="date" order="DESC"]
 */
function innotech_products_shortcode($atts) {
    if (!class_exists('WooCommerce')) {
        return '';
    }

    $atts = shortcode_atts([
        'limit'    => 8,
        'category' => '',
        'orderby'  => 'date',
        'order'    => 'DESC',
    ], $atts, 'innotech_products');

    $args = [
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => intval($atts['limit']),
        'orderby'        => sanitize_text_field($atts['orderby']),
        'order'          => sanitize_text_field($atts['order']),
    ];

    if (!empty($atts['category'])) {
        $args['tax_query'] = [[
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => array_map('sanitize_title', explode(',', $atts['category'])),
        ]];
    }

    $query = new WP_Query($args);
    if (!$query->have_posts()) {
        return '<p class="innotech-products__empty">' . esc_html__('No products found.', 'innotech') . '</p>';
    }

    ob_start();
    ?>
    <div class="innotech-products">
        <?php while ($query->have_posts()) : $query->the_post();
            global $product;
            if (!$product || !is_a($product, 'WC_Product')) {
                $product = wc_get_product(get_the_ID());
            }
            if (!$product) continue;

            // Cascade through sources: short desc → excerpt → full desc.
            // For each: strip shortcodes; if empty, extract inner text from
            // Divi text/blurb shortcodes; if STILL empty, render shortcodes
            // (do_shortcode) and strip tags. Finally trim to 40 words.
            $sources = array(
                $product->get_short_description(),
                get_the_excerpt(),
                $product->get_description(),
            );
            $desc = '';
            foreach ($sources as $src) {
                if (empty($src)) continue;

                $clean = wp_strip_all_tags(strip_shortcodes($src));
                $clean = trim(preg_replace('/\s+/', ' ', $clean));

                if (strlen($clean) < 20) {
                    if (preg_match_all('/\[et_pb_(?:text|blurb)[^\]]*\](.*?)\[\/et_pb_(?:text|blurb)\]/s', $src, $m)) {
                        $clean = wp_strip_all_tags(implode(' ', $m[1]));
                        $clean = trim(preg_replace('/\s+/', ' ', $clean));
                    }
                }

                if (strlen($clean) < 20) {
                    // Last resort: render shortcodes then strip tags.
                    $rendered = do_shortcode($src);
                    $clean = wp_strip_all_tags($rendered);
                    $clean = trim(preg_replace('/\s+/', ' ', $clean));

                    // Strip Divi WC page chrome: breadcrumb + tab headers
                    // before description. Greedy up to "DescriptionReviews (N)"
                    // or last "Description" then strip suffix tabs.
                    $clean = preg_replace('/^.*?DescriptionReviews\s*\(\d+\)\s*/iu', '', $clean);
                    $clean = preg_replace('/\s*(Related products|Additional information)\b.*$/iu', '', $clean);
                    $clean = trim($clean);
                }

                if (strlen($clean) >= 20) {
                    $desc = wp_trim_words($clean, 40);
                    break;
                }
            }

            // Final fallback: build a blurb from product categories + title.
            if (empty($desc)) {
                $cats = get_the_terms(get_the_ID(), 'product_cat');
                $cat_names = ($cats && !is_wp_error($cats))
                    ? wp_list_pluck($cats, 'name')
                    : array();
                $cat_str = !empty($cat_names) ? implode(', ', $cat_names) : '';
                $desc = $cat_str
                    ? sprintf(
                        __('%1$s — explore the %2$s for InnoTECH industrial monitoring solutions.', 'innotech'),
                        $product->get_name(),
                        $cat_str
                    )
                    : sprintf(
                        __('%s — part of the InnoTECH industrial monitoring product range.', 'innotech'),
                        $product->get_name()
                    );
            }
            ?>
            <article class="innotech-product">
                <div class="innotech-product__content">
                    <h3 class="innotech-product__title"><?php the_title(); ?></h3>
                    <div class="innotech-product__desc">
                        <?php echo wp_kses_post(wpautop($desc)); ?>
                    </div>
                    <a class="innotech-product__btn cta-button" href="<?php the_permalink(); ?>">
                        <span class="cta-button__text"><?php esc_html_e('Read More', 'innotech'); ?></span>
                        <span class="cta-button__icon-wrapper" aria-hidden="true">
                            <svg class="cta-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </a>
                </div>
                <div class="innotech-product__image">
                    <?php echo $product->get_image('large'); ?>
                </div>
            </article>
        <?php endwhile; wp_reset_postdata(); ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('innotech_products', 'innotech_products_shortcode');

// WooCommerce gallery: JS rebuilds Divi-rendered `.woocommerce-product-gallery`
// in place — 1 main image + 2-col grid of thumbs + custom lightbox.
// Disable WC flexslider/zoom features so they don't conflict.
add_action('after_setup_theme', function () {
    remove_theme_support('wc-product-gallery-zoom');
    remove_theme_support('wc-product-gallery-lightbox');
    remove_theme_support('wc-product-gallery-slider');
}, 20);

// Replace WooCommerce breadcrumb separator "/" with chevron-right SVG.
add_filter('woocommerce_breadcrumb_defaults', function ($defaults) {
    $svg = '<svg class="innotech-breadcrumb-sep" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    $defaults['delimiter'] = ' ' . $svg . ' ';
    return $defaults;
});

// ACF "Product Information" field group + shortcodes.
require_once get_stylesheet_directory() . '/acf-product-info.php';

// ACF product_components.instructional_video_file shortcode.
require_once get_stylesheet_directory() . '/acf-product-video.php';

// WooCommerce — always redirect to Cart page after Add to Cart.
add_filter('woocommerce_add_to_cart_redirect', function () {
    return wc_get_cart_url();
});

// Disable AJAX add-to-cart so the redirect filter above takes effect even
// from shop/archive pages (AJAX would otherwise bypass the page reload).
add_filter('option_woocommerce_enable_ajax_add_to_cart', function () {
    return 'no';
});
add_filter('option_woocommerce_cart_redirect_after_add', function () {
    return 'yes';
});

// Divi WC Add-to-Cart module uses its own button — same form, so the WC
// redirect filter applies. No extra hook required.

// [product_details post_id="N"] shortcode + 3D viewer.
require_once get_stylesheet_directory() . '/product-details-shortcode.php';

// Emit a Three.js importmap so the viewer's ESM imports resolve. Must run
// before the module script tag — wp_head priority 1.
add_action('wp_head', function () {
    ?>
    <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.158.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.158.0/examples/jsm/"
      }
    }
    </script>
    <?php
}, 1);

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script(
        'product-details-viewer',
        get_stylesheet_directory_uri() . '/js/product-details-viewer.js',
        array(),
        '1.0.0',
        true
    );

    // .innotech-product-video-wrapper script ships inside theme.bundle.min.js
    // (added to gulpfile bundleOrder). No separate enqueue needed.
}, 30);

// Force product-details-viewer to load as ES module so import() resolves.
add_filter('script_loader_tag', function ($tag, $handle) {
    if ($handle === 'product-details-viewer') {
        return str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 2);
