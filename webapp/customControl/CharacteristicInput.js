sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("customControl.CharacteristicInput", {
		metadata : {
			properties: {
				type: {
					type: "string"
				},
				multiValue: {
					type: "boolean"
				},
				length: {
					type: "string"
				},
				decimals: {
					type: "string"
				},
				valueHelpOnly: {
					type: "boolean"
				}
			}
		},
		init : function () {
		},
		renderer : function (oRM, oControl) {
		}
	});
});