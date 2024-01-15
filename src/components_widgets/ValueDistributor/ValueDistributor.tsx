import React, { useEffect } from 'react'
import styles from './ValueDistributor.module.scss'
import PageCard, { PageCardConfig } from '@/components_utils/Card';
import _ from 'lodash';
import { _dao } from '@/common/dao';
import { ModelWithDomainAndPoint } from './type';
import { useWidgetMemory } from '../common/hooks';
import WidgetContext from '../common/context';
import ValueBar from './components/ValueBar';
import ValueTable from './components/ValueTable';


/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type IValueDistributorCfg = {
    models: ModelWithDomainAndPoint[]
} & PageCardConfig

export const ValueDistributorDefaultCfg: IValueDistributorCfg = {
    models: []
};

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type IValueDistributorOptions = IValueDistributorCfg

export const ValueDistributorDefaultOptions: IValueDistributorOptions = ValueDistributorDefaultCfg

const ValueDistributor: WidgetElement<IValueDistributorCfg> = (props) => {
    const { models } = props.configure

    const { content: memoContent, save, isLoading } = useWidgetMemory<{
        modelId: string,
        selectedPoints: TPoint[]
    }>(undefined, {
        isDemo: props.isDemo,
        pageId: props.pageId,
        componentId: props.id
    })

    useEffect(() => {
        if (isLoading || models.length === 0) {
            return
        }
        const defaultModel = models[0]
        const modelFromMemo = models.find(m => m.model_id === memoContent?.modelId)
        if (!memoContent || !modelFromMemo) {
            save({
                modelId: defaultModel.model_id,
                selectedPoints: defaultModel.points
            })
        } else if (modelFromMemo) {
            const modelFromCfg = models.find(m => m.model_id === modelFromMemo.model_id)
            const pointsInMemo = memoContent.selectedPoints
            const allPointAlias = modelFromCfg?.points.map(p => p.alias)
            if (!modelFromCfg || pointsInMemo.find(p => !allPointAlias?.includes(p.alias))) {
                save({
                    modelId: modelFromMemo.model_id,
                    selectedPoints: pointsInMemo.filter(p => allPointAlias?.includes(p.alias))
                })
            }
        }
    }, [models, memoContent, isLoading])

    return <WidgetContext.Provider value={{ pageId: props.pageId, componentId: props.id!, pageSign: props.pageSign, isDemo: !!props.isDemo }}>
        <PageCard {...props.configure} >
            <div className={styles.container}>
                <ValueBar
                    containerCls={styles.bar}
                    models={models}
                    currentModelId={memoContent?.modelId}
                    currentPoints={memoContent?.selectedPoints}
                    onModelChange={id => save({ modelId: id, selectedPoints: [] })}
                    onPointsChange={ps => save({ modelId: memoContent!.modelId, selectedPoints: ps })}
                />
                <ValueTable containerCls={styles.table} modelId={memoContent?.modelId} points={memoContent?.selectedPoints ?? []} />
            </div>
        </PageCard>
    </WidgetContext.Provider>
}

export default ValueDistributor