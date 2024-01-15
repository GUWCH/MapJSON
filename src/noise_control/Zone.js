
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import '../../node_modules/moment/locale/zh-cn';
import {DatePicker, TimePicker} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import {NewSelect} from 'Select';
import Intl, {msgTag} from '../common/lang';
import { DiffUtil } from '../common/utils';
import {notify, zoneRow, zoneCol, Mode, calenderFormat, timeFormat, stdDateTimeFormat, nameMax} from './Constant';
import Zonetree from './Zonetree.js';
import ComponentSwitch from './components/ComponentSwitch';


const isIE = window.ActiveXObject || "ActiveXObject" in window;
const isZh = (Intl.locale || '').toLowerCase().indexOf('cn') > -1;
if(isZh){
    moment.locale('zh-cn');
}
const defPrefix = 'noise-zone';
const msg = msgTag('noise');

const DateType = {
	YEAR: 'year',
	MONTH: 'month',
	DAY: 'day',
};
const DateTypeList = [{
	name: msg('isAnnually'),
	value: DateType.YEAR
},{
	name: msg('isMonthly'),
	value: DateType.MONTH
},{
	name: msg('isDaily'),
	value: DateType.DAY
}];

//子区组件
class Zone extends React.Component {
	static propTypes = {
        zoneData: PropTypes.object,
		copyFn: PropTypes.func,
		delFn: PropTypes.func,
		getInfo: PropTypes.func,
		change: PropTypes.func
    };

    static defaultProps = {
        zoneData: {},
		copyFn: ()=>{},
		delFn: ()=>{},
		getInfo: ()=>{},
		change: ()=>{}
	};
	
    constructor(props) {
        super(props);

        this.matrixData = [];

        this.state = {
            zoneData: {},
            wtgsModel: "",
            timeRange: ["00:00:00","00:00:00"]
        };
    }

