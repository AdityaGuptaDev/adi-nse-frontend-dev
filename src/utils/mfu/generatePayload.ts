import { templates } from "./transactions";

type AnyObject = Record<string, any>;

function deepMerge(target: AnyObject, source: Partial<AnyObject>): AnyObject {
    const output = { ...target };

    for (const key in source) {
        if (
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key]) &&
            typeof target[key] === "object"
        ) {
            output[key] = deepMerge(target[key], source[key] as AnyObject);
        } else {
            output[key] = source[key];
        }
    }

    return output;
}


export class MfuPayload {
    getTransactionPayload(
        txnType: "B" | "V" | "E" | "J" | "O" | "R",
        params: Partial<AnyObject> = {}
    ): AnyObject {
        const template = templates[txnType.toUpperCase()];
        if (!template) throw new Error(`Unsupported transaction type: ${txnType}`);

        return deepMerge(template, params);
    }

}