export interface Config {
    opsgenie: {
        /**
         * Domain used by users to access Opsgenie web UI.
         * Example: https://my-app.app.eu.opsgenie.com/
         * @visibility frontend
         */
        domain: string;

        /**
         * Path to use for requests via the proxy, defaults to /opsgenie/api
         * @visibility frontend
         */
        proxyPath?: string;

        /**
         * Configuration options used to generate analytics graphs
         * @visibility frontend
         */
        analytics?: {
            /** @visibility frontend */
            businessHours?: {
                /** @visibility frontend */
                start: number; // 24h format
                /** @visibility frontend */
                end: number;  // 24h format
            };
        };
    }
}