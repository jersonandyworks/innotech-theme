<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;

/**
 * Initialize Nested Container Module after Divi is loaded
 */
function innotech_initialize_nested_container_module() {
    if (!class_exists('ET_Builder_Module')) {
        return;
    }

    /**
     * Nested Container Module - Parent wrapper
     */
    class IT_Nested_Container extends ET_Builder_Module {

        public function init() {
            $this->name = esc_html__('Nested Container', 'innotech-divi-child');
            $this->plural = esc_html__('Nested Containers', 'innotech-divi-child');
            $this->slug = 'et_pb_nested_container';
            $this->vb_support = 'partial';  // Partial VB support - prevents [object Object] issue

            // Accept child items
            $this->child_slug = 'et_pb_nested_container_item';
            $this->child_item_text = esc_html__('Add Item', 'innotech-divi-child');

            $this->main_css_element = '%%order_class%%';

            $this->settings_modal_toggles = array(
                'general' => array(
                    'toggles' => array(
                        'layout' => esc_html__('Layout Settings', 'innotech-divi-child'),
                    ),
                ),
            );

            $this->advanced_fields = array(
                'background' => array(
                    'settings' => array(
                        'color' => 'alpha',
                    ),
                ),
                'borders' => array('default' => array()),
                'box_shadow' => array('default' => array()),
                'margin_padding' => array(
                    'css' => array('important' => 'all'),
                ),
                'max_width' => array(
                    'css' => array('main' => '%%order_class%%'),
                ),
                'text' => false,
                'filters' => array(
                    'css' => array('main' => '%%order_class%%'),
                ),
            );
        }

        public function get_fields() {
            return array(
                'display_type' => array(
                    'label' => esc_html__('Display Type', 'innotech-divi-child'),
                    'type' => 'select',
                    'option_category' => 'layout',
                    'options' => array(
                        'block' => esc_html__('Block', 'innotech-divi-child'),
                        'flex' => esc_html__('Flex', 'innotech-divi-child'),
                        'grid' => esc_html__('Grid', 'innotech-divi-child'),
                    ),
                    'default' => 'grid',
                    'toggle_slug' => 'layout',
                    'description' => esc_html__('Choose how items are displayed.', 'innotech-divi-child'),
                ),
                'flex_direction' => array(
                    'label' => esc_html__('Direction', 'innotech-divi-child'),
                    'type' => 'select',
                    'option_category' => 'layout',
                    'options' => array(
                        'row' => esc_html__('Horizontal', 'innotech-divi-child'),
                        'column' => esc_html__('Vertical', 'innotech-divi-child'),
                    ),
                    'default' => 'row',
                    'toggle_slug' => 'layout',
                    'show_if' => array('display_type' => 'flex'),
                ),
                'flex_wrap' => array(
                    'label' => esc_html__('Wrap Items', 'innotech-divi-child'),
                    'type' => 'yes_no_button',
                    'option_category' => 'layout',
                    'options' => array(
                        'off' => esc_html__('No', 'innotech-divi-child'),
                        'on' => esc_html__('Yes', 'innotech-divi-child'),
                    ),
                    'default' => 'on',
                    'toggle_slug' => 'layout',
                    'show_if' => array('display_type' => 'flex'),
                ),
                'justify_content' => array(
                    'label' => esc_html__('Horizontal Alignment', 'innotech-divi-child'),
                    'type' => 'select',
                    'option_category' => 'layout',
                    'options' => array(
                        'flex-start' => esc_html__('Left', 'innotech-divi-child'),
                        'center' => esc_html__('Center', 'innotech-divi-child'),
                        'flex-end' => esc_html__('Right', 'innotech-divi-child'),
                        'space-between' => esc_html__('Space Between', 'innotech-divi-child'),
                        'space-around' => esc_html__('Space Around', 'innotech-divi-child'),
                    ),
                    'default' => 'flex-start',
                    'toggle_slug' => 'layout',
                    'show_if' => array('display_type' => 'flex'),
                ),
                'align_items' => array(
                    'label' => esc_html__('Vertical Alignment', 'innotech-divi-child'),
                    'type' => 'select',
                    'option_category' => 'layout',
                    'options' => array(
                        'flex-start' => esc_html__('Top', 'innotech-divi-child'),
                        'center' => esc_html__('Center', 'innotech-divi-child'),
                        'flex-end' => esc_html__('Bottom', 'innotech-divi-child'),
                        'stretch' => esc_html__('Stretch', 'innotech-divi-child'),
                    ),
                    'default' => 'stretch',
                    'toggle_slug' => 'layout',
                    'show_if' => array('display_type' => 'flex'),
                ),
                'gap' => array(
                    'label' => esc_html__('Gap Between Items', 'innotech-divi-child'),
                    'type' => 'range',
                    'option_category' => 'layout',
                    'default' => '20px',
                    'default_unit' => 'px',
                    'range_settings' => array(
                        'min' => '0',
                        'max' => '100',
                        'step' => '1',
                    ),
                    'toggle_slug' => 'layout',
                    'mobile_options' => true,
                    'responsive' => true,
                ),
                'grid_columns' => array(
                    'label' => esc_html__('Number of Columns', 'innotech-divi-child'),
                    'type' => 'range',
                    'option_category' => 'layout',
                    'default' => '2',
                    'range_settings' => array(
                        'min' => '1',
                        'max' => '6',
                        'step' => '1',
                    ),
                    'toggle_slug' => 'layout',
                    'show_if' => array('display_type' => 'grid'),
                    'mobile_options' => true,
                    'responsive' => true,
                ),
            );
        }

        public function render($attrs, $content = null, $render_slug) {
            $display_type = $this->props['display_type'];
            $gap = $this->props['gap'];

            $css = sprintf('display: %s;', esc_attr($display_type));

            if ($display_type === 'flex') {
                $css .= sprintf(
                    ' flex-direction: %s; flex-wrap: %s; justify-content: %s; align-items: %s; gap: %s;',
                    esc_attr($this->props['flex_direction']),
                    $this->props['flex_wrap'] === 'on' ? 'wrap' : 'nowrap',
                    esc_attr($this->props['justify_content']),
                    esc_attr($this->props['align_items']),
                    esc_attr($gap)
                );
            } elseif ($display_type === 'grid') {
                $columns = $this->props['grid_columns'];
                $css .= sprintf(' grid-template-columns: repeat(%s, 1fr); gap: %s;', esc_attr($columns), esc_attr($gap));

                // Responsive columns
                $columns_tablet = isset($this->props['grid_columns_tablet']) ? $this->props['grid_columns_tablet'] : $columns;
                $columns_phone = isset($this->props['grid_columns_phone']) ? $this->props['grid_columns_phone'] : $columns_tablet;

                if ($columns_tablet !== $columns) {
                    ET_Builder_Element::set_style($render_slug, array(
                        'selector' => '%%order_class%%',
                        'declaration' => sprintf('grid-template-columns: repeat(%s, 1fr);', esc_attr($columns_tablet)),
                        'media_query' => ET_Builder_Element::get_media_query('max_width_980'),
                    ));
                }

                if ($columns_phone !== $columns_tablet) {
                    ET_Builder_Element::set_style($render_slug, array(
                        'selector' => '%%order_class%%',
                        'declaration' => sprintf('grid-template-columns: repeat(%s, 1fr);', esc_attr($columns_phone)),
                        'media_query' => ET_Builder_Element::get_media_query('max_width_767'),
                    ));
                }
            }

            ET_Builder_Element::set_style($render_slug, array(
                'selector' => '%%order_class%%',
                'declaration' => $css,
            ));

            // Process content - use the proper method to get rendered content
            $content = $this->content;

            // If content is empty or an array/object, set to empty string
            if (empty($content) || !is_string($content)) {
                $content = '';
            }

            // Add custom class like mouse module does
            $this->add_classname('innotech-nested-container');

            // Use proper Divi output methods like mouse module
            // Check if module_id exists to prevent undefined array key error
            $module_id_attr = isset($this->props['module_id']) ? $this->module_id() : '';

            $output = sprintf(
                '<div%1$s class="%2$s">%3$s</div>',
                $module_id_attr,
                $this->module_classname($render_slug),
                $content
            );

            return $output;
        }
    }

    /**
     * Container Item - Child wrapper (transparent, accepts any modules)
     */
    class IT_Nested_Container_Item extends ET_Builder_Module {

        public function init() {
            $this->name = esc_html__('Item', 'innotech-divi-child');
            $this->plural = esc_html__('Items', 'innotech-divi-child');
            $this->slug = 'et_pb_nested_container_item';
            $this->vb_support = 'partial';  // Partial VB support - prevents [object Object] issue
            $this->type = 'child';
            $this->child_title_var = 'admin_label';

            $this->main_css_element = '%%order_class%%';

            $this->settings_modal_toggles = array(
                'general' => array(
                    'toggles' => array(
                        'main_content' => esc_html__('Content', 'innotech-divi-child'),
                    ),
                ),
                'advanced' => array(
                    'toggles' => array(
                        'title' => esc_html__('Title Text', 'innotech-divi-child'),
                        'body' => esc_html__('Body Text', 'innotech-divi-child'),
                    ),
                ),
            );

            $this->advanced_fields = array(
                'fonts' => array(
                    'title' => array(
                        'label' => esc_html__('Title', 'innotech-divi-child'),
                        'css' => array(
                            'main' => '%%order_class%% .item-title',
                            'important' => 'all',
                        ),
                        'font_size' => array(
                            'default' => '22px',
                        ),
                        'line_height' => array(
                            'default' => '1.4em',
                        ),
                        'letter_spacing' => array(
                            'default' => '0px',
                        ),
                        'toggle_slug' => 'title',
                        'hide_text_align' => false,
                        'hide_text_color' => false,
                        'hide_font_size' => false,
                        'hide_font_weight' => false,
                        'hide_letter_spacing' => false,
                        'hide_line_height' => false,
                        'hide_text_shadow' => false,
                    ),
                    'body' => array(
                        'label' => esc_html__('Body', 'innotech-divi-child'),
                        'css' => array(
                            'main' => '%%order_class%% .item-content',
                            'important' => 'all',
                        ),
                        'toggle_slug' => 'body',
                    ),
                ),
                'background' => array('settings' => array('color' => 'alpha')),
                'borders' => array('default' => array()),
                'box_shadow' => array('default' => array()),
                'margin_padding' => array('css' => array('important' => 'all')),
                'text' => array('css' => array('text_shadow' => '%%order_class%%')),
                'filters' => array('css' => array('main' => '%%order_class%%')),
            );

            $this->settings_modal_toggles = array(
                'general' => array(
                    'toggles' => array(
                        'main_content' => esc_html__('Content', 'innotech-divi-child'),
                    ),
                ),
            );
        }

        public function get_fields() {
            return array(
                'admin_label' => array(
                    'label' => esc_html__('Admin Label', 'innotech-divi-child'),
                    'type' => 'text',
                    'toggle_slug' => 'main_content',
                    'description' => esc_html__('For identifying this item in the builder only (not shown on frontend).', 'innotech-divi-child'),
                ),
                'title' => array(
                    'label' => esc_html__('Title/Label', 'innotech-divi-child'),
                    'type' => 'text',
                    'toggle_slug' => 'main_content',
                    'dynamic_content' => 'text',
                    'description' => esc_html__('Optional title/label shown on the frontend.', 'innotech-divi-child'),
                ),
                'content' => array(
                    'label' => esc_html__('Content', 'innotech-divi-child'),
                    'type' => 'tiny_mce',
                    'toggle_slug' => 'main_content',
                    'dynamic_content' => 'text',
                    'description' => esc_html__('Text content or add modules below.', 'innotech-divi-child'),
                ),
                'custom_id' => array(
                    'label' => esc_html__('Custom ID', 'innotech-divi-child'),
                    'type' => 'text',
                    'toggle_slug' => 'main_content',
                    'description' => esc_html__('Add a custom ID attribute for this item (e.g., "section-1").', 'innotech-divi-child'),
                ),
                'custom_class' => array(
                    'label' => esc_html__('Custom CSS Class', 'innotech-divi-child'),
                    'type' => 'text',
                    'toggle_slug' => 'main_content',
                    'description' => esc_html__('Add custom CSS classes for this item (separate multiple classes with spaces).', 'innotech-divi-child'),
                ),
            );
        }

        public function render($attrs, $content = null, $render_slug) {
            // Get the title/label
            $title = isset($this->props['title']) ? $this->props['title'] : '';

            // Get custom ID and class
            $custom_id = isset($this->props['custom_id']) ? trim($this->props['custom_id']) : '';
            $custom_class = isset($this->props['custom_class']) ? trim($this->props['custom_class']) : '';

            // Get child modules content - this contains everything including text from content field
            $child_modules = $this->content;

            // Ensure child content is a string
            if (empty($child_modules) || !is_string($child_modules)) {
                $child_modules = '';
            }

            // Build title HTML if title exists
            $title_output = '';
            if (!empty($title)) {
                $title_output = sprintf('<div class="item-title">%s</div>', esc_html($title));
            }

            // Build content wrapper - only use $this->content (no duplication)
            $content_output = '';
            if (!empty($child_modules)) {
                $content_output = sprintf(
                    '<div class="item-content">%s</div>',
                    $child_modules
                );
            }

            // Add custom class like mouse module does
            $this->add_classname('innotech-nested-item');

            // Add custom CSS class if provided
            if (!empty($custom_class)) {
                $this->add_classname($custom_class);
            }

            // Combine all parts - use proper Divi output methods
            // Use custom ID if provided, otherwise use default module_id
            $id_attr = '';
            if (!empty($custom_id)) {
                $id_attr = sprintf(' id="%s"', esc_attr($custom_id));
            } elseif (isset($this->props['module_id'])) {
                $id_attr = $this->module_id();
            }

            $output = sprintf(
                '<div%1$s class="%2$s">%3$s%4$s</div>',
                $id_attr,
                $this->module_classname($render_slug),
                $title_output,
                $content_output
            );

            return $output;
        }
    }

    new IT_Nested_Container;
    new IT_Nested_Container_Item;
}

add_action('et_builder_ready', 'innotech_initialize_nested_container_module');
