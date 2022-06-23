var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { bot } from "../bot.js";
import usersStatus from "../models/UsersStatus.js";
import CashSure from "../models/CashSure.js";
let plansInfo = [
    {
        "planId": 2066964,
        "planValues": {
            "groupName": "CashSure",
            "groupId": -1001773176019,
            "groupIdTwo": -1001317612621,
            "modelPlan": "CashSure"
        }
    }
];
export default function handleSignature(paymentData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (paymentData.body.data.purchase.transaction == null) {
            return;
        }
        let paymentStatus = paymentData.body.event;
        let planData = plansInfo.filter((plan) => {
            return plan.planId == paymentData.body.data.product.id;
        });
        let planUser = planData[0];
        let userTransactionCode = paymentData.body.data.purchase.transaction;
        let datePayment = paymentData.body.data.purchase.approved_date;
        let planId = paymentData.body.data.product.id;
        let statusPayment = paymentData.body.event;
        let planModel;
        let userModelTelegram;
        if (planUser != null) {
            if (planUser.planValues.modelPlan == "CashSure")
                planModel = CashSure;
            userModelTelegram = usersStatus;
        }
        else {
            return;
        }
        let findUser = yield planModel.findOne({ trans_code: paymentData.body.data.purchase.transaction });
        let userTelegram = yield userModelTelegram.findOne({ trans_code: paymentData.body.data.purchase.transaction });
        if (paymentStatus == "PURCHASE_APPROVED" || paymentStatus == "PURCHASE_COMPLETE") {
            if (findUser == null) {
                yield planModel.create({ trans_code: userTransactionCode, datePayment: datePayment, statusPayment: statusPayment, planId: planId });
            }
            else {
                yield planModel.findOneAndUpdate({ trans_code: userTransactionCode }, { statusPayment: paymentStatus });
                try {
                    let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status;
                    if (statusChatMember == "kicked") {
                        yield bot.telegram.unbanChatMember(planUser.planValues.groupId, userTelegram.userId);
                    }
                }
                catch (e) {

                }
                try {
                    let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)).status;
                    if (statusChatMember == "kicked") {
                        yield bot.telegram.unbanChatMember(planUser.planValues.groupIdTwo, userTelegram.userId);
                    }
                }
                catch (e) {

                }
                try{
                    return yield bot.telegram.sendMessage(userTelegram.userId, `Olá usuário! Houve uma alternância em relação ao status de seu plano. Você acaba de ser removido da lista de banidos e está permitido acessar o grupo novamente pelo link enviado anteriormente.`);
                }catch(e){
                    ""
                }
            }
        }
        else {
            yield planModel.findOneAndUpdate({ trans_code: userTransactionCode }, { statusPayment: paymentStatus });
            try {
                let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status;
                if (statusChatMember != "kicked") {
                    yield bot.telegram.banChatMember(planUser.planValues.groupId, userTelegram.userId);
                }
            }
            catch (e) {

            }
            try {
                let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)).status;
                if (statusChatMember != "kicked") {
                    yield bot.telegram.banChatMember(planUser.planValues.groupIdTwo, userTelegram.userId);
                }
            }
            catch (e) {

            }
            try{
                yield bot.telegram.sendMessage(985373430, `Usuário removido - User_id:${userTelegram.user} Código de pagamento:${userTransactionCode}.`);
                return yield bot.telegram.sendMessage(userTelegram.userId, `Olá! Houve uma alternância em relação ao status de seu plano. Você foi removido do canal até que volte realizar o pagamento.\r\n\r\nVoltando realizar o pagamento, você será notificado por aqui, afirmando que foi removido da lista de banidos e poderá acessar seu canal novamente pelo link de convite enviado anteriormente.`);
            }catch(e){

            }
        }
    });
}
