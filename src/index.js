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
    //output account information
    const html = `Hello ${user.email}`;
    usernameContainer.innerHTML = html;
    //togle UI elements
    loggedInLinks.style.display = "block";

    loggedOutLinks.forEach((item) => {
      item.style.display = "none";
    });
  } else {
    //hide account info
    usernameContainer.innerHTML = "";
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
    //IMPORTANT
    //IMPORTANT
    // look into this more- doc somehow ties the current uid with a user collection uid
    return db
      .collection("users")
      .doc(cred.user.uid)
      .set({
        name: cred.user.email,
        list_one: [],
        list_two: [],
        list_three: [],
        list_four: [],
      })
      .then(() => {
        usernameContainer.innerHTML = `Hello ${cred.user.email}`;
        signupForm.reset();
        rooms.style.display = "block";
      });
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
    //instead of onSnapshot before you had .add().then() to just add it, but we want to listen to it
    //so onSnapshot says im gonna get the data to begin with- retrieve it- sets up a listener to database- anytime theres a change- it fires again and you received updated snapshot
    db.collection("rooms").onSnapshot((snapshot) => {
      //console.log("Snapshot docs", snapshot.docs);
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

      console.log(doc.id);
      //console.log("Iterated snapshot", room);
      const li = `<li><button data-id="btn" class="room-select" id="${doc.id}">${room.Name}</button>${room.Count} Students</li>`;

      html += li;

      //add event listener that ties the room name with the name in database
    });
    roomList.innerHTML = html;
  } else {
    roomList.innerHTML = `<h5>Log in to view rooms</h5>`;
  }
};

//create new room
const createForm = document.querySelector("#create-room");

createForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //create new record in firestore database
  db.collection("rooms")
    .add({
      Name: createForm["room-name"].value,
      Count: createForm["room-count"].value,
      active_count: 0,
    })
    .then(() => {
      //close modal and reset form
      createForm.reset();
    })
    .catch((err) => {
      console.error(err);
    });
});

//start here- this sets up a listener on the room for when its received updates

//get the name
let count = 0;
document.body.addEventListener("click", function (event) {
  if (event.target.dataset.id == "btn") {
    let wantedValue = event.target.innerHTML;
    console.log(wantedValue);

    db.collection("rooms").onSnapshot((snapshot) => {
      //console.log("Snapshot docs", snapshot.docs);
      snapshot.forEach((snap) => {
        if (snap.data().Name === wantedValue) {
          if (snap.data().active_count < snap.data().Count) {
            //snap.data().active_count += 1;
            console.log(true);
            console.log(snap);
            console.log(snap.data().Name);
            console.log(snap.id);

            return db
              .collection("rooms")
              .doc(snap.id)
              .update({
                Count: (count += 1),
              });
          } else {
            console.log(false);
          }
        }
      });
    });
  }
});

/* db.collection("rooms").onSnapshot((snapshot) => {
  console.log(snapshot.docs);
});

var frankDocRef = db
  .collection("rooms")
  .doc("Eng 222")
  .update({
    Count: 1,
  })
  .then(() => {
    console.log("updated");
  });

console.log(frankDocRef);
 */
