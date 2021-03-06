class NumberValidation {
  private validateStack(str: string): boolean {
    if (!str || !(typeof str === 'string')) {
      return false
    }

    const tmp = str.split('-')
    const min = parseInt(tmp[0], 10)
    const max = parseInt(tmp[1], 10)

    if (tmp.length !== 2 || min > max) {
      return false
    }

    if (this.isValid(min) && this.isValid(max) && max <= 100) {
      return true
    }

    return false
  }

  public isValid(val: any): boolean {
    val = parseInt(val, 10)

    if (typeof val !== 'number' || isNaN(val)) {
      return false
    }

    return val >= 0 && Number.isFinite(val)
  }

  public isValidStack(str: string): boolean {
    return this.validateStack(str)
  }
}

export default NumberValidation
