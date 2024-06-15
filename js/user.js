"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  $("#login-error").text("");

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
    // User.login retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.login(username, password);
    $loginForm.trigger("reset");
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (error) {
    $("#login-error").text("Invalid username or password. Please try again.");
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  $("#signup-error").text("");

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  } catch (error) {
    if (error.response.status === 409) {
      $("#signup-error").text("Username already taken. Please choose another one.");
    } else {
      $("#signup-error").text("An error occurred. Please try again.");
    }
  }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users & profiles
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */
async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();

  // re-display stories (so that "favorite" stars can appear)
  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
  generateUserProfile();
  $storiesContainer.show();
}

/** Show a "user profile" part of page built from the current user's info. */
/** Show a "user profile" part of page built from the current user's info. */
function generateUserProfile() {
  console.debug("generateUserProfile");

  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}


//i added:

  // Show the update profile form when the button is clicked
  $("#show-update-profile-form").on("click", function () {
    console.debug("Update Profile button clicked");  // Debug statement
    $("#update-profile-form").show();
    $("#show-update-profile-form").hide();
  });

  // Handle submitting the update profile form
  $("#update-profile-form").on("submit", async function (evt) {
    console.debug("Update Profile form submitted");  // Debug statement
    evt.preventDefault();

    const newName = $("#update-name").val();
    const newPassword = $("#update-password").val();

    console.debug("New Name:", newName);  // Debug statement
    console.debug("New Password:", newPassword);  // Debug statement

    try {
      await updateProfile(currentUser, newName, newPassword);
      console.debug("Profile updated successfully.");  // Debug statement
      $("#update-profile-form").trigger("reset").hide();
      $("#show-update-profile-form").show();
      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    }
  });

// Function to update the user's profile
async function updateProfile(user, newName, newPassword) {
  console.debug("Updating profile for:", user.username);  // Debug statement
  const token = user.loginToken;
  const data = { token, user: {} };

  if (newName) data.user.name = newName;
  if (newPassword) data.user.password = newPassword;

  console.debug("Data to send:", data);  // Debug statement

  const response = await axios({
    method: "PATCH",
    url: `${BASE_URL}/users/${user.username}`,
    data
  });

  console.debug("Response:", response.data);  // Debug statement

  // Update the currentUser object with the new name
  if (newName) {
    currentUser.name = newName;
  }

  saveUserCredentialsInLocalStorage();
  generateUserProfile();
}





