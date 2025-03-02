import Head from "next/head";

import { Header } from "@/components/Header";
import { AgentForm } from "@/components/AgentForm";
import { Box, Heading, Text } from "@chakra-ui/react";
import { Alert } from '@/components/ui/alert'

export default function CreateAgentPage() {
  return (
    <>
      <Head>
        <title>SonicHash</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/stars.svg" />
      </Head>

      <Header />
      <div className="page">
        <Heading size="4xl">Create Agent</Heading>


        <Box maxW="600px" w="100%" borderRadius="lg" border="1px solid" borderColor="blackAlpha.600">
        <Alert status="info" title="Prompt Engineering" colorPalette="teal">
          The agent's behavior and communication style depend heavily on the prompt. We recommend learning about prompt engineering and experimenting with the agent's settings to achieve better results.
        </Alert>
        </Box>

        <AgentForm action="create" />
      </div>
    </>
  )
}
