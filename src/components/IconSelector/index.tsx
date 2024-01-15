import React from 'react'
import styles from './index.module.scss'
import { Select, SelectProps } from 'antd'
import iconsMap, { IconKey } from 'Icon/iconsMap'
import { FontIcon } from 'Icon'
import ColorPick from 'ColorPick'

const Option = Select.Option

export type IconSelectorProps = {
    options?: IconKey[]
    iconKey?: IconKey
    color?: string
    onChange: (k?: IconKey, color?: string) => void
    withColorPicker?: boolean
    customCls?: {
        container?: string
        select?: string
    }
} & Omit<SelectProps<IconKey>, 'value' | 'onChange'>

export const SingleIconSelector: React.FC<IconSelectorProps> = ({
    options = (Object.keys(iconsMap) as IconKey[]), iconKey, color, onChange, withColorPicker, customCls, ...rest
}) => {
    return <div className={`${styles.container} ${customCls?.container ?? ''}`}>
        <Select {...rest} className={`${styles.select} ${customCls?.select ?? ''}`}
            value={iconKey} onChange={v => onChange(v as IconKey, color)}>
            {options.map(k => <Option key={k} value={k}>
                <FontIcon type={iconsMap[k]} />
            </Option>)}
        </Select>
        {withColorPicker && <ColorPick value={color} onColorChange={v => onChange(iconKey, v)} />}
    </div>
}
