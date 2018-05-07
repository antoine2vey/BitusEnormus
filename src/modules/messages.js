// @flow
import type { DiscordMessage, QueueValue } from '../types'

class Messages {
  queue: {
    errors: Array<QueueValue>,
    valid: Array<QueueValue>
  }

  constructor(): void {
    this.queue = {
      errors: [],
      valid: [],
    }
  }

  addError({ name, value }: QueueValue): void {
    this.queue.errors = [...this.queue.errors, { name, value }]
  }

  addValid({ name, value }: QueueValue): void {
    this.queue.valid = [...this.queue.valid, { name, value }]
  }

  clearQueue(): void {
    this.queue = {
      errors: [],
      valid: [],
    }
  }

  shouldThrow(): boolean {
    return this.queue.errors.length > 0
  }

  message(message: DiscordMessage, fields: Array<QueueValue>, isError: boolean) {
    message.channel.send({
      embed: {
        color: isError ? 16711680 : 65280,
        author: {
          name: message.author.username,
          icon_url: message.author.avatarURL,
        },
        title: '',
        fields,
        footer: {
          icon_url: message.client.user.avatarURL,
          text: `- ${message.client.user.username}`,
        },
      },
    })
  }

  sendImage(message: DiscordMessage, link: string) {
    return message.channel.send({
      embed: {
        color: 65280,
        author: {
          name: message.client.user.username,
          icon_url: message.client.user.avatarURL,
        },
        title: '',
        fields: [],
        image: {
          url: link,
        },
      },
    })
  }

  send(message: DiscordMessage) {
    if (this.shouldThrow()) {
      this.message(message, this.queue.errors, true)
      return this.clearQueue()
    }

    this.message(message, this.queue.valid, false)
    return this.clearQueue()
  }
}

module.exports = Messages
