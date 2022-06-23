var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Telegraf } from "telegraf";
import dbConnection from "./dbConnection.js";
import UsersStatus from "./models/UsersStatus.js";
import express from "express";
import WebHook from "./services/webhook.js";
import CashSureMODEL from "./models/CashSure.js";
process.env.TZ = "America/Sao_Paulo";
import ngrokConnection from "./services/ngrokConnect.js";
const app = express();
let plansInfo = {
    link_Surebet: "SUREBET: https://t.me/+A-8UPWDBZINiZWEx",
    link_CashOut: "CASHOUT: https://t.me/+y8jqwRjMp-Q1YTRh"
};
WebHook();
app.listen(55, () => {
    console.log("Connected");
    ngrokConnection();
});
app.get('/', (req, res) => {
    res.json({ status: "running" });
});
dbConnection();
const botToken = "5523506199:AAE1dxndPzgHxVGG9b8o6Y3VhKhX2xg7QYU";
const bot = new Telegraf(botToken);
export { bot, app };
bot.on("chat_join_request", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let userIdToJoin = ctx.chatJoinRequest.from.id;
    let userInfo = yield UsersStatus.findOne({ userId: userIdToJoin });
    try {
        if (userInfo != null) {
            let statusSignature = (yield CashSureMODEL.findOne({ trans_code: userInfo.trans_code })).statusPayment;
            if (userInfo.finished == true) {
                if (statusSignature == "PURCHASE_APPROVED" || statusSignature == "PURCHASE_COMPLETE") {
                    yield bot.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
                }
            }
        }
        else {
            bot.telegram.declineChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
        }
    }
    catch (e) {
    }
}));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = ctx.from.id;
    let chatType = ctx.chat.type;
    let message = ctx.message.text;
    let firstName = ctx.from.first_name;
    let findUser = (yield UsersStatus.findOne({ userId: userId })) == null ? false : true;
    if (typeof (message) != "string" || chatType != "private") {
        return;
    }
    if (message == "/start") {
        findUser ? bot.telegram.sendMessage(ctx.from.id, "Você já inicializou a verificação. Continue de onde parou.") : (() => __awaiter(void 0, void 0, void 0, function* () {
            yield UsersStatus.create({ userId: userId, initialized: true, finding: false, finished: false, trans_code: null, plan: null });
            yield bot.telegram.sendMessage(userId, `Olá ${firstName}. Para inicializarmos seu cadastro, por favor diga-me qual seu código de pagamento como consta na compra.`, { reply_markup: { force_reply: true } });
        }))();
    }
    else if (message == "/reiniciar") {
        try {
            yield UsersStatus.findOneAndRemove({ userId: userId }, { initialized: false, finding: true });
            bot.telegram.sendMessage(userId, "Dados apagados com sucesso! Para inicializar seu cadastro, digite /start.");
        }
        catch (r) {
            bot.telegram.sendMessage(userId, "Não há registros de cadastro para ser apagado. Para iniciar, digite /start.");
        }
    }
    else {
        if (findUser) {
            let userStatus = yield UsersStatus.findOne({ userId: userId });
            if (userStatus["initialized"]) {
                yield bot.telegram.sendMessage(userId, `Excelente! Seu código de transação é ${message}. Aguarde enquato localizo no banco de dados.`);
                yield UsersStatus.findOneAndUpdate({ userId: userId }, { initialized: false, finding: true });
                let findAllUsers = yield CashSureMODEL.find();
                let findEmail = findAllUsers.filter((value) => {
                    try {
                        return value.trans_code == message
                    }
                    catch (e) {
                        console.log(e);
                    }
                });
                if (findEmail[0] != null) {
                    let registerExist = yield UsersStatus.findOne({ trans_code: message.toLowerCase() });
                    if (registerExist != null) {
                        yield UsersStatus.findOneAndRemove({ userId: userId });
                        return bot.telegram.sendMessage(userId, "Já existe um cadastro com o código de pagamento informado. Por favor, registre-se novamente (/start) utilizando o código de pagamento obtido ao realizar a compra ou contate-nos.");
                    }
                    if (findEmail[0].statusPayment == "PURCHASE_APPROVED" || findEmail[0].statusPayment == "PURCHASE_COMPLETE") {
                        yield UsersStatus.findOneAndUpdate({ userId: userId }, { finding: false, finished: true, trans_code: findEmail[0].trans_code, planId: 2149153, datePayment: findEmail[0].datePayment });
                        yield bot.telegram.sendMessage(userId, `Cadastro localizado com sucesso! Seu produto é SUREBET + CASHOUT. Para verificar seu cadastro, digite /dados.`);
                        yield bot.telegram.sendMessage(userId, `Links de convite:\r\n${plansInfo.link_CashOut}\r\n${plansInfo.link_Surebet}`);
                    }
                    else {
                        yield UsersStatus.findOneAndRemove({ userId: userId });
                        yield ctx.replyWithMarkdown(`Seu plano atualmente encontra-se como \`${findEmail[0].statusPayment.toUpperCase()}\`. Assim que o pagamento for aprovado, realize novamente seu registro digitando /start.`);
                        return;
                    }
                }
                else {
                    yield UsersStatus.findOneAndRemove({ userId: userId });
                    yield bot.telegram.sendMessage(userId, "Não localizei seu código de pagamento em nosso banco de dados. Por favor, verifique se digitou corretamente e tente novamente digitando /start.");
                }
            }
            else if (userStatus["finding"]) {
                bot.telegram.sendMessage(userId, `Aguarde um momento enquanto localizo pelo seu código de pagamento. Caso demore muito, contate-nos.`);
            }
            else if (userStatus["finished"]) {
                if (message == "/dados") {
                    let findUser;
                    let dataUser;
                    if ((yield UsersStatus.findOne({ userId: userId })).trans_code != null) {
                        findUser = (yield UsersStatus.findOne({ userId: userId }));
                        dataUser = (yield CashSureMODEL.findOne({ trans_code: findUser.trans_code }));
                    }
                    bot.telegram.sendMessage(userId, `Olá ${firstName}, esses são seus respectivos dados:\r\n\r\nPlano: SUREBET + CASHOUT - PLANO VIP\r\nData da compra: ${new Date(findUser.datePayment).toLocaleDateString('pt-BR')}\r\nCódigo-transação: ${findUser.trans_code}\r\nLinks de acesso:\r\n${plansInfo.link_CashOut}\r\n${plansInfo.link_Surebet}\r\nStatus do pagamento: ${dataUser.statusPayment}\r\n\r\nQuaisquer dúvias ou inconsistência em relação aos seus dados, contate-nos.`);
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
