<?php
/**
 * Include and setup custom metaboxes and fields. (make sure you copy this file to outside the CMB2 directory)
 *
 * Be sure to replace all instances of 'yourprefix_' with your project's prefix.
 * http://nacin.com/2010/05/11/in-wordpress-prefix-everything/
 *
 * @category YourThemeOrPlugin
 * @package  Demo_CMB2_Conditionals
 * @license  http://www.opensource.org/licenses/gpl-license.php GPL v2.0 (or later)
 * @link     https://github.com/jcchavezs/cmb2-conditionals
 */

/**
 * Get the bootstrap! If using the plugin from wordpress.org, REMOVE THIS!
 */

if ( ! defined( 'CMB2_DIR' ) ) {
	define('CMB2_DIR', WP_PLUGIN_DIR . '/cmb2');
}

if ( file_exists( CMB2_DIR . '/cmb2/init.php' ) ) {
	require_once CMB2_DIR . '/cmb2/init.php';
} elseif ( file_exists( CMB2_DIR . '/CMB2/init.php' ) ) {
	require_once CMB2_DIR . '/CMB2/init.php';
}

add_action( 'cmb2_init', 'yourprefix_register_demo_metabox' );
/**
 * Hook in and add a demo metabox. Can only happen on the 'cmb2_init' hook.
 */
function yourprefix_register_demo_metabox() {

	// Start with an underscore to hide fields from custom fields list
	$prefix = '_yourprefix_demo_';

	/**
	 * Sample metabox to demonstrate each field type included
	 */
	$cmb_demo = new_cmb2_box( array(
		'id'            => $prefix . 'metabox',
		'title'         => 'Test Metabox',
		'object_types'  => array( 'page', ), // Post type
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Address',
		'desc'       => 'Write down an address for showing the other address options',
		'id'         => $prefix . 'address',
		'type'       => 'text',
		// 'show_on_cb' => 'yourprefix_hide_if_no_cats', // function should return a bool value
		// 'sanitization_cb' => 'my_custom_sanitization', // custom sanitization callback parameter
		// 'escape_cb'       => 'my_custom_escaping',  // custom escaping callback parameter
		// 'on_front'        => false, // Optionally designate a field to wp-admin only
		// 'repeatable'      => true,
	) );

	$cmb_demo->add_field( array(
		'name' => 'Zipcode',
		'id'   => $prefix . 'zipcode',
		'type' => 'text_medium',
		// 'repeatable' => true,
		'attributes' => array(
			'required' => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'address',
		)
	) );

	$cmb_demo->add_field( array(
		'name' => 'Country',
		'id'   => $prefix . 'country',
		'type' => 'text_medium',
		// 'repeatable' => true,
		'attributes' => array(
			'required' => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'address',
		)
	) );

	$cmb_demo->add_field( array(
		'name' => 'Checkbox',
		'id'   => $prefix . 'checkbox',
		'type' => 'checkbox',
	) );

	$cmb_demo->add_field( array(
		'name' => 'Show if checked',
		'id'   => $prefix . 'show_if_checked',
		'type' => 'text',
		'attributes' => array(
			'data-conditional-id' => $prefix . 'checkbox',
			// works too: 'data-conditional-value' => 'on',
		)
	) );

	$cmb_demo->add_field( array(
		'name' => 'Show if unchecked',
		'id'   => $prefix . 'show_if_unchecked',
		'type' => 'text',
		'attributes' => array(
			'data-conditional-id' => $prefix . 'checkbox',
			'data-conditional-value' => 'off',
		)
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Reason',
		'id'               => $prefix . 'reason',
		'type'             => 'select',
		'show_option_none' => true,
		'options'          => array(
			'one' => 'Reason 1',
			'two' => 'Reason 2',
			'three' => 'Reason 3',
			'other' => 'Other reason'
		),
	) );

	$cmb_demo->add_field( array(
		'name' => 'Other reason detail',
		'desc' => 'Write down the reason',
		'id'   => $prefix . 'other_reason_detail',
		'type' => 'textarea',
		'attributes' => array(
			'required' => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'reason',
			'data-conditional-value' => 'other',
		)
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Reason 2',
		'id'               => $prefix . 'reason_2',
		'type'             => 'select',
		'show_option_none' => true,
		'options'          => array(
			'one' => 'Reason 1',
			'two' => 'Reason 2',
			'three' => 'Reason 3',
			'other_price' => 'Other reason based on the price',
			'other_quality' => 'Other reason based on the quality'
		),
	) );

	$cmb_demo->add_field( array(
		'name' => 'Other reason detail',
		'desc' => 'Write down the reason',
		'id'   => $prefix . 'other_reason_detail_2',
		'type' => 'textarea',
		'attributes' => array(
			'required' => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'reason_2',
			'data-conditional-value' => json_encode(array('other_price', 'other_quality'))
		)
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Sizes',
		'id'               => $prefix . 'sizes',
		'type'             => 'radio',
		'show_option_none' => true,
		'options'          => array(
		    'xs' => 'XS',
		    's' => 'S',
		    'm'   => 'M',
		    'l'     => 'L',
		    'xl'     => 'XL',
		    'custom'   => 'Custom'
		),
		'attributes' => array(
			 'required'    => 'required',
		)
	) );

	$cmb_demo->add_field( array(
		'name' => 'Custom description',
		'desc' => 'Write a description for your custom size',
		'id'   => $prefix . 'size_custom_description',
		'type' => 'textarea',
		'required' => true,
		'attributes' => array(
			'required' => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'sizes',
			'data-conditional-value' => 'custom',
		)
	) );
}
