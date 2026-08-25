import { useModalStore } from '@/shared/store/modal-store'
import { Modal, TouchableWithoutFeedback, View } from 'react-native'

export function AppModal() {
  const { isOpen, config, content, close } = useModalStore()

  if (!isOpen || !content) {
    return null
  }

  return (
    <Modal
      visible={isOpen}
      animationType={config.animationType}
      transparent={config.transparent}
      statusBarTranslucent={config.statusBarTranslucent}
      onRequestClose={close}
    >
      <TouchableWithoutFeedback onPress={close}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <TouchableWithoutFeedback onPress={() => {}}>
            {content}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
