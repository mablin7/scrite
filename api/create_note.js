import faunadb, { query as q } from 'faunadb';
import { nanoid } from 'nanoid';
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
        let { req_title = nanoid(), content = '' } = req.body || {};
        let url = new URL(req.url, `http://${req.headers.host}`);
        if (url.searchParams.has('title'))
            req_title = url.searchParams.get('title');
        let title, is_id_free = false;
        do {
            title = title ? req_title : nanoid();
            is_id_free = await client.query(q.IsEmpty(q.Match(q.Index('notes_by_title'), title)));
        } while (!is_id_free);
        await client.query(q.Create(q.Collection('notes'), { data: { title: title, content } }));
        res.json({ title });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
