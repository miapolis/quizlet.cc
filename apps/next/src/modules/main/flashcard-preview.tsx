import { useRouter } from "next/router";
import React from "react";

import { shuffleArray } from "@quenti/lib/array";
import { api } from "@quenti/trpc";

import {
  Box,
  Button,
  Flex,
  IconButton,
  Skeleton,
  Stack,
} from "@chakra-ui/react";

import {
  IconArrowsShuffle,
  IconPlayerPlay,
  IconSettings,
} from "@tabler/icons-react";

import { LoadingFlashcard } from "../../components/loading-flashcard";
import { RootFlashcardWrapper } from "../../components/root-flashcard-wrapper";
import { queryEventChannel } from "../../events/query";
import { useSet } from "../../hooks/use-set";
import { useContainerContext } from "../../stores/use-container-store";
import { useSetPropertiesStore } from "../../stores/use-set-properties-store";
import { FlashcardsSettingsModal } from "../flashcards/flashcards-settings-modal";
import { LinkArea } from "./link-area";

export const FlashcardPreview = () => {
  const router = useRouter();
  const data = useSet();
  const enableCardsSorting = useContainerContext((s) => s.enableCardsSorting);
  const [isDirty, setIsDirty] = useSetPropertiesStore((s) => [
    s.isDirty,
    s.setIsDirty,
  ]);
  const [transitionDirty, setTransitionDirty] = React.useState(false);

  const apiSetShuffle = api.container.setShuffle.useMutation({
    onSuccess: () => {
      if (enableCardsSorting) {
        setIsDirty(true);
      }
    },
  });

  const [shuffle, toggleShuffle] = useContainerContext((s) => [
    s.shuffleFlashcards,
    s.toggleShuffleFlashcards,
  ]);
  const [autoplay, toggleAutoplay] = useContainerContext((s) => [
    s.autoplayFlashcards,
    s.toggleAutoplayFlashcards,
  ]);

  const _termOrder = data.terms
    .sort((a, b) => a.rank - b.rank)
    .map((t) => t.id);
  const [termOrder, setTermOrder] = React.useState<string[]>(
    shuffle ? shuffleArray(Array.from(_termOrder)) : _termOrder,
  );

  React.useEffect(() => {
    setTermOrder(shuffle ? shuffleArray(Array.from(_termOrder)) : _termOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle, data.id]);

  React.useEffect(() => {
    const handleRouteChange = () => setTransitionDirty(true);
    const handleQueryRefetch = () => setTransitionDirty(false);

    router.events.on("routeChangeComplete", handleRouteChange);
    queryEventChannel.on("setQueryRefetched", handleQueryRefetch);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      queryEventChannel.off("setQueryRefetched", handleQueryRefetch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <>
      <FlashcardsSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <Flex
        gap={8}
        flexDir={{ base: "column", lg: "row" }}
        alignItems="stretch"
        w="full"
      >
        <LinkArea />
        <Flex flex="1">
          <Box w="full" zIndex={10}>
            <RootFlashcardWrapper
              terms={data.terms}
              termOrder={termOrder}
              isDirty={isDirty || transitionDirty}
            />
          </Box>
        </Flex>
        <Flex
          flexDir="column"
          justifyContent="space-between"
          w={{ base: "full", lg: "160px" }}
        >
          <Stack spacing={4} direction={{ base: "row", lg: "column" }}>
            <Stack
              direction={{ base: "row", lg: "column" }}
              w="full"
              spacing="3"
            >
              <Button
                w="full"
                leftIcon={<IconArrowsShuffle />}
                variant={shuffle ? "solid" : "outline"}
                onClick={() => {
                  void (async () => {
                    await apiSetShuffle.mutateAsync({
                      entityId: data.id,
                      shuffle: !shuffle,
                      type: "StudySet",
                    });
                  })();

                  toggleShuffle();
                }}
                isLoading={enableCardsSorting && apiSetShuffle.isLoading}
              >
                Shuffle
              </Button>
              <Button
                leftIcon={<IconPlayerPlay />}
                variant={autoplay ? "solid" : "outline"}
                w="full"
                onClick={toggleAutoplay}
                isDisabled={enableCardsSorting}
              >
                Autoplay
              </Button>
            </Stack>
            <Button
              leftIcon={<IconSettings />}
              variant="ghost"
              display={{ base: "none", lg: "flex" }}
              onClick={() => setSettingsOpen(true)}
            >
              Settings
            </Button>
          </Stack>
          <Flex justifyContent={{ base: "end", lg: "start" }} marginTop="4">
            <IconButton
              w="max"
              icon={<IconSettings />}
              rounded="full"
              variant="ghost"
              display={{ base: "flex", lg: "none" }}
              aria-label="Settings"
              colorScheme="gray"
              onClick={() => setSettingsOpen(true)}
            />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

FlashcardPreview.Skeleton = function FlashcardPreviewSkeleton() {
  return (
    <Flex
      gap={8}
      flexDir={{ base: "column", lg: "row" }}
      alignItems="stretch"
      w="full"
    >
      <LinkArea.Skeleton />
      <Flex maxW="1000px" flex="1">
        <Box w="full">
          <LoadingFlashcard h="500px" />
        </Box>
      </Flex>
      <Flex
        flexDir="column"
        justifyContent="space-between"
        w={{ base: "full", lg: "160px" }}
      >
        <Stack spacing={4} direction={{ base: "row", lg: "column" }}>
          <Stack direction={{ base: "row", lg: "column" }} w="full" spacing="3">
            <Skeleton w="full" rounded="lg">
              <Button w="full" leftIcon={<IconArrowsShuffle />}>
                Shuffle
              </Button>
            </Skeleton>
            <Skeleton w="full" rounded="lg">
              <Button w="full" leftIcon={<IconPlayerPlay />}>
                Autoplay
              </Button>
            </Skeleton>
          </Stack>
        </Stack>
        <Flex justifyContent={{ base: "end", lg: "start" }} marginTop="4">
          <Skeleton rounded="full">
            <IconButton
              w="max"
              icon={<IconSettings />}
              rounded="full"
              display={{ base: "flex", lg: "none" }}
              aria-label="Settings"
            />
          </Skeleton>
        </Flex>
      </Flex>
    </Flex>
  );
};
