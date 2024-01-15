import { Table, TableProps } from "antd";
import styles from './AutoFitTable.module.scss'
import React, { useRef, useEffect, useState } from 'react';

const AutoFitTable = <T extends object = any>(props: TableProps<T>) => {
    const { scroll = {}, ...rest } = props;
    const [scrollY, setScrollY] = useState<number | undefined>();

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            const observeElement = containerRef.current
            const resizeOb = new ResizeObserver((arr) => {
                const wrapperEle = arr[0];
                if (!wrapperEle) return;
                const antTableContainer = wrapperEle.target.getElementsByClassName('ant-table-container')?.[0]
                if (antTableContainer) {
                    const { height } = antTableContainer.getBoundingClientRect()
                    setScrollY(height);
                }
            });

            observeElement && resizeOb.observe(observeElement);
            return () => {
                resizeOb.disconnect();
            }
        }
    }, []);

    return <div className={styles.container} ref={containerRef}>
        <Table<T> scroll={scrollY ? Object.assign({ y: scrollY }, scroll) : scroll} {...rest} />
    </div>
}

export default AutoFitTable;