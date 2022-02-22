sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Input",
	"sap/m/MultiInput",
	"sap/m/MessageToast",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/m/HBox",
	"sap/m/FlexItemData",
	"sap/m/Dialog",
	"sap/m/MessageStrip",
	"sap/m/SearchField",
	"sap/m/Link",
	"sap/m/List",
	"sap/m/ListMode",
	"sap/m/Token"
], function (Control, 
			 Input, 
			 MultiInput, 
			 MessageToast, 
			 SelectDialog, 
			 StandardListItem, 
			 JSONModel, 
			 Filter, 
			 FilterOperator, 
			 VBox,
			 Button,
			 Item,
			 HBox,
			 FlexItemData,
			 Dialog, 
			 MessageStrip,
			 SearchField, 
			 Link,
			 List,
			 ListMode, 
			 Token) {
	"use strict";
	return Control.extend("CharacteristicCustomControl.customControl.CharacteristicInput", {
		metadata : {
			properties: {
				name: {
					type: "string",
					defaultValue: "Characteristic"
				},
				description: {
					type: "description"	
				},
				type: {
					type: "string"
				},
				multiValue: {
					type: "boolean"
				},
				length: {
					type: "int",
					defaultValue: 30
				},
				decimals: {
					type: "int",
					defaultValue: 0
				},
				valueHelpOnly: {
					type: "boolean"
				},
				showValueHelp: {
					type: "boolean"
				},
				value: {
					type: "string"
				},
				stackMultiValues: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations : {
				_outputControl: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				valueHelpItems: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				values: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			}
		},
		init : function () {
		
		},
		renderer : function (oRM, oControl) {
			oControl._createControl.apply(oControl, []);
			
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapUI5Charactersistic");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl._outputControl);
			oRM.write("</div>");
			
		},
		/**
		 * Method determines which type of control is required based on the different properties
		 * */
		_createControl: function() {
			var type = this.getType();
			var multiValue = this.getMultiValue();
			
			if(type === "CHAR" || type === "NUMBER") {
				if(multiValue) {
					this._createMultiValueInputControl();	
				} else {
					this._createSingleValueInputControl();
				}
				
			}
			
		},
		/**
		 * Function creates a multi value control and adds validations based on the type 
		 * */
		_createMultiValueInputControl: function() {
			// Get if the values should be stacked
			var stackValues = this.getStackMultiValues();
			
			if(stackValues) {
				// Set the vbox as the output control
				this._outputControl = new VBox();
				
			} else {
				this._outputControl = new MultiInput({
					valueHelpOnly: true, // Multi Values for Characteristics to be entered through value help only
					valueHelpRequest: function() {
						this._createMultiInputValueHelp();
					}.bind(this)
				});	
			}
			this._addMutliValuesToControl();
			this.setAggregation(this._outputControl);
		},
		/**
		 * Function creates a single Value Input control and adds validations based on the type 
		 * */
		_createSingleValueInputControl: function() {
			var showValueHelp = this.getShowValueHelp();
			var valueHelpOnly = this.getValueHelpOnly();
			this._outputControl = new Input({
				showValueHelp: showValueHelp,
				valueHelpOnly: valueHelpOnly,
				maxLength: this.getLength(),
				valueHelpRequest: function() {
					// Set the value help control 
					this._valueHelpControl = this._outputControl;
					this._openCharacteristicValueHelp();
				}.bind(this)
			});
			this.setAggregation(this._outputControl);
		},
		/**
		 * Function opens a sap.m.SelectDialog for selection of value help 
		 * */
		_openCharacteristicValueHelp: function() {
			// Check if the show value help is not true, then return
			if(!this.getShowValueHelp()) {
				return;
			}
			
			// Get the value Help Items
			if(!this.getValueHelpItems() || !this.getValueHelpItems() || this.getValueHelpItems().length === 0) {
				MessageToast.show("Value Help not available");
			}
			
			var valueHelpDialog = new SelectDialog({
				title: "Select value for " + this.getDescription(),
				items: {
					path: "valueHelpModel>/items",
					template: new StandardListItem({
						title: "{valueHelpModel>key}",
						description: "{valueHelpModel>text}"
					}),
					templateShareable: true
				},
				confirm: function(evt) {
					var selectedItem = evt.getParameter("selectedItem");
					
					// Get the binding context for the confirmed item
					var bindingContext = selectedItem.getBindingContext("valueHelpModel");
					
					// Get the key and value from the binding context
					var key = bindingContext.getProperty(bindingContext.getPath() + "/key");
					var text = bindingContext.getProperty(bindingContext.getPath() + "/text");
					
					// Title for the item is the value and description is the description of the value
					this._setValueFromHelp(key, text);
				}.bind(this),
				liveChange: function(evt) {
					// Get the value for the live change
					var value = evt.getParameter("value");
					
					// Set this filter to the binding
					var binding = valueHelpDialog.getBinding("items");
					
					var filters = [];
					filters.push(new Filter({
						path: "key",
						operator: FilterOperator.Contains,
						value1: value
					}));
					
					filters.push(new Filter({
						path: "text",
						operator: FilterOperator.Contains,
						value1: value
					}));
					
					binding.filter([new Filter({
						filters: filters,
						and: false
					})]);
					
				}
			});
			
			var model = this._getValueHelpModel();
			valueHelpDialog.setModel(model, "valueHelpModel");
			
			
			valueHelpDialog.open();
			
		},
		/**
		 * Function creates a model inside the control for the value help
		 * @return {sap.ui.model.json.JSONModel} [Instance of the model with the data]
		 * */
		_getValueHelpModel: function() {
			// Get all the value help items
			var valueHelpItems = this.getValueHelpItems();
			
			// create the json model
			var model = new JSONModel();
			
			var valueHelpData = [];
			
			valueHelpItems.forEach(function(valueHelpItem) {
				valueHelpData.push({
					key: valueHelpItem.getKey(),
					text: valueHelpItem.getText()
				});
			});
			
			model.setData({
				items: valueHelpData
			});
			
			return model;
			
		},
		/**
		 * Function sets the value selected from the value help 
		 * */
		_setValueFromHelp: function(key, text) {
			this.setValue(key, text);
			
		},
		/**
		 * Overriding method from the framework to set the value to the actual control
		 * */
		setValue: function(value, text) {
			this.setProperty("value", value, true);
			
			var controlValue = value;
			// Check if there is text then change the value and append the description/text
			if(text) {
				controlValue += " - " + text;
			}
			this._valueHelpControl.setValue(controlValue);
			
			
			// Check if this has a current Value item which is for multipleinput
			if(this._valueHelpControl._currentValueItem) {
				this._valueHelpControl._currentValueItem.setKey(value);
				this._valueHelpControl._currentValueItem.setText(text);
			}
		},
		/**
		 * Function adds Multiple Values to control
		 * */
		_addMutliValuesToControl: function() {
			// Check if stack Values is on
			var stackValues = this.getStackMultiValues();
			
			if(stackValues) {
				var values = this.getValues();
				
				// Destroy all the items
				this._outputControl.destroyItems();
				
				if(!Array.isArray(values)) {
					values = [];
					return;
				}
				
				// Loop at all the values and add input fields
				values.forEach(function(value) {
					var controlValue = value.getKey();
					
					// Get the text value
					if(value.getText()) {
						controlValue += " - " + value.getText();
					}
					
					var inputControl = new Input({
						value: controlValue,
						showValueHelp: this.getShowValueHelp(),
						valueHelpOnly: this.getValueHelpOnly(),
						valueHelpRequest: function() {
							this._valueHelpControl = inputControl;
							this._openCharacteristicValueHelp();
						}.bind(this)
					});
					
					inputControl._currentValueItem = value;
					
					// Create an HBox with the button to remove the item
					var inputHBox = new HBox();
					inputHBox.addItem(inputControl);
					
					// Add the remove button
					inputHBox.addItem(new Button({
						icon: "sap-icon://less",
						tooltip: "Remove value",
						press: function() {
							this.removeValue(value);
						}.bind(this)
					}));
					
					// Input control needs to cover the most of the space
					inputControl.setLayoutData(new FlexItemData({
						growFactor: 1
					}));
					this._outputControl.addItem(inputHBox);
					
				}.bind(this));
				
				// Add a button so that user can create a value
				var addFirstValueButton = new Button({
					press: function() {
						this.addValue(new Item({
							key: "",
							text: ""
						}));
					}.bind(this),
					text: "Add New Value",
					icon: "sap-icon://add"
				});
				
				this._outputControl.addItem(addFirstValueButton);
				
				
			} else {
				// Set the values to the multi input
				this._addTokensToMultiInput();
			}
		},
		/**
		 * Function creates a Multi Input Value Help
		 * */
		_createMultiInputValueHelp: function() {
			// Get multi value help model
			var multiValueHelpModel = this._getMultiValueHelpModel();
			
			// Create a new dialog for the value help
			var valueHelpDialog = new Dialog({
				title: "Value Help for " + this.getName(),
				contentHeight: "600px",
				afterClose: function() {
					this._destroyMultiHelpDialogContent();
				}.bind(this)
			});
			
			// Set the model to the value help dialog
			valueHelpDialog.setModel(multiValueHelpModel, "multiValueHelpModel");
			
			// Add search field for searching or adding a value
			this._addSearchFieldToMultiInputValueHelp(valueHelpDialog);
			
			// Check if there can be other values and the selection is not value help only
			// If yes, then add the Message that a new value can be created
			if(!this.getValueHelpOnly()) {
				this._addValueCanBeCreatedMessage(valueHelpDialog);
			}
			
			this._addMultiInputValueHelpList(valueHelpDialog);
			
			// Add the begin button
			valueHelpDialog.setBeginButton(new Button({
				text: "OK",
				press: function() {
					this._setValuesToMultiInput(valueHelpDialog);
					valueHelpDialog.close();
				}.bind(this)
			}));
			
			// Add the end button
			valueHelpDialog.setEndButton(new Button({
				text: "Cancel",
				press: function() {
					valueHelpDialog.close();
				}
			}));
			
			valueHelpDialog.open();
			
		},
		/**
		 * Get Multi Value Help Model
		 * */
		_getMultiValueHelpModel: function() {
			// Create multiValueHelp model
			var multiValueHelpModel = new JSONModel();
			
			// Initialize the value help array 
			var valueHelp = [];
			
			// Get all the values for this characteristics
			var values = this.getValues();
			
			// Get all the value help items
			var valueHelpItems = this.getValueHelpItems();
			
			values.forEach(function(value) {
				var key = value.getKey();
				
				// Check if the value exists in value help items
				var existingValueHelp = valueHelpItems.filter(function(valueHelpItem) {
					return valueHelpItem.getKey() === value.getKey();
				});
				
				var text = "";
				
				if(existingValueHelp && existingValueHelp.length > 0) {
					text = existingValueHelp[0].getText();
				}
				
				// Push to the value help array
				valueHelp.push({
					key: key,
					text: text,
					selected: true
				});
				
			});
			
			// Loop at all the valueHelpItems and add that to the value help
			valueHelpItems.forEach(function(valueHelpItem) {
				var key = valueHelpItem.getKey();
				var text = valueHelpItem.getText();
				
				// Check if this value was already selected
				var existingValue = values.filter(function(value) {
					return value.getKey() === key;
				});
				
				// If the value already exists then go to the next record
				if(existingValue && existingValue.length > 0) {
					return;
				}
				
				// Add the value to the value help
				valueHelp.push({
					key: key,
					text: text,
					selected: false // This item is not selected by default
				});
				
			});
			
			// Set Data to the model
			multiValueHelpModel.setData({
				valueHelp: valueHelp	
			});
			
			return multiValueHelpModel;
			
		},
		/**
		 * Function sets the message that a new value can be created by just typing
		 * */
		_addValueCanBeCreatedMessage: function(valueHelpDialog) {
			this._newValueMessageStrip = new MessageStrip({
				text: "Start typing to add a value"
			});
			valueHelpDialog.addContent(this._newValueMessageStrip);
		},
		/**
		 * Function adds search field to multi input value help
		 * */
		_addSearchFieldToMultiInputValueHelp: function(valueHelpDialog) {
			var valueHelpOnly = this.getValueHelpOnly();
			var placeholder = "Search...";
			if(!valueHelpOnly) {
				placeholder = "Create/Search values...";
			}
			
			this._searchFieldMultInputValueHelp = new SearchField({
				placeholder: placeholder,
				liveChange: function(evt) {
					// Get the value
					var value = evt.getParameter("newValue");
					
					// Set the visibility of message strip to true
					this._setNewValueMessageStripVisibility(true);
					
					// Check if the value exists then hide the message strip
					if(value) {
						this._setNewValueMessageStripVisibility(false);
					}
					
					
					
					// Add strip for the user to add new value
					if(!this.getValueHelpOnly()) {
						this._addNewValueAddMessageStrip(value, valueHelpDialog);	
					}
					
				}.bind(this)
			});
			
			
			valueHelpDialog.addContent(this._searchFieldMultInputValueHelp);
			
			// Add New Value message Strip by default - Set the blank value
			this._addNewValueAddMessageStrip("", valueHelpDialog);	
			
		},
		/**
		 * Function adds a message strip for user to add new value to the multi input
		 * */
		_addNewValueAddMessageStrip: function(newValue, valueHelpDialog) {
			if(!this._addNewValueMessageStrip) {
				this._addNewValueMessageStrip = new MessageStrip();	
				valueHelpDialog.addContent(this._addNewValueMessageStrip);
			}
			
			// Set the visibility to true by default
			this._addNewValueMessageStrip.setVisible(true);
			
			if(!newValue) {
				this._addNewValueMessageStrip.setVisible(false);
				return;
			} 
			
			// Add link to the message strip
			this._addNewValueMessageStrip.setLink(new Link({
				text: "Add " + newValue + " to Characteristic values",
				href: null,
				press: function() {
					// Get the value help model
					var valueHelpModel = valueHelpDialog.getModel("multiValueHelpModel");
					
					// Get the existing value help data
					var valueHelp = valueHelpModel.getProperty("/valueHelp");
					
					// Check if the value exists already
					var existingValue = valueHelp.filter(function(value) {
						return value.key === newValue;
					});
					
					if(existingValue && existingValue.length > 0) {
						// Throw an error to the user that this value already exists
						MessageToast.show("Value already exists");
						return;
					}
					
					this._addNewSelectedValueToValueHelp(newValue, valueHelpDialog);
					
					// Set the value in search field as blank
					this._searchFieldMultInputValueHelp.setValue("");
					
					// Set this to the Add New Value Message Strip
					this._addNewValueAddMessageStrip("", valueHelpDialog);
					
					// Set the message strip to visible for information around creation of new item
					this._setNewValueMessageStripVisibility(true);
					
				}.bind(this)
			}));
			
		},
		/**
		 * Sets the visibility of new value message strip
		 * @param {boolean} visible [Sets the visibility of the message strip which tells user to add new value]
		 * */
		_setNewValueMessageStripVisibility: function(visibile) {
			// If message strip is not bound then return
			if(!this._newValueMessageStrip) {
				return;
			}
			// Set the visibility
			this._newValueMessageStrip.setVisible(visibile);
			
		},
		/**
		 * Add List for the Multi Input Value Help
		 * */
		_addMultiInputValueHelpList: function(valueHelpDialog) {
			if(!this._multiInputValueHelpList) {
				this._multiInputValueHelpList = new List({
					mode: ListMode.MultiSelect	
				});
				
				this._multiInputValueHelpList.bindItems({
					path: "multiValueHelpModel>/valueHelp",
					template: new StandardListItem({
						title: "{multiValueHelpModel>key}",
						description: "{multiValueHelpModel>text}",
						selected: "{multiValueHelpModel>selected}"
					})
				});
				
				valueHelpDialog.addContent(this._multiInputValueHelpList);
				
			}
		},
		/**
		 * Set the values to MultiInput
		 * */
		_setValuesToMultiInput: function(valueHelpDialog) {
			// Get the value help model
			var multiValueHelpModel = valueHelpDialog.getModel("multiValueHelpModel");
			
			// Get the value help data
			var valueHelp = multiValueHelpModel.getProperty("/valueHelp");
			
			this.removeAllValues();
			
			valueHelp.forEach(function(value) {
				
				// Check if value is not selected then go to  next value
				if(!value.selected) {
					return;
				}
				
				this.addValue(new Item({
					key: value.key,
					text: value.text
				}));
			}.bind(this));
			
		},
		/**
		 * Function destroys the variables which are not required after the dialog is closed
		 * */
		_destroyMultiHelpDialogContent: function() {
			this._newValueMessageStrip = null;
			this._searchFieldMultInputValueHelp = null;
			this._addNewValueMessageStrip = null;
			this._multiInputValueHelpList = null;
		},
		/**
		 * Add tokens to multi input
		 * */
		_addTokensToMultiInput: function() {
			// Get values
			var values = this.getValues();
			
			// Add tokens to multi input
			values.forEach(function(value) {
				var text = value.getKey();
				
				if(value.getText()) {
					text += " - " + value.getText();
				}
				
				this._outputControl.addToken(new Token({
					key: value.getKey(),
					text: text
				}));	
			}.bind(this));
			
		},
		/**
		 * Add new selected value in the value help
		 * */
		_addNewSelectedValueToValueHelp: function(value, valueHelpDialog) {
			var multiValueHelpModel = valueHelpDialog.getModel("multiValueHelpModel");
			
			// Get the value help data 
			var valueHelp = multiValueHelpModel.getProperty("/valueHelp");
			
			// Add the value to the data
			valueHelp.push({
				key: value,
				text: "",
				selected: true
			});
			
			// Sort the values to have selected at top
			valueHelp.sort(function(a, b) {
				return a.selected ? -1 : 1;
			});
			
			multiValueHelpModel.setProperty("/valueHelp", valueHelp);
			
		},
		_outputControl: null,
		_valueHelpControl: null,
		_currentItem: null,
		_newValueMessageStrip: null,
		_searchFieldMultInputValueHelp: null,
		_addNewValueMessageStrip: null,
		_multiInputValueHelpList: null
	});
});