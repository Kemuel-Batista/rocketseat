import { Text, View, Pressable } from "react-native";
import type { Cryptocurrency } from "@data/cryptoData";
import { formatChange, formatPrice } from "@utils/index";
import { cryptoCardStyles } from "./CryptoCard.styles";
import { useCryptoCard } from "./useCryptoCard";
import { Image } from "expo-image";
interface CryptoCardProps {
  crypto: Cryptocurrency;
}

export function CryptoCard({ crypto }: CryptoCardProps) {
  const { isPositive, hasAlert, alertsForCrypto, expanded, toggleExpanded } =
    useCryptoCard(crypto);

  return (
    <View style={cryptoCardStyles.card}>
      <View style={cryptoCardStyles.row}>
        <View style={cryptoCardStyles.left}>
          <View style={cryptoCardStyles.avatar}>
            {crypto.image && <Image source={{ uri: crypto.image }} style={cryptoCardStyles.avatarImage} />}
            {!crypto.image && <Text style={cryptoCardStyles.avatarLetter}>
              {crypto.symbol.charAt(0)}
            </Text>}
          </View>
          <View>
            <Text style={cryptoCardStyles.name}>{crypto.name}</Text>
            <Text style={cryptoCardStyles.symbol}>{crypto.symbol}</Text>
            {hasAlert && (
              <Pressable
                onPress={toggleExpanded}
                style={cryptoCardStyles.alertBadge}
                accessibilityRole="button"
                accessibilityLabel="Toggle alerts for this cryptocurrency"
              >
                <View style={cryptoCardStyles.alertHeaderRow}>
                  <Text style={cryptoCardStyles.alertBadgeText}>
                    {alertsForCrypto.length === 1
                      ? "1 alert"
                      : `${alertsForCrypto.length} alerts`}
                  </Text>
                  <Text
                    style={[
                      cryptoCardStyles.alertBadgeText,
                      expanded
                        ? cryptoCardStyles.alertChevronExpanded
                        : cryptoCardStyles.alertChevron,
                    ]}
                  >
                    ›
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
        <View style={cryptoCardStyles.right}>
          <Text style={cryptoCardStyles.price}>
            ${formatPrice(crypto.price)}
          </Text>
          <Text
            style={
              isPositive
                ? cryptoCardStyles.changePositive
                : cryptoCardStyles.changeNegative
            }
          >
            {formatChange(crypto.change24h)}
          </Text>
        </View>
      </View>
      {hasAlert && expanded && (
        <View style={cryptoCardStyles.alertList}>
          {alertsForCrypto.map((alert) => (
            <View key={alert.id} style={cryptoCardStyles.alertItemRow}>
              <Text style={cryptoCardStyles.alertItemTitle}>
                {alert.condition === "above" ? "Above" : "Below"} target
              </Text>
              <Text style={cryptoCardStyles.alertItemValue}>
                ${formatPrice(alert.targetPrice)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
