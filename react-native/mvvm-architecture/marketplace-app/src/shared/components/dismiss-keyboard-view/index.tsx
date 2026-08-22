import type { ReactNode } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type DismissKeyboardViewProps = {
  children: ReactNode
}

export function DismissKeyboardView({ children }: DismissKeyboardViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
      >
        {children}
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  )
}
