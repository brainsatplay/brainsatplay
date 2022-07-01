import { SubscriptionService } from "../../core_old/SubscriptionService";
import { createRoute } from "../../common/general.utils";

class HTTPService extends SubscriptionService {

    name = 'http'
    service = 'http'
    static type = 'client'

    constructor(router) {
        super(router)
    }

    add = (user, socket) => {
        return new Promise(resolve => {

            this.connection = new EventSource(createRoute('',socket))
            this.connection.onopen = () => {
                this.connection.onmessage = (event) => {
                let data = JSON.parse(event.data)

                if (data.route === 'events/subscribe') resolve(data.message[0]) // Ensure IDs are Linked
                this.responses.forEach(f => f(data)) // Always trigger responses
            }
        }
    })
}

}


// let http = new HTTPClient()

// Export Instantiated Session
export default HTTPService
// export default http