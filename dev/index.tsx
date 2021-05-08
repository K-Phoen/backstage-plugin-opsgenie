import { createDevApp } from '@backstage/dev-utils';
import { opsGeniePlugin } from '../src/plugin';

createDevApp().registerPlugin(opsGeniePlugin).render();
