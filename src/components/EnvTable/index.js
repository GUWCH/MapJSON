/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Grid from 'EnGridCopy';
import {Popover} from 'antd';
import styles from './index.mcss';

/**
 * @typedef {Object} COLUMN
 * @property {String} title
 * @property {String} key
 */

export default class EnvTable extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            icon: false,
            open: false,
            hidden: []
        };
    }

    intl18 = {
        searchPlaceHolder: '输入名称搜索',
        columnSetText: '指标设置',
        iconTabTitle: '图标',
        listTabTitle: '列表'
    };

    static propTypes = {
        /**
         * @type {COLUMN[]}
         */
         columns: PropTypes.arrayOf(PropTypes.object),

         /**
          * Grid里有frozenColumn, 应该互斥, frozenColumn范围内的不应包含在此属性里
          */
         hiddenColumnKeys: PropTypes.arrayOf(PropTypes.string),

         data: PropTypes.arrayOf(PropTypes.object),
         intl18: PropTypes.object,
         containerStyle: PropTypes.object,
         headerClassName: PropTypes.string,
         containerClassName: PropTypes.string,
         hasSearch: PropTypes.bool,
         columnSet: PropTypes.bool,
         columnSetStyle: PropTypes.object,
         iconList: PropTypes.bool,
         iconRender: PropTypes.func,
         iconData: PropTypes.arrayOf(PropTypes.object),
         iconListClassName: PropTypes.string,
         iconContainer: PropTypes.object,
         iconToolRender: PropTypes.func,
         onSearch: PropTypes.func,
         searchText: PropTypes.string
    }

    static defaultProps = {
        data: [],
        columns: [],
        hiddenColumnKeys: [],
        intl18: {},
        containerStyle: {},
        headerClassName: null,
        containerClassName: null,
        hasSearch: false,
        columnSet: false,
        columnSetStyle: {},
        iconList: false,
        iconRender: () => null,
        iconListClassName: null,
        iconContainer: null,
        iconToolRender: () => null,
        onSearch: () => null,
        searchText: ''
    }

    componentWillMount() {
        this.setState({
            hidden: JSON.parse(JSON.stringify(this.props.hiddenColumnKeys)),
            icon: this.props.iconList
        });
    }

    setColumn = (columnKeys=[], show) => {
        this.setState({
            hidden: this.state.hidden
            .filter(key => !columnKeys.includes(key)).concat(show ? [] : columnKeys)
        });
    }

    hide = () => {
        this.setState({
            open: false,
        });
    };
    
    handleVisibleChange = visible => {
        this.setState({
            open: visible 
        });
    };

    iconSwitch(icon){
        this.setState({
            icon
        });
    }

    renderIcon(){
        let {data, iconRender, iconData} = this.props;
        return iconRender(iconData);
    }

    render() {
        let {
            data=[], 
            columns=[], 
            hasSearch,
            columnSet,
            columnSetStyle,
            intl18,
            frozenColumn=0,
            containerStyle,
            headerClassName,
            containerClassName,
            iconList,
            iconListClassName,
            iconRender,
            iconContainer,
            iconToolRender,
            onSearch,
            searchText,
            ...restProps
        } = this.props;

        let disabledKeys = columns.filter((c, ind) => ind < frozenColumn).map(c => c.key);
        let checkedKeys = columns.filter((c, ind) => !this.state.hidden.includes(c.key)).map(c => c.key);

        intl18 = Object.assign({}, this.intl18, intl18);

        return (
            <div style={containerStyle} className={containerClassName}>
                <div className={`${styles.header} ${headerClassName}`}>
                {
                    hasSearch || columnSet || iconList ?
                    <div>
                        {
                            hasSearch ? 
                            <input 
                                onChange={(e) => {
                                    const nameText = e.target.value;
                                    onSearch(nameText);
                                }}
                                type={'text'} 
                                placeholder={intl18.searchPlaceHolder}
                                value={searchText}
                            /> : null
                        }
                        {
                            iconList
                            ? <div className={styles.iconTab}>
                                <span 
                                    className={this.state.icon ? styles.iconTabSelected : ''}
                                    onClick={() => {this.iconSwitch(true)}}
                                    title={intl18.iconTabTitle}
                                >{intl18.iconTabTitle}</span>
                                <span 
                                    className={this.state.icon ? '' : styles.iconTabSelected}
                                    onClick={() => {this.iconSwitch(false)}}
                                    title={intl18.listTabTitle}
                                >{intl18.listTabTitle}</span>
                            </div>
                            : null
                        }
                        {
                            columnSet && !this.state.icon ? 
                            <Popover
                                overlayClassName={styles.popover}
                                content={
                                    <ColumnChooser 
                                        columns={columns}
                                        disabledKeys={disabledKeys}
                                        checkedKeys={checkedKeys}
                                        change={this.setColumn}
                                        style={columnSetStyle}
                                        intl18={intl18}
                                    />
                                }
                                trigger="click"
                                visible={this.state.open}
                                //destroyTooltipOnHide
                                onVisibleChange={this.handleVisibleChange}
                                placement='bottomRight'
                            >
                                <button onClick={(e) => {
                                    this.setState({
                                        open: !this.state.open
                                    });
                                }}>{intl18.columnSetText || '列设置'}</button>
                            </Popover>
                             : 
                            null
                        }
                        {
                            iconList && this.state.icon ? iconToolRender() : null
                        }
                    </div> :
                    null
                }
                </div>
                {
                    iconList && this.state.icon
                    ? 
                    <div className={iconListClassName} ref={iconContainer}>
                        {this.renderIcon()}
                    </div>
                    :
                    <Grid 
                        style={{
                            height: hasSearch || columnSet ? 'calc(100% - 45px)' : '100%'
                        }}
                        frozenColumn={frozenColumn}
                        columns={columns.filter(column => !this.state.hidden.includes(column.key))}
                        data={data}
                        {...restProps}
                    /> 
                }          
            </div>
        );
    }
}

