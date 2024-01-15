import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useDeepCompareEffect } from 'react-use';
import ResizeObserver from 'rc-resize-observer';
import { Tooltip } from 'antd';
import EchartsWrap, { EchartsEvent } from 'EchartsWrap';
import { FontIcon, IconType } from "Icon";
import { INPUT_I18N, INPUT_I18N_DEFAULT_KEY } from 'InputI18n';
import { useMemoryStateCallback } from '@/common/util-memory';
import { isDevelopment, SITE_TYPE, getPointKey } from "@/common/constants";
import { GeoUtil, getAssetAlias } from '@/common/utils';
import Intl, { msgTag } from '@/common/lang';
import { _dao, daoIsOk } from '@/common/dao';
import { ExtractModel, uIdKey, PointModel } from '@/components_utils/models';
import ScadaCfg, { CommonTimerInterval } from '@/common/const-scada';
import { navTo } from '@/common/util-scada';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import { countriesAreasProvinces } from './countries';
//import colorPng from './images/global.png';
import colorPng from './images/color.png';
import Card from './Card';
import MapSet from './Set';
import styles from './style.mscss';


export {default as EcMapForm} from './form';

export const EcMapDefaultOptions = {

}

export interface IEcMapCfg {
    customAssetAlias?: string;
    title?: string | object;
    countryCode?: string;
    subCodes?: (string|number)[];
    subEns?: (string|number)[];
    zoom?: number;
    thumbnail?: boolean;
    selected?: ExtractModel | ExtractModel[];
    bg?: '' | EcMapBg
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const EcMapDefaultCfg: IEcMapCfg = {
    title: '',
    customAssetAlias: '',
    countryCode: '',
    subCodes: [],
    subEns: [],
    zoom: 1,
    thumbnail: false,
    selected: undefined,
    bg: ''
};

export enum EcMapFnTypes {
    STATUS='status',
    INFO='info',
    QUOTA='quota',
    OVERVIEW='overview',
    STATISTICS='statistics'
}

export enum EcMapBg {
    EARTH='earth',
    HARF_EARTH='half-earth'
}

export type EcMapPointMap = {
    cacheMap: {[key in EcMapFnTypes]: {
        show?: boolean;
        points?: TCachePoint[]
    }}, 
    pointsMap: {[key: string]: PointModel[]} 
};

export type EcMapCache = {
    [key: string]: {
        [key in EcMapFnTypes]?: {
            show?: boolean;
            points?: TCachePoint[]
        };
    }
};

type SiteData = {
    name: string;
    alias: string;
    value: [number, number],
    siteType: typeof SITE_TYPE[keyof typeof SITE_TYPE]
}

type MapData = {
    mapCode: string;
    mapCenter: number[];
    mapZoom: number;
    mapScatterData: SiteData[];
}

const defaultCacheConfig: EcMapCache = {
    
};

const msg = msgTag('pagetpl');
const isZh = Intl.isZh;
const PROVINCE_OUTLINE = 'province_outline';

export function EcMap(props: Omit<WidgetProps, 'configure'> & {configure: IEcMapCfg}) {
    const { assetAlias = '', configure, id, pageId, scale, isDemo, editable, globalStores } = props;
    const { title='', customAssetAlias, countryCode, subCodes=[], subEns=[], zoom=1, thumbnail, bg, selected=[] } = configure || {};
    const nodeAlias = isDevelopment ? 'USCADA.Farm.Statistics' : getAssetAlias(assetAlias, customAssetAlias);
    const cls = bg === EcMapBg.EARTH ? styles.earth : bg === EcMapBg.HARF_EARTH ? styles.halfEarth : '';

    const [isMax, setIsMax] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [imageMounted, setImageMounted] = useState(false);
    const [showSet, setShowSet] = useState(false);
    const [isMapRoam, setIsMapRoam] = useState(false);
    const [mapRoam, setMapRoam] = useState(0);
    const [dynDataMap, setDynDataMap] = useState<{[key: string]: IDyn}>({});
    const [mapData, setMapData] = useState<MapData>({
        mapCode: '',
        mapCenter: [0, 0],
        mapZoom: 1,
        mapScatterData: []
    });
    const ecWrap = useRef<EchartsWrap>(null);
    const mapBg = useMemo(() =>{
        const img = new Image();
        img.src = colorPng;
        img.onload = () => {
            setImageMounted(true);
        }
        return img;
    }, []);

    // 配置缓存
    const [cacheConfig, setCacheConfig] 
        = useMemoryStateCallback<EcMapCache>(defaultCacheConfig, pageId, id);
    
    /** 每种类型的配置集合和组态点集合 */
    const pointMap: {[key: string]: EcMapPointMap} = useMemo(() => {
        let pointMap = {};

        Object.keys(cacheConfig).map(k => {
            const siteType = k.split('_')[1];
            if(!siteType || pointMap[siteType])return;

            const siteConfig: ExtractModel = selected.find(s => String(s.type) === siteType);
            if(!siteConfig)return;

            pointMap[siteType] = {
                cacheMap: cacheConfig[k],
                pointsMap: siteConfig.fnMap
            };
        });

        return pointMap;
    }, [cacheConfig, selected]);

    /** 每种类型状态点 */
    const selectedStatusPointMap: {[key: string]: {cache: TCachePoint, point: PointModel}} = useMemo(() => {
        let status = {};

        Object.keys(cacheConfig).map(k => {
            const siteType = k.split('_')[1];
            if(!siteType || status[siteType])return;

            const siteConfig: ExtractModel = selected.find(s => String(s.type) === siteType);
            if(!siteConfig)return;

            const pointsCache = cacheConfig[k][EcMapFnTypes.STATUS]?.points ?? [];
            const pointsConfig = (siteConfig.fnMap || {})[EcMapFnTypes.STATUS] || [];

            if(!pointsCache[0]) return;
            const point = pointsConfig.find(p => p[uIdKey] === pointsCache[0].key);
            if(!point)return;
            status[siteType] = {
                cache: pointsCache[0],
                point
            };
        });

        return status;
    }, [cacheConfig, selected]);

    useEffect(() => {
        if(globalStores){
            globalStores.pageStore.setEditable(false);
        }

        const resize = () => {
            // 全屏可触发resize事件, 'full-screen' 'maximize'
            const isMax = document.body.className.indexOf('maximize') > -1;
            setIsMax(isMax);
            setMapRoam(s => s + 1 );
        }
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    // 地图geo数据加载
    useDeepCompareEffect(() => {
        let isChina = countryCode === 'CHN';
        let isSub = Array.isArray(subCodes) && subCodes.length > 0;
        let countryMapCode = isChina ? (thumbnail ? 'china' : 'china-v') : countryCode;

        const getMaps = (cb) => {
            if(!countryCode)return;
            
            let subs = isChina ? subEns.map(s => String(s).toLowerCase()) : subCodes;
            let jsonCodes = (isSub ? subs : [countryMapCode]);

            let jsonCodesFiles = jsonCodes.map(geo => {
                switch(geo){
                    case 'macao':
                        geo = 'aomen';
                        break;
                    case 'hong kong':
                        geo = 'xianggang';
                        break;
                }
                
                let filePath = geo;
                if(['world', 'china', 'china-v'].indexOf(String(geo)) === -1){
                    if(isSub){
                        filePath = `countries/${countryCode}/${filePath}${isChina ? '' : '.geo'}`;
                    }else{
                        filePath = `countries/${filePath}.geo`;
                    }
                }
                
                return filePath;
            });

            loadEcMap(jsonCodesFiles, (mapData) => {
                cb(jsonCodes, mapData);
            });
        };

        getMaps(async(jsonCodes, mapData) => {
            let regMap = jsonCodes[0];
            let regMapData = mapData[0];
            if(jsonCodes.length > 1){
                regMap = jsonCodes.join('-');
                regMapData = combineGeoData(mapData);
            }

            /** 中国数据做了加密, 先解密, 否则下面轮廓数据已经解密会异常 */
            regMapData = isChina ? decode(regMapData) : regMapData;

            /** 多子区时增加子区的轮廓 */
            if(jsonCodes.length > 1){
                let countryMapData = EchartsEvent('getMap', countryMapCode);
                if(!countryMapData){
                    await loadEcMap([countryMapCode as string], (countryMapData) => {
                        EchartsEvent('registerMap', countryMapCode, isChina ? decode(countryMapData[0]) : countryMapData[0]);
                    });
                    countryMapData = EchartsEvent('getMap', countryMapCode);
                }
                
                const countryMapCoordData = countryMapData.geoJSON;
                const subsData = countriesAreasProvinces.filter(cap => cap.iso_code === countryCode)[0]?.subs??[];
                const subsName = subsData.filter(sub => subCodes.indexOf(sub.iso_code) > -1).map(sub => isChina ? sub.name_zh.slice(0, 2) : sub.name_en.toLowerCase());
                let subsOutline = countryMapCoordData.features.filter(f => {
                    if(isChina){
                        /** 中国地图特殊, 单独维护单独处理, 包括名称 */
                        return subsName.indexOf(f.properties.name.slice(0, 2)) > -1;
                    }else{
                        return subsName.indexOf(f.properties.name.toLowerCase()) > -1;
                    }
                });
                subsOutline = JSON.parse(JSON.stringify(subsOutline)).map(so => {
                    so.properties.name = PROVINCE_OUTLINE;
                    return so;
                });
                regMapData.features = (regMapData.features || []).concat(subsOutline);
            }
            EchartsEvent('registerMap', regMap, regMapData);
            const {center, zoom} = getMapCenterAndZoom(regMapData);
            
            setMapData(o => Object.assign({}, o, {
                mapCode: regMap,
                mapCenter: center,
                mapZoom: zoom
            }));
            setMounted(true);
        });
    }, [countryCode, subCodes, thumbnail]);

    // 使用图片更新背景
    useEffect(() => {
        if(!mounted || !imageMounted){
            return;
        }
        
        let tmpCanvas;
        let tmpCanvasCtx;
        function updateBackgroundImage() {
            if(!ecWrap.current || !ecWrap.current.echart) return;

            if (!tmpCanvas) {
                tmpCanvas = document.createElement("canvas");
                tmpCanvasCtx = tmpCanvas.getContext("2d");
            }

            tmpCanvas.width = ecWrap.current.echart.getWidth();
            tmpCanvas.height = ecWrap.current.echart.getHeight();

            tmpCanvasCtx.drawImage(mapBg, 0, 0, tmpCanvas.width, tmpCanvas.height);
            let options = ecWrap.current.echart.getOption();
            // @ts-ignore
            options.geo[1] = Object.assign({}, options.geo[1], {
                itemStyle:{
                    areaColor: {
                        image: tmpCanvas,
                        repeat: 'repeat-x'
                    },
                }
            });
            ecWrap.current.echart.setOption(options);
        }

        setTimeout(() => {
            updateBackgroundImage();
        }, 100);
        window.addEventListener('resize', updateBackgroundImage);

        return () => {
            window.removeEventListener('resize', updateBackgroundImage);
        };
    }, [mounted, imageMounted, ecWrap.current]);

    // 获取场站数据
    useEffect(() => {
        if(isDemo || !mounted || !nodeAlias) return;

        (async () => {
            const res = await _dao.getTreeList('farm', nodeAlias);
            if(daoIsOk(res)){
                const mapScatterData = (res.data || [])
                .filter(ele => ele.node_type === 'FACTORY')
                .map((ele) => {
                    const { alias, display_name, lon, lat, fac_type } = ele;
                    return {
                        alias,
                        name: display_name, 
                        value: [GeoUtil.WGS84_TO_DIGIT(lon), GeoUtil.WGS84_TO_DIGIT(lat)],
                        siteType: String(fac_type)
                    }
                });

                setMapData(d => Object.assign({}, d, {mapScatterData}));
            }
        })();

    }, [mounted]);

    // 获取动态数据
    useRecursiveTimeoutEffect(
        () => {
            const dynReq: IDynData[] = [];
            mapData.mapScatterData.map(site => {
                const { alias, siteType } = site;
                const statusPoint = selectedStatusPointMap[siteType];
                if(!statusPoint)return;

                dynReq.push({
                    id: '',
                    key: getPointKey(statusPoint.point, alias),
                    decimal: 3 
                });
            });
            if(dynReq.length === 0) return;
            return [
                () => _dao.getDynData(dynReq), 
                (res: ScadaResponse<IDyn[]>) => {
                    if(daoIsOk(res)){
                        const newDynDataMap = {};
                        res.data.map((d) => {
                            delete d.timestamp;
                            newDynDataMap[d.key] = d;
                        });
                        setDynDataMap((prev) => Object.assign({}, prev, newDynDataMap));
                    }
                }, 
                () => {},
            ];
        }, 
        nodeAlias ? CommonTimerInterval : 0, 
        [nodeAlias, assetAlias, mapData.mapScatterData.length, selected, cacheConfig]
    );

    if(!mounted || !imageMounted || !countryCode || !mapData.mapCode){
        return null;
    }

    return  <ResizeObserver
        onResize={() => {
            window.dispatchEvent(new Event('resize'));
        }}
    >
        <div className={`${styles.mapContainer} ${cls}`}>
            <EchartsWrap 
                ref={ecWrap}
                georoam={(o, ec) => {
                    // 两个geo的行为保持一致
                    let option = ec.getOption();
                    if('zoom' in o){
                        option.geo[0].zoom = option.geo[1].zoom;
                        option.geo[0].center = option.geo[1].center;
                    }else{
                        option.geo[0].center = option.geo[1].center;
                    }
                    ec.setOption(option);
                    setMapRoam(s => s + 1);
                    setIsMapRoam(true);
                }}
                widthScale={scale}
                heightScale={scale}
                data={{
                    thumbnail: thumbnail,
                    zoom: zoom,
                    mapData: mapData,
                    title: title,
                    subCodes: subCodes
                }}
                getOption={(mapData, ec) => {
                    return getMapOption(mapData);
                }}
            />
            {
                !isDemo && ecWrap.current && ecWrap.current.echart && mapData.mapScatterData.map((s, ind) => {
                    const { alias, name, value, siteType } = s;
                    if(!ecWrap.current || !ecWrap.current.echart) return null;

                    let coordinate  = ecWrap.current.echart.convertToPixel({geoIndex: 1}, value);
                    let color;
                    const statusPoint = selectedStatusPointMap[siteType];
                    if(statusPoint){
                        const dynKey = getPointKey(statusPoint.point, alias);
                        const valueMap = statusPoint.cache.attrs?.valueMap ?? {};
                        const statusVal = String(dynDataMap[dynKey]?.raw_value);
                        color = valueMap[statusVal]?.background;
                    }
                    let icon: typeof IconType[keyof typeof IconType] = IconType.WINDFARM;
                    switch(siteType){
                        case SITE_TYPE.WIND:
                            icon = IconType.WINDFARM;
                            break;
                        case SITE_TYPE.SOLAR:
                            icon = IconType.SOLARfARM;
                            break;
                        case SITE_TYPE.SUBSTATION:
                            icon = IconType.GRID;
                            break;
                        case SITE_TYPE.STORAGE:
                            icon = IconType.ESS_3;
                            break;
                    }

                    return <Tooltip 
                        title={<Card 
                            name={name} 
                            alias={alias}
                            pointMap={pointMap[siteType]}
                        />}
                        key={alias}
                        destroyTooltipOnHide={{keepParent: false}}
                        overlayClassName={styles.markerCard}
                        //visible={alias==='SXGL'}
                        //mouseLeaveDelay={1000}
                    >
                        <div 
                            key={alias}
                            className={styles.marker}
                            style={{
                                left: coordinate[0],
                                top: coordinate[1]
                            }}
                            onMouseEnter={(e) => {
                                //console.log(e);
                            }}
                            onClick={(event) => {
                                navTo(alias, {compatible: true});
                                event.stopPropagation();
                            }}
                        >
                            <div style={color ? {background: color} : {}}></div>
                            <div style={color ? {borderColor: color} : {}}></div>
                            <div>
                                <FontIcon  type={icon} style={{fontSize: 20}}/>
                            </div>
                        </div>
                    </Tooltip>
                })
            }
            <div className={`${styles.toolsWrap}`}>
                <div 
                    className={`${styles.tools}`} 
                    style={isMax ? {paddingTop: 10} : {}}
                >
                    <Tooltip title={editable ? '' : msg('COMMON.TXT_EDIT')}>
                        <div 
                            onClick={() => {
                                globalStores.pageStore.setEditable(!editable);
                            }}
                        >
                            {editable ? msg('MAP.exitEdit') : <FontIcon type={IconType.SETTING}/>}
                        </div>
                    </Tooltip>
                    <Tooltip title={isMax ? msg('COMMON.FULL_SCREEN_ESC') : msg('COMMON.FULL_SCREEN')}>
                        <div>
                            <FontIcon 
                                type={isMax ? IconType.FULL_ESC : IconType.FULLSCREEN} 
                                onClick={() => {
                                    ScadaCfg.fullScreen();
                                }}
                            />
                        </div>
                    </Tooltip>
                    {
                        isMapRoam && 
                        <Tooltip title={msg('MAP.recover')}>
                            <div>
                                <FontIcon 
                                    type={IconType.REFRESH} 
                                    onClick={() => {
                                        if(!ecWrap.current || !ecWrap.current.echart)return;

                                        let option = ecWrap.current.echart.getOption();
                                        if(option.geo){
                                            (option.geo as any[]).forEach(geo => {
                                                geo.zoom = zoom;
                                                geo.center = undefined;
                                            });
                                        }
                                        ecWrap.current.echart.setOption(option);
                                        setIsMapRoam(false);
                                    }}
                                />
                            </div>
                        </Tooltip>
                    }                    
                </div>
            </div>

            {editable && <div className={`${styles.editBtn}`} onClick={() => setShowSet(true)}>{msg('MAP.edit')}</div>}
            
            {
                showSet && <MapSet 
                    title={msg('MAP.edit')}
                    visible={showSet}
                    afterClose={() => setShowSet(false)}
                    filters={mapData.mapScatterData.map(d => d.siteType)}
                    config={JSON.parse(JSON.stringify(selected))}
                    cache={JSON.parse(JSON.stringify(cacheConfig))}
                    onSave={(cache) => {
                        setCacheConfig(cache);
                    }}
                />
            }
            
        </div>        
    </ResizeObserver>
}

const getMapOption = (data: Partial<IEcMapCfg> & {mapData: MapData}) => {
    const {mapData, zoom, title, subCodes} = data;
    const titleI18n = typeof title === 'string' ? title : (isZh ? title?.[INPUT_I18N.ZH_CN] : title?.[INPUT_I18N.EN_US]) || title?.[INPUT_I18N_DEFAULT_KEY];
    
    return {
        animation: false,
        title: {
            text: titleI18n,
            left: 'center',
            top: 35,
            textStyle: {
                fontSize: 26,
                color: '#5ef4ff'
            }
        },
        tooltip: {
            show: true,
            enterable: true,
            //alwaysShowContent: true,
            borderWidth: 0,
            padding: 0,
            backgroundColor: 'none',
            textStyle: {
                fontWeight: 'normal'
            },
            extraCssText: 'transition:none;box-shadow:none;',
            position: function(point, params, dom, rect, size){
                const {x, y, width, height} = rect;
                const domSize = size.contentSize;
                const viewSize = size.viewSize;
                
                let left = x + (width / 2) - (domSize[0] / 2);
                let top = y - domSize[1] - 5;

                if(left < 0){
                    left = 0;
                }
                if(left + domSize[0] > viewSize[0]){
                    left = viewSize[0] - domSize[0];
                }

                if(top < 0){
                    top = y + height + 5;
                }

                return {left, top};
            }
        },
        geo: [{
            map: mapData.mapCode,
            roam: false,
            zoom: zoom,
            scaleLimit: {
                min: 0.1
            },
            selectedMode: false, // 'single'
            label:{
                show: false
            },
            layoutCenter: ['50%', '50%'],
            itemStyle:{
                areaColor: 'transparent',
                borderColor: '#fff',
                borderWidth: Array.isArray(subCodes) && subCodes.length > 1 ? 2 : 3,
                shadowColor: 'rgba(0, 0, 0, 1)',
                shadowBlur: 25
            },
            emphasis: {
                disabled: true
            },
            select: {
                disabled: true
            },
            tooltip: {
                show: false
            },
            regions: [{
                name: '',
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 0, 0, 1)'
                }
            }]
        },{
            map: mapData.mapCode,
            roam: true,
            zoom: zoom,
            scaleLimit: {
                min: 0.1
            },
            selectedMode: false, // 'single'
            label:{
                show: false
            },
            layoutCenter: ['50%', '50%'],
            itemStyle:{
                borderColor: 'rgba(226, 245, 248, 0.30)',
                borderWidth: 1
            },
            emphasis: {
                disabled: true
            },
            select: {
                disabled: true
            },
            tooltip: {
                show: false
            },
            regions: [{
                name: '',
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 0, 0, 1)'
                }
            },{
                name: PROVINCE_OUTLINE,
                itemStyle: {
                    areaColor: 'transparent',
                    borderColor: '#fff',
                    borderWidth: 1, // 如果觉得细可增加
                    shadowColor: 'rgba(0, 0, 0, 1)'
                }
            }]
        }],
        series: [
            /* {
                type: 'effectScatter',
                name: 'effectScatter',
                coordinateSystem: 'geo',
                geoIndex: 1,
                animation: false,
                data: mapData.mapScatterData,
                rippleEffect: {
                    //scale: 1,
                    brushType: 'stroke',
                    number: 2
                },
                symbolSize: [15, 5],
                label: {
                    show: false
                },
                itemStyle: {
                    opacity: 1,
                    color: 'red',
                    areaColor: 'red'
                },
                select: {
                },
                tooltip: {
                    show: false
                }
            } */
        ]
    };
};

