import type { ImagePickerOptions } from 'expo-image-picker'
import { useAppModal } from './use-app-modal'
import { useCamera } from './use-camera'
import { useGallery } from './use-gallery'
import { useModalStore } from '../store/modal-store'

interface UseImageProps extends ImagePickerOptions {
  callback: (uri: string | null) => void
}

export function useImage({ callback, ...pickerOptions }: UseImageProps) {
  const { openCamera, isLoading: cameraLoading } = useCamera(pickerOptions)
  const { openGallery, isLoading: galleryLoading } = useGallery(pickerOptions)

  const isLoading = Boolean(cameraLoading || galleryLoading)

  const { close } = useModalStore()

  const modals = useAppModal()

  function handleCallback(uri: string | null) {
    close()
    callback(uri)
  }

  function handleSelectImage() {
    modals.showSelection({
      title: 'Selecionar foto',
      message: 'Escolha uma opção:',
      options: [
        {
          text: 'Galeria',
          icon: 'images',
          variant: 'primary',
          onPress: async () => {
            const imageUri = await openGallery()
            handleCallback(imageUri)
          },
        },
        {
          text: 'Câmera',
          icon: 'camera',
          variant: 'primary',
          onPress: async () => {
            const imageUri = await openCamera()
            handleCallback(imageUri)
          },
        },
      ],
    })
  }

  return {
    isLoading,
    handleSelectImage,
  }
}
