import { NowRequest, NowResponse } from '@now/node'
import { query as q, Client } from 'faunadb'
import json from 'big-json'

const { FAUNADB_SECRET: secret } = process.env

let client: Client | undefined

if (secret) {
  client = new Client({ secret })
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    if (!client) {
      res.status(500).json({ error: 'Database not available' })
      return
    }
    
    let { title = undefined } = req.body || {}
    let url = new URL(req.url, `http://${req.headers.host}`)
    if (url.searchParams.has('title'))
      title = url.searchParams.get('title')

    if (!title) {
      res.status(400).json({ error: 'Provide a note title!' })
      return
    }

    if (!client) {
      res.status(505).json({ error: 'Database not available' })
      return
    }

    let notes = []
    await client
      .paginate(q.Match(q.Index('notes_by_title'), title))
      .map(ref => q.Get(ref))
      .each(page => { notes = notes.concat(page) } )
    
    if (notes.length === 0) {
      await client.query(
        q.Create(
          q.Collection('notes'),
          { data: { title: title, content: '' } }
        )
      )
  
      res.json({ title, content: '' })
    } else {
      let data = notes[0].data
      function compare(a, b) {
        if (a.chunkIdx < b.chunkIdx) {
          return -1;
        }
        if (a.chunkIdx > b.chunkIdx) {
          return 1;
        }
        return 0;
      }      
      data.content.sort(compare)
      let content = data.content.reduce((acc, val) => acc+val.chunk, '')
      res.json({ title: data.title, content })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}