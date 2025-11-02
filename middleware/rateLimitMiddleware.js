import { ajStrict, ajModerate, ajPayment, ajStandard, ajLenient, RATE_LIMIT_CONFIGS } from '../config/arcjet.js';
import { isSpoofedBot } from '@arcjet/inspect';
import { RateLimitAPIResponse } from '../utils/rateLimitErrorResponse.js';

class RateLimitMiddleware {
    constructor() {
        this.arcjetInstances = {
            STRICT: ajStrict,
            MODERATE: ajModerate,
            PAYMENT: ajPayment,
            STANDARD: ajStandard,
            LENIENT: ajLenient
        };
    }

    async middleware(severity = 'STANDARD') {
        return async (c, next) => {
            try {
                const ip = 
                        c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
                        c.req.header('x-real-ip') ||
                        c.req.header('cf-connecting-ip') ||
                        c.env?.REMOTE_ADDR ||
                        'unknown';

                const userAgent = c.req.header('user-agent') || 'unknown';

                const uniqueKey = `${ip}-${userAgent}`;

                const aj = this.arcjetInstances[severity].arcjet;
                const config = RATE_LIMIT_CONFIGS[severity];

                const decision = await aj.protect(c.req.raw, {
                    requested: config.requested,
                    userId: uniqueKey
                });

                console.log(`[${severity}] Arcjet decision for IP ${uniqueKey}:`, decision.conclusion);

                if (decision.isDenied()) {
                    if (decision.reason.isRateLimit()) {
                        return c.json(new RateLimitAPIResponse("Too many requests!", new Date(decision.reason.resetTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })), 429);
                    }
                     else if (decision.reason.isBot()) {
                        return c.json(new RateLimitAPIResponse("Bot access not allowed!"), 403);
                    }
                     else {
                        return c.json(new RateLimitAPIResponse("Access forbidden!"), 403);
                    }
                }

                if (decision.ip.isHosting()) {
                    return c.json(new RateLimitAPIResponse("Hosting IPs are not allowed!"), 403);
                }

                if (decision.results.some(isSpoofedBot)) {
                    return c.json(new RateLimitAPIResponse("Spoofed bots are not allowed!"), 403);
                }

                await next();
            } catch (error) {
                console.error('Rate limit middleware error:', error);
                await next();
            }
        };
    }
}

const rateLimitManager = new RateLimitMiddleware();

export const strictRateLimit = await rateLimitManager.middleware('STRICT');
export const moderateRateLimit = await rateLimitManager.middleware('MODERATE');
export const paymentRateLimit = await rateLimitManager.middleware('PAYMENT');
export const standardRateLimit = await rateLimitManager.middleware('STANDARD');
export const lenientRateLimit = await rateLimitManager.middleware('LENIENT');