import { KonvaElement } from "DrawLib/model";
import Konva from "konva"

const toolTips = (
    konvaEle: KonvaElement, 
    deviceName = '', 
    valList: any[] = [], 
    stageWidth: number, 
    stageHight: number,
    width?: number,
    x?: number, // 元素x + 元素宽 + 偏移量
    y?:number, // 元素y + 元素高 + 偏移量
    xLeftDeduct?: number, // tooltip超过右侧时左侧偏移量
    yTopDeduct?: number, // tooltip超过底侧时上侧偏移量
) => {
    if(!deviceName && (!Array.isArray(valList) || valList.length === 0))return;

    const yStart = 6;    
    const xStart = 12;
    const rowHeight = 24;
    let objArr: any[] = [];
    const widths: number[] = [];
    let yNextPos = yStart;

    if(deviceName){
        let title = new Konva.Text({
            x: xStart,
            y: yNextPos,
            text: deviceName,
            fill: '#fff',
            fontSize: 12,
            height: rowHeight,
            wrap: "none",
            ellipsis: true
        });

        if(title.width() >= stageWidth - xStart * 2 - 100){
            title.setAttr('width', stageWidth - xStart * 2 - 100);
        }

        widths.push(title.width() + xStart * 2);
        yNextPos = yNextPos + rowHeight;
        objArr.push(title);
    }

    valList.map((l, index) => {
        let {name, color} = l;

        let itemGroup = new Konva.Group({
            x: 0,
            y: yNextPos,
        });

        let signalObj = new Konva.Rect({
            x: xStart,
            y: 3,
            width: 6,
            height: 6,
            cornerRadius: 6,
            fill: color || '#fff',
        }) 

        let nameObj = new Konva.Text({
            x: xStart * 2,
            text: name,
            fill: '#fff',
        });
        
        itemGroup.add(signalObj);
        itemGroup.add(nameObj);

        objArr.push(itemGroup);
        widths.push(nameObj.width() + xStart * 3);
        yNextPos = yNextPos + rowHeight;
    });

    const tooltipMaxWidth = Math.max(...widths);
    const toolTipsHight = objArr.length * rowHeight;
    const toolTipGroup = new Konva.Group({
        width: width ?? tooltipMaxWidth,
        height: toolTipsHight
    });

    let bg = new Konva.Rect({
        width: width ?? tooltipMaxWidth,
        height: toolTipsHight,
        fill: '#01333D',
        cornerRadius: 4,
    });

    toolTipGroup.add(bg);
    objArr.map(o => {
        toolTipGroup.add(o);
    });
    objArr = [];

    toolTipGroup.hide();

    konvaEle.on('mouseover', function(this: Konva.Node){
        const tooltipWidth = toolTipGroup?.width() || 0;
        const tooltipHeight = toolTipGroup?.height() || 0;

        const rawX = x ?? this.x() + this.width() + 5;
        const rawY = y ?? this.y() + this.height() + 5;

        let posX = rawX - (xLeftDeduct??(this.width()+5)) - tooltipWidth;
        posX = posX < 0 ? 0 : posX;
        toolTipGroup?.position({
            x: rawX + tooltipWidth > stageWidth ? posX : rawX,
            y: rawY + tooltipHeight > stageHight ? rawY - (yTopDeduct??(this.height()+5)) - tooltipHeight : rawY,
        });
        
        toolTipGroup?.show();
    })

    konvaEle.on('mouseout', function(){
        toolTipGroup?.hide();
    })

    return toolTipGroup;
    
}

export default toolTips;