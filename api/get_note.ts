import { NowRequest, NowResponse } from '@now/node'
import faunadb, { query as q } from 'faunadb'

const { FAUNADB_SECRET: secret } = process.env

let client: faunadb.Client | undefined

if (secret) {
  client = new faunadb.Client({ secret })
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    let title
    if (req.body.title) {
      title = req.body.title
    } else {
      let url = new URL(req.url, `http://${req.headers.host}`)
      if (url.searchParams.has('title')) {
        title = url.searchParams.get('title')
      } else {
        res.status(400).json({ error: 'Provide a note title!' })
        return
      }
    }

    if (!client) {
      res.status(500).json({ error: 'Database not available' })
      return
    }

    let notes = []
    await client
      .paginate(q.Match(q.Index('notes_by_title'), title))
      .map(ref => q.Get(ref))
      .each(page => { notes = notes.concat(page) } )
    
    if (notes.length === 0) {
      res.status(404).json({ error: 'Note not found!' })
      return
    }

    res.json(notes[0].data)
  } catch (error) {
    res.status(500).json({ error })
  }
}