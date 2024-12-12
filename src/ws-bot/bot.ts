import { RawData } from "ws"
import { SenderResponse, SenderCargo, SenderInfo, SenderPkg, simpleMessage, formInfo, BasicStatus } from "./types";

function rawToData (data: RawData|string) {
    const info: SenderResponse = JSON.parse(data.toString());
    const { STATE, PAIRING_CODE, MESSAGE } = SenderCargo;

    if (info.status === BasicStatus.SUCCESS) {
        let result: SenderInfo = {
            cargo: info.type,
            package: info.data
        }
        switch (info.type) {
            case PAIRING_CODE:
            case STATE: return result as SenderInfo
            case MESSAGE: {
                result.package = JSON.parse(info.data);
                return result as SenderInfo
            }
            default: return info.status;
        }
    }

    return info.status
}

function dataToRaw (clientId:string, phoneNumber?:string): string {
    let info: SenderInfo = {
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