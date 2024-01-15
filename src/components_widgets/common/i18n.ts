import { msgTag } from '@/common/lang';
import { getI18nMap } from '@/common/util-scada';

export const getWiringDiagramI18nMap = () => getI18nMap<'remote' | 'local' | 'yk' | 'yk_warn'>('WiringDiagram')
export const getPointConfigurationI18nMap = () => getI18nMap<
    "showName" |
    "defaultTpl" |
    "cancel" |
    "save" |
    "saveAs" |
    "saveAs_title" |
    "save_duplicate" |
    "tpl_name" |
    "save_success" |
    "save_failed" |
    "save_overflow" |
    "reset" |
    "reset_warning" |
    "reset_content" |
    "edit" |
    "edit_modal"|
    "delete"|
    "delete_warning"|
    "delete_content"|
    "yc"|
    "yx"|
    "dl"|
    "other"|
    "template_name_required" |
    "template_name_space" |
    "template_name_special" |
    "colorSet" |
    "isTop" |
    "yes"|
    "no"
>('PointConfiguration')
export const getBaseInfoI18nMap = () => getI18nMap<
    'pointsSetting' |
    'pointName' |
    'pointAlias' |
    'refreshTime' |
    'addToAnalysis'|
    'fullData'
>('BaseInfo')