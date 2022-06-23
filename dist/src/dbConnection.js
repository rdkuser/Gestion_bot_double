var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
let mongoUrl = `mongodb+srv://jubaDev:juba2013@cluster0.p5cvrra.mongodb.net/?retryWrites=true&w=majority`;
export default function dbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose.connect(mongoUrl).then((r) => {
            console.log("--------Connected---------");
        }).catch((r) => {
            console.log(`------------ ERROR -----------`);
            console.log(r);
            console.log(`------------ ERROR -----------`);
        });
    });
}
