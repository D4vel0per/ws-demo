import { Client, LocalAuth, Message } from "whatsapp-web.js";
import * as path from "path"
import * as fs from "fs"

const afs = fs.promises

async function getClient (clientId: string) {
    let dir = path.join("clients", clientId)
    try {
        await afs.access(dir, fs.constants.F_OK)
    } catch {
        console.log("Client", clientId, "was not found.")
        return null
    }
    return new Client({
        authStrategy: new LocalAuth({
            clientId,
            dataPath: dir
        })
    })
}

async function createClient (clientId: string, phoneNumber: string, sender: expoSender) {
    let dir = path.join("clients", clientId)
    let ifExists = await getClient(clientId)
    if (ifExists) return ifExists
    try {
        fs.mkdirSync(dir);
    } catch (err) {
        console.log("ERROR CREATING CLIENT: ", err)
    }

    let client = new Client({
        authStrategy: new LocalAuth({
            clientId,
            dataPath: dir
        })
    });
    let sendCode = sender.bind(null, client, SenderCargo.PAIRING_CODE)
    client.requestPairingCode(phoneNumber, true)
    .then(pairingCode => sendCode(pairingCode))
    
    return client;
}

enum SenderCargo {
    STATE = "State",
    PAIRING_CODE = "PCode",
    MESSAGE = "Message"
}

type SenderPkg = string|Message

type expoSender = (client:Client, cargo: SenderCargo, pkg: SenderPkg) => any

async function initClient (clientName: string, sender: expoSender) {
    let client = await getClient(clientName)
    if (!client) return clientName;

    let show = sender.bind(null, client, SenderCargo.STATE)
    let sendCode = sender.bind(null, client, SenderCargo.PAIRING_CODE)
    let onMessage = sender.bind(null, client, SenderCargo.MESSAGE)

    client.on("qr", async () => {
        let pairingCode = await client.requestPairingCode(client.info.wid.user, true)
        sendCode(pairingCode)
    })
    client.on("loading_screen", () => {
        show("Preparing the spaceship...");
        console.log("Loading...")
    });
    client.on("authenticated", () => {
        show("Everyone on board...");
        console.log("Succesfully Authenticated.")
    });
    client.on("auth_failure", (err) => {
        show('Oh no, something wrong happened!');
        console.log("Authentication failure: ", err)
    })
    client.on("ready", () => {
        show("Let's go!")
        console.log("Everything up and running... Ready to receive messages.")
    })
    client.on("message", (msj) => onMessage(msj))

    try {
        await client.initialize()
        console.log("Client " + client.info.wid.user + " Initialized");
        return client
    } catch (err) {
        console.log("Error while client initialazing "+ client.info.wid.user +" -> ", err)
        return client.info.wid.user
    }
}

async function runClients (
    sender: expoSender
) {
    let clientNames = await afs.readdir("clients")
    let proms = clientNames.map(clientName => initClient(clientName, sender))

    let results = await Promise.allSettled(proms)
    let initialValue: {
        accepted: Client[],
        rejected: string[]
    } = {
        accepted: [],
        rejected: []
    }
    let allClients = results.reduce((obj, result) => {
        if (result.status === "fulfilled") {
            if (typeof result.value !== "string") 
                obj.accepted.push(result.value)
            else 
                obj.rejected.push(result.value)
        } else if (result.status === "rejected") {
            console.log(result.reason)
        }
        return obj
    }, initialValue)

    return allClients
}

//HOW TO USE

//FIRST OF ALL, YOU NEED TO HAVE AT LEAST 1 CLIENT FOR THIS FUNCTION TO WORK PROPERLY
//THE CLIENT ID MUST BE THEIR PHONE NUMBER FOR EASIER 

export {
    expoSender,
    SenderCargo,
    SenderPkg,
    getClient,
    createClient,
    initClient
}