    componentWillMount() {
        let {zoneData, getInfo} = this.props;
        let wtgsModel = this.state.wtgsModel;
        let info = getInfo(zoneData.wtg_alias_list);
        this.transfer(JSON.parse(JSON.stringify(zoneData)));

        const {time_in_raw, time_out_raw} = zoneData
        if(info){
            wtgsModel = Object.keys(info.models)[0] || "";
        }

        this.setState({
            zoneData: JSON.parse(JSON.stringify(zoneData)),
            wtgsModel: wtgsModel,
            timeRange: time_in_raw && time_out_raw ? [time_in_raw.substr(11,8), time_out_raw.substr(11,8)] : this.state.timeRange
        });
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!DiffUtil.isEqual(this.state, nextState)){
            return true;
        }
        if(!DiffUtil.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))){
            return true;
        }
        
        return false;
    }

    transfer = (zoneData) => {
        let matrix = zoneRow * zoneCol;
        if(zoneData.modes.length === matrix)
        {
            for(let i = 0; i < zoneRow; i++){
                let temp = [];
                for(let j = 0; j < zoneCol; j++){
                    temp.push(JSON.parse(JSON.stringify(zoneData.modes[i * zoneRow + j])));
                }
                this.matrixData.push(temp);
            }
            return zoneData.modes;
        }else{
            let angleNum = zoneData.modes.filter((f, ind) => f.windspeed_in === zoneData.modes[0].windspeed_in).length;
            let windspeedNum = zoneData.modes.filter((f, ind) => f.sector_in === zoneData.modes[0].sector_in).length;
            for(let i = 0; i < zoneRow; i++){
                let temp = [];
                for(let j = 0; j < zoneCol; j++){
                    let tempEle = JSON.parse(JSON.stringify(Mode));
                    if(i < windspeedNum){
                        Object.assign(
                            tempEle, 
                            {
                                windspeed_in: zoneData.modes[i*angleNum].windspeed_in, 
                                windspeed_out: zoneData.modes[i*angleNum].windspeed_out
                            }
                        );
                    }
                    if(j < angleNum){
                        Object.assign(
                            tempEle, 
                            {
                                sector_in: zoneData.modes[j].sector_in, 
                                sector_out: zoneData.modes[j].sector_out
                            }
                        );
                    }
                    if(i < windspeedNum && j < angleNum){
                        Object.assign(
                            tempEle, 
                            {
                                noise_mode: zoneData.modes[i*angleNum+j].noise_mode
                            }
                        );
                    }
                    temp.push(tempEle);
                                             
                }
                this.matrixData.push(temp);
            }  
        }
    }

    angleLimit = (value) => {
        if (value !== 0 && !value || isNaN(value)){
            return "";
        }
        if (value < 0){
            notify(msg('angleMin'));
            return "0";
        }
        if (value > 360){
            notify(msg('angleMax'));
            return "360";
        }else{
            return String(parseInt(value));
        }
    }

    angleBlur = (value) => {
        if (value !== 0 && !value || isNaN(value)){
            return "";
        }else{
            // if(value % 10 !== 0) notify(msg('stepSize'));
            // return String(parseInt(value/10)*10);

            // 取消步长限制
            return String(parseInt(value));   
        }
        
    }

    windspeedLimit = (value) => {
        if (value !== 0 && !value || isNaN(value)){
            return "";
        }
        if (value < 0){
            notify(msg('windspeedMin'));
            return "0.0";
        }
        if (value > 50){
            notify(msg('windspeedMax'));
            return "50.0";
        }else{
            return String(value.match(/^\d*(\.?\d{0,1})/g)[0]);
        }
    }

    windspeedBlur = (value) => {
        if (value !== 0 && !value || isNaN(value)){
            return "";
        }
        if (value < 0){
            notify(msg('windspeedMin'));
            return "0.0";
        }
        if (value > 50){
            notify(msg('windspeedMax'));
            return "50.0";
        }else{
            return Number(value).toFixed(1);
        }
    }


    onNameChange(name){
        this.setState({
            zoneData: Object.assign({}, this.state.zoneData, {
                block_name: name
            })
        }, () => {
            this.sendAfterChange();
        });
    }

    onMatrixChange(rowIndex, colIndex, value, isIn){
        let isRow = typeof rowIndex === 'number';
        let isCol = typeof colIndex === 'number';
        if(isRow && isCol){
            this.matrixData[rowIndex][colIndex].noise_mode = value;
        }else if(isRow){
            for(let idx = 0; idx < zoneCol; idx++){
                this.matrixData[rowIndex][idx][isIn ? 'windspeed_in' : 'windspeed_out'] = value;
            }            
        }else if(isCol){
            for(let idx = 0; idx < zoneRow; idx++){
                this.matrixData[idx][colIndex][isIn ? 'sector_in' : 'sector_out'] = value;
            }
        }

        this.sendAfterChange();
    }

    /**
     * 
     * @param {*} dateStr 
     * 返回[标准日期时间格式, 后台所需格式]
     */
    dateChange(dateStr, dateType){
        if(!dateStr) return ['', ''];

        const stdDateTime = moment(dateStr).format(stdDateTimeFormat);
        const dateTypeList = dateType ? dateType.split(","): [];
        const stdDateTimeFmt = stdDateTime.replace(
            /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, 
            ($, Y, M, D, H, m, s) => {
                if(dateTypeList.indexOf(DateType.YEAR) > -1){
                    Y = '0000';
                }
                if(dateTypeList.indexOf(DateType.MONTH) > -1){
                    M = '00';
                }
                if(dateTypeList.indexOf(DateType.DAY) > -1){
                    D = '00';
                }

                return `${Y}-${M}-${D} ${H}:${m}:${s}`;
            }
        );
        return [stdDateTime, stdDateTimeFmt];
    }

    onDateTypeChange(dateType, dateString=[]){
        if(dateString.length === 0){
            const {time_in_raw, time_out_raw} = this.state.zoneData;
            dateString = [time_in_raw, time_out_raw];
        }
        const [st, et] = dateString;
        const [time_in_raw, time_in] = this.dateChange(st, dateType);
        const [time_out_raw, time_out] = this.dateChange(et, dateType);

        let timeInRaw = time_in_raw
        let timeOutRaw = time_out_raw
        let timeIn = time_in
        let timeOut = time_out

        if(time_in_raw && time_out_raw){
            const {timeRange} = this.state
            timeInRaw = time_in_raw.substr(0,10) + " " + timeRange[0]
            timeOutRaw = time_out_raw.substr(0,10) + " " + timeRange[1]
            timeIn = time_in.substr(0,10) + " " + timeRange[0]
            timeOut = time_out.substr(0,10) + " " + timeRange[1]
        }
        this.setState({
            zoneData: Object.assign({}, this.state.zoneData,{
                time_in: timeIn,
                time_in_raw: timeInRaw,
                time_out: timeOut,
                time_out_raw: timeOutRaw
            }, dateType ? {date_type: dateType} : {date_type: ""})
        }, () => {
            this.sendAfterChange();
        });
    }

    onTimeChange(timeString){
        const {time_in_raw='', time_out_raw='', time_in='', time_out=''} = this.state.zoneData;

        if(time_in_raw && time_out_raw){
            let timeInRaw = time_in_raw.substr(0,10) + " " +timeString[0]
            let timeOutRaw = time_out_raw.substr(0,10) + " " +timeString[1]
            let timeIn = time_in.substr(0,10) + " " +timeString[0]
            let timeOut = time_out.substr(0,10) + " " +timeString[1]
            
            this.setState({
                zoneData: Object.assign({}, this.state.zoneData,{
                    time_in: timeIn,
                    time_in_raw: timeInRaw,
                    time_out: timeOut,
                    time_out_raw: timeOutRaw
                }), timeRange: timeString
            }, () => {
                this.sendAfterChange();
            })
        }else{
            this.setState({
                timeRange: timeString
            })
        }
    }

	addWtg(){
		let {getInfo} = this.props;
        let info = getInfo();
        let wtgsModel = this.state.wtgsModel;

		if(!info){
			notify(msg('noSelectWtg'));
			return;
		}

		let {wtg_alias_list=[]} = this.state.zoneData;
		let {wtgs, modelMap, modelWtgs, models} = info;

		if(DiffUtil.isArrayEqualErase(wtgs.map(f=>f.alias), wtg_alias_list)){
			return;
		}

		info = getInfo(wtgs.map(f=>f.alias)
		.filter(f=>wtg_alias_list.indexOf(f)===-1)
		.concat(wtg_alias_list));
		let {
			wtgs: finalWtgs, 
			modelMap: finalModelMap, 
			modelWtgs: finalModelWtgs, 
			models: finalModels
		} = info;

		if(Object.keys(finalModels).length !== 1){
			notify(msg('oneModel'));
			return;
        }
        
        if(Object.keys(finalModels)[0] !== this.state.wtgsModel){
            this.matrixData.map((f) => {
                return f.map(ele => {
                    ele.noise_mode = "0";
                })
            })
            wtgsModel = Object.keys(finalModels)[0];                
        }
		
		this.setState({
			zoneData: Object.assign({}, this.state.zoneData, {
				wtg_alias_list: finalWtgs.map(f=>f.alias)
            }),
            wtgsModel: wtgsModel
		}, () => {
            this.sendAfterChange();
        });
	}

	delWtg(wtgList=[]){
		let {wtg_alias_list=[]} = this.state.zoneData;

		this.setState({
			zoneData: Object.assign({}, this.state.zoneData, {
				wtg_alias_list: wtg_alias_list.filter(alias=>wtgList.indexOf(alias)===-1)
			})
		}, () => {
            this.sendAfterChange();
        });
    }

    sendAfterChange(){
        let temp = this.matrixData
        //.filter(row => row[0] && row[0].windspeed_in && row[0].windspeed_out)
        //.map(row => row.filter(col => col && col.sector_in && col.sector_out));
        let matrixData = [];

        temp.map(f => matrixData = matrixData.concat(f));

        this.props.change(Object.assign({}, this.state.zoneData, {
            modes: matrixData
        }));

        if(window.___debug___ && console !== undefined){
            console.log(this);
        }
    }
    
    getModelList(){
		let {getInfo} = this.props;
		let {zoneData={}} = this.state;
        let {
            wtgs,
            modelMap,
            models={},
            modelWtgs
        } = getInfo(zoneData.wtg_alias_list) || {};
        let modelArr = Object.keys(models);

        if(modelArr.length > 0){
            return modelMap[modelArr[0]] || [];
        }
        return [];
	}
	
	renderUnlimit(){
		let {date_type=''} = this.state.zoneData;
		let types = !!date_type ? date_type.split(',') : [];

		return DateTypeList.map((f, ind) => {
			return (
				<label key={ind}>
                    <input
                        name={f.value}
                        type={`checkbox`}
                        checked={types.indexOf(f.value) > -1}
                        onChange={(e) => {
							let name = e.target.name;
							let checked = e.target.checked;
							let {date_type=''} = this.state.zoneData;
                            let types = !!date_type ? date_type.split(',') : [];

							types = types.filter(f => f !== name).concat(checked ? [name] : []);
							
							this.onDateTypeChange(types.join(','));
						}} 
                    />
                    <span>{f.name}</span>
                </label>
			);
		});
	}

    renderMatrix(){
		let modelList = this.getModelList();
        return (<table border='0' cellPadding='0' cellSpacing='0'>
            <colgroup>
            {
                Array.apply(null, Array(zoneCol+2)).map((f, ind) => <col key={ind} />)
            }
            </colgroup>
            <tbody>
            <tr>
                <th colSpan="2" rowSpan="2"></th>
                <th colSpan={zoneCol}>{msg('angle')}</th>
            </tr>
            <tr>{
                Array.apply(null, Array(zoneCol)).map((ele, index)=>(
					<th key = {index} className={`${defPrefix}-matrix-edit ${isIE?'iehack':''}`}>
						<div>
							<ComponentSwitch 
								value={this.matrixData[0][index].sector_in} 
                                onChange={(value) => {
                                    this.onMatrixChange(null, index, value, true);
                                }}
                                blur= {this.angleBlur}
                                limit={this.angleLimit}
                                noValueTitle={msg('noValueTitle')}
							/>
							-
							<ComponentSwitch 
								value={this.matrixData[0][index].sector_out}
                                onChange={(value) => {
                                    this.onMatrixChange(null, index, value);
                                }}
                                blur= {this.angleBlur}
                                limit={this.angleLimit}
                                noValueTitle={msg('noValueTitle')}
							/>
						</div>
					</th>
				))
            }</tr>

            <tr>
                <td rowSpan = {zoneRow+1}>
                    <span className={`vertical-rl`}>{msg('windspeed')}</span>
                </td>
            </tr>

            {Array.apply(null, Array(zoneRow)).map((ele, index)=>{
                return(
                <tr key={index}>
                    <td className={`${defPrefix}-matrix-edit ${isIE?'iehack':''}`}>
                        {
                            <div className={`no-wrap`}>
                                <ComponentSwitch
									value={this.matrixData[index][0].windspeed_in} 
									onChange={(value) => {
                                        this.onMatrixChange(index, null, value, true);
                                    }}
                                    limit={this.windspeedLimit}
                                    blur= {this.windspeedBlur}
                                    noValueTitle={msg('noValueTitle')}
								/>
									-
								<ComponentSwitch
									value={this.matrixData[index][0].windspeed_out}
									onChange={(value) => {
                                        this.onMatrixChange(index, null, value);
                                    }}
                                    limit={this.windspeedLimit}
                                    blur= {this.windspeedBlur}
                                    noValueTitle={msg('noValueTitle')}
								/>
                            </div>
                        }
                    </td>
                    {
                        this.matrixData[index].map((item, modeIdx) => (
							<td key={modeIdx} className={`${isIE?'iehack':''}`}>{
								modelList.length>0 ?<NewSelect 
									autoWidth={true}
									noBorder={true}
									data={this.getModelList()}
									keysMap={{
										value: 'noise_mode',
										name: 'noise_name'
									}}
									value={item.noise_mode}
									onChange={(value) => {
                                        this.onMatrixChange(index, modeIdx, value);
									}}
								/> : null
							}</td>
						))
                    }
                </tr>
            )})}
            </tbody>
        </table>);
    }

    renderTime(){
        const [startTime, endTime] = this.state.timeRange;
        const st = startTime ? moment(startTime, timeFormat) : null;
        const et = endTime? moment(endTime, timeFormat) : null;
        const { RangePicker } = TimePicker;

        return(<RangePicker 
            className={`${defPrefix}-select-time`}
            locale={isZh ? zhCN.DatePicker : null}
            inputReadOnly={true} 
            order = {false}
            defaultValue={[st, et]}
            format={timeFormat}
            onChange={(value, timeString) => {this.onTimeChange(timeString);}}
        />)
    }

    renderDate(){
        const {time_in_raw='', time_out_raw=''} = this.state.zoneData;
        const sd = time_in_raw ? moment(time_in_raw.split(" ")[0], calenderFormat) : null;
        const ed = time_out_raw ? moment(time_out_raw.split(" ")[0], calenderFormat) : null;
        const { RangePicker } = DatePicker;

        return(
        <RangePicker
            className={`${defPrefix}-select-date`}
            locale={isZh ? zhCN.DatePicker : null}
            inputReadOnly={true}
            defaultValue={[sd, ed]}
            format={calenderFormat}
            showTime
            onChange={(value, dateString) => {
                this.onDateTypeChange(this.state.zoneData.date_type, dateString);}}
        />)
    }
    render() {
        const {block_name=''} = this.state.zoneData;

        return (
        <div>
            <div className={`${defPrefix}`}>
            <div className={`${defPrefix}-title`}>
                <label>
                    <span>{msg('blockName')}</span>
                    <span>
                        <input 
                            type='text' 
                            maxLength ={nameMax}
                            value={block_name} 
                            placeholder={msg('inputZoneName')}
                            onChange={e => {
                                this.onNameChange(e.target.value);
                            }}
                        />
                    </span>
                </label>
                <span 
                    title={msg('delZone')}
                    className={`${defPrefix}-del`}
                    onClick = {()=>{this.props.delFn()}}
                ></span>
                <span 
                    title={msg('copyZone')}
                    className={`${defPrefix}-copy`}
                    onClick = {()=>{this.props.copyFn()}}
                ></span>
            </div>
            <div className={`${defPrefix}-date`}>
                <div>
                    <span className={`${defPrefix}-date-range`}>{msg('dateRange')}</span>
                    <div className={`${defPrefix}-date-check`}>
                        {this.renderUnlimit()}
                    </div>
                </div>
                <div className={`${defPrefix}-date-select`}>            
                    {this.renderDate()}
                    <span className={`${defPrefix}-select-divide`}>|</span>
                    {this.renderTime()}
                </div>
            </div>
            <div className={`${defPrefix}-content`}>
                <div className={`${defPrefix}-list`}>
                    <span 
                        title={msg('addWtg')}
                        className={`${defPrefix}-add`}
                        onClick = {(e)=>{
							this.addWtg();
                        }
                    }>
                    </span>
                    <div className={`${defPrefix}-list-drop`}>
						<Zonetree 
							className={`${defPrefix}-list-drop-tree`}
							info={this.props.getInfo(this.state.zoneData.wtg_alias_list)}
							del={delWtgAliasList => {
								this.delWtg(delWtgAliasList);
							}}
						/>
					</div>
                </div>
                <div className={`${defPrefix}-matrix`}>
                    {this.renderMatrix()}
                </div>
            </div>
            </div>
        </div>);
    }
}

export default Zone;
