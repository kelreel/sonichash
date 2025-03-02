
import {
    Box,
    Button,
    Fieldset,
    Input,
    NativeSelectField,
    Textarea,
    VStack
} from '@chakra-ui/react';
import { AgentMode } from '@prisma/client';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { Field } from '@/components/ui/field';
import { CheckboxCard } from '@/components/ui/checkbox-card';
import { NativeSelectRoot } from './ui/native-select';
import { toaster } from './ui/toaster';
import router from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { TelegramClientSettings, TwitterClientSettings } from '@/types/agents';

const Avatar = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
`

interface Data {
    name: string;
    description: string;
    systemPrompt: string;
    ticker: string;
    mode: AgentMode;
    imgUrl: string;
    bio: string;
    lore: string;
    knowledge: string;
    walletAddress: string;
    messageExamples: string[];
    postExamples: string[];
    generalStyle: string;
    chatStyle: string;
    postStyle: string;
    adjectives: string;
    topics: string;
    twitterUrl: string;
    telegramUrl: string;
    siteUrl: string;
    providePriceData: boolean;
    providePortfolioData: boolean;
    tgBotSettings: TelegramClientSettings;
    twitterClientSettings: TwitterClientSettings;
}

type Props = {
    value?: Data | null;
    agentId?: string;
    action: 'edit' | 'create';
}

export const AgentForm = ({ value = null, agentId, action }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Data>(value || {
        name: '',
        description: '',
        ticker: '',
        mode: AgentMode.PUBLIC,
        systemPrompt: '',
        imgUrl: '',
        bio: '',
        lore: '',
        knowledge: '',
        walletAddress: '',
        messageExamples: [],
        postExamples: [],
        twitterUrl: '',
        telegramUrl: '',
        siteUrl: '',
        providePriceData: true,
        providePortfolioData: false,
        adjectives: '',
        topics: '',
        generalStyle: '',
        chatStyle: '',
        postStyle: '',
        tgBotSettings: {
            enabled: false,
            token: '',
        },
        twitterClientSettings: {
            enabled: false,
            username: '',
            password: '',
            email: '',
            secret2fa: '',
            targetUsers: [],
        },
    });

    useEffect(() => {
        setFormData(value || {
            name: '',
            description: '',
            ticker: '',
            mode: AgentMode.PUBLIC,
            imgUrl: '',
            bio: '',
            lore: '',
            knowledge: '',
            walletAddress: '',
            messageExamples: [],
            postExamples: [],
            twitterUrl: '',
            telegramUrl: '',
            siteUrl: '',
            systemPrompt: '',
            providePriceData: true,
            providePortfolioData: false,
            adjectives: '',
            topics: '',
            generalStyle: '',
            chatStyle: '',
            postStyle: '',
            tgBotSettings: {
                enabled: false,
                token: '',
            },
            twitterClientSettings: {
                enabled: false,
                username: '',
                password: '',
                email: '',
                secret2fa: '',
                targetUsers: [],
            },
        });
    }, [value]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (action === 'create') {
                const response = await fetch('/api/agents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-message': localStorage.getItem('authMessage') || '',
                        'x-auth-signature': localStorage.getItem('authSignature') || '',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create agent');
                }

                const data = await response.json();

                toaster.success({
                    title: 'Agent created successfully',
                    description: 'Your agent has been created and is ready to use. Redirecting to the agent page...',
                });

                setTimeout(() => {
                    router.push(`/agent/${data.id}`);
                }, 3000);
            } else {
                const response = await fetch(`/api/agents/${agentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-message': localStorage.getItem('authMessage') || '',
                        'x-auth-signature': localStorage.getItem('authSignature') || '',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update agent');
                }

                queryClient.invalidateQueries({ queryKey: ['agent', agentId] });

                toaster.success({
                    title: 'Agent updated successfully',
                    description: 'Your agent has been updated and is ready to use.',
                });
            }
        } catch (error) {
            console.error(error);
            toaster.error({
                title: `Error ${action === 'create' ? 'creating' : 'updating'} agent`,
                description: error instanceof Error ? error.message : 'An unknown error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box as="form" onSubmit={handleSubmit} width="100%" maxW="600px" mx="auto" p={6} bg="blackAlpha.800" borderRadius="lg" boxShadow="md">
            <VStack>
                {formData.imgUrl && <Avatar src={formData.imgUrl} alt="Agent image" />}

                <Fieldset.Root>
                    <Fieldset.Content>
                        <Field label="Name" required>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Agent name"
                                maxLength={20}
                            />
                        </Field>

                        <Field label="Description" required>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your agent"
                                maxLength={120}
                            />
                        </Field>

                        <Field label="Visibility" helperText="Private agents are only visible to you, while public agents are visible to everyone" required>
                            <NativeSelectRoot>
                                <NativeSelectField value={formData.mode} onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        mode: e.target.value as AgentMode
                                    }));
                                }}>
                                    <option value={AgentMode.PRIVATE}>Private</option>
                                    <option value={AgentMode.PUBLIC}>Public</option>
                                </NativeSelectField>
                            </NativeSelectRoot>
                        </Field>


                        <Field label="Image URL" helperText="It's recommended to use a square image and IPFS storage">
                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                <Input
                                    name="imgUrl"
                                    value={formData.imgUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.png"
                                    maxLength={200}
                                />
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append('file', file);
                                        setIsUploading(true);

                                        try {
                                            const response = await fetch('/api/files', {
                                                method: 'POST',
                                                body: formData
                                            });

                                            if (!response.ok) {
                                                const errorData = await response.json();
                                                console.log(errorData);
                                            }

                                            const { url } = await response.json();
                                            setFormData(prev => ({
                                                ...prev,
                                                imgUrl: url
                                            }));
                                            toaster.success({
                                                title: 'Image uploaded successfully',
                                                description: 'Your image has been uploaded and is ready to use.',
                                            });
                                        } catch (error) {
                                            console.error('Error uploading file:', error);
                                            toaster.error({
                                                title: 'Failed to upload image',
                                                description: 'An error occurred while uploading your image. Please try again.',
                                            });
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    }}
                                />
                                <Button variant="outline" onClick={() => document.getElementById('fileInput')?.click()} disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </Box>
                        </Field>

                        <Field label="System prompt" required>
                            <Textarea
                                name="systemPrompt"
                                value={formData.systemPrompt}
                                onChange={handleInputChange}
                                placeholder="Agent system prompt"
                                maxLength={1600}
                                rows={6}
                            />
                        </Field>

                        <Field label="Bio">
                            <Textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Agent bio, one per line (Shift + Enter)"
                                maxLength={1600}
                                rows={6}
                            />
                        </Field>

                        <Field label="Lore">
                            <Textarea
                                name="lore"
                                value={formData.lore}
                                onChange={handleInputChange}
                                placeholder="Agent lore/background story, (Shift + Enter)"
                                maxLength={1600}
                                rows={6}
                            />
                        </Field>

                        <Field label="Adjectives" helperText="Describe your agent's personality traits">
                            <Input
                                name="adjectives"
                                value={formData.adjectives}
                                onChange={handleInputChange}
                                placeholder="Witty, sarcastic, intelligent"
                                maxLength={200}
                            />
                        </Field>

                        <Field label="Topics" helperText="What topics is your agent knowledgeable about?">
                            <Input
                                name="topics"
                                value={formData.topics}
                                onChange={handleInputChange}
                                placeholder="DeFi, NFTs, Trading"
                                maxLength={200}
                            />
                        </Field>


                        <Field label="Chat Style" helperText="Describe how your agent should communicate in chats">
                            <Input
                                name="chatStyle"
                                value={formData.chatStyle}
                                onChange={handleInputChange}
                                placeholder="Friendly and casual, uses emojis frequently"
                                maxLength={200}
                            />
                        </Field>

                        <Field label="Knowledge Base">
                            <Textarea
                                name="knowledge"
                                value={formData.knowledge}
                                onChange={handleInputChange}
                                placeholder="Agent's knowledge base"
                                maxLength={1600}
                                rows={6}
                            />
                        </Field>

                        <Field label="Twitter URL">
                            <Input
                                name="twitterUrl"
                                value={formData.twitterUrl}
                                onChange={handleInputChange}
                                placeholder="https://twitter.com/..."
                                maxLength={50}
                            />
                        </Field>

                        <Field label="Telegram URL">
                            <Input
                                name="telegramUrl"
                                value={formData.telegramUrl}
                                onChange={handleInputChange}
                                placeholder="https://t.me/..."
                                maxLength={50}
                            />
                        </Field>

                        <Field label="Site URL">
                            <Input
                                name="siteUrl"
                                value={formData.siteUrl}
                                onChange={handleInputChange}
                                placeholder="https://..."
                                maxLength={50}
                            />
                        </Field>

                        <Field mt={4} label="Clients (soon)">
                        </Field>

                        <CheckboxCard
                            label="Telegram bot"
                            description="Create Telegram bot and paste API token"
                            checked={formData.tgBotSettings?.enabled}
                            onCheckedChange={({ checked }) => {
                                setFormData(prev => ({
                                    ...prev,
                                    tgBotSettings: {
                                        ...prev.tgBotSettings,
                                        enabled: !!checked
                                    }
                                }));
                            }}
                        />

                        {formData.tgBotSettings?.enabled && (
                            <Field label="Telegram Bot Token">
                                <Input
                                    name="tgBotSettings.token"
                                    value={formData.tgBotSettings?.token}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            tgBotSettings: {
                                                ...prev.tgBotSettings,
                                                token: e.target.value
                                            }
                                        }));
                                    }}
                                    placeholder="Paste your bot token here..."
                                    maxLength={100}
                                />
                            </Field>
                        )}

                        <Button
                            type="submit"
                            colorScheme="blue"
                            disabled={isLoading}
                            width="100%"
                        >
                            {action === 'create' ? 'Create Agent' : 'Save Agent'}
                        </Button>

                    </Fieldset.Content>
                </Fieldset.Root>
            </VStack>
        </Box>
    );
};
