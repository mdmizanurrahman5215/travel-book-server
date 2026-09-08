const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const destinationRoutes = require("./routes/destinationsRoutes");
const myBookingsRoutes = require("./routes/bookingsRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes


const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("travelbook");
    const destinationCollection = db.collection("destinations");
    const myBookingsCollection = db.collection("myBookings");

    await client.db("admin").command({ ping: 1 });

    app.use(
  "/api/destinations",
  destinationRoutes(destinationCollection)
);
   
    app.use(
  "/api/myBookings",
  myBookingsRoutes(myBookingsCollection)
);
  

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});