console.log("editApp1.js");
const db = firebase.firestore();
const firebaseStorage = firebase.storage();

// summernote inilise
$(document).ready(function () {
  $("#textarea-describtion").summernote({
    placeholder: "Write Project Summery",
    tabsize: 4,
    // height: 100,
  });
});

const allAppsTbody = document.querySelector("#all-apps-tbody");
let ALL_APPS = [];
db.collection("applications").onSnapshot((snapApps) => {
  let snapAppsDocs = snapApps.docs;
  snapAppsDocs.map((snapDoc) => {
    let snapData = snapDoc.data();
    ALL_APPS.push({ data: snapData, id: snapDoc.id });
  });
  displayingRows();
});

const displayingRows = () => {
  let eachRow = "";
  ALL_APPS.map((data, index) => {
    eachRow += `
    <tr>
      <th scope="row">${index + 1}</th>
      <td>${data.data.appId}</td>
      <td><button type="button" class="btn btn-danger" data-appindex="${index}" onclick="deleteApp(event)" >Delete</button></td>
      <td><button type="button" class="btn btn-warning" data-appindex="${index}" onclick="editApp(event)">Edit</button></td>
    </tr>
    `;
  });
  allAppsTbody.innerHTML = "";
  allAppsTbody.innerHTML = eachRow;
};

const appDetailsFormHTML = document.querySelector("#app-details-form");

const editApp = (e) => {
  let appIndex = e.target.dataset.appindex;
  let appData = ALL_APPS[appIndex].data;
  // console.log();
  let appId = ALL_APPS[appIndex].id;

  appDetailsFormHTML["name"].value = appData.name;
  appDetailsFormHTML["appId"].value = appData.appId;
  appDetailsFormHTML["type"].value = appData.type;
  appDetailsFormHTML["frontend"].value = appData.frontend;
  appDetailsFormHTML["backend"].value = appData.backend;
  appDetailsFormHTML["link"].value = appData.link;
  $("#textarea-describtion").summernote("code", appData.describtion);
  if (appData.admin) {
    for (let i = 0; i < appData.admin.length; i++) {
      appDetailsFormHTML[`admin${i + 1}-email`].value = appData.admin[i].email;
      appDetailsFormHTML[`admin${i + 1}-password`].value =
        appData.admin[i].password;
    }
  }

  if (appData.user) {
    for (let i = 0; i < appData.user.length; i++) {
      appDetailsFormHTML[`user${i + 1}-email`].value = appData.user[i].email;
      appDetailsFormHTML[`user${i + 1}-password`].value =
        appData.user[i].password;
    }
  }

  appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = "";
  appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = `
  <div class="app-img-holder">
    <img
      id="main-img"
      class="app-img"
      src="${appData.mainImgUrl}"
      alt="${appData.appId} | Bhagat Singh"
    />
  </div>
  <button type="button" class="btn btn-danger" onclick="deleteImg(event, this)" data-img="uploaded_0" data-imgtype="main">Delete</button>
  `;

  if (appData.subImgsUrl) {
    let eachSubImg = "";
    appData.subImgsUrl.map((simg, index) => {
      eachSubImg += `
      <div class="each-sub-img">
        <div class="app-img-holder">
          <img
            id="uploaded_${index}"
            class="app-img"
            src="${simg}"
            alt="${appData.appId} | Bhagat Singh"
          />
        </div>
        <button type="button" class="btn btn-danger" onclick="deleteImg(event, this)" data-img="uploaded_${index}" data-imgtype="sub">Delete</button>
      </div>
      `;
    });
    appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML = "";
    appDetailsFormHTML.querySelector(
      "#sub-app-imgs-holder"
    ).innerHTML = eachSubImg;
  }
};

const deleteApp = (e) => {
  let appIndex = e.target.dataset.appindex;
  let deleteStatus = confirm("Sure you want to delete");
  if (deleteStatus) {
    let id = ALL_APPS[appIndex].id;
    ALL_APPS = ALL_APPS.splice(appIndex, 1);
    displayingRows();
    db.collection("applications")
      .doc(id)
      .delete()
      .then(() => {
        // deleted successfully
      })
      .catch((error) => {
        alert(`ERROR in deleting:`, error.message);
      });
  } else {
    // alert('Fine, Not deleting. Chill');
  }
};

