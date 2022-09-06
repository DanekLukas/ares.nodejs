import {
  IBase,
  TBase,
  findByICO,
  returnTypeOfCreateModelBase,
  insertOrUpdate,
} from './baseModel'
import { Response } from 'express'
import { Sequelize } from 'sequelize/types'
import { XMLParser } from 'fast-xml-parser'
import { chkExists } from './utils'
import superagent from 'superagent'

export const getBaseByIco = async (ico: string) => {
  const ret = await superagent.get(
    `http://wwwinfo.mfcr.cz/cgi-bin/ares/darv_bas.cgi?ico=${ico}`,
  )
  const parser = new XMLParser()
  const jObj = parser.parse(ret.text)
  const data = chkExists(jObj, ['are:Ares_odpovedi', 'are:Odpoved', 'D:VBAS'])
  if (!data) return undefined
  return {
    ICO: data['D:ICO'].toString() || '',
    DIC: data['D:DIC'] || '',
    OF: data['D:OF'] || '',
    DV: data['D:DV'] || '',
    NPF: chkExists(data, ['D:PF', 'D:NPF']) || '',
    UC: chkExists(data, ['D:AD', 'D:UC']) || '',
    PB: chkExists(data, ['D:AD', 'D:PB']) || '',
    OC: ((oc: Array<any>) => {
      return oc.map((item) => item['D:T'] || '').join('*') || ''
    })(chkExists(data, ['D:Obory_cinnosti', 'D:Obor_cinnosti']) || []),
  }
}
export const getDataByIco = async (
  ico: string,
  sb: { sequelize: Sequelize; base: returnTypeOfCreateModelBase },
  res: Response,
) => {
  let data = ((val: IBase | undefined) => {
    if (!val) return val
    const ret: TBase = {
      ICO: val.ICO,
      DIC: val.DIC,
      OF: val.OF,
      DV: val.DV,
      NPF: val.NPF,
      UC: val.UC,
      PB: val.PB,
      OC: val.OC,
    }
    if (
      Date.now() - Date.parse(val.created.toString()) <
      30 * 24 * 60 * 60 * 1000
    )
      return ret
    return undefined
  })(await findByICO(sb.base, ico))
  if (!data) {
    data = await getBaseByIco(ico)
    if (data) insertOrUpdate(sb.sequelize, data)
  }
  res.send({ data: data, error: 0 })
}
