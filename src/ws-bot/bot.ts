import { RawData } from "ws"

enum SenderCargo {
    STATE = "State",
    PAIRING_CODE = "PCode",
    MESSAGE = "Message",
    FORM = "Form"
}

type simpleMessage = {
    from: string,
    body: string,
    timestamp?: number
}

type formInfo = {
    clientId: string,
    phoneNumber?: string
}

type SenderPkg = string|simpleMessage|formInfo

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

function rawToData (data: RawData|string) {
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

export {
    SenderCargo,
    SenderPkg,
    SenderInfo,
    SenderResponse,
    formInfo,
    simpleMessage,
    rawToData,
    dataToRaw
}