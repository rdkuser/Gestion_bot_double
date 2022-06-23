import { Telegraf } from "telegraf";
import dbConnection from "./dbConnection";
import UsersStatus from "./models/UsersStatus";
import express from "express";
import WebHook from "./services/webhook";
import CashSureMODEL from "./models/CashSure";
process.env.TZ = "America/Sao_Paulo"
import ngrokConnection from "./services/ngrokConnect"
const app = express();
let plansInfo = {
    link_Surebet:"SUREBET: https://t.me/+A-8UPWDBZINiZWEx",
    link_CashOut:"CASHOUT: https://t.me/+y8jqwRjMp-Q1YTRh"
}
WebHook();
app.listen(55, () => {
    console.log("Connected");
    ngrokConnection()
});

app.get('/', (req, res) => {
    res.json({ status: "running" });
});
dbConnection();
const botToken = "5523506199:AAE1dxndPzgHxVGG9b8o6Y3VhKhX2xg7QYU";
const bot = new Telegraf(botToken);

export { bot, app };
bot.on("chat_join_request", async(ctx) =>{
    let userIdToJoin = ctx.chatJoinRequest.from.id;
    let userInfo = await UsersStatus.findOne({ userId: userIdToJoin });
    try{
        if (userInfo != null) {
            let statusSignature = (await CashSureMODEL.findOne({ email: userInfo.email })).statusPayment;
            if (userInfo.finished == true) {
                if (statusSignature == "PURCHASE_APPROVED" || statusSignature == "PURCHASE_COMPLETE") {
                    await bot.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin);
                }
            }
        }else{
            bot.telegram.declineChatJoinRequest(ctx.chatJoinRequest.chat.id, userIdToJoin)
        }
    }catch(e){

    }
});
bot.on("message", async(ctx) =>{
    let userId = ctx.from.id;
    let chatType = ctx.chat.type;
    //@ts-ignore
    let message = ctx.message.text;
    let firstName = ctx.from.first_name;
    let findUser = (await UsersStatus.findOne({ userId: userId })) == null ? false : true;
    if (typeof (message) != "string" || chatType != "private") {
        return;
    }
    if (message == "/start") {
        findUser ? bot.telegram.sendMessage(ctx.from.id, "Você já inicializou a verificação. Continue de onde parou.") : (async() => {
            await UsersStatus.create({ userId: userId, initialized: true, finding: false, finished: false, email: null, plan: null });
            await bot.telegram.sendMessage(userId, `Olá ${firstName}. Para inicializarmos seu cadastro, por favor diga-me qual seu email como consta na compra.`, { reply_markup: { force_reply: true } });
        })();
    }
    else if (message == "/reiniciar") {
        try {
            await UsersStatus.findOneAndRemove({ userId: userId }, { initialized: false, finding: true });
            bot.telegram.sendMessage(userId, "Dados apagados com sucesso! Para inicializar seu cadastro, digite /start.");
        }
        catch (r) {
            bot.telegram.sendMessage(userId, "Não há registros de cadastro para ser apagado. Para iniciar, digite /start.");
        }
    }
    else {
        if (findUser) {
            let userStatus = await UsersStatus.findOne({ userId: userId });
            if (userStatus["initialized"]) {
                await bot.telegram.sendMessage(userId, `Excelente! Seu email é ${message}. Aguarde enquato localizo no banco de dados.`);
                await UsersStatus.findOneAndUpdate({ userId: userId }, { initialized: false, finding: true });
                let findAllUsers = await CashSureMODEL.find();
                let findEmail = findAllUsers.filter((value) => {
                    try {
                        return value.email == message.toLowerCase();
                    }
                    catch (e) {
                        console.log(e);
                    }
                });
                if (findEmail[0] != null) {
                    let registerExist = await UsersStatus.findOne({ email: message.toLowerCase() });
                    if (registerExist != null) {
                        await UsersStatus.findOneAndRemove({ userId: userId });
                        return bot.telegram.sendMessage(userId, "Já existe um cadastro com o email informado. Por favor, registre-se novamente (/start) utilizando o email utilizado ao realizar a compra ou contate-nos.");
                    }
                    if (findEmail[0].statusPayment == "PURCHASE_APPROVED" || findEmail[0].statusPayment == "PURCHASE_COMPLETE") {
                        await UsersStatus.findOneAndUpdate({ userId: userId }, { finding: false, finished: true, email: findEmail[0].email, planId: 2149153, datePayment: findEmail[0].datePayment });
                        await bot.telegram.sendMessage(userId, `Cadastro localizado com sucesso! Seu produto é SUREBET + CASHOUT. Para verificar seu cadastro, digite /dados.`);
                        await bot.telegram.sendMessage(userId, `Links de convite:\r\n${plansInfo.link_CashOut}\r\n${plansInfo.link_Surebet}`);
                    }
                    else {
                        await UsersStatus.findOneAndRemove({ userId: userId });
                        await ctx.replyWithMarkdown(`Seu plano atualmente encontra-se como \`${findEmail[0].statusPayment.toUpperCase()}\`. Assim que o pagamento for aprovado, realize novamente seu registro digitando /start.`);
                        return;
                    }
                }
                   else{
                        await UsersStatus.findOneAndRemove({ userId: userId });
                        await bot.telegram.sendMessage(userId, "Não localizei seu email em nosso banco de dados. Por favor, verifique se digitou corretamente e tente novamente digitando /start.");
                    }
                
                }
                else if (userStatus["finding"]) {
                    bot.telegram.sendMessage(userId, `Aguarde um momento enquanto localizo pelo seu email. Caso demore muito, contate-nos.`);
                }
                else if (userStatus["finished"]) {
                    if (message == "/dados") {
                        let findUser:any;
                        let dataUser:any;
                        if((await UsersStatus.findOne({ userId: userId })).email != null){
                            findUser = (await UsersStatus.findOne({ userId: userId }))
                            dataUser = (await CashSureMODEL.findOne({email:findUser.email}))
                        }
                        //@ts-ignore
                        bot.telegram.sendMessage(userId, `Olá ${firstName}, esses são seus respectivos dados:\r\n\r\nPlano: SUREBET + CASHOUT - PLANO VIP\r\nData da compra: ${new Date(findUser.datePayment).toLocaleDateString('pt-BR')}\r\nE-mail: ${findUser.email}\r\nLinks de acesso:\r\n${plansInfo.link_CashOut}\r\n${plansInfo.link_Surebet}\r\nStatus do pagamento: ${dataUser.statusPayment}\r\n\r\nQuaisquer dúvias ou inconsistência em relação aos seus dados, contate-nos.`);
                        return;
                    }
                bot.telegram.sendMessage(userId, `Você já finalizou seu cadastro. Caso precisa de ajuda, contate-nos. Digite /dados para verificar seus dados.`);
                }
            }
            else {
                bot.telegram.sendMessage(userId, "Para inicializar seu cadastro, digite /start.");
            }
        }
    });
bot.launch();
