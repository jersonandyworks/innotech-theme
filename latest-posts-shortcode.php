<?php
/**
 * Latest Posts Shortcode
 * Usage: [innotech_latest_posts count="2" category=""]
 *
 * Attributes:
 *   count    - Number of posts to display (default: 2)
 *   category - Category slug to filter by (default: all)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

function innotech_latest_posts_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'count'    => 2,
        'category' => '',
    ), $atts, 'innotech_latest_posts' );

    $query_args = array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => absint( $atts['count'] ),
        'orderby'        => 'date',
        'order'          => 'DESC',
    );

    if ( ! empty( $atts['category'] ) ) {
        $query_args['category_name'] = sanitize_text_field( $atts['category'] );
    }

    $posts = new WP_Query( $query_args );

    if ( ! $posts->have_posts() ) {
        return '';
    }

    ob_start();
    ?>
    <div class="innotech-lp">
        <div class="innotech-lp__grid">
            <?php
            $index = 0;
            while ( $posts->have_posts() ) :
                $posts->the_post();

                $thumbnail_url = get_the_post_thumbnail_url( get_the_ID(), 'full' );
                $fallback_bg   = 'background-color:#111;';
                $bg_style      = $thumbnail_url
                    ? 'background-image:url(' . esc_url( $thumbnail_url ) . ');'
                    : $fallback_bg;

                $categories  = get_the_category();
                $cat_name    = ! empty( $categories ) ? esc_html( $categories[0]->name ) : '';
                $cat_link    = ! empty( $categories ) ? esc_url( get_category_link( $categories[0]->term_id ) ) : '';

                $card_class  = 'innotech-lp__card';
                if ( $index === 0 ) {
                    $card_class .= ' innotech-lp__card--primary';
                } else {
                    $card_class .= ' innotech-lp__card--secondary';
                }
                ?>
                <article class="<?php echo esc_attr( $card_class ); ?>" style="<?php echo $bg_style; ?>">
                    <a href="<?php the_permalink(); ?>" class="innotech-lp__card-link" aria-label="<?php the_title_attribute(); ?>"></a>
                    <div class="innotech-lp__card-overlay"></div>
                    <div class="innotech-lp__card-content">
                        <?php if ( $cat_name ) : ?>
                            <a href="<?php echo $cat_link; ?>" class="innotech-lp__category"><?php echo $cat_name; ?></a>
                        <?php endif; ?>
                        <h3 class="innotech-lp__title"><?php the_title(); ?></h3>
                    </div>
                </article>
                <?php
                $index++;
            endwhile;
            wp_reset_postdata();
            ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'innotech_latest_posts', 'innotech_latest_posts_shortcode' );
