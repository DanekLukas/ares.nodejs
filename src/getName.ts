import { Response } from 'express'
import { XMLParser } from 'fast-xml-parser'
import { chkExists } from './utils'
import { encode } from 'iconv-lite'
import superagent from 'superagent'

export type Tnames = { name: string; addr: string; ico: string }

export const getDataByName = async (name: string, res: Response) => {
  try {
    const buf = encode(name, 'us-ascii')
    const ret = await superagent.get(
      `http://wwwinfo.mfcr.cz/cgi-bin/ares/ares_es.cgi?obch_jm=${buf}&maxpoc=1000`,
    )
    if (!ret) {
      res.send({ data: 'no data', error: '-1' })
      return
    }
    const parser = new XMLParser()
    const jObj = parser.parse(ret.text)
    const fst = 'are:Ares_odpovedi'
    const scn = 'are:Odpoved'
    const pct = 'dtt:Pocet_zaznamu'
    const trd = 'dtt:V'
    const frt = 'dtt:S'
    const err = 'dtt:Error'
    const erk = 'dtt:Error_kod'
    const ert = 'dtt:Error_text'
    const ndt = 'no data'
    const prb = 'problém'

    const getValFromData = (data: any): Tnames => {
      return {
        name: data['dtt:ojm'],
        addr: data['dtt:jmn'],
        ico: data['dtt:ico'],
      }
    }

    const error =
      chkExists(jObj, [fst, scn, trd]) === undefined
        ? chkExists(jObj, [fst, scn, err, erk]) || '-1'
        : '0'
    const text =
      chkExists(jObj, [fst, scn]) && chkExists(jObj, [fst, scn, pct]) === 0
        ? ndt
        : chkExists(jObj, [fst, scn, err, erk, ert]) || prb

    res.send({
      data:
        error === '0'
          ? ((inp: Array<any>): Array<Tnames> => {
              const ret: Array<Tnames> = []
              inp.forEach((itm) => {
                const val = Array.isArray(itm[frt]) ? itm[frt] : [itm[frt]]
                val.forEach((data: any) => ret.push(getValFromData(data)))
              })
              return ret
            })(
              ((data: Array<any> | any) => {
                return Array.isArray(data) ? data : [data]
              })(jObj[fst][scn][trd]),
            )
          : text,
      error: error,
    })
  } catch (e) {
    res.send({ data: 'chyba', error: '-1' })
    return
  }
}
