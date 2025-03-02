import Head from "next/head";

import { Header } from "@/components/Header";
import { AgentList } from "@/components/AgentList";
import { Heading } from "@chakra-ui/react";

export default function AllAgentsPage() {
  return (
    <>
      <Head>
        <title>Agents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/stars.svg" />
      </Head>

      <Header />
      <div className="page">
        <Heading size="4xl">All agents</Heading>
        <AgentList />
      </div>
    </>
  )
}
