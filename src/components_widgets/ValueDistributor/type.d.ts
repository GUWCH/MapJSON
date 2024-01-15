export type ModelWithDomainAndPoint = IModelInfo & { domainId: string, domainName: string, domainNameCn: string, points: TPoint[] }

export type Asset = {
    alias: string
    name: string
    model?: string
}