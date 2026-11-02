<?php 


/**
 * InnoTech Mouse Animation Divi Module
 */
function innotech_initialize_mouse_animation_module() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        require_once get_stylesheet_directory() . '/includes/modules/MouseAnimation/MouseAnimation.php';
    }
}
add_action( 'et_builder_ready', 'innotech_initialize_mouse_animation_module' );

/**
 * Enqueue Mouse Animation Module Styles
 */
function innotech_mouse_animation_styles() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        wp_enqueue_style(
            'innotech-mouse-animation',
            get_stylesheet_directory_uri() . '/includes/modules/MouseAnimation/style.css',
            array(),
            '1.0.0'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'innotech_mouse_animation_styles' );

/**
 * Enqueue Mouse Animation Module Styles for Divi Builder
 */
function innotech_mouse_animation_builder_assets() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        wp_enqueue_style(
            'innotech-mouse-animation-builder',
            get_stylesheet_directory_uri() . '/includes/modules/MouseAnimation/style.css',
            array(),
            '1.0.0'
        );
    }
}
add_action( 'et_fb_enqueue_assets', 'innotech_mouse_animation_builder_assets' );