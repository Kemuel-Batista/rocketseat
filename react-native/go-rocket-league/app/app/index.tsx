import { Redirect } from 'expo-router';

/**
 * Dev: always start at onboarding so we can develop the component without killing the session.
 * Later we'll use userStore onboarding "seen" to show this only on first launch.
 */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
