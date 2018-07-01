export type dPhoto = {
  id: string
  link: string
}

export type dBank = {
  id: string
  belongs_to: dUser
  amount: number
  last_set: Date
  last_get: Date
}

export type dFirst = {
  id: string
  guild_id: string
  has_done_first: boolean
}

export type dUser = {
  id: string
  user_id: string
  guild_id: string
  username: string
  kebabs: number
  bank: dBank
  robbed_at: Date
  created_at: Date
  updated_at: Date
  first_count: number
}