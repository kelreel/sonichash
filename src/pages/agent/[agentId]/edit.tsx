import Head from "next/head";

import { Header } from "@/components/Header";
import { AgentForm } from "@/components/AgentForm";
import { Box, Heading, Text } from "@chakra-ui/react";
import { Alert } from '@/components/ui/alert'
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { AgentFull } from "@/types/agents";

export default function AgentEditPage() {
  const router = useRouter();
  const { agentId } = router.query;

  const { data: agent, isLoading, isFetched } = useQuery<AgentFull>({
    queryKey: ['agent-full', agentId],
    queryFn: () => fetch(`/api/agents/${agentId}/full`, {
      headers: {
        'x-auth-message': localStorage.getItem('authMessage') || '',
        'x-auth-signature': localStorage.getItem('authSignature') || '',
      }
    }).then(res => res.json()),
    enabled: !!agentId
  });

  return (
    <>
      <Head>
        <title>SonicHash</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/stars.svg" />
      </Head>

      <Header />
      <div className="page">
        <Heading size="2xl">Edit {agent?.name}</Heading>

        <Box maxW="600px" w="100%" borderRadius="lg" border="1px solid" borderColor="blackAlpha.600">
          <Alert status="info" title="Prompt Engineering" colorPalette="teal">
            The agent's behavior and communication style depend heavily on the prompt. We recommend learning about prompt engineering and experimenting with the agent's settings to achieve better results.
          </Alert>
        </Box>

        {/* @ts-ignore */}
        <AgentForm action="edit" value={agent} agentId={agentId as string} />
      </div>
    </>
  )
}
