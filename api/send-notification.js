import notificationapi from 'notificationapi-node-server-sdk';


notificationapi.init(
  'swb4o3lvct1xlz34ep6xeq8e4m', //client id
  'wq2nkrv7zdema0as9t8v0isdfg3xlhlxal8ixtn74bbi214iuicjm4hbiu', //client secret
  {
    baseURL: 'https://api.ca.notificationapi.com'
  }
);

export default async function handler(req, res) {

  const data = req.body;
  console.log('Received data:', data);
  if (data.trackingid) {
    try {
      const result = await notificationapi.deleteSchedule(data.trackingid);
      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to cancel notification' });
    }
  } else {
    try {
      const result = await notificationapi.send({
        type: 'map_events_for_websites',
        to: { id: data.id },
        web_push: {
          title: data.msg,
          message: data.msg,
          icon: 'https://app.notificationapi.com/mstile-150x150.png?id={{commentId}}',
          url: 'http://localhost:5173/',
        },
        schedule: data.schedule
      });
      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }

}