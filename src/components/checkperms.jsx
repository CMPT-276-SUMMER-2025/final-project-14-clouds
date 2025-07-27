import { NotificationAPIProvider } from '@notificationapi/react'

const AskforPerm = () => {
  const notificationapi = NotificationAPIProvider.useNotificationAPIContext();
  
  const handleClick = () => {
    if (notificationapi) {
      notificationapi.setWebPushOptIn(true);
    }
  };

  return (
    <button onClick={handleClick}>
      Click to pop up the permission prompt
    </button>
  );
};

export default AskforPerm;