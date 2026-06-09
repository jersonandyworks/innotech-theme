<?php
/**
 * [product_showcase_slider post_id=<id>]
 *
 * Carousel of up to 3 hero slides read from ACF fields on a showcase post:
 *   hero_slider_{n}_group
 *     - photo_slider_{n}_image    (image)
 *     - photo_slider_{n}_heading  (text)
 *     - photo_slider_{n}_excerpt  (text/textarea)
 *
 * Empty slides (no image, heading or excerpt) are skipped, so 2 filled rows
 * render 2 slides. Styling: scss/_product-showcase-slider.scss (in ctc-style.css).
 * Behaviour: js/product-showcase-slider.js.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalise any ACF image return format (array / ID / URL) to a URL.
 */
function innotech_pss_image_url( $image, $size = 'full' ) {
	if ( empty( $image ) ) {
		return '';
	}
	if ( is_array( $image ) ) {
		if ( ! empty( $image['sizes'][ $size ] ) ) {
			return $image['sizes'][ $size ];
		}
		if ( ! empty( $image['url'] ) ) {
			return $image['url'];
		}
		if ( ! empty( $image['ID'] ) ) {
			return wp_get_attachment_image_url( $image['ID'], $size ) ?: '';
		}
		return '';
	}
	if ( is_numeric( $image ) ) {
		return wp_get_attachment_image_url( (int) $image, $size ) ?: '';
	}
	if ( is_string( $image ) ) {
		return $image; // already a URL
	}
	return '';
}

/**
 * Pull image/heading/excerpt out of an associative array by fuzzy key match.
 *
 * The real ACF subfield names are inconsistent across the three groups
 * (e.g. photo_slider_image_1 vs photo_slider_2_image, and the "exceprt"
 * typo), so we match on the key containing image/heading/excerpt rather than
 * an exact name.
 */
function innotech_pss_pick( $arr ) {
	$out = array(
		'image'   => '',
		'heading' => '',
		'excerpt' => '',
	);
	foreach ( $arr as $key => $val ) {
		$lk = strtolower( (string) $key );
		if ( '' === $out['image'] && false !== strpos( $lk, 'image' ) ) {
			$out['image'] = $val;
		} elseif ( '' === $out['heading'] && false !== strpos( $lk, 'heading' ) ) {
			$out['heading'] = $val;
		} elseif (
			'' === $out['excerpt'] &&
			( false !== strpos( $lk, 'excerpt' ) || false !== strpos( $lk, 'exceprt' ) || false !== strpos( $lk, 'except' ) )
		) {
			$out['excerpt'] = $val;
		}
	}
	return $out;
}

/**
 * Raw-meta fallback for when ACF's get_field() is unavailable. The subfields
 * are stored flat as {group}_{subfield}; every key for slide N shares the
 * "slider_{N}_group" prefix, so that discriminates the three slides cleanly.
 */
function innotech_pss_get_slide_from_meta( $post_id, $n ) {
	$out  = array(
		'image'   => '',
		'heading' => '',
		'excerpt' => '',
	);
	$all  = get_post_meta( $post_id );
	$find = "slider_{$n}_group";
	foreach ( $all as $key => $vals ) {
		if ( '' === $key || '_' === $key[0] ) {
			continue; // skip ACF reference keys (_field)
		}
		if ( false === strpos( $key, $find ) ) {
			continue;
		}
		$lk  = strtolower( $key );
		$val = isset( $vals[0] ) ? maybe_unserialize( $vals[0] ) : '';
		if ( '' === $out['image'] && false !== strpos( $lk, 'image' ) ) {
			$out['image'] = $val;
		} elseif ( '' === $out['heading'] && false !== strpos( $lk, 'heading' ) ) {
			$out['heading'] = $val;
		} elseif (
			'' === $out['excerpt'] &&
			( false !== strpos( $lk, 'excerpt' ) || false !== strpos( $lk, 'exceprt' ) || false !== strpos( $lk, 'except' ) )
		) {
			$out['excerpt'] = $val;
		}
	}
	return $out;
}

/**
 * Collect up to 3 slides for a showcase post. The groups use mixed prefixes
 * (hero_slider_{n}_group / photo_slider_{n}_group), so both are tried.
 */
