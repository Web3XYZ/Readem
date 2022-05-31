import classnames from 'classnames'
import React, { useEffect, useState } from 'react'

import css from './slider.module.stylus'

interface IProps {
    setSlider: (slider: number) => void
}

export default (props: IProps): React.ReactElement | null => {
    const [slider, setSlider] = useState(0.25)

    useEffect(() => {
        props.setSlider(slider)
    }, [slider])

    return (
        <div className={css.slider}>
            <div className={classnames(css.item, { [css.cur]: slider >= 0.25 })} onClick={() => setSlider(0.25)}>
                25%
            </div>
            <div className={classnames(css.item, { [css.cur]: slider >= 0.5 })} onClick={() => setSlider(0.5)}>
                50%
            </div>
            <div className={classnames(css.item, { [css.cur]: slider >= 0.75 })} onClick={() => setSlider(0.75)}>
                75%
            </div>
            <div className={classnames(css.item, { [css.cur]: slider >= 1 })} onClick={() => setSlider(1)}>
                100%
            </div>
        </div>
    )
}
