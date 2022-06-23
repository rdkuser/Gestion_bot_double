import express from "express"
import {app} from "../bot"
import IEventsPayment from "./event.interface"
import handleSignature from "./handleSign"
export default function WebHook(){
    //Easy - Virtual Plan
    app.use(express.json())
    app.post("/webhookCashOut", async(req:IEventsPayment, res)=>{
        await handleSignature(req,res).then(()=>{
            res.json({status:"Sucess"})
        }).catch((e)=>{
            console.log(e)
            res.status(404).json({status:`Error as occurred.`})
        })
    })
}