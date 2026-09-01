import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SelectField } from "@components/SelectField/SelectField";
import { colors } from "@theme/colors";
import { conversionScreenStyles } from "./ConversionScreen.styles";
import { useConversionScreen } from "./useConversionScreen";

export function ConversionScreen() {
  const {
    amount,
    setAmount,
    selectedCrypto,
    setSelectedCrypto,
    selectedFiat,
    setSelectedFiat,
    cryptoOptions,
    fiatOptions,
    formattedResult,
    showPlaceholder,
    showInvalid,
  } = useConversionScreen();

  return (
    <ScrollView
      style={conversionScreenStyles.container}
      contentContainerStyle={conversionScreenStyles.stack}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={conversionScreenStyles.title}>Convert Crypto</Text>

      <View style={conversionScreenStyles.fieldBlock}>
        <Text style={conversionScreenStyles.amountLabel}>Amount</Text>
        <TextInput
          style={conversionScreenStyles.amountInput}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <SelectField
        label="Cryptocurrency"
        options={cryptoOptions}
        value={selectedCrypto}
        onChange={setSelectedCrypto}
      />

      <View style={conversionScreenStyles.arrowWrap}>
        <View style={conversionScreenStyles.arrowCircle}>
          <Ionicons name="arrow-down" size={20} color={colors.textSecondary} />
        </View>
      </View>

      <SelectField
        label="Fiat Currency"
        options={fiatOptions}
        value={selectedFiat}
        onChange={setSelectedFiat}
      />

      <View style={conversionScreenStyles.resultBox}>
        <Text style={conversionScreenStyles.resultLabel}>Converted Amount</Text>
        {showPlaceholder ? (
          <Text style={conversionScreenStyles.resultPlaceholder}>
            Enter an amount
          </Text>
        ) : showInvalid ? (
          <Text style={conversionScreenStyles.resultInvalid}>Invalid amount</Text>
        ) : (
          <Text style={conversionScreenStyles.resultValue}>
            {formattedResult ?? ""}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
