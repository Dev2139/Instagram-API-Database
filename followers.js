const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "instagram";

app.use(express.json());
app.use(cors());

let db, followers;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        db = client.db(dbName);
        followers = db.collection("followers");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

app.get('/users/:userId/followers', async (req, res) => {
    try {
        const userId = req.params.userId;
        const followersList = await followers.find({ followingId: userId }).toArray();
        res.status(200).json(followersList);
    } catch (err) {
        res.status(500).send("Error fetching followers: " + err.message);
    }
});

app.post('/followers', async (req, res) => {
    try {
        const { followerId, userId } = req.body;
        const result = await followers.insertOne({
            followerId: followerId,
            userId: userId,
            followingId: userId,
            followedAt: new Date()
        });

        res.status(201).send(`Followed user successfully with followerId: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error following user: " + err.message);
    }
});

app.delete('/followers/:followerId', async (req, res) => {
    try {
        const followerId = req.params.followerId;
        const result = await followers.deleteOne({ followerId: followerId });

        if (result.deletedCount > 0) {
            res.status(200).send("Unfollowed user successfully");
        } else {
            res.status(404).send("Follower not found");
        }
    } catch (err) {
        res.status(500).send("Error unfollowing user: " + err.message);
    }
});
