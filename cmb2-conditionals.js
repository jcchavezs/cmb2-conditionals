'use strict';

jQuery(document).ready(function($) {
	function CMB2ConditionalsInit(context) {
		if(typeof context === 'undefined') {
			context = 'body';
		}

		$('[data-conditional-id]', context).each(function(i, e) {
			var $e = $(e),
				id = $e.data('conditional-id'),
				value = $e.data('conditional-value');

			var	$element = $('#' + id),
				$parent = $e.parents('.cmb-row:first').hide();

			$e.data('conditional-required', $e.prop('required'));

			$element
				.on('change', function(evt){
					let conditionValue = evt.currentTarget.value;

					if(typeof value === 'undefined') {
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"]', ($element.val() ? true : false));
					} else {
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"]:not([data-conditional-value="' + conditionValue + '"])', false);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value="' + conditionValue + '"]', true);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value*=\'"' + conditionValue + '"\']', true);
					}
				});

			$element.trigger('change');
		});
	}

	function CMB2ConditionalToggleRows(obj, showOrHide){
		var $elements = (obj instanceof jQuery) ? obj : $(obj);

		return $elements.each(function(i, e) {
			let $e = $(e);

			$e.prop('required', showOrHide && $e.data('conditional-required'));

			$e.parents('.cmb-row:first').toggle(showOrHide);
		});
	}

	CMB2ConditionalsInit('#post');
});