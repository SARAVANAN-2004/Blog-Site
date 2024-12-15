
const firebaseConfig = {
    apiKey: "AIzaSyDfwO7zz5pdCa0zlThbGbhtLIO3eey76No",
        authDomain: "blogging-website-bf766.firebaseapp.com",
        projectId: "blogging-website-bf766",
        storageBucket: "blogging-website-bf766.firebasestorage.app",
        messagingSenderId: "364944894513",
        appId: "1:364944894513:web:4b519aa21f9ca7aedcc310"
};


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
