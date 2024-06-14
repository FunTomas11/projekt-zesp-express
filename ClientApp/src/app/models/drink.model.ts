/**
 * Interfejs Drink reprezentuje strukturę obiektu drinka.
 */
export interface Drink {
  name: string;          // Nazwa drinka
  ingredients: string[]; // Lista składników drinka
  recipe: string;        // Przepis na przygotowanie drinka
  image?: string;        // Opcjonalny URL do obrazu drinka
}
