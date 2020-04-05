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

    // var body = ''
    const parseStream = json.createParseStream()
    req.pipe(parseStream)
    // req.on('readable', () => {
    //   body += req.read()
    //   console.log('in read', body.length);
    //   // console.log(body);
    // })

    var obj = await new Promise(function(resolve, reject) {
      parseStream.on('data', (data) => resolve(data))
    })
    // console.log(body);
    // console.log('after end', body.length);

    var title, content
    try {
      // let obj = JSON.parse(body) || {}
      // console.log(~~obj, Object.keys(obj));
      //@ts-ignore
      content = obj.content
      //@ts-ignore
      title = obj.title
      // console.log(body);
    } catch (e) {
      console.error(e)
    }

    let url = new URL(req.url, `http://${req.headers.host}`)
    if (url.searchParams.has('title'))
      title = url.searchParams.get('title')
    if (url.searchParams.has('content'))
      content = url.searchParams.get('content')
    
    if (!title || !content) {
      res.status(400).json({ error: 'Provide title and new content' })
      return
    }

    let notes = []
    await client
      .paginate(q.Match(q.Index('notes_by_title'), title))
      .each(page => { notes = notes.concat(page) } )
    
    if (notes.length === 0) {
      res.status(404).json({ error: 'Note not found!' })
      return
    }
    let chunks = content.match(/.{1,10000}/g)
    // chunks = chunks.slice(3) 

    await client.query(
      q.Update(notes[0], { data: { content: [] } })
    )
    
    let idx = 0
    for (let chunk of chunks) {
      await client.query(
        q.Call(q.Function('append'), title, [{ chunkIdx: idx, chunk }])
        // q.Update(notes[0], { data: { content: [] } })
      )
      idx += 1
    }

    res.status(200).send('')
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
}