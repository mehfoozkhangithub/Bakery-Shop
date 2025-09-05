const apiProducts = `https://bakery-shop-l4js.onrender.com/product`;
const apiCart = `https://bakery-shop-l4js.onrender.com/cart`;

const token = sessionStorage.getItem("token");
let path = window.location.pathname.split("/").pop();

const container = document.querySelector("#container");

let allProducts;
let cartLengths;

setTimeout(() => {
  let cartDisplay = document.querySelector(".cartDisplay");

  if (path == `index.html`) {
    cartDisplay.style.display = "block";
    cartDisplay.style.opacity = 1;
  }
}, 100);

// Show skeleton placeholders
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

const renderTheUI = (value) => {
  //  here i am creating the div inside that i am just adding the img
  const prevContainer = document.querySelector(".containers");

  const carouselContainer = document.createElement("div");
  container.innerHTML = ""; // Remove skeletons

  //  here i am doing if i have the container then i will delete the previous one and append the new one....

  if (prevContainer) prevContainer.remove();

  carouselContainer.classList.add("containers");
  carouselContainer.id = "carousel";
  // ✅ append containers only ONCE
  // document.body.prepend(carouselContainer);
  document.body.insertBefore(carouselContainer, container);

  value.forEach((el) => {
    const card = document.createElement("div");
    const img = document.createElement("img");
    card.classList.add("card_div");
    card.innerHTML = `
            <img class="image" src=${el.image} />
            <div class="info" >
                <h3 class="id">id : ${el.id}</h3>
                <p class="category">category : ${el.category}</p>
                <p class="price">price : ₹${el.price}</p>
                <div class="rating">
                    <p>rate : ${el.rating.rate}</p>
                    </div>
                    <button onclick="addToCart(${el.id})" class="btns">add</button>
            </div>
        `;

    card.addEventListener("click", () => detailsPage(el.id));

    img.src = el.image;
    img.alt = `img-${el.id}`;
    img.classList.add("cards-imgs");
    carouselContainer.append(img);

    container.append(card);
  });
};

