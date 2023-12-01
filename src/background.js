'use strict';

let username = '';

//to make this work with brave, users need to adjust brave setting as instructed here:
//https://stackoverflow.com/questions/42385336/google-push-notifications-domexception-registration-failed-push-service-err

/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../firebase-messaging-sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  }).catch(function(err) {
    console.log('Service worker registration failed, error:', err);
  });
}*/

import { initializeApp } from 'firebase/app';
import { onMessage, getToken } from 'firebase/messaging';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';


const firebaseConfigStr = process.env.FIREBASE_CONFIG;
const firebaseConfig = JSON.parse(firebaseConfigStr);


// attach Notification handlers prior to initializing firebase messaging
self.addEventListener('notificationclick', function (event) {
    const clickedNotification = event.notification;
	//try{
		//const linkOpening = clickedNotification.data.linkOpening;
		const url = event.notification?.data?.FCM_MSG?.data?.link;

		if (url != '') {
			event.waitUntil(
				clients.openWindow(url)
			);
		}
    // }catch(err){
		// console.log(err);
	// }
});


//handle install event
/*********************************************/

function generateExtensionId(callback) {
  chrome.storage.sync.get(['extensionId'], function(result) {
    const existingId = result.extensionId;

    if (existingId) {
      callback(existingId);
    } else {
      const newId = generateRandomId();
      chrome.storage.sync.set({ extensionId: newId }, function() {
        callback(newId);
      });
    }
  });
}

// Generate a random identifier
function generateRandomId() {
  return Math.random().toString(36).substr(2, 10);
}

// Handle the onInstalled event
chrome.runtime.onInstalled.addListener((details) => {
  // Check if the extension was just installed
  if (details.reason === 'install') {
	generateExtensionId((extensionId) => {
		console.log('Extension ID:', extensionId);
	});
  }
});


/*********************************************/









//console.log('background');
const app = initializeApp(firebaseConfig);
//console.log(app);
const messaging = getMessaging(app);
//console.log(messaging);
/*try{
messaging = getMessaging(app);
}catch(exc){
	console.log(exc);
}
*/
//console.log('here');

/*
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Listen for incoming Firebase messages
const messaging = firebase.messaging();

*/

// Display a notification
	/*
 chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/hivealert.png',
   title: "My Notification",
      message: "This is my notification."
  });
*/

/*
self.addEventListener('push', (event) => {
	
  const payload = event.data.json();
  
  // Get the original title and body from the FCM payload
  const originalTitle = payload.notification.title;
  const originalBody = payload.notification.body;

	const title = "Hive Notification";
    const iconUrl = "icons/hive_128.png";
  
    // Customize notification display
  const notificationOptions = {
    icon: iconUrl, // Customize the icon
    body: originalBody,
    //title: title,//payload.notification.title,
  };
  
  event.stopImmediatePropagation();

  // Prevent the default notification
  event.waitUntil(
	
	
	//new Promise((resolve, reject) => {
		self.registration.showNotification(title, notificationOptions)
		// .then(resolve)
		// .catch(reject);
    //})
	// {
      // body: 'Your Custom Body',
      // icon: '/path/to/icon.png',
    //})
  );
  
  //chrome.notifications.create("", notificationOptions);
});
*/

/*
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: 'icons/hive_128.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
*/

/*
onMessage(messaging, (payload) => {
	//return;
  console.log('Message received. ', payload);
  // ...
  
	const title = "Hive Notification";
    const iconUrl = "icons/hive_128.png";
  
    // Customize notification display
  const notificationOptions = {
    icon: iconUrl, // Customize the icon
    body: payload.notification.body,
    title: title,//payload.notification.title,
  };

  // Create and display the notification
  //chrome.notifications.create("", notificationOptions);
});
*/

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'permgranted'){
		//grab username
		const message = "ack";
		chrome.storage.sync.get(['username'], function(result) {
		  username = result.username;
		  console.log('Stored username:', username);
		  if (username != ''){
			grabToken(username);
		  }
		});
	sendResponse({
      message
    });
  }else if (request.type == 'logout'){
	  console.log(request.payload.user)
	  registerUser(request.payload.user, 'xxxxxxxxxxx');//null entries token
	  const message = "ack";
	  sendResponse({
		message
      });
  }else{
	  return;
  }
});


/*
new Promise((resolve, reject) => {
  const notifications = chrome.notifications;

  if (notifications) {
    resolve(notifications);
  } else {
    chrome.runtime.onInstalled.addListener(() => {
      resolve(chrome.notifications);
    });
  }
}).then(notifications => {
  notifications.onDisplayed.addListener(function (notification) {
    // Extract notification data and customize appearance
    const title = notification.title;
    const body = notification.body;
    const icon = notification.iconUrl;
    const customData = notification.data;

    notification.title = "Hive Notification";
    notification.iconUrl = "icons/hive_128.png";

    // Add custom action button
    notification.buttons.push({
      title: "Open Custom Page",
      iconUrl: "my-custom-action-icon.png",
      action: function () {
        chrome.tabs.create({ url: "https://example.com/custom-page" });
      }
    });
  });

  notifications.onClicked.addListener(function (notificationId) {
    // Handle notification click based on ID
    console.log("notification clicked!");
    if (notificationId === "my-custom-notification-id") {
      console.log("Custom notification clicked!");
      chrome.tabs.create({ url: "https://example.com/custom-action" });
    }
  });
});*/


function registerUser(username, token){
	generateExtensionId((extensionId) => {
		let userTokenEntry = {
		  token: token,
		  user: username,
		  app: 'web',
		  webid: extensionId,
		  date: new Date()
		};

		// Make the API call
		fetch(process.env.REGISTER_TOKEN_API, {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify(userTokenEntry),
		})
		.then(response => response.json())
		.then(data => {
		  // Handle the response from the API
		  //console.log('registered token'+token)
		  //console.log(data);
		})
		.catch((error) => {
		  console.error('Error:', error);
		});
	});
}

function grabToken(username){
	console.log('grabToken');
	getToken(messaging, { 
		serviceWorkerRegistration: self.registration
	}).then((currentToken) => {
	  if (currentToken) {
		// Send the token to your server and update the UI if necessary
		// ...
		//console.log('currentToken:'+currentToken)
		
		registerUser(username, currentToken);
	  } else {
		// Show permission request UI
		console.log('No registration token available. Request permission to generate one.');
		// ...
	  }
	}).catch((err) => {
	  console.log('An error occurred while retrieving token. ', err);
	  // ...
	});
}

