console.log("editSupport1");

const db = firebase.firestore();
const firebaseStorage = firebase.storage();

let ALL_SUPPORTS = [];
const allSupportsHTML = document.querySelector(".all-supports");

db.collection("support").onSnapshot((supportSnaps) => {
  let supportSnapsDocs = supportSnaps.docs;
  ALL_SUPPORTS = [];
  supportSnapsDocs.forEach((supportDoc) => {
    let data = supportDoc.data();
    ALL_SUPPORTS.push({ data: data, id: supportDoc.id });
  });
  displayAllCards();
});

const displayAllCards = () => {
  let eachCard = "";
  ALL_SUPPORTS.map((wholeCard, cardIndex) => {
    let card = wholeCard.data;
    let img = "";
    img = `<p>Img No Available</p>`;
    if (card.avatar) {
      img = `
      <img
        class="card-img-top"
        src="./../../assets/img/avatars/${card.avatar.img}.png"
        alt="Bhagat Singh"
      />
      `;
    }
    if (card.imgUrl) {
      img = `
       <img
        class="card-img-top"
        src="${card.imgUrl.url}"
        alt="Bhagat Singh"
      />`;
    }

    eachCard += `
    <div class="col-lg-4 col-md-6 col-sm-12 each-card card-${cardIndex}">
      <div class="card">
        <div class="text-center img-holder-support">
          ${img}
        </div>
        <div class="card-body">
          <h4 class="card-title"><b>${card.name}</b></h4>
          <h6 class="card-title">${card.email}</h6>
          <h6 class="card-title"><i>${card.definedAs}</i></h6>
          <hr>
          <p class="card-text">
            ${card.message}
          </p>
          <div class="text-center">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#supportModal" onclick="viewSupportModal(event, this)" data-index="${cardIndex}">
              Edit 
            </button>
            <button type="button" class="btn btn-danger" data-index="${cardIndex}" onclick="deleteSupport(event, this)">
              Delete 
            </button>
          </div>
        </div>
      </div>
    </div>
    `;
  });
  allSupportsHTML.innerHTML = "";
  allSupportsHTML.innerHTML = eachCard;
};

const deleteSupport = (e, current) => {
  let deleteStatus = confirm("Sure you want delete");
  if (deleteStatus) {
    let index = e.target.dataset.index;
    if (ALL_SUPPORTS[index].data.imgUrl) {
      firebaseStorage
        .ref("support")
        .child(
          `${ALL_SUPPORTS[index].id}/${ALL_SUPPORTS[index].data.imgUrl.name}`
        )
        .delete()
        .then(() => {
          console.log("img deleted");
        })
        .catch((error) => {
          console.log(error);
          alert("Error: ", error.message);
        });
    }

    db.collection("support")
      .doc(ALL_SUPPORTS[index].id)
      .delete(() => {
        console.log("Doc deleted");
      })
      .catch((error) => {
        console.log(error);
        alert("Error : ", error.message);
      });
  } else {
    //  not delete
  }
};


const viewSupportModal = (e, current) => {
  let index = e.target.dataset.index;
  let data = ALL_SUPPORTS[index].data;

  if(data.imgUrl) {
    supportFormHTML.querySelector('#modal-main-img').src = data.imgUrl.url;
  } else if(data.avatar) {
    supportFormHTML.querySelector('#modal-main-img').src = `./../../assets/img/avatars/${data.avatar.img}.png`
  } else {
    supportFormHTML.querySelector('#modal-main-img').src = `./../../assets/img/unavailable.png`;
  }
  supportFormHTML.querySelector('#modal-main-img').alt = `${data.name} | Bhagat Singh`;

  supportFormHTML['name'].value = data.name;
  supportFormHTML['definedAs'].value = data.definedAs;
  supportFormHTML['email'].value = data.email;
  supportFormHTML['message'].value = data.message;

  supportFormHTML.querySelector('#supportModalTitle').innerHTML = data.name;

}


const supportFormHTML = document.querySelector('#support-form');
let imgFile;
let userAvtar;

supportFormHTML
.querySelectorAll("input[name=user-avatar]")
.forEach((element) => {
  console.log(element);
  element.addEventListener("change", (e) => {
    console.log(e.target.value);
    let selectAvId = e.target.value;
    userAvtar = selectAvId;
    selectAvId = `img-${selectAvId}`;
    supportFormHTML.querySelectorAll("img").forEach((imgEl) => {
      console.log('aaa');
      if (imgEl.id === selectAvId) {
        console.log('lol');
        imgEl.classList.add("selected-avatar");
      } else {
        imgEl.classList.remove("selected-avatar");
      }
    });
  });
});

const supportFormSubmit = e => {
  e.preventDefault();
  const name = supportFormHTML["name"].value;
  const definedAs = supportFormHTML["definedAs"].value;
  const email = supportFormHTML["email"].value;
  const message = supportFormHTML["message"].value;

  if (imgFile) {
  } else {
    avatarData = {};
    if (userAvtar === "av1") {
      console.log('hi');
      avatarData.category = "boy";
      avatarData.img = "av1";
    } else if (userAvtar === "av2") {
      avatarData.category = "girl";
      avatarData.img = "av2";
    } else if (userAvtar === "av3") {
      avatarData.category = "men";
      avatarData.img = "av3";
    } else if (userAvtar === "av4") {
      avatarData.category = "women";
      avatarData.img = "av4";
    } else {
      // nothing
    }
  }


}

supportFormHTML.addEventListener('click', supportFormSubmit);


supportFormHTML.querySelector('#user-img').addEventListener('change', e => {
  imgFile = e.target.files[0];
})


///////////////////////////////////////////////////////////////////////////


// db.collection('support').get().then(ss => {
//   let ssd = ss.docs; 

//   ssd.forEach(async(doc) => {
//     let ref = await db.collection('support').doc(doc.id);
//     let data = doc.data();
//     data.statusVisible = true;
//     await ref.update(data);
//   })
// })  