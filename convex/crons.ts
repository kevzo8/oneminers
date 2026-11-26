import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Coin network data from BackPoW, then a history snapshot from it.
crons.hourly("backpow coins", { minuteUTC: 5 }, internal.backpow.importCoins, {});
crons.hourly("market snapshot", { minuteUTC: 20 }, internal.market.takeSnapshot, {});

// The ASIC list (new models, specs, price ranges) changes slowly: once a day.
crons.daily("backpow miners", { hourUTC: 3, minuteUTC: 15 }, internal.backpow.importMiners, {});

// Sellers must keep their link to oneminers.com; re-check every week.
crons.weekly("partner link re-check", { dayOfWeek: "monday", hourUTC: 2, minuteUTC: 0 }, internal.partnerLink.recheckAll, {});

export default crons;
