<?php
/**
 * Google Map Shortcode
 *
 * Registers the [innotech_google_map] shortcode that renders a styled Google
 * Map with a custom SVG marker and Snazzy Maps design.
 *
 * Usage:
 *   [innotech_google_map lat="-33.8688" lng="151.2093" zoom="14" height="450"]
 *
 * Attributes:
 *   lat    (float)  Latitude of the map centre & marker.  Default: -33.8688
 *   lng    (float)  Longitude of the map centre & marker. Default: 151.2093
 *   zoom   (int)    Initial zoom level (1–20).            Default: 14
 *   height (int)    Map height in pixels.                 Default: 450
 *
 * Security note:
 *   The API key below is a fallback. For production it is strongly recommended
 *   to define INNOTECH_GOOGLE_MAPS_API_KEY in wp-config.php so it stays out
 *   of version control:
 *
 *     define( 'INNOTECH_GOOGLE_MAPS_API_KEY', 'your-api-key-here' );
 *
 * @package Innotech_Divi_Child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── API Key ──────────────────────────────────────────────────────────────────
// Defined here as a fallback; override in wp-config.php for security.
if ( ! defined( 'INNOTECH_GOOGLE_MAPS_API_KEY' ) ) {
	define( 'INNOTECH_GOOGLE_MAPS_API_KEY', 'AIzaSyBP5sVGnr8fJJxpOOtsovy_M7F4aw2RwOg' );
}

// ── Snazzy Maps Style Configuration ─────────────────────────────────────────
/**
 * Returns the Snazzy Maps style array used for all map instances.
 *
 * @return array Google Maps style definitions.
 */
function innotech_map_get_styles() {
	return array(
		array(
			'featureType' => 'all',
			'elementType' => 'labels.text',
			'stylers'     => array(
				array( 'color' => '#878787' ),
			),
		),
		array(
			'featureType' => 'all',
			'elementType' => 'labels.text.stroke',
			'stylers'     => array(
				array( 'visibility' => 'off' ),
			),
		),
		array(
			'featureType' => 'landscape',
			'elementType' => 'all',
			'stylers'     => array(
				array( 'color' => '#f9f5ed' ),
			),
		),
		array(
			'featureType' => 'road.highway',
			'elementType' => 'all',
			'stylers'     => array(
				array( 'color' => '#f5f5f5' ),
			),
		),
		array(
			'featureType' => 'road.highway',
			'elementType' => 'geometry.stroke',
			'stylers'     => array(
				array( 'color' => '#c9c9c9' ),
			),
		),
		array(
			'featureType' => 'water',
			'elementType' => 'all',
			'stylers'     => array(
				array( 'color' => '#aee0f4' ),
			),
		),
	);
}

// ── Script & Style Registration ──────────────────────────────────────────────
/**
 * Register Google Maps scripts.
 *
 * Scripts are registered here but NOT enqueued globally — they are only
 * enqueued when the shortcode is actually used on a page (see shortcode
 * callback below). This prevents unnecessary loading on pages without a map.
 */
function innotech_register_google_map_scripts() {

	// 1. Our custom map initialisation script.
	//    Defines window.innotechInitMaps — must load before google-maps-api.
	wp_register_script(
		'innotech-google-map',
		get_stylesheet_directory_uri() . '/js/google-map.js',
		array(),    // no external dependencies
		'1.0.0',
		true        // load in footer
	);

	// 2. Google Maps Platform API.
	//    The `callback` query param tells Google Maps to call our function
	//    once the API has fully loaded.
	//    Dependency on 'innotech-google-map' ensures WordPress outputs our
	//    script BEFORE the Maps API script tag in the DOM.
	wp_register_script(
		'google-maps-api',
		add_query_arg(
			array(
				'key'      => INNOTECH_GOOGLE_MAPS_API_KEY,
				'callback' => 'innotechInitMaps',
			),
			'https://maps.googleapis.com/maps/api/js'
		),
		array( 'innotech-google-map' ), // depends on our init script
		null,   // version handled by Google; pass null to avoid cache-busting
		true    // load in footer
	);
}
add_action( 'wp_enqueue_scripts', 'innotech_register_google_map_scripts' );

