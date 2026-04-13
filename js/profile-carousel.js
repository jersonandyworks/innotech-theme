/**
 * Profile Carousel
 * Handles navigation, state, and content-swapping for [profile_carousel].
 * Depends on: jQuery
 */
(function ($) {
	'use strict';

	var $container   = $('#profile-carousel-container');
	if ( ! $container.length ) return;

	var $photos      = $container.find('.__profiles .--photo');
	var $info        = $container.find('.__info');
	var $prevBtn     = $container.find('.prev');
	var $nextBtn     = $container.find('.next');
	var $currentNum  = $container.find('.current-num');
	var total        = $photos.length;
	var currentIndex = 0;
	var isAnimating  = false;

	// ── SVG icon library (mirrors PHP) ───────────────────────────────────────

	var ICONS = {
		linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
		email:    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
		facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
		x:        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
	};

	var ICON_LABELS = { linkedin: 'LinkedIn', email: 'Email', facebook: 'Facebook', x: 'X (Twitter)' };
	var ICON_ORDER  = ['linkedin', 'email', 'facebook', 'x'];

	// ── Helpers ──────────────────────────────────────────────────────────────

	function pad( n ) {
		return String( n ).padStart( 2, '0' );
	}

	function buildSocialLinks( social ) {
		if ( ! social ) return '';
		var html = '';
		ICON_ORDER.forEach( function ( key ) {
			if ( ! social[ key ] ) return;
			var href   = key === 'email' ? 'mailto:' + social[ key ] : social[ key ];
			var target = key === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"';
			html += '<a href="' + href + '" class="social-link social-link--' + key + '" aria-label="' + ICON_LABELS[ key ] + '"' + target + '>' + ICONS[ key ] + '</a>';
		} );
		return html;
	}

	// ── State updates ────────────────────────────────────────────────────────

	function updateOffsets() {
		$photos.each( function ( i ) {
			var offset = ( i - currentIndex + total ) % total;
			$( this ).attr( 'data-offset', offset );
		} );
	}

	function updateCounter() {
		$currentNum.text( pad( currentIndex + 1 ) );
	}

	function updateInfo( data ) {
		$info.find( '.--name' ).text( data.name || '' );
		$info.find( '.--position' ).text( data.position || '' );
		$info.find( '.--description' ).html( data.bio || '' );
		$info.find( '.--social-links' ).html( buildSocialLinks( data.social ) );
	}

	// ── Navigation ───────────────────────────────────────────────────────────

	function goTo( index ) {
		if ( index === currentIndex || isAnimating || total <= 1 ) return;
		isAnimating  = true;
		currentIndex = index;

		var data = $photos.eq( index ).data( 'profile-data' );

		updateOffsets();
		updateCounter();

		$info.stop( true ).animate( { opacity: 0 }, 180, function () {
			updateInfo( data );
			$info.animate( { opacity: 1 }, 300, function () {
				isAnimating = false;
			} );
		} );
	}

	function navigate( direction ) {
		if ( isAnimating ) return;
		goTo( ( currentIndex + direction + total ) % total );
	}

	// ── Event binding ────────────────────────────────────────────────────────

	$nextBtn.on( 'click', function () { navigate( 1 ); } );
	$prevBtn.on( 'click', function () { navigate( -1 ); } );

	// Click on any photo card to activate it
	$photos.on( 'click', function () {
		var index = parseInt( $( this ).data( 'index' ), 10 );
		if ( ! isNaN( index ) ) goTo( index );
	} );

	// Keyboard activation for photo cards (role="button")
	$photos.on( 'keydown', function ( e ) {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			var index = parseInt( $( this ).data( 'index' ), 10 );
			if ( ! isNaN( index ) ) goTo( index );
		}
	} );

	// Keyboard arrow navigation on the container
	$container.on( 'keydown', function ( e ) {
		if ( e.key === 'ArrowRight' ) { e.preventDefault(); navigate( 1 );  }
		if ( e.key === 'ArrowLeft' )  { e.preventDefault(); navigate( -1 ); }
	} );

	// ── Touch / swipe ────────────────────────────────────────────────────────

	var touchStartX = 0;
	var touchStartY = 0;
	var SWIPE_THRESHOLD = 40; // px minimum horizontal drag to trigger navigation

	$container[0].addEventListener( 'touchstart', function ( e ) {
		touchStartX = e.changedTouches[0].clientX;
		touchStartY = e.changedTouches[0].clientY;
	}, { passive: true } );

	$container[0].addEventListener( 'touchend', function ( e ) {
		var dx = e.changedTouches[0].clientX - touchStartX;
		var dy = e.changedTouches[0].clientY - touchStartY;

		// Only fire on clearly horizontal swipes (not vertical scroll)
		if ( Math.abs( dx ) > SWIPE_THRESHOLD && Math.abs( dx ) > Math.abs( dy ) ) {
			navigate( dx < 0 ? 1 : -1 );
		}
	}, { passive: true } );

	// ── Init ─────────────────────────────────────────────────────────────────

	updateOffsets(); // Ensure data-offset attributes match initial state

})( jQuery );
