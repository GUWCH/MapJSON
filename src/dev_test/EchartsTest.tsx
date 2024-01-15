import React from 'react'
import EchartsWrap from 'EchartsWrap'

export type EchartsTestProps = {}

const EchartsTest: React.FC<EchartsTestProps> = (props) => {
    return <EchartsWrap

        getOption={() => {
            const option = {}
            return option
        }} />
}

export default EchartsTest