import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { TouchableOpacity } from "react-native";
import { colors } from "../../../../../../styles/colors";

interface StarsParams {
  rating: number;
  handleRatingChange: (rating: number) => void;
}

export const Stars: FC<StarsParams> = ({ rating, handleRatingChange }) => {
  return Array.from({ length: 5 }, (_, index) => {
    const starNumber = index + 1;
    const isSelected = starNumber <= rating;

    return (
      <TouchableOpacity
        key={`rating-star-${starNumber}`}
        onPress={() => handleRatingChange(starNumber)}
      >
        <Ionicons
          size={32}
          name={isSelected ? "star" : "star-outline"}
          color={isSelected ? colors["purple-base"] : colors.gray["200"]}
        />
      </TouchableOpacity>
    );
  });
};
