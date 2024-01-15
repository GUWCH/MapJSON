import React from "react";

interface ICardWrapper {
    style?: React.CSSProperties
    children?: React.ReactNode
}

function CardWrapper(props: ICardWrapper){
    return <div
        style={{...{
            display: 'inline-block',
            overflow: 'hidden'
        }, ...(props.style || {})}}
    >{props.children}
    </div>;
}

export default CardWrapper;