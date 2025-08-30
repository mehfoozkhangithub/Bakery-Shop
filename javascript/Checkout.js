const apiCheckout = `http://localhost:3000/cart`;

let subTotal;
let grandTotal;

const token = sessionStorage.getItem('token');

if (!token || token == "null" || token == "undefined") {
    alert('please login first....');
    window.location = '../pages/Login.html';
}


const showSkeleton = (count = 6) => {
    container.innerHTML = ''; // clear container

    // Create table skeleton
    const table = document.createElement('table');
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

    const tbody = table.querySelector('tbody');

    for (let i = 0; i < count; i++) {
        const row = document.createElement('tr');
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

const checkoutFunc = async () => {
    showSkeleton(6); // Show skeletons while loading
    let apiCheckout_fetch = await fetch(apiCheckout);
    let data_checkout = await apiCheckout_fetch.json();

    renderCheckout(data_checkout);
};
/* 
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
                <button onclick="deleteToCart(${el.id})" class="btns deletes">delete</button>
                <div class="paginationCount">
                <button class="btns neg" onclick="decrementCount(${el.id},${el.count})">-</button>
                <span class="count">${el.count}</span>
                <button class="btns pos" onclick="incrementCount(${el.id},${el.count})">+</button>
                </div>
                </div>
            </div>
*/

const renderCheckout = (value) => {
    const container = document.querySelector('#container')
    container.innerHTML = ''; // Remove skeletons
    // Create table

    subTotal = 0;      // reset each render
    grandTotal = 0;    // reset each render

    const table = document.createElement('table');
    table.innerHTML = `
     <button onclick="deselectFun()" id="deselectBtn">DeSelect</button>
 <button onclick = "selectFun()" id="selectBtn">Select</button>
  <button onclick="deleteFun()" id="deletBtn">Delete</button>
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

    const tbody = table.querySelector('tbody');

    // Add rows dynamically
    value.forEach((el) => {

        subTotal += el.price * el.count;

        const row = document.createElement('tr');
        row.innerHTML = `
         <input class="checkBox" type="checkbox" />
            <td>${el.title}</td>
            <td>₹${el.price}</td>
            <td>
                <button class="btns neg" onclick="decrementCount(${el.id}, ${el.count})">-</button>
                ${el.count}
                <button class="btns pos" onclick="incrementCount(${el.id}, ${el.count})">+</button>
            </td>
            <td>₹${el.price * el.count}</td>
        `;
        tbody.appendChild(row);
    });

    // Now recalc grandTotal fresh
    let salesTax = 109.00;
    grandTotal = subTotal + salesTax;

    let deliveryDiplay = [
        { id: 1, title: "subtotal", price: subTotal },
        { id: 2, title: "sales tax", price: salesTax },
        { id: 3, title: "grand total", price: grandTotal },
    ];


    const amountDiv_main = document.createElement('section');
    amountDiv_main.classList.add('main_section_amount');

    const amountDiv_parent_1 = document.createElement('div');
    amountDiv_parent_1.classList.add('parent_1_div_amount');

    deliveryDiplay.map((els) => {
        const amountDiv_child_1 = document.createElement('div');
        amountDiv_child_1.classList.add('child_1_div_amount');

        amountDiv_child_1.innerHTML = `       
        <h3>${els.title}</h3>
        <p>$${els.price}</p>               
        `
        amountDiv_parent_1.append(amountDiv_child_1)
    });

    const amountDiv_parent_2 = document.createElement('section');

    amountDiv_parent_2.innerHTML = `
        <div class="checkout_second_section_child">
                <h5>congrats you're eligible for <b>free shiping</b> </h5>
                <img src="../utils/delivery.png" alt="delivery" />
            </div>
            <div class="checkout_btn"><button class="btns">Check out</button></div>
    `
    amountDiv_parent_2.classList.add("section_second_amount");

    amountDiv_main.append(amountDiv_parent_1, amountDiv_parent_2);


    //  here i have to crate this ui -> https://pixso.net/tips/shopping-cart-design/


    container.append(table, amountDiv_main);
};

const incrementCount = async (id, counts) => {

    try {
        await fetch(`${apiCheckout}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ count: counts + 1 }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

    } catch (error) {
        console.log('🚀 ~ error:', error);

    }
}

const decrementCount = async (id, counts) => {

    if (counts <= 1) {
        await fetch(`${apiCheckout}/${id}`, {
            method: 'DELETE',
            "Authorization": `Bearer ${token}`
        });
        alert(`your items delete id number is ${id}`)
        return
    }

    try {
        await fetch(`${apiCheckout}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ count: counts - 1 }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
    } catch (error) {
        console.log('🚀 ~ error:', error);

    }
}


const deleteToCart = async (id) => {
    try {
        await fetch(`${apiCheckout}/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
    } catch (error) {
        console.log('🚀 ~ error:', error);

    }
};


// checkout button

function selectFun() {
    let checkBox = document.querySelectorAll(".checkBox");
    let checkBoxlen = checkBox.length;
    for (let i = 0; i < checkBoxlen; i++) {
        checkBox[i].checked = true;
    }
        
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
    let checkBoxes = document.querySelectorAll(".checkBox");
    
    checkBoxes.forEach(function(checkBox) {
        if (checkBox.checked) {
            // Remove the parent element of the checkbox
            // Adjust this as needed depending on your HTML structure
            checkBox.parentElement.remove();
        }
    });

    // Optionally, show the select button again
    let selectBtn = document.querySelector("#selectBtn");
    let deselectBtn = document.querySelector("#deselectBtn");

    if (selectBtn) selectBtn.style.display = "inline-block";
    if (deselectBtn) deselectBtn.style.display = "none";
}