const addToCart = async (id) => {
  let product = allProducts.find((el) => el.id === id);

  try {
    // check if product already exists in cart
    let res = await fetch(`${apiCart}?id=${id}`);
    let data = await res.json();

    if (data.length > 0) {
      // already in cart → increment count
      let existing = data[0];
      await fetch(`${apiCart}/${existing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: existing.count + 1 }),
      });
      alert("Quantity updated ✔");
    } else {
      // not in cart → add new with count = 1
      await fetch(apiCart, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...product, count: 1 }),
      });

      alert("Added to cart ✔");
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const searchFunc = async () => {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  if (!query) return;

  try {
    let [searchFetch] = await Promise.all([fetch(apiProducts)]);

    const [data1] = await Promise.all([searchFetch.json()]);

    const filtered = await data1.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    renderTheUI(filtered);
    document.querySelector("#search").value = "";
  } catch (err) {
    console.error("Search failed:", err);
  }
};

let pages = 1;
let pageLimits = 9;
let lengthsOfAPI;
let start;
let end;

const pagiDiv = document.querySelector("#pagination");

pagiDiv.innerHTML = `
<button class="btns" id="decrementBtn">-</button>
<span id="countPage">${pages}</span>
<button class="btns" id="incrementBtn">+</button>
`;

const paginationFetch = async (limit = pageLimits, page = pages) => {
  let paginationApi = `https://bakery-shop-l4js.onrender.com/product?_limit=${limit}&_page=${page}`;

  showSkeleton(6); // Show skeletons while loading
  let cartDisplay = document.querySelector(".cartDisplay");

  try {
    const [res1, res2] = await Promise.all([
      fetch(paginationApi),
      fetch(apiCart),
    ]);
    // we have to apply loader into this....
    // console.log('🚀 ~ res1:', res1.ok);
    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    let data = await data1;

    cartLengths = data2.length;
    if (cartLengths) {
      cartDisplay.style.display = "block";
      cartDisplay.textContent = cartLengths;
    } else {
      cartDisplay.style.display = "none";
      cartDisplay.style.opacity = 0;
    }
    // here we have the value of total and just set the total value

    lengthsOfAPI = +res1.headers.get("x-total-count");

    lengthsOfAPI = Math.ceil(lengthsOfAPI / pageLimits);

    allProducts = data;
    renderTheUI(allProducts);
    carosule();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const countPages = document.querySelector("#countPage");
document.querySelector("#incrementBtn").addEventListener("click", () => {
  if (pages >= lengthsOfAPI) {
    document.querySelector("#incrementBtn").disabled = true;
    return;
  } else if (pages > 1) {
    document.querySelector("#decrementBtn").disabled = false;
  }
  pages++;
  countPages.innerText = pages;
  paginationFetch(pageLimits, pages);
  carosule();
});
document.querySelector("#decrementBtn").addEventListener("click", () => {
  if (pages <= 1) {
    document.querySelector("#decrementBtn").disabled = true;
    return;
  } else if (pages < lengthsOfAPI) {
    document.querySelector("#incrementBtn").disabled = false;
  }
  pages--;
  countPages.innerText = pages;
  paginationFetch(pageLimits, pages);
  carosule();
});

const carosule = () => {
  // this is carousel code
  setTimeout(() => {
    const carousel = document.getElementById("carousel");
    const cards = document.querySelectorAll(".cards-imgs");
    let index = 0;
    function autoScroll() {
      index++;
      if (index >= cards.length) index = 0;
      carousel.scrollTo({
        left: cards[index].offsetLeft,
        behavior: "smooth",
      });
    }

    // Auto-scroll every 3s
    let interval = setInterval(autoScroll, 3000);

    // Pause on hover
    carousel.addEventListener("mouseenter", () => clearInterval(interval));
    carousel.addEventListener("mouseleave", () => {
      interval = setInterval(autoScroll, 3000);
    });
  }, 1000);
};

// Filter By Category

let allProductsGlobal = [];

const fetchAllProducts = async () => {
  try {
    const res = await fetch(apiProducts);
    allProductsGlobal = await res.json();
  } catch (err) {
    console.error("Error fetching all products:", err);
  }
};

const filterFunc = async () => {
  let filter = document.querySelector("#filter").value;

  try {
    let res = await fetch(apiProducts);
    let data = await res.json();

    // filter products by category
    let filterArr = data.filter((el) => el.category === filter);

    console.log("FilterArr: ", filterArr); // now works

    renderTheUI(filterArr); // no need for await unless it's async
  } catch (error) {
    console.log("Error: ", error);
  }
};

window.filterFunc = filterFunc;

document.addEventListener("DOMContentLoaded", async () => {
  paginationFetch(pageLimits, pages);
  fetchAllProducts();
  try {
    let res = await fetch(apiProducts);
    let data = await res.json();
    let categories = [...new Set(data.map((el) => el.category))];

    let filterSelect = document.querySelector("#filter");
    filterSelect.innerHTML = `<option value="" class="filterOption">   Select Category   </option>`;
    categories.forEach((cat) => {
      let opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      filterSelect.appendChild(opt);
    });
  } catch (error) {
    console.log("Error populating categories:", error);
  }
});

// PopUp Modal

const detailsPage = async (id) => {
  try {
    // get product details
    let res = await fetch(`${apiProducts}/${id}`);
    let product = await res.json();

    // make modal div
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block"; // show it

    // modal content
    modal.innerHTML = `
        <span class="close">&times;</span>
      <div class="modal-content">
        <img src="${product.image}" alt="Product Image" class="modalImage">
        <h2>${product.title}</h2>
        <p><b>Category:</b> ${product.category}</p>
        <p><b>Description:</b> ${product.description}</p>
        <p><b>Price:</b> ₹${product.price}</p>
        <p><b>Rating:</b> ${product.rating.rate} Star</p>
        <button onclick="addToCart(${product.id})" class="btns1">add</button>
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

const renderImageGallery = async () => {
  try {
    let res = await fetch(apiProducts);
    let products = await res.json();

    const gallery = document.querySelector("#imageGallery");
    gallery.innerHTML = "";

    products.forEach((el) => {
      const img = document.createElement("img");
      img.src = el.image;
      img.alt = `product-${el.id}`;
      gallery.appendChild(img);
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
};

renderImageGallery();
