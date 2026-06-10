<?php
/**
 * Profile Carousel Shortcode
 * Usage: [profile_carousel]
 *
 * CPT:        team
 * ACF Fields: fullname, position, facebook, x, linkedin, email
 * Native:     the_content (bio), featured image (photo)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

// ─────────────────────────────────────────────────────────────────────────────
// Shortcode callback
// ─────────────────────────────────────────────────────────────────────────────

function profile_carousel_shortcode( $atts ) {
	$atts = shortcode_atts( array(), $atts, 'profile_carousel' );

	$query = new WP_Query( array(
		'post_type'      => 'team',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => 'menu_order',
		'order'          => 'ASC',
	) );

	if ( ! $query->have_posts() ) return '';

	$profiles = array();

	while ( $query->have_posts() ) {
		$query->the_post();

		$post_id   = get_the_ID();
		$thumb_id  = get_post_thumbnail_id( $post_id );
		$fullname  = get_field( 'fullname' ) ?: get_the_title();
		$position  = get_field( 'position' ) ?: '';
		$bio       = wp_kses_post( apply_filters( 'the_content', get_the_content() ) );
		$image_url = get_the_post_thumbnail_url( $post_id, 'large' ) ?: '';
		$image_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
		$image_alt = $image_alt ?: $fullname;

		$social = array(
			'linkedin' => get_field( 'linkedin' ) ?: '',
			'email'    => get_field( 'email' )    ?: '',
			'facebook' => get_field( 'facebook' ) ?: '',
			'x'        => get_field( 'x' )        ?: '',
		);

		$profiles[] = compact( 'fullname', 'position', 'bio', 'image_url', 'image_alt', 'social' );
	}
	wp_reset_postdata();

	if ( empty( $profiles ) ) return '';

	$total     = count( $profiles );
	$first     = $profiles[0];
	$pad_total = str_pad( $total, 2, '0', STR_PAD_LEFT );

	// Enqueue JS only when shortcode is rendered
	$pc_js_path = get_stylesheet_directory() . '/js/profile-carousel.js';
	wp_enqueue_script(
		'profile-carousel',
		get_stylesheet_directory_uri() . '/js/profile-carousel.js',
		array( 'jquery' ),
		file_exists( $pc_js_path ) ? filemtime( $pc_js_path ) : '1.0.0', // mtime cache-bust
		true
	);

	ob_start();
	?>
	<div id="profile-carousel-container">

		<div id="__navigation">
			<div class="pagination-counter">
				<span class="current-num">01</span>/<span class="total-num"><?php echo esc_html( $pad_total ); ?></span>
			</div>
			<div class="nav-arrows">
				<button class="prev" aria-label="Previous profile">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
				</button>
				<button class="next" aria-label="Next profile">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
				</button>
			</div>
		</div>

		<div class="__info">
			<div class="--name"><?php echo esc_html( $first['fullname'] ); ?></div>
			<div class="--position"><?php echo esc_html( $first['position'] ); ?></div>
			<div class="--line-separator"></div>
			<div class="--description"><?php echo wp_kses_post( $first['bio'] ); ?></div>
			<div class="--social-links">
				<?php echo profile_carousel_social_html( $first['social'] ); ?>
			</div>
		</div>

		<div class="__profiles">
			<?php foreach ( $profiles as $index => $profile ) :
				$json_data = wp_json_encode( array(
					'name'     => $profile['fullname'],
					'position' => $profile['position'],
					'bio'      => $profile['bio'],
					'social'   => $profile['social'],
				) );
				$is_active = ( $index === 0 );
			?>
			<div
				class="--photo<?php echo $is_active ? ' active' : ''; ?>"
				data-index="<?php echo esc_attr( $index ); ?>"
				data-offset="<?php echo esc_attr( $index ); ?>"
				data-profile-data="<?php echo esc_attr( $json_data ); ?>"
				role="button"
				tabindex="0"
				aria-label="<?php echo esc_attr( $profile['fullname'] ); ?>"
			>
				<?php if ( $profile['image_url'] ) : ?>
					<img
						src="<?php echo esc_url( $profile['image_url'] ); ?>"
						alt="<?php echo esc_attr( $profile['image_alt'] ); ?>"
						loading="<?php echo $is_active ? 'eager' : 'lazy'; ?>"
					>
				<?php endif; ?>
			</div>
			<?php endforeach; ?>
		</div>

	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'profile_carousel', 'profile_carousel_shortcode' );

// ─────────────────────────────────────────────────────────────────────────────
// Social links HTML builder (reused by PHP output + JS mirror)
// ─────────────────────────────────────────────────────────────────────────────

function profile_carousel_social_html( $social ) {
	$map = array(
		'linkedin' => array(
			'label' => 'LinkedIn',
			'type'  => 'url',
			'icon'  => '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
		),
		'email' => array(
			'label' => 'Email',
			'type'  => 'email',
			'icon'  => '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
		),
		'facebook' => array(
			'label' => 'Facebook',
			'type'  => 'url',
			'icon'  => '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
		),
		'x' => array(
			'label' => 'X (Twitter)',
			'type'  => 'url',
			'icon'  => '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
		),
	);

	$html = '';
	foreach ( $map as $key => $cfg ) {
		if ( empty( $social[ $key ] ) ) continue;

		$href   = $cfg['type'] === 'email'
			? 'mailto:' . esc_attr( $social[ $key ] )
			: esc_url( $social[ $key ] );
		$target = $cfg['type'] === 'email'
			? ''
			: ' target="_blank" rel="noopener noreferrer"';

		$html .= sprintf(
			'<a href="%s" class="social-link social-link--%s" aria-label="%s"%s>%s</a>',
			$href,
			esc_attr( $key ),
			esc_attr( $cfg['label'] ),
			$target,
			$cfg['icon']
		);
	}

	return $html;
}
