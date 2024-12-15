const express = require('express');
const multer = require('multer');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const router = express.Router();
const db = getFirestore();
const storage = getStorage();


const upload = multer({ storage: multer.memoryStorage() });

router.get('/edit/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        const blogDoc = await getDoc(doc(db, 'blogs', blogId));
        if (!blogDoc.exists()) {
            return res.status(404).send('Blog not found');
        }

        const blog = blogDoc.data();
        res.render('edit', { blog: { id: blogId, ...blog } });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/edit/:id', upload.single('bannerImage'), async (req, res) => {
    const blogId = req.params.id;
    const { title, content } = req.body;

    try {
        let bannerImageUrl = null;
        if (req.file) {
            const imageRef = ref(storage, `banners/${blogId}-${Date.now()}`);
            await uploadBytes(imageRef, req.file.buffer);
            bannerImageUrl = await getDownloadURL(imageRef);
        }

        const updateData = {
            title,
            content,
            ...(bannerImageUrl && { bannerImage: bannerImageUrl }),
        };

        await updateDoc(doc(db, 'blogs', blogId), updateData);

        res.redirect(`/blog/${blogId}`);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
