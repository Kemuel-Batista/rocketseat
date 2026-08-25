import { LoginView } from '@/view-models/login/login.view'
import { useLoginViewModel } from '@/view-models/login/use-login.view-model'

export default function Login() {
  const props = useLoginViewModel()

  return <LoginView {...props} />
}
