import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme/colors";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { EmptyState } from "../EmptyState/EmptyState";
import { selectFieldStyles } from "./SelectField.styles";
import type { SelectOption } from "./useSelectField";
import { useSelectField } from "./useSelectField";

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectField({
  label,
  placeholder = "Select",
  options,
  value,
  onChange,
}: SelectFieldProps) {
  const { modalVisible, open, close, displayLabel, selectItem } =
    useSelectField({ options, value, onChange });

  return (
    <View>
      <Text style={selectFieldStyles.label}>{label}</Text>
      <Pressable
        onPress={open}
        style={selectFieldStyles.field}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={selectFieldStyles.fieldInner}>
          <Text
            style={[
              selectFieldStyles.fieldText,
              !value ? selectFieldStyles.fieldTextPlaceholder : null,
            ]}
            numberOfLines={1}
          >
            {value ? displayLabel : placeholder}
          </Text>
          <Ionicons
            name="chevron-down"
            size={22}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={close}
        testID="select-field-modal"
      >
        <View style={selectFieldStyles.modalRoot}>
          <Pressable
            style={selectFieldStyles.modalBackdrop}
            onPress={close}
            accessibilityLabel="Close"
          />
          <View style={selectFieldStyles.modalSheet}>
            <Text style={selectFieldStyles.modalTitle}>{label}</Text>
            <FlatList
              style={selectFieldStyles.optionList}
              data={options}
              testID="select-field-list"
              keyExtractor={(item) => item.value}
              ListEmptyComponent={
                <EmptyState
                  icon={
                    <Ionicons
                      name="search"
                      size={32}
                      color={colors.iconMuted}
                    />
                  }
                  title="No options found"
                  description="There are no options to display at the moment."
                />
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => selectItem(item.value)}
                  style={[
                    selectFieldStyles.optionRow,
                    item.value === value
                      ? selectFieldStyles.optionRowSelected
                      : null,
                  ]}
                >
                  <Text style={selectFieldStyles.optionTitle}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text style={selectFieldStyles.optionSubtitle}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
