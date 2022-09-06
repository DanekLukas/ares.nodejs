import { DataTypes, QueryTypes, Sequelize } from 'sequelize'
import { getBaseByIco } from './getIco'

export type returnTypeOfCreateModelBase = ReturnType<typeof createModelBase>
export type TBase = {
  ICO: string
  DIC: string
  OF: string
  DV: string
  NPF: string
  UC: string
  PB: string
  OC: string
}
export type IBase = { id: number; created: Date } & TBase

export const createModelBase = (sequelize: Sequelize) => {
  return sequelize.define(
    'base',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('current_timestamp'),
      },
      ICO: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '',
        unique: 'ICO',
      },
      DIC: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '',
      },
      OF: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      DV: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      NPF: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      UC: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      PB: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      OC: {
        type: DataTypes.STRING(10000),
        allowNull: false,
        defaultValue: '',
      },
    },
    {
      tableName: 'base',
      timestamps: false,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'ICO',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'ICO' }],
        },
      ],
    },
  )
}

export const findByICO = async (
  base: returnTypeOfCreateModelBase,
  ico: string,
) => {
  const res = await base.findOne({ where: { ICO: ico } })
  if (!res) return undefined
  return res!.get() as IBase
}

export const findAll = async (
  base: returnTypeOfCreateModelBase,
  limit?: number,
  offset?: number,
) => {
  base.findAll({ limit: limit || 10, offset: offset || 0 })
}

export const insert = async (
  base: returnTypeOfCreateModelBase,
  data: TBase,
) => {
  await base.create({
    ICO: data.ICO,
    DIC: data.DIC,
    OF: data.OF,
    DV: data.DV,
    NPF: data.NPF,
    UC: data.UC,
    PB: data.PB,
    OC: data.OC,
  })
}

export const update = async (
  base: returnTypeOfCreateModelBase,
  data: IBase,
) => {
  await base.update(
    {
      created: Date(),
      ICO: data.ICO,
      DIC: data.DIC,
      OF: data.OF,
      DV: data.DV,
      NPF: data.NPF,
      UC: data.UC,
      PB: data.PB,
      OC: data.OC,
    },
    { where: { id: data.id } },
  )
}
// sequelize.query(
//   'SELECT * FROM students WHERE student_id = ?',
//   {
//     replacements: ['REPLACE_STUDENT_ID'],
//     type: sequelize.QueryTypes.SELECT
//   }
// )

export const insertOrUpdate = async (sequelize: Sequelize, data: TBase) => {
  await sequelize.query(
    'INSERT INTO base (ICO, DIC, OF, DV, NPF, UC, PB, OC) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE created=NOW(), DIC=?, OF=?, DV=?, NPF=?, UC=?, PB=?, OC=?;',
    {
      replacements: [
        data.ICO,
        data.DIC,
        data.OF,
        data.DV,
        data.NPF,
        data.UC,
        data.PB,
        data.OC,
        data.DIC,
        data.OF,
        data.DV,
        data.NPF,
        data.UC,
        data.PB,
        data.OC,
      ],
      type: QueryTypes.INSERT,
    },
  )
}
