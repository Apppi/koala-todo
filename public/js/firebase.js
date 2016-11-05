'use strict';

function KoalaTodo() {

  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.userInfo = document.getElementById('user-info');
  this.userEmail = document.getElementById('user-email');
  this.userAvatar = document.getElementById('user-avatar');
  this.taskList = document.getElementById('task-list');
  this.notificationToken = document.getElementById('notification-token');

  // Input Form
  this.formTaskInput = document.getElementById('form-task-input');
  this.taskText = document.getElementById('tast-text');
  this.deleteTask = document.getElementsByClassName('task-delete');

  this.formTaskInput.addEventListener('submit', this.addTask.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.initFirebase();
}

KoalaTodo.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.messaging = firebase.messaging();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

  var self = this;

  this.messaging.requestPermission()
  .then(function() {

    console.log('Notification permission granted.');
    return self.messaging.getToken();
  })
  .then(function(token) {
    // self.notificationToken.textContent = token;
  })
  .catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });

  this.messaging.onMessage(function(payload) {
    console.log("Message received. ", payload);
  });

};


KoalaTodo.prototype.signIn = function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

KoalaTodo.prototype.signOut = function() {
  this.auth.signOut();
};

KoalaTodo.prototype.onAuthStateChanged = function(user) {
  if(user) {
    console.log(user);

    this.userAvatar.src = user.photoURL;
    this.userInfo.textContent = user.displayName + " (" + user.email + ")";
    this.userEmail.textContent = user.email;

    this.signInButton.style.display = 'none';
    this.signOutButton.removeAttribute('hidden');
    this.formTaskInput.style.display = 'block';

    this.getTasks();

  }else {
    this.userInfo.textContent = "";
    this.userEmail.textContent = "";

    this.signOutButton.setAttribute('hidden', true);
    this.signInButton.style.display = 'block';
    this.formTaskInput.style.display = 'none';
  }
};

KoalaTodo.prototype.addTask = function(evt) {
  evt.preventDefault();
  var self = this;
  var tastText = this.taskText.value;
  var userEmail = this.userEmail.textContent;

  if(tastText !== '') {
    this.database.ref('tasks/').push({
      email: userEmail,
      text: tastText,
      date: new Date().toString()
    }).then(function() {
      self.taskText.value = "";
    })
  }

}

KoalaTodo.prototype.removeTask = function(taskId) {
  this.database.ref('tasks/' + taskId).remove();
}

KoalaTodo.prototype.getTasks = function() {

  let self = this;
  //
  // if ('caches' in window) {
  //   console.log('cache');
  //
  // }

  this.database.ref('tasks/').on('value', function(tasks) {
    var tasks = tasks.val();
    self.taskList.innerHTML = "";

    Object.keys(tasks).map(function(taskId) {

      if(tasks[taskId].email !== self.userEmail.textContent)
        return ''

      var newList = document.createElement('li');
      newList.innerHTML = tasks[taskId].text + ' ';

      newList.onclick = function () {
        self.removeTask(taskId)
      };

      self.taskList.appendChild(newList);

    });
  })


}


window.onload = function() {
  window.KoalaTodo = new KoalaTodo();
};
