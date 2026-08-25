import { Image, Text, TouchableOpacity, View } from "react-native";
import { CartProduct } from "../../../../shared/store/cart-store";
import { FC } from "react";
import { BuildImageUrl } from "../../../../shared/helpers/buildImageUrl";
import { AppPriceText } from "../../../../shared/components/AppPriceText";
import { ProductCartCardView } from "./ProductCartCard.view";
import { useProductCartCardViewModel } from "./useProductCartCard.viewModel";

interface ProductCartCard {
  product: CartProduct;
}

export const ProductCartCard: FC<ProductCartCard> = ({ product }) => {
  const viewModel = useProductCartCardViewModel();

  return <ProductCartCardView product={product} {...viewModel} />;
};
