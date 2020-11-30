# OpsGenie plugin for Backstage

Welcome to the OpsGenie plugin!

## Plugin Setup

1. If you have standalone app (you didn't clone this repository), then do:

```bash
yarn add @k-phoen/backstage-plugin-opsgenie
```

2. Configure the plugin:

```yaml

proxy:
  '/opsgenie/api':
    target: https://api.eu.opsgenie.com
    headers:
      Authorization: GenieKey [[ API KEY here ]]

opsgenie:
  domain: https://my-app.app.eu.opsgenie.com/
```

**Note:** this plugin requires an API key issued from an integration. They can be retrieved frim the "Settings" tab and then "Integrations" tab.

3. Add the plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as PluginOpsgenie } from '@k-phoen/backstage-plugin-opsgenie';
```

4. Expose the plugin to your Backstage instance:

```ts
// packages/app/src/App.tsx
import { Router as OpsGenieRouter } from '@k-phoen/backstage-plugin-opsgenie';

// ...

const AppRoutes = () => (
  <Routes>
    /// ...
    <Route path="/opsgenie/*" element={<OpsGenieRouter />} />
    // ...
  </Routes>
);
```

5. Run backstage app with `yarn start` and navigate to services tabs.
