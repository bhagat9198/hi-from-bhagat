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
const appDetailsFormHTML = document.querySelector("#app-details-form");
let ALL_APPS = [];
let subFiles = [];
let deleteUploadedImgs = [];
let mainFile;

db.collection("applications").onSnapshot(
  { includeMetadataChanges: false },
  (snapApps) => {
    let snapAppsDocs = snapApps.docs;
    ALL_APPS = [];
    snapAppsDocs.map((snapDoc) => {
      let snapData = snapDoc.data();
      ALL_APPS.push({ data: snapData, id: snapDoc.id });
    });
    displayingRows();
  }
);

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
  allAppsTbody.innerHTML = null;
  allAppsTbody.innerHTML = eachRow;
};

const editApp = (e) => {
  appDetailsFormHTML.style.display = "block";
  let appIndex = e.target.dataset.appindex;
  let appData = ALL_APPS[appIndex].data;
  // console.log();
  // let appId = ALL_APPS[appIndex].id;
  appDetailsFormHTML["local-app-index"].value = appIndex;
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

  if (appData.mainImgUrl) {
    appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = "";
    appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = `
    <div class="app-img-holder">
      <img
        id="main-img"
        class="app-img"
        src="${appData.mainImgUrl.url}"
        alt="${appData.appId} | Bhagat Singh"
      />
    </div>
    <button type="button" class="btn btn-danger" onclick="deleteImg(event, this)" data-img="uploaded_0" data-imgtype="main">Delete</button>
    `;
  } else {
    appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = "";
  }

  if (appData.subImgsUrl) {
    let eachSubImg = "";
    appData.subImgsUrl.map((simg, index) => {
      eachSubImg += `
      <div class="each-sub-img uploaded-sub-img${index}">
        <div class="app-img-holder">
          <img
            id="uploaded_${index}"
            class="app-img"
            src="${simg.url}"
            alt="${appData.appId} | Bhagat Singh"
          />
        </div>
        <button type="button" class="btn btn-danger" onclick="deleteImg(event, this)" data-localappid="${appIndex}" data-img="uploaded_${index}" data-imgtype="sub">Delete</button>
      </div>
      `;
    });
    appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML = "";
    appDetailsFormHTML.querySelector(
      "#sub-app-imgs-holder"
    ).innerHTML = eachSubImg;
  } else {
    appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML = "";
  }

  appDetailsFormHTML.querySelector("#sub-imgs").dataset.localappid = appIndex;
  appDetailsFormHTML.querySelector("#main-img").dataset.localappid = appIndex;
};

const deleteApp = async(e) => {
  let appIndex = e.target.dataset.appindex;
  let deleteStatus = confirm("Sure you want to delete");
  if (deleteStatus) {
    let id = ALL_APPS[appIndex].id;
    if(ALL_APPS[appIndex].data.mainImgUrl) {
      await firebaseStorage.ref('applications').child(`${id}/${ALL_APPS[appIndex].data.mainImgUrl.name}`).delete().then(() => {
        console.log('main img deleted');
      }).catch(error => {
        console.log(error);
        alert('ERROR :', error.message);
      })
    }

    if(ALL_APPS[appIndex].data.subImgsUrl) {
      ALL_APPS[appIndex].data.subImgsUrl.forEach(async(subImg) => {
        await firebaseStorage.ref('applications').child(`${id}/${subImg.name}`).delete().then(() => {
          console.log(`${subImg.name} img deleted`);
        }).catch(error => {
          console.log(error);
          alert('ERROR :', error.message);
        })
      })
    }
    // ALL_APPS = ALL_APPS.splice(appIndex, 1);
    // displayingRows();

    db.collection("applications")
      .doc(id)
      .delete()
      .then(() => {
        // deleted successfully
        console.log('deleted doc successfully');
      })
      .catch((error) => {
        alert(`ERROR in deleting:`, error.message);
      });
  } else {
    // alert('Fine, Not deleting. Chill');
  }
};

