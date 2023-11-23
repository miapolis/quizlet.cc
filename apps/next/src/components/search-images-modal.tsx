import React from "react";

import { Link } from "@quenti/components";
import { env } from "@quenti/env/client";
import { useDebounce } from "@quenti/lib/hooks/use-debounce";
import { type RouterOutputs, api } from "@quenti/trpc";

import {
  Box,
  Center,
  GridItem,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { IconCloudUpload } from "@tabler/icons-react";

import { editorEventChannel } from "../events/editor";
import { useDropzone } from "../hooks/use-dropzone";

interface SearchImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResultsContextProps {
  data: RouterOutputs["images"]["search"];
  onClick: (index: number) => void;
}

const ResultsContext = React.createContext<ResultsContextProps>({
  data: undefined,
  onClick: () => undefined,
});

export const SearchImagesModal: React.FC<SearchImagesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentContext, setCurrentContext] = React.useState<string>();
  const currentContextRef = React.useRef(currentContext);
  currentContextRef.current = currentContext;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef(file);
  fileRef.current = file;

  const [progress, setProgress] = React.useState<number | null>(null);

  const start = (file: File) => {
    setFile(file);
    editorEventChannel.emit("requestUploadUrl", currentContextRef.current);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5 * 1000000, // 5mb
    maxFiles: 1,
    disabled: !!file,
    onDropAccepted: (files) => {
      start(files[0]!);
    },
  });

  React.useEffect(() => {
    const setContext = (id?: string) => {
      setCurrentContext(id);
    };

    const upload = (jwt?: string) => {
      void (async () => {
        if (!jwt) return;

        await doUpload(jwt, fileRef.current!);
        editorEventChannel.emit("uploadComplete", currentContextRef.current);

        setFile(null);
        onClose();
      })();
    };

    editorEventChannel.on("openSearchImages", setContext);
    editorEventChannel.on("startUpload", upload);
    return () => {
      editorEventChannel.off("openSearchImages", setContext);
      editorEventChannel.off("startUpload", upload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isFetching } = api.images.search.useQuery(
    {
      query: debouncedQuery,
    },
    {
      enabled: !!debouncedQuery.length,
    },
  );

  React.useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (document.activeElement !== rootRef.current) return;

      const getFilesFromClipboardEvent = (event: ClipboardEvent) => {
        const dataTransferItems = event.clipboardData?.items;
        if (!dataTransferItems) return;

        const files = Array.from(dataTransferItems).reduce<File[]>(
          (acc, curr) => {
            const f = curr.getAsFile();
            return f ? [...acc, f] : acc;
          },
          [],
        );

        return files;
      };

      const pastedFiles = getFilesFromClipboardEvent(event);
      if (!pastedFiles) return;

      start(pastedFiles[0]!);
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const doUpload = async (jwt: string, blob: unknown) => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", `${env.NEXT_PUBLIC_CDN_WORKER_ENDPOINT}/terms`, true);
      xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = e.loaded / e.total;
          setProgress(progress);
        }
      });
      xhr.addEventListener("loadend", () => {
        resolve(xhr.readyState === 4 && xhr.status === 200);
      });

      xhr.send(blob as XMLHttpRequestBodyInit);
    });
  };

  const expanded = !!data || isFetching;

  const borderColor = useColorModeValue("gray.200", "gray.750");

  return (
    <ResultsContext.Provider
      value={{
        data,
        onClick: (index) => {
          const url = data?.response?.results[index]?.urls.small;
          if (!url) return;

          editorEventChannel.emit("imageSelected", {
            contextId: currentContext,
            optimisticUrl: url,
            query: debouncedQuery,
            index,
          });

          onClose();
        },
      }}
    >
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay
          backdropFilter="blur(12px)"
          backgroundColor={useColorModeValue(
            "rgba(247, 250, 252, 75%)",
            "rgba(23, 25, 35, 40%)",
          )}
        />
        <ModalContent bg="transparent" shadow="none">
          <ModalBody
            p="0"
            background={useColorModeValue(
              "rgba(247, 250, 252, 40%)",
              "rgba(23, 25, 35, 60%)",
            )}
            backdropFilter="blur(12px)"
            borderWidth="2px"
            rounded="xl"
            borderColor={borderColor}
            shadow="xl"
          >
            <Box py="4" px="5">
              <Input
                placeholder="Search for an image..."
                size="sm"
                variant="unstyled"
                fontSize="xl"
                px="0"
                _placeholder={{
                  color: "gray.500",
                }}
                color={useColorModeValue("gray.900", "whiteAlpha.900")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>
            <Box
              overflow="hidden"
              h={expanded ? 235 : 0}
              className="transition-[height] duration-500"
            >
              <SimpleGrid
                columns={5}
                gap="2"
                p="2"
                borderTopWidth="2px"
                borderTopColor={borderColor}
                opacity={expanded ? 1 : 0}
                className="transition-opacity duration-500"
              >
                <GridItem colSpan={2}>
                  <Thumbnail index={0} />
                </GridItem>
                <DoubleRow />
                <DoubleRow offset={2} />
                <DoubleRow offset={4} />
              </SimpleGrid>
            </Box>
          </ModalBody>
          <Text mt="3" fontSize="xs" ml="3" color="gray.500" opacity={0.75}>
            Images by{" "}
            <Link
              href="https://unsplash.com/?utm_source=quenti&utm_medium=referral"
              fontWeight={600}
              transition="color 0.15s ease-in-out"
              color="gray.600"
              _hover={{
                color: "gray.700",
              }}
              _dark={{
                color: "gray.400",
                _hover: {
                  color: "gray.300",
                },
              }}
            >
              Unsplash
            </Link>
          </Text>
          <Center
            mt="6"
            px="6"
            mx="6"
            py="10"
            position="relative"
            rounded="xl"
            borderWidth="2px"
            bg="rgba(247, 250, 252, 40%)"
            borderColor="gray.100"
            overflow="hidden"
            _dark={{
              bg: "rgba(23, 25, 35, 30%)",
              borderColor: "gray.750",
            }}
            {...getRootProps()}
            ref={rootRef}
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              bg="gray.100"
              _dark={{
                bg: "gray.750",
              }}
              h="full"
              w={progress ? `${progress * 100}%` : 0}
              opacity={0.5}
            />
            <input {...getInputProps()} />
            {file ? (
              <Center h="46px" zIndex={10}>
                <HStack spacing="3">
                  <Spinner size="xs" color="blue.300" />
                  <Text fontSize="sm" fontWeight={600}>
                    {file.name}
                  </Text>
                </HStack>
              </Center>
            ) : (
              <VStack spacing="1" zIndex={10}>
                <HStack color="gray.500" spacing="3">
                  <IconCloudUpload />
                  <Text fontWeight={600}>Upload your own image</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Drop files here
                </Text>
              </VStack>
            )}
          </Center>
        </ModalContent>
      </Modal>
    </ResultsContext.Provider>
  );
};

const DoubleRow: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  return (
    <GridItem>
      <SimpleGrid h="full" gap="2">
        <GridItem>
          <Thumbnail index={1 + offset} />
        </GridItem>
        <GridItem>
          <Thumbnail index={2 + offset} />
        </GridItem>
      </SimpleGrid>
    </GridItem>
  );
};

const Thumbnail: React.FC<{ index: number }> = ({ index }) => {
  const { data, onClick } = React.useContext(ResultsContext);

  const image = data?.response?.results[index];

  return (
    <Skeleton
      rounded="lg"
      h="full"
      w="full"
      isLoaded={!!data}
      overflow="hidden"
      aspectRatio="1 / 1"
    >
      {image && (
        <Box
          position="relative"
          role="group"
          cursor="pointer"
          bg={image.color || "transparent"}
          onClick={() => onClick(index)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.urls.small}
            alt={image.alt_description || "Image"}
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
            }}
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            width="full"
            height="full"
            bg="white"
            transition="opacity 0.2s ease-in-out"
            opacity={0}
            pointerEvents="none"
            _groupHover={{
              opacity: 0.1,
            }}
          />
        </Box>
      )}
    </Skeleton>
  );
};