import React from 'react';
import './style.scss';
import PropTypes from 'prop-types';
import { NumberUtil } from '@/common/utils';
import { formatProd } from '@/common/util-scada';
import { SiteOverviewQuatas } from './constant';

const topoOverviewPrefix = "env-solar-topo-header";

export function TopoOverview({ name, dataMap = {} }) {
    return (
        <div className={topoOverviewPrefix}>
            <div className={`${topoOverviewPrefix}-title`}>
                {name}
            </div>
            <div className={`${topoOverviewPrefix}-main`}>
                {
                    SiteOverviewQuatas.map((o) =>
                        <div 
                            key={o.key}
                            className={`${o.icon || ''}`}
                        >
                            <span>{`${o.title}:${formatProd(NumberUtil.removeCommas(dataMap[o.key]) * o.multiple, o.decimal, o.thsound)}${o.unit}`}</span>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

TopoOverview.propTypes = {
    name: PropTypes.string.isRequired,
    dataMap: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
}
