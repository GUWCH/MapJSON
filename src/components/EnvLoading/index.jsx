require('./env-loading.scss');

import React from 'react';

let count = 0,
    rotateDeg = 0,
    timer = 0;

class EnvLoading extends React.Component{
    constructor(props) {
        super(props);
        this.state = {};

        this.isUscada = !!(
            window.top.$ && 
            typeof window.top.$.fn === 'object' && 
            typeof window.top.$.fn.mask === 'function' &&
            typeof window.top.$.fn.unmask === 'function'
        );
    }

    static defaultProps = {
        container: null,
        isLoading: false
    };

    loading(isShow){
        if(this.isUscada && this.props.container instanceof HTMLElement){
            if(isShow){
                window.top.$(this.props.container).mask();
            }else{
                window.top.$(this.props.container).unmask();
            }
        }
    }

    showLoading() {
        if (this.props.isLoading) {
            // this.setState({active: true});

            if (!this._supportTransition()) {
                let peer = 18;
                timer = setInterval(function () {
                    if (rotateDeg + peer >= 360) {
                        rotateDeg = rotateDeg + peer - 360;
                    } else {
                        rotateDeg = rotateDeg + peer;
                    }

                    if (this.refs.rotateDiv) {
                        this.refs.rotateDiv.style['msTransform'] = 'rotate(' + rotateDeg + 'deg)';
                    }
                }.bind(this), 100);
            }
        }
        count++;
    }

    hideLoading(force) {
        if (count > 0) {
            count--;
        }
        if (count === 0 || !!force) {
            count = 0;
            // this.setState({active:false});
            if (!this._supportTransition()) {
                clearInterval(timer);
            }
        }
    }

    _supportTransition() {
        let prefixes = ["", "O", "ms", "Webkit", "Moz"],
            tempStyle = document.createElement('div').style;
        for (let i = 0, len = prefixes.length; i < len; i++) {
            if (prefixes[i] + "Transition" in tempStyle) {
                return true;
            }
        }
        return false;
    }

    componentDidMount() {
        if(this.isUscada && this.props.container instanceof HTMLElement){
            this.loading(this.props.isLoading);
        }else{
            if (this.props.isLoading) {
                this.showLoading();
            }
        }
    }

    componentDidUpdate() {
        if(this.isUscada && this.props.container instanceof HTMLElement){
            this.loading(this.props.isLoading);
        }else{
            if (this.props.isLoading) {
                this.showLoading();
            }
        }
    }

    render() {
        if(this.isUscada && this.props.container instanceof HTMLElement){
            return null;
        }else{
            if (this.props.isLoading) {
                return (
                    <div className = "env-loading-wrapper" >
                        <div className = "env-loading-img" >
                            <div className = "env-loading-rotate" ref = "rotateDiv" >
                            </div>
                        </div>
                        <div className = "env-loading-close-btn" >
                        </div>
                    </div>
                );
            } else {
                this.hideLoading();
                return (null);
            }
        }        
    }
};

export default EnvLoading;
