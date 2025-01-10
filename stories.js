const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "instagram";

app.use(express.json());
app.use(cors());

let db, stories;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        stories = db.collection("stories");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

app.get('/stories', async (req, res) => {
    try {
        const activeStories = await stories.find({ expiresAt: { $gte: new Date() } }).toArray();
        res.status(200).json(activeStories);
    } catch (err) {
        res.status(500).send("Error fetching stories: " + err.message);
    }
});

app.post('/stories', async (req, res) => {
    try {
        const newStory = req.body;
        newStory.createdAt = new Date();
        newStory.expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

        const result = await stories.insertOne(newStory);
        res.status(201).send(`Story added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding story: " + err.message);
    }
});

app.delete('/stories/:storyId', async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const result = await stories.deleteOne({ storyId: storyId });

        if (result.deletedCount > 0) {
            res.status(200).send("Story deleted successfully");
        } else {
            res.status(404).send("Story not found");
        }
    } catch (err) {
        res.status(500).send("Error deleting story: " + err.message);
    }
});
