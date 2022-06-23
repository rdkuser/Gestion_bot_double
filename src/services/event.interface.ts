interface IEventsPayment {
    body:{
        data:{
            product:{
                id:Number
            }
            purchase:{
                transaction:String,
                approved_date:Number
            },
            buyer:{
                email:String
            }
        },
        event?: "PURCHASE_APPROVED" | "PURCHASE_COMPLETE" 
    }
}
export default IEventsPayment