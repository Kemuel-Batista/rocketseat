import { FC } from "react";
import { CreditCard } from "../../../../shared/interfaces/credit-card";
import { CartFooterView } from "./CartFooter.view";
import { useCartFooterViewModel } from "./useCartFooter.viewModel";

export interface CartFooterParams {
  openCartBottomSheet: () => void;
  creditCards: CreditCard[];
  loadingCreditCards: boolean;
}

export const CartFooter: FC<CartFooterParams> = ({
  openCartBottomSheet,
  creditCards,
  loadingCreditCards,
}) => {
  const viewModel = useCartFooterViewModel();

  return (
    <CartFooterView
      creditCards={creditCards}
      loadingCreditCards={loadingCreditCards}
      openCartBottomSheet={openCartBottomSheet}
      {...viewModel}
    />
  );
};
