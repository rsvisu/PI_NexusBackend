import { version as uuidVersion } from "uuid";
import { validate as uuidValidate } from "uuid";

function uuidValidateV4(uuid) {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export { uuidValidateV4 }