from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Paste your full MongoDB URI here
uri = "mongodb+srv://sukhwadali3:qq5EnAM4UJMlQfhs@newcluster.gew8zuw.mongodb.net/?retryWrites=true&w=majority&appName=newcluster"


try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # Force connection on a request as the
    # connect=True parameter of MongoClient seems
    # to be useless here
    client.admin.command('ping')
    print("✅ Connected successfully to MongoDB Atlas!")
except ConnectionFailure as e:
    print("❌ Connection failed:", e)
