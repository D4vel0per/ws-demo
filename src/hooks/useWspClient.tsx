import { useState, useEffect, useRef } from "react";

import { 
    dataToRaw, 
    rawToData, 
    SenderCargo, 
    SenderInfo, 
    SenderPkg 
} from "../ws-bot/bot";

export default function useWspClient (username: string, phoneNumber?:string) {
    const [ isFetched, setIsFetched ] = useState(false);
    const [ clientData, setClientData ] = useState<SenderInfo<SenderPkg>>({
        package: "Connecting to the socket...",
        cargo: SenderCargo.STATE
    })
    
    const socket = useRef(new WebSocket("ws://192.168.0.109:8000")).current
    
    useEffect(() => {
        socket.onopen =  () => {
            setClientData({
                package: "Connected",
                cargo: SenderCargo.STATE
            })
            console.log("Successfully connected to the websocket")
        }
        socket.onmessage = (msj) => {
            try {
                let rawData:string = msj.data;
                let data = rawToData(rawData);
                console.log(data)
                if (data) {
                    setClientData(data)
                }
                setIsFetched(!!data)
            } catch (error) {
                console.log("ERROR:", error)
                setIsFetched(false)
            }
        }
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