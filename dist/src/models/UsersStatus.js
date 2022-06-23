import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    initialized: { type: Boolean, required: true },
    finding: { type: Boolean, required: true },
    finished: { type: Boolean, required: true },
    trans_code: { type: String, required: false },
    planId: { type: Number, required: false },
    datePayment: { type: "Number", required: false }
});
const usersStatus = mongoose.model("usersStatus", userSchema);
export default usersStatus;
