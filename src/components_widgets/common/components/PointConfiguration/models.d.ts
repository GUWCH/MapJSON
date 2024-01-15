import { POINT_TABLE } from "@/common/constants/point"

export type Domain = {
    id: string
    name: string
    models: Model[]
}

export type Model = {
    id: string
    name: string
}

export type PointGroup = {
    type: PointType
    name: string
    points: TPoint[]
}