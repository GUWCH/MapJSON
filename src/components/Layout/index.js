export const getStyles = (elObj) => {
    if(!elObj)return null;
    let view = elObj.ownerDocument.defaultView;
    if (!view || !view.opener) {
        view = window;
    }

    if(view.getComputedStyle){
        return view.getComputedStyle(elObj, null);
    }else if(elObj.currentStyle){
        return elObj.currentStyle;
    }else {
        return null;
    }
};

const cssInvert = (cssProp) => {
    let cssPropList = cssProp.split('-');
    let ret = cssPropList[0];
    cssPropList.forEach((s, ind) => {
        if(ind > 0){
            ret += (s.substring(0,1).toUpperCase() + s.substring(1));
        }
    });
    return ret;
};

export const getStylesProp = (styles, attr) => {
    let val;
    if(styles.getPropertyValue){
        val = styles.getPropertyValue(attr);
    }else{
        val = styles[cssInvert(attr)];
    }

    if(/(\d+)px/g.test(val)){
        return parseFloat(val);
    }else{
        return val;
    }
};

export const setLayoutByParent = (box, isBorderBox=true, widthScale=1, heightScale=1) => {
    if(!box)return;
    let selfStyles = getStyles(box);
    let parentNode = box.parentNode;
    if(selfStyles && parentNode){
        let parentStyles = getStyles(parentNode);
        if(!parentStyles){
            return;
        }
        let ro = parentNode.getBoundingClientRect();
        let width = ro.width||ro.right - ro.left;
        let height = ro.height||ro.bottom - ro.top;
        let fn = getStylesProp;
        let horizen = [
            'margin-left', 'margin-right', 
            'padding-left', 'padding-right', 
            'border-left-width', 'border-right-width'
        ];
        let vertical = [
            'margin-top', 'margin-bottom',
            'padding-top', 'padding-bottom',
            'border-top-width', 'border-bottom-width'
        ];
        box.style.width = ((width 
            - horizen.reduce((prev, cur) => prev + fn(parentStyles, cur), 0)
            - (isBorderBox ? 0 : horizen.reduce((prev, cur) => prev + fn(selfStyles, cur), 0))
        )/widthScale) + 'px';
        box.style.height = ((height
            - vertical.reduce((prev, cur) => prev + fn(parentStyles, cur), 0)
            - (isBorderBox ? 0 : vertical.reduce((prev, cur) => prev + fn(selfStyles, cur), 0))
        )/heightScale) + 'px';
    }
};

let Layout;
export default Layout;