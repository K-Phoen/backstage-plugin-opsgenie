# Setup

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @essent/backstage-plugin-opsgenie
```

Configure the plugin in `app-config.yaml`. The proxy endpoint described below will allow the frontend
to authenticate with Opsgenie without exposing your API key to users.
[Create an API key](creating-api-key.md) if you don't already have one.

```yaml
# app-config.yaml
proxy:
  '/opsgenie/api':
    # Use "target: https://api.eu.opsgenie.com" for an EU account
    target: https://api.eu.opsgenie.com
    headers:
      Authorization: GenieKey ${OPSGENIE_API_KEY}

opsgenie:
  # Use "domain: https://myorganization.app.eu.opsgenie.com/" for an EU account
  domain: https://myorganization.app.opsgenie.com/
```

Expose the Opsgenie page:

```ts
// packages/app/src/App.tsx
import { OpsgeniePage } from '@essent/backstage-plugin-opsgenie';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/opsgenie" element={<OpsgeniePage />} />
    // ...
  </FlatRoutes>
);
```

Add a link to the sidebar:

```ts
// packages/app/src/components/Root/Root.tsx
import ReportProblemIcon from '@material-ui/icons/ReportProblem';

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      // ...
      <SidebarItem icon={ReportProblemIcon} to="opsgenie" text="Incidents" />
      // ...
    </Sidebar>
  </SidebarPage>
);
```

You can now navigate to the Opsgenie page from your app's sidebar!