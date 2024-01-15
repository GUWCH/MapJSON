import { msgTag } from "@/common/lang"
import _ from "lodash"
import { useMemo } from "react"
import { useWidgetMemory } from "../common/hooks"

export type ICommonFormCfg = {
    content?: string
    contentEn?: string
    bold?: boolean
    fontFamily?: string
    color?: string
    scaleWidth?: boolean
    letterSpacing?: number
}

export const CommonDefaultCfg: ICommonFormCfg = {
    content: 'Text',
    contentEn: 'Text',
    letterSpacing: 0
};

const msg = msgTag('pagetpl')
export const i18n = {
    edit: msg('TEXT.edit'),
    cancel: msg('TEXT.cancel'),
    save: msg('TEXT.save'),
    saveFail: msg('TEXT.saveFail'),
}