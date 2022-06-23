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
import { Telegraf } from "telegraf";
import dbConnection from "./dbConnection.js";
import usersStatus from "./models/UsersStatus.js";
import EasyVTMODEL from "./models/EasyDouble.js";
import UsersHubla from "./models/UsersHubla.js";
import UsersStatusHubla from "./models/UsersStatusHubla.js";
import handleDatePay from "./services/handleDatePay.js";
process.env.TZ = "America/Sao_Paulo";
setInterval(() => {
    if (new Date().toLocaleTimeString('pt-BR') == "12:00:00" || new Date().toLocaleTimeString('pt-BR') == "23:00:00" || new Date().toLocaleTimeString('pt-BR') == "00:00:00") {
        handleDatePay();
    }
}, 1000);
process.env.TZ = "America/Sao_Paulo";
dbConnection();
const botToken = "5438815448:AAF1SOjYSxN1OPf8qN0X1y7a0C5AjA5x-Uk";
const bot = new Telegraf(botToken);
export { bot };
bot.telegram.createChatInviteLink(-1001441422282, { creates_join_request: true }).then(({ invite_link }) => {
    bot.telegram.sendMessage(5240668489, invite_link);
});
bot.on("chat_join_request", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let userIdToJoin = ctx.chatJoinRequest.from.id;
    let userInfo = yield usersStatus.findOne({ userId: userIdToJoin });
    let userInfoHubla = yield UsersStatusHubla.findOne({ userId: userIdToJoin });
    try {
        if (userInfo != null) {
            let statusSignature = (yield EasyVTMODEL.findOne({ email: userInfo.email })).statusPayment;
            if (userInfo.finished == true) {
                if (statusSignature == "PURCHASE_APPROVED" || statusSignature == "PURCHASE_COMPLETE") {
                    yield bot.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
                }
            }
        }
        else if (userInfoHubla != null) {
            yield bot.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
        }
        else {
            bot.telegram.declineChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
        }
    }
    catch (e) {
        try {
            if (userInfoHubla != null) {
                yield bot.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
            }
            else {
                bot.telegram.declineChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
            }
        }
        catch (e) {
        }
    }
}));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = ctx.from.id;
    let chatType = ctx.chat.type;
    let message = ctx.message.text;
    let firstName = ctx.from.first_name;
    let findUser = (yield usersStatus.findOne({ userId: userId })) == null ? false : true;
    if (typeof (message) != "string" || chatType != "private") {
        return;
    }
    if (message == "/start") {
        findUser ? bot.telegram.sendMessage(ctx.from.id, "Você já inicializou a verificação. Continue de onde parou.") : (() => __awaiter(void 0, void 0, void 0, function* () {
            yield usersStatus.create({ userId: userId, initialized: true, finding: false, finished: false, email: null, plan: null });
            yield bot.telegram.sendMessage(userId, `Olá ${firstName}. Para inicializarmos seu cadastro, por favor diga-me qual seu email como consta na compra.`, { reply_markup: { force_reply: true } });
        }))();
    }
    else if (message == "/reiniciar") {
        try {
            yield usersStatus.findOneAndRemove({ userId: userId }, { initialized: false, finding: true });
            bot.telegram.sendMessage(userId, "Dados apagados com sucesso! Para inicializar seu cadastro, digite /start.");
        }
        catch (r) {
            bot.telegram.sendMessage(userId, "Não há registros de cadastro para ser apagado. Para iniciar, digite /start.");
        }
    }
    else {
        if (findUser) {
            let userStatus = yield usersStatus.findOne({ userId: userId });
            if (userStatus["initialized"]) {
                yield bot.telegram.sendMessage(userId, `Excelente! Seu email é ${message}. Aguarde enquato localizo no banco de dados.`);
                yield usersStatus.findOneAndUpdate({ userId: userId }, { initialized: false, finding: true });
                let findAllUsers = yield EasyVTMODEL.find();
                let findEmail = findAllUsers.filter((value) => {
                    try {
                        return value.email == message.toLowerCase();
                    }
                    catch (e) {
                        console.log(e);
                    }
                });
                if (findEmail[0] != null) {
                    let registerExist = yield usersStatus.findOne({ email: message.toLowerCase() });
                    if (registerExist != null) {
                        yield usersStatus.findOneAndRemove({ userId: userId });
                        return bot.telegram.sendMessage(userId, "Já existe um cadastro com o email informado. Por favor, registre-se novamente (/start) utilizando o email utilizado ao realizar a compra ou contate-nos.");
                    }
                    if (findEmail[0].statusPayment == "PURCHASE_APPROVED" || findEmail[0].statusPayment == "PURCHASE_COMPLETE") {
                        yield usersStatus.findOneAndUpdate({ userId: userId }, { finding: false, finished: true, email: findEmail[0].email, planId: 2149153, datePayment: findEmail[0].datePayment });
                        yield bot.telegram.sendMessage(userId, `Cadastro localizado com sucesso! Seu plano é Easy Virtual Bot - Blaze Double\. Para verificar seu cadastro, digite /dados.`);
                        yield bot.telegram.sendMessage(userId, `Link de convite:https://t.me/+n1q_zrHywPc3N2Mx.`);
                    }
                    else {
                        yield usersStatus.findOneAndRemove({ userId: userId });
                        yield ctx.replyWithMarkdown(`Seu plano atualmente encontra-se como \`${findEmail[0].statusPayment.toUpperCase()}\`. Assim que o pagamento for aprovado, realize novamente seu registro digitando /start.`);
                        return;
                    }
                }
                else {
                    let user = (yield UsersHubla.find()).filter((value) => {
                        try {
                            return value.email.toLowerCase() == message.toLowerCase();
                        }
                        catch (e) {
                            return value.email == message;
                        }
                    });
                    user = user[0];
                    if (user) {
                        user = [user];
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
                        dateConverter(user[0].datePayment).then(({ date, datePayment }) => __awaiter(void 0, void 0, void 0, function* () {
                            let datePaymentUser = date;
                            let dateIsExpired = new Date(new Date(datePaymentUser).toISOString()).getTime() + 2592000000;
                            let datePlanExpire = new Date(dateIsExpired).toLocaleDateString('pt-BR');
                            if (new Date(Date.now()).getTime() >= new Date(dateIsExpired).getTime()) {
                                console.log(true);
                                yield usersStatus.findOneAndRemove({ userId: userId });
                                yield UsersHubla.findOneAndRemove({ email: user[0].email });
                                yield UsersStatusHubla.findOneAndRemove({ userId: userId });
                                yield bot.telegram.sendMessage(userId, `Excelente! Cadastro localizado com sucesso.\r\nSeu plano é Easy Virtual Bot - Blaze Double\r\nAlerta, Cadastro Hubla:\r\n\r\nSeu cadastro expirou na data ${datePlanExpire}.\r\nRealize a compra novamente através do site https://pay.hotmart.com/Y71715765W?off=loxotloi.`);
                                console.log(`Plan of user ${user[0].email} payment data was ${datePayment}  has expired in ${datePlanExpire} ACTION:BAN AND REMOVE`);
                            }
                            else {
                                console.log(false);
                                bot.telegram.sendMessage(userId, `Excelente! Cadastro localizado com sucesso.\r\nSeu plano é Easy Virtual Bot - Blaze Double\r\nAlerta, Cadastro Hubla:\r\n\r\nSeu cadastro mantera-se ativo até ${datePlanExpire}.\r\nAguarde enquanto gero seu link de acesso.`);
                                yield UsersStatusHubla.create({ userId: userId, email: user[0].email.toLowerCase(), datePayment: user[0].datePayment });
                                yield usersStatus.findOneAndUpdate({ userId: userId }, { finding: false, finished: true });
                                yield bot.telegram.sendMessage(userId, `Link de convite:https://t.me/+n1q_zrHywPc3N2Mx.`);
                                console.log(`Plan of user ${user[0].email} expiry in ${datePlanExpire}`);
                            }
                        }));
                    }
                    else {
                        yield usersStatus.findOneAndRemove({ userId: userId });
                        yield bot.telegram.sendMessage(userId, "Não localizei seu email em nosso banco de dados. Por favor, verifique se digitou corretamente e tente novamente digitando /start.");
                    }
                }
            }
            else if (userStatus["finding"]) {
                bot.telegram.sendMessage(userId, `Aguarde um momento enquanto localizo pelo seu email. Caso demore muito, contate-nos.`);
            }
            else if (userStatus["finished"]) {
                if (message == "/dados") {
                    let findUser;
                    console.log((yield UsersStatusHubla.findOne({ userId: userId })));
                    if ((yield usersStatus.findOne({ userId: userId })).email != null) {
                        findUser = (yield usersStatus.findOne({ userId: userId }));
                    }
                    else if ((yield UsersStatusHubla.findOne({ userId: userId })) != null) {
                        findUser = (yield UsersStatusHubla.findOne({ userId: userId }));
                    }
                    console.log(findUser);
                    bot.telegram.sendMessage(userId, `Olá ${firstName}, esses são seus respectivos dados:\r\n\r\nPlano: Easy Virtual Bot - Blaze Double\r\nData da compra: ${isNaN(findUser.datePayment) ? findUser.datePayment : new Date(findUser.datePayment).toLocaleDateString('pt-BR')}\r\nE-mail: ${findUser.email}\r\n\r\nQuaisquer dúvias ou inconsistência em relação aos seus dados, contate-nos.`);
                    return;
                }
                bot.telegram.sendMessage(userId, `Você já finalizou seu cadastro. Caso precisa de ajuda, contate-nos. Digite /dados para verificar seus dados.`);
            }
        }
        else {
            bot.telegram.sendMessage(userId, "Para inicializar seu cadastro, digite /start.");
        }
    }
}));
bot.launch();
