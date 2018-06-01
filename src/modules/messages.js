// @flow
import type { Message } from 'discord.js'

type QueueMessage = {
  name: string,
  value: string
}

class Messages {
  queue: {
    errors: Array<QueueMessage>,
    valid: Array<QueueMessage>
  }

  constructor(): void {
    this.queue = {
      errors: [],
      valid: []
    }
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

  message(message: Message, fields: Array<any>, isError: boolean): void {
    message.channel.send({
      embed: {
        color: isError ? 16711680 : 65280,
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
    })
  }

  sendImage(message: Message, link: string): void {
    message.channel.send({
      embed: {
        color: 65280,
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
    })
  }

  send(message: Message): void {
    if (this.shouldThrow()) {
      this.message(message, this.queue.errors, true)
    } else {
      this.message(message, this.queue.valid, false)
    }

    this.clearQueue()
  }
}

module.exports = Messages
