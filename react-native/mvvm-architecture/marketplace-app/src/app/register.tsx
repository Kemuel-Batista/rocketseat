import { RegisterView } from '@/view-models/register/register.view'
import { useRegisterViewModel } from '@/view-models/register/use-register.view-model'

export default function Register() {
  const props = useRegisterViewModel()

  return <RegisterView {...props} />
}
