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
    //firebase api
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
         res.json(`uploads/${imagename}`);
    });
});

app.get("/new", (req, res) => {
    res.render("new");
});

app.post("/new", async (req, res) => {
    const { title, content } = req.body;
    const blogsCollection = collection(db, "blogs");
    const docRef = await addDoc(blogsCollection, { 
        title, 
        content, 
        publishedAt: new Date().toLocaleString() 
    });
    res.redirect(`/${docRef.id}`);
    
});

app.get('/:id', async (req, res) => {
    const blogId = req.params.id;
    const blogDoc = await getDoc(doc(db, 'blogs', blogId));
    const blog = blogDoc.data();
    res.render('blog', { blog: { ...blog, id: blogDoc.id } });
   
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const blogDoc = await getDoc(doc(db, "blogs", id));
    const blog = { id: blogDoc.id, ...blogDoc.data() };
    res.render("edit", { blog });
    
});

app.post("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const blogRef = doc(db, "blogs", id);
    await updateDoc(blogRef, { 
        title, 
        content, 
        updatedAt: new Date().toLocaleString() 
    });
    res.redirect(`/${id}`);
    
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const blogDoc = doc(db, 'blogs', id);
    await deleteDoc(blogDoc);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
