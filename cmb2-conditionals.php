<?php
/**
 * Plugin Name: CMB2 Conditionals
 * Plugin URI: https://github.com/jcchavezs/cmb2-conditionals
 * Description: Plugin to establish conditional relationships between fields in a CMB2 metabox.
 * Author: José Carlos Chávez <jcchavezs@gmail.com>
 * Author URI: http://github.com/jcchavezs
 * Github Plugin URI: https://github.com/jcchavezs/cmb2-conditionals
 * Github Branch: master
 * Version: 1.0.4
*/

add_action('plugins_loaded', 'cmb2_conditionals_load_actions');

function cmb2_conditionals_load_actions()
{
	if(!defined('CMB2_LOADED') || false === CMB2_LOADED) {
		return;
	}

	define('CMB2_CONDITIONALS_PRIORITY', 99999);

	add_action('admin_init', 'cmb2_conditionals_hook_data_to_save_filtering', CMB2_CONDITIONALS_PRIORITY);
	add_action('admin_footer', 'cmb2_conditionals_footer', CMB2_CONDITIONALS_PRIORITY);

	// CMB2 Form elements which can be set to "required".
	$cmb2_form_elms = array(
		'list_input',
		'input',
		'textarea',
		'input',
		'select',
		'checkbox',
		'radio',
		'radio_inline',
		'taxonomy_radio',
		'taxonomy_multicheck',
		'multicheck_inline',
	);
	
	foreach($cmb2_form_elms as $element) {
		add_filter( "cmb2_{$element}_attributes", 'cmb2_conditionals_maybe_set_required_attribute', CMB2_CONDITIONALS_PRIORITY );
	}
}

/**
 * Decides whether include the scripts or not.
 */
function cmb2_conditionals_footer()
{
	global $pagenow;

    if(!in_array($pagenow, array('post-new.php', 'post.php'))) {
    	return;
    }

	wp_enqueue_script('cmb2-conditionals', plugins_url('/cmb2-conditionals.js', __FILE__ ), array('jquery','cmb2-scripts'), '1.0.5', true);
}

/**
 * Ensure valid html for the required attribute.
 *
 * @param array $args Array of HTML attributes.
 * @return array
 */
function cmb2_conditionals_maybe_set_required_attribute( $args ) {
	if(!isset($args['required'])) {
		return $args;
	}

	// Comply with HTML specs.
	if($args['required'] === true) {
		$args['required'] = 'required';
	}

	return $args;
}

/**
 * Hooks the filtering of the data being saved.
 */
function cmb2_conditionals_hook_data_to_save_filtering()
{
	$cmb2_boxes = CMB2_Boxes::get_all();

	foreach($cmb2_boxes as $cmb_id => $cmb2_box) {
		add_action("cmb2_{$cmb2_box->object_type()}_process_fields_{$cmb_id}", 'cmb2_conditional_filter_data_to_save', CMB2_CONDITIONALS_PRIORITY, 2);
	}
}

/**
 * Filters the data to remove those values which are not suppose to be enabled to edit according to the declared conditionals.
 */
function cmb2_conditional_filter_data_to_save(CMB2 $cmb2, $object_id)
{
	foreach ( $cmb2->prop( 'fields' ) as $field_args ) {
		if(!($field_args['type'] === 'group' || (array_key_exists('attributes', $field_args) && array_key_exists('data-conditional-id', $field_args['attributes'])))) {
			continue;
		}

		if( $field_args['type'] === 'group' ) {
			foreach ( $field_args['fields'] as $group_field ) {
				if(!(array_key_exists('attributes', $group_field) && array_key_exists('data-conditional-id', $group_field['attributes']))) {
					continue;
				}

				$field_id = $group_field['id'];
				$conditional_id = $group_field['attributes']['data-conditional-id'];
				$conditional_id = ($decoded_conditional_id = @json_decode($conditional_id)) ? $decoded_conditional_id : $conditional_id;

				if(is_array($conditional_id) && !empty($conditional_id) && !empty($cmb2->data_to_save[$conditional_id[0]])) {
					foreach( $cmb2->data_to_save[$conditional_id[0]] as $key => $group_data ) {
						$cmb2->data_to_save[$conditional_id[0]][$key] = cmb2_conditional_filter_field_data_to_save($group_data, $field_id, $conditional_id[1], $group_field['attributes'] );
					}
				}
				continue;
			}
		}
		else {
			$field_id = $field_args['id'];
			$conditional_id = $field_args['attributes']['data-conditional-id'];

			$cmb2->data_to_save = cmb2_conditional_filter_field_data_to_save($cmb2->data_to_save, $field_id, $conditional_id, $field_args['attributes'] );
		}
	}
}

function cmb2_conditional_filter_field_data_to_save($data_to_save, $field_id, $conditional_id, $attributes ) {
	if(
		array_key_exists('data-conditional-value', $attributes)
	) {
		$conditional_value = $attributes['data-conditional-value'];

		$conditional_value = ($decoded_conditional_value = @json_decode($conditional_value)) ? $decoded_conditional_value : $conditional_value;

		if(!isset($data_to_save[$conditional_id])) {
			if($conditional_value !== 'off') {
				unset($data_to_save[$field_id]);
			}
			return $data_to_save;
		}

		if((!is_array($conditional_value) && !is_array($data_to_save[$conditional_id])) && $data_to_save[$conditional_id] != $conditional_value) {
			unset($data_to_save[$field_id]);
			return $data_to_save;
		}

		if( is_array($conditional_value) || is_array($data_to_save[$conditional_id]) ) {
			$match = array_intersect( (array) $conditional_value, (array) $data_to_save[$conditional_id] );
			if ( empty( $match ) ) {
				unset($data_to_save[$field_id]);
				return $data_to_save;
			}
		}
	}

	if(!isset($data_to_save[$conditional_id]) || !$data_to_save[$conditional_id]) {
		unset($data_to_save[$field_id]);
	}

	return $data_to_save;
}
