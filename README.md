# OpsGenie plugin for Backstage

Welcome to the opsgenie plugin!

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then do

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

3. Add plugin to the list of plugins:

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