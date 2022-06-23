import IEventsPayment from "./event.interface";
import { bot } from "../bot";
import usersStatus from "../models/UsersStatus";
import CashSure from "../models/CashSure"
let plansInfo = [
    {
        "planId":0,
        "planValues":{
            "groupName":"CashSure",
            "groupId":-1001773176019,
            "groupIdTwo":-1001317612621,
            "modelPlan":"CashSure"
        }
    }
]
export default async function handleSignature(paymentData:IEventsPayment, res:any){
    if(paymentData.body.data.buyer.email == null){
        return
    }
    let paymentStatus = paymentData.body.event
    let planData = plansInfo.filter((plan)=>{
       return  plan.planId == paymentData.body.data.product.id
    })
    let planUser = planData[0]
    let userEmail = paymentData.body.data.buyer.email
    let datePayment = paymentData.body.data.purchase.approved_date
    let planId = paymentData.body.data.product.id
    let statusPayment = paymentData.body.event
    let planModel:any;
    let userModelTelegram:any;
    if(planUser != null){
        if(planUser.planValues.modelPlan == "CashSure")
        planModel = CashSure;
        userModelTelegram = usersStatus
    }else{
        return
    }
    let findUser = await planModel.findOne({email:paymentData.body.data.buyer.email.toLowerCase()})
    let userTelegram = await userModelTelegram.findOne({email:paymentData.body.data.buyer.email.toLowerCase()})
    if(paymentStatus == "PURCHASE_APPROVED" || paymentStatus == "PURCHASE_COMPLETE"){
        if(findUser == null){
            await planModel.create({email:userEmail.toLowerCase(), datePayment:datePayment, statusPayment:statusPayment, planId:planId})
        }else{
            await planModel.findOneAndUpdate({email:userEmail}, {statusPayment:paymentStatus})
            try{
                let statusChatMember = (await bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status 
                if(statusChatMember == "kicked"){
                    await bot.telegram.unbanChatMember(planUser.planValues.groupId, userTelegram.userId)
                }
            }catch(e){
                console.log(e)
            }
            try{
                let statusChatMember = (await bot.telegram.getChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)).status 
                if(statusChatMember == "kicked"){
                    await bot.telegram.unbanChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)
                }
            }catch(e){
                console.log(e)
            }
            return await bot.telegram.sendMessage(userTelegram.userId, `Olá usuário! Houve uma alternância em relação ao status de seu plano. Você acaba de ser removido da lista de banidos e está permitido acessar o grupo novamente pelo link enviado anteriormente.`)    
        }
    }else{
        await planModel.findOneAndUpdate({email:userEmail}, {statusPayment:paymentStatus})
        try{
            let statusChatMember = (await bot.telegram.getChatMember(planUser.planValues.groupId, userTelegram.userId)).status 
            if(statusChatMember != "kicked"){
                await bot.telegram.banChatMember(planUser.planValues.groupId, userTelegram.userId)
            }
        }catch(e){
            console.log(e)
        }
        try{
            let statusChatMember = (await bot.telegram.getChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)).status 
            if(statusChatMember != "kicked"){
                await bot.telegram.banChatMember(planUser.planValues.groupIdTwo, userTelegram.userId)
            }
        }catch(e){
            console.log(e)
        }
        return await bot.telegram.sendMessage(userTelegram.userId, `Olá! Houve uma alternância em relação ao status de seu plano. Você foi removido do canal até que volte realizar o pagamento.\r\n\r\nVoltando realizar o pagamento, você será notificado por aqui, afirmando que foi removido da lista de banidos e poderá acessar seu canal novamente pelo link de convite enviado anteriormente.`)    
    }
}
