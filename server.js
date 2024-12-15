import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    getDocs, 
    updateDoc, 
    deleteDoc 
} from "firebase/firestore";
import fileUpload from 'express-fileupload';

const firebaseConfig = {
    apiKey: "AIzaSyDfwO7zz5pdCa0zlThbGbhtLIO3eey76No",
    authDomain: "blogging-website-bf766.firebaseapp.com",
    projectId: "blogging-website-bf766",
    storageBucket: "blogging-website-bf766.appspot.com",
    messagingSenderId: "364944894513",
    appId: "1:364944894513:web:4b519aa21f9ca7aedcc310"
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", async (req, res) => {
    const blogsCollection = collection(db, "blogs");
    const snapshot = await getDocs(blogsCollection);
    const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render("index", { blogs });
});


app.post('/upload', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    let imagename = date.getDate() + date.getTime() + file.name;
    let path = 'public/uploads/' + imagename;

    file.mv(path, (err) => {
        if (err) {
            throw err;
        } else {
            res.json(`uploads/${imagename}`);
        }
    });
});

app.get("/new", (req, res) => {
    res.render("new");
});

app.post("/new", async (req, res) => {
    const { title, content } = req.body;
    const blogsCollection = collection(db, "blogs");

    try {
        const docRef = await addDoc(blogsCollection, { 
            title, 
            content, 
            publishedAt: new Date().toLocaleString() 
        });
        res.redirect(`/${docRef.id}`);
    } catch (error) {
        console.error("Error adding document:", error);
        res.status(500).send("Error creating blog.");
    }
});

app.get('/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        const blogDoc = await getDoc(doc(db, 'blogs', blogId));
        if (!blogDoc.exists()) {
            return res.status(404).send('Blog not found');
        }

        const blog = blogDoc.data();
        blog.content = blog.content || '';

        res.render('blog', { blog: { ...blog, id: blogDoc.id } });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('An error occurred while fetching the blog');
    }
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const blogDoc = await getDoc(doc(db, "blogs", id));
        if (!blogDoc.exists) {
            return res.status(404).send("Blog not found");
        }

        const blog = { id: blogDoc.id, ...blogDoc.data() };
        res.render("edit", { blog });
    } catch (error) {
        console.error("Error fetching blog for edit:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const blogRef = doc(db, "blogs", id);
        await updateDoc(blogRef, { 
            title, 
            content, 
            updatedAt: new Date().toLocaleString() 
        });
        res.redirect(`/${id}`);
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).send("Error updating blog.");
    }
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const blogDoc = doc(db, 'blogs', id);
        await deleteDoc(blogDoc);
        console.log(`Blog with ID ${id} deleted successfully.`);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).send('An error occurred while deleting the blog.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
