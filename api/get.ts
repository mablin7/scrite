import { NowRequest, NowResponse } from '@now/node'
import faunadb, { query as q } from 'faunadb'

const { FAUNADB_SECRET: secret } = process.env

let client: faunadb.Client | undefined

if (secret) {
  client = new faunadb.Client({ secret })
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    let collections = []

    if (!client) {
      res.status(503).send('Database not available')
      return
    }
    
    await client
      .paginate(q.Collections())
      .map(ref => q.Get(ref))
      .each(page => {
        collections = collections.concat(page)
      })

    res.json({ collections })
  } catch (error) {
    res.status(500).json({ error })
  }
}