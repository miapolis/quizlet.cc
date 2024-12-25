import { Link } from "@quenti/components";

import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react";

import { IconHelpHexagon } from "@tabler/icons-react";

export const Profile404 = () => {
  return (
    <Center h="calc(100vh - 120px)">
      <VStack spacing={12} textAlign="center" px="8">
        <VStack spacing={4}>
          <IconHelpHexagon />
          <Heading>Wir konnten dieses Profil nicht finden</Heading>
        </VStack>
        <VStack spacing={4}>
          <Text>
            Der Nutzername könnte verändert, oder gelöscht worden sein
          </Text>
          <Button as={Link} href="/home" variant="ghost">
            Übersicht
          </Button>
        </VStack>
      </VStack>
    </Center>
  );
};
