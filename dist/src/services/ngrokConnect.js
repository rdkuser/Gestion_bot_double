import ngrok from "ngrok";
export default function ngrokConnection() {
    ngrok.connect({ authtoken: "2AjQt3KiVJUU8hRJnis1cQRSJpF_LneKbrNXLr34VyJckbDR", addr: 55 }).then((ngroUrl) => {
        return console.log(ngroUrl);
    });
}
