//make auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();

//update firestore settings
/* db.settings({
  timestampsInSnapshots: true,
}); */

//signup
const signupForm = document.getElementById("signup-form");
const logOutBtn = document.getElementById("log-out");
const usernameContainer = document.querySelector("#user");
const signinForm = document.querySelector("#signin-form");
const roomList = document.querySelector(".rooms");
const rooms = document.querySelector("#rooms");

const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelector(".logged-in");

const setUpUI = (user) => {
  if (user) {
    //togle UI elements
    loggedInLinks.style.display = "block";

    loggedOutLinks.forEach((item) => {
      item.style.display = "none";
    });
  } else {
    loggedInLinks.style.display = "none";
    loggedOutLinks.forEach((item) => {
      item.style.display = "block";
    });
  }
};

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get user info
  const email = signupForm["signup-email"].value;
  const password = signupForm["signup-password"].value;

  //sign up user
  //asynchronous task- takes time to complete
  //returns promise - promise says: ok at some point this will be completed
  //fires a callback when task is complete- takes in response
  //response in this case is user credential

  //auto generates unique user ID
  auth.createUserWithEmailAndPassword(email, password).then((cred) => {
    usernameContainer.innerHTML = cred.user.email;
    signupForm.reset();
    rooms.style.display = "block";
  });
});

//logout
logOutBtn.addEventListener("click", function (e) {
  e.preventDefault();

  //dont need response for server so no arg?
  auth.signOut().then(() => {
    console.log("user signed out");
  });
  usernameContainer.innerHTML = "Signed Out";
  rooms.style.display = "none";
});

//login

signinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get user info
  //from two input fields
  const email = signinForm["signin-email"].value;
  const password = signinForm["signin-password"].value;

  //async
  //takes a while - returns a promise
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    //cred is access to users info
    usernameContainer.innerHTML = "Hello " + cred.user.email;
    console.log("logged in");
    signinForm.reset();
    rooms.style.display = "block";
  });
});

//keep track of user auth status
//logged in? logged out?
//onAuthStateChanged - listens for any authentication sstages
//listen for auth status changes
auth.onAuthStateChanged((user) => {
  console.log(user);

  //will only fire when user logs in
  //user is true = user exists
  if (user) {
    //get data
    //async task
    //snapshot digital representation in that moment in tiome
    rooms.style.display = "block";
    db.collection("rooms")
      .get()
      .then((snapshot) => {
        console.log("Snapshot docs", snapshot.docs);
        setUpRooms(snapshot.docs);
      });
    setUpUI(user);
  } else {
    setUpRooms([]);
    setUpUI();
  }
});

//this takes the snapshot object and iterates through it to get the info
const setUpRooms = (data) => {
  //if there is data
  if (data.length) {
    let html = "";
    data.forEach((doc) => {
      const room = doc.data();
      console.log("Iterated snapshot", room);
      const li = `<li><button>${room.Name}</button>${room.Count} Students</li>`;

      html += li;
    });
    roomList.innerHTML = html;
  } else {
    roomList.innerHTML = `<h5>Log in to view rooms</h5>`;
  }
};