const loadEcMap = async (jsonCodes: string[] = [], cb) => {
    let count = 0;
    let randomFlag = '1qazxsw23edc';
    let geoJsonData: any[] = [];

    await Promise.all(jsonCodes.map(async geo => {
        let filePath = geo;

        let res = await fetch(`../assets2/maps/${filePath}.json?_=` + randomFlag);
        if(isDevelopment){
            if(!res.ok){                    
                // @ts-ignore
                // MAPS_PATH 定义在全局里
                res = await fetch(`${MAPS_PATH}/${filePath}.json`);
            }
        }
        
        if(res.ok){
            res = await res.json();
            geoJsonData.push(res);
        }

        count = count + 1;
        if(count === jsonCodes.length && typeof cb === 'function'){
            cb(geoJsonData);
        }
    }));
};

const combineGeoData = (geoJsonDatas) => {
    var combineData = {
        UTF8Encoding: true,
        type: "FeatureCollection",
        features: []
    };
    geoJsonDatas.map(jsonData => {
        combineData.features = combineData.features.concat(jsonData.features || []);
    });
    return combineData;
};

const getMapCenterAndZoom = (jsonData) => {
    let longitudes: any[] = [], latitudes: any[] = [];

    (jsonData.features || []).map(feature => {
        const { geometry: { coordinates, type } } = feature;
        if (type === 'Polygon') {
            coordinates.map(coords => {
                coords.map(coord => {
                    longitudes.push(coord[0]);
                    latitudes.push(coord[1]);
                });
            });
        }else if(type === 'MultiPolygon'){
            coordinates.map(coords => {
                coords.map(coord => {
                    coord.map(c => {
                        longitudes.push(c[0]);
                        latitudes.push(c[1]);
                    });
                });
            });
        }
    });

    let loMax = getMax(longitudes);
    let loMin = getMin(longitudes);
    let laMax = getMax(latitudes);
    let laMin = getMin(latitudes);

    return {
        center: [(loMax + loMin) / 2, (laMax + laMin) / 2],
        zoom:  Math.min.apply(null, [360 / (loMax - loMin), 180 /(laMax - laMin)])
    }
}

