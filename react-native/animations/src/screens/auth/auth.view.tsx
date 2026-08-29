import { colors, gradients } from '@/constants/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { FC } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthViewModel } from './use-auth.view-model'

export const AuthView: FC<ReturnType<typeof useAuthViewModel>> = ({
  username,
  setUsername,
  handleSubmit,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('@/assets/logo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>memory game</Text>
          <Text style={styles.subtitle}>
            Teste sua memória enquanto aprende!
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu nome"
            style={styles.input}
            placeholderTextColor={colors.grayscale.gray300}
            textAlign="center"
            autoCapitalize="words"
            returnKeyType="done"
          />

          <View style={styles.buttonGlow}>
            <LinearGradient
              colors={gradients.colorful}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 2 }}
              style={styles.buttonGradient}
            >
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale.gray700,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 71,
    height: 71,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    color: colors.grayscale.gray100,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayscale.gray200,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grayscale.white,
  },
  buttonGradient: {
    borderRadius: 50,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGlow: {
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  input: {
    width: '100%',
    backgroundColor: colors.grayscale.gray500,
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.grayscale.white,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
  },
})
