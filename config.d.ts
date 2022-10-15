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
         * Enables "read-only" mode on the plugin. In this mode, actions such as acknowledging or closing an alert will be disabled.
         * Enable this if you only want to expose Opsgenie-originated information or if the API token you use has only read permissions.
         *
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
