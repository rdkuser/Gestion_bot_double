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
import UsersHubla from "../models/UsersHubla.js";
import usersStatus from "../models/UsersStatus.js";
import UserStatusHubla from "../models/UsersStatusHubla.js";
import { bot } from "../bot.js";
export default function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        let allUsers = yield UsersHubla.find();
        verifySign(allUsers);
    });
}
let verifySign = (users) => __awaiter(void 0, void 0, void 0, function* () {
    for (let user of users) {
        if (user.datePayment != undefined) {
            dateConverter(user.datePayment).then(({ date, datePayment }) => __awaiter(void 0, void 0, void 0, function* () {
                let datePaymentUser = date;
                let dateIsExpired = new Date(new Date(datePaymentUser).toISOString()).getTime() + 2592000000;
                let datePlanExpire = new Date(dateIsExpired).toLocaleDateString('pt-BR');
                if (new Date(Date.now()).getTime() >= new Date(dateIsExpired).getTime()) {
                    console.log(true);
                    console.log(`Plan of user ${user.email} payment data was ${datePayment}  has expired in ${datePlanExpire} ACTION:BAN AND REMOVE`);
                    let userToBan = yield UserStatusHubla.findOne({ email: user.email });
                    try {
                        yield UserStatusHubla.findOneAndRemove({ email: user.email });
                        yield usersStatus.findOneAndRemove({ userId: userToBan.userId });
                        yield bot.telegram.getChatMember(-100741864004, userToBan.userId).then(({ status }) => __awaiter(void 0, void 0, void 0, function* () {
                            console.log(status);
                            if (status != "kicked" && status == "member") {
                                try {
                                    yield bot.telegram.banChatMember(-100741864004, userToBan.userId);
                                    yield bot.telegram.unbanChatMember(-100741864004, userToBan.userId);
                                    yield bot.telegram.sendMessage(userToBan.userId, `Sua assinatura terminou. Volte realizar o pagameto através da nova plataforma de vendas: https://pay.hotmart.com/Y71715765W?off=loxotloi`);
                                }
                                catch (e) {
                                    console.log(e);
                                    yield bot.telegram.sendMessage(userToBan.userId, `Sua assinatura terminou. Volte realizar o pagameto através da nova plataforma de vendas: https://pay.hotmart.com/Y71715765W?off=loxotloi`);
                                }
                            }
                            else {
                                yield UsersHubla.findOneAndRemove({ email: user.email });
                                yield UserStatusHubla.findOneAndRemove({ email: user.email });
                                yield usersStatus.findOneAndRemove({ userId: userToBan.userId });
                                try {
                                    yield bot.telegram.sendMessage(userToBan.userId, `Sua assinatura terminou. Volte realizar o pagameto através da nova plataforma de vendas: https://pay.hotmart.com/Y71715765W?off=loxotloi`);
                                    yield bot.telegram.unbanChatMember(-100741864004, userToBan.userId);
                                }
                                catch (e) {
                                    console.log(e);
                                }
                            }
                        }));
                    }
                    catch (e) {
                        yield UsersHubla.findOneAndRemove({ email: user.email });
                        yield UserStatusHubla.findOneAndRemove({ email: user.email });
                        yield usersStatus.findOneAndRemove({ userId: userToBan.userId });
                        try {
                            yield bot.telegram.sendMessage(userToBan.userId, `Sua assinatura terminou. Volte realizar o pagameto através da nova plataforma de vendas: https://pay.hotmart.com/Y71715765W?off=loxotloi`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
                else {
                    console.log(false);
                    console.log(`Plan of user ${user.email} expiry in ${datePlanExpire}`);
                }
            }));
        }
    }
});
let dateConverter = (datePayment) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dateSplit = datePayment.split('/');
        let date = `${dateSplit[1]}/${dateSplit[0]}/${dateSplit[2]}`;
        return { datePayment, date };
    }
    catch (e) {
        throw console.error(datePayment);
    }
});
