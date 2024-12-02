import { useState, useEffect } from "react";
import { Client } from "whatsapp-web.js";
import { createClient, expoSender, initClient } from "../ws-bot/bot";

export default function useWspClient (username: string, sender: expoSender, phoneNumber?:string) {
    const [ isFetched, setIsFetched ] = useState(false);
    const [ client, setClient ] = useState<Client|null>(null)
    useEffect(() => {
        setIsFetched(false)
        initClient(username, sender).then(async c => {
            if (typeof c !== "string") {
                setClient(c)
                setIsFetched(true)
            } else if (phoneNumber) {
                let newClient = await createClient(username, phoneNumber, sender)
                setClient(newClient)
                setIsFetched(!!newClient)
            } else {
                setIsFetched(false)
            }
        })
    }, [username])

    return {
        isFetched,
        client
    }
}