<?php
/**
 * Career Opportunities Shortcode
 *
 * Post type : career-opportunities (already registered)
 * Content   : post title → accordion trigger
 *             post content → right-side panel
 * ACF field : co_apply_url (url) — optional Apply Now button
 *
 * Usage: [innotech_careers]
 *        [innotech_careers heading="Open Positions" count="-1"]
 */
if ( ! defined( 'ABSPATH' ) ) exit;

// ── 1. ACF: Apply Now URL field on career-opportunities ───────────────────────
add_action( 'acf/init', function () {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    acf_add_local_field_group( array(
        'key'    => 'group_career_opportunities',
        'title'  => 'Position Details',
        'fields' => array(
            array(
                'key'   => 'field_co_apply_url',
                'label' => 'Apply Now URL',
                'name'  => 'co_apply_url',
                'type'  => 'url',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'career-opportunities',
                ),
            ),
        ),
        'position' => 'side',
        'active'   => true,
    ) );
} );

// ── 2. Shortcode [innotech_careers] ───────────────────────────────────────────
function innotech_careers_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'heading' => 'Career Opportunities',
        'count'   => -1,
    ), $atts, 'innotech_careers' );

    $query = new WP_Query( array(
        'post_type'      => 'career-opportunities',
        'post_status'    => 'publish',
        'posts_per_page' => intval( $atts['count'] ),
        'orderby'        => 'menu_order date',
        'order'          => 'ASC',
    ) );

    if ( ! $query->have_posts() ) return '';

    $arrow_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    ob_start();
    ?>
    <div class="innotech-careers">

        <?php if ( $atts['heading'] ) : ?>
            <h2 class="innotech-careers__heading"><?php echo esc_html( $atts['heading'] ); ?></h2>
        <?php endif; ?>

        <div class="innotech-careers__list">
            <?php while ( $query->have_posts() ) : $query->the_post();
                $post_id   = get_the_ID();
                $title     = get_the_title();
                $content   = apply_filters( 'the_content', get_the_content() );
                $apply_url = function_exists( 'get_field' ) ? get_field( 'co_apply_url', $post_id ) : '';
            ?>
            <div class="innotech-careers__item">
                <hr class="innotech-careers__divider">
                <div class="innotech-careers__inner">

                    <button
                        class="innotech-careers__trigger"
                        aria-expanded="false"
                        aria-controls="career-panel-<?php echo $post_id; ?>"
                    >
                        <span class="innotech-careers__icon" aria-hidden="true"></span>
                        <span class="innotech-careers__name"><?php echo esc_html( $title ); ?></span>
                    </button>

                    <div
                        class="innotech-careers__panel"
                        id="career-panel-<?php echo $post_id; ?>"
                        hidden
                    >
                        <?php if ( $content ) : ?>
                            <div class="innotech-careers__content">
                                <?php echo wp_kses_post( $content ); ?>
                            </div>
                        <?php endif; ?>

                        <?php if ( $apply_url ) : ?>
                            <a
                                href="<?php echo esc_url( $apply_url ); ?>"
                                class="innotech-careers__apply-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Apply Now <?php echo $arrow_svg; ?>
                            </a>
                        <?php endif; ?>
                    </div>

                </div>
            </div>
            <?php endwhile; wp_reset_postdata(); ?>

            <hr class="innotech-careers__divider">
        </div>

    </div>

    <script>
    (function () {
        var lists = document.querySelectorAll('.innotech-careers__list');
        lists.forEach(function (list) {
            list.querySelectorAll('.innotech-careers__trigger').forEach(function (trigger) {
                trigger.addEventListener('click', function () {
                    var item   = this.closest('.innotech-careers__item');
                    var panel  = document.getElementById( this.getAttribute('aria-controls') );
                    var isOpen = item.classList.contains('innotech-careers__item--open');

                    // Close all items in this list
                    list.querySelectorAll('.innotech-careers__item--open').forEach(function (openItem) {
                        openItem.classList.remove('innotech-careers__item--open');
                        openItem.querySelector('.innotech-careers__trigger').setAttribute('aria-expanded', 'false');
                        openItem.querySelector('.innotech-careers__panel').hidden = true;
                    });

                    // Open clicked item if it was closed
                    if ( ! isOpen ) {
                        item.classList.add('innotech-careers__item--open');
                        this.setAttribute('aria-expanded', 'true');
                        panel.hidden = false;
                    }
                });
            });
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode( 'innotech_careers', 'innotech_careers_shortcode' );
