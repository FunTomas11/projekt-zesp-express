export interface Message {
  role: Role;
  content: string;
}

export enum Role {
  User = 'user',
  Assistant = 'assistant'
}
