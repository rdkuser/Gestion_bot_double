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
let dateRecived = '10/06/2022';
let dateConverter = (date) => __awaiter(this, void 0, void 0, function* () {
    let dateSplit = date.split('/');
    let newDateConvert = `${dateSplit[1]}/${dateSplit[0]}/${dateSplit[2]}`;
    return newDateConvert;
});
dateConverter(dateRecived).then((date) => {
    let datePayment = date;
    let dateIsExpired = new Date(new Date(datePayment).toISOString()).getTime() + 2592000000;
    let datePlanExpire = new Date(dateIsExpired).toLocaleDateString('pt-BR');
    if (new Date(Date.now()).getTime() >= new Date(dateIsExpired).getTime()) {
        console.log(true);
    }
    else {
        console.log(false);
        console.log(`Plan user expiry in ${datePlanExpire}`);
    }
});
