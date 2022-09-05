import { exit } from 'node:process'
import { getBase } from './db'
import { getDataByIco } from './getIco'
import { getDataByName } from './getName'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import fs, { readdirSync } from 'fs'
import http from 'http'
import https from 'https'

dotenv.config()

const staticFldr = 'build'

const getDirectories = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const app = express()
const protocol = process.env.PROTOCOL === 'https' ? 'https' : 'http'
const port = process.env.PORT || '8080'

const privateKey = process.env.PRIVATE_KEY
  ? fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')
  : undefined
const certificate = process.env.CERTIFICATE
  ? fs.readFileSync(process.env.CERTIFICATE, 'utf8')
  : undefined
const credentials = privateKey && certificate ? { key: privateKey!, cert: certificate! } : undefined

const sb = getBase()
if (!sb) exit(1)

getDirectories(staticFldr).forEach(fldr => {
  app.use('/' + fldr, express.static(`${staticFldr}/${fldr}`))
})

app.set('protocol', protocol)
app.set('port', port)
app.set('host', '0.0.0.0')

app.use(express.json())

app.post('/', (req: Request, res: Response) => {
  const ico = req.body.ico
  if (ico) {
    getDataByIco(ico, sb, res)
    return
  }
  const name = req.body.name
  if (name) {
    getDataByName(name, res)
    return
  }
})

app.get('/', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: staticFldr })
})

const server =
  protocol === 'https' && credentials ? https.createServer(credentials!, app) : new http.Server(app)

process.on('uncaughtException', e => {
  server.close()
})
process.on('SIGTERM', () => {
  server.close()
})

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${protocol}://localhost:${port}`)
})
