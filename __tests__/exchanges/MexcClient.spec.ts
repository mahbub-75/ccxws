import { testClient } from "../TestRunner";
import { MexcClient } from "../../src";

testClient({
    clientFactory: () => new MexcClient(),
    clientName: "MexcClient",
    exchangeName: "Mexc",
    markets: [
        {
            id: "BTC_USDT",
            base: "BTC",
            quote: "USDT",
        },
    ],

    unsubWaitMs: 1500,

    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,

    testAllMarketsTrades: false,
    testAllMarketsTradesSuccess: 50,

    hasTickers: false,
    hasTrades: true,
    hasCandles: false,
    hasLevel2Snapshots: false,
    hasLevel2Updates: true,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,

    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: true,
        hasChange: true,
        hasChangePercent: true,
        hasBid: true,
        hasBidVolume: true,
        hasAsk: true,
        hasAskVolume: true,
    },

    trade: {
        hasTradeId: false,
    },

    l2update: {
        hasSnapshot: false,
        hasTimestampMs: false,
        hasSequenceId: false,
        hasLastSequenceId: false,
        hasEventMs: false,
        hasCount: false,
    },
});
