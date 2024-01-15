import { msgTag } from '@/common/lang';
import { IconType } from 'Icon';

export const msg = msgTag('datalistnew');

export const ICONS = Object.keys(IconType).filter(key => {
    return [
        'CONFIG', 
        'CARD', 
        'CARD2', 
        'TABLE', 
        'DOUBLE_DOWN', 
        'DOUBLE_UP',
        'PLUS',
        'MINUS',
        'MARK',
        'UNMARK'
    ].indexOf(key) === -1
})
export const CHART_TYPES = ['line', 'bar', 'area', 'bullet'];