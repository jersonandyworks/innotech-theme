<?php
/**
 * ACF: Featured Post Images Field Group
 *
 * Field group: "Featured Post Images" (registered on all Posts).
 * Fields:
 *   - show_categories  (radio: enabled / disabled)
 *   - show_date_post   (radio: enabled / disabled)
 *
 * Shortcode: [innotech_post_categories]
 */
if ( ! defined( 'ABSPATH' ) ) exit;

// ── 1. Register field group ───────────────────────────────────────────────────
add_action( 'acf/init', function () {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    acf_add_local_field_group( array(
        'key'      => 'group_featured_post_images',
        'title'    => 'Featured Post Images',
        'fields'   => array(
            array(
                'key'           => 'field_show_categories',
                'label'         => 'Show Categories',
                'name'          => 'show_categories',
                'type'          => 'radio',
                'choices'       => array(
                    'enabled'  => 'Enabled',
                    'disabled' => 'Disabled',
                ),
                'default_value' => 'disabled',
                'layout'        => 'horizontal',
                'return_format' => 'value',
            ),
            array(
                'key'           => 'field_show_date_post',
                'label'         => 'Show Date Post',
                'name'          => 'show_date_post',
                'type'          => 'radio',
                'choices'       => array(
                    'enabled'  => 'Enabled',
                    'disabled' => 'Disabled',
                ),
                'default_value' => 'disabled',
                'layout'        => 'horizontal',
                'return_format' => 'value',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'post',
                ),
            ),
        ),
        'position'      => 'side',
        'style'         => 'default',
        'label_placement' => 'top',
        'active'        => true,
    ) );
} );

// ── 2. Shortcode [innotech_post_categories] ───────────────────────────────────
function innotech_post_categories_shortcode( $atts ) {
    $post_id = get_the_ID();

    if ( ! $post_id ) return '';

    $show_cats = get_field( 'show_categories', $post_id );

    if ( 'Enable' !== $show_cats ) return '';

    $categories = get_the_category( $post_id );

    if ( empty( $categories ) ) return '';

    ob_start();
    ?>
    <div class="innotech-post-meta-acf__cats">
        <?php foreach ( $categories as $cat ) : ?>
            <a
                href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"
                class="innotech-post-meta-acf__cat"
            >
                <?php echo esc_html( $cat->name ); ?>
            </a> <?php if (next($categories)): ?>, <?php endif; ?>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'innotech_post_categories', 'innotech_post_categories_shortcode' );

// ── 3. Shortcode [innotech_post_date] ─────────────────────────────────────────
function innotech_post_date_shortcode( $atts ) {
    $post_id = get_the_ID();

    if ( ! $post_id ) return '';

    $show_date = get_field( 'show_date_post', $post_id );

    if ( 'Enable' !== $show_date ) return '';

    return '<span class="innotech-post-meta-acf__date">'
        . esc_html( get_the_date( 'F j, Y', $post_id ) )
        . '</span>';
}
add_shortcode( 'innotech_post_date', 'innotech_post_date_shortcode' );


