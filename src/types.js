// @flow

export type Snowflake = string
export type DiscordEmote = {
  id: Snowflake
}
export type QueueValue = {
  name: string,
  value: string
}

export type DiscordUser = {
  id: Snowflake,
  username: string,
  avatarURL: string
}

export type DiscordGuild = {
  id: Snowflake
}

export type DiscordMessage = {
  channel: {
    send(object: {
      embed: {
        color?: number,
        author?: {
          name: string,
          icon_url: string
        },
        title?: string,
        fields?: Array<QueueValue>,
        footer?: {
          icon_url: string,
          text: string
        },
        image?: {
          url: string
        }
      } 
    }): void
  },
  author: DiscordUser,
  client: {
    user: DiscordUser
  }
}