import React, { ReactNode } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const InstallationGroup = ({ children }: { children: ReactNode }) => (
  <Tabs groupId="installation">
    {children}
  </Tabs>
);

export const Local = ({ children }: { children: ReactNode }) => (
  <TabItem value="local" label="Local Installation">
    {children}
  </TabItem>
);

export const Fabric = ({ children }: { children: ReactNode }) => (
  <TabItem value="fabric" label="Fabric">
    {children}
  </TabItem>
);
