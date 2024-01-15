import React from 'react'
import styles from './index.module.scss'
import empty from '../../common/image/empty.svg'
import { msgTag } from '@/common/lang'

const i18n = msgTag('common')
export type EmptyProps = {
    text?: string
}

const Empty: React.FC<EmptyProps> = ({text}) => {
    return <div className={styles.container}>
        <img src={empty} width={68} height={68} />
        <div>
            {text || i18n('noData')}
        </div>
    </div>
}

export default Empty