<?php

class INNOTECH_DotLabel extends ET_Builder_Module {

    public $slug       = 'innotech_dot_label';
    public $vb_support = 'partial';

    protected $module_credits = array(
        'module_uri' => '',
        'author'     => 'Boobandy',
        'author_uri' => '',
    );

    public function init() {
        $this->name            = esc_html__( 'Dot Label', 'innotech-divi-child' );
        $this->icon_path       = get_stylesheet_directory() . '/includes/modules/DotLabel/icon.svg';
        $this->main_css_element = '%%order_class%%';

        $this->settings_modal_toggles = array(
            'general' => array(
                'toggles' => array(
                    'main_content' => esc_html__( 'Content', 'innotech-divi-child' ),
                    'styling'      => esc_html__( 'Styling', 'innotech-divi-child' ),
                ),
            ),
        );

        $this->advanced_fields = array(
            'fonts'          => array(
                'label' => array(
                    'label'       => esc_html__( 'Label', 'innotech-divi-child' ),
                    'css'         => array(
                        'main' => '%%order_class%% .sidebar-item .label',
                    ),
                    'font_size'   => array(
                        'default' => '14px',
                    ),
                    'line_height' => array(
                        'default' => '1.5em',
                    ),
                ),
            ),
            'text'           => false,
            'button'         => false,
            'link_options'   => false,
            'background'     => array(
                'settings' => array(
                    'color' => 'alpha',
                ),
            ),
            'borders'        => array(
                'default' => array(),
            ),
            'box_shadow'     => array(
                'default' => array(),
            ),
            'margin_padding' => array(
                'css' => array(
                    'important' => 'all',
                ),
            ),
        );
    }

    public function get_fields() {
        return array(
            'label_text' => array(
                'label'           => esc_html__( 'Label Text', 'innotech-divi-child' ),
                'type'            => 'text',
                'default'         => '',
                'description'     => esc_html__( 'Enter the label text to display.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'dot_color' => array(
                'label'           => esc_html__( 'Dot Color', 'innotech-divi-child' ),
                'type'            => 'color-alpha',
                'default'         => '#ffffff',
                'description'     => esc_html__( 'Choose the color for the dot.', 'innotech-divi-child' ),
                'toggle_slug'     => 'styling',
            ),
            'dot_size' => array(
                'label'           => esc_html__( 'Dot Size', 'innotech-divi-child' ),
                'type'            => 'range',
                'default'         => '8px',
                'default_unit'    => 'px',
                'range_settings'  => array(
                    'min'  => '4',
                    'max'  => '20',
                    'step' => '1',
                ),
                'validate_unit'   => true,
                'allowed_units'   => array( 'px' ),
                'description'     => esc_html__( 'Set the dot size.', 'innotech-divi-child' ),
                'toggle_slug'     => 'styling',
            ),
            'gap_size' => array(
                'label'           => esc_html__( 'Gap Between Dot and Label', 'innotech-divi-child' ),
                'type'            => 'range',
                'default'         => '10px',
                'default_unit'    => 'px',
                'range_settings'  => array(
                    'min'  => '0',
                    'max'  => '40',
                    'step' => '1',
                ),
                'validate_unit'   => true,
                'allowed_units'   => array( 'px' ),
                'description'     => esc_html__( 'Set the gap between dot and label.', 'innotech-divi-child' ),
                'toggle_slug'     => 'styling',
            ),
            'alignment' => array(
                'label'           => esc_html__( 'Alignment', 'innotech-divi-child' ),
                'type'            => 'text_align',
                'options'         => et_builder_get_text_orientation_options( array( 'justified' ) ),
                'default'         => 'left',
                'description'     => esc_html__( 'Choose the horizontal alignment.', 'innotech-divi-child' ),
                'toggle_slug'     => 'styling',
            ),
        );
    }

    public function render( $attrs, $content, $render_slug ) {
        $label_text = $this->props['label_text'];
        $dot_color  = $this->props['dot_color'];
        $dot_size   = $this->props['dot_size'];
        $gap_size   = $this->props['gap_size'];
        $alignment  = $this->props['alignment'];

        // If no label text, show placeholder in builder
        if ( empty( $label_text ) ) {
            if ( is_admin() || ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) ) {
                $label_text = esc_html__( 'Enter label text...', 'innotech-divi-child' );
            } else {
                return '';
            }
        }

        // Alignment mapping
        $justify_content = 'flex-start';
        switch ( $alignment ) {
            case 'center':
                $justify_content = 'center';
                break;
            case 'right':
                $justify_content = 'flex-end';
                break;
            default:
                $justify_content = 'flex-start';
        }

        // Set dynamic styles
        ET_Builder_Element::set_style( $render_slug, array(
            'selector'    => '%%order_class%% .sidebar-item',
            'declaration' => sprintf( 'justify-content: %s; gap: %s;', esc_attr( $justify_content ), esc_attr( $gap_size ) ),
        ) );

        ET_Builder_Element::set_style( $render_slug, array(
            'selector'    => '%%order_class%% .sidebar-item .dot',
            'declaration' => sprintf(
                'background-color: %s; width: %s; height: %s;',
                esc_attr( $dot_color ),
                esc_attr( $dot_size ),
                esc_attr( $dot_size )
            ),
        ) );

        // Build the HTML content
        $html_content = sprintf(
            '<div class="sidebar-item">
                <span class="dot"></span>
                <span class="label">%s</span>
            </div>',
            esc_html( $label_text )
        );

        // Get module classes
        $this->add_classname( 'innotech-dot-label-module' );

        // Render with standard Divi wrapper
        $output = sprintf(
            '<div%1$s class="%2$s">%3$s</div>',
            $this->module_id(),
            $this->module_classname( $render_slug ),
            $html_content
        );

        return $output;
    }
}

new INNOTECH_DotLabel;
