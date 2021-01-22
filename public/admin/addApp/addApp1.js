console.log("admin1.js");

const db = firebase.firestore();
const firebaseStorage = firebase.storage();

// summernote inilise
$(document).ready(function () {
  $("#textarea-describtion").summernote({

    placeholder: "Write Project Summery",
    tabsize: 4,
    height: 100,
    // toolbar: [
    //   ['fontSize', [20, 24]],

    // ]
  });
});

const appDetailsFormHTML = document.querySelector("#app-details-form");
let mainFile,
  subFiles = [];
const appDetailsFormSubmit = (e) => {
  e.preventDefault();
  const name = appDetailsFormHTML["name"].value;
  const link = appDetailsFormHTML["link"].value;
  const describtion = $("#textarea-describtion").summernote("code");
  const admin1Email = appDetailsFormHTML["admin1-email"].value;
  const admin1Password = appDetailsFormHTML["admin1-password"].value;
  const admin2Email = appDetailsFormHTML["admin2-email"].value;
  const admin2Password = appDetailsFormHTML["admin2-password"].value;
  const user1Email = appDetailsFormHTML["user1-email"].value;
  const user1Password = appDetailsFormHTML["user1-password"].value;
  const user2Email = appDetailsFormHTML["user2-email"].value;
  const user2Password = appDetailsFormHTML["user2-password"].value;
  const type = appDetailsFormHTML["type"].value;
  const frontend = appDetailsFormHTML["frontend"].value;
  const backend = appDetailsFormHTML["backend"].value;
  const appId = appDetailsFormHTML["appId"].value;

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
  let mainImgUrl = {};
  let subImgsUrl = [];
  db.collection("applications")
    .add(data)
    .then(async (dataSaved) => {
      // console.log(dataSaved.id);
      console.log("data saved");
      if (mainFile) {
        let fname = `${new Date().valueOf()}__${mainFile.name}`;
        await firebaseStorage
          .ref("applications")
          .child(dataSaved.id + "/" + fname)
          .put(mainFile);
        await firebaseStorage
          .ref("applications")
          .child(dataSaved.id + "/" + fname)
          .getDownloadURL()
          .then((url) => {
            // console.log(url);
            mainImgUrl.name = fname;
            mainImgUrl.url = url;
          })
          .catch((error) => {
            console.log(error);
            alert('ERROR : ', error.message);
          });
      }

      if (subFiles.length > 0) {
        // await subFiles.forEach(async (subFile) => {
        for (let i = 0; i < subFiles.length; i++) {
          let fname = `${new Date().valueOf()}__${subFiles[i].name}`;
          await firebaseStorage
            .ref("applications")
            .child(dataSaved.id + "/" + fname)
            .put(subFiles[i]);
          await firebaseStorage
            .ref("applications")
            .child(dataSaved.id + "/" + fname)
            .getDownloadURL()
            .then((url) => {
              // console.log(url);
              subImgsUrl.push({id: new Date().valueOf(), name: fname, url: url});
            })
            .catch((error) => {
              console.log(error);
              alert('ERROR : ',error.message );
            });
        }
      }

      let appRef = await db.collection("applications").doc(dataSaved.id);
      return await appRef.get().then((appDoc) => {
        let docData = appDoc.data();
        // console.log(docData);
        docData.mainImgUrl = mainImgUrl;
        docData.subImgsUrl = subImgsUrl;
        return appRef.update(docData);
      });
    })
    .then(() => {
      appDetailsFormHTML.reset();
      document.querySelector("#main-img").value = "";
      document.querySelector("#sub-imgs").value = "";
      $('#textarea-describtion').summernote('destroy');
      appDetailsFormHTML.querySelector("#main-app-img-holder").innerHTML = "";
      appDetailsFormHTML.querySelector("#sub-app-imgs-holder").innerHTML = '';
      mainFile = null;
      subFiles = [];
      console.log("updated");
      // console.log(updatedData);
    })
    .catch((error) => {
      console.log(error);
      alert('ERROR : ',error.message );
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

const deleteImg = (e) => {
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

