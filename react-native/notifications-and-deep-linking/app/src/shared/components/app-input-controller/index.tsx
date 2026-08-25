import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form'
import { AppInput, AppInputProps } from '../app-input'

interface AppInputControllerProps<T extends FieldValues> extends Omit<
  AppInputProps,
  'value' | 'onChangeText' | 'error'
> {
  control: Control<T>
  name: Path<T>
  errors?: FieldErrors<T>
}

export function AppInputController<T extends FieldValues>({
  name,
  control,
  errors,
  ...rest
}: AppInputControllerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
        formState: { isSubmitting },
      }) => (
        <AppInput
          onChangeText={onChange}
          onBlur={onBlur}
          value={value}
          error={error?.message}
          isDisabled={isSubmitting || rest.isDisabled}
          {...rest}
        />
      )}
    />
  )
}
