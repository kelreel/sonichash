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
        <link rel="icon" href="/sonic_white.svg" />
      </Head>

      <Header />
      <div className="page">
        <Heading size="4xl">Create Agent</Heading>

        <AgentForm action="create" />
      </div>
    </>
  )
}
