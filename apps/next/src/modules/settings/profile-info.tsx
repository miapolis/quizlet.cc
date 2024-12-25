import { useSession } from "next-auth/react";
import React from "react";

import { Link } from "@quenti/components";
import { env } from "@quenti/env/client";
import { api } from "@quenti/trpc";

import {
  Avatar,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Skeleton,
  Stack,
  Switch,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import { IconUpload, IconUser } from "@tabler/icons-react";

import { ChangeUsernameInput } from "../../components/change-username-input";
import { SectionWrapper } from "./section-wrapper";
import { UploadAvatarModal } from "./upload-avatar-modal";

export const ProfileInfo = () => {
  const { data: session, update } = useSession()!;
  const grayText = useColorModeValue("gray.600", "gray.400");
  const divider = useColorModeValue("gray.400", "gray.600");

  const [checked, setChecked] = React.useState(!!session!.user?.displayName);
  const [changeAvatarOpen, setChangeAvatarOpen] = React.useState(false);

  const [image, setImage] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!session?.user?.image) return;
    setImage(session.user.image);
  }, [session?.user?.image]);

  const setDisplayName = api.user.setDisplayName.useMutation();
  const removeAvatar = api.user.removeAvatar.useMutation({
    onSuccess: ({ image }) => {
      setImage(image);
      void update();
    },
  });

  return (
    <SectionWrapper
      heading="Profil"
      description="Dein Nutzername und öffentliche Informationen"
      additional={
        <Button
          variant="outline"
          leftIcon={<IconUser size={18} />}
          as={Link}
          href={`/@${session!.user!.username}`}
          w="max"
        >
          Dein Profil ansehen
        </Button>
      }
    >
      <UploadAvatarModal
        isOpen={changeAvatarOpen}
        onClose={() => setChangeAvatarOpen(false)}
      />
      <Stack spacing={8}>
        <HStack spacing="4">
          <Skeleton rounded="full" isLoaded={!!session!.user} minW="54px">
            <Avatar
              src={image || ""}
              bg="gray.200"
              _dark={{
                bg: "gray.700",
              }}
              icon={<></>}
              width={54}
              height={54}
              className="highlight-block"
              style={{
                borderRadius: "50%",
              }}
            />
          </Skeleton>
          <Stack spacing="10px">
            <Text fontSize="sm" color={grayText}>
              Wir empfehlen eine Bildgröße von 256x256 für deinen Avatar
            </Text>
            <ButtonGroup
              colorScheme="gray"
              variant="outline"
              size="sm"
              spacing="10px"
            >
              <Button
                onClick={() => setChangeAvatarOpen(true)}
                w="max"
                leftIcon={<IconUpload size={16} />}
              >
                Avatar ändern
              </Button>
              {image && !image?.startsWith(env.NEXT_PUBLIC_APP_URL) && (
                <Button
                  color="gray.600"
                  _dark={{
                    color: "gray.400",
                  }}
                  isLoading={removeAvatar.isLoading}
                  onClick={() => removeAvatar.mutate()}
                >
                  Entfernen
                </Button>
              )}
            </ButtonGroup>
          </Stack>
        </HStack>
        <Divider borderColor={divider} />
        {session?.user?.name && (
          <HStack spacing={4}>
            <Switch
              size="lg"
              isChecked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
                setDisplayName.mutate({ displayName: e.target.checked });
              }}
            />
            <Text color={grayText} fontSize="sm">
              Deinen Echtnamen im Profil anzeigen
            </Text>
          </HStack>
        )}
        <Stack spacing={2}>
          <Text color={grayText} fontSize="sm">
            Nutzernamen anpassen
          </Text>
          <ChangeUsernameInput
            buttonLabel="Ändern"
            onChange={async () => {
              await update();
            }}
          />
        </Stack>
      </Stack>
    </SectionWrapper>
  );
};
