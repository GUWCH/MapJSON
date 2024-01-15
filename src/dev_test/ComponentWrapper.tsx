import { Input } from 'antd'
import React, { useState } from 'react'

export type ComponentWrapperProps = {
    params?: Record<string, string | undefined>
    /**
     * key: state key
     * value: name
     */
    paramsInfo?: Record<string, string>
    onParamsChange?: (p: Record<string, string | undefined>) => void
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
    params, paramsInfo, children, onParamsChange
}) => {
    return <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        {paramsInfo && <div style={{ width: 200, display: 'flex', flexDirection: 'column', padding: '0 1em', rowGap: '0.5em' }}>
            {Object.entries(paramsInfo).map(([k, name]) => {
                return <span key={k}>
                    {name}:<br />
                    <Input value={params?.[k]} onChange={e => onParamsChange && onParamsChange({ ...params, [k]: e.target.value })} />
                </span>
            })}
        </div>}
        <div style={{ flex: 1 }}>{children}</div>
    </div>
}

export default ComponentWrapper