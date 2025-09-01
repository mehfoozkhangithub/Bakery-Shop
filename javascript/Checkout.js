const apiCheckout = `http://localhost:3000/cart`;

let subTotal;
let grandTotal;

let selectChekoutIndex = [];

let pages = 1;
let pageLimits = 5;
let lengthsOfAPI;
let start;
let end;

const token = sessionStorage.getItem("token");

if (!token || token == "null" || token == "undefined") {
  alert("please login first....");
  window.location = "../pages/Login.html";
}

const showSkeleton = (count = 6) => {
  container.innerHTML = ""; // clear container

  // Create table skeleton
  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><div class="skeleton skeleton-text long"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
            <td><div class="skeleton skeleton-text short"></div></td>
        `;
    tbody.appendChild(row);
  }
  container.appendChild(table);
};

// Pagination

const paginationFetch = async (limit = pageLimits, page = pages) => {
  const res = await fetch(`${apiCheckout}?_limit=${limit}&_page=${page}`);
  const data = await res.json();

  // Calculate total pages from header
  lengthsOfAPI = Math.ceil(+res.headers.get("x-total-count") / pageLimits);

  renderCheckout(data); // only pass data
};

const checkoutFunc = async () => {
  showSkeleton(6);
  paginationFetch(pageLimits, pages);
};

// Pagination End

const renderCheckout = (value) => {
  const container = document.querySelector("#container");
  container.innerHTML = ""; // Remove skeletons
  // Create table

  subTotal = 0; // reset each render
  grandTotal = 0; // reset each render

  const table = document.createElement("table");
  table.innerHTML = `
  <button onclick="deselectFun()" id="deselectBtn">DeSelect</button>
 <button onclick = "selectFun()" id="selectBtn">Select</button>
  <button onclick="deleteFun(id)" id="deleteBtn">Delete</button>
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");

  // Add rows dynamically
  value.forEach((el) => {
    subTotal += el.price * el.count;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="flexDiv">
    <input class="checkBox" type="checkbox" data-id="${
      el.id
    }" onclick="checkFunc(${el.id})" />
            <img src="${el.image}" class="checkoutImage"/> ${el.title}</td>
            <td>₹${el.price}</td>
            <td>
                <button class="btns neg" onclick="decrementCount(${el.id}, ${
      el.count
    })">-</button>
                ${el.count}
                <button class="btns pos" onclick="incrementCount(${el.id}, ${
      el.count
    })">+</button>
            </td>
            <td>₹${el.price * el.count}</td>
        `;
    tbody.appendChild(row);
  });

  // Now recalc grandTotal fresh
  let salesTax = 109.0;
  grandTotal = subTotal + salesTax;

  let deliveryDiplay = [
    { id: 1, title: "subtotal", price: subTotal },
    { id: 2, title: "sales tax", price: salesTax },
    { id: 3, title: "grand total", price: grandTotal },
  ];

  const amountDiv_main = document.createElement("section");
  amountDiv_main.classList.add("main_section_amount");

  const amountDiv_parent_1 = document.createElement("div");
  amountDiv_parent_1.classList.add("parent_1_div_amount");

  deliveryDiplay.map((els) => {
    const amountDiv_child_1 = document.createElement("div");
    amountDiv_child_1.classList.add("child_1_div_amount");

    amountDiv_child_1.innerHTML = `       
        <h3>${els.title}</h3>
        <p>₹${els.price}</p>               
        `;

    amountDiv_parent_1.append(amountDiv_child_1);
  });
  const amountDiv_parent_2 = document.createElement("section");

  amountDiv_parent_2.innerHTML = `
        <div class="checkout_second_section_child">
                <h5>congrats you're eligible for <b>free shiping</b> </h5>
                <img src="../utils/delivery.png" alt="delivery" />
            </div>
            <div class="checkout_btn"><button class="btns" onclick="checkOut()">Check out</button></div>
    `;
  amountDiv_parent_2.classList.add("section_second_amount");

  amountDiv_main.append(amountDiv_parent_1, amountDiv_parent_2);

  //  here i have to crate this ui -> https://pixso.net/tips/shopping-cart-design/

  // Pagination

  const pagiDiv = document.createElement("div");
  pagiDiv.innerHTML = `
  <button class="btns2" id="decrementBtn">Prev</button>
