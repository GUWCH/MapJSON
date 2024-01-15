export type TAsset = {
    key: string // 别名
    name: string
    modelId?: string 
    model?: string
    facAlias?: string
    parentKey?: string
}

export type AssetGroup = 'FAC' | 'MODEL'