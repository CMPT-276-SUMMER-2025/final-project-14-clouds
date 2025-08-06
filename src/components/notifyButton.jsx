import { NotificationAPIProvider } from '@notificationapi/react'
import { useState } from 'react'
import { IoMdNotifications, IoMdNotificationsOff } from "react-icons/io";
import "./notifyButton.css";

export default function NotificationButton({busNumber, arrivalTime, arriveIn}) { //the notification btton component 
    const notificationapi = NotificationAPIProvider.useNotificationAPIContext();
    const [enabled, setEnabled] = useState(true); 
    const [schedules, setSchdules] = useState([]); //saves the scheduled notification event trackingID

    const checkPerms = () => {// function to ask for permission for notifications
      if (notificationapi) {
          notificationapi.setWebPushOptIn(true);
      }

      setEnabled(prev => !prev);
      if (enabled) {
        new Notification(`${busNumber} will arrive soon`, {
                  body: `Arriving ${arriveIn}`,
                }); //web push while on website
        sendNotification(); //schedule a web push notification, it should work even if user is not on the website 
      } else {
        if (schedules){
          cancelNotification(schedules || '');
        }
      }
    };
    const cancelNotification = async (trackingId) => {
      if(trackingId) {
        try {
        const _send = await fetch('/api/send-notification', { //change link to this when hosting '/api/send-notification' = send-notification.js
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: 'kris68008@gmail.com',
            trackingid: trackingId
          })
        });
        console.log('removed schedule notification', trackingId)
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  };
    const sendNotification = async () => {
      const msg = `${busNumber} arriving now!`;
      const s = arrivalTime.toISOString() || '';
      console.log('schedule: ', s, busNumber);
      try {
        const res = await fetch('/api/send-notification', { //change link to this when hosting '/api/send-notification' = send-notification.js
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
        console.log('Notification sent:', data, data.trackingId);
        setSchdules(data.trackingId);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
  };

  return (
    <button onClick={checkPerms}>
      {enabled ? <IoMdNotifications className="icon" size={20}/> : <IoMdNotificationsOff className="icon" size={20}/>}
    </button>
  );
}
