import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import BodyTooltip from '../components/BodyTooltip';
import EnvLoading from '../components/EnvLoading';
import { DiffUtil } from '../common/utils';
import scadaCfg from '../common/const-scada';
import { _dao } from '../common/dao';
import { msg } from './constant';
import styles from './style.mscss';

class Alarm extends React.Component{

    static defaultProps = {
    };

    constructor(props){
        super(props);

        // timer of getting data
        this.dataTimeout = null;

        // catch throttle
        this.throttle = null;
        this.throttleShow = false;

        this.state = {
            show: false,
            destroyOnHide: false,
            alias: '',
            levelList: '',
            typeList: '',
            maxCount: 5,
            target: null,
            data: [],
            loading: false
        };
    }

    show({destroyOnHide=false, alias='', levelList='', typeList='', maxCount=5, target=null}){
        clearTimeout(this.throttle);
        this.throttle = null;
        this.throttleShow = true;

        this.throttle = setTimeout(() => {
            if(!this.throttleShow) return;

            this.setState({
                show: true,
                destroyOnHide,
                alias,
                levelList,
                typeList,
                maxCount,
                target,
                loading: true
            }, () => {
                this.forceUpdate();
                this._fetch();
            });
        }, 800);
    }

    hide(){
        clearTimeout(this.throttle);
        this.throttle = null;        
        this.throttleShow = false;
        
        this.setState({
            show: false,
            alias: '',
            levelList: '',
            typeList: '',
            maxCount: 5,
            target: null,
            data: [],
            loading: false
        });
    }

    async _fetch(){
        const { show, alias, levelList, typeList, maxCount } = this.state;
        if(!alias)return;

        const req = {
            grid_id: '',
            seq_type: 1,
            max_cnt: maxCount,
            alias_list: alias,
            level_list: levelList,
            history_sc: maxCount,
            type_list: typeList,
            app_list: ''
        };
        const res = await _dao.getAlarm(req);

        let data = [];

        // prevent previous data to be rendered
        if(res && String(res.code) === '10000' && alias === this.state.alias){
            data = scadaCfg.handleAlarm([], res.data, maxCount);
        }

        this.setState({
            data,
            loading: false
        }, () => {
            if(!show){
                return;
            }
            this.forceUpdate();
            clearTimeout(this.dataTimeout);
            this.dataTimeout = setTimeout(this._fetch.bind(this), 5000);
        });
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.show !== this.state.show || 
            nextState.destroyOnHide !== this.state.destroyOnHide || 
            nextState.target !== this.state.target ||
            !DiffUtil.isArrayEqual(nextState.data, this.state.data)
        ){
            return true;
        }
        return false;
    }

    componentDidUpdate(){
    }

    componentWillUnmount(){
        this.unmount();
    }

    unmount(){
        clearTimeout(this.dataTimeout);
        this.dataTimeout = null;
        clearTimeout(this.throttle);
        this.throttle = null;
    }

    render(){
        const { data, show, destroyOnHide, loading, target } = this.state;
        let content;
        if(loading){
            content = <EnvLoading isLoading={true}/>;
        }else if(data.length === 0){
            content = msg('noData');
        }else{
            content = data.map((d, ind) => {
                const {level_color='', time='', content=''} = d;
                return <div key={ind} style={level_color?{color: level_color} : {}}>
                    <span>{time.replace(/([^\(\)]*)\(.*\)/, '$1')}</span>
                    <span>{content}</span>
                </div>
            });
        }

        return (<BodyTooltip
            show={show ? !!(show && target) : show}
            destroyOnHide={destroyOnHide}
            target={target}
            forceTarget={true}
            className={
                `${styles.alarm} ${loading || data.length === 0 ? styles.alarmLoad : ''}`
            }
            arrowClassName={styles.arrow}
        >
            <div className={styles.alarmHead}>
                <span>{msg('alarmTime')}</span>
                <span>{msg('alarmContent')}</span>
            </div>
            <div 
                className={
                    `${styles.alarmContent} ${!loading && data.length === 0 ? styles.alarmNoContent : ''}`
                }
            >
            {content}
            </div>
        </BodyTooltip>);
    }
}

export default Alarm;