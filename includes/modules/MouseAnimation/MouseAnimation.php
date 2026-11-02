<?php

class INNOTECH_MouseAnimation extends ET_Builder_Module {

    public $slug       = 'innotech_mouse_animation';
    public $vb_support = 'partial';

    protected $module_credits = array(
        'module_uri' => '',
        'author'     => 'Boobandy',
        'author_uri' => '',
    );

    public function init() {
        $this->name            = esc_html__( 'Mouse Animation', 'innotech-divi-child' );
        $this->icon_path       = get_stylesheet_directory() . '/includes/modules/MouseAnimation/icon.svg';
        $this->main_css_element = '%%order_class%%';

        $this->settings_modal_toggles = array(
            'general' => array(
                'toggles' => array(
                    'main_content' => esc_html__( 'Animation Settings', 'innotech-divi-child' ),
                ),
            ),
        );

        $this->advanced_fields = array(
            'fonts'          => false,
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
            'mouse_color' => array(
                'label'           => esc_html__( 'Mouse Color', 'innotech-divi-child' ),
                'type'            => 'color-alpha',
                'default'         => '#ffffff',
                'description'     => esc_html__( 'Choose the color for the mouse outline and wheel.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'arrow_color' => array(
                'label'           => esc_html__( 'Arrow Color', 'innotech-divi-child' ),
                'type'            => 'color-alpha',
                'default'         => '#ffffff',
                'description'     => esc_html__( 'Choose the color for the arrows.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'animation_speed' => array(
                'label'           => esc_html__( 'Animation Speed', 'innotech-divi-child' ),
                'type'            => 'range',
                'default'         => '1.9',
                'default_unit'    => 's',
                'range_settings'  => array(
                    'min'  => '0.5',
                    'max'  => '4',
                    'step' => '0.1',
                ),
                'validate_unit'   => true,
                'allowed_units'   => array( 's' ),
                'description'     => esc_html__( 'Set the animation speed in seconds.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'show_arrows' => array(
                'label'           => esc_html__( 'Show Arrows', 'innotech-divi-child' ),
                'type'            => 'yes_no_button',
                'options'         => array(
                    'on'  => esc_html__( 'Yes', 'innotech-divi-child' ),
                    'off' => esc_html__( 'No', 'innotech-divi-child' ),
                ),
                'default'         => 'on',
                'affects'         => array( 'arrow_color' ),
                'description'     => esc_html__( 'Toggle the visibility of the arrows below the mouse.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'mouse_size' => array(
                'label'           => esc_html__( 'Mouse Size', 'innotech-divi-child' ),
                'type'            => 'range',
                'default'         => '1',
                'range_settings'  => array(
                    'min'  => '0.5',
                    'max'  => '3',
                    'step' => '0.1',
                ),
                'unitless'        => true,
                'description'     => esc_html__( 'Scale the mouse animation size.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
            'alignment' => array(
                'label'           => esc_html__( 'Alignment', 'innotech-divi-child' ),
                'type'            => 'text_align',
                'options'         => et_builder_get_text_orientation_options( array( 'justified' ) ),
                'default'         => 'center',
                'description'     => esc_html__( 'Choose the horizontal alignment of the animation.', 'innotech-divi-child' ),
                'toggle_slug'     => 'main_content',
            ),
        );
    }

    public function render( $attrs, $content, $render_slug ) {
        $mouse_color      = $this->props['mouse_color'];
        $arrow_color      = $this->props['arrow_color'];
        $animation_speed  = $this->props['animation_speed'];
        $show_arrows      = $this->props['show_arrows'];
        $mouse_size       = $this->props['mouse_size'];
        $alignment        = $this->props['alignment'];

        // Clean animation speed value
        $animation_speed = str_replace( 's', '', $animation_speed );
        $animation_speed = floatval( $animation_speed ) . 's';

        // Alignment mapping
        $justify_content = 'center';
        switch ( $alignment ) {
            case 'left':
                $justify_content = 'flex-start';
                break;
            case 'right':
                $justify_content = 'flex-end';
                break;
            default:
                $justify_content = 'center';
        }

        // Use Divi's set_style() for per-instance dynamic CSS
        ET_Builder_Element::set_style( $render_slug, array(
            'selector'    => '%%order_class%% .innotech-mouse-wrapper',
            'declaration' => sprintf( 'justify-content: %s;', esc_attr( $justify_content ) ),
        ) );

        ET_Builder_Element::set_style( $render_slug, array(
            'selector'    => '%%order_class%% .innotech-mouse-svg',
            'declaration' => sprintf( 'transform: scale(%s);', esc_attr( $mouse_size ) ),
        ) );

        ET_Builder_Element::set_style( $render_slug, array(
            'selector'    => '%%order_class%%',
            'declaration' => sprintf( '--innotech-anim-speed: %s;', esc_attr( $animation_speed ) ),
        ) );

        // Build arrows SVG
        $arrows_svg = '';
        if ( 'on' === $show_arrows ) {
            $arrows_svg = sprintf(
                '<g class="innotech-svg-arrows">
                    <polyline class="innotech-svg-arrow innotech-svg-arrow-1" points="8,52 12,56 16,52" fill="none" stroke="%1$s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline class="innotech-svg-arrow innotech-svg-arrow-2" points="8,60 12,64 16,60" fill="none" stroke="%1$s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline class="innotech-svg-arrow innotech-svg-arrow-3" points="8,68 12,72 16,68" fill="none" stroke="%1$s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>',
                esc_attr( $arrow_color )
            );
        }

        $svg_height = ( 'on' === $show_arrows ) ? '80' : '45';

        // Build clean SVG without inline <style> (animations are in the static stylesheet)
        $svg_content = sprintf(
            '<div class="innotech-mouse-wrapper">
                <svg class="innotech-mouse-svg" width="24" height="%4$s" viewBox="0 0 24 %4$s" style="overflow:visible;">
                    <rect x="2" y="2" width="20" height="36" rx="10" ry="10" fill="none" stroke="%1$s" stroke-width="2"/>
                    <rect class="innotech-svg-wheel" x="11" y="8" width="3" height="8" rx="2" ry="2" fill="%2$s"/>
                    %3$s
                </svg>
            </div>',
            esc_attr( $mouse_color ),
            esc_attr( $mouse_color ),
            $arrows_svg,
            esc_attr( $svg_height )
        );

        // Get module classes including custom CSS class
        $this->add_classname( 'innotech-mouse-module' );

        // Render with standard Divi wrapper
        $output = sprintf(
            '<div%1$s class="%2$s">%3$s</div>',
            $this->module_id(),
            $this->module_classname( $render_slug ),
            $svg_content
        );

        return $output;
    }
}

new INNOTECH_MouseAnimation;
