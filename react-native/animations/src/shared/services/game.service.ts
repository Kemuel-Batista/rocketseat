import {
  Challenge,
  GameState,
  type GameResult,
  type StoreCard,
} from '../utils/challenge'
import { CardService } from './card.service'

export class GameService {
  static initializeGame(challenge: Challenge): GameState {
    const cards = CardService.generateCards(challenge)
    return {
      status: 'countdown',
      challenge,
      cards,
      selectedCards: [],
      timeRemaining: challenge.timeLimit,
      timeElapsed: 0,
      startedAt: null,
    }
  }

  static startGame(gameState: GameState): GameState {
    return {
      ...gameState,
      status: 'playing',
      startedAt: new Date(),
    }
  }

  static isGameCompleted(cards: StoreCard[]): boolean {
    return cards.every((card) => card.isMatched)
  }

  static selectCard(
    gameState: GameState,
    cardId: string,
  ): {
    newState: GameState
    action: 'flip' | 'match' | 'mismatch' | 'invalid'
  } {
    const { cards, selectedCards, status } = gameState

    if (status !== 'playing') {
      return { newState: gameState, action: 'invalid' }
    }

    const card = cards.find((card) => card.id === cardId)

    if (!card || card.isMatched || card.isFlipped) {
      return { newState: gameState, action: 'invalid' }
    }

    if (selectedCards.length >= 2) {
      return { newState: gameState, action: 'invalid' }
    }

    const updatedCards = cards.map((card) => {
      if (card.id === cardId) {
        return CardService.flipCard(card, true)
      } else {
        return card
      }
    })

    const newSelectedCards = [...selectedCards, card]

    if (newSelectedCards.length === 1) {
      return {
        newState: {
          ...gameState,
          cards: updatedCards,
          selectedCards: newSelectedCards,
        },
        action: 'flip',
      }
    }

    const [firstCard, secondCard] = newSelectedCards

    const isMatch = firstCard.name === secondCard.name

    if (isMatch) {
      const finalCards = updatedCards.map((card) => {
        if (card.id === firstCard.id || card.id === secondCard.id) {
          return CardService.markAsMatched(card)
        } else {
          return card
        }
      })

      const isCompleted = this.isGameCompleted(finalCards)

      return {
        newState: {
          ...gameState,
          cards: finalCards,
          selectedCards: [],
          status: isCompleted ? 'finished' : 'playing',
        },
        action: 'match',
      }
    } else {
      return {
        newState: {
          ...gameState,
          cards: updatedCards,
          selectedCards: newSelectedCards,
        },
        action: 'mismatch',
      }
    }
  }

  static resetMismatchedCards(gameState: GameState): GameState {
    const { cards, selectedCards } = gameState

    const updatedCards = cards.map((card) => {
      const isSelected = selectedCards.some(({ id }) => card.id === id)
      if (isSelected && !card.isMatched) {
        return CardService.flipCard(card, false)
      } else {
        return card
      }
    })

    return {
      ...gameState,
      cards: updatedCards,
      selectedCards: [],
    }
  }

  static pauseGame(gameState: GameState): GameState {
    return {
      ...gameState,
      status: 'paused',
    }
  }

  static resumeGame(gameState: GameState): GameState {
    return {
      ...gameState,
      status: 'playing',
    }
  }

  static resetGame(challenge: Challenge): GameState {
    return this.initializeGame(challenge)
  }

  static tick(gameState: GameState): GameState {
    if (gameState.status !== 'playing') {
      return gameState
    }

    const timeRemaining = Math.max(0, gameState.timeRemaining - 1)
    const timeElapsed = gameState.timeElapsed + 1

    return {
      ...gameState,
      timeElapsed,
      timeRemaining,
      status: timeRemaining === 0 ? 'timeout' : gameState.status,
    }
  }

  static finishGame(gameState: GameState): GameResult | null {
    if (!gameState.challenge) {
      return null
    }

    return {
      completed: gameState.status === 'finished',
      timeElapsed: gameState.timeElapsed,
      challenge: gameState.challenge,
    }
  }

  static previewAllCards(cards: StoreCard[]): StoreCard[] {
    return cards.map((card) => CardService.flipCard(card, true))
  }

  static hideAllCards(cards: StoreCard[]): StoreCard[] {
    return cards.map((card) => CardService.flipCard(card, false))
  }
}
