import { Tag } from "@/components/ui/tag";
import { Box, Button, IconButton, Spinner, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Prisma } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AgentCard = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 20px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  background: var(--background);
  cursor: pointer;
  border: 1px solid var(--accent-alpha-100);
  transition: all 0.2s ease;

  &:hover {
    background: var(--background-alpha-800);
  }
`;

const AgentCardRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 20px;
`;

const Photo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;

  transition: transform 0.4s ease;
`;

const Description = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AgentActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 12px;
`;

const SocialLink = styled.a`
  transition: all 0.1s;

  > img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: scale(1.1);
    filter: brightness(0.6);
  }
`;

type Props = {
    isPrivate?: boolean;
}

export const AgentList = ({ isPrivate = false }: Props) => {
    const router = useRouter();
    const { address } = useAccount();
    const queryClient = useQueryClient();

    const { data: {
        agents,
        portfolios
    } = {
            agents: [],
            portfolios: []
        }, isLoading } = useQuery<{ agents: Prisma.AgentGetPayload<{ include: { user: true } }>[]; portfolios: Record<string, any> }>({
            queryKey: ['agents'],
            queryFn: () => fetch(`api/agents/${isPrivate ? 'private' : ''}`, {
                headers: {
                    'x-auth-message': localStorage.getItem('authMessage') || '',
                    'x-auth-signature': localStorage.getItem('authSignature') || '',
                }
            }).then(res => res.json()).catch(err => {
                console.error(err)
                return {
                    agents: [],
                    portfolios: []
                }
            }),
        });

    const { mutate: deleteAgent, isPending: isDeleting } = useMutation({
        mutationFn: (agentId: string) => fetch(`api/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-message': localStorage.getItem('authMessage') || '',
                'x-auth-signature': localStorage.getItem('authSignature') || '',
            }
        }).then(res => res.json()).catch(err => {
            console.error(err)
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            return []
        }),
    });

    const handleDeleteAgent = (agentId: string, agentName: string) => {
        if (confirm(`Are you sure you want to delete ${agentName}?. This action is irreversible.`)) {
            deleteAgent(agentId)
        }
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" w="100%">
                <Spinner />
            </Box>
        )
    }

    return (
        <Grid>
            {agents.map((agent: Prisma.AgentGetPayload<{ include: { user: true } }>) => {
                // @ts-ignore
                const portfolio: any = agent.walletAddress ? portfolios[agent.walletAddress] : null;
                let pnl = 0;

                return (
                    <AgentCard key={agent.id} onClick={() => router.push(`/agent/${agent.id}`)}>
                        <AgentCardRow>
                            <Box minWidth="80px">
                                <Photo
                                    className="agent-photo"
                                    src={agent.imgUrl || '/user.png'}
                                    alt={agent.name}
                                />
                                {isPrivate && <Box mt={4} width="100%" display="flex" justifyContent="center">
                                    <Tag size="lg">
                                        {agent.mode}
                                    </Tag>
                                </Box>}
                            </Box>
                            <Box>
                                <Box as="h3" fontSize="xl" fontWeight="bold" mb={2}>
                                    {agent.name}
                                </Box>
                                <Box color="whiteAlpha.800" mb={3}>
                                    <Description fontSize="sm">{agent.description}</Description>
                                </Box>
                                <Box fontSize="sm" color="whiteAlpha.600">
                                    Created {new Date(agent.createdAt).toLocaleDateString()}
                                </Box>
                            </Box>
                        </AgentCardRow>
                        {portfolio &&
                            <Box display="flex" flexFlow="row nowrap" gap={2} style={{ fontFamily: "monospace", textTransform: "uppercase", fontSize: "12px" }}>
                                <span>PNL: </span>
                                <span style={{ color: pnl > 0 ? '#009d49' : '#d80000' }}>${pnl ? pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                            </Box>
                        }
                        {isPrivate && agent.user?.walletAddress?.toLowerCase() === address?.toLowerCase() && (
                            <AgentActions>
                                <Button size="lg" variant="subtle" disabled={isLoading || isDeleting} onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/agent/${agent.id}/edit`)
                                }}>
                                    <span style={{ fontWeight: "bold" }}>Edit</span>
                                </Button>
                                <IconButton size="lg" variant="subtle" disabled={isLoading || isDeleting} onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAgent(agent.id, agent.name)
                                }}>
                                    <img width="20px" height="20px" src="/trash.svg" alt="Delete" />
                                </IconButton>
                            </AgentActions>
                        )}
                        {!isPrivate && (agent.telegramUrl || agent.twitterUrl || agent.siteUrl) && <Box display="flex" gap={5} mt={2} mb={2}>
                            {agent.telegramUrl && (
                                <SocialLink href={agent.telegramUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <img src="/telegram.svg" alt="Telegram" />
                                </SocialLink>
                            )}
                            {agent.twitterUrl && (
                                <SocialLink href={agent.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <img src="/x.svg" alt="Twitter" />
                                </SocialLink>
                            )}
                            {agent.siteUrl && (
                                <SocialLink href={agent.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <img src="/site.svg" alt="Site" />
                                </SocialLink>
                            )}
                        </Box>}
                    </AgentCard>)
            })}
        </Grid>
    );
};