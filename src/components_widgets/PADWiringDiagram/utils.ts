import { GRAPH_TYPE } from "DrawLib/groups/padGraph";

export const convertSubTypeToGraphType = (t: number): GRAPH_TYPE => {
    if (t >= 0 && t < 3) {
        return GRAPH_TYPE.TYPE1
    } else if (t >= 3 && t < 6) {
        return GRAPH_TYPE.TYPE2
    } else if ((t >= 6 && t < 10) || t === 14) {
        return GRAPH_TYPE.TYPE3
    } else if (t >= 10 && t < 15) {
        return GRAPH_TYPE.TYPE4
    } else {
        return GRAPH_TYPE.TYPE5
    }
}