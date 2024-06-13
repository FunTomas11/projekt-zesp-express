import { Drink } from './drink.model'

export interface Message {
  role: Role;
  content: string;
  drink?: Drink;
}

export enum Role {
  User = 'user',
  Assistant = 'assistant'
}
