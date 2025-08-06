export default async function handler(req, res) {
    const API_KEY = "DkOQ2I9r9TigGG9qoBLU";
    const GTFS_REALTIME_URL = `https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${API_KEY}`;

    try {
      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch data from translinkapi' });
    }

}
