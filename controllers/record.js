import { v4 as uuidv4 } from 'uuid'

function createRecord(data = {}) {
  return {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  }
}

function updateRecord(record = {}, update = {}) {
  keys = Object.keys(update)
  for (let i = 0; i < keys.length; i++) {
    record[keys[i]] = update[keys[i]]
  }
  record.updatedAt = new Date().toJSON()
  return record
}

export default { createRecord, updateRecord }
