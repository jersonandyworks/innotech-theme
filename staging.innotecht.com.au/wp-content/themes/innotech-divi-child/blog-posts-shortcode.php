<?php
/**
 * Blog Posts Listing Shortcode
 * Usage: [innotech_blog_posts count="5" cat_limit="3"]
 *
 * Attributes:
 *   count     - Number of posts to display (default: 5)
 *   cat_limit - Number of categories shown in the filter row (default: 3)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

function innotech_blog_posts_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'count'     => 5,
        'cat_limit' => 3,
    ), $atts, 'innotech_blog_posts' );

    // Fetch top categories by post count
    $filter_cats = get_categories( array(
        'orderby'    => 'count',
        'order'      => 'DESC',
        'number'     => absint( $atts['cat_limit'] ),
        'hide_empty' => true,
    ) );

    // Query posts — offset 1 to skip the latest post (featured in hero shortcode)
    $query = new WP_Query( array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => absint( $atts['count'] ),
        'orderby'        => 'date',
        'order'          => 'DESC',
        'offset'         => 1,
    ) );

    if ( ! $query->have_posts() ) {
        return '';
    }

    $arrow_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    ob_start();
    ?>
    <div id="latest-blog-container">
        <div class="innotech-blog">

            <?php /* ── Row 1: Filters + Search ── */ ?>
            <div class="innotech-blog__filters">

                <div class="innotech-blog__cats">
                    <a href="#" class="innotech-blog__cat-btn innotech-blog__cat-btn--active" data-category="all">All</a>
                    <?php foreach ( $filter_cats as $cat ) : ?>
                        <a href="#" class="innotech-blog__cat-btn" data-category="<?php echo esc_attr( $cat->slug ); ?>">
                            <?php echo esc_html( $cat->name ); ?>
                        </a>
                    <?php endforeach; ?>
                </div>

                <div class="innotech-blog__search">
                    <input
                        type="text"
                        class="innotech-blog__search-input"
                        placeholder="Search..."
                        aria-label="Search posts"
                    >
                    <button type="button" class="innotech-blog__search-btn" aria-label="Submit search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>
                </div>

            </div>

            <?php /* ── Row 2: Posts ── */ ?>
            <div class="innotech-blog__posts">
                <?php
                $is_first = true;
                while ( $query->have_posts() ) :
                    $query->the_post();

                    $post_id       = get_the_ID();
                    $permalink     = get_permalink();
                    $title         = get_the_title();
                    $date          = get_the_date( 'F j, Y' );
                    $excerpt       = wp_trim_words( get_the_excerpt(), 25, '...' );
                    $thumbnail_id  = get_post_thumbnail_id( $post_id );
                    $thumbnail_url = get_the_post_thumbnail_url( $post_id, 'large' );
                    $thumbnail_alt = $thumbnail_id ? get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true ) : '';

                    $post_cats = get_the_category();
                    $cat_name  = ! empty( $post_cats ) ? esc_html( $post_cats[0]->name ) : '';
                    $cat_slug  = ! empty( $post_cats ) ? esc_attr( $post_cats[0]->slug ) : '';

                    if ( ! $is_first ) : ?>
                        <hr class="innotech-blog__divider">
                    <?php endif; ?>

                    <article class="innotech-blog__post" data-category="<?php echo $cat_slug; ?>">

                        <div class="innotech-blog__post-img">
                            <?php if ( $thumbnail_url ) : ?>
                                <img
                                    src="<?php echo esc_url( $thumbnail_url ); ?>"
                                    alt="<?php echo esc_attr( $thumbnail_alt ?: $title ); ?>"
                                    loading="lazy"
                                >
                            <?php else : ?>
                                <div class="innotech-blog__post-img-fallback"></div>
                            <?php endif; ?>
                        </div>

                        <div class="innotech-blog__post-content">
                            <div class="innotech-blog__post-meta">
                                <span class="innotech-blog__post-date"><?php echo esc_html( $date ); ?></span>
                                <?php if ( $cat_name ) : ?>
                                    <span class="innotech-blog__post-sep">•</span>
                                    <span class="innotech-blog__post-cat"><?php echo $cat_name; ?></span>
                                <?php endif; ?>
                            </div>
                            <h3 class="innotech-blog__post-title">
                                <a href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $title ); ?></a>
                            </h3>
                            <p class="innotech-blog__post-excerpt"><?php echo esc_html( $excerpt ); ?></p>
                            <div class="innotech-blog__post-actions">
                                <a href="<?php echo esc_url( $permalink ); ?>" class="innotech-blog__post-btn">
                                    Read More <?php echo $arrow_svg; ?>
                                </a>
                            </div>
                        </div>

                    </article>

                    <?php $is_first = false;
                endwhile;
                wp_reset_postdata();
                ?>
            </div>

        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'innotech_blog_posts', 'innotech_blog_posts_shortcode' );
