import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    trans_code: { type: String, required: true },
    planId: { type: Number, required: false },
    datePayment: { type: String || Number, required: false },
    statusPayment: { type: String, required: true },
    isHubla: { type: Boolean, required: false }
});
const PlanModel = mongoose.model("CashSure", userSchema);
export default PlanModel;
