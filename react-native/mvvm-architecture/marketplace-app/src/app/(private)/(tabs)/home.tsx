import { HomeView } from '@/view-models/home/home.view'
import { useHomeViewModel } from '@/view-models/home/use-home.view-model'
import React from 'react'

export default function Home() {
  const viewModel = useHomeViewModel()

  return <HomeView {...viewModel} />
}
