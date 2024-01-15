import React from 'react'

export type IWidgetContext = {
    isDemo: boolean
    componentId: string
    widgetName?: string
    pageId?: string
    pageSign?: string
}
export const WidgetContext = React.createContext<IWidgetContext>({
    isDemo: false,
    componentId: 'defaultId',
    widgetName: 'BaseInfo'
})

export default WidgetContext