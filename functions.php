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

    // Liquid background effect
    wp_enqueue_script('liquid-background', get_stylesheet_directory_uri() . '/js/min/liquid-background.min.js', array(), '1.0.0', true);
    wp_localize_script('liquid-background', 'innotechTheme', array(
        'themeUrl' => get_stylesheet_directory_uri()
    ));

    // Horizontal pin scroll (GSAP ScrollTrigger)
    wp_enqueue_script('horizontal-pin-scroll', get_stylesheet_directory_uri() . '/js/min/locomotive-scroll-init.min.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);

    // Footer background sway effect
    wp_enqueue_script('footer-bg-sway', get_stylesheet_directory_uri() . '/js/footer-bg-sway.js', array('gsap'), '1.0.0', true);
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