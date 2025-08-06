import { FeedMessage } from 'gtfs-realtime-bindings';

export default async function handler(req, res) {
    const API_KEY = "DkOQ2I9r9TigGG9qoBLU";
    const GTFS_REALTIME_URL = `https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${API_KEY}`;

    try {
        const response = await fetch(GTFS_REALTIME_URL);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const feed = FeedMessage.decode(uint8Array);
        res.status(200).json(feed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from translinkapi' });
    }

}
