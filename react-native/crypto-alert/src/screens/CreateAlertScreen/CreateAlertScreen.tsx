import { ScrollView, Text, TextInput, View } from "react-native";
import { ConditionOptionRow } from "@components/ConditionOptionRow/ConditionOptionRow";
import { PrimaryButton } from "@components/PrimaryButton/PrimaryButton";
import { ScreenHeader } from "@components/ScreenHeader/ScreenHeader";
import { SelectField } from "@components/SelectField/SelectField";
import { colors } from "@theme/colors";
import { createAlertScreenStyles } from "./CreateAlertScreen.styles";
import { useCreateAlertScreen } from "./useCreateAlertScreen";

export function CreateAlertScreen() {
  const {
    selectedCrypto,
    setSelectedCrypto,
    targetPrice,
    setTargetPrice,
    condition,
    setCondition,
    errors,
    handleSave,
    goBack,
    isFormValid,
    cryptoOptions,
  } = useCreateAlertScreen();

  return (
    <ScrollView
      style={createAlertScreenStyles.container}
      contentContainerStyle={createAlertScreenStyles.stack}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Create Alert" onBack={goBack} />

      <View>
        <SelectField
          label="Cryptocurrency"
          placeholder="Select cryptocurrency"
          options={cryptoOptions}
          value={selectedCrypto}
          onChange={setSelectedCrypto}
        />
        {errors.crypto ? (
          <Text style={createAlertScreenStyles.errorText}>{errors.crypto}</Text>
        ) : null}
      </View>

      <View>
        <Text style={createAlertScreenStyles.label}>Target Price (USD)</Text>
        <View style={createAlertScreenStyles.fieldBlock}>
          <View style={createAlertScreenStyles.priceRow}>
            <Text style={createAlertScreenStyles.currency}>$</Text>
            <TextInput
              style={createAlertScreenStyles.priceInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
        {errors.price ? (
          <Text style={createAlertScreenStyles.errorText}>{errors.price}</Text>
        ) : null}
      </View>

      <View>
        <Text style={createAlertScreenStyles.conditionLabel}>Alert Condition</Text>
        <View style={createAlertScreenStyles.conditionStack}>
          <ConditionOptionRow
            value="above"
            selected={condition === "above"}
            title="Above target price"
            subtitle="Alert when price goes above"
            variant="above"
            onSelect={setCondition}
          />
          <ConditionOptionRow
            value="below"
            selected={condition === "below"}
            title="Below target price"
            subtitle="Alert when price goes below"
            variant="below"
            onSelect={setCondition}
          />
        </View>
      </View>

      <PrimaryButton
        label="Save Alert"
        onPress={handleSave}
        disabled={!isFormValid}
        fullWidth
      />
    </ScrollView>
  );
}
