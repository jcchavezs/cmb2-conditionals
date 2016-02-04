jQuery(document).ready(function($) {
	'use strict';
	
	/**
	 * Add 'show' and 'hide' event to JQuery event detection.
	 * @see http://viralpatel.net/blogs/jquery-trigger-custom-event-show-hide-element/
	 */
	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});

	function CMB2ConditionalsInit(context) {
		if(typeof context === 'undefined') {
			context = 'body';
		}

		$('[data-conditional-id]', context).each(function(i, e) {
			var $e = $(e),
				id = $e.data('conditional-id'),
				value = $e.data('conditional-value');

			var	$element = $('[name="' + id + '"]'),
				$parent = $e.parents('.cmb-row:first').hide(),
				$conditionParent = $element.parents('.cmb-row:first');

			$e.data('conditional-required', $e.prop('required')).prop('required', false);

			$element
				.on('change', function(evt){
					if($element.attr('type') == 'checkbox') {
						var checked = $element.prop('checked');
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"]', checked);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value="on"]', checked);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value="off"]', !checked);
					} else if(typeof value === 'undefined') {
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"]', ($element.val() ? true : false));
					} else {
						var conditionValue = CMB2ConditionalsStringToUnicode(evt.currentTarget.value);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"]:not([data-conditional-value="' + conditionValue + '"])', false);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value="' + conditionValue + '"]', true);
						CMB2ConditionalToggleRows('[data-conditional-id="' + id + '"][data-conditional-value*=\'"' + conditionValue + '"\']', true);
					}
				});
				
			$conditionParent.on('hide', function(evt){
				$parent.toggle( false );
			});
			$conditionParent.on('show', function(evt){
				if($element.length === 1) {
					$element.trigger('change');
				} else {
					$element.filter(':checked').trigger('change');
				}
			});

			if($element.length === 1) {
				$element.trigger('change');
			} else {
				$element.filter(':checked').trigger('change');
			}
		});
	}

	function CMB2ConditionalsStringToUnicode(string){
   		var result = '', map = ["Á", "Ă","Ắ","Ặ","Ằ","Ẳ","Ẵ","Ǎ","Â","Ấ","Ậ","Ầ","Ẩ","Ẫ","Ä","Ǟ","Ȧ","Ǡ","Ạ","Ȁ","À","Ả","Ȃ","Ā","Ą","Å","Ǻ","Ḁ","Ⱥ","Ã","Ꜳ","Æ","Ǽ","Ǣ","Ꜵ","Ꜷ","Ꜹ","Ꜻ","Ꜽ","Ḃ","Ḅ","Ɓ","Ḇ","Ƀ","Ƃ","Ć","Č","Ç","Ḉ","Ĉ","Ċ","Ƈ","Ȼ","Ď","Ḑ","Ḓ","Ḋ","Ḍ","Ɗ","Ḏ","ǲ","ǅ","Đ","Ƌ","Ǳ","Ǆ","É","Ĕ","Ě","Ȩ","Ḝ","Ê","Ế","Ệ","Ề","Ể","Ễ","Ḙ","Ë","Ė","Ẹ","Ȅ","È","Ẻ","Ȇ","Ē","Ḗ","Ḕ","Ę","Ɇ","Ẽ","Ḛ","Ꝫ","Ḟ","Ƒ","Ǵ","Ğ","Ǧ","Ģ","Ĝ","Ġ","Ɠ","Ḡ","Ǥ","Ḫ","Ȟ","Ḩ","Ĥ","Ⱨ","Ḧ","Ḣ","Ḥ","Ħ","Í","Ĭ","Ǐ","Î","Ï","Ḯ","İ","Ị","Ȉ","Ì","Ỉ","Ȋ","Ī","Į","Ɨ","Ĩ","Ḭ","Ꝺ","Ꝼ","Ᵹ","Ꞃ","Ꞅ","Ꞇ","Ꝭ","Ĵ","Ɉ","Ḱ","Ǩ","Ķ","Ⱪ","Ꝃ","Ḳ","Ƙ","Ḵ","Ꝁ","Ꝅ","Ĺ","Ƚ","Ľ","Ļ","Ḽ","Ḷ","Ḹ","Ⱡ","Ꝉ","Ḻ","Ŀ","Ɫ","ǈ","Ł","Ǉ","Ḿ","Ṁ","Ṃ","Ɱ","Ń","Ň","Ņ","Ṋ","Ṅ","Ṇ","Ǹ","Ɲ","Ṉ","Ƞ","ǋ","Ñ","Ǌ","Ó","Ŏ","Ǒ","Ô","Ố","Ộ","Ồ","Ổ","Ỗ","Ö","Ȫ","Ȯ","Ȱ","Ọ","Ő","Ȍ","Ò","Ỏ","Ơ","Ớ","Ợ","Ờ","Ở","Ỡ","Ȏ","Ꝋ","Ꝍ","Ō","Ṓ","Ṑ","Ɵ","Ǫ","Ǭ","Ø","Ǿ","Õ","Ṍ","Ṏ","Ȭ","Ƣ","Ꝏ","Ɛ","Ɔ","Ȣ","Ṕ","Ṗ","Ꝓ","Ƥ","Ꝕ","Ᵽ","Ꝑ","Ꝙ","Ꝗ","Ŕ","Ř","Ŗ","Ṙ","Ṛ","Ṝ","Ȑ","Ȓ","Ṟ","Ɍ","Ɽ","Ꜿ","Ǝ","Ś","Ṥ","Š","Ṧ","Ş","Ŝ","Ș","Ṡ","Ṣ","Ṩ","Ť","Ţ","Ṱ","Ț","Ⱦ","Ṫ","Ṭ","Ƭ","Ṯ","Ʈ","Ŧ","Ɐ","Ꞁ","Ɯ","Ʌ","Ꜩ","Ú","Ŭ","Ǔ","Û","Ṷ","Ü","Ǘ","Ǚ","Ǜ","Ǖ","Ṳ","Ụ","Ű","Ȕ","Ù","Ủ","Ư","Ứ","Ự","Ừ","Ử","Ữ","Ȗ","Ū","Ṻ","Ų","Ů","Ũ","Ṹ","Ṵ","Ꝟ","Ṿ","Ʋ","Ṽ","Ꝡ","Ẃ","Ŵ","Ẅ","Ẇ","Ẉ","Ẁ","Ⱳ","Ẍ","Ẋ","Ý","Ŷ","Ÿ","Ẏ","Ỵ","Ỳ","Ƴ","Ỷ","Ỿ","Ȳ","Ɏ","Ỹ","Ź","Ž","Ẑ","Ⱬ","Ż","Ẓ","Ȥ","Ẕ","Ƶ","Ĳ","Œ","ᴀ","ᴁ","ʙ","ᴃ","ᴄ","ᴅ","ᴇ","ꜰ","ɢ","ʛ","ʜ","ɪ","ʁ","ᴊ","ᴋ","ʟ","ᴌ","ᴍ","ɴ","ᴏ","ɶ","ᴐ","ᴕ","ᴘ","ʀ","ᴎ","ᴙ","ꜱ","ᴛ","ⱻ","ᴚ","ᴜ","ᴠ","ᴡ","ʏ","ᴢ","á","ă","ắ","ặ","ằ","ẳ","ẵ","ǎ","â","ấ","ậ","ầ","ẩ","ẫ","ä","ǟ","ȧ","ǡ","ạ","ȁ","à","ả","ȃ","ā","ą","ᶏ","ẚ","å","ǻ","ḁ","ⱥ","ã","ꜳ","æ","ǽ","ǣ","ꜵ","ꜷ","ꜹ","ꜻ","ꜽ","ḃ","ḅ","ɓ","ḇ","ᵬ","ᶀ","ƀ","ƃ","ɵ","ć","č","ç","ḉ","ĉ","ɕ","ċ","ƈ","ȼ","ď","ḑ","ḓ","ȡ","ḋ","ḍ","ɗ","ᶑ","ḏ","ᵭ","ᶁ","đ","ɖ","ƌ","ı","ȷ","ɟ","ʄ","ǳ","ǆ","é","ĕ","ě","ȩ","ḝ","ê","ế","ệ","ề","ể","ễ","ḙ","ë","ė","ẹ","ȅ","è","ẻ","ȇ","ē","ḗ","ḕ","ⱸ","ę","ᶒ","ɇ","ẽ","ḛ","ꝫ","ḟ","ƒ","ᵮ","ᶂ","ǵ","ğ","ǧ","ģ","ĝ","ġ","ɠ","ḡ","ᶃ","ǥ","ḫ","ȟ","ḩ","ĥ","ⱨ","ḧ","ḣ","ḥ","ɦ","ẖ","ħ","ƕ","í","ĭ","ǐ","î","ï","ḯ","ị","ȉ","ì","ỉ","ȋ","ī","į","ᶖ","ɨ","ĩ","ḭ","ꝺ","ꝼ","ᵹ","ꞃ","ꞅ","ꞇ","ꝭ","ǰ","ĵ","ʝ","ɉ","ḱ","ǩ","ķ","ⱪ","ꝃ","ḳ","ƙ","ḵ","ᶄ","ꝁ","ꝅ","ĺ","ƚ","ɬ","ľ","ļ","ḽ","ȴ","ḷ","ḹ","ⱡ","ꝉ","ḻ","ŀ","ɫ","ᶅ","ɭ","ł","ǉ","ſ","ẜ","ẛ","ẝ","ḿ","ṁ","ṃ","ɱ","ᵯ","ᶆ","ń","ň","ņ","ṋ","ȵ","ṅ","ṇ","ǹ","ɲ","ṉ","ƞ","ᵰ","ᶇ","ɳ","ñ","ǌ","ó","ŏ","ǒ","ô","ố","ộ","ồ","ổ","ỗ","ö","ȫ","ȯ","ȱ","ọ","ő","ȍ","ò","ỏ","ơ","ớ","ợ","ờ","ở","ỡ","ȏ","ꝋ","ꝍ","ⱺ","ō","ṓ","ṑ","ǫ","ǭ","ø","ǿ","õ","ṍ","ṏ","ȭ","ƣ","ꝏ","ɛ","ᶓ","ɔ","ᶗ","ȣ","ṕ","ṗ","ꝓ","ƥ","ᵱ","ᶈ","ꝕ","ᵽ","ꝑ","ꝙ","ʠ","ɋ","ꝗ","ŕ","ř","ŗ","ṙ","ṛ","ṝ","ȑ","ɾ","ᵳ","ȓ","ṟ","ɼ","ᵲ","ᶉ","ɍ","ɽ","ↄ","ꜿ","ɘ","ɿ","ś","ṥ","š","ṧ","ş","ŝ","ș","ṡ","ṣ","ṩ","ʂ","ᵴ","ᶊ","ȿ","ɡ","ᴑ","ᴓ","ᴝ","ť","ţ","ṱ","ț","ȶ","ẗ","ⱦ","ṫ","ṭ","ƭ","ṯ","ᵵ","ƫ","ʈ","ŧ","ᵺ","ɐ","ᴂ","ǝ","ᵷ","ɥ","ʮ","ʯ","ᴉ","ʞ","ꞁ","ɯ","ɰ","ᴔ","ɹ","ɻ","ɺ","ⱹ","ʇ","ʌ","ʍ","ʎ","ꜩ","ú","ŭ","ǔ","û","ṷ","ü","ǘ","ǚ","ǜ","ǖ","ṳ","ụ","ű","ȕ","ù","ủ","ư","ứ","ự","ừ","ử","ữ","ȗ","ū","ṻ","ų","ᶙ","ů","ũ","ṹ","ṵ","ᵫ","ꝸ","ⱴ","ꝟ","ṿ","ʋ","ᶌ","ⱱ","ṽ","ꝡ","ẃ","ŵ","ẅ","ẇ","ẉ","ẁ","ⱳ","ẘ","ẍ","ẋ","ᶍ","ý","ŷ","ÿ","ẏ","ỵ","ỳ","ƴ","ỷ","ỿ","ȳ","ẙ","ɏ","ỹ","ź","ž","ẑ","ʑ","ⱬ","ż","ẓ","ȥ","ẕ","ᵶ","ᶎ","ʐ","ƶ","ɀ","ﬀ","ﬃ","ﬄ","ﬁ","ﬂ","ĳ","œ","ﬆ","ₐ","ₑ","ᵢ","ⱼ","ₒ","ᵣ","ᵤ","ᵥ","ₓ"];

	    for(var i = 0; i < string.length; i++){
	    	if(jQuery.inArray(string[i], map) === -1) {
	    		result += string[i]
	    	} else {
		        result += "\\\\u" + ("000" + string[i].charCodeAt(0).toString(16)).substr(-4);
	    	}
	    }

	    return result;
	};

	function CMB2ConditionalToggleRows(obj, showOrHide){
		var $elements = (obj instanceof jQuery) ? obj : $(obj);

		return $elements.each(function(i, e) {
			var $e = $(e);

			$e.prop('required', showOrHide && $e.data('conditional-required'));

			$e.parents('.cmb-row:first').toggle(showOrHide);
		});
	}

	CMB2ConditionalsInit('#post');
});
