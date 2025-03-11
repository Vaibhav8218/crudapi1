import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    GST: { type: String, required: false },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
    },
    userDetails: [
      {
        name: { type: String, required: true },
        mobileNo: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true },
      },
    ],
    image: {
      filePath: { type: String },
      fileName: { type: String },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;