'use strict';

import './popup.css';

let usernameInput, greeting, usernameDisplay, saveButton, logoutButton, introNotice, statusText;

function requestPermission(){
	//enable notifications
	console.log('request permission');
	Notification.requestPermission().then((permission) => {
		console.log(permission);
		if (permission === 'granted') {
			
			notifyBack();
		}
	});
	
}

function cancelNotifications(username){
	chrome.runtime.sendMessage(
		{
		  type: 'logout',
		  payload: {
			user: username,
			token: '',
		  },
		},
		(response) => {
		  console.log(response);
		}
	);
}

function notifyBack(){
	//permission received. Notify background
	chrome.runtime.sendMessage(
		{
		  type: 'permgranted',
		  payload: {
			token: '',
		  },
		},
		(response) => {
		  console.log(response);
		}
	);
	
}

function loggedinHandler(username){
	usernameDisplay.textContent = 'Logged in as: ' + username;
	logoutButton.style.display = 'block';
	greeting.textContent = 'Hello @' + username; // Update greeting
	introNotice.style.display = 'none';
	statusText.style.display = 'block';
	usernameInput.style.display = 'none';
	saveButton.style.display = 'none';
}

function loggedoutHandler(){
	usernameDisplay.textContent = 'Please input your hive account name ';
	logoutButton.style.display = 'none';
	greeting.textContent = 'Welcome to Hive Notifier!'; // Reset greeting
	introNotice.style.display = 'block';
	statusText.style.display = 'none';
	usernameInput.style.display = 'block';
	saveButton.style.display = 'block';
}

function initializeDisplay(){
  usernameInput = document.getElementById('usernameInput');
  greeting = document.getElementById('greeting');
  usernameDisplay = document.getElementById('usernameDisplay');
  saveButton = document.getElementById('saveButton');
  logoutButton = document.getElementById('logoutButton');
  introNotice = document.getElementById('introNotice');
  statusText = document.getElementById('status');
  
  // Load username from storage
  chrome.storage.sync.get(['username'], function(result) {
    let username = result.username;
    if (username) {
      loggedinHandler(username);
    } else {
	  loggedoutHandler();
    }
  });

  // Save username to storage when Save button is clicked
  saveButton.addEventListener('click', function() {
    var username = usernameInput.value;
    chrome.storage.sync.set({ username: username }, function() {
      if (username) {
        loggedinHandler(username);
		requestPermission();
      } else {
		loggedoutHandler();
      }
	   /*chrome.notifications.requestPermission().then((granted) => {
		  if (granted) {
			  console.log('granted');
		  }else{
			  console.log('not granted');
		  }
	  });*/
	  
    });
  });

  // Logout
  logoutButton.addEventListener('click', function() {
	  loggedoutHandler();
	  chrome.storage.sync.get(['username'], function(result) {
		cancelNotifications(result.username);
		chrome.storage.sync.remove('username', function() {
		  console.log('cleaned up');
        });
	  });
  });
	
}


//(function () {
  
  document.addEventListener('DOMContentLoaded', initializeDisplay);

  //requestPermission();
  // Communicate with background file by sending a message
  /*chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );*/
//})();
