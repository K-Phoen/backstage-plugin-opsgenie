# Display Who Is On-Call on a component page

Adding the `EntityOpsgenieOnCallListCard` component to an entity's page will display a list of on call people related to that entity.

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import {
  EntityOpsgenieOnCallListCard,
  isOpsgenieOnCallListAvailable
} from '@essent/backstage-plugin-opsgenie';

// ...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={6}>
      {/* OpsGenie alert card start */}
      <EntitySwitch>
        <EntitySwitch.Case if={isOpsgenieOnCallListAvailable}>
          <EntityOpsgenieOnCallListCard title="OpsGenie Who Is On-Call"/>
        </EntitySwitch.Case>
      </EntitySwitch>
      {/* OpsGenie alert card end */}
    </Grid>
    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);
```

Opsgenie team is correlated to Backstage entities using an annotation added in the entity's `catalog-info.yaml` file:

```yml
annotations:
  opsgenie.com/team: 'Awesome Team'
```

This annotation accepts any valid OpsGenie team name.
