import * as React from "react";
import { AntdProvider } from '@/common/antd.provider';
import Tabs, { TabPane } from "Tabs";
import { msgTag } from "@/common/lang";
import EnvLoading from "EnvLoading";
import { Availability } from "./ReportA";
import { Downtime } from "./ReportB";
import { GlobalContext, reducer, initialState } from "./context";
import styles from './style.mscss';

const localText = msgTag('storage');

export const AvailabilityAndDowntime = (props) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    return <GlobalContext.Provider value={{state, dispatch}}>
        <AntdProvider>
            <div className={styles.main}>
                <Tabs className={styles.tab}>
                    <TabPane key={'availability'} tab={localText('report.availability')} className={styles.pane}>
                        <Availability />
                    </TabPane>
                    <TabPane key={'downtime'} tab={localText('report.downtime')} className={styles.pane}>
                        <Downtime />
                    </TabPane>
                </Tabs>
                <EnvLoading isLoading={state.isLoading}/>
            </div>
        </AntdProvider>            
    </GlobalContext.Provider>;
}