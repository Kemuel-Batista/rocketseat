import { AuthView } from '@/screens/auth/auth.view'
import { useAuthViewModel } from '@/screens/auth/use-auth.view-model'

export default function Login() {
  const viewModel = useAuthViewModel()

  return <AuthView {...viewModel} />
}
