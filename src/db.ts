import { Sequelize } from 'sequelize'
import { createModelBase } from './baseModel'

export const getBase = () => {
  if (!process.env.MYSQL_DB_DATABASE || !process.env.MYSQL_DB_USER) return

  const sequelize = new Sequelize(
    process.env.MYSQL_DB_DATABASE,
    process.env.MYSQL_DB_USER,
    process.env.MYSQL_DB_PASSWORD,
    {
      host: process.env.MYSQL_DB_HOST,
      dialect: 'mysql',
    }
  )

  const base = createModelBase(sequelize)

  sequelize.authenticate()

  return { sequelize, base }
}
