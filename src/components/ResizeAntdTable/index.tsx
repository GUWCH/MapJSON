
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import styles from "./index.mscss";

// https://codeload.github.com/confidence68/ResizeableTable
// 参考上述地址修正,下面拖拽列有些问题
const ResizeableTitle = (props) => {
	const { onResize, width, ...restProps } = props;

	if (!width) {
		return <th {...restProps} />;
	}

	return (
		<Resizable
			className={styles.sizeable}
			width={width}
			height={0}
			onResize={onResize}
			draggableOpts={{ enableUserSelectHack: false }}
		>
			<th {...restProps} />
		</Resizable>
	);
};

const ResizeTable = (props) => {
	const { columns = [], components = {}, ...restProps } = props;

	const [cols, setCols] = useState(columns || []);
	const [resizeColumns, setResizeColumns] = useState([]);

	useEffect(() => {
		setResizeColumns((cols || []).map((col, index) => ({
			...col,
			onHeaderCell: (column) => ({
				width: column.width,
				onResize: handleResize(index),
			}),
		})))
	}, [cols]);

	// 处理拖拽
	const handleResize = (index) => (e, { size }) => {
		e.stopImmediatePropagation();
		setCols((cols) => {
			const nextColumns = [...cols];
			// 拖拽是调整宽度
			nextColumns[index] = {
				...nextColumns[index],
				width: size.width,
			};
			return nextColumns;
		});
	};
	console.log(resizeColumns)
	return <Table
		columns={resizeColumns}
		components={Object.assign({}, components, {
			header: {
				cell: ResizeableTitle
			}
		})}
		{...restProps}
	/>
}

export default ResizeTable;