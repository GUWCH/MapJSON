import { CONTROL_STATE, SWITCH_STATE } from "./Shapes";

export const mapToSwitchState = (v?: number): SWITCH_STATE => {
    switch (v) {
        case 0: return SWITCH_STATE.OPEN
        case 1: return SWITCH_STATE.CLOSE
        default: return SWITCH_STATE.MISSING
    }
}

export const mapToControlState = (v?: number): CONTROL_STATE => {
    switch (v) {
        case 0: return CONTROL_STATE.LOCAL
        case 1: return CONTROL_STATE.REMOTE
        default: return CONTROL_STATE.BROKEN
    }
}