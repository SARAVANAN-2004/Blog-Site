const express = require('express');
const router = express.Router();
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

const firebaseConfig = {
     //firebase api key
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);



router.get('/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        
        const blogDoc = await getDoc(doc(db, 'blogs', blogId));
        if (!blogDoc.exists()) {
            
            return res.status(404).send('Blog not found');
        }

        const blog = blogDoc.data();

        if (blog.bannerImagePath) {
            try {
                const imageRef = ref(storage, blog.bannerImagePath);
                blog.bannerImage = await getDownloadURL(imageRef);
            } catch (error) {
                console.error('Error fetching image URL:', error);
                blog.bannerImage = null; 
            }
        }

        res.render('blog', { blog: { ...blog, id: blogDoc.id } });

    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('An error occurred while fetching the blog');
    }
});



const { deleteDoc, doc } = require('firebase/firestore');

router.post('/delete/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        const blogDoc = doc(db, 'blogs', blogId);
        await deleteDoc(blogDoc);
        console.log(`Blog with ID ${blogId} deleted successfully.`);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).send('Failed to delete blog.');
    }
});




module.exports = router;
