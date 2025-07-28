// App.jsx or NotificationButton.jsx
import React from 'react';
import { NotificationAPIProvider } from '@notificationapi/react'
function NotificationButton() {
    const notificationapi = NotificationAPIProvider.useNotificationAPIContext();
      
    const checkPerms = () => {
    if (notificationapi) {
        notificationapi.setWebPushOptIn(true);
    }
    sendNotification();
    };
    
    const sendNotification = async () => {
    try {
      const res = await fetch('http://localhost:3000/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentId: 'buttonClickTest',
          email: 'kris68008@gmail.com'
        })
      });

      const data = await res.json();
      console.log('Notification sent:', data);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  return (
    <button onClick={checkPerms}>
      Send Notification
    </button>
  );
}

export default NotificationButton;
