(()=>{const e=firebase.auth(),o=firebase.firestore(),t=document.getElementById("signup-form"),n=document.getElementById("log-out"),s=document.querySelector("#user"),l=document.querySelector("#signin-form"),i=document.querySelector(".rooms"),r=document.querySelector("#rooms"),a=document.querySelectorAll(".logged-out"),c=document.querySelector(".logged-in"),d=e=>{e?(c.style.display="block",a.forEach((e=>{e.style.display="none"}))):(c.style.display="none",a.forEach((e=>{e.style.display="block"})))};t.addEventListener("submit",(o=>{o.preventDefault();const n=t["signup-email"].value,l=t["signup-password"].value;e.createUserWithEmailAndPassword(n,l).then((e=>{s.innerHTML=e.user.email,t.reset(),r.style.display="block"}))})),n.addEventListener("click",(function(o){o.preventDefault(),e.signOut().then((()=>{console.log("user signed out")})),s.innerHTML="Signed Out",r.style.display="none"})),l.addEventListener("submit",(o=>{o.preventDefault();const t=l["signin-email"].value,n=l["signin-password"].value;e.signInWithEmailAndPassword(t,n).then((e=>{s.innerHTML="Hello "+e.user.email,console.log("logged in"),l.reset(),r.style.display="block"}))})),e.onAuthStateChanged((e=>{console.log(e),e?(r.style.display="block",o.collection("rooms").get().then((e=>{console.log("Snapshot docs",e.docs),u(e.docs)})),d(e)):(u([]),d())}));const u=e=>{if(e.length){let o="";e.forEach((e=>{const t=e.data();console.log("Iterated snapshot",t);const n=`<li><button>${t.Name}</button>${t.Count} Students</li>`;o+=n})),i.innerHTML=o}else i.innerHTML="<h5>Log in to view rooms</h5>"}})();