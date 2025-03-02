import { Box, Button, Spinner, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { toaster } from "../ui/toaster";
import ReactMarkdown from 'react-markdown'

import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { AgentPublicBrief } from "@/types/agents";

const ChatContainer = styled(Box)`
  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  flex: 2;
  padding: 1rem;
  background-color: #0c1214b4;
  border-radius: 12px;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
`;

const MessageBubble = styled(Box) <{ isUser: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  margin: ${props => props.isUser ? "0.5rem 0 0.5rem auto" : "0.5rem auto 0.5rem 0"};
  background: ${props => props.isUser ? "#3d2863" : "#083c36"};
`;

const Textarea = styled.textarea`
  width: 100%;
  resize: vertical;
  border: 1px solid var(--accent-alpha-200);
  background-color: #15151578;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  outline: none;

  &:hover {
    border: 1px solid var(--accent-alpha-400);
  }

  &:focus {
    border: 1px solid var(--accent-alpha-600);
  }
`;

const ActionsRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`;

const UploadPanel = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 16px;
`;

const ImageContainer = styled.div`
  display: flex;
  position: relative;
  border: 1px solid var(--accent-alpha-200);
  border-radius: 8px;

  .img-preview-container {
    overflow: hidden;

    > img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 12px;
    }
  }

  &:hover {
    border: 1px solid var(--accent-alpha-300);
  }
`;

const ImageCloseBtn = styled.button`
  position: absolute;
  top: -12px;
  right: -12px;
  background: #ffffff;
  border-radius: 100%;
  padding: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    background: #a5a5a5;
  }
`;

const AttachmentImg = styled.img`
  width: 100%;
  max-width: max(400px, 100%);
  border-radius: 8px;
  margin-top: 8px;
`;

interface Message {
  content: ChatCompletionContentPart[];
  role: "user" | "assistant";
}

type Props = {
  agent: AgentPublicBrief;
}

export const Chat = ({ agent }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;

      console.log(`pastedItems`, items);

      setIsUploading(true);

      for (const item of Array.from(items || [])) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
              const response = await fetch('/api/files', {
                method: 'POST',
                body: formData
              });

              if (!response.ok) {
                toaster.create({
                  title: 'Failed to upload image',
                  description: 'Please try again',
                  duration: 5000,
                });
                return;
              }

              const { url } = await response.json();
              setSelectedImage(url);
            } catch (error) {
              console.error('Error uploading pasted image:', error);
              toaster.create({
                title: 'Failed to upload image',
                description: 'Please try again',
                duration: 5000,
              });
            }
          }
        }
      }

      setIsUploading(false);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        const response = await fetch('/api/files', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          toaster.create({
            title: 'Failed to upload image',
            description: 'Please try again',
            duration: 5000,
          });
          return;
        }

        const { url } = await response.json();
        setSelectedImage(url);

        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (messages.length > 8) {
      toaster.create({
        title: "You've reached the maximum number of messages",
        description: "Please start a new chat",
        duration: 5000,
      });
      return;
    }

    if (!input.trim() && !selectedImage || isSending || isUploading) return;

    const userMessage: Message = {
      content: [
        {
          type: "text",
          text: input
        },
        // @ts-ignore
        ...(selectedImage ? [{
          type: "image_url",
          image_url: {
            url: selectedImage!
          }
        }] : [])
      ],
      role: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      setIsSending(true);

      const response = await fetch(`/api/agents/${agent.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-message': localStorage.getItem('authMessage') || '',
          'x-auth-signature': localStorage.getItem('authSignature') || '',
        },
        body: JSON.stringify({
          message: userMessage,
          previousMessages: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from agent');
      }

      // Play a notification sound when the agent responds
      const audio = new Audio('/message.mp3');
      audio.play().catch(err => console.log('Error playing sound:', err));

      const agentMessage: Message = {
        content: data.response,
        role: "assistant"
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        content: [{
          type: "text",
          text: "Sorry, I encountered an error processing your message."
        }],
        role: "assistant"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
    setSelectedImage(null);
  };

  return (
    <ChatContainer>
      {messages.length > 0 && <MessageContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.role === "user"}>
            {Array.isArray(message.content) ? (
              message.content.map((part, partIndex) => {
                if (part.type === "text") {
                  return <Text key={partIndex} color="whiteAlpha.900">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </Text>
                } else if (part.type === "image_url") {
                  return <AttachmentImg key={partIndex} src={part.image_url.url} alt="Message attachment" />
                }
                return null;
              })
            ) : (
              <Text color="whiteAlpha.900">{message.content}</Text>
            )}
          </MessageBubble>
        ))}
      </MessageContainer>}

      <Textarea
        value={input}
        rows={4}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
              handleSendMessage();
            }
          }
        }}
        placeholder="Type your message or paste an image..."
      />

      <ActionsRow>
        <UploadPanel>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button as="span" variant="surface" size="sm" height="40px">
              Upload
              <img src="/image.svg" width="24px" height="24px" alt="Upload" />
            </Button>
          </label>
          {isUploading && <Spinner size="sm" />}
          {selectedImage && (
            <ImageContainer>
              <div className="img-preview-container">
                <img
                  src={selectedImage}
                />
              </div>
              <ImageCloseBtn onClick={() => setSelectedImage(null)}>
                <img src="/close.svg" alt="Close" />
              </ImageCloseBtn>
            </ImageContainer>
          )}
        </UploadPanel>

        <Button
          onClick={handleSendMessage}
          colorScheme="blue"
          float="right"
          disabled={!input.trim()}
        >
          Send
        </Button>
      </ActionsRow>

    </ChatContainer>
  );
};
