export const chkExists = (val: any, inr: Array<string>) => {
  const i = inr[Symbol.iterator]()
  let chk = val
  for (const value of i) {
    chk = chk[value]
    if (typeof chk === 'undefined') return chk
  }
  return chk
}
