import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/toast/ToastContainer";
import { colors } from "@/theme";

const DEMOS: Array<{
  type: "success" | "error" | "warning" | "info" | "reward" | "system";
  icon: IconSymbolName;
  title: string;
  message: string;
  options?: Parameters<ReturnType<typeof useToast>["showSuccess"]>[1];
}> = [
  {
    type: "success",
    icon: "check-circle",
    title: "Success Toast",
    message: "Carta encontrada! Você desbloqueou uma carta rara.",
    options: {
      title: "Carta coletada!",
      actionLabel: "Ver carta",
      onPress: () => console.log("Ver carta"),
    },
  },
  {
    type: "error",
    icon: "alert-circle",
    title: "Error Toast",
    message: "Não foi possível sincronizar. Verifique sua conexão.",
    options: {
      title: "Conexão perdida",
      actionLabel: "Tentar novamente",
      onPress: () => console.log("Retry"),
    },
  },
  {
    type: "warning",
    icon: "alert",
    title: "Warning Toast",
    message: "Combustível em 10%. Volte à base!",
    options: {
      title: "Combustível baixo",
      actionLabel: "Abastecer",
      onPress: () => console.log("Refuel"),
    },
  },
  {
    type: "info",
    icon: "information",
    title: "Info Toast",
    message: "Agora você pode trocar cartas com jogadores do mundo todo.",
    options: {
      title: "Nova função",
      actionLabel: "Saiba mais",
      onPress: () => console.log("Learn more"),
    },
  },
  {
    type: "reward",
    icon: "trophy",
    title: "Reward Toast",
    message: "Você coletou 100 cartas! Resgate seu pacote lendário.",
    options: {
      title: "Conquista desbloqueada! 🎉",
      actionLabel: "Resgatar",
      duration: 7000,
      onPress: () => console.log("Claim reward"),
    },
  },
  {
    type: "system",
    icon: "cog",
    title: "System Toast",
    message: "Sincronização em segundo plano concluída.",
    options: {
      title: "Sistema",
      progressBar: true,
      duration: 4000,
    },
  },
];

const getToastCardColor = (type: keyof typeof colors.toast) =>
  type === "success" || type === "error" || type === "warning" || type === "info" || type === "reward" || type === "system"
    ? colors.toast[type].primary
    : colors.toast.system.primary;

export default function ToastDemoScreen() {
  const router = useRouter();
  const toast = useToast();

  const trigger = (demo: (typeof DEMOS)[0]) => {
    const opts = { ...demo.options, title: demo.options?.title ?? demo.title };
    switch (demo.type) {
      case "success":
        // toast.showSuccess(demo.message, opts);
        const options = {
          type: demo.type,
          message: demo.message,
          ...opts,
        }
        toast.showToast(options)
        break;
      case "error":
        toast.showError(demo.message, opts);
        break;
      case "warning":
        toast.showWarning(demo.message, opts);
        break;
      case "info":
        toast.showInfo(demo.message, opts);
        break;
      case "reward":
        toast.showReward(demo.message, opts);
        break;
      case "system":
        toast.showSystem(demo.message, opts);
        break;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <IconSymbol name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Toast Notifications</Text>
        <Text style={styles.subtitle}>
          Toque em um card para exibir um toast
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DEMOS.map((demo) => (
          <Pressable
            key={demo.type}
            onPress={() => trigger(demo)}
            style={[styles.card, { borderColor: getToastCardColor(demo.type) + "99" }]}
            android_ripple={{ color: "rgba(255,255,255,0.1)" }}
          >
            <View
              style={[
                styles.cardIconWrap,
                { backgroundColor: getToastCardColor(demo.type) + "30" },
              ]}
            >
              <IconSymbol
                name={demo.icon}
                size={28}
                color={getToastCardColor(demo.type)}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{demo.title}</Text>
              <Text style={styles.cardHint}>Toque para testar</Text>
            </View>
          </Pressable>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Múltiplos toasts</Text>
          <Pressable
            onPress={() => {
              toast.showInfo("Procurando cartas próximas...", {
                title: "Varrendo...",
              });
              setTimeout(() => {
                toast.showSuccess("Mbappé encontrado na França!", {
                  title: "Carta encontrada!",
                });
              }, 1500);
              setTimeout(() => {
                toast.showReward("Você encontrou 2 cartas lendárias.", {
                  title: "Dupla lendária!",
                });
              }, 3000);
            }}
            style={styles.multiButton}
            android_ripple={{ color: "rgba(255,255,255,0.3)" }}
          >
            <Text style={styles.multiButtonText}>
              Disparar vários toasts
            </Text>
          </Pressable>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Recursos</Text>
          <Text style={styles.featureItem}>• 6 tipos: Success, Error, Warning, Info, Reward, System</Text>
          <Text style={styles.featureItem}>• Barra de progresso e auto-dismiss</Text>
          <Text style={styles.featureItem}>• Botão de ação opcional</Text>
          <Text style={styles.featureItem}>• Vários toasts empilham automaticamente</Text>
          <Text style={styles.featureItem}>• Haptic opcional</Text>
          <Text style={styles.featureItem}>• Dismissível (botão fechar)</Text>
          <Text style={styles.featureItem}>• Rota opcional (navegação ao toque)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  cardHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  multiButton: {
    backgroundColor: colors.toast.info.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  multiButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  features: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 2,
  },
});
