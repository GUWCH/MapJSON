import React, { ReactNode, useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
    AutoSizer as _AutoSizer,
    List as _List,
    ListProps,
    AutoSizerProps,
    ListRowRenderer
  } from "react-virtualized";
import { notify } from 'Notify';
import EnvLoading from "EnvLoading";
import { saveAs } from 'file-saver';
import { msgTag } from "@/common/lang";
import { isDevelopment } from "@/common/constants";
import { _dao, daoIsOk } from "@/common/dao";
import styles from './style.mscss';
const List = _List as unknown as React.FC<ListProps>;
const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;

const fileDirPath = 'data/ems/log/DataRecord';
const mockData = isDevelopment ? Array.from(Array(3000)).map((d, ind) => `agc_rt${ind}_20211219${ind === 0 ? 1800 : 1830}_v433.log`) : [];
const localText = msgTag('common');

export const RecordFile = (props) => {
    const [fileList, setFileList] = useState<string[]>(mockData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetched, setIsFetched] = useState<boolean>(false);
    const container = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const res: ScadaResponse<string[]> = await _dao.getFileList({ file_path: fileDirPath });
            if(daoIsOk(res)){
                setFileList(res.data);
                setIsFetched(true);
            }else{
                notify(localText('data_fail'));
            }
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        // selection 生成菜单
        const selectAction = async (e: MouseEvent) => {
            const selection: Selection | null = await new Promise(resolve => {
                setTimeout(() => {
                  resolve(window.getSelection());
                }, 0);
            });
            if(!selection || selection.isCollapsed) return;
            
            let anchor = selection.anchorNode, focus = selection.focusNode;            
            anchor = anchor && anchor.nodeType === Node.TEXT_NODE ? anchor.parentNode : anchor;
            focus = focus && focus.nodeType === Node.TEXT_NODE ? focus.parentNode : focus;

            let anchorNodeIndex, focusNodeIndex;
            if(anchor && anchor.textContent && anchor instanceof Element &&  anchor.attributes.hasOwnProperty('data-index')){
                anchorNodeIndex = anchor.getAttribute('data-index');
            }

            if(focus && focus.textContent && focus instanceof Element &&  focus.attributes.hasOwnProperty('data-index')){
                focusNodeIndex = focus.getAttribute('data-index');
            }

            let fileNames: string[] = [];
            if(anchorNodeIndex && focusNodeIndex){
                anchorNodeIndex = Number(anchorNodeIndex);
                focusNodeIndex = Number(focusNodeIndex);
                let anchorSelected = focusNodeIndex >= anchorNodeIndex 
                    ? anchor && selection.anchorOffset < (anchor.textContent || '').length 
                    : anchor && selection.anchorOffset > 0 ;
                let focusSelected = focusNodeIndex >= anchorNodeIndex 
                    ? focus && selection.focusOffset > 0
                    : focus && selection.focusOffset < (focus.textContent || '').length ;

                let maxIndex = Math.max(anchorNodeIndex, focusNodeIndex);
                let includeMax = ((maxIndex === anchorNodeIndex && anchorSelected) || ((maxIndex === focusNodeIndex && focusSelected)));
                let minIndex = Math.min(anchorNodeIndex, focusNodeIndex);
                let includeMin = ((minIndex === anchorNodeIndex && anchorSelected) || ((minIndex === focusNodeIndex && focusSelected)));

                for(let i = minIndex; i <= maxIndex; i++){
                    let file = fileList[i];
                    if(file){
                        if(i === minIndex){
                            if(includeMin){
                                fileNames.push(file);
                            }
                        }else if(i === maxIndex){
                            if(includeMax){
                                fileNames.push(file);
                            }
                        }else{
                            fileNames.push(file);
                        }
                    }
                }
            }

            if(fileNames.length === 0)return;

            const btn = document.createElement('DIV');
            btn.className = styles.download;
            btn.textContent = localText('download');
            btn.style.left = e.pageX + 'px';
            btn.style.top = e.pageY + 'px';
            btn.onclick = (e) => {
                download(fileNames)(e);
                removeBtn();
                e.stopPropagation();
                return false;
            };
            document.body.appendChild(btn);

            const removeBtn = () => {
                btn.parentNode?.removeChild(btn);
                document.removeEventListener('mousedown', removeBtnEvt);
                container.current && container.current.removeEventListener('scroll', removeBtn, true);
            }
            const removeBtnEvt = (e: MouseEvent) => {
                if(e.target !== btn){
                    removeBtn();
                }
            };
            document.addEventListener('mousedown', removeBtnEvt);
            container.current && container.current.addEventListener('scroll', removeBtn, true);
        };
        container.current && container.current.addEventListener('click', selectAction);

        return () => {
            container.current && container.current.removeEventListener('click', selectAction);
        };
    }, [fileList]);

    const noRender = useCallback(() => {
        return <div className={styles.nodata}>{localText('nodata')}</div>;
    }, []);

    const download = useCallback((files: string[]) => {
        return (e: React.MouseEvent | MouseEvent) => {
            setIsLoading(true);
            _dao
            .downloadFile([{
                fac_alias: '',
                file_list: files.map(file => `${fileDirPath}/${file}`),
                zip_file_name: files.length > 1 ? 'data.zip' : files[0].split('.').slice(0, files[0].split('.').length - 1).join('.') + '.zip'
            }])
            .then(async (res) => {
                if(res.ok){
                    let fileName;
                    const content = res.headers.get("content-disposition");
                    fileName = content.replace(/.*filename=(.*)/gi, '$1');
                    
                    const blob = await res.blob();
                    saveAs(blob, fileName);
                }else{
                    // 使用接口的错误信息
                    notify(res.message || localText('download_fail'));
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
            e.stopPropagation();
            return false;
        }
    }, []);

    const rowRenderer: ListRowRenderer = useCallback(({index, style={}}) => {
        return <div 
            key={index} 
            style={style}
            className={`${styles.file} ${(index) % 2 === 0 ? styles.fileEven : ''}`}
            data-node
            data-index={index}
        >
            <span
                data-node
                data-index={index}
                onClick={download([fileList[index]])}
            >{fileList[index]}</span>
        </div>;
    }, [fileList]);

	return <div className={styles.main} ref={container}>
        <div className={styles.listWrapper}>
            <AutoSizer onResize={({width, height}) => {}}>
                {({width, height}) => {
                    return (
                        <List
                            className={styles.list}
                            height={height}
                            overscanRowCount={10}
                            noRowsRenderer={isFetched ? noRender : undefined}
                            rowCount={fileList.length}
                            rowHeight={30}
                            rowRenderer={rowRenderer}
                            //scrollToIndex={scrollToIndex}
                            width={width}
                        />
                    )
                }}
            </AutoSizer>
        </div>
        <EnvLoading 
            isLoading={isLoading} 
        />
    </div>;
}