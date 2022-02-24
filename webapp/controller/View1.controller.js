sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("CharacteristicCustomControl.controller.View1", {
		onInit: function() {
			// Set json model to the view
			var viewModel = new JSONModel();
			viewModel.setData({
				showDecimals: false,
				showStackMultiValues: false
			});
			
			// Set the model the view
			this.getView().setModel(viewModel, "viewModel");
		},
		updateUI: function() {
			this.charName = this.byId("charName").getValue();
			this.charDescription = this.byId("charDescription").getValue();
			this.charType = this.byId("charType").getSelectedKey();
			this.charMultiValue = this.byId("charMultiValue").getState();
			this.charLength = this.byId("charLength").getValue();
			this.charDecimals = this.byId("charDecimals").getValue();
			this.charShowValueHelp = this.byId("charShowValueHelp").getState();
			this.charValueHelpOnly = this.byId("charValueHelpOnly").getState();
			this.charStackMultiValues = this.byId("charStackMultiValues").getState();
			
			// Get the characteristics field
			var characteristicInput = this.byId("characteristicInput");
			
			characteristicInput.setName(this.charName);
			characteristicInput.setDescription(this.charDescription);
			characteristicInput.setType(this.charType);
			characteristicInput.setMultiValue(this.charMultiValue);
			characteristicInput.setLength(parseInt(this.charLength));
			characteristicInput.setDecimals(parseInt(this.charDecimals));
			characteristicInput.setShowValueHelp(this.charShowValueHelp);
			characteristicInput.setValueHelpOnly(this.charValueHelpOnly);
			characteristicInput.setStackMultiValues(this.charStackMultiValues);
			
			this.setVisibilityOfFields();
		},
		setVisibilityOfFields: function() {
		
			this.charMultiValue = this.byId("charMultiValue").getState();
			this.charType = this.byId("charType").getSelectedKey();
			
			// Set the visibility to false by default
			this.getView().getModel("viewModel").setProperty("/showStackMultiValues", false);
			this.getView().getModel("viewModel").setProperty("/showDecimals", false);
			
			if(this.charMultiValue) {
				this.getView().getModel("viewModel").setProperty("/showStackMultiValues", true);
			}
			
			if(this.charType === "NUM") {
				this.getView().getModel("viewModel").setProperty("/showDecimals", true);
			}
			
		}
		
	});

});