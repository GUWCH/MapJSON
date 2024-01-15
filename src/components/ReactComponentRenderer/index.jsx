import * as React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import _ from 'lodash';

export default class ReactComponentRenderer {
    constructor(klass, container) {
        this.klass = klass;
        this.container = container;
        this.props = {};
        this.component = null;
    }

    replaceProps(props, callback) {
        this.props = {};
        this.setProps(props, callback);
    }

    setProps(partialProps, callback) {
        if (this.klass == null) {
            console.warn(
                'setProps(...): Can only update a mounted or ' +
                'mounting component. This usually means you called setProps() on ' +
                'an unmounted component. This is a no-op.'
            );
            return;
        }
        Object.assign(this.props, partialProps);
        var element = React.createElement(this.klass, _.cloneDeep(this.props));
        this.component = ReactDOM.render(element, this.container, callback);
    }

    unmount() {
        ReactDOM.unmountComponentAtNode(this.container);
        this.klass = null;
        this.props = {};
        this.component = null;
    }
}