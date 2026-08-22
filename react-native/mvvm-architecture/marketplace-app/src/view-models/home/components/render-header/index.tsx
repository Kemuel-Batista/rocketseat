import React, { memo } from 'react'
import { HomeHeader } from '../header'
import { SearchInput } from '../search-input'

export const RenderHeader = memo(
  ({
    searchInputText,
    setSearchInputText,
  }: {
    searchInputText: string
    setSearchInputText: (text: string) => void
  }) => (
    <>
      <HomeHeader />
      <SearchInput
        inputValue={searchInputText}
        setSearchInputText={setSearchInputText}
      />
    </>
  ),
)