/**
 * Add the `async` attribute to the Google Maps API script tag.
 *
 * Using `async` on the Maps API script is recommended by Google.
 * Because our dependency chain is handled by WordPress (not the browser),
 * and Google Maps uses the `callback` parameter, this is safe to do.
 *
 * @param string $tag    The full <script> tag HTML.
 * @param string $handle The registered script handle.
 * @param string $src    The script source URL.
 * @return string
 */
function innotech_google_maps_async_attr( $tag, $handle, $src ) {
	if ( 'google-maps-api' === $handle ) {
		// Build a clean async script tag.
		return '<script async src="' . esc_url( $src ) . '"></script>' . "\n";
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'innotech_google_maps_async_attr', 10, 3 );

// ── Map CSS ───────────────────────────────────────────────────────────────────
/**
 * Inject minimal CSS for the map wrapper.
 * Attached to the existing child-theme stylesheet so no extra HTTP request
 * is needed.
 */
function innotech_google_map_inline_styles() {
	$css = '
		/* Innotech Google Map Shortcode */
		.innotech-map-wrapper {
			position: relative;
			width: 100%;
			overflow: hidden;
		}
		.innotech-map-canvas {
			width: 100%;
			height: 100%;
			display: block;
		}
	';

	wp_add_inline_style( 'chld_thm_cfg_separate', $css );
}
add_action( 'wp_enqueue_scripts', 'innotech_google_map_inline_styles' );

// ── Shortcode ─────────────────────────────────────────────────────────────────
/**
 * Instance counter — ensures every map gets a unique DOM ID even when the
 * shortcode appears multiple times on the same page.
 *
 * @var int
 */
$innotech_map_instance = 0;

/**
 * [innotech_google_map] shortcode callback.
 *
 * @param array $atts Shortcode attributes supplied by the editor.
 * @return string     Rendered HTML for the map container.
 */
function innotech_google_map_shortcode( $atts ) {
	global $innotech_map_instance;
	$innotech_map_instance++;

	// ── Attribute sanitisation ────────────────────────────────────────────
	$atts = shortcode_atts(
		array(
			'lat'    => '-33.8688',  // Default centre: Sydney, AU
			'lng'    => '151.2093',
			'zoom'   => '14',
			'height' => '450',
		),
		$atts,
		'innotech_google_map'
	);

	$lat    = floatval( $atts['lat'] );
	$lng    = floatval( $atts['lng'] );
	$zoom   = max( 1, min( 20, intval( $atts['zoom'] ) ) );  // clamp 1–20
	$height = max( 100, intval( $atts['height'] ) );          // minimum 100px

	// Unique map container ID for this instance.
	$map_id = 'innotech-map-' . $innotech_map_instance;

	// Absolute URL to the custom SVG marker in _assets/.
	$marker_url = get_stylesheet_directory_uri() . '/_assets/marker.svg';

	// ── Enqueue scripts on demand ─────────────────────────────────────────
	// Scripts were registered in innotech_register_google_map_scripts() but
	// are only enqueued here, when the shortcode is actually rendered.
	wp_enqueue_script( 'innotech-google-map' );
	wp_enqueue_script( 'google-maps-api' );

	// ── Pass map config to JS ─────────────────────────────────────────────
	// Each shortcode instance pushes its own config object into the global
	// window.innotechMaps array BEFORE google-map.js executes.
	// wp_json_encode handles all escaping; esc_url_raw sanitises the URL.
	$map_config = array(
		'id'        => $map_id,
		'lat'       => $lat,
		'lng'       => $lng,
		'zoom'      => $zoom,
		'markerUrl' => esc_url_raw( $marker_url ),
		'styles'    => innotech_map_get_styles(),
	);

	$inline_js = sprintf(
		'window.innotechMaps = window.innotechMaps || []; window.innotechMaps.push( %s );',
		wp_json_encode( $map_config )
	);

	// 'before' position outputs the inline script tag immediately before
	// the <script src="google-map.js"> tag in the DOM.
	wp_add_inline_script( 'innotech-google-map', $inline_js, 'before' );

	// ── HTML output ───────────────────────────────────────────────────────
	ob_start();
	?>
	<div class="innotech-map-wrapper" style="height: <?php echo esc_attr( $height ); ?>px;">
		<div
			id="<?php echo esc_attr( $map_id ); ?>"
			class="innotech-map-canvas"
		></div>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'innotech_google_map', 'innotech_google_map_shortcode' );
