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
				showStackMultiValues: false,
				characteristics: []
			});
			
			// Set the model the view
			this.getView().setModel(viewModel, "viewModel");
			
			this.setCharacteristicsToModel();
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
			
		},
		setCharacteristicsToModel: function() {
			var path = jQuery.sap.getModulePath("CharacteristicCustomControl", "/model/Characteristics.json"); 
			// initialize the model with the JSON file
			var characteristicsModel = new JSONModel(path);
			      
			// set the model to the view
			this.getView().setModel(characteristicsModel, "characteristicsModel");
		},
		onSelectionChange: function(evt) {
			// Get the selected item
			var selectedItem = evt.getParameter("item");
			var key = selectedItem.getKey();
			
			if(key === "opts") {
				this.byId("characteristicsOptions").setVisible(true);
				this.byId("characteristicsTable").setVisible(false);
			} else if(key === "table") {
				this.byId("characteristicsOptions").setVisible(false);
				this.byId("characteristicsTable").setVisible(true);
			}
			
		},
		stackValuesChanged: function(evt) {
			var state = evt.getSource().getState();
			
			// Get the characteristics data 
			var characteristics = this.getView().getModel("characteristicsModel").getProperty("/characteristics");
			
			characteristics.forEach(function(characteristic) {
				characteristic.stackMultiValues = state;
			});
			
			this.getView().getModel("characteristicsModel").setProperty("/characteristics", characteristics);
			
		}
		
	});

});