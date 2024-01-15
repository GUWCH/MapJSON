import _ from 'lodash'
import { useMemo } from 'react'

export type StateConsumer = (newState: any, oldState?: any) => void
class StateCenter {
    private stateMap: { [key: string]: any } = {}
    private stateConsumers: { [key: string]: StateConsumer[] } = {}
    private waittingMap: { [key: string]: any } = {}
    private isReady: boolean = false

    updateState = (obj: { [key: string]: any }) => {
        Object.entries(obj).forEach(([k, v]) => {
            if (!this.isReady) {
                this.waittingMap[k] = v
                return
            }

            const oldV = this.stateMap[k]
            const consumers = this.stateConsumers[k] || []
            consumers.forEach(c => c(v, oldV))
            this.stateMap[k] = v
        })
    }

    changeReadyStatus = (r: boolean) => {
        this.isReady = r
        if (r) {
            this.updateState(Object.assign(this.stateMap, this.waittingMap))
        }
    }

    registerConsumer = (key: string, cb: StateConsumer) => {
        const consumers = this.stateConsumers[key]
        if (consumers) {
            consumers.push(cb)
        } else {
            this.stateConsumers[key] = [cb]
        }
    }

    dispatchToAll = () => {
        Object.entries(this.stateMap).forEach(([k, v]) => {
            const consumers = this.stateConsumers[k] || []
            consumers.forEach(c => c(v))
            this.stateMap[k] = v
        })
    }
}

export const useStateCenter = () => useMemo(() => new StateCenter(), [])
export default StateCenter