<span id="countPage">${pages} of ${lengthsOfAPI}</span>
<button class="btns3" id="incrementBtn">Next</button>
  `;

  amountDiv_main.prepend(pagiDiv);

  // Pagination End

  container.append(table, amountDiv_main);

  // Pagination Button Function

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
  });

  // Pagination Button Function End
};

const incrementCount = async (id, counts) => {
  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ count: counts + 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const decrementCount = async (id, counts) => {
  if (counts <= 1) {
    await fetch(`${apiCheckout}/${id}`, {
      method: "DELETE",
      Authorization: `Bearer ${token}`,
    });
    alert(`your items delete id number is ${id}`);
    return;
  }

  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ count: counts - 1 }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const deleteToCart = async (id) => {
  try {
    await fetch(`${apiCheckout}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const checkOut = () => {
  // make modal div
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.display = "block"; // show it

  // modal content
  modal.innerHTML = `
      <div class="modal-content1">
        <span class="close">&times;</span>
        <div class="container">

    <form onsubmit="paymentFunc(event)">

        <div class="row">

            <div class="col">

                <h3 class="title">billing address</h3>

                <div class="inputBox">
                    <label>full name :</label>
                    <input type="text" id="user" placeholder="john deo">
                    <span id="username_msg"></span>
                </div>
                <div class="inputBox">
                    <label>Email :</label>
                    <input type="email" id="email" placeholder="example@example.com">
                    <span id="email_msg"></span>
                </div>
                <div class="inputBox">
                     <label>Address :</label>
                    <input type="text" id="address" placeholder="room - street - locality" required>
                </div>
                <div class="inputBox">
                      <label>City :</label>
                    <input type="text" id="city" placeholder="mumbai" required>
                </div>

                <div class="flex">
                    <div class="inputBox">
                          <label>State :</label>
                        <input type="text" id="state" placeholder="Maharashtra" required>
                    </div>
                    <div class="inputBox">
                          <label>Zip Code :</label>
                        <input type="number" id="zipCode" placeholder="123 456">
                        <span id="zipCode_msg"></span>
                    </div>
                </div>

            </div>

            <div class="col">

                <h3 class="title">payment</h3>

                <div class="inputBox">
                    <span>cards accepted :</span>
                    <img src="../utils/card_img.png" alt="" class="cardImg">
                </div>
                <div class="inputBox">
                    <label>Name on card :</label>
                    <input type="text" id="cardName" placeholder="mr. john deo">
                    <span id="cardname_msg"></span>
                </div>
                <div class="inputBox">
                    <label>Credit card number :</label>
                    <input type="number" id="cardNumber" placeholder="1111-2222-3333-4444">
                    <span id="cardnumber_msg"></span>
                </div>
                <div class="inputBox">
                    <label>Exp month :</label>
                    <input type="text" id="expMonth" placeholder="january" required>

                </div>

                <div class="flex">
                    <div class="inputBox">
                         <label>Exp year :</label>
                        <input type="number" id="expYear" placeholder="2025" required>
                    </div>
                    <div class="inputBox">
                         <label>CVV :</label>
                        <input type="text" id="cardCvv" placeholder="123">
                        <span id="cardcvv_msg"></span>
                    </div>
                </div>

            </div>
    
        </div>

        <input type="submit" value="proceed to checkout" class="submit-btn">

    </form>

  </div>
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
};

function paymentFunc(e) {
  e.preventDefault();
  let userName = document.getElementById("user").value;
  let userEmail = document.getElementById("email").value;
  let zipCode = document.getElementById("zipCode").value;
  let cardName = document.getElementById("cardName").value;
  let cardNumber = document.getElementById("cardNumber").value;
  let cardCvv = document.getElementById("cardCvv").value;

  // ==== user validation =====

  if (userName == "") {
    document.getElementById("username_msg").innerHTML =
      "please fill the username field";
    document.getElementById("username_msg").style.color = "gray";
    return false;
  } else if (userName.length <= 2 || userName.length > 20) {
    document.getElementById("username_msg").innerHTML =
      "please enter the length between 2 to 20";
    document.getElementById("username_msg").style.color = "gray";
    return false;
  } else if (!isNaN(userName)) {
    document.getElementById("username_msg").innerHTML =
      "Only characters are allowed";
    document.getElementById("username_msg").style.color = "gray";
    return false;
  } else {
    document.getElementById("username_msg").innerHTML = "";
  }

  // ==== email Validation ====

  if (userEmail == "") {
    document.getElementById("email_msg").innerHTML =
      " Please fill the email field";
    document.getElementById("email_msg").style.color = "gray";
    return false;
  } else if (userEmail.indexOf("@") <= 0) {
    document.getElementById("email_msg").innerHTML = " @ Invalid Position.";
    return false;
  }
  //length 19
  else if (
    userEmail.charAt(userEmail.length - 4) != "." &&
    userEmail.charAt(userEmail.length - 3) != "."
  ) {
    document.getElementById("email_msg").innerHTML = " Invalid Position.";
    return false;
  } else {
    document.getElementById("email_msg").innerHTML = "";
  }

  // ==== zip code Validation ====

  if (zipCode == "") {
    document.getElementById("zipCode_msg").innerHTML =
      "please fill the zipcode field";
    document.getElementById("zipCode_msg").style.color = "gray";
    return false;
  } else if (zipCode.length < 6 || zipCode.length > 6) {
    document.getElementById("zipCode_msg").innerHTML =
      "please enter the length of 6 ";
    document.getElementById("zipCode_msg").style.color = "gray";
    return false;
  } else if (isNaN(zipCode)) {
    document.getElementById("zipCode_msg").innerHTML =
      "Only number are allowed";
    document.getElementById("zipCode_msg").style.color = "gray";
    return false;
  } else {
    document.getElementById("zipCode_msg").innerHTML = "";
  }

  // ==== name on card validation =====

  if (cardName == "") {
    document.getElementById("cardname_msg").innerHTML =
      "please fill the cardname field";
    document.getElementById("cardname_msg").style.color = "gray";
    return false;
  } else if (cardName.length <= 2 || cardName.length > 20) {
    document.getElementById("cardname_msg").innerHTML =
      "please enter the length between 2 to 20";
    document.getElementById("cardname_msg").style.color = "gray";
    return false;
  } else if (!isNaN(cardName)) {
    document.getElementById("cardname_msg").innerHTML =
      "Only characters are allowed";
    document.getElementById("cardname_msg").style.color = "gray";
    return false;
  } else {
    document.getElementById("cardname_msg").innerHTML = "";
  }

  // ==== card number Validation ====

  if (cardNumber == "") {
    document.getElementById("cardnumber_msg").innerHTML =
      "please fill the cardnumber field";
    document.getElementById("cardnumber_msg").style.color = "gray";
    return false;
  } else if (cardNumber.length < 16 || cardNumber.length > 16) {
    document.getElementById("cardnumber_msg").innerHTML =
      "please enter the length of 16 ";
    document.getElementById("cardnumber_msg").style.color = "gray";
    return false;
  } else if (isNaN(cardNumber)) {
    document.getElementById("cardnumber_msg").innerHTML =
      "Only number are allowed";
    document.getElementById("cardnumber_msg").style.color = "gray";
    return false;
  } else {
    document.getElementById("cardnumber_msg").innerHTML = "";
  }

  // ==== CVV Validation ====

  if (cardCvv == "") {
    document.getElementById("cardcvv_msg").innerHTML =
      "please fill the cardnumber field";
    document.getElementById("cardcvv_msg").style.color = "gray";
    return false;
  } else if (cardCvv.length < 3 || cardCvv.length > 3) {
    document.getElementById("cardcvv_msg").innerHTML =
      "please enter the length of 3 ";
    document.getElementById("cardcvv_msg").style.color = "gray";
    return false;
  } else if (isNaN(cardCvv)) {
    document.getElementById("cardcvv_msg").innerHTML =
      "Only number are allowed";
    document.getElementById("cardcvv_msg").style.color = "gray";
    return false;
  } else {
    document.getElementById("cardcvv_msg").innerHTML = "";
  }
}

// Select DeSelect & Delete Button

function selectFun() {
  let checkBox = document.querySelectorAll(".checkBox");
  let checkBoxlen = checkBox.length;
  console.log(checkBox[0].dataset.id, checkBoxlen);

  for (let i = 0; i < checkBoxlen; i++) {
    checkBox[i].checked = true;
    selectChekoutIndex.push(+checkBox[i].dataset.id);
  }
  console.log(selectChekoutIndex);
  toggle = true;
  let selectBtn = document.querySelector("#selectBtn");
  let deselectBtn = document.querySelector("#deselectBtn");

  if (selectBtn) selectBtn.style.display = "none";
  if (deselectBtn) deselectBtn.style.display = "inline-block";
}

function deselectFun() {
  if (toggle === true) {
    let checkBox = document.querySelectorAll(".checkBox");
    let checkBoxlen = checkBox.length;

    for (let i = 0; i < checkBoxlen; i++) {
      checkBox[i].checked = false;
    }
    let selectBtn = document.querySelector("#selectBtn");
    let deselectBtn = document.querySelector("#deselectBtn");

    if (selectBtn) selectBtn.style.display = "inline-block";
    if (deselectBtn) deselectBtn.style.display = "none";
  }
}

function deleteFun() {
  // console.log(selectChekoutIndex);
  selectChekoutIndex = [...new Set(selectChekoutIndex)];

  if (selectChekoutIndex.length === 0) {
    alert("No items selected for deletion.");
    return;
  }
  selectChekoutIndex.map(async (el) => {
    console.log(el);

    await fetch(`${apiCheckout}/${el}`, {
      method: "DELETE",
    });
  });
}

function checkFunc(id) {
  selectChekoutIndex.push(id);
  console.log(selectChekoutIndex);
}
