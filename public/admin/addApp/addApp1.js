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
  let mainImgUrl;
  let subImgsUrl = [];
  db.collection("applications")
    .add(data)
    .then(async (dataSaved) => {
      // console.log(dataSaved.id);
      console.log("data saved");
      if (mainFile) {
        await firebaseStorage
          .ref("applications")
          .child(dataSaved.id + "/" + mainFile.name)
          .put(mainFile);
        await firebaseStorage
          .ref("applications")
          .child(dataSaved.id + "/" + mainFile.name)
          .getDownloadURL()
          .then((url) => {
            // console.log(url);
            mainImgUrl = url;
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (subFiles.length > 0) {
        // await subFiles.forEach(async (subFile) => {
        for (let i = 0; i < subFiles.length; i++) {
          await firebaseStorage
            .ref("applications")
            .child(dataSaved.id + "/" + subFiles[i].name)
            .put(subFiles[i]);
          await firebaseStorage
            .ref("applications")
            .child(dataSaved.id + "/" + subFiles[i].name)
            .getDownloadURL()
            .then((url) => {
              // console.log(url);
              subImgsUrl.push(url);
            })
            .catch((error) => {
              console.log(error);
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
      console.log("updated");
      // console.log(updatedData);
    })
    .catch((error) => {
      console.log(error);
    });
};

appDetailsFormHTML.addEventListener("submit", appDetailsFormSubmit);

document.querySelector("#main-img").addEventListener("change", (e) => {
  console.log(e.target.files);
  mainFile = e.target.files[0];
});

document.querySelector("#sub-imgs").addEventListener("change", (e) => {
  console.log(e.target.files);
  for (let i = 0; i < e.target.files.length; i++) {
    subFiles.push(e.target.files[i]);
  }
});
