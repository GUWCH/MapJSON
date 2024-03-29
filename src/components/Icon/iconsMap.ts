const iconsMap = {
    CONTAINER: 'container',
    AISLE: 'aisle',
    PHYSICAL_MACHINE: 'physical-machine',
    SUBSYSTEM: 'subsystem',
    STATISTICS: 'statistics',
    ZOOM_IN: 'zoom-in',
    ASCENDING: 'ascending',
    DESCENDING: 'descending',
    EXPORT: 'export',
    COLLAPSE: 'collapse',
    EXPAND: 'expand',
    TEMPLATE: 'template',
    ENVIRONMENTAL: 'Environmental-power-limit',
    GRIDlIMIT: 'Grid-power-limit',
    BUILDING_S:'building',
    ESS_3: 'ess3',
    FULL_ESC: 'fullscreen_esc',
    FULLSCREEN: 'fullscreen',
    MENU_FOLD_1: 'menu_fold1',
    MENU_FOLD_2: 'menu_fold2',
    HEALTH_LINE: 'health',
    ALERT: 'alert',
    ALERT_MANA: 'alertmanagement',
    SPRINKLER:'sprinkler',
    MOON: 'moon',
    AC_COM_BOX: 'ac_combiner_box',
    DC_COM_BOX: 'dc_combiner-box',
    TREND_DOWN: 'trend_down',
    QUESTION_CIRCLE_BOLD: 'question_circle_l',
    CONFIG: "config", 
    CARD: "card",
    CARD2: 'card2',
    TABLE: "table",
    PLUS: 'plus',
    MINUS: 'minus',
    DOUBLE_DOWN: "double_down_s",
    DOUBLE_UP: "double_up_s",
    MARK: "mark_so",
    UNMARK: "mark_line",
    FAULT: "fault_s",
    GROUND: "grounding_s",
    ELETRIC: "eletricity_s",
    OVERHAUL: "overhaul_s",
    FIELD_WORK:"field-work_s",
    AIR: "air",
    AIR_FLOW: "airflow",
    ALARM:"alarm_so",
    NO_ELETRIC: "no-electricity",
    ALTER_FAIL:"alternating-current_failure",
    BUILDING:"building_so",
    CAPACITY:"capacity",
    COMB_BOX:"combiner_box",
    COMMUNICAT_FAIL: "communication_failure",
    CONTROL: "control",
    CURTAIL: "curtailment",
    DIRECT_CUR: "direct-current",
    DISSIPATE_HEAT: "dissipate-heat",
    BIG_ELETRIC: "eletricity",
    CLOUD: "environment-stop",
    FAULT_STOP: "Fault-stop",
    FILE: "file_so",
    GRID_FAIL: "grid-Failure",
    GRID: "grid",
    BIG_GROUND: "grounding",
    IRRESISTIBLE: "Irresistible",
    HEALTH: "health_so",
    INSTRUCT: "instructions",
    LESS_LIGHT: "less-light",
    LOCATION: "location_so",
    MAINTAIN: "maintain",
    MONEY: "money",
    NO_CONNECT: "no-connection",
    NORMAL: "normal",
    POSITION: "position_so",
    REFRESH: 'refresh',
    REFRESH_FAIL: "refresh_failure",
    BIG_OVERHAUL: "Service-status",
    SITUATION: "situation_so",
    SITUATION_FAIL: "situation",
    SNOW: "uniE932",
    SQUARE: "uniE931",
    START: "start",
    STOP: 'stop',
    CIRCLE_START: "start2",
    STATISTIC: "statistic_so",
    TEMPERATURE: "temperature",
    TIME: "time",
    WORK: "worker",
    ADMIN: "administrator",
    DOWN: "down_so",
    UP: "up_so",
    TRANSFORM: "transformer_so",
    TRANSFORM_BOX: "transformerbox",
    INVERTER: "inverter",
    INVERTER_SO: "inverter_so",
    ESS_SO: "ess_so",
    ESS: "ess",
    METEOROLOGICAL: "meteorological",
    SOLAR_SO: "solar_so",
    SOLARfARM: "solarfarm",
    SOLAR: "solar",
    SUNNY: "sunny",
    WINDFARM: "windfarm",
    WIND: "wind",
    WRONG_CIRCLE: "wrong_circle_so",
    INFO_CIRCLE: "info_circle_so",
    RIGHT_CIRCLE: "right_circle_so",
    QUESTION: "question_circle",
    DELETE: "delete",
    EDITOR: "editor",
    BACK: "back",
    CARET_DOWN: "caret_down_s",
    CARET_LEFT: "caret_left_s",
    CARET_RIGHT: "caret_right_s",
    CARET_UP: "caret_up_s",
    DIRECT_DOWN: "direction_down_s",
    DIRECT_LEFT: "direction_left_s",
    DIRECT_RIGHT: "direction_right_s",
    DIRECT_UP: "direction_up_s",
    DRAG: "drag",
    ELLIPSIS: "ellipsis",
    QUESTION_CIRCLE: "question_circle_l1",
    RESET: "reset",
    SEARCH: "search",
    SETTING: "setting",
    SPLIT_LINE : "split_line",
    WRONG: "wrong_s",
    WRONG_S: "wrong",
    CHECK: "check",
    DATA_SUBSCRIPTION: 'data_subscription',
    POSITION_CIRCLE: 'position',
    PLUG: 'plug',
    HEALTH_CIRCLE: 'health1',
    EVCHARGER: 'evcharger',
    ELETRICITY: 'eletricity_t',
    DISABLE: 'uniE969',
    ELETRICITY_DOWN: 'eletricity_p',
    POWER: 'power'
} as const;

export type IconsMap = typeof iconsMap
export type IconKey = keyof IconsMap

export default iconsMap