import { NotificationAPIProvider } from '@notificationapi/react'
import { useState } from 'react'
import { IoMdNotifications, IoMdNotificationsOff } from "react-icons/io";
import "./notifyButton.css";
function NotificationButton({busNumber, arrivalTime, arriveIn}) {
    const notificationapi = NotificationAPIProvider.useNotificationAPIContext();
    const [enabled, setEnabled] = useState(true);
    const [schedules, setSchdules] = useState([]);

    const checkPerms = () => {
    if (notificationapi) {
        notificationapi.setWebPushOptIn(true);
    }
    const time = arrivalTime.toISOString();
    setEnabled(prev => !prev);
    if (enabled) {
      new Notification(`${busNumber} will arrive soon`, {
                body: `Arriving ${arriveIn}`,
              });
      sendNotification();
    } else {
      cancelNotification(schedules || '');
    }
    };
    const cancelNotification = async (trackingId) => {
      if(trackingId) {
        notificationapi.deleteSchedule(trackingId);
        console.log('removed schedule notification', trackingId)
      }
    }
    const sendNotification = async () => {
    const msg = `${busNumber} arriving now!`;
    const s = arrivalTime.toISOString() || '';
    console.log('schedule: ', s, busNumber);
    try {
      const res = await fetch('http://localhost:3000/send-notification', { //change link to this when hosting '/api/send-notification'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'kris68008@gmail.com',
          msg: msg || 'Bus arriving soon!' ,
          schedule: s
        })
      });

      const data = await res.json();
      console.log('Notification sent:', data);
      setSchdules(data);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  return (
    <button onClick={checkPerms}>
      {enabled ? <IoMdNotifications className="icon" size={20}/> : <IoMdNotificationsOff className="icon" size={20}/>}
    </button>
  );
}

export default NotificationButton;
