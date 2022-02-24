# UI5-SAP-CharacteristicInput
A Characteristic can be configured in SAP and assigned to a Classification. This Classification can then be assigned to different Object Types. Characteristic can have different types, value helps and properties. Usually in order to achieve what all a Characteristic can do, a developer might end up writing different conditions in the views. This control helps prevent that and creates one control which handles all the different properties of characteristics

## Characteristics in SAP
Characteristics in SAP can have multiple properties. Below are all the available properties which a Characteristic can have:

- Characteristic Name - This comes from CABN table, field ATNAM
- Characteristic Description - This comes from CABNT table, field ATBEZ
- Characteristic Type - CHAR, NUM, DATE, CURR. This comes from CABN table, field ATFOR
- Characteristic Mutli Value - This tells whether a characteristic can have multiple values. This is based on table CABN, field ATEIN
- Characteristic Length - This means the length of the Characteristic Value. This is from table CABN, field ANZST
- Characteristic Decimals - This is valid only for NUM characteristc. This is from table CABN, field ANZDZ
- Characteristic Value Help - Characteristics can have value helps. This is stored in table CAWN & CAWNT
- Characteristic Additional Values - This tells whether a characteristic can have values in addition to the specified value help.

## UI5 Custom Control to manage all the different properties for Characteristic
This UI5 controls can manage all the different properties for Characteristics. Below is the list of properties/aggregations that this control can have. This control uses SAPUi5 standard controls like sap.m.Input, sap.m.MultiInput, sap.m.DatePicker to form the Characteristic control.

## Properties
| Name             | Type          | Default Value    | Description |
| ---------------- | ------------- | ---------------- | ----------- |
| name             | string        | empty string     | Name of the Characteristic from CABN-ATNAM |
| description      | string        | "Characteristic" | Description of the Characteristic from CABNT-ATBEZ |
| type             | string        | "CHAR"           | Type of Characteristic from CABN-ATFOR - Accepts CHAR,NUM,DATE |
| multiValue       | boolean       | false            | Whether Characteristic has multiple values. CABN-ATEIN will have X for single values |
| length           | int           | 30               | Length of the characteristic. Stored in table CABN-ANZST |
| decimals         | int           | 0                | Valid only for Characteristic with type NUM. Defines number of decimals in Characteristic. Stored in table CABN-ANZDZ |
| valueHelpOnly    | boolean       | false            | Checks if addiitional values are not possible for Characteristic. This is stored in table CABN-ATSON |
| showValueHelp    | boolean       | false            | Characteristics can have value helps which is stored in table CAWNT. This reads values from valueHelpItems Aggregation |
| stackMultiValues | boolean       | true             | This stacks multiple values as different Single value controls. If you set this to false, it will show sap.m.MultiInput |
| value            | string        | empty string     | This is the value for the Single Characteristic |
| hasErrors        | boolean       | false            | This property can be read to check if any of the Characteristic Value entered has any errors. Used with NUM type |
| width            | CSSSize       | empty            | This defines the CSS width of the control |

## Aggregations
| Name             | Cardinality   | Type             | Description |
| ---------------- | ------------- | ---------------- | ----------- |
| values           | 0..n          | sap.ui.core.Item | This aggregation is used to values of MultiInput Characteristic. For SingleInput the value is stored in "value" property|
| valueHelpItems   | 0..n          | sap.ui.core.Item | This aggregation is used for Value Help Items of the Characteristic |

## Characteristic Examples 
Below examples are part of this project. If you clone the repository, you can test the control and check if this fits your purpose.

![Characteristic Options](https://github.com/[username]/[reponame]/blob/[branch]/image.jpg?raw=true)
