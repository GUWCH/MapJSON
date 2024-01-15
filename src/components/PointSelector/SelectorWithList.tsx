import React, { useState, useEffect, useRef, useMemo } from 'react';
import _ from 'lodash';
import Intl from '@/common/lang';
export const isZh = Intl.isZh;

import styles from './index.module.scss';
import Selector, { Option, SelectorProps } from './Selector';
import List, { ListProps } from './List';
import { i18n } from './utils';
import { combinePointKey } from '@/common/utils/model';

export type PointSelectProps = Pick<SelectorProps, 'candidates' | 'defaultSelectedKeys' | 'limit' | 'groupMode'> &
{
    containerCls?: string
    name?: string
    onChange: (newP: TPointWithCfg[]) => void
    /* default to be true */
    multiple?: boolean,
    /* default to be true */
    showList?: boolean,
    selected?: Option[]
    listProps?: Pick<ListProps, 'type' | 'enableConfigs' | 'configContentParams' | 'customRender' | 'removeable'>
}

export const PointSelectWithList: React.FC<PointSelectProps> = ({
    containerCls,
    limit = -1,
    candidates,
    selected,
    defaultSelectedKeys,
    multiple = true,
    showList = true,
    listProps,
    name,
    groupMode,
    onChange
}: PointSelectProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [_selected, _setSelected] = useState<(Option & TPointWithCfg)[]>(candidates.filter(c => defaultSelectedKeys?.includes(combinePointKey(c))))
    const keys = useMemo(() => _selected.map(v => combinePointKey(v)), [_selected])

    useEffect(() => {
        if (selected) {
            _setSelected(selected)
        }
    }, [selected])

    const listContent = showList && _selected.length > 0 ?
        <List data={_selected} onChange={(newArr) => handleListEdit(newArr)} single={!multiple} {...listProps} /> : undefined

    const handleListEdit = (newArr: TPointWithCfg[]) => {
        _setSelected(newArr)
        onChange(newArr)
    }

    const handleSelectEdit = (newArr: Option[]) => {
        const result = newArr.map(n => {
            const old = _selected.find(o => combinePointKey(o) === combinePointKey(n))
            if (old) {
                return {
                    ...n,
                    conf: old.conf
                }
            }
            return n
        })
        _setSelected(result)
        onChange(result)
    }

    useEffect(() => {
        if (multiple && containerRef.current) {
            const antdSearch = containerRef.current.getElementsByClassName('ant-select-selector');
            if (antdSearch.length === 0) {
                return
            }
            const text = `${_selected.length}${limit > -1 ? `/${limit || '-'}` : ''} ${i18n('placeholder')}`
            antdSearch[0].setAttribute('data-before', text)
        }
    }, [limit, multiple, _selected.length])

    return <div className={`${styles.container} ${containerCls ?? ''}`} ref={containerRef}>
        <Selector
            groupMode={groupMode}
            name={name}
            multiple={multiple}
            candidates={candidates}
            selectedKeys={keys}
            limit={limit}
            onChange={(items) => handleSelectEdit(items)} />
        {listContent}
    </div>
}