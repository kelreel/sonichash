import Image from "next/image";
import Link from "next/link";
import styled from "@emotion/styled";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/hooks/useAuth";

const Links = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    gap: 30px;
`;

const $ConnectButton = styled(ConnectButton)`
    background-color: red !important;
`;

const $Link = styled(Link)`
    @media (max-width: 768px) {
        display: none;
    }

    &:hover {
        color: var(--accent-alpha-700);
    }
`;

export const Header = () => {
    const { isAuthenticated } = useAuth();

    return <header className="header">

        <Link className="header-logo" href="/">
            <Image src="/sonic_white.svg" alt="logo" width={32} height={32} />
            <h1>SonicHash</h1>
        </Link>

        <Links>
            {isAuthenticated && <>
                <$Link href="/private">Agents</$Link>
                <$Link href="/create-agent">Create Agent</$Link>
            </>}

            <$ConnectButton showBalance={true} chainStatus="name" label="Connect Wallet" accountStatus="avatar" />
        </Links>
    </header>
}