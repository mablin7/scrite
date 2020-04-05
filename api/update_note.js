import faunadb, { query as q } from 'faunadb';
const { FAUNADB_SECRET: secret } = process.env;
let client;
if (secret) {
    client = new faunadb.Client({ secret });
}
export default async (req, res) => {
    try {
        if (!client) {
            res.status(500).json({ error: 'Database not available' });
            return;
        }
        let { title = undefined, content = undefined } = req.body || {};
        let url = new URL(req.url, `http://${req.headers.host}`);
        if (url.searchParams.has('title'))
            title = url.searchParams.get('title');
        if (url.searchParams.has('content'))
            content = url.searchParams.get('content');
        if (!title || !content) {
            res.status(400).json({ error: 'Provide title and new content' });
            return;
        }
        let notes = [];
        await client
            .paginate(q.Match(q.Index('notes_by_title'), title))
            .each(page => { notes = notes.concat(page); });
        if (notes.length === 0) {
            res.status(404).json({ error: 'Note not found!' });
            return;
        }
        await client.query(q.Update(notes[0], { data: { content } }));
        res.status(200).send('');
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
