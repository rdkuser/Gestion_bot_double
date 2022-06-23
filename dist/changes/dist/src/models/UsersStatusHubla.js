import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    initialized: { type: Boolean, required: false },
    finding: { type: Boolean, required: false },
    finished: { type: Boolean, required: false },
    email: { type: String, required: false },
    planId: { type: Number, required: false },
    datePayment: { type: String, required: false }
});
const usersStatus = mongoose.model("UsersStatusHublaDouble", userSchema);
export default usersStatus;
