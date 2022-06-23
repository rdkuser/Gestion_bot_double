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
import EasyVT from "../models/EasyVt.js";
import dbConnection from "../dbConnection.js";
import UsersHubla from "../models/UsersHubla.js";
dbConnection();
let usersArr = [];
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield EasyVT.find().then((users) => __awaiter(void 0, void 0, void 0, function* () {
        users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            usersArr.push({ email: user.email, datePayment: user.datePayment, statusPayment: "PURCHASE_COMPLETE", isHubla: true });
        }));
        for (let user of usersArr) {
            yield UsersHubla.create(user);
        }
    }));
}))();
