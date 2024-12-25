import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

import { api } from "@quenti/trpc";

import { useTelemetry } from "../../lib/telemetry";
import { DefaultLayout } from "./default-layout";
import { PresentWrapper, useNextStep } from "./present-wrapper";

export const OnboardingDone = () => {
  const { event } = useTelemetry();
  const { data: session, update } = useSession();
  const router = useRouter();
  const callbackUrl = router.query.callbackUrl as string;
  const next = useNextStep();

  const [startedLoading, setStartedLoading] = React.useState(false);

  const completeOnboarding = api.user.completeOnboarding.useMutation({
    onSuccess: async () => {
      void event("onboarding_completed", {});
      await update();
    },
    onError: async () => {
      await router.replace({
        pathname: `/onboarding/username`,
        query: {
          returnUrl: "/onboarding/done",
          callbackUrl,
        },
      });
    },
  });

  React.useEffect(() => {
    if (!session?.user?.completedOnboarding) return;
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.completedOnboarding]);

  return (
    <PresentWrapper>
      <DefaultLayout
        heading="Alles eingerichtet!"
        seoTitle="Alles eingerichtet!"
        description="Das ist erstmal alles - du kannst jetzt Quenti verwenden."
        action="Fertig"
        nextLoading={startedLoading}
        onNext={async () => {
          setStartedLoading(true);
          await completeOnboarding.mutateAsync();
        }}
      />
    </PresentWrapper>
  );
};
