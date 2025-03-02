import Head from "next/head";

import Image from "next/image";
import { Header } from "@/components/Header";
import { Typewriter } from 'react-simple-typewriter'
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AgentList } from "@/components/AgentList";
import { Heading } from "@chakra-ui/react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Head>
        <title>SonicHash</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/stars.svg" />
      </Head>

      <Header />
      <div className="page page-home">

        <div className="main-card">
          <h1 className="title glitch">SonicHash</h1>

          <div className="desc">
            AI Agents platform for Sonic<br />
          </div>

          {isAuthenticated && <>

            <div className="row primary-row hide-on-desktop">
              <Link className="btn-href" href="/private">
                Your Agents
              </Link>
              <Link className="btn-href" href="/create-agent">
                Create Agent
              </Link>
            </div>
          </>}

        </div >

        <div className="main-agent-list">
          <h2 className="main-agent-list-title bg-move">Launched Agents</h2>
          <AgentList />
        </div>
      </div>
    </>
  )
}
