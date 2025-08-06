export default async function handler(req, res) {
    const API_KEY = "DkOQ2I9r9TigGG9qoBLU";
    const url = req.body; 

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from translinkapi' });
    }

}