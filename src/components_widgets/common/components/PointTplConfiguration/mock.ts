import { POINT_TABLE } from '@/common/constants';

type mockType = {
    [key: string]: any
}

export const mockTpl = {
    BaseInfo: {
        'tpl1': {
            id: 'tpl1',
            name: 'tpl name1',
            points: [
                {
                    key: 'alias1-1-1',
                    name: {
                        cn: '测点名1',
                        en: 'point title1'
                    },
                    alias: 'alias1',
                    tableNo: 1,
                    fieldNo: 1,
                    type: POINT_TABLE.YC,
                    conf: { showTitleCn: 'point show title1' }
                }, {
                    key: 'alias2-2-2',
                    name: {
                        cn: '测点名2',
                        en: 'point title2'
                    },
                    alias: 'alias2',
                    tableNo: 2,
                    fieldNo: 2,
                    type: POINT_TABLE.YC,
                    conf: { showTitleCn: 'point show title2' }
                },
                {
                    key: 'alias3-3-3',
                    name: {
                        cn: '测点名3',
                        en: 'point title3'
                    },
                    alias: 'alias3',
                    tableNo: 3,
                    fieldNo: 3,
                    type: POINT_TABLE.YC,
                    conf: { showTitleCn: 'point show title3' }
                },
            ]
        },
        'tpl2': {
            id: 'tpl2',
            name: 'tpl looooooooooooong name2',
            points: [
                {
                    key: 'alias2-2-2',
                    name: {
                        cn: '测点名2',
                        en: 'point title2'
                    },
                    alias: 'alias2',
                    tableNo: 2,
                    fieldNo: 2,
                    type: POINT_TABLE.YC,
                    conf: { showTitleCn: 'point show title2' }
                },
                {
                    key: 'alias3-3-3',
                    name: {
                        cn: '测点名3',
                        en: 'point title3'
                    },
                    alias: 'alias3',
                    tableNo: 3,
                    fieldNo: 3,
                    type: POINT_TABLE.YC,
                    conf: { showTitleCn: 'point show title3' }
                },
            ]
        }
    },
    YXLightPlate: {
        'tpl1': {
            id: 'tpl1',
            name: 'tplname1',
            points: [{
                key: 'A.alias1-61-9',
                name: {
                    cn: '测点名1',
                    en: 'point title1'
                },
                alias: 'alias1',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point1',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'yes',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }, {
                key: 'A.alias2-61-9',
                name: {
                    cn: '测点名2',
                    en: 'point title2'
                },
                alias: 'alias2',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point2',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'no',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }, {
                key: 'A.alias3-61-9',
                name: {
                    cn: '测点名3',
                    en: 'point title3'
                },
                alias: 'alias3',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point3',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'no',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }, {
                key: 'A.alias4-61-9',
                name: {
                    cn: '测点名4',
                    en: 'point title4'
                },
                alias: 'alias4',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point4',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'no',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }, {
                key: 'A.alias5-61-9',
                name: {
                    cn: '测点名5',
                    en: 'point title5'
                },
                alias: 'alias5',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point5',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'no',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }, {
                key: 'A.alias6-61-9',
                name: {
                    cn: '测点名6',
                    en: 'point title6'
                },
                alias: 'alias6',
                tableNo: 1,
                fieldNo: 1,
                type: POINT_TABLE.YX,
                const_name_list: [{
                    name: '状态1',
                    name_en: 'yxstatus1',
                    value: 0
                }, {
                    name: '状态2',
                    name_en: 'yxstatus2',
                    value: 1
                }],
                unit: '',
                conf: {
                    showTitleCn: 'point6',
                    yxLightPlateConditions: [{
                        yxValue: 0,
                        constName: 'yxstatus1',
                        isTop: 'yes',
                        bgColor: '#124B5C'
                    }, {
                        yxValue: 1,
                        constName: 'yxstatus2',
                        isTop: 'no',
                        bgColor: 'rgba(250,70,92,0.3)'
                    }]
                }
            }]
        }
    }
}

export const mockNonStandPoints: mockType = {
    BaseInfo: [{
        key: 'non-stand-alias1-1-1',
        name: {
            cn: 'non standard 测点名1',
            en: 'non standard point title1'
        },
        alias: 'non-stand-alias1',
        tableNo: 1,
        fieldNo: 1,
        type: POINT_TABLE.YC,
        const_name_list: [],
        unit: '',
        conf: { showTitleCn: 'non-stand-point show title1' }
    }],
    YXLightPlate: [{
        key: 'A.nalias1-61-9',
        name: {
            cn: 'non standard 测点名1',
            en: 'non standard point title1'
        },
        alias: 'non-stand-alias1',
        tableNo: 61,
        fieldNo: 9,
        type: POINT_TABLE.YX,
        const_name_list: [{
            name: '状态1',
            name_en: 'yxstatus1',
            value: 0
        }, {
            name: '状态2',
            name_en: 'yxstatus2',
            value: 1
        }
        ],
        unit: '',
        conf: {
            showTitleCn: 'non-stand-point title1',
            yxLightPlateConditions: [{
                yxValue: 0,
                constName: 'yxstatus1',
                isTop: 'yes',
                bgColor: '#124B5C'
            }, {
                yxValue: 1,
                constName: 'yxstatus2',
                isTop: 'no',
                bgColor: 'rgba(250,70,92,0.3)'
            }]
        }
    }],
}

export const mockPointsValue: mockType = {
    BaseInfo: {
        'alias1-1-1': {
            display_value: "123.12",
            id: "78548764",
            key: "1:1:F01.T1_L2.WTG007.alias1:1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'alias2-2-2': {
            display_value: "123.12",
            id: "78548764",
            key: "1:2:F01.T1_L2.WTG007.alias2:2",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'alias3-3-3': {
            display_value: "123.12",
            id: "78548764",
            key: "1:3:F01.T1_L2.WTG007.alias3:3",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        }
    },
    YXLightPlate: {
        'A.alias1-61-9': {
            display_value: "空调关机",
            id: "78548761",
            key: "1:61:F01.T1_L2.WTG001.A.alias1:9",
            raw_value: "0",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'A.alias2-61-9': {
            display_value: "空调开机",
            id: "78548762",
            key: "1:61:F01.T1_L2.WTG001.A.alias2:9",
            raw_value: "1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'A.alias3-61-9': {
            display_value: "空调开机",
            id: "78548763",
            key: "1:61:F01.T1_L2.WTG001.A.alias3:9",
            raw_value: "1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'A.alias4-61-9': {
            display_value: "空调开机",
            id: "78548764",
            key: "1:61:F01.T1_L2.WTG001.A.alias4:9",
            raw_value: "1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'A.alias5-61-9': {
            display_value: "空调开机",
            id: "78548765",
            key: "1:61:F01.T1_L2.WTG001.A.alias5:9",
            raw_value: "1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        },
        'A.alias6-61-9': {
            display_value: "空调开机",
            id: "78548766",
            key: "1:61:F01.T1_L2.WTG001.A.alias6:9",
            raw_value: "1",
            status: "遥信正常",
            status_value: 0,
            timestamp: "2013-12-13 16:16:05"
        }
    }
}
