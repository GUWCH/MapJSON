import { MODEL_ID } from "@/common/constants"
import { AggregationEnum, ProtoKeys, SamplingSizeEnum, aggregationNameMap, samplingSizeNameMap } from "ParamsGenerator/constant"
import { StaticPoint } from "ParamsGenerator/types"
import { isZh } from "PointSelect"
import { useMemo } from "react"

export const useSamplingSizeSelectOpts = (protoKey: ProtoKeys, modelId?: string) => {
    return useMemo(() => {
        let sizeArr: SamplingSizeEnum[] = []
        if (protoKey === ProtoKeys.points) {
            sizeArr = modelId === MODEL_ID.WTG ?
                [
                    SamplingSizeEnum.one_minute,
                    SamplingSizeEnum.ten_minutes_avg,
                    SamplingSizeEnum.ten_minutes_stc
                ] : [
                    SamplingSizeEnum.one_minute,
                    SamplingSizeEnum.five_minutes,
                    SamplingSizeEnum.ten_minutes,
                    SamplingSizeEnum.fifteen_minutes,
                    SamplingSizeEnum.thirty_menutes,
                    SamplingSizeEnum.one_hour,
                    SamplingSizeEnum.one_day,
                ]
        }

        return sizeArr.map(s => ({
            key: s,
            value: s,
            label: samplingSizeNameMap(isZh)[s]
        }))
    }, [modelId, protoKey])
}

export const useAggregationSelectOpts = (protoKey: ProtoKeys) => {
    return useMemo(() => {
        let enumArr: AggregationEnum[] = [
            AggregationEnum.device, AggregationEnum.model, AggregationEnum.fac
        ]
        if (protoKey === ProtoKeys.SOE) {
            enumArr = [AggregationEnum.device, AggregationEnum.model]
        }

        return enumArr.map(a => ({
            key: a,
            value: a,
            label: aggregationNameMap(isZh)[a]
        }))
    }, [protoKey])
}

