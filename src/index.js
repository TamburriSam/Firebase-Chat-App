
const { default: firebase } = require("firebase");
//import * as firebase from "firebase";

//const { default: firebase } = require("firebase");

//make auth and firestore
var firebaseConfig = {
  apiKey: "AIzaSyDS0-IJar13_e77IoYAAAIE5YyRGDfmUH0",
  authDomain: "second-6266e.firebaseapp.com",
  projectId: "second-6266e",
  storageBucket: "second-6266e.appspot.com",
  messagingSenderId: "884343805455",
  appId: "1:884343805455:web:bf0c472390ea6ef35ff57a",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
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

let inputList = document.querySelector("#input-list");

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
        rooms_joined: [],
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
  userDeleteOnSignOut();
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
    console.log(`USERUSER`, user)
    //snapshot digital representation in that moment in tiome
    rooms.style.display = "block";
    //instead of onSnapshot before you had .add().then() to just add it, but we want to listen to it
    //so onSnapshot says im gonna get the data to begin with- retrieve it- sets up a listener to database- anytime theres a change- it fires again and you received updated snapshot
    db.collection("rooms").onSnapshot((snapshot) => {
      //console.log("Snapshot docs", snapshot.docs);
      setUpRooms(snapshot.docs);
    });
    setUpUI(user);
    //userDeleteOnSignOut(user, firebase.auth().currentUser.uid);

  } else {
    //if user signs out
    //not working bc the user is signed out initially on page load
   //userDeleteOnSignOut();
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
      user_names: [],
      users: [],
      words: [],
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
document.body.addEventListener("click", function (event) {
  let id, docRef;
  if (event.target.dataset.id == "btn") {
    id = event.target.id;

    docRef = db.collection("rooms").doc(id);
    //usersRef = db.collection("rooms");

    return db
      .runTransaction((transaction) => {
        return transaction.get(docRef).then((doc) => {
          console.log(doc.data());

          if (doc.data().active_count < doc.data().Count) {
            let newCount = doc.data().active_count + 1;
            transaction.update(docRef, { active_count: newCount });
          }
          //else start
          //cant bc then executes
        });
      })
      .then(() => {
        //then get the user
        const playBox = document.querySelector("#play-box");
        playBox.style.display = "grid";

        getUsers(docRef);
        return docRef
          .update({
            users: firebase.firestore.FieldValue.arrayUnion(
              firebase.auth().currentUser.uid
            ),
            user_names: firebase.firestore.FieldValue.arrayUnion(
              firebase.auth().currentUser.email
            ),
          })
          .then(() => {
            //here we need to add it here
            //find the count
        
            docRef.get().then((doc) => {
              usernameContainer.innerHTML = doc.data().Name;

              let currentUserId = firebase.auth().currentUser.uid
         
              
              db.collection('users').doc(currentUserId).update({
                rooms_joined: doc.id
              })

              //save the user id of docref under the user profile
              isRoomFull(doc.id)

             /*  if (doc.data().Count === doc.data().active_count) {
                ///
                ///
                ///
                ///OK SO ISSUE- THE ROOM ONLY STARTSS IF THE TWELFTH PERSON HIT IT
                ///WE NEED A WAY TO BROADCAST ONCE A CONDITION IS MET
                ///SET UP SOME TYPE OF LISTENER IN THE GLOBAL SCOPE?
                ///ALSO FOR TESTING PURRPOSES, LETS REMOVE USERS ON SIGNOUT FUNCTION
                getUsers(docRef);
                startGame(docRef);
              } */
            });
            console.log("user added");
          });

        //store the user?
      });
  }
});

function getUsers(room) {
  let inputList = document.querySelector("#user-list");
  let html;
  console.log("HAR");
  //display the usernames
  //but we want to set up a listener

  room.onSnapshot((snapshot) => {
    //IF THERE IS NOW A LISTENER HERE FOR USERS
    //CAN WE SET UP A LISTETNER FOR THE COUNT AS WELL
    //ANOTHER PARAMETER FOR THE DOCREF WITH A TWEAK FOR USERS FIELD INSTEAD
    let html = "";
    snapshot.data().user_names.forEach((user) => {
      html += `<li> ${user} </li>`;
      console.log(user);
    });
    inputList.innerHTML = html;
  });
}

function isRoomFull(room){
  db.collection('rooms').doc(room).onSnapshot((snapshot) => {
    let data = snapshot.data()

    let targetRoom = db.collection('rooms').doc(room)

    console.log(`ROOMROOM`, room)

    console.log(
      'SNAPSHOT SNAPSHOT'
    )

 
   if(data.Count === data.active_count){
    getUsers(targetRoom)
    startGame(targetRoom)
    }else{
      console.log('waiting for all users to join')
    }
  })
/*   room.onSnapshot((snapshot) => {
    console.log(`SNAPSHOT DATA`, snapshot.data())
    let data = snapshot.data();
    if(data.Count === data.active_count){
      getUsers(docRef)
      startGame(docRef)
    }
  }); */
  console.log(`ROOMROOM`, room)
}


function userDeleteOnSignOut(){
  db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc) => {
    console.log(`DOC DATA DOC DATA`, doc.data().rooms_joined)

    //find the username in the room collection with the rooms_joined(aka the only room the user went into thats saved in his user profile)
    
    db.collection('rooms').doc(doc.data().rooms_joined).get().then((doc) => {
      doc.data().users.forEach((user) => {
        if(user === firebase.auth().currentUser.uid){
          //delete user from room and delete user from users array
          console.log(`UHM USER LIKE:`,user)
          console.log(`DOCREF`,doc.ref)
          //delete the id
           doc.ref.update({
            users: firebase.firestore.FieldValue.arrayRemove(user)
          })

          //delete the username
          //WE ACTUALLLY dont need to delete the username
          //the username can go when the room goes
          //WHEN THE USER ARRAY IN THE ROOMS HIT ZERO 
          //DELETE THE ROOM

        }
      })
    }).then(() => {
      console.log('signed out sonasokdfn')
      auth.signOut().then(() => {
        console.log('booyah')
      })
    })
  })
}

