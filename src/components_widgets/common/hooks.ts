import Memory, { getPageMemoryReq, getMemoryDesc } from '@/common/util-memory'
import { deepCopy, UserConfig } from 'dooringx-lib'
import Store from 'dooringx-lib/dist/core/store'
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import WidgetContext from './context'

export const useWidgetContext = () => (useContext(WidgetContext))

export const useWidgetMemory = <T extends object>(
    defaultContent?: T,
    widgetInfo?: { isDemo?: boolean, pageId?: string, componentId?: string }
) => {
    const { isDemo: contextIsDemo, pageId: contextPageId, componentId: contentComponentId } = useWidgetContext()

    const isDemo = widgetInfo?.isDemo ?? contextIsDemo
    const pageId = widgetInfo?.pageId ?? contextPageId
    const componentId = widgetInfo?.componentId ?? contentComponentId

    const [loadingMemo, setLoading] = useState(true)
    const [memoryContent, setContent] = useState<T | undefined>(defaultContent)

    const memory = useMemo(() => new Memory(Object.assign({}, getPageMemoryReq(), {
        description: getMemoryDesc(pageId, componentId)
    })), [isDemo, pageId, componentId])

    useEffect(() => {
        if (isDemo) {
            setContent(defaultContent)
            return
        }
        setLoading(true)
        memory.init()
            .then(v => {
                if (!v.isOk) {
                    throw new Error('fetch memory error');
                }
                if (v.content.toString()) {
                    return JSON.parse(v.content.toString()) as T
                } else if (defaultContent) {
                    return memory.save(defaultContent)
                        .then(isOk => {
                            if (isOk) { return defaultContent }
                            throw new Error('res is not ok')
                        })
                        .catch(e => {
                            console.error('set default memory content failed', e);
                        })
                }
            })
            .then(content => content && setContent(content))
            .catch(e => {
                console.error('parse memory error', e);
            })
            .finally(() => setLoading(false))
    }, [memory, defaultContent, isDemo])

    const save = async (content: T) => {
        if (isDemo) {
            console.log('mock save', content)
            setContent(content)
        } else {
            return memory.save(content)
                .then(isOk => {
                    if (isOk) {
                        setContent(content)
                    } else {
                        throw new Error('res is not ok')
                    }
                })
        }
    }

    return { content: memoryContent, save, isLoading: loadingMemo }
}

export const useUserConfigChange = <T extends string>(store: Store, id: string) => useCallback((field: T, value: any) => {
    const cloneData = deepCopy(store.getData());
    const newblock = cloneData.block.map((v: IBlockType) => {
        if (v.id === id) {
            v.props[field] = value
        }
        return v;
    });
    store.setData({ ...cloneData, block: [...newblock] });
}, [store])