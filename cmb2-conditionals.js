jQuery( document ).ready( function( $ ) {
	'use strict';

	/**
	 * Add 'show' and 'hide' event to JQuery event detection.
	 * @see http://viralpatel.net/blogs/jquery-trigger-custom-event-show-hide-element/
	 */
	$.each( ['show', 'hide'], function( i, ev ) {
		var el = $.fn[ev];
		$.fn[ev] = function() {
			this.trigger( 'CMB2' + ev );
			return el.apply( this, arguments );
		};
	});

	/**
	 * Set up the functionality for CMB2 conditionals.
	 */
	function CMB2ConditionalsInit( changeContext, conditionContext ) {
		var loopI, requiredElms, uniqueFormElms, formElms;

		if ( 'undefined' === typeof changeContext ) {
			changeContext = 'body';
		}
		changeContext = $( changeContext );

		if ( 'undefined' === typeof conditionContext ) {
			conditionContext = 'body';
		}
		conditionContext = $( conditionContext );

		/**
		 * Set up event listener for any changes in the form values, including on new elements.
		 */
		changeContext.on( 'change', 'input, textarea, select', function( evt ) {
			var elm       = $( this ),
				fieldName = $( this ).attr( 'name' ),
				dependants,
				dependantsSeen = [],
				checkedValues,
				elmValue;

			// Is there an element which is conditional on this element ?
			dependants = CMB2ConditionalsFindDependants( fieldName, elm, conditionContext );

			// Only continue if we actually have dependants.
			if ( dependants.length > 0 ) {

				// Figure out the value for the current element.
				if ( 'checkbox' === elm.attr( 'type' ) ) {
					checkedValues = $( '[name="' + fieldName + '"]:checked' ).map( function() {
						return this.value;
					}).get();
				} else if ( 'radio' === elm.attr( 'type' ) ) {
					if ( $( '[name="' + fieldName + '"]' ).is( ':checked' ) ) {
						elmValue = elm.val();
					}
				} else {
					elmValue = CMB2ConditionalsStringToUnicode( evt.currentTarget.value );
				}

				dependants.each( function( i, e ) {
					var loopIndex        = 0,
						current          = $( e ),
						currentFieldName = current.attr( 'name' ),
						requiredValue    = current.data( 'conditional-value' ),
						currentParent    = current.parents( '.cmb-row:first' ),
						shouldShow       = false;

					// Only check this dependant if we haven't done so before for this parent.
					// We don't need to check ten times for one radio field with ten options,
					// the conditionals are for the field, not the option.
					if ( 'undefined' !== typeof currentFieldName && '' !== currentFieldName && $.inArray( currentFieldName, dependantsSeen ) < 0 ) {
						dependantsSeen.push = currentFieldName;

						if ( 'checkbox' === elm.attr( 'type' ) ) {
							if ( 'undefined' === typeof requiredValue ) {
								shouldShow = ( checkedValues.length > 0 );
							} else if ( 'off' === requiredValue ) {
								shouldShow = ( 0 === checkedValues.length );
							} else if ( checkedValues.length > 0 ) {
								if ( 'string' === typeof requiredValue ) {
									shouldShow = ( $.inArray( requiredValue, checkedValues ) > -1 );
								} else if ( Array.isArray( requiredValue ) ) {
									for ( loopIndex = 0; loopIndex < requiredValue.length; loopIndex++ ) {
										if ( $.inArray( requiredValue[loopIndex], checkedValues ) > -1 ) {
											shouldShow = true;
											break;
										}
									}
								}
							}
						} else if ( 'undefined' === typeof requiredValue ) {
							shouldShow = ( elm.val() ? true : false );
						} else {
							if ( 'string' === typeof requiredValue ) {
								shouldShow = ( elmValue === requiredValue );
							} else if ( Array.isArray( requiredValue ) ) {
								shouldShow = ( $.inArray( elmValue, requiredValue ) > -1 );
							}
						}

						// Handle any actions necessary.
						currentParent.toggle( shouldShow );
						if ( current.data( 'conditional-required' ) ) {
							current.prop( 'required', shouldShow );
						}

						// If we're hiding the row, hide all dependants (and their dependants).
						if ( false === shouldShow ) {
							CMB2ConditionalsRecursivelyHideDependants( currentFieldName, current, conditionContext );
						}

						// If we're showing the row, check if any dependants need to become visible.
						else {
							if ( 1 === current.length ) {
								current.trigger( 'change' );
							} else {
								current.filter( ':checked' ).trigger( 'change' );
							}
						}
					}
				});
			}
		});


		/**
		 * Make sure it also works when the select/deselect all button is clicked for a multi-checkbox.
		 */
		conditionContext.on( 'click', '.cmb-multicheck-toggle', function( evt ) {
			var button, multiCheck;
			evt.preventDefault();
			button     = $( this );
			multiCheck = button.closest( '.cmb-td' ).find( 'input[type=checkbox]:not([disabled])' );
			multiCheck.trigger( 'change' );
		});


		/**
		 * Deal with (un)setting the required property on (un)hiding of form elements.
		 */

		// Remove the required property from form elements within rows being hidden.
		conditionContext.on( 'CMB2hide', '.cmb-row', function() {
			$( this ).children( '[data-conditional-required="required"]' ).each( function( i, e ) {
				$( e ).prop( 'required', false );
			});
		});

		// Add the required property to form elements within rows being unhidden.
		conditionContext.on( 'CMB2show', '.cmb-row', function() {
			$( this ).children( '[data-conditional-required="required"]' ).each( function( i, e ) {
				$( e ).prop( 'required', true );
			});
		});


		/**
		 * Set the initial state for elements on page load.
		 */

		// Unset required attributes
		requiredElms = $( '[data-conditional-id][required]', conditionContext );
		requiredElms.data( 'conditional-required', requiredElms.prop( 'required' ) ).prop( 'required', false );

		// Hide all conditional elements
		$( '[data-conditional-id]', conditionContext ).parents( '.cmb-row:first' ).hide();

		// Selectively trigger the change event.
		uniqueFormElms = [];
		$( ':input', changeContext ).each( function( i, e ) {
			var elmName = $( e ).attr( 'name' );
			if ( 'undefined' !== typeof elmName && '' !== elmName && -1 === $.inArray( elmName, uniqueFormElms ) ) {
				uniqueFormElms.push( elmName );
			}
		});
		for ( loopI = 0; loopI < uniqueFormElms.length; loopI++ ) {
			formElms = $( '[name="' + uniqueFormElms[loopI] + '"]' );
			if ( 1 === formElms.length || ! formElms.is( ':checked' ) ) {
				formElms.trigger( 'change' );
			} else {
				formElms.filter( ':checked' ).trigger( 'change' );
			}
		}


		/**
		 * Set the initial state of new elements which are added to the page dynamically (i.e. group elms).
		 */
		$( '.cmb2-wrap > .cmb2-metabox' ).on( 'cmb2_add_row', function( evt, row ) {
			var rowFormElms,
				rowRequiredElms = $( '[data-conditional-id][required]', row );

			rowRequiredElms.data( 'conditional-required', rowRequiredElms.prop( 'required' ) ).prop( 'required', false );

			// Hide all conditional elements
			$( '[data-conditional-id]', row ).parents( '.cmb-row:first' ).hide();

			rowFormElms = $( ':input', row );
			if ( 1 === rowFormElms.length || ! rowFormElms.is( ':checked' ) ) {
				rowFormElms.trigger( 'change' );
			} else {
				rowFormElms.filter( ':checked' ).trigger( 'change' );
			}
		});
	}


	/**
	 * Find all fields which are directly conditional on the current field.
	 *
	 * Allows for within group dependencies and multi-check dependencies.
	 */
	function CMB2ConditionalsFindDependants( fieldName, elm, context ) {
		var inGroup, iterator;
		var dependants = [];

		if( typeof( fieldName ) !== "undefined" ) {
		// Remove the empty [] at the end of a multi-check field.
		fieldName = fieldName.replace( /\[\]$/, '' );

		// Is there an element which is conditional on this element ?
		// If a group element, within the group.
		inGroup = elm.closest( '.cmb-repeatable-grouping' );
		if ( 1 === inGroup.length ) {
			iterator = elm.closest( '[data-iterator]' ).data( 'iterator' );
			dependants = $( '[data-conditional-id]', inGroup ).filter( function() {
				var conditionalId = $( this ).data( 'conditional-id' );
				return ( Array.isArray( conditionalId ) && ( fieldName === conditionalId[0] + '[' + iterator + '][' + conditionalId[1] + ']' ) );
			});
		}

		// Else within the whole form.
		else {
			dependants = $( '[data-conditional-id="' + fieldName + '"]', context );
		}
		}
		return dependants;
	}

	/**
	 * Recursively hide all fields which have a dependency on a certain field.
	 */
	function CMB2ConditionalsRecursivelyHideDependants( fieldName, elm, context ) {
		var dependants = CMB2ConditionalsFindDependants( fieldName, elm, context );
		dependants = dependants.filter( ':visible' );

		if ( dependants.length > 0 ) {
			dependants.each( function( i, e ) {
				var dependant     = $( e ),
					dependantName = dependant.attr( 'name' );

				// Hide it.
				dependant.parents( '.cmb-row:first' ).hide();
				if ( dependant.data( 'conditional-required' ) ) {
					dependant.prop( 'required', false );
				}

				// And do the same for dependants.
				CMB2ConditionalsRecursivelyHideDependants( dependantName, dependant, context );
			});
		}
	}

	function CMB2ConditionalsStringToUnicode( string ) {
		var i, result = '',
			map = ['Á', 'Ă', 'Ắ', 'Ặ', 'Ằ', 'Ẳ', 'Ẵ', 'Ǎ', 'Â', 'Ấ', 'Ậ', 'Ầ', 'Ẩ', 'Ẫ', 'Ä', 'Ǟ', 'Ȧ', 'Ǡ', 'Ạ', 'Ȁ', 'À', 'Ả', 'Ȃ', 'Ā', 'Ą', 'Å', 'Ǻ', 'Ḁ', 'Ⱥ', 'Ã', 'Ꜳ', 'Æ', 'Ǽ', 'Ǣ', 'Ꜵ', 'Ꜷ', 'Ꜹ', 'Ꜻ', 'Ꜽ', 'Ḃ', 'Ḅ', 'Ɓ', 'Ḇ', 'Ƀ', 'Ƃ', 'Ć', 'Č', 'Ç', 'Ḉ', 'Ĉ', 'Ċ', 'Ƈ', 'Ȼ', 'Ď', 'Ḑ', 'Ḓ', 'Ḋ', 'Ḍ', 'Ɗ', 'Ḏ', 'ǲ', 'ǅ', 'Đ', 'Ƌ', 'Ǳ', 'Ǆ', 'É', 'Ĕ', 'Ě', 'Ȩ', 'Ḝ', 'Ê', 'Ế', 'Ệ', 'Ề', 'Ể', 'Ễ', 'Ḙ', 'Ë', 'Ė', 'Ẹ', 'Ȅ', 'È', 'Ẻ', 'Ȇ', 'Ē', 'Ḗ', 'Ḕ', 'Ę', 'Ɇ', 'Ẽ', 'Ḛ', 'Ꝫ', 'Ḟ', 'Ƒ', 'Ǵ', 'Ğ', 'Ǧ', 'Ģ', 'Ĝ', 'Ġ', 'Ɠ', 'Ḡ', 'Ǥ', 'Ḫ', 'Ȟ', 'Ḩ', 'Ĥ', 'Ⱨ', 'Ḧ', 'Ḣ', 'Ḥ', 'Ħ', 'Í', 'Ĭ', 'Ǐ', 'Î', 'Ï', 'Ḯ', 'İ', 'Ị', 'Ȉ', 'Ì', 'Ỉ', 'Ȋ', 'Ī', 'Į', 'Ɨ', 'Ĩ', 'Ḭ', 'Ꝺ', 'Ꝼ', 'Ᵹ', 'Ꞃ', 'Ꞅ', 'Ꞇ', 'Ꝭ', 'Ĵ', 'Ɉ', 'Ḱ', 'Ǩ', 'Ķ', 'Ⱪ', 'Ꝃ', 'Ḳ', 'Ƙ', 'Ḵ', 'Ꝁ', 'Ꝅ', 'Ĺ', 'Ƚ', 'Ľ', 'Ļ', 'Ḽ', 'Ḷ', 'Ḹ', 'Ⱡ', 'Ꝉ', 'Ḻ', 'Ŀ', 'Ɫ', 'ǈ', 'Ł', 'Ǉ', 'Ḿ', 'Ṁ', 'Ṃ', 'Ɱ', 'Ń', 'Ň', 'Ņ', 'Ṋ', 'Ṅ', 'Ṇ', 'Ǹ', 'Ɲ', 'Ṉ', 'Ƞ', 'ǋ', 'Ñ', 'Ǌ', 'Ó', 'Ŏ', 'Ǒ', 'Ô', 'Ố', 'Ộ', 'Ồ', 'Ổ', 'Ỗ', 'Ö', 'Ȫ', 'Ȯ', 'Ȱ', 'Ọ', 'Ő', 'Ȍ', 'Ò', 'Ỏ', 'Ơ', 'Ớ', 'Ợ', 'Ờ', 'Ở', 'Ỡ', 'Ȏ', 'Ꝋ', 'Ꝍ', 'Ō', 'Ṓ', 'Ṑ', 'Ɵ', 'Ǫ', 'Ǭ', 'Ø', 'Ǿ', 'Õ', 'Ṍ', 'Ṏ', 'Ȭ', 'Ƣ', 'Ꝏ', 'Ɛ', 'Ɔ', 'Ȣ', 'Ṕ', 'Ṗ', 'Ꝓ', 'Ƥ', 'Ꝕ', 'Ᵽ', 'Ꝑ', 'Ꝙ', 'Ꝗ', 'Ŕ', 'Ř', 'Ŗ', 'Ṙ', 'Ṛ', 'Ṝ', 'Ȑ', 'Ȓ', 'Ṟ', 'Ɍ', 'Ɽ', 'Ꜿ', 'Ǝ', 'Ś', 'Ṥ', 'Š', 'Ṧ', 'Ş', 'Ŝ', 'Ș', 'Ṡ', 'Ṣ', 'Ṩ', 'Ť', 'Ţ', 'Ṱ', 'Ț', 'Ⱦ', 'Ṫ', 'Ṭ', 'Ƭ', 'Ṯ', 'Ʈ', 'Ŧ', 'Ɐ', 'Ꞁ', 'Ɯ', 'Ʌ', 'Ꜩ', 'Ú', 'Ŭ', 'Ǔ', 'Û', 'Ṷ', 'Ü', 'Ǘ', 'Ǚ', 'Ǜ', 'Ǖ', 'Ṳ', 'Ụ', 'Ű', 'Ȕ', 'Ù', 'Ủ', 'Ư', 'Ứ', 'Ự', 'Ừ', 'Ử', 'Ữ', 'Ȗ', 'Ū', 'Ṻ', 'Ų', 'Ů', 'Ũ', 'Ṹ', 'Ṵ', 'Ꝟ', 'Ṿ', 'Ʋ', 'Ṽ', 'Ꝡ', 'Ẃ', 'Ŵ', 'Ẅ', 'Ẇ', 'Ẉ', 'Ẁ', 'Ⱳ', 'Ẍ', 'Ẋ', 'Ý', 'Ŷ', 'Ÿ', 'Ẏ', 'Ỵ', 'Ỳ', 'Ƴ', 'Ỷ', 'Ỿ', 'Ȳ', 'Ɏ', 'Ỹ', 'Ź', 'Ž', 'Ẑ', 'Ⱬ', 'Ż', 'Ẓ', 'Ȥ', 'Ẕ', 'Ƶ', 'Ĳ', 'Œ', 'ᴀ', 'ᴁ', 'ʙ', 'ᴃ', 'ᴄ', 'ᴅ', 'ᴇ', 'ꜰ', 'ɢ', 'ʛ', 'ʜ', 'ɪ', 'ʁ', 'ᴊ', 'ᴋ', 'ʟ', 'ᴌ', 'ᴍ', 'ɴ', 'ᴏ', 'ɶ', 'ᴐ', 'ᴕ', 'ᴘ', 'ʀ', 'ᴎ', 'ᴙ', 'ꜱ', 'ᴛ', 'ⱻ', 'ᴚ', 'ᴜ', 'ᴠ', 'ᴡ', 'ʏ', 'ᴢ', 'á', 'ă', 'ắ', 'ặ', 'ằ', 'ẳ', 'ẵ', 'ǎ', 'â', 'ấ', 'ậ', 'ầ', 'ẩ', 'ẫ', 'ä', 'ǟ', 'ȧ', 'ǡ', 'ạ', 'ȁ', 'à', 'ả', 'ȃ', 'ā', 'ą', 'ᶏ', 'ẚ', 'å', 'ǻ', 'ḁ', 'ⱥ', 'ã', 'ꜳ', 'æ', 'ǽ', 'ǣ', 'ꜵ', 'ꜷ', 'ꜹ', 'ꜻ', 'ꜽ', 'ḃ', 'ḅ', 'ɓ', 'ḇ', 'ᵬ', 'ᶀ', 'ƀ', 'ƃ', 'ɵ', 'ć', 'č', 'ç', 'ḉ', 'ĉ', 'ɕ', 'ċ', 'ƈ', 'ȼ', 'ď', 'ḑ', 'ḓ', 'ȡ', 'ḋ', 'ḍ', 'ɗ', 'ᶑ', 'ḏ', 'ᵭ', 'ᶁ', 'đ', 'ɖ', 'ƌ', 'ı', 'ȷ', 'ɟ', 'ʄ', 'ǳ', 'ǆ', 'é', 'ĕ', 'ě', 'ȩ', 'ḝ', 'ê', 'ế', 'ệ', 'ề', 'ể', 'ễ', 'ḙ', 'ë', 'ė', 'ẹ', 'ȅ', 'è', 'ẻ', 'ȇ', 'ē', 'ḗ', 'ḕ', 'ⱸ', 'ę', 'ᶒ', 'ɇ', 'ẽ', 'ḛ', 'ꝫ', 'ḟ', 'ƒ', 'ᵮ', 'ᶂ', 'ǵ', 'ğ', 'ǧ', 'ģ', 'ĝ', 'ġ', 'ɠ', 'ḡ', 'ᶃ', 'ǥ', 'ḫ', 'ȟ', 'ḩ', 'ĥ', 'ⱨ', 'ḧ', 'ḣ', 'ḥ', 'ɦ', 'ẖ', 'ħ', 'ƕ', 'í', 'ĭ', 'ǐ', 'î', 'ï', 'ḯ', 'ị', 'ȉ', 'ì', 'ỉ', 'ȋ', 'ī', 'į', 'ᶖ', 'ɨ', 'ĩ', 'ḭ', 'ꝺ', 'ꝼ', 'ᵹ', 'ꞃ', 'ꞅ', 'ꞇ', 'ꝭ', 'ǰ', 'ĵ', 'ʝ', 'ɉ', 'ḱ', 'ǩ', 'ķ', 'ⱪ', 'ꝃ', 'ḳ', 'ƙ', 'ḵ', 'ᶄ', 'ꝁ', 'ꝅ', 'ĺ', 'ƚ', 'ɬ', 'ľ', 'ļ', 'ḽ', 'ȴ', 'ḷ', 'ḹ', 'ⱡ', 'ꝉ', 'ḻ', 'ŀ', 'ɫ', 'ᶅ', 'ɭ', 'ł', 'ǉ', 'ſ', 'ẜ', 'ẛ', 'ẝ', 'ḿ', 'ṁ', 'ṃ', 'ɱ', 'ᵯ', 'ᶆ', 'ń', 'ň', 'ņ', 'ṋ', 'ȵ', 'ṅ', 'ṇ', 'ǹ', 'ɲ', 'ṉ', 'ƞ', 'ᵰ', 'ᶇ', 'ɳ', 'ñ', 'ǌ', 'ó', 'ŏ', 'ǒ', 'ô', 'ố', 'ộ', 'ồ', 'ổ', 'ỗ', 'ö', 'ȫ', 'ȯ', 'ȱ', 'ọ', 'ő', 'ȍ', 'ò', 'ỏ', 'ơ', 'ớ', 'ợ', 'ờ', 'ở', 'ỡ', 'ȏ', 'ꝋ', 'ꝍ', 'ⱺ', 'ō', 'ṓ', 'ṑ', 'ǫ', 'ǭ', 'ø', 'ǿ', 'õ', 'ṍ', 'ṏ', 'ȭ', 'ƣ', 'ꝏ', 'ɛ', 'ᶓ', 'ɔ', 'ᶗ', 'ȣ', 'ṕ', 'ṗ', 'ꝓ', 'ƥ', 'ᵱ', 'ᶈ', 'ꝕ', 'ᵽ', 'ꝑ', 'ꝙ', 'ʠ', 'ɋ', 'ꝗ', 'ŕ', 'ř', 'ŗ', 'ṙ', 'ṛ', 'ṝ', 'ȑ', 'ɾ', 'ᵳ', 'ȓ', 'ṟ', 'ɼ', 'ᵲ', 'ᶉ', 'ɍ', 'ɽ', 'ↄ', 'ꜿ', 'ɘ', 'ɿ', 'ś', 'ṥ', 'š', 'ṧ', 'ş', 'ŝ', 'ș', 'ṡ', 'ṣ', 'ṩ', 'ʂ', 'ᵴ', 'ᶊ', 'ȿ', 'ɡ', 'ᴑ', 'ᴓ', 'ᴝ', 'ť', 'ţ', 'ṱ', 'ț', 'ȶ', 'ẗ', 'ⱦ', 'ṫ', 'ṭ', 'ƭ', 'ṯ', 'ᵵ', 'ƫ', 'ʈ', 'ŧ', 'ᵺ', 'ɐ', 'ᴂ', 'ǝ', 'ᵷ', 'ɥ', 'ʮ', 'ʯ', 'ᴉ', 'ʞ', 'ꞁ', 'ɯ', 'ɰ', 'ᴔ', 'ɹ', 'ɻ', 'ɺ', 'ⱹ', 'ʇ', 'ʌ', 'ʍ', 'ʎ', 'ꜩ', 'ú', 'ŭ', 'ǔ', 'û', 'ṷ', 'ü', 'ǘ', 'ǚ', 'ǜ', 'ǖ', 'ṳ', 'ụ', 'ű', 'ȕ', 'ù', 'ủ', 'ư', 'ứ', 'ự', 'ừ', 'ử', 'ữ', 'ȗ', 'ū', 'ṻ', 'ų', 'ᶙ', 'ů', 'ũ', 'ṹ', 'ṵ', 'ᵫ', 'ꝸ', 'ⱴ', 'ꝟ', 'ṿ', 'ʋ', 'ᶌ', 'ⱱ', 'ṽ', 'ꝡ', 'ẃ', 'ŵ', 'ẅ', 'ẇ', 'ẉ', 'ẁ', 'ⱳ', 'ẘ', 'ẍ', 'ẋ', 'ᶍ', 'ý', 'ŷ', 'ÿ', 'ẏ', 'ỵ', 'ỳ', 'ƴ', 'ỷ', 'ỿ', 'ȳ', 'ẙ', 'ɏ', 'ỹ', 'ź', 'ž', 'ẑ', 'ʑ', 'ⱬ', 'ż', 'ẓ', 'ȥ', 'ẕ', 'ᵶ', 'ᶎ', 'ʐ', 'ƶ', 'ɀ', 'ﬀ', 'ﬃ', 'ﬄ', 'ﬁ', 'ﬂ', 'ĳ', 'œ', 'ﬆ', 'ₐ', 'ₑ', 'ᵢ', 'ⱼ', 'ₒ', 'ᵣ', 'ᵤ', 'ᵥ', 'ₓ'];

		for ( i = 0; i < string.length; i++ ) {
			if ( $.inArray( string[i], map ) === -1 ) {
				result += string[i];
			} else {
				result += '\\u' + ( '000' + string[i].charCodeAt( 0 ).toString( 16 ) ).substr( -4 );
			}
		}

		return result;
	}

	switch( true ) {

		// init for classic editor
		case $( '#post' ).length > 0:
			CMB2ConditionalsInit( '#post', '#post .cmb2-wrap' );
			break;

		// init for gutenberg editor and options pages
		case $( '#wpwrap' ).length > 0:
			CMB2ConditionalsInit( '#wpwrap', '#wpwrap .cmb2-wrap' );
			break;

	}
});