const appDetailsFormSubmit = async (e) => {
  e.preventDefault();
  const localAppIndex = appDetailsFormHTML["local-app-index"].value;
  const appDocId = ALL_APPS[localAppIndex].id;

  let editRef = db.collection("applications").doc(appDocId);

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

  let data = {
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
    // console.log(mainFile);
    if (ALL_APPS[localAppIndex].data.mainImgUrl) {
      data.mainImgUrl = ALL_APPS[localAppIndex].data.mainImgUrl;
    } else {
      data.mainImgUrl = {};
    }

    if (ALL_APPS[localAppIndex].data.mainImgUrl) {
      await firebaseStorage
        .ref("applications")
        .child(`${appDocId}/${ALL_APPS[localAppIndex].data.mainImgUrl.name}`)
        .delete();
    } 

    let imgName = `${new Date().valueOf()}__${mainFile.name}`;
    // data.mainImgName = mainFile.name;
    await firebaseStorage
      .ref("applications")
      .child(`${appDocId}/${imgName}`)
      .put(mainFile);
    let mainUrl;
    await firebaseStorage
      .ref("applications")
      .child(`${appDocId}/${imgName}`)
      .getDownloadURL()
      .then((url) => {
        mainUrl = url;
      })
      .catch((error) => {
        console.log(error);
        alert("ERROR : ", error.message);
      });
    data.mainImgUrl.name = imgName;
    data.mainImgUrl.url = mainUrl;
  }

  if (subFiles) {
    if (ALL_APPS[localAppIndex].data.subImgsUrl) {
      data.subImgsUrl = ALL_APPS[localAppIndex].data.subImgsUrl;
    } else {
      data.subImgsUrl = [];
    }
    // console.log(data);
    // console.log(data.subImgsUrl);
    for (let i = 0; i < subFiles.length; i++) {
      let imgName = `${new Date().valueOf()}__${subFiles[i].name}`;
      await firebaseStorage
        .ref("applications")
        .child(`${appDocId}/${imgName}`)
        .put(subFiles[i]);
      let subUrl;
      await firebaseStorage
        .ref("applications")
        .child(`${appDocId}/${imgName}`)
        .getDownloadURL()
        .then((url) => {
          subUrl = url;
        })
        .catch((error) => {
          console.log(error);
          alert("ERROR : ", error.message);
        });
      data.subImgsUrl.push({
        name: imgName,
        url: subUrl,
        id: new Date().valueOf(),
      });
    }
  }

  deleteUploadedImgs.forEach((deleteId) => {
    ALL_APPS[localAppIndex].data.subImgsUrl.map(async (simg) => {
      if (simg.id === +deleteId) {
        let simgName = simg.name;
        await firebaseStorage
          .ref("applications")
          .child(ALL_APPS[localAppIndex].id + "/" + simg.name)
          .delete()
          .then(() => {
            console.log(`${simgName} deleted`);
          })
          .catch((error) => {
            console.log(error);
            alert("ERROR : ", error.message);
          });
      }
    });
  });

  deleteUploadedImgs.forEach((deleteId) => {
    data.subImgsUrl.map((imgData, imgIndex) => {
      if (imgData.id === +deleteId) {
        data.subImgsUrl.splice(imgIndex, 1);
      }
    });
  });

  editRef
    .update(data)
    .then(() => {
      // done
      // alert("Updated");
      deleteUploadedImgs = [];
      appDetailsFormHTML.reset();
      appDetailsFormHTML.querySelector("#main-img").value = "";
      appDetailsFormHTML.querySelector("#sub-imgs").value = "";
      mainFile = null;
      subFiles = [];
      appDetailsFormHTML.style.display = "none";
    })
    .catch((error) => {
      console.log(error);
      alert("ERROR : ", error.message);
    });
};

appDetailsFormHTML.addEventListener("submit", appDetailsFormSubmit);

document.querySelector("#main-img").addEventListener("change", (e) => {
  // console.log(e.target.files);
  let localAppId = e.target.dataset.localappid;
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
    <button type="button" class="btn btn-danger" data-localappid="${localAppId}" onclick="deleteImg(event, this)" data-img="added_0" data-imgtype="main">Delete</button>
    `;
  };
  reader.readAsDataURL(mainFile);
});

document.querySelector("#sub-imgs").addEventListener("change", async (e) => {
  // console.log(e.target.files);
  let localAppId = e.target.dataset.localappid;
  for (let i = 0; i < e.target.files.length; i++) {
    appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML += `
    <div class="each-sub-img added-sub-img${i}">
      <div class="app-img-holder ">
        <img
          id="added_${i}"
          class="app-img"
          src=""
          alt="Bhagat Singh"
        />
      </div>
      <button type="button"  class="btn btn-danger" data-localappid="${localAppId}" onclick="deleteImg(event, this)" data-img="added_${i}" data-imgtype="sub">Delete</button>
    </div>
    `;
    subFiles.push(e.target.files[i]);
    let reader = new FileReader();

    reader.onload = (e) => {
      document.querySelector(`#added_${i}`).src = e.target.result;
    };
    reader.readAsDataURL(e.target.files[i]);
  }
});

const deleteImg = (e, current) => {
  let type = e.target.dataset.imgtype;
  let [status, index] = e.target.dataset.img.split("_");
  if (type === "main") {
    if (status === "added") {
      mainFile = null;
      appDetailsFormHTML.querySelector("#main-img").value = "";
      appDetailsFormHTML.querySelector("#main-app-img-holder").remove();
    } else {
      appDetailsFormHTML.querySelector("#main-app-img-holder").remove();
    }
  } else {
    if (status === "added") {
      subFiles.splice(index, 1);
      appDetailsFormHTML.querySelector(`.added-sub-img${index}`).remove();
    } else {
      let localAppId = e.target.dataset.localappid;
      appDetailsFormHTML.querySelector(`.uploaded-sub-img${index}`).remove();
      console.log(ALL_APPS[localAppId].data.subImgsUrl[index].id);
      deleteUploadedImgs.push(ALL_APPS[localAppId].data.subImgsUrl[index].id);
    }
  }
};
