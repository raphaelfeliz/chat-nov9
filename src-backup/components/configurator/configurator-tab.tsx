/* *file-summary*
PATH: src/components/configurator/configurator-tab.tsx

PURPOSE: Provides a lightweight wrapper for the main Configurator component, allowing it to be imported as a named export for use in tabbed layouts.

SUMMARY: This component exists solely to import the **default export** `Configurator` and re-export it as a **named export** `ConfiguratorTab`. This simplifies the logic in `src/app/page.tsx`, allowing it to toggle between `<ConfiguratorTab />` and `<ChatTab />` in the mobile view.

RELATES TO OTHER FILES:
- It is imported and rendered by 'src/app/page.tsx' specifically for the mobile tabbed layout.
- It imports and renders the main `Configurator` component from './configurator.tsx'.

IMPORTS:
- Configurator from '@/components/configurator/configurator'

EXPORTS:
- ConfiguratorTab (React functional component)
*/

import Configurator from '@/components/configurator/configurator';

export function ConfiguratorTab() {
  return <Configurator />;
}
