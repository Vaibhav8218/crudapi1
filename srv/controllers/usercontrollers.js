import UserModel from "../../models/usermodels.js";
import fs from "fs";
import path from "path";

export const fetch = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

export const update = async (req, res) => {
  try {
    console.log("Update Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    // Find the existing user
    const existingUser = await UserModel.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateFields = { ...req.body };

    // Parse location if it's sent as a string
    if (req.body.location && typeof req.body.location === "string") {
      try {
        updateFields.location = JSON.parse(req.body.location);
      } catch (error) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    // Parse userDetails if it's sent as a string
    if (req.body.userDetails && typeof req.body.userDetails === "string") {
      try {
        updateFields.userDetails = JSON.parse(req.body.userDetails);
      } catch (error) {
        return res.status(400).json({ message: "Invalid userDetails format" });
      }
    }

    // If a new image is uploaded, delete the old one
    if (req.file) {
      if (existingUser.image && existingUser.image.filePath) {
        const oldImagePath = path.join(
          process.cwd(),
          existingUser.image.filePath
        );

        // Check if the file exists and delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Old image deleted:", oldImagePath);
        }
      }

      // Update image field with new image
      updateFields.image = {
        filePath: req.file.path,
        fileName: req.file.filename,
      };
    }

    // Update user details in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(400)
      .json({ message: "Error updating user", error: error.message });
  }
};

////////////////////////////////////////////
export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// // import UserModel from "../../models/usermodels.js";

export const createUser = async (req, res) => {
  try {
    console.log("-----------------------------------------------------");
    console.log("Request Body:", req.body); // Log the body to check how the data is coming
    console.log("Location Data:", req.body.location); // Log location field
    console.log("User Details:", req.body.userDetails); // Log userDetails field
    console.log("Uploaded Files:", req.file); // Log the uploaded files

    // Destructure required fields from the request body
    const { organizationName, GST, location, userDetails } = req.body;

    // Validate the fields
    if (!organizationName || !GST || !location || !userDetails) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure location is a valid object and parse it if needed
    let parsedLocation = {};
    if (typeof location === "string") {
      try {
        parsedLocation = JSON.parse(location); // Parse the stringified object for location
      } catch (error) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    } else {
      parsedLocation = location; // If it's already an object, no need to parse
    }

    const { country, state, pincode, address } = parsedLocation;
    if (!country || !state || !pincode || !address) {
      return res
        .status(400)
        .json({
          message:
            "Location details (country, state, pincode, address) are required",
        });
    }

    // Ensure userDetails is an array of objects
    let parsedUserDetails = [];
    try {
      parsedUserDetails = JSON.parse(userDetails); // Parse the stringified array of objects
    } catch (error) {
      return res.status(400).json({ message: "Invalid userDetails format" });
    }

    if (!Array.isArray(parsedUserDetails) || parsedUserDetails.length === 0) {
      return res
        .status(400)
        .json({ message: "userDetails should be an array of objects" });
    }

    // Image Upload Handling (Check if files are uploaded)
    let imageFiles = [];
    if (req.file) {
      imageFiles = {
        filePath: req.file.path,
        fileName: req.file.filename,
      };
    }

    // Create a new user object
    const user = new UserModel({
      organizationName,
      GST,
      location: parsedLocation,
      userDetails: parsedUserDetails,
      image: imageFiles, // Array of image file paths and names
    });

    // Save the new user
    await user.save();

    // Return success response
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);

    // Return error response with specific message
    res
      .status(400)
      .json({ message: "Error creating user", error: error.message });
  }
};
