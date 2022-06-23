import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    initialized: { type: Boolean, required: true },
    finding: { type: Boolean, required: true },
    finished: { type: Boolean, required: true },
    email: { type: String, required: false },
    planId: { type: Number, required: false },
    datePayment: { type: "Number", required: false }
});
const usersStatus = mongoose.model("usersStatusDouble", userSchema);
export default usersStatus;
