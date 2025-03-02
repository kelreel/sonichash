import { Heading } from "@chakra-ui/react";

import styled from "@emotion/styled";

const Container = styled.div`
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
`;

export const Positions = ({state}: {state: any}) => {
    if (!state || !state.assetPositions) return <Heading>No positions found</Heading>

    return (

        <Container>
            <div style={{ backgroundColor: '#1a365d', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                    Wallet positions linked to the agent. The agent has read-only access but can analyze this data. Trading actions will be added later.
                    </div>
                </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Asset</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Size</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Entry Price</th>
                    {/* <th style={{ padding: '12px', textAlign: 'right' }}>Mark Price</th> */}
                    <th style={{ padding: '12px', textAlign: 'right' }}>PnL</th>
                </tr>
            </thead>
            <tbody>
                {state.assetPositions.map(({position, type}) => (
                    <tr key={position.coin} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '12px' }}>{position.coin}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                            {parseFloat(position.szi).toFixed(3)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                            ${parseFloat(position.entryPx).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: parseFloat(position.unrealizedPnl) >= 0 ? '#4caf50' : '#f44336' }}>
                            ${parseFloat(position.unrealizedPnl).toFixed(2)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </Container>
    );
}