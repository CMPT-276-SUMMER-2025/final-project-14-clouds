import notificationapi from 'notificationapi-node-server-sdk';


export default async function handler(req, res) {

  const data = req.body;
  console.log('Received data:', data);

  try {
    const result = await notificationapi.send({
      type: 'map_events_for_websites',
      to: { id: data.id },
      web_push: {
        title: data.msg,
        message: data.msg,
        icon: 'https://app.notificationapi.com/mstile-150x150.png?id={{commentId}}',
        url: 'http://localhost:5173/',//need to change link
      },
      schedule: data.schedule
    });

    res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}