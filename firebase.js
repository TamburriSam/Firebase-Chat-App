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
});
