<?php
/**
 * Plugin Name: CMB2 Conditionals
 * Plugin URI: https://github.com/jcchavezs/cmb2-conditionals
 * Description: Plugin to stablish conditional relationships between fields in a CMB2 metabox.
 * Author: José Carlos Chávez <jcchavezs@gmail.com>
 * Author URI: http://github.com/jcchavezs
 * Github Plugin URI: https://github.com/jcchavezs/cmb2-conditionals
 * Github Branch: master
 * Version: 1.0.2
*/

function cmb2_conditionals_footer()
{
	global $post, $pagenow;

    if(null === $post || !in_array($pagenow, array('post-new.php', 'post.php'))) {
    	return;
    }

	wp_enqueue_script('cmb2-conditionals', plugins_url('/cmb2-conditionals.js', __FILE__ ), array('jquery'), '1.0.2', true);
}

add_action('admin_footer', 'cmb2_conditionals_footer', 99999);