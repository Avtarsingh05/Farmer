

// Ensure firebase app is initialized
if (!window.firebase) {
    console.error("Firebase SDK not found! Make sure to include the compat SDK script tags in your HTML.");
} else {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

window.FM = {
    auth,
    db,
    storage,
    firebase
};

window.ADMIN_UID = 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1';

console.log("Firebase initialized successfully");
