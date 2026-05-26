export type Category =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'pet'
  | 'other'

export interface Expense {
  id: string
  description: string
  amount: number
  category: Category
  date: string // 'YYYY-MM-DD'
}
