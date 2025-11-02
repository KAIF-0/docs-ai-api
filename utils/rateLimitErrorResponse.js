class RateLimitAPIResponse {
    constructor(errorMessage, retryAfter = null) {
        this.success = false
        this.message = errorMessage || "Something went wrong!"
        if(retryAfter){
            this.retryAfter = retryAfter
        }
    }
}

export { RateLimitAPIResponse };