/**
 * Innotech Google Map Initialization
 *
 * Called as the Google Maps API async callback: ?callback=innotechInitMaps
 * Reads map configs pushed to window.innotechMaps[] by the PHP shortcode,
 * then initialises each map instance independently.
 *
 * Supports multiple [innotech_google_map] shortcodes on the same page.
 */

( function () {
	'use strict';

	/**
	 * Global callback invoked by the Google Maps API once it has loaded.
	 * Iterates over every config object registered by the PHP shortcode.
	 */
	window.innotechInitMaps = function () {
		var maps = window.innotechMaps || [];

		maps.forEach( function ( config ) {
			initSingleMap( config );
		} );
	};

	/**
	 * Initialise a single Google Map instance.
	 *
	 * @param {Object} config            - Map config pushed from PHP.
	 * @param {string} config.id         - ID of the target <div> element.
	 * @param {number} config.lat        - Latitude for the map centre + marker.
	 * @param {number} config.lng        - Longitude for the map centre + marker.
	 * @param {number} config.zoom       - Initial zoom level.
	 * @param {string} config.markerUrl  - Absolute URL to the custom SVG marker.
	 * @param {Array}  config.styles     - Snazzy Maps / Google Maps style array.
	 */
	function initSingleMap( config ) {
		var container = document.getElementById( config.id );

		// Bail early if the container element is missing.
		if ( ! container ) {
			return;
		}

		// ── Map options ──────────────────────────────────────────────────────
		var mapOptions = {
			center           : { lat: config.lat, lng: config.lng },
			zoom             : config.zoom,
			styles           : config.styles,   // Snazzy Maps styling
			mapTypeControl   : false,
			streetViewControl: false,
			fullscreenControl: true,
			scrollwheel      : false,           // prevent accidental scroll-zoom
		};

		var map = new google.maps.Map( container, mapOptions );

		// ── Custom SVG marker ────────────────────────────────────────────────
		var marker = new google.maps.Marker( { // eslint-disable-line no-unused-vars
			position: { lat: config.lat, lng: config.lng },
			map     : map,
			title   : config.title || '',
			icon    : {
				url        : config.markerUrl,
				// Native SVG dimensions: width 60 × height 70
				scaledSize : new google.maps.Size( 60, 70 ),
				// Anchor at the bottom-centre point of the pin
				anchor     : new google.maps.Point( 30, 70 ),
			},
		} );
	}

} )();
