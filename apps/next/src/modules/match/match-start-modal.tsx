import { useRouter } from "next/router";
import React from "react";

import { Modal } from "@quenti/components/modal";

import { Button, ButtonGroup, Stack, Text } from "@chakra-ui/react";

import { IconArrowBack, IconPlayerPlay } from "@tabler/icons-react";

import { useMatchContext } from "../../stores/use-match-store";

export interface MatchStartModalProps {
  isOpen: boolean;
}

export const MatchStartModal: React.FC<MatchStartModalProps> = ({ isOpen }) => {
  const newRound = useMatchContext((e) => e.nextRound);
  const router = useRouter();

  const removeIntro = () => {
    window.history.replaceState(null, "", router.asPath.split("?")[0]);
  };

  const actionRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => undefined}
      initialFocusRef={actionRef}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Body spacing="10">
          <Stack>
            <Modal.Heading>Kombinieren!</Modal.Heading>
            <Text>Ziehe die passenden Fragen & Antworten übereinander um zu gewinnen.</Text>
          </Stack>
          {/*TODO: There should be a gif here*/}
          <ButtonGroup spacing="4">
            <Button
              w="full"
              colorScheme="gray"
              leftIcon={<IconArrowBack size={18} />}
              variant="outline"
              onClick={router.back}
            >
              Zurück
            </Button>
            <Button
              w="full"
              leftIcon={<IconPlayerPlay size={18} />}
              variant="solid"
              onClick={() => {
                removeIntro();
                newRound();
              }}
              ref={actionRef}
            >
              Starten
            </Button>
          </ButtonGroup>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
