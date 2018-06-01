// @flow

export type dPhoto = {
  id: string,
  link: string
}

export type dBank = {
  id: string,
  belongs_to: string | dUser,
  amount: number,
  last_set: Date,
  last_get: Date
}

export type dFirst = {
  id: string,
  guild_id: string,
  has_done_first: boolean
}

export type dUser = {
  id: string,
  user_id: string,
  guild_id: string,
  username: string,
  kebabs: number,
  bank: string | dBank,
  robbet_at: Date,
  created_at: Date,
  updated_at: Date,
  first_count: number
}
