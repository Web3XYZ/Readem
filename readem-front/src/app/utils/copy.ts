import { Toast } from 'antd-mobile'
import copy from 'copy-to-clipboard'

export default (text: string): void => {
    Toast.clear()
    if (copy(text)) {
        Toast.show({
            icon: 'success',
            content: 'Copy Success'
        })
    } else {
        Toast.show({
            icon: 'fail',
            content: 'Copy Success'
        })
    }
}
