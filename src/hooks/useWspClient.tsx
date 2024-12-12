import { useState, useEffect, useRef } from "react";

import { 
    dataToRaw, 
    rawToData, 
    SenderCargo, 
    SenderInfo
} from "../ws-bot/bot";
import { BasicStatus, useWspSession } from "../ws-bot/types";

export default function useWspClient (username: string, phoneNumber?:string): useWspSession {
    const [ isFetched, setIsFetched ] = useState(false);
    const [ clientData, setClientData ] = useState<SenderInfo>({
        package: "Connecting to the socket...",
        cargo: SenderCargo.STATE
    })
    
    const socket = useRef(new WebSocket("ws://192.168.0.106:8000")).current
    
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
                if (typeof data !== "string") {
                    setClientData(data)
                    setIsFetched(true)
                } else {
                    if (data === BasicStatus.FAILED) {
                        setClientData({
                            package: "Couldn't find your session, you must create a new one.",
                            cargo: SenderCargo.STATE
                        })
                    }
                    
                    setIsFetched(data === BasicStatus.SUCCESS)
                }
                
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