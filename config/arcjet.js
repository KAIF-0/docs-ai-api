import arcjet, { detectBot, shield, tokenBucket, validateEmail } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import { ENV } from "./env.js";

const baseRules = [
    shield({ mode: "LIVE" }),
    detectBot({
        mode: "LIVE",
        allow: [
            "CATEGORY:SEARCH_ENGINE",
            "CATEGORY:PREVIEW",
            // "CATEGORY:MONITORING",

            //common bots for testing
            "POSTMAN",
            "CURL",
            // "CATEGORY:HTTP_LIBRARY",
        ],
    }),
    // validateEmail({
    //     mode: "LIVE",
    //     deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    // }),
];

export const RATE_LIMIT_CONFIGS = {
    STRICT: {
        refillRate: 2,
        interval: 60,
        capacity: 10,
        requested: 1
    },
    MODERATE: {
        refillRate: 5,
        interval: 60,
        capacity: 15,
        requested: 1
    },
    PAYMENT: {
        refillRate: 10,
        interval: 3600,
        capacity: 30,
        requested: 1
    },
    STANDARD: {
        refillRate: 20,
        interval: 60,
        capacity: 50,
        requested: 1
    },
    LENIENT: {
        refillRate: 50,
        interval: 60,
        capacity: 100,
        requested: 1
    }
};
class Arcjet {
    constructor(instanceType) {
        this.arcjet = arcjet({
            key: ENV.ARCJET_KEY,
            rules: [
                ...baseRules,
                tokenBucket({
                    mode: "LIVE",
                    characteristics: ["ip.src"],  //automatically picks IP source address
                    refillRate: instanceType.refillRate,
                    interval: instanceType.interval,
                    capacity: instanceType.capacity,
                }),
            ],
        });

    }
}


export const ajStrict = new Arcjet(RATE_LIMIT_CONFIGS.STRICT);
export const ajModerate = new Arcjet(RATE_LIMIT_CONFIGS.MODERATE);
export const ajPayment = new Arcjet(RATE_LIMIT_CONFIGS.PAYMENT);
export const ajStandard = new Arcjet(RATE_LIMIT_CONFIGS.STANDARD);
export const ajLenient = new Arcjet(RATE_LIMIT_CONFIGS.LENIENT);

