<?php
/**
 * Latest Post Hero Shortcode
 * Usage: [innotech_latest_post_hero]
 *
 * Displays the single latest published post as a full-width hero card.
 * Layout: 2-column grid — left: meta + title | right: Read More button.
 * Background: post featured image with grayscale/dark overlay.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

function innotech_latest_post_hero_shortcode() {
    $query = new WP_Query( array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ) );

    if ( ! $query->have_posts() ) {
        return '';
    }

    $query->the_post();

    $post_id       = get_the_ID();
    $permalink     = get_permalink();
    $title         = get_the_title();
    $date          = get_the_date( 'F j, Y' );
    $thumbnail_url = get_the_post_thumbnail_url( $post_id, 'full' );
    $bg_style      = $thumbnail_url
        ? 'background-image:url(' . esc_url( $thumbnail_url ) . ');'
        : 'background-color:#111;';

    $categories = get_the_category();
    $cat_name   = ! empty( $categories ) ? esc_html( $categories[0]->name ) : '';

    ob_start();
    ?>
    <article class="innotech-lph" style="<?php echo $bg_style; ?>">
        <a href="<?php echo esc_url( $permalink ); ?>" class="innotech-lph__link" aria-label="<?php echo esc_attr( $title ); ?>"></a>
        <div class="innotech-lph__body">
            <div class="innotech-lph__left">
                <div class="innotech-lph__meta">
                    <span class="innotech-lph__date"><?php echo esc_html( $date ); ?></span>
                    <?php if ( $cat_name ) : ?>
                        <span class="innotech-lph__sep">•</span>
                        <span class="innotech-lph__cat"><?php echo $cat_name; ?></span>
                    <?php endif; ?>
                </div>
                <h2 class="innotech-lph__title"><?php echo esc_html( $title ); ?></h2>
            </div>
            <div class="innotech-lph__right">
                <a href="<?php echo esc_url( $permalink ); ?>" class="innotech-lph__btn">
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
            </div>
        </div>
    </article>
    <?php
    wp_reset_postdata();
    return ob_get_clean();
}
add_shortcode( 'innotech_latest_post_hero', 'innotech_latest_post_hero_shortcode' );
