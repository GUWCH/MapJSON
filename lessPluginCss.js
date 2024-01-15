"use strict";

const path = require('path');
const antdGlobalLessPath = path.join('antd', 'lib', 'style', 'index.less');
const split = '[\\r\\n\\t\\f\\v\\s]*'
const boxSizingRe = new RegExp(`\\*${split}\\,${split}\\*\\:\\:before${split}\\,${split}\\*\\:\\:after${split}\\{[^\\{\\}]*\\}`);
const inputColorRe = new RegExp(`input[^\\{\\}]*\\{[^\\{\\}]*color\\:${split}inherit\\;[^\\{\\}]*\\}`);

function cSSProcessor(less) {

    /**
     * @todo a tag暂未处理
     * @param {object} options 
     * @param {boolean} options.rmAntd4Global
     */
    function CSSProcessor(options) {
        this.options = options || {};
    }

    CSSProcessor.prototype = {
        process: function (css, extra) {
            const options = this.options;

            if(options.rmAntd4Global){
                if(extra && extra.options && extra.options.filename.indexOf(antdGlobalLessPath) > -1){
                    if(boxSizingRe.test(css)){
                        css = css.replace(boxSizingRe, `
                            [class^=ant-] *,
                            [class*=ant-] *,
                            [class^=ant-] *::before,
                            [class^=ant-] *::after,
                            [class*=ant-] *::before,
                            [class*=ant-] *::after {
                                box-sizing: border-box;
                            }
                        `);
                    }

                    if(inputColorRe.test(css)){
                        css = css.replace(inputColorRe, `
                            *[class^=ant-] input,
                            *[class^=ant-] button,
                            *[class^=ant-] select,
                            *[class^=ant-] optgroup,
                            *[class^=ant-] textarea, 
                            *[class*=ant-] input,
                            *[class*=ant-] button,
                            *[class*=ant-] select,
                            *[class*=ant-] optgroup,
                            *[class*=ant-] textarea,
                            input[class^=ant-],
                            button[class^=ant-],
                            select[class^=ant-],
                            optgroup[class^=ant-],
                            textarea[class^=ant-],
                            input[class*=ant-],
                            button[class*=ant-],
                            select[class*=ant-],
                            optgroup[class*=ant-],
                            textarea[class*=ant-]{
                                margin: 0;
                                color: inherit;
                                font-size: inherit;
                                font-family: inherit;
                                line-height: inherit;
                            }
                        `);
                    }
                }
            }

            /* css = css.replace(/\/\*[^\/]*\*\//g, '').trim();
            if(!css){
                console.log('extra.options.filename', extra.options.filename);
            } */

            return css;
        }
    };

    return CSSProcessor;
}

/**
 * 
 * @param {object} options 
 * @param {boolean} options.rmAntd4Global
 */
function LessPluginCss(options) {
    this.options = options;
}

LessPluginCss.prototype = {
    install: function(less, pluginManager) {
        var CSSProcessor = cSSProcessor(less);
        pluginManager.addPostProcessor(new CSSProcessor(this.options));
    },
    printUsage: function () {},
    setOptions: function(options) {
        this.options = options;
    },
    minVersion: []
};

module.exports = LessPluginCss;