var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let plansInfo = [
    {
        "planId": 2149153,
        "planValues": {
            "groupName": "EasyVT",
            "groupId": -1001328557021,
            "modelPlan": "EasyVT"
        }
    },
    {
        "planId": 2154054,
        "planValues": {
            "groupName": "EasyCrash",
            "groupId": -1001628785002,
            "modelPlan": "EasyCrash"
        }
    },
    {
        "planId": 2154024,
        "planValues": {
            "groupName": "EasyDouble",
            "groupId": -1001441422282,
            "modelPlan": "EasyDouble"
        }
    }
];
let bot = "";
import { bot as botEasy } from "../bot.js";
import { bot as botCrash } from "../../Gestion_bot_crash/dist/src/bot.js";
import { bot as botDouble } from "../../Gestion_bot_double/dist/src/bot.js";
import usersStatus from "../models/UsersStatus.js";
import usersStatusCrash from "../../Gestion_bot_crash/dist/src/models/UsersStatus.js";
import usersStatusDouble from "../../Gestion_bot_double/dist/src/models/UsersStatus.js";
import EasyVT from "../models/EasyVT.js";
import EasyCrash from "../../Gestion_bot_crash/dist/src/models/EasyCrash.js";
export default function handleSignature(paymentData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (paymentData.body.data.buyer.email == null) {
            return;
        }
        let paymentStatus = paymentData.body.event;
        let planData = plansInfo.filter((plan) => {
            return plan.planId == paymentData.body.data.product.id;
        });
        let planUser = planData[0];
        let userEmail = paymentData.body.data.buyer.email;
        let datePayment = paymentData.body.data.purchase.approved_date;
        let planId = paymentData.body.data.product.id;
        let statusPayment = paymentData.body.event;
        let planModel;
        let userModelTelegram;
        if (planUser.planValues.modelPlan == "EasyVT") {
            planModel = EasyVT;
            bot = botEasy;
            userModelTelegram = usersStatus;
        }
        else if (planUser.planValues.modelPlan == "EasyCrash") {
            planModel = EasyCrash;
            bot = botCrash;
            userModelTelegram = usersStatusCrash;
        }
        else if (planUser.planValues.modelPlan == "EasyDouble") {
            planModel = EasyDouble;
            bot = botDouble;
            userModelTelegram = usersStatusDouble;
        }
        let findUser = yield planModel.findOne({ email: paymentData.body.data.buyer.email.toLowerCase() });
        let userTelegram = yield userModelTelegram.findOne({ email: paymentData.body.data.buyer.email.toLowerCase() });
        if (paymentStatus == "PURCHASE_APPROVED" || paymentStatus == "PURCHASE_COMPLETE") {
            if (findUser == null) {
                yield planModel.create({ email: userEmail.toLowerCase(), datePayment: datePayment, statusPayment: statusPayment, planId: planId });
            }
            else {
                yield planModel.findOneAndUpdate({ email: userEmail }, { statusPayment: paymentStatus });
                try {
                    let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status;
                    if (statusChatMember == "kicked") {
                        yield bot.telegram.unbanChatMember(planUser.planValues.groupId, userTelegram.userId);
                        yield bot.telegram.sendMessage(userTelegram.userId, `Olá usuário! Houve uma alternância em relação ao status de seu plano. Você acaba de ser removido da lista de banidos e está permitido acessar o grupo novamente pelo link enviado anteriormente.`);
                    }
                    else {
                        yield bot.telegram.sendMessage(userTelegram.userId, `Olá usuário! Houve uma alternância em relação ao status de seu plano. Você acaba de ser removido da lista de banidos e está permitido acessar o grupo novamente pelo link enviado anteriormente.`);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        else {
            if (userTelegram == null) {
                return;
            }
            yield planModel.findOneAndUpdate({ email: userEmail }, { statusPayment: paymentStatus });
            let statusChatMember = (yield bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status;
            try {
                if (statusChatMember != "kicked") {
                    yield bot.telegram.banChatMember(planUser.planValues.groupId, userTelegram.userId);
                    yield bot.telegram.sendMessage(userTelegram.userId, `Olá! Houve uma alternância em relação ao status de seu plano. Você foi removido do canal até que volte realizar o pagamento.\r\n\r\nVoltando realizar o pagamento, você será notificado por aqui, afirmando que foi removido da lista de banidos e poderá acessar seu canal novamente pelo link de convite enviado anteriormente.`);
                }
                else {
                    yield bot.telegram.sendMessage(userTelegram.userId, `Olá! Houve uma alternância em relação ao status de seu plano. Você foi removido do canal até que volte realizar o pagamento.\r\n\r\nVoltando realizar o pagamento, você será notificado por aqui, afirmando que foi removido da lista de banidos e poderá acessar seu canal novamente pelo link de convite enviado anteriormente.`);
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    });
}
