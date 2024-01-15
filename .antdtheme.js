//https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less

let primary = '#39e5ea';
let fontColor = '#fff';
let bg = '#04262a';
let transparent = 'none';
let blueGreen = '#2385a3';
let borderColor = '#30a09e';
let pikerBg = '#074750';
let pickerHov = '#2385a3';
let disabledColor = 'rgba(255,255,255,.5)';
let disabledNoColor = 'none';
let rangeColor = '#126275';
let rangeColorHov = '#1c86a0';
const tableHoverBg = '#012A36';
const tableSortBg = '#012B36';
const tableSelectBg = '#045355';
const tableSelectHoverBg = '#056769';
const whiteTransparent2 = 'rgba(255, 255, 255, .2)';
const blackTransparent2 = 'rgba(0, 0, 0, .2)';
const tooltipBg = '#124b5c';
const breadcrumbColor = '#6a8ca3';
const breadcrumbHoverColor = '#00a7db';
const breadcrumbLastColor = '#F0F2F5';

module.exports = {
    'primary-color': primary,
    'text-color': fontColor,
    'text-color-secondary': fontColor,
    'disabled-color': disabledColor,
    'heading-color': fontColor,
    'tree-bg': transparent,
    'tree-directory-selected-color': transparent,
    'tree-directory-selected-bg': blueGreen,
    'tree-node-hover-bg': transparent,
    'tree-node-selected-bg': transparent,
    'input-bg': bg,
    'picker-bg': bg,
    'picker-border-color': borderColor,
    'picker-date-hover-range-border-color': borderColor,
    'picker-basic-cell-hover-color': blueGreen,
    'picker-basic-cell-disabled-bg': disabledNoColor,
    'picker-basic-cell-active-with-range-color': pickerHov,
    'picker-basic-cell-hover-with-range-color': rangeColorHov,
    'picker-date-hover-range-border-color': blueGreen,
    'picker-date-hover-range-color': rangeColor,
    'calendar-bg': pikerBg,
    'calendar-input-bg': bg,
    'calendar-item-active-bg': blueGreen,
    'select-background': bg,
    'select-dropdown-bg': bg,
    'select-item-selected-bg': blueGreen,
    'select-selection-item-bg': blueGreen,
    'btn-primary-color': fontColor,
    'btn-primary-bg': blueGreen,
    'item-hover-bg': pickerHov,
    'btn-disable-bg': disabledColor,
    'btn-disable-border': disabledColor,
    'component-background': '#517775',
    'border-color-base': '#3F6D85',
    'modal-close-color': primary,
    'modal-content-bg': pikerBg,
    'modal-header-bg': pikerBg,
    'popover-bg': pikerBg,

    'modal-header-border-color-split': whiteTransparent2,
    'modal-footer-border-color-split': whiteTransparent2,
    'input-disabled-bg': disabledColor,
    'input-border-color': '#3F6D85',
    'input-number-border-color': '#3F6D85',
    'select-border-color': '#3F6D85',

    // 'table-bg': '#04464a',
    // 'table-header-bg': '#04323b',
    // 'table-row-hover-bg': '#30bdc1',
    // 'table-border-color': '#2b6877',
    'table-bg': '#011D24',
    'table-header-bg': '#083F4D',
    'table-header-sort-bg': tableSortBg,
    'table-header-sort-active-bg': tableSortBg,
    'table-row-hover-bg': tableHoverBg,
    'table-selected-row-bg': tableSelectBg,
    'table-selected-row-hover-bg': tableSelectHoverBg,
    'table-border-color': tooltipBg,
    'table-body-sort-bg': tableSortBg,
    'table-fixed-header-sort-active-bg': tableSortBg,

    // Pagination
    // ---
    'pagination-item-bg': '#051623',
    'pagination-item-input-bg': blueGreen,
    'pagination-item-bg-active': blueGreen,
    'pagination-item-link-bg': blueGreen,

    // Tabs
    'tabs-highlight-color': '#fff',
    'tabs-hover-color': '#fff',
    'tabs-active-color': '#fff',

    // Tooltip
    'tooltip-color': '#fff',
    'tooltip-bg': tooltipBg,

    // breadcrumb
    'breadcrumb-base-color': breadcrumbColor,
    'breadcrumb-last-item-color': breadcrumbLastColor,
    'breadcrumb-link-color': breadcrumbColor,
    'breadcrumb-link-color-hover': breadcrumbHoverColor,
    'breadcrumb-separator-color': breadcrumbColor,

    'dropdown-menu-bg': '#083F4D',

    'border-color-split': '#2D5F75',

    'radio-dot-color': primary,
    'radio-button-bg': 'none',
    'btn-default-border': 'none',

    'checkbox-check-bg': 'transparent',

    'icon-color-hover': blueGreen,

    'tree-node-hover-bg': '#154958',
    'tree-node-selected-bg': '#2D596B'
};
