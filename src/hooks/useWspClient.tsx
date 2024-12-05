import { useState, useEffect } from "react";
import { WebSocket } from "ws";

import { 
    dataToRaw, 
    rawToData, 
    SenderCargo, 
    SenderInfo, 
    SenderPkg 
} from "../ws-bot/bot";

export default function useWspClient (socket: WebSocket, username: string, phoneNumber?:string) {
    const [ isFetched, setIsFetched ] = useState(false);
    const [ clientData, setClientData ] = useState<SenderInfo<SenderPkg>>({
        package: "Connecting to the socket...",
        cargo: SenderCargo.STATE
    })

    useEffect(() => {
        socket.onopen =  () => {
            console.log("Successfully connected to the websocket")
        }
        socket.on("message", rawData => {
            let data = rawToData(rawData);
            if (data) {
                setClientData(data)
            }
            setIsFetched(!!data)
        })
    }, [])

    useEffect(() => {
        if (username) {
            let raw = dataToRaw(username, phoneNumber)
            console.log("Sending your data to the server as ", raw)
            socket.send(raw)
        } else {
            console.log("You didn't provide a username.");
        }
    }, [username, phoneNumber])

    return {
        isFetched,
        clientData
    }
}