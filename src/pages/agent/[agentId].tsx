import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Heading, Spinner, Tabs, Text } from "@chakra-ui/react";
import { Header } from "@/components/Header";
import styled from "@emotion/styled";
import { Chat } from "@/components/Chat/Chat";
import { Prisma } from "@prisma/client";
import { Tag } from "@/components/ui/tag";
import { shortenAddress } from "@/components/utils";
import { useAccount } from "wagmi";
import { ProgressBar, ProgressRoot, ProgressLabel } from "@/components/ui/progress";
import Image from "next/image";
import { AgentPublicBrief } from "@/types/agents";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 80px 60px 60px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 40px 20px 20px;
  }
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: 40px;

  @media (max-width: 768px) {
    flex-flow: column nowrap;
  }
`;

const AgentCard = styled(Box)`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 8px;
  gap: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background: #0e0e0ede;
  border: 1px solid var(--accent-alpha-100);
  transition: all 0.2s ease;

  &:hover {
    border: 1px solid var(--accent-alpha-700);
  }

  @media (max-width: 768px) {
    flex-flow: column nowrap;
    min-width: 100%;
    max-width: 100%;
  }
`;

const Photo = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;

  transition: transform 0.4s ease;
`;

const ProfileCenter = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const TextOneLine = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
`;

const SocialsRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 16px;
  margin: 10px 0;

  img {
    transition: transform 0.2s ease;
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const TabsContainer = styled.div`
  width: 100%;
`;

export default function AgentPage() {
    const router = useRouter();
    const { agentId } = router.query;

    const { address } = useAccount();

    const { data: agent, isLoading, isSuccess, isFetched } = useQuery<AgentPublicBrief>({
        queryKey: ['agent', agentId],
        queryFn: () => fetch(`/api/agents/${agentId}`, {
            headers: {
                'x-auth-message': localStorage.getItem('authMessage') || '',
                'x-auth-signature': localStorage.getItem('authSignature') || '',
            }
        }).then(res => res.json()),
        enabled: !!agentId
    });

    console.log(`Agent:`, agent);

    if (isLoading || !isFetched) {
        return (
            <>
                <Head>
                    <title>Loading Agent...</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/stars.svg" />
                </Head>

                <Header />
                <Box className="page" display="flex" justifyContent="center" alignItems="center">
                    <Spinner size="xl" />
                </Box>
            </>
        );
    }

    // @ts-ignore
    if ((!agent && !isSuccess) || agent?.error) {
        return (
            <>
                <Head>
                    <title>Agent Not Found</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/stars.svg" />
                </Head>

                <Header />
                <Box className="page">
                    {/* @ts-ignore */}
                    <Heading>{agent?.error || "Agent not found"}</Heading>
                </Box>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{agent.name}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/stars.svg" />
            </Head>

            <Header />
            <Container>
                <Row>
                    <AgentCard key={agent.id}>
                        <ProfileCenter>
                            <Photo className="agent-photo" src={agent.imgUrl || '/person.png'} alt={agent.name} />
                            <Heading textAlign="center" fontSize="2xl" mt={2}>{agent.name}</Heading>
                        </ProfileCenter>
                        <Text>Description: {agent.description}</Text>
                        <Text>Created: {new Date(agent.createdAt).toLocaleDateString()} at {new Date(agent.createdAt).toLocaleTimeString()}</Text>
                        {agent.user && (
                            <TextOneLine>Owner: {agent.user.walletAddress === address ? 'You' : shortenAddress(agent.user.walletAddress)}</TextOneLine>
                        )}

                        {agent.ticker && <Text>Ticker: {agent.ticker}</Text>}

                        {/* <Tag size="md" w="fit-content" p={2}>{agent.mode}</Tag> */}

                        {(agent.twitterUrl || agent.siteUrl || agent.telegramUrl) && <SocialsRow>
                            {agent.twitterUrl && <a href={agent.twitterUrl} target="_blank"><Image src="/x.svg" alt="Twitter" width={20} height={20} /></a>}
                            {agent.telegramUrl && <a href={agent.telegramUrl} target="_blank"><Image src="/telegram.svg" alt="Telegram" width={20} height={20} /></a>}
                            {agent.siteUrl && <a href={agent.siteUrl} target="_blank"><Image src="/site.svg" alt="Site" width={25} height={25} style={{ marginTop: '-2px' }} /></a>}
                        </SocialsRow>}

                        <ButtonsRow>
                            {address?.toLowerCase() === agent.user?.walletAddress.toLowerCase() && (
                                <Button onClick={() => router.push(`/agent/${agent.id}/edit`)} variant="subtle" w="80px">Edit</Button>
                            )}
                        </ButtonsRow>
                    </AgentCard>

                    <Chat agent={agent} />
                </Row>
            </Container>
        </>
    );
}
