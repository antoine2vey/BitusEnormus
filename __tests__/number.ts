/* eslint-env node, jest */
import NumberValidator from '../src/modules/number';

const numberValidator = new NumberValidator()

describe('Checks for number validation', () => {
  it('expect number passed to be finite', () => {
    expect(numberValidator.isValid).toBeDefined()
    const checker = val => numberValidator.isValid(val)

    expect(checker(40)).toBe(true)
    expect(checker(-40)).toBe(false)
    expect(checker(0)).toBe(true)
    expect(checker(undefined)).toBe(false)
    expect(checker(null)).toBe(false)
    expect(checker(Infinity)).toBe(false)
    expect(checker(10e500)).toBe(false)
    expect(checker('str')).toBe(false)
    expect(checker(true)).toBe(false)
    expect(checker(false)).toBe(false)
  })

  it('expect to validate a given stack', () => {
    expect(numberValidator.isValidStack).toBeDefined()
    const checker = str => numberValidator.isValidStack(str)

    expect(checker('foo')).toBe(false)
    expect(checker('60-20')).toBe(false)
    expect(checker(undefined)).toBe(false)
    expect(checker(null)).toBe(false)
    expect(checker('40-50')).toBe(true)
    expect(checker('40-500')).toBe(false)
    expect(checker('120-50')).toBe(false)
    expect(checker(true)).toBe(false)
    expect(checker('foo-bar')).toBe(false)
  })
})
