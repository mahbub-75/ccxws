/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import moment from "moment";
import { BasicClient } from "../BasicClient";
import { Level2Point } from "../Level2Point";
import { Level2Update } from "../Level2Update";
import { NotImplementedFn } from "../NotImplementedFn";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";

export class MexcClient extends BasicClient {
    protected static _pingTimeout: any;
    protected _pingInterval: NodeJS.Timeout;

    constructor() {
        super("wss://wbs.mexc.com/raw/ws", "Mexc", undefined, 60 * 1000);

        this.hasTrades = true;
        this.hasLevel2Updates = true;
    }

    protected _sendSubTicker = NotImplementedFn;
    protected _sendUnsubTicker = NotImplementedFn;

    protected _sendSubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "sub.deal",
                symbol: remote_id,
            }),
        );
    }

    protected _sendUnsubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "unsub.deal",
                symbol: remote_id,
            }),
        );
    }

    protected _sendSubLevel2Updates(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "sub.depth",
                symbol: remote_id,
            }),
        );
    }

    protected _sendUnsubLevel2Updates(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "unsub.depth",
                symbol: remote_id,
            }),
        );
    }

    protected _sendSubCandles = NotImplementedFn;
    protected _sendUnsubCandles = NotImplementedFn;
    protected _sendSubLevel2Snapshots = NotImplementedFn;
    protected _sendUnsubLevel2Snapshots = NotImplementedFn;
    protected _sendSubLevel3Snapshots = NotImplementedFn;
    protected _sendUnsubLevel3Snapshots = NotImplementedFn;
    protected _sendSubLevel3Updates = NotImplementedFn;
    protected _sendUnsubLevel3Updates = NotImplementedFn;
    protected _sendUnsubscribe = NotImplementedFn;

    protected _onMessage(raw): void {
        try {
            const msg = JSON.parse(raw);

            if (msg.data?.length === 0) return;

            // trades
            if (msg.channel === "push.deal") {
                const market = this._tradeSubs.get(msg.symbol);
                if (!market) return;

                this._onDealUpdate(msg.data.deals, market);
                return;
            }

            // l2updates
            if (msg.channel === "push.depth") {
                const market = this._level2UpdateSubs.get(msg.symbol);
                if (!market) return;

                this._onLevel2Update(msg.data, market);
                return;
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    protected _createTicker(update, market): Ticker {
        const { dailyChange, high, amount, quantity, low, open, ts } = update;
        return new Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: moment(ts).utc().valueOf(),
            open: Number(open).toFixed(8),
            high,
            low,
            volume: quantity,
            quoteVolume: amount,
            changePercent: dailyChange,
        });
    }

    protected _createTrade(update, market): Trade {
        let { id, quantity, takerSide, price, createTime } = update;
        price = Number(price).toFixed(8);
        quantity = Number(quantity).toFixed(8);

        return new Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: id,
            unix: moment(createTime).utc().valueOf(),
            side: takerSide,
            price,
            amount: quantity,
        });
    }

    protected _onLevel2Update(data, market): void {
        const asks = data.asks?.map(ask => new Level2Point(ask.p, ask.q)) ?? [];
        const bids = data.bids?.map(bid => new Level2Point(bid.p, bid.q)) ?? [];
        const update = new Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            asks,
            bids,
        });

        this.emit("l2update", update, market);
    }

    protected _onDealUpdate(data, market) {
        data.forEach(deal => {
            const trade = new Trade({
                exchange: "Mexc",
                base: market.base,
                quote: market.quote,
                timestamp: deal.t,
                price: deal.p,
                side: deal.T === 1 ? "buy" : "sell",
                amount: deal.q,
                unix: moment(data.t).utc().valueOf(),
            });
            this.emit("trade", trade, market);
        });
    }
}
