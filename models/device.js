import { JSONPreset } from 'lowdb/node'

const dbFile = './db.json'
const dbDefault = { device: {}, client: {} }
const db = await JSONPreset(dbFile, dbDefault)
db.data = dbDefault
db.write()

export default db
