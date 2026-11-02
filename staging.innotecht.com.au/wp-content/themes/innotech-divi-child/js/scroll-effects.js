jQuery(document).ready(function ($) {
	var $mouseWrapper = $(".innotech-mouse-wrapper");
	var scrollThreshold = 300;
	var isHidden = false;

	// Header sticky menu fade effect
	var $headerStickyMenu = $("#header-sticky-menu");
	var headerScrollThreshold = 200;
	var lastScrollTop = 0;
	var isHeaderHidden = false;

	// Set initial CSS for smooth transitions
	$headerStickyMenu.css({
		transition: "opacity 0.4s ease, visibility 0.4s ease",
		opacity: 1,
		visibility: "visible"
	});

	$(window).on("scroll", function () {
		var scrollTop = $(this).scrollTop();

		// Mouse wrapper fade effect
		if (scrollTop >= scrollThreshold && !isHidden) {
			$mouseWrapper.fadeOut(300);
			isHidden = true;
		} else if (scrollTop < scrollThreshold && isHidden) {
			$mouseWrapper.fadeIn(300);
			isHidden = false;
		}

		// Header sticky menu fade effect
		var isScrollingDown = scrollTop > lastScrollTop;
		var isNearTop = scrollTop < 100;

		if (isScrollingDown && scrollTop > headerScrollThreshold && !isHeaderHidden) {
			// Scrolling down past threshold - fade out
			$headerStickyMenu.css({
				opacity: 0,
				visibility: "hidden"
			});
			isHeaderHidden = true;
		} else if (!isScrollingDown && isNearTop && isHeaderHidden) {
			// Scrolling up and near top - fade in
			$headerStickyMenu.css({
				opacity: 1,
				visibility: "visible"
			});
			isHeaderHidden = false;
		}

		lastScrollTop = scrollTop;
	});
});
