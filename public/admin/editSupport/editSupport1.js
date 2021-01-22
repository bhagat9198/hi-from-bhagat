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
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#supportModal" >
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
