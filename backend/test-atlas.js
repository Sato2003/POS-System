const { MongoClient } = require('mongodb');

const uri = "mongodb://akisato:akisato123@cluster0.a8nhxaq.mongodb.net:27017/pos_system?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
    try {
        console.log("Attempting to connect to MongoDB Atlas...");
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas!");
        
        const databases = await client.db().admin().listDatabases();
        console.log("Available databases:", databases.databases.map(db => db.name));
        
        await client.close();
    } catch (err) {
        console.error("❌ Connection failed:", err.message);
        console.error("\nFull error:", err);
    }
}

run();