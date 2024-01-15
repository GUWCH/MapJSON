/* eslint-disable */

import React from 'react';
import _ from 'lodash';

type IData = {
    name: string;
    value: string | number;
    unit: string;
}

class List extends React.Component<{data: IData[]}>{
    static defaultProps = {
        data: []
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(
                _.omit(this.props, _.functions(this.props)), 
                _.omit(nextProps, _.functions(nextProps))
            )) {
            return true;
        }
        return false;
    }

    render(){
        return (
            (this.props.data || []).map((d, ind) => {
                return (
                    <div key={ind}>
                        <span>{d.name}</span>
                        <span>{d.value}</span>
                        <span>{d.unit}</span>                     
                    </div>
                )
            })
        );
    }
}

export default List;

/* eslint-enable */