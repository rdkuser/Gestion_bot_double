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
import express from "express";
import { app } from "../bot.js";
import handleSignature from "./handleSign.js";
export default function WebHook() {
    app.use(express.json());
    app.post("/webhookEasyVT", (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield handleSignature(req, res).then(() => {
            res.json({ status: "Sucess" });
        }).catch((e) => {
            console.log(e);
            res.status(404).json({ status: `Error as occurred.` });
        });
    }));
}
