import { Drink } from './drink.model'

/**
 * Interfejs Message reprezentuje strukturę obiektu wiadomości.
 */
export interface Message {
  role: Role;         // Rola nadawcy wiadomości (użytkownik lub asystent)
  content: string;    // Treść wiadomości
  drink?: Drink;      // Opcjonalne informacje o drinku powiązane z wiadomością
}

/**
 * Enum Role definiuje role nadawców wiadomości.
 */
export enum Role {
  User = 'user',          // Rola użytkownika
  Assistant = 'assistant' // Rola asystenta
}
