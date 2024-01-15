/** 测点模型定义 */
type TPoint = {
    /**
     * 许多老代码未初始化key，不再使用属性保存
     * 生成方法 src/common/utils/model.ts#combinePointKey
     */
    // key?: string
    nameCn: string,
    nameEn: string,
    name: string,
    alias: string,
    unit?: string,
    type?: string // 型号
    ifStandard?: boolean // 是否为标准点
    pointType?: string
    buildInType?: string
    tableNo: string | number,
    fieldNo: string | number,
    decimal?: string | number,
    factor?: string | number,
    factorDecimal?: string | number,
    factorUnit?: string
    constNameList?: YXConst[]
};

type YXConst = {
    name: string
    name_en: string
    value: number
}

/** 测点配置模型定义 */
type TPointWithCfg = TPoint & { conf?: TPointConfiguration }

/**
 * Condition 范围含头不含尾
 */
type ColorCondition = {
    min: number
    max: number
    color: string
}

/**
 * 系数转换
 */
type CoeConvert = {
    coefficient?: number
    unit?: string
}
/**
 * 精度转换
 */
type AccConvert = {
    decimal: number
}

/**
 * 展示方式转换
 */
type ValueConfig = {
    orderIndex?: number
    color: string[] // 颜色，需要配置多颜色时用数组下标区分 
    isTop?: boolean // 是否置顶
    enable?: boolean
    icon?: string
    dataSource?: Pick<TPoint, 'nameCn' | 'nameEn' | 'tableNo' | 'fieldNo' | 'alias'>
}

/**
 * 坐标轴相关配置
 */
type AxisConfig = {
    axisType?: 'special' | 'public';
    position?: string;
    max?: number;
    min?: number;
}

type TPointConfiguration = {
    showTitleEn?: string | null // 英文名
    showTitleCn?: string | null // 中文名
    displayStyle?: 'number' | 'progress' | 'progress_step' // 展示风格 number 数值 | progress 进度条 | progress_step 分块进度条
    conditions?: ColorCondition[] | null // 条件格式
    convert?: CoeConvert | AccConvert | (AccConvert & CoeConvert) | null // 遥测值转化
    valueMap?: { [key: string | number]: ValueConfig } | null // 遥信值转化
    isAccumulate?: boolean
    axis?: AxisConfig
    lineChartColor?: string
}

/** 测点配置后缓存的模型定义 */
type TCachePoint = {
    /** 一般使用测点表号、域号、别名组合定义出唯一值 */
    key: string;
    id?: string;
    value?: string;
    title: string;
    /** 测点属性修改后配置 */
    attrs?: {
        nameCn: string;
        nameEn: string;
        /** 遥信各个值对应配置 */
        valueMap: {
            [key: number | string]: {
                icon: typeof IconType[keyof typeof IconType];
                background: string;
            }
        };
        /** FontIcon图标 */
        icon: typeof IconType[keyof typeof IconType];
        /** FontIcon图标背景或颜色 */
        background: string;
        /** chart类型 */
        chart?: string;
        /** chart颜色 */
        chartColor?: string;
        /** 遥测电度转换配置 */
        convert: {
            coefficient: number | string;
            unit: string;
            decimal: number | string;
        };
        sort?: 'asc' | 'desc';
    }
};

type TPointKeyObj = {
    tableNo: string | number
    alias: string
    fieldNo: string | number
    type?: string
}