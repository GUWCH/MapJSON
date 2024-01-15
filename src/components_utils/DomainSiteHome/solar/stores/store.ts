import { observable, action, computed, makeObservable } from 'mobx';

export type StoreCfg = Partial<{
  overview: {
    alias: string
    name_cn: string
    name_en: string
    table_no: number
    field_no: number
    point_type: string
    unit: string
    needConvert: boolean
  }[],
  curve: {
    day: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: boolean
    }[],
    month: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: boolean
    }[],
    year: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: boolean
      isPlan: boolean
    }[],
    total: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: boolean
    }[]
  },
  waterDroplet: {
    type: string // 'droplet',
    limitNum: number
    colNum: number
    points: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: boolean
    }[]
  }[]
  keyInfo: {
    title: {
      name: {
        alias: string
        name_cn: string
        name_en: string
        table_no: number
        field_no: number
      },
      right: {
        alias: string
        name_cn: string
        name_en: string
        table_no: number
        field_no: number
        unit: string
        convert: {
          unit: string
          coefficient: number
        }
      }
    },
    devices: {
      key: string
      name_cn: string
      name_en: string
      total: {
        alias: string
        name_cn: string
        name_en: string
        table_no: number
        field_no: number
      },
      count: {
        alias: string
        name_cn: string
        name_en: string
        table_no: number
        field_no: number
        color: string
        statusDescCn: string
        statusDescEn: string
      }
    }[]
  },
  geographical: {
    type: string
    icon: string
    quotaNum: number
    name_cn: string
    name_en: string
    prefixName: string
    jumpable: boolean
    needStatus: boolean
    needQuotas: boolean
    needBg: boolean
    needName: boolean
    needStatics: boolean
    status: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      isDefault: boolean
      const_name_list: {
        name: string
        value: number
        name_en: string
        color: string
        icon: string
      }[]
    }[]
    bg: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      isDefault: boolean
      const_name_list: {
        name: string
        value: number
        name_en: string
        color: string
      }[]
    }[]
    quotas: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      unit: string
      needConvert: false,
      isDefault: true,
      defaultStyle: {
        yxCondition: {
          name: string
          value: string
          name_en: string
          color: string
        }[]
      },
      const_name_list: {
        name: string
        value: number
        name_en: string
      }[]
    }[]
  }[],
  matrix: {
    name_cn: string
    name_en: string
    alias: string
    tableNo: string
    fieldNo: string
    unit: string
    decimal: number
    valueMap: {
      0: {
        background: string
        icon: string
      },
      1: {
        background: string
        icon: string
      }
    }
  }
  topo: {
    key: string
    tableNo: number
    type: number
    quotas: {
      alias: string
      name_cn: string
      name_en: string
      table_no: number
      field_no: number
      point_type: string
      valueMap: {
        0: { color: string },
        1: { color: string },
      }
    }[]
  }[]
}>
export class State {
  constructor() {
    makeObservable(this);
  }

  isDev = process.env.NODE_ENV === 'development';

  @observable isLoading = false;
  @action setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @observable cfg: StoreCfg = {};
  @action setCfg(cfg: StoreCfg) {
    this.cfg = cfg;
  }
}

export default new State();