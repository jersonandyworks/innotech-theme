<?php

/**
 * InnoTech Dot Label Divi Module
 */
function innotech_initialize_dot_label_module() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        require_once get_stylesheet_directory() . '/includes/modules/DotLabel/DotLabel.php';
    }
}
add_action( 'et_builder_ready', 'innotech_initialize_dot_label_module' );

/**
 * Enqueue Dot Label Module Styles
 */
function innotech_dot_label_styles() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        wp_enqueue_style(
            'innotech-dot-label',
            get_stylesheet_directory_uri() . '/includes/modules/DotLabel/style.css',
            array(),
            '1.0.0'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'innotech_dot_label_styles' );

/**
 * Enqueue Dot Label Module Styles for Divi Builder
 */
function innotech_dot_label_builder_assets() {
    if ( class_exists( 'ET_Builder_Module' ) ) {
        wp_enqueue_style(
            'innotech-dot-label-builder',
            get_stylesheet_directory_uri() . '/includes/modules/DotLabel/style.css',
            array(),
            '1.0.0'
        );
    }
}
add_action( 'et_fb_enqueue_assets', 'innotech_dot_label_builder_assets' );
