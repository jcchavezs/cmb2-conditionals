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
 * Get the bootstrap! If using the CMB2 installed as a plugin, REMOVE THIS!
 */

if ( ! defined( 'CMB2_DIR' ) ) {
	define( 'CMB2_DIR', WP_PLUGIN_DIR . '/cmb2' );
}

if ( file_exists( CMB2_DIR . '/cmb2/init.php' ) ) {
	require_once CMB2_DIR . '/cmb2/init.php';
} elseif ( file_exists( CMB2_DIR . '/CMB2/init.php' ) ) {
	require_once CMB2_DIR . '/CMB2/init.php';
}

add_action( 'cmb2_init', 'yourprefix_register_conditionals_demo_metabox' );
/**
 * Hook in and add a demo metabox. Can only happen on the 'cmb2_init' hook.
 */
function yourprefix_register_conditionals_demo_metabox() {

	// Start with an underscore to hide fields from custom fields list.
	$prefix = '_yourprefix_conditions_demo_';

	/**
	 * Sample metabox to demonstrate the different conditions you can set.
	 */
	$cmb_demo = new_cmb2_box( array(
		'id'            => $prefix . 'metabox',
		'title'         => 'Test Metabox',
		'object_types'  => array( 'page' ), // Post type.
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Address',
		'desc'       => 'Write down an address for showing the other address options',
		'id'         => $prefix . 'address',
		'type'       => 'text',
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Zipcode',
		'id'         => $prefix . 'zipcode',
		'type'       => 'text_medium',
		'attributes' => array(
			'required'            => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'address',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Country',
		'id'         => $prefix . 'country',
		'type'       => 'text_medium',
		'attributes' => array(
			'required'            => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'address',
		),
	) );

	$cmb_demo->add_field( array(
		'name' => 'Checkbox',
		'id'   => $prefix . 'checkbox',
		'type' => 'checkbox',
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Show if checked',
		'id'         => $prefix . 'show_if_checked',
		'type'       => 'text',
		'attributes' => array(
			'data-conditional-id' => $prefix . 'checkbox',
			// Works too: 'data-conditional-value' => 'on'.
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Show if unchecked',
		'id'         => $prefix . 'show_if_unchecked',
		'type'       => 'text',
		'attributes' => array(
			'data-conditional-id'    => $prefix . 'checkbox',
			'data-conditional-value' => 'off',
		),
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Reason',
		'id'               => $prefix . 'reason',
		'type'             => 'select',
		'show_option_none' => true,
		'options'          => array(
			'one'   => 'Reason 1',
			'two'   => 'Reason 2',
			'three' => 'Reason 3',
			'other' => 'Other reason',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Other reason detail',
		'desc'       => 'Write down the reason',
		'id'         => $prefix . 'other_reason_detail',
		'type'       => 'textarea',
		'attributes' => array(
			'required'               => true, // Will be required only if visible.
			'data-conditional-id'    => $prefix . 'reason',
			'data-conditional-value' => 'other',
		),
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Reason 2',
		'id'               => $prefix . 'reason_2',
		'type'             => 'select',
		'show_option_none' => true,
		'options'          => array(
			'one'            => 'Reason 1',
			'two'            => 'Reason 2',
			'three'          => 'Reason 3',
			'other_price'    => 'Other reason based on the price',
			'other_quality'  => 'Other reason based on the quality',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Other reason detail',
		'desc'       => 'Write down the reason',
		'id'         => $prefix . 'other_reason_detail_2',
		'type'       => 'textarea',
		'attributes' => array(
			'required'               => true, // Will be required only if visible.
			'data-conditional-id'    => $prefix . 'reason_2',
			'data-conditional-value' => wp_json_encode( array( 'other_price', 'other_quality' ) ),
		),
	) );

	$cmb_demo->add_field( array(
		'name'             => 'Sizes',
		'id'               => $prefix . 'sizes',
		'type'             => 'radio',
		'show_option_none' => true,
		'options'          => array(
		    'xs'     => 'XS',
		    's'      => 'S',
		    'm'      => 'M',
		    'l'      => 'L',
		    'xl'     => 'XL',
		    'custom' => 'Custom',
		),
		'attributes'       => array(
			'required'       => 'required',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Custom description',
		'desc'       => 'Write a description for your custom size',
		'id'         => $prefix . 'size_custom_description',
		'type'       => 'textarea',
		'required'   => true,
		'attributes' => array(
			'required'               => true, // Will be required only if visible.
			'data-conditional-id'    => $prefix . 'sizes',
			'data-conditional-value' => 'custom',
		),
	) );

	// Example using conditionals with multi-check checkboxes.
	$cmb_demo->add_field( array(
		'name'    => __( 'Test Multi Checkbox', 'cmb2' ),
		'desc'    => __( 'field description (optional)', 'cmb2' ),
		'id'      => $prefix . 'multi-checkbox',
		'type'    => 'multicheck',
		'options' => array(
			'check1' => __( 'Check One', 'cmb2' ),
			'check2' => __( 'Check Two', 'cmb2' ),
			'check3' => __( 'Check Three', 'cmb2' ),
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Multi-check: Shown if *any* checkbox is checked',
		'id'         => $prefix . 'multi-check-detail-test-no-value',
		'type'       => 'text',
		'attributes' => array(
			'required'            => true, // Will be required only if visible.
			'data-conditional-id' => $prefix . 'multi-checkbox',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Multi-check: Only shown if checkbox 2 is checked',
		'id'         => $prefix . 'multi-check-detail-test-string',
		'type'       => 'text',
		'attributes' => array(
			'data-conditional-id'    => $prefix . 'multi-checkbox',
			'data-conditional-value' => 'check2',
		),
	) );

	$cmb_demo->add_field( array(
		'name'       => 'Multi-check : Shown if either checkbox 1 *or* 3 is checked',
		'id'         => $prefix . 'multi-check-detail-test-array',
		'type'       => 'text',
		'attributes' => array(
			'data-conditional-id'    => $prefix . 'multi-checkbox',
			'data-conditional-value' => wp_json_encode( array( 'check1', 'check3' ) ),
		),
	) );

	// Example conditionals within a group.
	$group_id = $cmb_demo->add_field( array(
		'id'          => $prefix . 'repeatable-group',
		'type'        => 'group',
		'description' => 'Repeatable group',
		'options'     => array(
			'group_title'   => 'Entry {#}', // Since version 1.1.4, {#} gets replaced by row number.
			'add_button'    => 'Add Another Entry',
			'remove_button' => 'Remove Entry',
			'sortable'      => true, // Beta.
		),
	) );

	$cmb_demo->add_group_field( $group_id, array(
		'name' => 'Checkbox in group',
		'id'   => 'checkbox',
		'type' => 'checkbox',
	) );

	$cmb_demo->add_group_field( $group_id, array(
		'name'       => 'Dependant field',
		'id'         => 'dependant',
		'type'       => 'text_small',
		'attributes' => array(
			'required'               => true, // Will be required only if visible.
			'data-conditional-id'    => wp_json_encode( array( $group_id, 'checkbox' ) ),
			'data-conditional-value' => 'on',
		),
	) );
}
