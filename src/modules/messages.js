// @flow
import type { Message, RichEmbed } from 'discord.js'

type QueueMessage = {
  name: string,
  value: string
}

class Messages {
  ERROR_COLOR: number
  SUCCESS_COLOR: number
  queue: {
    errors: Array<QueueMessage>,
    valid: Array<QueueMessage>
  }

  constructor(): void {
    this.queue = {
      errors: [],
      valid: []
    }
    this.ERROR_COLOR = 16711680
    this.SUCCESS_COLOR = 65280
  }

  addError({ name, value }: QueueMessage): void {
    this.queue.errors = [...this.queue.errors, { name, value }]
  }

  addValid({ name, value }: QueueMessage): void {
    this.queue.valid = [...this.queue.valid, { name, value }]
  }

  clearQueue(): void {
    this.queue = {
      errors: [],
      valid: []
    }
  }

  shouldThrow(): boolean {
    return this.queue.errors.length > 0
  }

  default(
    message: Message,
    fields: Array<QueueMessage>,
    isError: boolean = false
  ): RichEmbed | any {
    this.clearQueue()

    return {
      color: isError ? this.ERROR_COLOR : this.SUCCESS_COLOR,
      author: {
        name: message.author.username,
        icon_url: message.author.avatarURL
      },
      title: '',
      fields,
      footer: {
        icon_url: message.client.user.avatarURL,
        text: `- ${message.client.user.username}`
      }
    }
  }

  getImage(message: Message, link: string): RichEmbed | any {
    return {
      color: this.SUCCESS_COLOR,
      author: {
        name: message.client.user.username,
        icon_url: message.client.user.avatarURL
      },
      title: '',
      fields: [],
      image: {
        url: link
      }
    }
  }

  get(message: Message): RichEmbed | any {
    if (this.shouldThrow()) {
      return this.default(message, this.queue.errors, true)
    }

    return this.default(message, this.queue.valid, false)
  }
}

module.exports = Messages
