import React  from 'react';
import { Breadcrumb } from "antd";
import { IconType, FontIcon } from 'Icon';
import { Observer } from 'mobx-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import msg from '@/common/lang';
import Scadacfg from '@/common/const-scada';
import styles from './style.mscss';
import { getAssetAlias } from '@/common/utils';

const isZh = msg.isZh

export { default as NavBreadCrumbForm} from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface INavBreadCrumbDefaultOptions {
    
};

export const NavBreadCrumbDefaultOptions: INavBreadCrumbDefaultOptions = {
    
};

export interface INavBreadCrumbCfg{
    customAssetAlias?: string;
    title?: string;
    isDevice?: boolean;
    breads?: {
        id?: string;
        name: string;
        name_en: string;
        /**跳转页面模板标识 */
        target?: string;
        icon?: string;
        /**有可能在设备页面内部切换 */
        localSwitch?: 0|1;
        assetAlias?: string;
    }[]
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const NavBreadCrumbDefaultCfg: INavBreadCrumbCfg = {
    customAssetAlias: '',
    title: '',
    isDevice: false,
    breads: []
};

export function NavBreadCrumb(props: Omit<WidgetProps, 'configure'> & {
    configure: INavBreadCrumbCfg;
    navCb?: (target?: string) => void;
}) {
    const { configure, pageSign, navCb } = props;
    const { breads=[], isDevice } = configure;
    const navigator = useNavigate();
    const { deviceTable, deviceType, deviceAlias, deviceSign } = useParams();
    const location = useLocation();

    const renderBreadItem = (bread) => {
        const { icon, target } = bread;
        const name = isZh? bread.name: bread.name_en
        return <>
            {
                icon 
                ? <FontIcon 
                    type={icon} 
                    className={`${styles.icon} ${!name ? styles.alone : ''}`}
                /> 
                : null}
            {name ? <span>{name}</span> : null}
        </>
    }

    const toTarget = (target, localSwitch, asset?: string) => {
        if(/^http(s)?:\/\/.*/.test(target)){
            window.location.href = target;
        }else{
            if(typeof navCb === 'function'){
                navCb(target);
                return;
            }
            let noReactParam;
            if(deviceTable && deviceType){
                noReactParam = {
                    tableNo: deviceTable,
                    type: deviceType
                };
            }

            if (localSwitch === '0' && target !== pageSign) {
                window.location.href = `../page/index.html?id=${target}&gFieldParm=${getAssetAlias(Scadacfg.getCurNodeAlias(), asset)}`;
            } else if (localSwitch === '1' && deviceAlias && deviceSign){
                navigator(`/page/${pageSign}/device/${deviceAlias}/${target}${deviceTable?`/${deviceTable}`:''}${deviceType?`/${deviceType}`:''}`, {
                    replace: true, 
                    // 单设备跳转带入设备类型参数
                    state: noReactParam || location.state || null
                });
            } else {
                navigator(`/page/${target}`, {
                    replace: true, 
                    // 单设备跳转带入设备类型参数
                    state: noReactParam || location.state || null
                });
            }
        }
    }

    return <Observer>{() => {
        return <div className={styles.breadContainer}><Breadcrumb>
        {
            breads.map((bread, ind) => {
                if((isDevice && ind === 0) || (!isDevice && bread.target)){
                    return <Breadcrumb.Item 
                        className={styles.breadItem}
                        key={ind} href='' 
                        onClick={e => {
                            e.preventDefault();
                            toTarget(!isDevice ? bread.target : pageSign, bread.localSwitch, bread.assetAlias);
                        }}
                    >
                        {renderBreadItem(bread)}
                    </Breadcrumb.Item>;
                }
                return <Breadcrumb.Item key={ind}>
                    {renderBreadItem(bread)}
                </Breadcrumb.Item>;
            })
        }
        </Breadcrumb></div>
    }}</Observer>
}