import React, { forwardRef } from 'react'
import iframeHtml from 'iframe.raw.html'

export type LuckysheetWrapperProps = {}

const LuckysheetWrapper = forwardRef<HTMLIFrameElement, LuckysheetWrapperProps>((props, ref) => {
    return <iframe ref={ref} srcDoc={iframeHtml} style={{ flex: 1, border: 'none' }} />
})

export default LuckysheetWrapper