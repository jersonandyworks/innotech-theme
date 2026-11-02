<?php
/**
 * ACF: "Product Information" field group for WooCommerce product post type.
 *
 * Fields:
 *   - product_features  (wysiwyg)
 *   - product_overview  (wysiwyg)
 *   - product_shipping  (wysiwyg)
 *
 * Shortcodes:
 *   [product_info field="features|overview|shipping"]   Output one field.
 *   [product_info_tabs]                                  Render all 3 as tabs.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the field group when ACF is active.
 */
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key'      => 'group_innotech_product_info',
        'title'    => 'Product Information',
        'fields'   => array(
            array(
                'key'           => 'field_innotech_product_features',
                'label'         => 'Product Features',
                'name'          => 'product_features',
                'type'          => 'wysiwyg',
                'instructions'  => 'Key features / specs. Bullet lists work well here.',
                'tabs'          => 'all',
                'toolbar'       => 'full',
                'media_upload'  => 1,
                'delay'         => 0,
            ),
            array(
                'key'           => 'field_innotech_product_overview',
                'label'         => 'Product Overview',
                'name'          => 'product_overview',
                'type'          => 'wysiwyg',
                'instructions'  => 'High-level overview / summary description.',
                'tabs'          => 'all',
                'toolbar'       => 'full',
                'media_upload'  => 1,
                'delay'         => 0,
            ),
            array(
                'key'           => 'field_innotech_product_shipping',
                'label'         => 'Shipping & Returns',
                'name'          => 'product_shipping',
                'type'          => 'wysiwyg',
                'instructions'  => 'Shipping policy, delivery times, returns terms.',
                'tabs'          => 'all',
                'toolbar'       => 'full',
                'media_upload'  => 1,
                'delay'         => 0,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'product',
                ),
            ),
        ),
        'position'        => 'normal',
        'style'           => 'default',
        'label_placement' => 'top',
        'menu_order'      => 0,
        'active'          => true,
    ));
});

/**
 * [product_info field="features|overview|shipping" id="N"]
 *
 * Outputs the rendered WYSIWYG content for one Product Information field.
 * `id` is optional — defaults to current post.
 */
function innotech_product_info_shortcode($atts) {
    if (!function_exists('get_field')) {
        return '';
    }

    $atts = shortcode_atts(array(
        'field' => 'features',
        'id'    => '',
    ), $atts, 'product_info');

    $allowed = array(
        'features' => 'product_features',
        'overview' => 'product_overview',
        'shipping' => 'product_shipping',
    );

    $key = sanitize_key($atts['field']);
    if (!isset($allowed[$key])) {
        return '';
    }

    $post_id = $atts['id'] !== '' ? intval($atts['id']) : get_the_ID();
    if (!$post_id) {
        return '';
    }

    $value = get_field($allowed[$key], $post_id);
    if (empty($value)) {
        return '';
    }

    return '<div class="innotech-product-info innotech-product-info--' . esc_attr($key) . '">'
         . wp_kses_post($value)
         . '</div>';
}
add_shortcode('product_info', 'innotech_product_info_shortcode');

/**
 * [product_info_tabs id="N"]
 *
 * Renders all three fields as a tab UI. Tabs hide automatically if the
 * corresponding field is empty.
 */
