const express = require("express");
const { ObjectId } = require("mongodb");

const validateBooking = (data) => {
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

const myBookingsRoutes = (myBookingsCollection) => {
  const router = express.Router();

//   router.get("/", async (req, res) => {
//     try {
//       const bookings = await myBookingsCollection.find().toArray();
//       res.status(200).json(bookings);
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch bookings",
//       });
//     }
//   });

  router.post("/", async (req, res) => {
    try {
      const data = req.body;

    //   const validation = validateBooking(data);
    //   if (!validation.isValid) {
    //     return res.status(400).json({
    //       success: false,
    //       message: validation.errors.join(" "),
    //       errors: validation.errors,
    //     });
    //   }

      const newBooking = {
        ...data,
        price: Number(data.price),
        createdAt: new Date(),
      };

      const result = await myBookingsCollection.insertOne(newBooking);

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        insertedId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create booking",
      });
    }
  });

 router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await myBookingsCollection
      .find({
        "user.id": userId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});
 router.get("/myBookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await myBookingsCollection
      .find({
        "user.id": userId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Booking ID format",
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

      const result = await myBookingsCollection.updateOne(filter, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking",
      });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Booking ID format",
        });
      }

      const query = { _id: new ObjectId(id) };
      const result = await myBookingsCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete booking",
      });
    }
  });

  return router;
};

module.exports = myBookingsRoutes;