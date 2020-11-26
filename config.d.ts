export interface Config {
    opsgenie: {
        /**
         * Domain used by users to access OpsGenie web UI.
         * Example: https://my-app.app.eu.opsgenie.com/
         */
        domain: string;

        /**
         * Path to use for requests via the proxy, defaults to /opsgenie/api
         */
        proxyPath?: string;
    }
}