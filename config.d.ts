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
         * If OpsGenie token has only read rights, you have to set it to true.
         * Some options would be disabled on a view part.
         * @visibility frontend
         */
        readOnly?: boolean;

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
