import { msgTag } from "@/common/lang"

const i18n = msgTag('paramsGenerator')

export type TemplateEditorI18n = {
    selectProto: string
    fieldEmpty: (name: string) => string,
    saveAsTpl: string
    generatorTitle: string
    editorTitle: string
    saveAs: string
    save: string
    add: string
    ruleGroup: string
    baseGroup: string
    saveAsDefault: string
}

export const templateEditorI18nDefault: TemplateEditorI18n = {
    selectProto: i18n('templateEditor.selectProto'),
    fieldEmpty: (name: string) => i18n('templateEditor.fieldEmpty', name),
    saveAsTpl: i18n('templateEditor.saveAsTpl'),
    generatorTitle: i18n('templateEditor.generatorTitle'),
    editorTitle: i18n('templateEditor.editorTitle'),
    saveAs: i18n('templateEditor.saveAs'),
    save: i18n('templateEditor.save'),
    add: i18n('templateEditor.add'),
    ruleGroup: i18n('templateEditor.ruleGroup'),
    baseGroup: i18n('templateEditor.baseGroup'),
    saveAsDefault: i18n('templateEditor.saveAsDefault')
}