<?php
/**
 * Shortcodes for ACF product_components video subfields.
 *
 *   [product_video id="N"]   → instructional_video_file
 *   [full_video    id="N"]   → full_video_file
 *
 * Both render an HTML5 video with a centered play overlay (icn-video-play.png).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shared renderer — reads a file subfield from `product_components` and emits
 * the standard .innotech-product-video markup.
 */
function innotech_render_acf_video($subfield, $post_id) {
    if (!function_exists('get_field')) return '';

    $components = get_field('product_components', $post_id);
    if (empty($components) || empty($components[$subfield])) return '';

    $file = $components[$subfield];

    // ACF file field can return URL string, ID, or array.
    $url = '';
    if (is_array($file)) {
        $url = isset($file['url']) ? $file['url'] : '';
    } elseif (is_numeric($file)) {
        $url = wp_get_attachment_url(intval($file));
    } else {
        $url = (string) $file;
    }
    if (empty($url)) return '';

    $poster = '';
    if (is_array($file) && !empty($file['image']['sizes']['large'])) {
        $poster = $file['image']['sizes']['large'];
    }

    $play_icon = get_stylesheet_directory_uri() . '/_assets/icn-video-play.png';

    ob_start();
    ?>
    <div class="innotech-product-video">
        <video class="innotech-product-video__media"
               preload="metadata"
               playsinline
               <?php if ($poster) : ?>poster="<?php echo esc_url($poster); ?>"<?php endif; ?>>
            <source src="<?php echo esc_url($url); ?>" type="video/mp4">
        </video>
        <button type="button"
                class="innotech-product-video__play"
                aria-label="<?php esc_attr_e('Play video', 'innotech'); ?>">
            <img src="<?php echo esc_url($play_icon); ?>"
                 alt=""
                 class="innotech-product-video__play-icon"
                 width="80" height="80" />
        </button>
    </div>
    <?php
    return ob_get_clean();
}

function innotech_product_video_shortcode($atts) {
    $atts = shortcode_atts(array('id' => ''), $atts, 'product_video');
    $post_id = $atts['id'] !== '' ? intval($atts['id']) : get_the_ID();
    if (!$post_id) return '';
    return innotech_render_acf_video('instructional_video_file', $post_id);
}
add_shortcode('product_video', 'innotech_product_video_shortcode');

function innotech_full_video_shortcode($atts) {
    $atts = shortcode_atts(array('id' => ''), $atts, 'full_video');
    $post_id = $atts['id'] !== '' ? intval($atts['id']) : get_the_ID();
    if (!$post_id) return '';
    return innotech_render_acf_video('full_video_file', $post_id);
}
add_shortcode('full_video', 'innotech_full_video_shortcode');
