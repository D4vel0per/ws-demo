import { useState, useEffect } from "react";
import { formInfo, SenderCargo, SenderPkg, simpleMessage } from "../ws-bot/bot";
import { RawData, WebSocket } from "ws";

interface SenderInfo<SenderPkg> {
    cargo: SenderCargo,
    package: SenderPkg
}

interface SenderResponse {
    type: SenderCargo,
    data: string,
    from: string,
    status: "SUCCESS"|"FAILED"
}

function rawToData (data: RawData) {
    const info: SenderResponse = JSON.parse(data.toString());
    const { STATE, PAIRING_CODE, MESSAGE } = SenderCargo;

    if (info.status === "SUCCESS") {
        let result: SenderInfo<SenderPkg> = {
            cargo: info.type,
            package: info.data
        }
        switch (info.type) {
            case PAIRING_CODE:
            case STATE: return result as SenderInfo<string>
            case MESSAGE: return result as SenderInfo<simpleMessage>
        }
    }

    return null
}

function dataToRaw (clientId:string, phoneNumber?:string): string {
    let info: SenderInfo<formInfo> = {
        cargo: SenderCargo.FORM,
        package: {
            clientId, phoneNumber
        }
    }
    return JSON.stringify(info)
}

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