import { Skeleton } from 'antd-mobile'
import React from 'react'

export default (): React.ReactElement => {
    return (
        <div className="lt-skeleton">
            <Skeleton.Title animated />
            <Skeleton.Paragraph animated lineCount={5} />
            <Skeleton
                animated
                style={{
                    '--height': '300px',
                    '--border-radius': '5px'
                }}
            />
            <Skeleton.Paragraph animated lineCount={5} />
        </div>
    )
}
