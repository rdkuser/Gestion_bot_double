import mongoose from "mongoose";
let mongoUrl = `mongodb+srv://jubaDev:juba2013@cluster0.p5cvrra.mongodb.net/?retryWrites=true&w=majority`;
export default async function dbConnection() {
        await mongoose.connect(mongoUrl).then((r) => {
            console.log("--------Connected---------");
        }).catch((r) => {
            console.log(`------------ ERROR -----------`);
            console.log(r);
            console.log(`------------ ERROR -----------`);
        });
}
