import { FormInputType } from './formTypes/FormInput';
import { FormSwitchType } from './formTypes/FormSwitch';
import { FormActionButtonType } from './formTypes/FormActionButton';
import { FormAnimateControlType } from './formTypes/FormAnimateControl';
import { TabDataType } from './formComponents/tab';

export interface FormMap {
	tab: TabDataType;
	input: FormInputType;
	actionButton: FormActionButtonType;
	animateControl: FormAnimateControlType;
	switch: FormSwitchType;
}

export interface FormBaseType {
	
}
