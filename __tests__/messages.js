/* eslint-env node, jest */
const Messages = require('../src/modules/messages')

const messages = new Messages()

describe('Tests for message system', () => {
  afterEach(() => {
    messages.clearQueue()
  })

  it('expect message queue to be empty at startup', () => {
    expect(messages.queue).toBeDefined()
    expect(messages.queue).toEqual({
      valid: [],
      errors: []
    })
  })

  it('expect to check errors in queue', () => {
    expect(messages.shouldThrow).toBeDefined()
    expect(messages.shouldThrow()).toBe(false)
  })

  it('expect can add valid item to queue', () => {
    expect(messages.addValid).toBeDefined()

    messages.addValid({ name: 'foo', value: 'bar' })
    expect(messages.queue.valid.length).toBe(1)
    expect(messages.queue.errors.length).toBe(0)
    expect(messages.queue.valid[0].name).toBe('foo')
    expect(messages.queue.valid[0].value).toBe('bar')
    expect(messages.shouldThrow()).toBe(false)
  })

  it('expect can add errir item off queue', () => {
    expect(messages.addError).toBeDefined()

    messages.addError({ name: 'foo', value: 'bar' })
    expect(messages.queue.valid.length).toBe(0)
    expect(messages.queue.errors.length).toBe(1)
    expect(messages.queue.errors[0].name).toBe('foo')
    expect(messages.queue.errors[0].value).toBe('bar')
    expect(messages.shouldThrow()).toBe(true)
  })

  it('expect to send messages off queue', () => {
    expect(messages.send).toBeDefined()
  })

  it('expect clearing queue', () => {
    expect(messages.clearQueue).toBeDefined()

    messages.clearQueue()

    expect(messages.queue).toEqual({
      valid: [],
      errors: []
    })
  })
})
