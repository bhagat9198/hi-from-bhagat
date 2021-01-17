const db = firebase.firestore();
const firebaseStorage = firebase.storage();

const portfolioDetailsHTML = document.querySelector('#portfolio-details');

db.collection('applications').onSnapshot(appSnaps => {
  let appSnapsDocs = appSnaps.docs;
  let eachAppDetails = '';
  appSnapsDocs.map(doc => {
    let docData = doc.data();
    let subImgs = '';
    if(docData.subImgsUrl) {
      docData.subImgsUrl.map(subUrl => {
        subImgs += `
        <img
          src="${subUrl}"
          class="img-fluid img-fluid-webBanner"
          alt="${docData.name} | BHAGAT SINGH"
        />
        `;
      })
    }
    let credInfo = '';

    
    if(docData.admin || docData.user) {
      let adminInfo = '';
      let userInfo = '';

      credInfo = `
      <li ><strong>Credentials</strong>
        <ul>
      `;

      if(docData.admin) {
        adminInfo = `<li class="cred-li"><strong>Admin</strong>: `;
        let eachAdminInfo = '';
        docData.admin.map(admin => {
          eachAdminInfo += `
          <ul class="cred-ul">
            <li><strong>Email</strong>: ${admin.email}</li>
            <li><strong>Password</strong>: ${admin.password}</li>
          </ul> 
          `;
        })
        adminInfo = adminInfo + eachAdminInfo + `</li>`;
        credInfo += adminInfo;
      }
  
      if(docData.user) {
        userInfo = `<li class="cred-li"><strong>User</strong>: `;
        let eachUserInfo = '';
        docData.user.map(user => {
          eachUserInfo += `
          <ul class="cred-ul">
            <li><strong>Email</strong>: ${user.email}</li>
            <li><strong>Password</strong>: ${user.password}</li>
          </ul> 
          `;
        })
        userInfo = userInfo + eachUserInfo + `</li>`;
        credInfo += userInfo;
      }

      credInfo += `</ul></li>`;

    }
    

    eachAppDetails += `
    <div class="container container-application ${docData.appId}">
      <h3 class="container-heading">${docData.name}</h3>
      <div class="portfolio-details-container">
        <div class="owl-carousel portfolio-details-carousel">
          <img
            src="${docData.mainImgUrl}"
            class="img-fluid img-fluid-webBanner"
            alt="${docData.name} | BHAGAT SINGH"
          />
          ${subImgs}
        </div>
      </div>
      <div class="portfolio-description row">
        <div class="portfolio-info col-lg-5 col-md-5 col-sm-12">
          <h3>Project information</h3>
          <ul>
            <li class="main-li"><strong>Type</strong>: ${docData.type}</li>
            <li class="main-li"><strong>Frontend</strong>: ${docData.frontend}</li>
            <li class="main-li"><strong>Backend</strong>: ${docData.backend}</li>
            <li class="main-li">
              <strong>Project URL</strong>: <a href="#">${docData.link}</a>
            </li>
            ${credInfo}
          </ul>
        </div>
        <div class="portfolio-info col-lg-1 col-md-1 col-sm-12"></div>
        <div class="portfolio-des col-lg-6 col-md-6 col-sm-12">
          ${docData.describtion}
        </div>
      </div>
    </div>
    `;
    console.log(docData);
  });
  portfolioDetailsHTML.innerHTML = '';
  portfolioDetailsHTML.innerHTML = eachAppDetails;
  $(".portfolio-details-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });
})