/**
 * ehcarts本身地图数据会进行压缩, 此方法进行解压
 * @param GeoJSONCompressed 
 * @returns 
 */
const decode = (GeoJSONCompressed) => {
    if (!GeoJSONCompressed.UTF8Encoding) {
        return GeoJSONCompressed;
    }
    const jsonCompressed = GeoJSONCompressed;
    let encodeScale = jsonCompressed.UTF8Scale;
    if (encodeScale == null) {
        encodeScale = 1024;
    }

    const features = jsonCompressed.features;

    for (let f = 0; f < features.length; f++) {
        const feature = features[f];
        const geometry = feature.geometry;

        if (geometry.type === 'Polygon') {
            const coordinates = geometry.coordinates;
            for (let c = 0; c < coordinates.length; c++) {
                coordinates[c] = decodePolygon(
                    coordinates[c],
                    geometry.encodeOffsets[c],
                    encodeScale
                );
            }
        }
        else if (geometry.type === 'MultiPolygon') {
            const coordinates = geometry.coordinates;
            for (let c = 0; c < coordinates.length; c++) {
                const coordinate = coordinates[c];
                for (let c2 = 0; c2 < coordinate.length; c2++) {
                    coordinate[c2] = decodePolygon(
                        coordinate[c2],
                        geometry.encodeOffsets[c][c2],
                        encodeScale
                    );
                }
            }
        }
    }
    // Has been decoded
    jsonCompressed.UTF8Encoding = false;

    return jsonCompressed;
}

const decodePolygon = (
    coordinate,
    encodeOffsets,
    encodeScale
) => {
    const result: number[][] = [];
    let prevX = encodeOffsets[0];
    let prevY = encodeOffsets[1];

    for (let i = 0; i < coordinate.length; i += 2) {
        let x = coordinate.charCodeAt(i) - 64;
        let y = coordinate.charCodeAt(i + 1) - 64;
        // ZigZag decoding
        x = (x >> 1) ^ (-(x & 1));
        y = (y >> 1) ^ (-(y & 1));
        // Delta deocding
        x += prevX;
        y += prevY;

        prevX = x;
        prevY = y;
        // Dequantize
        result.push([x / encodeScale, y / encodeScale]);
    }

    return result;
}

const getMax = (arr: number[]) => {
    return arr.reduce((max, v) => max >= v ? max : v, -Infinity);
}

const getMin = (arr: number[]) => {
    return arr.reduce((min, v) => min <= v ? min : v, Infinity);
}

