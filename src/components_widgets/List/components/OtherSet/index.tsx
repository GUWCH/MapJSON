import React, { useContext } from 'react'
import styles from './index.module.scss'
import { Actions, GlobalContext } from '../QuotaSet/context';
import { DragDropContext, Draggable, Droppable, DragDropContextProps } from 'react-beautiful-dnd';
import { FontIcon, IconType } from 'Icon';
import { MODE, defaultIconArr, msg } from '../../constants';

type IconKey = typeof MODE.LARGE_ICON | typeof MODE.SMALL_ICON | typeof MODE.LIST
type Config = {
    iconArr: IconKey[]
}
export type OtherSetProps = {}

const getIconInfo = (iconKey: IconKey) => {
    switch (iconKey) {
        case MODE.LARGE_ICON: return {
            name: msg('flag.largeIcon'),
            icon: IconType.CARD
        }
        case MODE.SMALL_ICON: return {
            name: msg('flag.smallIcon'),
            icon: IconType.CARD2
        }
        default: return {
            name: msg('flag.list'),
            icon: IconType.TABLE
        }
    }
}

const OtherSet: React.FC<OtherSetProps> = (props) => {

    const { state, dispatch } = useContext(GlobalContext);

    const iconArr: IconKey[] = state?.otherData?.iconArr ?? defaultIconArr

    const handleChange = (config: Partial<Config>) => {
        dispatch({
            type: Actions.SET_STATE,
            otherData: {
                ...state?.otherData,
                ...config
            }
        })
    }
    const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
        if (!result.destination) {
            return
        }
        const sourceInx = result.source.index
        const destInx = result.destination.index
        if (sourceInx === destInx) {
            return
        }
        const item = iconArr[sourceInx]
        const newArr: typeof iconArr = []
        iconArr.forEach((v, i) => {
            if (i === sourceInx) {
                return
            }
            if (i === destInx) {
                if (destInx < sourceInx) {
                    newArr.push(item)
                    newArr.push(v)
                } else {
                    newArr.push(v)
                    newArr.push(item)
                }
                return
            }
            newArr.push(v)
        })

        handleChange({ iconArr: newArr })
    }

    return <div className={styles.container}>
        <div className={styles.title}>
            {msg('config.iconConfig')}
        </div>
        {// @ts-ignore react和ts版本不匹配导致误报错
            <DragDropContext onDragEnd={onDragEnd}>
                {/* @ts-ignore react和ts版本不匹配导致误报错 */}
                <Droppable droppableId="droppable">
                    {
                        (provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={Object.assign({
                                    padding: "0 0 10px 0",
                                })}
                            >
                                {iconArr.map((item, index) => {
                                    const { name, icon } = getIconInfo(item)
                                    // @ts-ignore react和ts版本不匹配导致误报错
                                    return <Draggable
                                        key={index.toString()}
                                        draggableId={index.toString()}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                className={styles.item}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style
                                                }}
                                            >
                                                <FontIcon {...provided.dragHandleProps} className={styles.icon} type={IconType.DRAG} />
                                                {name}
                                                <FontIcon className={styles.icon_small} type={icon} />
                                            </div>
                                        )}
                                    </Draggable>
                                })}
                                {provided.placeholder}
                            </div>
                        )
                    }
                </Droppable>
            </DragDropContext>
        }
    </div>
}

export default OtherSet