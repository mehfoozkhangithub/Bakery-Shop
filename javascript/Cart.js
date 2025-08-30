const container = document.querySelector("#container");

let cartLengths;

let cartApi;

let currentPage = 1;
const itemsPerPage = 6;
let cartData = [];

let token = sessionStorage.getItem("token");

let path = window.location.pathname.split("/").pop();

if (!token || token == "null" || token == "undefined") {
  alert("please login first....");
  window.location = "../pages/Login.html";
}

setTimeout(() => {
  let cartDisplay = document.querySelector(".cartDisplay");

  if (path == `Cart.html`) {
    cartDisplay.style.display = "block";
    cartDisplay.style.opacity = 1;
  }
}, 100);

const cardFetch = async () => {
  showSkeleton(itemsPerPage);

  try {
    let res = await fetch("http://localhost:3000/cart");
    let data = await res.json();

    cartLengths = data.length;
    cartData = data;

    // 👉 just render only current page items
    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedData = data.slice(start, end);

    if (cartLengths) {
      document.querySelector(".cartDisplay").textContent = cartLengths;
    }

    cardRenderUI(paginatedData);
    renderPaginatedUI();
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const showSkeleton = (count = 6) => {
  container.innerHTML = ""; // clear container
  for (let i = 0; i < count; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.classList.add("card_div");
    skeletonCard.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="info">
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text long"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text long"></div>
            </div>
        `;
    container.appendChild(skeletonCard);
  }
};

const cardRenderUI = (value) => {
  container.innerHTML = ""; // Remove skeletons
  value.forEach((el) => {
    const card = document.createElement("div");
    card.classList.add("card_div");
    card.innerHTML = `
            <img class="image" src=${el.image} />
            <div class="info">
                <h3 class="id">id : ${el.id}</h3>
                <p class="category">title : ${el.title}</p>
                <p class="category">category : ${el.category}</p>
                <p class="price">price : ${el.price}</p>
                <p class="description">description : ${el.description}</p>
                <div class="rating">
                    <p>rate : ${el.rating.rate}</p>
                    <p>count : ${el.count}</p>
                </div>
                <div class="btn_count">
                <button onclick="goToCheckout()" class="btns checkout">checkout</button>
               </div>
            </div>
        `;
    card.addEventListener("click", () => detailsPage(el.id));
    container.appendChild(card);
  });
};

function getBasePath(path) {
  // remove "index.html" if it exists anywhere
  path = path.replace("index.html", "");

  // find where "/pages/" starts
  let index = path.indexOf("/pages/");

  if (index !== -1) {
    // keep everything before "/pages/"
    path = path.substring(0, index);
  }

  // ✅ normalize multiple slashes to a single slash
  path = path.replace(/\/{2,}/g, "/");

  // ✅ always ensure trailing slash
  if (!path.endsWith("/")) {
    path += "/";
  }

  return path;
}

let fullPath = window.location.pathname;

let basePath = getBasePath(fullPath);

const goToCheckout = () => {
  window.location.pathname = `${basePath}pages/Checkout.html`;
};

// PopUp Modal

const detailsPage = async (id) => {
  try {
    // get product details
    let res = await fetch(`http://localhost:3000/cart/${id}`);
    let product = await res.json();

    // make modal div
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block"; // show it

    // modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <img src="${product.image}" alt="Product Image" class="modalImage">
        <h2>${product.title}</h2>
        <p><b>Category:</b> ${product.category}</p>
        <p><b>Description:</b> ${product.description}</p>
        <p><b>Price:</b> ₹${product.price}</p>
        <p><b>Rating:</b> ${product.rating.rate} Star</p>
        <p><b>Count:</b> ${product.count}</p>
      </div>
    `;

    // add modal to body
    document.body.appendChild(modal);

    // close when clicking X
    modal.querySelector(".close").onclick = () => modal.remove();

    // close when clicking outside the box
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    };
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Pagination

function renderPaginatedUI() {
  container.innerHTML = "";
  let start = (currentPage - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  let pageItems = cartData.slice(start, end);
  cardRenderUI(pageItems);
  renderPaginationControls();
}

function renderPaginationControls() {
  let oldControls = document.querySelector(".pagination-controls");
  if (oldControls) oldControls.remove();
  const controls = document.createElement("div");
  controls.className = "pagination-controls";
  controls.innerHTML = `
    <button ${currentPage === 1 ? "disabled" : ""} id="prevBtn">Prev</button>
    <span>Page ${currentPage}</span>
    <button ${
      currentPage === Math.ceil(cartData.length / itemsPerPage)
        ? "disabled"
        : ""
    } id="nextBtn">Next</button>
  `;
  const footer = document.getElementById("footers");
  footer.parentNode.insertBefore(controls, footer);
  document.getElementById("prevBtn").onclick = () => {
    currentPage--;
    renderPaginatedUI();
  };
  document.getElementById("nextBtn").onclick = () => {
    currentPage++;
    renderPaginatedUI();
  };
}
