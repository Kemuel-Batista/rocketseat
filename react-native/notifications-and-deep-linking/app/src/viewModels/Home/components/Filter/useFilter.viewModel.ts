import { useState } from "react";
import { useDebounce } from "../../../../shared/hooks/useDebounde";
import { useGetProductCategoriesQuery } from "../../../../shared/queries/product/use-get-product-categories";
import { useBottomSheetStore } from "../../../../shared/store/bottomsheet-store";
import { useFilterStore } from "../../../../shared/store/use-filter-store";

export const useFilterViewModel = () => {
  const { data: productsCategory, isLoading } = useGetProductCategoriesQuery();

  const {
    updateFilter,
    filterState,
    applyFilters,
    appliedFilterState,
    resetFilter,
  } = useFilterStore();
  const { close } = useBottomSheetStore();
  const handleValueMaxChange = (value: number) => {
    updateFilter({ key: "valueMax", value });
  };
  console.log(appliedFilterState);
  const handleValueMinChange = (value: number) => {
    updateFilter({ key: "valueMin", value });
  };

  const handleCategoryToglle = (categoryId: number) => {
    const categoryAlredyInArray =
      filterState.selectedCategories.includes(categoryId);

    if (categoryAlredyInArray) {
      updateFilter({
        key: "selectedCategories",
        value: filterState.selectedCategories.filter((id) => id !== categoryId),
      });
    } else {
      updateFilter({
        key: "selectedCategories",
        value: [...filterState.selectedCategories, categoryId],
      });
    }
  };

  const handleApplyFilters = () => {
    applyFilters();
    close();
  };

  const handleResetFilter = () => {
    close();
    resetFilter();
  };
  return {
    productsCategory,
    isLoading,
    handleCategoryToglle,
    handleValueMaxChange,
    handleValueMinChange,
    selectedCategories: filterState.selectedCategories,
    handleApplyFilters,
    handleResetFilter,
  };
};
