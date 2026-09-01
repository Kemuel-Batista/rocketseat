import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ensureValidAccessToken } from '@/lib/api/authApi';

export default function OnboardingRoute() {
  const router = useRouter();

  useEffect(() => {
    ensureValidAccessToken();
  }, []);

  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
    </View>
  );
}
