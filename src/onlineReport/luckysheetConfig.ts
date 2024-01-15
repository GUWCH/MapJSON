import { isZh } from "@/common/lang";

export default {
    lang: isZh ? 'zh' : 'en',
    showinfobar: false,
    showtoolbarConfig: {
        // undoRedo: false, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
        // paintFormat: false, //格式刷
        // currencyFormat: false, //货币格式
        // percentageFormat: false, //百分比格式
        // numberDecrease: false, // '减少小数位数'
        // numberIncrease: false, // '增加小数位数
        // moreFormats: false, // '更多格式'
        // font: false, // '字体'
        // fontSize: false, // '字号大小'
        // bold: false, // '粗体 (Ctrl+B)'
        // italic: false, // '斜体 (Ctrl+I)'
        // strikethrough: false, // '删除线 (Alt+Shift+5)'
        // underline: false, // '下划线 (Alt+Shift+6)'
        // textColor: false, // '文本颜色'
        // fillColor: false, // '单元格颜色'
        // border: false, // '边框'
        // mergeCell: false, // '合并单元格'
        // horizontalAlignMode: false, // '水平对齐方式'
        // verticalAlignMode: false, // '垂直对齐方式'
        // textWrapMode: false, // '换行方式'
        // textRotateMode: false, // '文本旋转方式'
        image: false, // '插入图片'
        link: false, // '插入链接'
        chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
        postil: false, //'批注'
        pivotTable: false,  //'数据透视表'
        // function: false, // '公式'
        frozenMode: false, // '冻结方式'
        sortAndFilter: false, // '排序和筛选'
        conditionalFormat: false, // '条件格式'
        dataVerification: false, // '数据验证'
        // splitColumn: false, // '分列'
        screenshot: false, // '截图'
        // findAndReplace: false, // '查找替换'
        protection: false, // '工作表保护'
        print: false, // '打印'
        exportXlsx: false,
    },
    cellRightClickConfig: {
        // copy: false, // 复制
        // copyAs: false, // 复制为
        // paste: false, // 粘贴
        // insertRow: false, // 插入行
        // insertColumn: false, // 插入列
        // deleteRow: false, // 删除选中行
        // deleteColumn: false, // 删除选中列
        // deleteCell: false, // 删除单元格
        // hideRow: false, // 隐藏选中行和显示选中行
        // hideColumn: false, // 隐藏选中列和显示选中列
        // rowHeight: false, // 行高
        // columnWidth: false, // 列宽
        // clear: false, // 清除内容
        // matrix: false, // 矩阵操作选区
        // sort: false, // 排序选区
        // filter: false, // 筛选选区
        chart: false, // 图表生成
        // image: false, // 插入图片
        // link: false, // 插入链接
        // data: false, // 数据验证
        // cellFormat: false // 设置单元格格式
    }
}