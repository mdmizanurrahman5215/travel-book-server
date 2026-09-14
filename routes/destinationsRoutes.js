const express = require("express");
const { ObjectId } = require("mongodb");
const { verifyToken } = require("../middleware/authMiddleware");

const validateDestination = (data) => {
  const errors = [];

  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Title is required and must be valid text.");
  }

  if (!data.location || typeof data.location !== "string" || !data.location.trim()) {
    errors.push("Location is required and must be valid text.");
  }

  const numericPrice = Number(data.price);
  if (data.price === undefined || data.price === null || isNaN(numericPrice)) {
    errors.push("Price is required and must be a valid number.");
  } else if (numericPrice <= 0) {
    errors.push("Price must be greater than 0.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const destinationRoutes = (destinationCollection) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const destinations = await destinationCollection.find().toArray();
      res.status(200).json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch destinations",
      });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const data = req.body;

      const validation = validateDestination(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors.join(" "),
          errors: validation.errors,
        });
      }

      const newDestination = {
        ...data,
        price: Number(data.price),
        createdAt: new Date(),
      };

      const result = await destinationCollection.insertOne(newDestination);

      res.status(201).json({
        success: true,
        message: "Destination created successfully",
        insertedId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create destination",
      });
    }
  });

  router.get("/:id",verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
       console.log("AUTH HEADER:", req.headers.authorization);

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Destination ID format",
        });
      }

      const query = { _id: new ObjectId(id) };
      const destination = await destinationCollection.findOne(query);

      if (!destination) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }

      res.status(200).json(destination);
    } catch (error) {
      console.error("Error fetching destination by ID:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching destination",
      });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Destination ID format",
        });
      }

      const updatedData = { ...req.body };

      if (updatedData.price !== undefined) {
        const numericPrice = Number(updatedData.price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: "Price must be greater than 0.",
          });
        }
        updatedData.price = numericPrice;
      }

      delete updatedData._id;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...updatedData,
          updatedAt: new Date(),
        },
      };

      const result = await destinationCollection.updateOne(filter, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Destination updated successfully",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error updating destination:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update destination",
      });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Destination ID format",
        });
      }

      const query = { _id: new ObjectId(id) };
      const result = await destinationCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Destination deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete destination",
      });
    }
  });

  return router;
};

module.exports = destinationRoutes;