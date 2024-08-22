import { useCallback } from 'react';

import { phoneId, env } from 'App/Config/AppConfig';
import { store } from 'App/Store';
import Logger from 'App/Services/Logger';

import { posthog } from 'App/Navigation/AppNavigation';

type IdentifyConfig = {
  reset?: boolean;
};

const useEvents = () => {
  const identify = useCallback((config?: IdentifyConfig) => {
    const commonProperties = { env, phoneId };

    try {
      const user = store?.getState()?.auth?.user;
      const email = user?.email || '';

      Logger.identify(email);

      if (!posthog) {
        return;
      }

      if (config?.reset) {
        posthog.reset();
        posthog.register(commonProperties);
      } else {
        posthog.register(commonProperties);

        if (email) {
          posthog.identify(email, user);
        }
      }
    } catch (err) {
      Logger.error(`PostHog[identify]: ${err}`);
    }
  }, []);

  const track = useCallback((event: string, properties?: { [key: string]: any }) => {
    try {
      posthog?.capture(event, properties);
    } catch (err) {
      Logger.error(`PostHog[track]: ${err}`);
    }
  }, []);

  return { identify, track };
};

export default useEvents;
