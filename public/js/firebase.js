'use strict';

function KoalaTodo() {

  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.userInfo = document.getElementById('user-info');
  this.userEmail = document.getElementById('user-email');
  this.taskList = document.getElementById('task-list');

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
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
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
    this.userInfo.textContent = user.displayName + " (" + user.email + ")";
    this.userEmail.textContent = user.email;

    this.signInButton.setAttribute('hidden', true);
    this.signOutButton.removeAttribute('hidden');
    this.formTaskInput.removeAttribute('hidden');

    this.getTasks();

  }else {
    this.userInfo.textContent = "";
    this.userEmail.textContent = "";

    this.signOutButton.setAttribute('hidden', true);
    this.signInButton.removeAttribute('hidden');
    this.formTaskInput.setAttribute('hidden', true);
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

  this.database.ref('tasks/').on('value', function(tasks) {
    var tasks = tasks.val();
    self.taskList.innerHTML = "";

    Object.keys(tasks).map(function(taskId) {

      if(tasks[taskId].email !== self.userEmail.textContent)
        return ''

      var newButton = document.createElement('button');
      newButton.innerHTML = 'Remove';
      newButton.onclick = function () {
        self.removeTask(taskId)
      };

      var newList = document.createElement('li');
      newList.innerHTML = tasks[taskId].text + ' ';
      newList.appendChild(newButton);

      self.taskList.appendChild(newList);

    });
  })


}


window.onload = function() {
  window.KoalaTodo = new KoalaTodo();
};
