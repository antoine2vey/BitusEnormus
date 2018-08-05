import { ObjectID } from 'bson'

export type dPhoto = {
  id: ObjectID
  link: string
}

export type dBank = {
  id: ObjectID
  belongs_to: dUser
  amount: number
  last_set: Date
  last_get: Date
}

export type dFirst = {
  id: ObjectID
  guild_id: string
  has_done_first: boolean
}

export type dUser = {
  id: ObjectID
  user_id: string
  guild_id: string
  username: string
  money: number
  bank: dBank
  robbed_at: Date
  created_at: Date
  updated_at: Date
  first_count: number
  social_score: number
}

export type Photo = {
  id: ObjectID
  link: string
}