let localArray = [];


const test = document.querySelector("#test-btn");
test.addEventListener("click", function(){
 console.log(localArray)
 console.log(arrayTwo)
})




function startGame(room){
  return db.runTransaction((transaction) => {
    return transaction.get(room).then((doc) => {
      console.log("DOCDOC:", doc.data().Count);
      let listofInp = document.querySelector("#input-list");
      let html = "";
  
      for (let i = 0; i < doc.data().Count; i++) {
        html += `<li><input type="text" placeholder="enter word" class="input-cell" </input> </li>`;
      }
      html += `<button class="next-1"id='${doc.id}'>Next</button>`;
      listofInp.innerHTML = html;
    }).then(() => {
   
      let nextBtn = document.querySelector('.next-1')

      nextBtn.addEventListener('click', cellValue1)

    })
  })
}


function cellValue1(e){
 
  //WORKS
  let docRef = db.collection('rooms').doc(e.target.id)
  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
      let inputCells = document.querySelectorAll('.input-cell')
      inputCells.forEach((cell) => {
        localArray.push(cell.value + ' ')
        console.log(cell.value)
        doc.ref.update({
          words: firebase.firestore.FieldValue.arrayUnion(cell.value)
        })
      })

     /*  return userRef.update({
        list_one: firebase.firestore.FieldValue.arrayUnion(cell.value)
      }) */
    }).then(() => {
      console.log('works')

      docRef.get().then((doc) => {
        /* console.log(`WORKSWORKS`, doc.data().words(randomNumber)) */
          let listone = document.getElementById('input-list')
       
        ;
        let html = '';
        for(let i = 0; i < doc.data().Count; i++){
          let randomNumber = Math.floor(Math.random() * doc.data().Count);
          html += `<li>${doc.data().words[randomNumber]}</li>`
        }
        listone.innerHTML = html

      })


    }).then(() => {
      //CHAINING THIS ON HERE BUT WE NEED TO STUFF THIS IN A FUNCTION 
      docRef.get().then((doc) => {
        console.log(`BLUE TEST`,doc.data().words)

        let inputList1 = document.getElementById('input-list1')
        let html = '';

        for(let i = 0; i < doc.data().active_count; i++){
          html += `<li>
          <input type="text" placeholder="enter word" class="input-cell2"</input>
          </li>`

        
        }
        html += `<button data-id="next-2" class="next-2"id='${doc.id}'>Next</button>`
        inputList1.innerHTML = html
      })
     }).then(() => {
      /*  document.body.addEventListener('click', function(event){
         if (event.target.dataset.id === 'next-2'){
           console.log('ok')
           return populateTwo(e)
         }
       }) */
       console.log('DOCREF', docRef)
     }) 
  })
}