function innotech_product_info_tabs_shortcode($atts) {
    if (!function_exists('get_field')) {
        return '';
    }

    $atts = shortcode_atts(array('id' => ''), $atts, 'product_info_tabs');
    $post_id = $atts['id'] !== '' ? intval($atts['id']) : get_the_ID();
    if (!$post_id) {
        return '';
    }

    $tabs = array(
        'overview' => array(
            'label' => __('Product Overview', 'innotech'),
            'value' => get_field('product_overview', $post_id),
        ),
        'features' => array(
            'label' => __('Product Features', 'innotech'),
            'value' => get_field('product_features', $post_id),
        ),
        'shipping' => array(
            'label' => __('Shipping', 'innotech'),
            'value' => get_field('product_shipping', $post_id),
        ),
    );

    // Drop empty tabs.
    $tabs = array_filter($tabs, function ($t) {
        return !empty(trim(wp_strip_all_tags($t['value'])));
    });

    if (empty($tabs)) {
        return '';
    }

    $uid = 'pi-' . wp_unique_id();
    ob_start();
    ?>
    <div class="innotech-product-info-tabs" id="<?php echo esc_attr($uid); ?>">
        <div class="innotech-product-info-tabs__nav" role="tablist">
            <?php $i = 0; foreach ($tabs as $key => $tab) : ?>
                <button type="button"
                        class="innotech-product-info-tabs__tab<?php echo $i === 0 ? ' is-active' : ''; ?>"
                        role="tab"
                        aria-controls="<?php echo esc_attr($uid . '-' . $key); ?>"
                        aria-selected="<?php echo $i === 0 ? 'true' : 'false'; ?>"
                        data-target="<?php echo esc_attr($key); ?>">
                    <?php echo esc_html($tab['label']); ?>
                </button>
            <?php $i++; endforeach; ?>
        </div>
        <div class="innotech-product-info-tabs__panels">
            <?php $i = 0; foreach ($tabs as $key => $tab) : ?>
                <div class="innotech-product-info-tabs__panel<?php echo $i === 0 ? ' is-active' : ''; ?>"
                     id="<?php echo esc_attr($uid . '-' . $key); ?>"
                     role="tabpanel"
                     data-key="<?php echo esc_attr($key); ?>"
                     <?php echo $i === 0 ? '' : 'hidden'; ?>>
                    <?php echo wp_kses_post($tab['value']); ?>
                </div>
            <?php $i++; endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('product_info_tabs', 'innotech_product_info_tabs_shortcode');

/**
 * [product_info_layout features_title="Features" id="N"]
 *
 * Renders product_features inside a bordered container (with the title
 * rendered ABOVE/OUTSIDE the border) plus an accordion of Product Overview
 * + Shipping. Items in the features list get check icons via CSS.
 */
function innotech_product_info_layout_shortcode($atts) {
    if (!function_exists('get_field')) {
        return '';
    }

    $atts = shortcode_atts(array(
        'id'             => '',
        'features_title' => __('Product Features', 'innotech'),
    ), $atts, 'product_info_layout');

    $post_id = $atts['id'] !== '' ? intval($atts['id']) : get_the_ID();
    if (!$post_id) {
        return '';
    }

    $features = get_field('product_features', $post_id);
    $overview = get_field('product_overview', $post_id);
    $shipping = get_field('product_shipping', $post_id);

    $accordion_items = array();
    if (!empty(trim(wp_strip_all_tags($overview)))) {
        $accordion_items['overview'] = array(
            'label' => __('Product Overview', 'innotech'),
            'value' => $overview,
        );
    }
    if (!empty(trim(wp_strip_all_tags($shipping)))) {
        $accordion_items['shipping'] = array(
            'label' => __('Shipping', 'innotech'),
            'value' => $shipping,
        );
    }

    $has_features = !empty(trim(wp_strip_all_tags($features)));
    if (!$has_features && empty($accordion_items)) {
        return '';
    }

    ob_start();
    ?>
    <div class="innotech-product-layout">
        <?php if ($has_features) : ?>
            <section class="innotech-product-layout__features">
                <h3 class="innotech-product-layout__features-title">
                    <?php echo esc_html($atts['features_title']); ?>
                </h3>
                <div class="innotech-product-layout__features-box">
                    <?php echo wp_kses_post($features); ?>
                </div>
            </section>
        <?php endif; ?>

        <?php if (!empty($accordion_items)) : ?>
            <section class="innotech-product-layout__accordion">
                <?php $i = 0; foreach ($accordion_items as $key => $item) :
                    $is_open = $i === 0; ?>
                    <div class="innotech-product-layout__item<?php echo $is_open ? ' is-open' : ''; ?>"
                         data-key="<?php echo esc_attr($key); ?>">
                        <button type="button"
                                class="innotech-product-layout__head"
                                aria-expanded="<?php echo $is_open ? 'true' : 'false'; ?>">
                            <span class="innotech-product-layout__label">
                                <?php echo esc_html($item['label']); ?>
                            </span>
                            <span class="innotech-product-layout__caret" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </button>
                        <div class="innotech-product-layout__panel" <?php echo $is_open ? '' : 'hidden'; ?>>
                            <div class="innotech-product-layout__panel-inner">
                                <?php echo wp_kses_post($item['value']); ?>
                            </div>
                        </div>
                    </div>
                <?php $i++; endforeach; ?>
            </section>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('product_info_layout', 'innotech_product_info_layout_shortcode');
