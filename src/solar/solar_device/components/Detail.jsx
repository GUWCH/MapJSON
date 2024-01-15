/* eslint-disable */

import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { msgTag } from '../../../common/lang';
import { COMMON_FLAG } from '../../CONSTANT';
import { GlobalContext, Actions } from '../context';

import DCCBX from '../details/dccombiner/index.jsx';
import Transformer from '../details/transformer/index.jsx';
import Inverter from '../details/inverter/index.jsx';

import styles from '../index.mscss';

const msg = msgTag('solardevice');

function Detail(props){
    const { state, dispatch } = useContext(GlobalContext);
    let { mainFlag, detailName, detailAlias, detailSiblings } = state;

    let render = null;

    if(!detailAlias)return render;

    switch (mainFlag) {
        case COMMON_FLAG.PAD:
            render = <Transformer current={{ alias: detailAlias, name: detailName }} />;
            break;
        case COMMON_FLAG.INVERTER:
            render = <Inverter alias={detailAlias} name={detailName} />;
            break;
        case COMMON_FLAG.DC_COMBINER:
            render = <DCCBX current={{ alias: detailAlias, name: detailName }} />;
            break;
    }
    return useMemo(() => {
        return render;
    }, [detailAlias, detailName]);
}

/**
 * common navigator
 * @param {Object} props 
 * @returns 
 */
export function DetailNav(props){
    const { state, dispatch } = useContext(GlobalContext);
    let { detailSiblings } = state;
    let { detailAlias, detailName, statusDesc, statusColor } = props;

    const detailIndex = detailSiblings.findIndex(o => o.alias == detailAlias);
    const lastAlias = detailIndex > -1 ? detailSiblings[detailIndex - 1]?.alias : undefined;
    const lastName = detailIndex > -1 ? detailSiblings[detailIndex - 1]?.name : undefined;
    const nextAlias = detailIndex > -1 ? detailSiblings[detailIndex + 1]?.alias : undefined;
    const nextName = detailIndex > -1 ? detailSiblings[detailIndex + 1]?.name : undefined;

    return useMemo(() => {
        return (
            <div className={styles.detailNav}>
                <span 
                    className={`${styles.detailNavPrev} ${!lastAlias ? styles.detailNavDisable : ''}`}
                    onClick={e => {
                        if(lastAlias){
                            dispatch({
                                type: Actions.SET_DETAIL,
                                detailAlias: lastAlias,
                                detailName: lastName
                            });
                        }
                    }}
                >&lt;</span>
                <span>{detailName}</span>
                <span 
                    className={`${styles.detailNavNext} ${!nextAlias ? styles.detailNavDisable : ''}`}
                    onClick={e => {
                        if(nextAlias){
                            dispatch({
                                type: Actions.SET_DETAIL,
                                detailAlias: nextAlias,
                                detailName: nextName
                            });
                        }
                    }}
                >&gt;</span>
                {
                    statusDesc ? <span className={styles.detailNavStatus}>
                        <i style={{backgroundColor: statusColor}}></i>
                        {statusDesc}
                    </span> : null
                }
            </div>
        )
    }, [detailAlias, detailName, statusDesc, statusColor, lastAlias, nextAlias]);
}

/**
 * 
 * @param {object} props 
 * @returns 
 * @example <DetailTemplate header={} headerStyle={} contentStyle={}>{children}</DetailTemplate>
 */
 export function DetailTemplate(props){
    let { header, headerStyle, contentStyle, contentClassName='' } = props;

    return [
        <div key={0} className={styles.detailHead} style={headerStyle}>
            { 
                typeof header === 'function' ? header() : header
            }
        </div>, 
        <div key={1} className={`${styles.detailContent} ${contentClassName}`} style={contentStyle}>
            { props.children }
        </div>
    ];
}

DetailTemplate.prototype.propTypes = {
    header: PropTypes.node,
    headerStyle: PropTypes.object,
    contentStyle: PropTypes.object,
    contentClassName: PropTypes.string
};

DetailTemplate.prototype.defaultProps = {
    header: null,
    headerStyle: {},
    contentStyle: {},
    contentClassName: ''
};

export default function DetailWrap(props){
    const { dispatch } = useContext(GlobalContext);

    const restore = () => {
        dispatch({ type: Actions.RESTORE });
    };

    return (
        <div className={styles.detail}>
            <div className={styles.breadCrumbs}>
                <span onClick={restore}>{msg('list')}</span>
                <span>&gt;</span>
                <span>{msg('details')}</span>
            </div>
            <div>
                <Detail />
            </div>
        </div>
    );
}

/* eslint-enable */