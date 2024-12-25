import React from "react";

import { Button } from "@chakra-ui/react";

import { IconUserX } from "@tabler/icons-react";

import { DeleteAccountModal } from "./delete-account-modal";
import { SectionWrapper } from "./section-wrapper";

export const DangerZone = () => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  return (
    <>
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
      <SectionWrapper
        heading="Gefahrenzone"
        description="Aktionen in diesem Bereich sind unumkehrbar"
      >
        <Button
          colorScheme="red"
          variant="outline"
          leftIcon={<IconUserX size={18} />}
          onClick={() => setDeleteModalOpen(true)}
          w="max"
        >
          Konto löschen
        </Button>
      </SectionWrapper>
    </>
  );
};