export const useStaticPoints = (protoKey: ProtoKeys) => {
    return useMemo(() => {
        let sPoints: StaticPoint[] = []
        if (protoKey === ProtoKeys.SOE) {
            sPoints = [
                { alias: "ActivePower", nameCn: "有功功率", nameEn: 'ActivePower' },
                { alias: "WindSpeed_10T", nameCn: "风速*10", nameEn: 'WindSpeed_10T' },
                { alias: "GenSpeed", nameCn: "发电机转速", nameEn: 'GenSpeed' },
                { alias: "PitchAngle_10T", nameCn: "桨距*10", nameEn: 'PitchAngle_10T' },
                { alias: "Flag", nameCn: "SC标志", nameEn: 'Flag' },
                { alias: "SC", nameCn: "SC名字", nameEn: 'SC' },
                { alias: "SC_DESC", nameCn: "SC描述", nameEn: 'SC_DESC' },
            ]
        } else {
            sPoints = [
                { alias: 'PCurveStsAve', nameCn: "功率曲线状态平均值", nameEn: 'PCurveStsAve' },
                { alias: 'PCurveStsMax', nameCn: "功率曲线状态最大值", nameEn: 'PCurveStsMax' },
                { alias: 'PCurveStsMin', nameCn: "功率曲线状态最小值", nameEn: 'PCurveStsMin' },
                { alias: 'PCurveStsStd', nameCn: "功率曲线状态标准差", nameEn: 'PCurveStsStd' },
                { alias: 'WindSpeedAve', nameCn: "风速平均", nameEn: 'WindSpeedAve' },
                { alias: 'WindSpeedMax', nameCn: "风速最大", nameEn: 'WindSpeedMax' },
                { alias: 'WindSpeedMin', nameCn: "风速最小", nameEn: 'WindSpeedMin' },
                { alias: 'WindSpeedStd', nameCn: "风速标准差", nameEn: 'WindSpeedStd' },
                { alias: 'ReadWindSpeedAve', nameCn: "仪表盘风速平均", nameEn: 'ReadWindSpeedAve' },
                { alias: 'ReadWindSpeedMax', nameCn: "仪表盘风速最大", nameEn: 'ReadWindSpeedMax' },
                { alias: 'ReadWindSpeedMin', nameCn: "仪表盘风速最小", nameEn: 'ReadWindSpeedMin' },
                { alias: 'ReadWindSpeedStd', nameCn: "仪表盘风速标准差", nameEn: 'ReadWindSpeedStd' },
                { alias: 'BladePitchAve', nameCn: "桨叶角度平均", nameEn: 'BladePitchAve' },
                { alias: 'BladePitchMax', nameCn: "桨叶角度最大", nameEn: 'BladePitchMax' },
                { alias: 'BladePitchMin', nameCn: "桨叶角度最小", nameEn: 'BladePitchMin' },
                { alias: 'BladePitchStd', nameCn: "桨叶角度标准差", nameEn: 'BladePitchStd' },
                { alias: 'ActivePWAve', nameCn: "有功功率平均", nameEn: 'ActivePWAve' },
                { alias: 'ActivePWMax', nameCn: "有功功率最大", nameEn: 'ActivePWMax' },
                { alias: 'ActivePWMin', nameCn: "有功功率最小", nameEn: 'ActivePWMin' },
                { alias: 'ActivePWStd', nameCn: "有功功率标准差", nameEn: 'ActivePWStd' },
                { alias: 'GenSpdAve', nameCn: "发电机转速平均", nameEn: 'GenSpdAve' },
                { alias: 'GenSpdMax', nameCn: "发电机转速最大", nameEn: 'GenSpdMax' },
                { alias: 'GenSpdMin', nameCn: "发电机转速最小", nameEn: 'GenSpdMin' },
                { alias: 'GenSpdStd', nameCn: "发电机转速标准差", nameEn: 'GenSpdStd' },
                { alias: 'RotorSpdAve', nameCn: "风轮转速平均", nameEn: 'RotorSpdAve' },
                { alias: 'RotorSpdMax', nameCn: "风轮转速最大", nameEn: 'RotorSpdMax' },
                { alias: 'RotorSpdMin', nameCn: "风轮转速最小", nameEn: 'RotorSpdMin' },
                { alias: 'RotorSpdStd', nameCn: "风轮转速标准差", nameEn: 'RotorSpdStd' },
                { alias: 'WindDirectionAve', nameCn: "风向平均", nameEn: 'WindDirectionAve' },
                { alias: 'WindDirectionMax', nameCn: "风向最大", nameEn: 'WindDirectionMax' },
                { alias: 'WindDirectionMin', nameCn: "风向最小", nameEn: 'WindDirectionMin' },
                { alias: 'WindDirectionStd', nameCn: "风向标准差", nameEn: 'WindDirectionStd' },
                { alias: 'WindVaneDirectionAve', nameCn: "风向标方向平均", nameEn: 'WindVaneDirectionAve' },
                { alias: 'WindVaneDirectionMax', nameCn: "风向标方向最大", nameEn: 'WindVaneDirectionMax' },
                { alias: 'WindVaneDirectionMin', nameCn: "风向标方向最小", nameEn: 'WindVaneDirectionMin' },
                { alias: 'WindVaneDirectionStd', nameCn: "风向标方向标准差", nameEn: 'WindVaneDirectionStd' },
                { alias: 'TemOutAve', nameCn: "室外温度平均", nameEn: 'TemOutAve' },
                { alias: 'TemOutMax', nameCn: "室外温度最大", nameEn: 'TemOutMax' },
                { alias: 'TemOutMin', nameCn: "室外温度最小", nameEn: 'TemOutMin' },
                { alias: 'TemOutStd', nameCn: "室外温度标准差", nameEn: 'TemOutStd' },
                { alias: 'TorqueSetpointAve', nameCn: "扭矩设定值平均", nameEn: 'TorqueSetpointAve' },
                { alias: 'TorqueSetpointMax', nameCn: "扭矩设定值最大", nameEn: 'TorqueSetpointMax' },
                { alias: 'TorqueSetpointMin', nameCn: "扭矩设定值最小", nameEn: 'TorqueSetpointMin' },
                { alias: 'TorqueSetpointStd', nameCn: "扭矩设定值标准差", nameEn: 'TorqueSetpointStd' },
                { alias: 'TorqueAve', nameCn: "扭矩平均", nameEn: 'TorqueAve' },
                { alias: 'TorqueMax', nameCn: "扭矩最大", nameEn: 'TorqueMax' },
                { alias: 'TorqueMin', nameCn: "扭矩最小", nameEn: 'TorqueMin' },
                { alias: 'TorqueStd', nameCn: "扭矩标准差", nameEn: 'TorqueStd' },
                { alias: 'NacellePositionAve', nameCn: "机舱位置平均", nameEn: 'NacellePositionAve' },
                { alias: 'NacellePositionMax', nameCn: "机舱位置最大", nameEn: 'NacellePositionMax' },
                { alias: 'NacellePositionMin', nameCn: "机舱位置最小", nameEn: 'NacellePositionMin' },
                { alias: 'NacellePositionStd', nameCn: "机舱位置标准差", nameEn: 'NacellePositionStd' },
            ]
        }
        return {
            sPoints, opts: sPoints.map(o => ({
                key: o.alias,
                value: o.alias,
                label: isZh ? o.nameCn : o.nameEn
            }))
        }
    }, [protoKey])
}