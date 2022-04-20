var signupForm = document.getElementById("btn_id");

// Submit form with id
async function submitSignupForm() {
  var requestedUsername = document.getElementById("username").value;

  // code for fetching the existing username from routes/signup.js
  const usernameList = await fetch('/signup/unameList');
  // prepare the /signup/unameList route that returns the list of username
  // check if the username already exists based on the usernameList

  // the form will be submitted only if the inputs are valid and validation() is true
  if (await usernameExist(requestedUsername, usernameList)) {
    alert("The username already exists");
  } else {
    document.getElementById("signupForm").submit(); // form submission
  }
}

async function usernameExist(requestedUsername, usernameList) {
  // check if the username already exist based on the usernameList
  const data = await usernameList.json();

  var found = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i].username == requestedUsername) {
      found = true
    }
  }
  return found
}

signupForm.addEventListener('click',
  function() {
      submitSignupForm();
  }
);