document.body.addEventListener('click', function(e){
  let inputCells2 = document.querySelectorAll('input-cell2')
  inputCells2.forEach((cell) => {
      
    arrayTwo.push(cell.value)
  }) 
  if (e.target.dataset.id === 'next-2'){
    console.log('ok')
  populateTwo(e)
  }
})


//INSTEAD OF USERNAMES BEING SAVED IN THE ROOM AND CAUSING BLOAT WE COULD JUST HAVE A USER MAKE A SCREEN NAME ON SIGN IN AND USE THAT OR SAVE THAT IN THE DB UNDER USER OR SOMETHING

//SO THE CLIENT IS STILL NOT RECEIVING AN INPUT LIST ON THE THIRTEENTH COUNT- ONLY THE PERSON WHO TRIGGERED IT
//SURELY WE CAN MAKE THIS WORK BUT MAYBE A 'START' BUTTON THAT APPEARS WHEN ALL HAVE ENTERED THE ROOM? 


function populateCells(e){
 console.log(e.target.id)

 let nextBtn2 = document.querySelector('.next-2')
 nextBtn2.addEventListener('click', function(){
   console.log('hi')
 })
}

let arrayTwo = [];

function populateTwo(e){
  
  let userRef = db.collection('users').doc(firebase.auth().currentUser.uid)
  let docRef = db.collection('rooms').doc(e.target.id)
  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
  console.log('works')
  let inputCells2 = document.querySelectorAll('input-cell2')
      console.log('works')

    
      inputCells2.forEach((cell) => {
      
        console.log(cell.value, 'CELL VALUE')
        doc.ref.update({
          words: firebase.firestore.FieldValue.arrayUnion(cell.value)
        })


      }) 
    }).then(() => {
      console.log('works')

      docRef.get().then((doc) => {
        /* console.log(`WORKSWORKS`, doc.data().words(randomNumber)) */
          let listtwo = document.getElementById('input-list1')
       
        ;
        let html = '';
        for(let i = 0; i < doc.data().Count; i++){
          let randomNumber = Math.floor(Math.random() * doc.data().Count);
          html += `<li>${doc.data().words[randomNumber]}</li>`
        }
        listtwo.innerHTML = html
  
      })
  }).then(() => {
    let inputcells3 = document.getElementById('input-list2')
    let html = '';
   docRef.get().then((doc) =>{
    for(let i = 0; i < doc.data().active_count; i++){
      html += `<li><input type="text" placeholder="enter word" class="input-cell3" </input> </li>`
    }
    html += `<button data-id="next-3" id="${doc.id}"class="next-3">Next</button>`
    inputcells3.innerHTML = html
   })

  }).then(() => {
    document.body.addEventListener('click', function(e){
      if(e.target.dataset.id === 'next-3'){
        console.log('woohoo')
        populateThree(e)
      }
    })
  })
  })
}

const populateThree = (e) => {
  let docRef = db.collection('rooms').doc(e.target.id)

  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
  console.log('works')
  let inputCells3 = document.querySelectorAll('input-cell3')
    
      inputCells3.forEach((cell) => {
        console.log(cell.value)
        localArray.push(cell.value)
        doc.ref.update({
          words: firebase.firestore.FieldValue.arrayUnion(cell.value)
        })
      }) 
    }).then(() => {
      console.log('works')

      docRef.get().then((doc) => {
        /* console.log(`WORKSWORKS`, doc.data().words(randomNumber)) */
          let listthree = document.getElementById('input-list2')
       
        ;
        let html = '';
        for(let i = 0; i < doc.data().Count; i++){
          let randomNumber = Math.floor(Math.random() * doc.data().Count);
          html += `<li>${doc.data().words[randomNumber]}</li>`
        }
        listthree.innerHTML = html
  
      })
  }).then(() => {
    let inputCells4 = document.getElementById('input-list3')
    let html = '';
   docRef.get().then((doc) =>{
    for(let i = 0; i < doc.data().active_count; i++){
      html += `<li><input type="text" placeholder="enter word" class="input-cell" </input> </li>`
    }
    html += `<button data-id="${doc.id}" class="next-3">Next</button>`
    inputCells4.innerHTML = html
   })

  })
  })
}

const populateFour = (e) => {
  //FIRST NEED TO SET THE WORDS TO THE USER 

  //HERE WE ONLY NEED TO DELIVER THE WORDS INTO THE DATABASE THEN REROUTE TO A PAGE WHERE THEY SEE THEIR OWN PAGES

  //IF THE WORD IS FOUND IN THE USERS WORD ARRAY
  //GET ANOTHER WORD
}