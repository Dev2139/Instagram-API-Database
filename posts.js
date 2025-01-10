const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "instagram";

app.use(express.json());
app.use(cors());

let db, posts;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        db = client.db(dbName);
        posts = db.collection("posts");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

app.get('/posts', async (req, res) => {
    try {
        const allPosts = await posts.find().toArray();
        res.status(200).json(allPosts);
    } catch (err) {
        res.status(500).send("Error fetching posts: " + err.message);
    }
});

app.post('/posts', async (req, res) => {
    try {
        const newPost = req.body;
        const result = await posts.insertOne(newPost);
        res.status(201).send(`Post added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding post: " + err.message);
    }
});

app.patch('/posts/:postId/caption', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { caption } = req.body;

        if (!caption) {
            return res.status(400).send("No caption provided to update");
        }

        const result = await posts.updateOne(
            { postId: postId },
            { $set: { caption: caption } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).send("Post caption updated successfully");
        } else {
            res.status(404).send("Post not found or no changes made");
        }
    } catch (err) {
        res.status(500).send("Error updating post caption: " + err.message);
    }
});

app.delete('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const result = await posts.deleteOne({ postId: postId });

        if (result.deletedCount > 0) {
            res.status(200).send("Post deleted successfully");
        } else {
            res.status(404).send("Post not found");
        }
    } catch (err) {
        res.status(500).send("Error deleting post: " + err.message);
    }
});
