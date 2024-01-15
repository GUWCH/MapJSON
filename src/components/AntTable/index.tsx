import * as React from 'react';
import { Table, TableProps } from "antd";
export { default as AutoFitTable } from './AutoFitTable';

const { useEffect, useState } = React;

/**
 * 由于Table的pagination dom会根据数据是否显示，不好定位，所以用户根据需要直接传入pagination的高度
 * @param props 
 * @returns 
 */
const AntTable = <T extends object = any>(props: TableProps<T> & { observeElement?: Element | null, paginationHeight?: number }) => {
    const { observeElement, paginationHeight = 0, scroll = {}, ...rest } = props;
    const [tableHeight, setTableHeight] = useState(100);

    useEffect(() => {
        const resizeOb = new ResizeObserver((arr) => {
            const listEle = arr[0];
            if (!listEle) return;

            const { height } = listEle.contentRect;
            const tableHeaders = document.querySelectorAll('.ant-table-header');
            let tableHeaderHeight = 0;
            for (let i = 0; i < tableHeaders.length; i++) {
                let tableHeader = tableHeaders[i];
                if (tableHeader.nodeType === 1) {
                    let temp = tableHeader.parentNode;
                    while (temp) {
                        if (temp === listEle.target) {
                            tableHeaderHeight = tableHeader.clientHeight;
                            break;
                        } else {
                            temp = temp.parentNode;
                        }
                    }

                    if (tableHeaderHeight > 0) {
                        break;
                    }
                }
            }
            const listHeight = Math.max(0, height - tableHeaderHeight - paginationHeight);
            setTableHeight(listHeight);
        });

        observeElement && resizeOb.observe(observeElement);

        return () => {
            resizeOb.disconnect();
        }
    }, [observeElement]);

    return <Table<T> scroll={observeElement ? Object.assign({}, scroll, { y: tableHeight }) : scroll} {...rest} />
}

export default AntTable;