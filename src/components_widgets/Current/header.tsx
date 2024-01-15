import React, { useRef } from "react";
import { Tabs } from 'antd';
import { DefaultButton } from '../../components/Button';
import {TYPE_LIST, DISPERSE, CURRENT, msg} from './constant';
import styles from './style.mscss';

const {TabPane} = Tabs;

export interface HeaderProps {
    tabs: Array<string>;
    disperseContent: any;
    currentContent: any;
    onSetClick: Function;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {

    const {tabs, disperseContent, currentContent, onSetClick = () => {}} = props;

    const curTabValue = useRef(tabs[0]) || '';

    const setButton = <button className={styles.setButton}
        onClick={() => onSetClick(curTabValue.current)}

    >{msg('CURRENT.set')}</button>

    return <div className= {styles.tabcontainer}>
        <Tabs  
            tabBarExtraContent={setButton}
            onChange={(activeKey) =>{
                curTabValue.current = activeKey;
            }}
        >
            {tabs.map((tabkey, index) => {
                const tab = TYPE_LIST.find(t => t.value === tabkey);
                return (<TabPane tab={tab?.label} key= {tab?.value}>
                    {
                        tab?.value === DISPERSE && disperseContent
                    }
                    {
                        tab?.value === CURRENT && currentContent
                    }
                </TabPane>)
            })}
        </Tabs>
    </div>;
}

export default Header;