function innotech_pss_get_slides( $post_id ) {
	$slides = array();

	for ( $n = 1; $n <= 3; $n++ ) {
		$data = null;

		if ( function_exists( 'get_field' ) ) {
			foreach ( array( "hero_slider_{$n}_group", "photo_slider_{$n}_group" ) as $group_name ) {
				$group = get_field( $group_name, $post_id );
				if ( is_array( $group ) && ! empty( $group ) ) {
					$data = innotech_pss_pick( $group );
					break;
				}
			}
		}

		if ( null === $data ) {
			$data = innotech_pss_get_slide_from_meta( $post_id, $n );
		}

		$url = innotech_pss_image_url( $data['image'] );

		// Skip a slide only when it is entirely empty.
		if ( '' === $url && '' === trim( (string) $data['heading'] ) && '' === trim( (string) $data['excerpt'] ) ) {
			continue;
		}

		$slides[] = array(
			'image'   => $url,
			'heading' => $data['heading'],
			'excerpt' => $data['excerpt'],
		);
	}

	return $slides;
}

function innotech_product_showcase_slider_shortcode( $atts ) {
	$atts = shortcode_atts(
		array( 'post_id' => get_the_ID() ),
		$atts,
		'product_showcase_slider'
	);

	$post_id = absint( $atts['post_id'] );
	if ( ! $post_id ) {
		return '';
	}

	$slides = innotech_pss_get_slides( $post_id );
	if ( empty( $slides ) ) {
		return '';
	}

	// JS (registered in functions.php). Styles ride along in ctc-style.css.
	wp_enqueue_script( 'product-showcase-slider' );

	$total      = count( $slides );
	$total_pad  = str_pad( $total, 2, '0', STR_PAD_LEFT );
	$arrow_prev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
	$arrow_next = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

	ob_start();
	?>
	<div class="product-showcase-slider" data-total="<?php echo esc_attr( $total ); ?>">
		<div class="pss-track">
			<?php foreach ( $slides as $i => $slide ) : ?>
				<div class="pss-slide<?php echo 0 === $i ? ' is-active' : ''; ?>" data-index="<?php echo esc_attr( $i ); ?>">
					<?php if ( ! empty( $slide['image'] ) ) : ?>
						<div class="pss-bg" style="background-image:url('<?php echo esc_url( $slide['image'] ); ?>');"></div>
					<?php endif; ?>
					<div class="pss-overlay"></div>
					<div class="pss-content">
						<?php
						// ACF textarea fields may return wpautop'd HTML — normalise:
						// heading is plain text; excerpt is stripped then re-paragraphed.
						$heading_text = trim( wp_strip_all_tags( (string) $slide['heading'] ) );
						$excerpt_text = trim( wp_strip_all_tags( (string) $slide['excerpt'] ) );
						?>
						<?php if ( '' !== $heading_text ) : ?>
							<h2 class="pss-heading"><?php echo esc_html( $heading_text ); ?></h2>
						<?php endif; ?>
						<?php if ( '' !== $excerpt_text ) : ?>
							<div class="pss-excerpt"><?php echo wp_kses_post( wpautop( $excerpt_text ) ); ?></div>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php if ( $total > 1 ) : ?>
			<ul class="pss-nav" aria-label="Slides">
				<?php foreach ( $slides as $i => $slide ) : ?>
					<li class="pss-nav-item<?php echo 0 === $i ? ' active' : ''; ?>" data-index="<?php echo esc_attr( $i ); ?>" role="button" tabindex="0" aria-label="Go to slide <?php echo esc_attr( $i + 1 ); ?>">
						<span class="pss-dot-main"></span>
						<span class="pss-nav-num"><?php echo esc_html( str_pad( $i + 1, 2, '0', STR_PAD_LEFT ) ); ?></span>
					</li>
					<?php if ( $i < $total - 1 ) : ?>
						<div class="pss-subdots" aria-hidden="true"><span></span><span></span><span></span></div>
					<?php endif; ?>
				<?php endforeach; ?>
			</ul>

			<div class="pss-controls">
				<div class="pss-counter"><span class="pss-cur">01</span> / <span class="pss-total"><?php echo esc_html( $total_pad ); ?></span></div>
				<div class="pss-arrows">
					<button type="button" class="pss-arrow pss-prev" aria-label="Previous slide"><?php echo $arrow_prev; // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
					<button type="button" class="pss-arrow pss-next" aria-label="Next slide"><?php echo $arrow_next; // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
				</div>
			</div>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'product_showcase_slider', 'innotech_product_showcase_slider_shortcode' );
