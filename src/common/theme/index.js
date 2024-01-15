const defaultTheme = {
    chartBarColor: '#0cf',
    chartBarColor2: '#00d99a',
    chartBarColor3: 'rgba(0, 215, 234, 0.5)',
    chartLineColor: '#e1ac32',
    chartLineColor1: '#04a86c',
    chartLineColor2: '#00cdff',
    chartTextColor: '#69959b',
    chartTextColor2: '#8d99a6',
    chartTooltipBg: 'rgba(0, 0, 0, 0.8)',
    chartTooltipLine: '#73dcff',
    chartTooltipBorder: '#69959b',
    chartTooltipName: 'rgba(255, 255, 255, 0.6)',
    chartLegendColor: '#ccc',
    chartLegendWhiteColor: '#fff',
    chartLegendActiveColor: '#666',
    chartYaxisSplitColor: 'rgba(153, 218, 243, .08)',
    chartYaxisSplitColor2: '#394451',
    chartAreaColor: '#15a9ff',
    chartAreaColor2: '#36d2fd',
    chartAreaColor3: 'rgba(0, 204, 255, 0.3)',
    chartAreaColor4: 'rgba(0, 204, 255, 0)',

    whiteTranparent2: 'rgba(255,255,255,.2)',
    red: 'red',
    white: '#fff',
    black: '#000'
};

const tplChartTheme = {
    white: '#fff',
    chartLegendColor: '#537C94',
    tooltipDesColor: '#6A8CA3',
    tooltipValColor: '#F5F5FA',
    tooltipBg: '#083F4D',
    chartYaxisSplitColor:'rgba(73, 73, 82, 0.36)',
    pageIconColor: '#3F6D85',
    pageIconInactiveColor: '#083F4D',
    pageTextColor: '#537C94',
}

export const getTheme = (themeName = 'defaultTheme') => {
    switch(themeName){
        case 'defaultTheme':
            return defaultTheme;

        case 'tplChartTheme':
            return tplChartTheme;
    }
    return {};
};