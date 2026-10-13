<?php
/**
 * [product_details post_id="N"]
 *
 * Renders the ACF "Product Details" group for a `product-detail` post:
 *   - Col 1: .kit-menu of product_detail_{n}_label items (skip empty)
 *   - Col 2: Three.js viewer for 3d_object_file (.glb), horizontal rotate only
 *   - Col 3: HTML content from product_detail_{n}_text — swaps on label click
 */

if (!defined('ABSPATH')) {
    exit;
}

function innotech_product_details_shortcode($atts) {
    if (!function_exists('get_field')) return '';

    $atts = shortcode_atts(array(
        'post_id' => '',
    ), $atts, 'product_details');

    $post_id = $atts['post_id'] !== '' ? intval($atts['post_id']) : get_the_ID();
    if (!$post_id) return '';

    // Gather non-empty label/text pairs.
    $items = array();
    for ($i = 1; $i <= 4; $i++) {
        $label = trim((string) get_field("product_detail_{$i}_label", $post_id));
        if ($label === '') continue;
        $text = (string) get_field("product_detail_{$i}_text", $post_id);
        $items[] = array(
            'index' => $i,
            'label' => $label,
            'text'  => $text,
        );
    }
    if (empty($items)) return '';

    // 3D file (file field, return format = url).
    $glb_url = get_field('3d_object_file', $post_id);
    if (is_array($glb_url)) {
        $glb_url = isset($glb_url['url']) ? $glb_url['url'] : '';
    } elseif (is_numeric($glb_url)) {
        $glb_url = wp_get_attachment_url(intval($glb_url));
    }

    $uid = 'pd-' . wp_unique_id();

    ob_start();
    ?>
    <section class="product-details" id="<?php echo esc_attr($uid); ?>">
        <div class="product-details__menu">
            <ul class="kit-menu">
                <?php foreach ($items as $i => $it) : ?>
                    <li class="<?php echo $i === 0 ? 'active' : ''; ?>" data-index="<?php echo esc_attr($it['index']); ?>">
                        <a href="#" data-pd-target="<?php echo esc_attr($it['index']); ?>"><?php echo esc_html($it['label']); ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="product-details__viewer">
            <?php if ($glb_url) : ?>
                <div class="product-details__3d"
                     data-glb="<?php echo esc_url($glb_url); ?>"
                     aria-label="3D model viewer"></div>
            <?php else : ?>
                <img class="product-details__fallback"
                     src="<?php echo esc_url(get_stylesheet_directory_uri() . '/_assets/innotecht-logo-xl.png'); ?>"
                     alt=""
                     loading="lazy" />
            <?php endif; ?>
        </div>

        <div class="product-details__content">
            <?php foreach ($items as $i => $it) : ?>
                <div class="product-details__panel <?php echo $i === 0 ? 'is-active' : ''; ?>"
                     data-index="<?php echo esc_attr($it['index']); ?>">
                    <?php echo wp_kses_post($it['text']); ?>
                </div>
            <?php endforeach; ?>
        </div>
    </section>
    <?php
    return ob_get_clean();
}
add_shortcode('product_details', 'innotech_product_details_shortcode');
