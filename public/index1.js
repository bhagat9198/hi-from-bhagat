console.log("index1.js");
const db = firebase.firestore();
const firebaseStorage = firebase.storage();
const contactFormHTML = document.querySelector("#contact-form");

const contactFormSubmit = (e) => {
  contactFormHTML.querySelector(".loading").style.display = "block";
  e.preventDefault();
  const subject = contactFormHTML["subject"].value;
  if (subject === "Choose Your Subject") {
    contactFormHTML.querySelector(".loading").style.display = "none";
    contactFormHTML.querySelector(".error-message").style.display = "block";
    contactFormHTML.querySelector(
      ".error-message"
    ).innerHTML = `Please select a valid subject 🧐`;
    setTimeout(() => {
      contactFormHTML.querySelector(".error-message").style.display = "none";
    }, 3000);
    return;
  }

  const name = contactFormHTML["name"].value;
  const definedAs = contactFormHTML["definedAs"].value;
  const email = contactFormHTML["email"].value;
  const message = contactFormHTML["message"].value;

  db.collection("contacts")
    .add({
      name: name,
      definedAs: definedAs,
      email: email,
      subject: subject,
      message: message,
    })
    .then((savedData) => {
      // console.log("data Saved");
      contactFormHTML.reset();
      contactFormHTML.querySelector(".loading").style.display = "none";
      contactFormHTML.querySelector(".sent-message").style.display = "block";
      setTimeout(() => {
        contactFormHTML.querySelector(".sent-message").style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      // console.log(error);
      // console.log(error.message);
      contactFormHTML.querySelector(".error-message").style.display = "block";
      contactFormHTML.querySelector(".error-message").innerHTML = error.message;
      setTimeout(() => {
        contactFormHTML.querySelector(".error-message").style.display = "none";
      }, 3000);
    });
};

contactFormHTML.addEventListener("submit", contactFormSubmit);

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const supportFormHTML = document.querySelector("#support-form");
let imgFile;
const supportFormSubmit = (e) => {
  e.preventDefault();
  document.querySelector("#support-form .loading").style.display = "block";
  const userAvtar = supportFormHTML["user-avatar"].value;
  let avatarData = false;
  if (!(userAvtar || imgFile)) {
    // console.log('error');
    document.querySelector("#support-form .loading").style.display = "none";
    document.querySelector("#support-form .error-message").style.display =
      "block";
    document.querySelector(
      "#support-form .error-message"
    ).innerHTML = `Please add your image or select an avatar.😅`;
    setTimeout(() => {
      document.querySelector("#support-form .error-message").style.display =
        "none";
    }, 2000);
    return;
  } else {
    if (imgFile) {
    } else {
      avatarData = {};
      if (userAvtar === "av1") {
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
  const name = supportFormHTML["name"].value;
  const definedAs = supportFormHTML["definedAs"].value;
  const email = supportFormHTML["email"].value;
  const message = supportFormHTML["message"].value;

  db.collection("support")
    .add({
      name: name,
      definedAs: definedAs,
      email: email,
      message: message,
      avatar: avatarData,
      imgUrl: false,
    })
    .then(async (savedData) => {
      // console.log("data saved");
      if (imgFile) {
        await firebaseStorage
          .ref("support")
          .child(savedData.id + "/" + imgFile.name)
          .put(imgFile);
        let imgUrl;
        await firebaseStorage
          .ref("support")
          .child(savedData.id + "/" + imgFile.name)
          .getDownloadURL()
          .then((url) => {
            imgUrl = url;
          })
          .catch((error) => {
            console.log(error);
          });
        let uRef = await db.collection("support").doc(savedData.id);

        uRef.update("imgUrl", { name: imgFile.name, url: imgUrl });
      }
      document.querySelector("#support-form .loading").style.display = "none";
      document.querySelector("#support-form .sent-message").style.display =
        "block";
      setTimeout(() => {
        document.querySelector("#support-form .sent-message").style.display =
          "none";
      }, 3000);
      supportFormHTML.querySelectorAll("img").forEach((imgEl) => {
        imgEl.classList.remove("selected-avatar");
      });
      supportFormHTML.reset();
      document.querySelector("#user-img").value = "";
    })
    .catch((error) => {
      console.log(error);
      document.querySelector("#support-form .error-message").style.display =
        "block";
      document.querySelector("#support-form .error-message").innerHTML =
        error.message;
      setTimeout(() => {
        document.querySelector("#support-form .error-message").style.display =
          "none";
      }, 2000);
    });
};

supportFormHTML.addEventListener("submit", supportFormSubmit);

document.querySelector("#user-img").addEventListener("change", (e) => {
  imgFile = e.target.files[0];
});

supportFormHTML
  .querySelectorAll("input[name=user-avatar]")
  .forEach((element) => {
    element.addEventListener("change", (e) => {
      // console.log(e.target.value);
      let selectAvId = e.target.value;
      selectAvId = `img-${selectAvId}`;
      supportFormHTML.querySelectorAll("img").forEach((imgEl) => {
        if (imgEl.id === selectAvId) {
          imgEl.classList.add("selected-avatar");
        } else {
          imgEl.classList.remove("selected-avatar");
        }
      });
    });
  });

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const allTestimonials = document.querySelector(".all-testimonials");

db.collection("support").onSnapshot((snapSupport) => {
  let snapSupportDocs = snapSupport.docs;

  let eachTestimonial = "";
  snapSupportDocs.forEach((snapDoc) => {
    let snapData = snapDoc.data();
    let imgSrc = "";
    if (snapData.avatar || snapData.imgUrl) {
      if (snapData.avatar) {
        imgSrc = `./assets/img/avatars/${snapData.avatar.img}.png`;
      }
      if (snapData.imgUrl) {
        imgSrc = snapData.imgUrl.url;
      }
    } else {
      let rand = Math.floor(Math.round() * (4 - 1) + 1);
      imgSrc = `./assets/img/avatars/av${rand}.png`;
    }

    eachTestimonial += `
    <div class="testimonial-item" data-aos="fade-up">
      <p>
        <i class="bx bxs-quote-alt-left quote-icon-left"></i>
       ${snapData.message}
        <i class="bx bxs-quote-alt-right quote-icon-right"></i>
      </p>
      <img
        src="${imgSrc}"
        class="testimonial-img"
        alt="${snapData.name} | Bhagat Singh"
      />
      <h3>${snapData.name}</h3>
      <h4>${snapData.definedAs}</h4>
    </div>
    `;
  });
  allTestimonials.innerHTML = "";
  allTestimonials.innerHTML = eachTestimonial;

  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
      900: {
        items: 3,
      },
    },
  });
});

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const allPortfolioHTML = document.querySelector(".all-portfolio");

db.collection("applications").onSnapshot((appSnaps) => {
  let appSnapsDocs = appSnaps.docs;

  let eachPortfolio = "";
  appSnapsDocs.forEach((appDoc) => {
    let appData = appDoc.data();
    eachPortfolio += `
    <div class="col-lg-4 col-md-6 portfolio-item filter-app">
      <div class="portfolio-wrap">
        <img
          src="${appData.mainImgUrl.url}"
          class="img-banner"
          alt="${appData.appId} | Bhagat Singh"
        />
        <div class="portfolio-links">
          <a
            href="${appData.mainImgUrl.url}"
            data-gall="portfolioGallery"
            class="venobox"
            title="App 1"
            ><i class="bx bx-plus"></i
          ></a>
          <a href="./applications-details/applications-details.html#${appData.appId}" title="More Details"
            ><i class="bx bx-link"></i
          ></a>
        </div>
      </div>
    </div>
    `;
  });
  console.log(allPortfolioHTML);
  allPortfolioHTML.innerHTML = "";
  allPortfolioHTML.innerHTML = eachPortfolio;
  var portfolioIsotope = $(".portfolio-container").isotope({
    itemSelector: ".portfolio-item",
    layoutMode: "fitRows",
  });

  $("#portfolio-flters li").on("click", function () {
    $("#portfolio-flters li").removeClass("filter-active");
    $(this).addClass("filter-active");

    portfolioIsotope.isotope({
      filter: $(this).data("filter"),
    });
    aos_init();
  });

  // Initiate venobox (lightbox feature used in portofilo)
  $(document).ready(function () {
    $(".venobox").venobox();
  });

  $(".portfolio-details-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1,
  });
});
