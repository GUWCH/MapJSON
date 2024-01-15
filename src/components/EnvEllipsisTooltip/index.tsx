import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './index.css';
import ReactTooltip from 'react-tooltip';
import { v4 as uuidv4 } from 'uuid';

interface propTypes {
    options?: any;
    style? : React.CSSProperties,
    children: React.ReactNode
}

const EllipsisToolTip: React.FC<propTypes> = (props) => {

    // TOOL TIP STATE
    const [showTooltip, setShowTooltip] = useState(false);

    const myRef = useRef(null);
    // GENERATING - RANDOM ID
    const tid = useMemo(() => (uuidv4()), []);

    // MOUSE ENTER HANDLER
    const mouseEnterHandler = useCallback((e) => {
        const {offsetWidth = 0, scrollWidth = 0} = myRef.current || {};

        if ((offsetWidth !== scrollWidth) && !showTooltip) {
            setShowTooltip(true);
        }
        else if ((offsetWidth === scrollWidth) && showTooltip) {
            setShowTooltip(false);
        }
    }, [showTooltip, setShowTooltip])


    return (
        <React.Fragment>
            <div ref = {myRef} data-tip data-for={tid} className="OuterDivStylesEllipsisToolTipChan" onMouseEnter={mouseEnterHandler} style={props.style}>
                {props.children}
            </div>
            {
                showTooltip && <ReactTooltip id={tid} effect="solid" {...props.options}>
                    {props.children}
                </ReactTooltip>
            }
        </React.Fragment>
    )
}

export default EllipsisToolTip;