let subFiles = [];
let mainFile;

const appDetailsFormSubmit = (e) => {
  e.preventDefaut();

  const name = appDetailsFormHTML["name"].value;
  const appId = appDetailsFormHTML["appId"].value;
  const type = appDetailsFormHTML["type"].value;
  const link = appDetailsFormHTML["link"].value;
  const frontend = appDetailsFormHTML["frontend"].value;
  const backend = appDetailsFormHTML["backend"].value;
  const describtion = $("#textarea-describtion").summernote("code");
  const admin1Email = appDetailsFormHTML["admin1-email"].value;
  const admin1Password = appDetailsFormHTML["admin1-password"].value;
  const admin2Email = appDetailsFormHTML["admin2-email"].value;
  const admin2Password = appDetailsFormHTML["admin2-password"].value;
  const user1Email = appDetailsFormHTML["user1-email"].value;
  const user1Password = appDetailsFormHTML["user1-password"].value;
  const user2Email = appDetailsFormHTML["user2-email"].value;
  const user2Password = appDetailsFormHTML["user2-password"].value;

  let adminCred = [];
  if (admin1Email) {
    adminCred.push({ email: admin1Email, password: admin1Password });
  }
  if (admin2Email) {
    adminCred.push({ email: admin2Email, password: admin2Password });
  }

  let userCred = [];
  if (user1Email) {
    userCred.push({ email: user1Email, password: user1Password });
  }
  if (user2Email) {
    userCred.push({ email: user2Email, password: user2Password });
  }

  const data = {
    name: name,
    link: link,
    describtion: describtion,
    type: type,
    frontend: frontend,
    backend: backend,
    appId: appId,
  };
  if (adminCred.length > 0) {
    data.admin = adminCred;
  }
  if (userCred.length > 0) {
    data.user = userCred;
  }

  if (mainFile) {
  }

  if (subFiles) {
  }
};

appDetailsFormHTML.addEventListener("submit", appDetailsFormSubmit);

document.querySelector("#main-img").addEventListener("change", (e) => {
  console.log(e.target.files);
  mainFile = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = "";
    appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = `
    <div class="app-img-holder">
      <img
        id="main-img"
        class="app-img"
        src="${e.target.result}"
        alt="Bhagat Singh"
      />
    </div>
    <button type="button" class="btn btn-danger" onclick="deleteImg(event, this)" data-img="added_0" data-imgtype="main">Delete</button>
    `;
  };
  reader.readAsDataURL(mainFile);
});

document.querySelector("#sub-imgs").addEventListener("change", async(e) => {
  console.log(e.target.files);
  for (let i = 0; i < e.target.files.length; i++) {
    appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML += `
    <div class="each-sub-img aded-sub-img${i}">
      <div class="app-img-holder ">
        <img
          id="added_${i}"
          class="app-img"
          src=""
          alt="Bhagat Singh"
        />
      </div>
      <button type="button"  class="btn btn-danger" onclick="deleteImg(event, this)" data-img="added_${i}" data-imgtype="sub">Delete</button>
    </div>
    `;
    // console.log(appDetailsFormHTML.querySelector("#sub-app-imgs-holder"));
    subFiles.push(e.target.files[i]);
    let reader = new FileReader();

    reader.onload = (e) => {
      // console.log(e.target.result);
      document.querySelector(`#added_${i}`).src = e.target.result;
    };
    reader.readAsDataURL(e.target.files[i]);
  }
});

const deleteImg = (e, current) => {
  // e.preventDefaut();
  let type = e.target.dataset.imgtype;
  let [status, index] = e.target.dataset.img.split('_');
  if(type === 'main') {
    if(status === 'added') {

      appDetailsFormHTML.querySelector("#main-app-img-holder").remove();

    } else {
      appDetailsFormHTML.querySelector("#main-app-img-holder").remove();
    }
  } else {
    if(status === 'added') {
      appDetailsFormHTML.querySelector(`.aded-sub-img${index}`).remove(); 
      
    } else {

    }
  }

}
