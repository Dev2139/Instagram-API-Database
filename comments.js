const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "instagram";

app.use(express.json());
app.use(cors());

let db, comments;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        db = client.db(dbName);
        comments = db.collection("comments");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;
        const postComments = await comments.find({ postId: postId }).toArray();
        res.status(200).json(postComments);
    } catch (err) {
        res.status(500).send("Error fetching comments: " + err.message);
    }
});

app.post('/comments', async (req, res) => {
    try {
        const newComment = req.body;
        const result = await comments.insertOne(newComment);
        res.status(201).send(`Comment added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding comment: " + err.message);
    }
});

app.patch('/comments/:commentId/likes', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const result = await comments.updateOne(
            { commentId: commentId },
            { $inc: { likes: 1 } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).send("Comment likes incremented successfully");
        } else {
            res.status(404).send("Comment not found or no changes made");
        }
    } catch (err) {
        res.status(500).send("Error updating comment likes: " + err.message);
    }
});

app.delete('/comments/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const result = await comments.deleteOne({ commentId: commentId });

        if (result.deletedCount > 0) {
            res.status(200).send("Comment deleted successfully");
        } else {
            res.status(404).send("Comment not found");
        }
    } catch (err) {
        res.status(500).send("Error deleting comment: " + err.message);
    }
});
