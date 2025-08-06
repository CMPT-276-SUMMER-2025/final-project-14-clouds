export default async function handler(req, res) {
    const API_KEY = "DkOQ2I9r9TigGG9qoBLU";
    const GTFS_REALTIME_URL = `https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${API_KEY}`;
    const url = req.body.url + API_KEY;
    console.log("data:", req.body);
    console.log("url", url);
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: url });
    }

}