class ColumnChooser extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            focus: false,
            searchText: '',
            checked: []
        };
    }

    intl18 = {
        chooserSearchTitle: '搜索列',
        chooserSearchPlaceHolder: '输入列名',
        hideAll: '隐藏所有',
        showAll: '显示所有'
    }

    static propTypes = {
        /**
         * @type {COLUMN[]}
         */
        columns: PropTypes.arrayOf(PropTypes.object),

        disabledKeys: PropTypes.arrayOf(PropTypes.string),
        checkedKeys: PropTypes.arrayOf(PropTypes.string),
        change: PropTypes.func,
        intl18: PropTypes.object,
        style: PropTypes.object
    }

    static defaultProps = {
        columns: [],
        disabledKeys: [],
        checkedKeys: [],
        change: () => {},
        intl18: {},
        style: {}
    }

    componentWillMount() {
        this.setState({
            checked: JSON.parse(JSON.stringify(this.props.checkedKeys))
        });
    }

    /**
     * 
     * @param {COLUMN} column 
     */
    change(column, checked){
        let {key} = column;
        let filterKeys = this.state.checked.filter(c => c !== key);

        if(checked){
            filterKeys = filterKeys.concat([key]);
        }

        this.setState({
            checked: filterKeys
        }, () => {
            this.props.change([key], checked);
        });
    }

    batchChange(show){
        let {columns, checkedKeys, disabledKeys} = this.props;

        let requiredKeys = columns
            .map(c => c.key)
            .filter(
                key => show ? 
                checkedKeys.includes(key) || !disabledKeys.includes(key) : 
                checkedKeys.includes(key) && disabledKeys.includes(key)
            );
        this.setState({
            checked: requiredKeys
        }, () => {
            this.props.change(show ? 
                requiredKeys : 
                columns.map(c => c.key).filter(key => !requiredKeys.includes(key)), 
                show
            );
        });
    }

    render() {
        let {
            columns=[],
            disabledKeys,
            intl18,
            style
        } = this.props;
        let text = Object.assign({}, this.intl18, intl18);

        return (
            <div className={styles.chooser}>
                <div className={`${styles.search} ${this.state.focus ? 
                    styles.focus : ''} ${this.state.searchText ? styles.active : ''}`}
                >
                    <label>{text.chooserSearchTitle}</label>
                    <div onClick={(e)=>{
                        if(this.state.focus)return;
                        this.setState({
                            focus: true
                        }, ((e) => {
                            setTimeout(function () {
                                e.focus();
                            }, 200);
                        })(e.currentTarget.firstChild));
                        
                    }}>
                        <input 
                            type="text" 
                            placeholder={text.chooserSearchPlaceHolder}
                            value={this.state.searchText}
                            onBlur={() => {
                                this.setState({
                                    focus: false
                                });
                            }}
                            onFocus={() => {
                                this.setState({
                                    focus: true
                                });
                            }}
                            onChange={(e) => {
                                this.setState({
                                    searchText: e.currentTarget.value
                                });
                            }}
                        />
                    </div>
                </div>
                <div className={styles.main} style={Object.assign({}, {
                    minHeight: 150,
                    maxHeight: parseInt(window.innerHeight * 0.55)
                }, style)}>
                {
                    columns
                    .filter(c => c.title.indexOf(this.state.searchText) > -1)
                    .map((c, ind) => {
                        return <div key={ind}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    onChange={(e) => {
                                        this.change(c, e.currentTarget.checked);
                                    }} 
                                    checked={this.state.checked.includes(c.key)}
                                    disabled={disabledKeys.includes(c.key)}
                                />
                                <span></span>
                                <span>{c.title || ''}</span>
                            </label>
                        </div>
                    })
                }
                </div>                
                <div className={styles.btn}>
                    <button onClick={() => {
                        this.batchChange();
                    }}>{text.hideAll}</button>
                    <button onClick={() => {
                        this.batchChange(true);
                    }}>{text.showAll}</button>
                </div>
            </div>
        );
    }
}

/* eslint-enable */