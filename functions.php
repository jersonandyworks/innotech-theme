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
        wp_enqueue_style( 'chld_thm_cfg_separate', trailingslashit( get_stylesheet_directory_uri() ) . 'ctc-style.css', array(  ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'child_theme_configurator_css', 99999998 );

// END ENQUEUE PARENT ACTION

// Enqueue GSAP, SplitType and custom effects
function innotech_enqueue_animation_scripts() {
    // GSAP
    wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', array(), '3.12.5', true);

    // GSAP Plugins
    wp_enqueue_script('gsap-scrollto', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js', array('gsap'), '3.12.5', true);
    wp_enqueue_script('gsap-scrolltrigger', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', array('gsap'), '3.12.5', true);
    wp_enqueue_script('map-swirl', get_stylesheet_directory_uri() . '/js/map-swirl.js', array('gsap'), '1.0.0', true);
    wp_enqueue_script('blurb', get_stylesheet_directory_uri() . '/js/blurb.js', array('gsap'), '1.0.0', true);
    wp_localize_script('blurb', 'innotechTheme', array(
        'themeUrl' => get_stylesheet_directory_uri()
    ));
    // SplitType for text animations
    wp_enqueue_script('splittype', 'https://unpkg.com/split-type', array(), '0.3.4', true);

    // Button glow effect
    wp_enqueue_script('button-particles', get_stylesheet_directory_uri() . '/js/min/button-particles.min.js', array('gsap'), '1.0.0', true);

    // Text heading effect
    wp_enqueue_script('text-heading-effect', get_stylesheet_directory_uri() . '/js/min/text-heading-effect.min.js', array('gsap', 'splittype'), '1.0.0', true);

    // Scroll effects (jQuery)
    wp_enqueue_script('scroll-effects', get_stylesheet_directory_uri() . '/js/min/scroll-effects.min.js', array('jquery'), '1.0.0', true);

    // Side navigation
    wp_enqueue_script('side-nav', get_stylesheet_directory_uri() . '/js/min/side-nav.min.js', array('gsap', 'gsap-scrollto', 'gsap-scrolltrigger'), '1.0.0', true);

    // Blob animation
    wp_enqueue_script('blob-animation', get_stylesheet_directory_uri() . '/js/blob-animation.js', array('gsap'), '1.0.0', true);
    wp_localize_script('blob-animation', 'blobAnimationData', array(
        'themeUrl' => get_stylesheet_directory_uri()
    ));

    // Section8 scroll-tick pin
    wp_enqueue_script('mask-zoom-effect', get_stylesheet_directory_uri() . '/js/mask-zoom-effect.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);

    // Scroll-driven mask reveal (clip-path inset grows as user scrolls)
    wp_enqueue_script('mask-reveal', get_stylesheet_directory_uri() . '/js/mask-reveal.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);

    // Liquid background effect
    wp_enqueue_script('liquid-background', get_stylesheet_directory_uri() . '/js/min/liquid-background.min.js', array(), '1.0.0', true);
    wp_localize_script('liquid-background', 'innotechTheme', array(
        'themeUrl' => get_stylesheet_directory_uri()
    ));

    // Horizontal pin scroll (GSAP ScrollTrigger)
    wp_enqueue_script('horizontal-pin-scroll', get_stylesheet_directory_uri() . '/js/min/locomotive-scroll-init.min.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);

    // Footer background sway effect
    wp_enqueue_script('footer-bg-sway', get_stylesheet_directory_uri() . '/js/footer-bg-sway.js', array('gsap'), '1.0.0', true);

    // Autoplay HTML5 videos with .autoplay-video class
    wp_enqueue_script('video-autoplay', get_stylesheet_directory_uri() . '/js/video-autoplay.js', array(), '1.0.0', true);

    // Mobile menu (hamburger + fullscreen overlay)
    wp_enqueue_script('mobile-menu', get_stylesheet_directory_uri() . '/js/mobile-menu.js', array(), '1.0.0', true);

    // Interactive product blueprint hotspot diagram (GSAP + ScrollTrigger)
    wp_enqueue_script('product-blueprint', get_stylesheet_directory_uri() . '/js/product-blueprint.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);

    // WooCommerce custom gallery lightbox — JS rebuilds gallery DOM + GSAP popup.
    // Always load (self-bails if no gallery). Avoids is_product() misses on Divi.
    wp_enqueue_script('wc-gallery-lightbox', get_stylesheet_directory_uri() . '/js/wc-gallery-lightbox.js', array('gsap'), '1.0.8', true);

    // Breadcrumb separator → chevron-right (Divi WC breadcrumb hardcodes "/")
    wp_enqueue_script('breadcrumb-chevron', get_stylesheet_directory_uri() . '/js/breadcrumb-chevron.js', array(), '1.0.0', true);

    // WC quantity input — inject minus/plus buttons.
    wp_enqueue_script('wc-qty-add-to-cart', get_stylesheet_directory_uri() . '/js/wc-qty-add-to-cart.js', array(), '1.0.0', true);

    // ACF Product Information tabs.
    wp_enqueue_script('product-info-tabs', get_stylesheet_directory_uri() . '/js/product-info-tabs.js', array(), '1.0.0', true);

    // ACF Product Information layout (features + accordion).
    wp_enqueue_script('product-info-layout', get_stylesheet_directory_uri() . '/js/product-info-layout.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'innotech_enqueue_animation_scripts');

// Blog search script
function innotech_enqueue_blog_search() {
    wp_enqueue_script(
        'blog-search',
        get_stylesheet_directory_uri() . '/js/blog-search.js',
        array(),
        '1.0.0',
        true
    );
    wp_localize_script( 'blog-search', 'innotechBlogSearch', array(
        'postsUrl'      => rest_url( 'wp/v2/posts' ),
        'categoriesUrl' => rest_url( 'wp/v2/categories' ),
        'perPage'       => 10,
    ) );
}
add_action( 'wp_enqueue_scripts', 'innotech_enqueue_blog_search' );

// Add module type to liquid-background script
function innotech_add_module_type($tag, $handle, $src) {
    if ('liquid-background' === $handle) {
        return '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}
add_filter('script_loader_tag', 'innotech_add_module_type', 10, 3);

// Mouse Animation Divi Module
require_once get_stylesheet_directory() . '/mouse-function.php';

// Nested Grid Module - Allows columns inside columns
require_once get_stylesheet_directory() . '/nested-grid-module.php';

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
