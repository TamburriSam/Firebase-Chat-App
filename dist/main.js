(()=>{firebase.initializeApp({apiKey:"AIzaSyDS0-IJar13_e77IoYAAAIE5YyRGDfmUH0",authDomain:"second-6266e.firebaseapp.com",projectId:"second-6266e",storageBucket:"second-6266e.appspot.com",messagingSenderId:"884343805455",appId:"1:884343805455:web:bf0c472390ea6ef35ff57a"});const e=firebase.auth(),t=firebase.firestore(),o=document.getElementById("signup-form"),n=document.getElementById("log-out"),s=document.querySelector("#user"),l=document.querySelector("#signin-form"),a=document.querySelector(".rooms"),i=document.querySelector("#rooms"),r=document.querySelectorAll(".logged-out"),c=document.querySelector(".logged-in"),d=e=>{if(e){const t=`Hello ${e.email}`;s.innerHTML=t,c.style.display="block",r.forEach((e=>{e.style.display="none"}))}else s.innerHTML="",c.style.display="none",r.forEach((e=>{e.style.display="block"}))};o.addEventListener("submit",(n=>{n.preventDefault();const l=o["signup-email"].value,a=o["signup-password"].value;e.createUserWithEmailAndPassword(l,a).then((e=>t.collection("users").doc(e.user.uid).set({name:e.user.email,list_one:[],list_two:[],list_three:[],list_four:[]}).then((()=>{s.innerHTML=`Hello ${e.user.email}`,o.reset(),i.style.display="block"}))))})),n.addEventListener("click",(function(t){t.preventDefault(),e.signOut().then((()=>{console.log("user signed out")})),s.innerHTML="Signed Out",i.style.display="none"})),l.addEventListener("submit",(t=>{t.preventDefault();const o=l["signin-email"].value,n=l["signin-password"].value;e.signInWithEmailAndPassword(o,n).then((e=>{s.innerHTML="Hello "+e.user.email,l.reset(),i.style.display="block"}))})),e.onAuthStateChanged((e=>{console.log(e),e?(i.style.display="block",t.collection("rooms").onSnapshot((e=>{u(e.docs)})),d(e)):(u([]),d())}));const u=e=>{if(e.length){let t="";e.forEach((e=>{const o=e.data();console.log(e.id);const n=`<li><button data-id="btn" class="room-select" id="${e.id}">${o.Name}</button>${o.Count} Students</li>`;t+=n})),a.innerHTML=t}else a.innerHTML="<h5>Log in to view rooms</h5>"},m=document.querySelector("#create-room");m.addEventListener("submit",(e=>{e.preventDefault(),t.collection("rooms").add({Name:m["room-name"].value,Count:m["room-count"].value,active_count:0}).then((()=>{m.reset()})).catch((e=>{console.error(e)}))})),document.body.addEventListener("click",(function(e){let o,n;return"btn"==e.target.dataset.id&&(o=e.target.id,n=t.collection("rooms").doc(o)),t.runTransaction((e=>e.get(n).then((t=>{if(console.log(t.data()),t.data().active_count<t.data().Count){let o=t.data().active_count+1;e.update(n,{active_count:o})}})))).then((()=>{console.log("yay")}))}))})();