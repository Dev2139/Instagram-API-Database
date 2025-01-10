const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "instagram";

app.use(express.json());
app.use(cors());

let db, users;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

// GET: Fetch all users
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

// GET: Fetch a user by userId
app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await users.findOne({ userId: userId });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message);
    }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        const result = await users.insertOne(newUser);
        res.status(201).send(`User added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});

// PATCH: Update user bio or profile picture
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { bio, profilePicture } = req.body;

        const updateFields = {};
        if (bio) {
            updateFields.bio = bio;
        }
        if (profilePicture) {
            updateFields.profilePicture = profilePicture;
        }

        if (Object.keys(updateFields).length > 0) {
            const result = await users.updateOne({ userId: userId }, { $set: updateFields });
            if (result.modifiedCount > 0) {
                res.status(200).send("User updated successfully");
            } else {
                res.status(404).send("User not found or no changes made");
            }
        } else {
            res.status(400).send("No bio or profile picture data provided to update");
        }
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});

// DELETE: Delete a user by userId
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const result = await users.deleteOne({ userId: userId });
        
        if (result.deletedCount > 0) {
            res.status(200).send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});
