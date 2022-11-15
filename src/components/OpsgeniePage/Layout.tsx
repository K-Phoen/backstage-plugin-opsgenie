import { Children, default as React, Fragment, isValidElement } from 'react';
import { attachComponentData } from '@backstage/core-plugin-api';
import { Header, Page, RoutedTabs } from '@backstage/core-components';
import { TabProps } from '@material-ui/core';

type SubRoute = {
  path: string;
  title: string;
  children: JSX.Element;
  tabProps?: TabProps<React.ElementType, { component?: React.ElementType }>;
};

const Route: (props: SubRoute) => null = () => null;

// This causes all mount points that are discovered within this route to use the path of the route itself
attachComponentData(Route, 'core.gatherMountPoints', true);

function createSubRoutesFromChildren(
  childrenProps: React.ReactNode,
): SubRoute[] {
  // Directly comparing child.type with Route will not work with in
  // combination with react-hot-loader in storybook
  // https://github.com/gaearon/react-hot-loader/issues/304
  const routeType = (
    <Route path="" title="">
      <div />
    </Route>
  ).type;

  return Children.toArray(childrenProps).flatMap(child => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === Fragment) {
      return createSubRoutesFromChildren(child.props.children);
    }

    if (child.type !== routeType) {
      throw new Error('Child of ExploreLayout must be an ExploreLayout.Route');
    }

    const { path, title, children, tabProps } = child.props;
    return [{ path, title, children, tabProps }];
  });
}

type LayoutProps = {
  children?: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const routes = createSubRoutesFromChildren(children);

  return (
    <Page themeId="tool">
      <Header title="Opsgenie" />

      <RoutedTabs routes={routes} />
    </Page>
  );
};

Layout.Route = Route;
