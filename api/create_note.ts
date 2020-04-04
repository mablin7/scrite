import { NowRequest, NowResponse } from '@now/node'
import faunadb, { query as q } from 'faunadb'
import { nanoid } from 'nanoid'

const { FAUNADB_SECRET: secret } = process.env

let client: faunadb.Client | undefined

if (secret) {
  client = new faunadb.Client({ secret })
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    if (!client) {
      res.status(500).json({ error: 'Database not available' })
      return
    }
    
    let { title = undefined, content = '' } = req.body

    let is_id_free = false
    do {
      title = nanoid()
      is_id_free = await client.query(
        q.IsEmpty(q.Match(q.Index('notes_by_title'), title))
      )
    } while (!is_id_free)
    
    await client.query(
      q.Create(
        q.Collection('notes'),
        { data: { title: title, content } }
      )
    )

    res.json({ title })
  } catch (error) {
    res.status(500).json({ error })
  }
}