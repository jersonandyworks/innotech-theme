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

// Mouse Animation Divi Module
require_once get_stylesheet_directory() . '/mouse-function.php';

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
