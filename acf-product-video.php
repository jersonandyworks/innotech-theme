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
 * Normalise an ACF file field value (URL string / ID / array) to a URL.
 */
function innotech_acf_file_to_url($file) {
    if (empty($file)) return '';
    if (is_array($file)) {
        return isset($file['url']) ? $file['url'] : '';
    }
    if (is_numeric($file)) {
        return wp_get_attachment_url(intval($file));
    }
    return (string) $file;
}

/**
 * Emit the standard .innotech-product-video markup: an HTML5 video with NO
 * controls plus a centered play overlay (icn-video-play.png). Play / pause /
 * icon visibility are driven by js/product-video.js (delegated, forces
 * controls off), so any block using these classes behaves the same.
 */
function innotech_video_markup($url, $poster = '') {
    if (empty($url)) return '';
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

/**
 * Shared renderer — reads a file subfield from `product_components` and emits
 * the standard .innotech-product-video markup.
 */
function innotech_render_acf_video($subfield, $post_id) {
    if (!function_exists('get_field')) return '';

    $components = get_field('product_components', $post_id);
    if (empty($components) || empty($components[$subfield])) return '';

    $file   = $components[$subfield];
    $url    = innotech_acf_file_to_url($file);
    $poster = (is_array($file) && !empty($file['image']['sizes']['large'])) ? $file['image']['sizes']['large'] : '';

    return innotech_video_markup($url, $poster);
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

/**
 * [play_full_video id="N"] → showcase top-level `play_full_video_file` field.
 * Same no-controls + play-icon overlay as the product videos.
 */
function innotech_play_full_video_shortcode($atts) {
    $atts = shortcode_atts(array('id' => ''), $atts, 'play_full_video');

    // Inside a Divi Theme Builder template get_the_ID() returns the template id,
    // not the showcase post — use the queried (real) post id by default.
    if ($atts['id'] !== '') {
        $post_id = intval($atts['id']);
    } else {
        $post_id = get_queried_object_id();
        if (!$post_id) $post_id = get_the_ID();
    }
    if (!$post_id || !function_exists('get_field')) return '';

    $file = get_field('play_full_video_file', $post_id);
    return innotech_video_markup(innotech_acf_file_to_url($file));
}
add_shortcode('play_full_video', 'innotech_play_full_video_shortcode');
