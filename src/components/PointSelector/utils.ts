import { msgTag } from "@/common/lang"

type I18nKeys =
    'yc' | 'yx' | 'dl' | 'other' | 'standard' | 'nonStandard' | 'placeholder' |
    'showName' | 'colorSet' | 'isTop' | 'isAccumulate' | 'lineChart' | 'icon' | 'datasource' | 'enable' |
    'yes' | 'no'
type I18nFunc = (key: I18nKeys) => string
export const i18n: I18nFunc = (key) => {
    return msgTag('PointSelector')(key) ?? ''
}