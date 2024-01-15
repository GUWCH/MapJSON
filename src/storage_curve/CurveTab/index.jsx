import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'style.scss';

const stylePrefix = 'env-storage-curve-tab';

export default class CurveTab extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { tabs, tabKey=1, onItemSelected, ...otherProps } = this.props;
        return (
            <div className={stylePrefix} {...otherProps}>
                {
                    tabs.map((item, index) => <div className={`${stylePrefix}-item${item.key === tabKey ? ' selected' : ''}`}
                        onClick={() => {
                            onItemSelected && onItemSelected(item);
                        }} key={item.key}>{item.title}</div>)
                }
            </div>
        )
    }
}

CurveTab.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        key: PropTypes.number
    })).isRequired,
    onItemSelected: PropTypes.func,
    defaultSelected: PropTypes.number
}
