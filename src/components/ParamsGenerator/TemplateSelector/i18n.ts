import { msgTag } from "@/common/lang"

const i18n = msgTag('paramsGenerator')
export type TemplateSelectorI18n = {
    noTpl: string
    title: string
    defaultAdd: string
    deleteTitle: string
    deleteContent: (v: string) => string
    edit: string
    delete: string
    replaceTitle: string
    replaceContent: string
    updateDefaultFail: string
}

export const templateSelectorI18nDefault: TemplateSelectorI18n = {
    noTpl: i18n('templateSelector.noTpl'),
    title: i18n('templateSelector.title'),
    defaultAdd: i18n('templateSelector.defaultAdd'),
    deleteTitle: i18n('templateSelector.deleteTitle'),
    deleteContent: (v: string) => i18n('templateSelector.deleteContent', v),
    edit: i18n('templateSelector.edit'),
    delete: i18n('templateSelector.delete'),
    replaceTitle: i18n('templateSelector.replaceTitle'),
    replaceContent: i18n('templateSelector.replaceContent'),
    updateDefaultFail: i18n('templateSelector.updateDefaultFail'),
}