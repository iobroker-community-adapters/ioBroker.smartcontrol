Here you bring everything together by defining all "zones" (e.g. bathroom 1st floor, coffee corner, etc.) and assigning triggers and target devices to be switched, as well as defining further conditions for execution.

| Column | Mandatory | Description |
|----------|:------------:|-------|
| ✓        |  Yes   | Enables/disables this table row. If not activated, this table row is ignored by the adapter. In the Adapter Options, under 'FURTHER OPTIONS > Input Validation', you can set that even disabled rows are checked for validity. |
| Name of zone | Yes | Any zone name. |
| Trigger | Yes | Select one or more triggers to assign to this zone. |
| Target devices | Yes | Here you select one or more target devices to be switched, which will be switched as soon as a trigger is triggered and the conditions are met.<br><br>With the blue button to the left you can select much faster in case of many target devices. A dialog opens where you can find, filter and select the target devices more easily.<br><br>**Function 'Overwrite target values'**: In the dialog that appears when you click on the blue button to the left, you can double-click or hit 'F2' to overwrite the `Value for 'on'` of "1. TARGET DEVICES" by simply entering the new target value. This value will appear in curly brackets after the name, e.g. `Bath.mirror.light {30%}`.<br>![image](https://github.com/Mic-M/ioBroker.smartcontrol/blob/master/admin/doc-md/img/table-zones_select-target-devices-overwrite.gif?raw=true)<br><br>**Tip**: Use dots as separators in tab "1. TARGET DEVICES" for the target device names and organize them e.g. by rooms and devices, e.g. "Bathroom.Lights.Ceiling", "Bathroom.Lights.Wall left", etc. The target devices will then be displayed here as folders: "Bathroom > Lights > Ceiling", etc. |
| Off after x sec | No | Normally the adapter will only switch off automatically if a motion sensor has successfully triggered the zone.<br>If a number of seconds is entered here, a timer with this number of seconds will be started each time the zone is activated. After this number of seconds the timer will be switched off, unless the zone is triggered again in the meantime.<br>Leave empty or '0' to ignore this option. |
| Execution | Yes | Clicking this button opens a dialog where you can define further conditions when the target devices, as defined in the zone, will be switched as soon as a trigger is triggered. Details are described in this dialog. |
| Always | Yes | This option is identical to "Execute always" in the 'Execution' dialog (see above): If activated, the adapter will always execute if any previously defined conditions apply. If not activated, you must create at least one active line in the 'Execution' dialog. |