let token = sessionStorage.getItem("token");

let path = window.location.pathname.split("/").pop();

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

setTimeout(() => {
  let cartDisplay = document.querySelector(".cartDisplay");
  // console.log('    🚀 ~ cartDisplay:', cartDisplay);

  if (path == `Login.html` || path == "Login.html") {
    cartDisplay.style.display = "none";
    cartDisplay.style.opacity = 0;
  }
}, 100);

const loginForm = async (e) => {
  e.preventDefault();

  const apiLogin = `http://localhost:3000/login`;

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#pass").value;
  const age = document.querySelector("#age").value;
  const gender = document.querySelector("input[name='content']:checked")?.value;

  document.getElementById("email_message").innerHTML = "";
  document.getElementById("pass_message").innerHTML = "";
  document.getElementById("age_message").innerHTML = "";
  document.getElementById("gender_message").innerHTML = "";

  // Email Validation

  if (email === "") {
    document.getElementById("email_message").innerHTML =
      "Please Fill The Email Field";
    return false;
  } else if (email.indexOf("@") <= 0) {
    document.getElementById("email_message").innerHTML = "Invalid Email";
    return false;
  } else if (
    email.charAt(email.length - 4) !== "." &&
    email.charAt(email.length - 3) !== "."
  ) {
    document.getElementById("email_message").innerHTML = "Invalid Email Domain";
    return false;
  }

  // Password Validation

  if (password !== null) {
    if (password.trim() === "") {
      document.getElementById("pass_message").innerHTML =
        "Please Enter Password";
      return false;
    } else if (password.length > 8 && password.length > 20) {
      document.getElementById("pass_message").innerHTML =
        "Please Enter The Corrected Length";
      return false;
    } else {
      const UpperCase = /[A-Z]/.test(password);
      const LowerCase = /[a-z]/.test(password);
      const NumCase = /[0-9]/.test(password);
      const SpecialCase = /[!@#$%^&*\,.?":{}|<>]/.test(password);
      if (!UpperCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Upper Case In Password";
        return false;
      } else if (!LowerCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Lower Case In Password";
        return false;
      } else if (!NumCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Number In Password";
        return false;
      } else if (!SpecialCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Special Charater Case In Password";
        return false;
      }
    }
  }

  // Age Validation

  if (age === "") {
    document.getElementById("age_message").innerHTML = "Please Enter Your Age";
    return false;
  } else if (age <= 14 || age >= 61) {
    document.getElementById("age_message").innerHTML =
      "Please Enter Age Between 15-60";
    return false;
  }

  // Gender Radio Button Validation

  if (!gender) {
    document.querySelector("#gender_message").innerHTML =
      "Please Select Anyone";
    return false;
  }

  let userData = {
    email,
    password,
  };

  let response = await fetch(apiLogin, {
    method: "POST",
    body: JSON.stringify(userData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let data = await response.json();
  console.log("🚀 ~ data:", data);

  if (data.accessToken) {
    sessionStorage.setItem("token", data.accessToken);
    sessionStorage.setItem("age", age);
    sessionStorage.setItem("gender", gender);

    try {
      await fetch(`http://localhost:3000/users/${data.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.accessToken}`,
        },
        body: JSON.stringify({ age, gender }),
      });
      console.log("✅ User updated with age & gender in db.json");
    } catch (err) {
      console.error("❌ Failed to update user with age/gender:", err);
    }

    try {
      let ageApi = "http://localhost:3000/ageValid";
      let ageres = await fetch(ageApi);
      let ageData = await ageres.json();

      let ageRange = "";
      if (age >= 15 && age <= 20) ageRange = "15-20 Age";
      else if (age >= 21 && age <= 30) ageRange = "20-30 Age";
      else if (age >= 31 && age <= 40) ageRange = "30-40 Age";
      else if (age >= 41 && age <= 50) ageRange = "40-50 Age";
      else if (age >= 51 && age <= 60) ageRange = "50-60 Age";

      let avtarObj = ageData.find(
        (item) =>
          item.title.toLowerCase() === ageRange.toLowerCase() &&
          item.gender.toLowerCase() === gender.toLowerCase()
      );

      if (avtarObj) {
        sessionStorage.setItem("Avatar", avtarObj.image);
        console.log("✅ Avatar stored:", avtarObj.image);
      } else {
        console.warn("⚠️ No matching avatar:", ageRange, gender);
      }
    } catch (error) {
      console.error("🚀 Avatar fetch failed:", error);
    }

    // ✅ redirect only after all done
    window.location = "../index.html";
  }
};
