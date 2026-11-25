import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Our own profitability history: one network snapshot per hour.
crons.hourly("market snapshot", { minuteUTC: 5 }, internal.market.takeSnapshot, {});

// Sellers must keep their link to oneminers.com; re-check every week.
crons.weekly("partner link re-check", { dayOfWeek: "monday", hourUTC: 2, minuteUTC: 0 }, internal.partnerLink.recheckAll, {});

export default crons;
