export type ChatMessage = { role: "user" | "assistant"; content: string };

export const SYSTEM_PROMPT = `You are the OneMiners site assistant for a demo crypto-mining marketplace.
You help visitors understand mining site listings, hosting, power costs, and the profitability calculator.
Rules:
- Be concise: 2-4 short sentences.
- Use only the demo figures shown on the site. Never invent real listings or guarantees.
- Never promise returns or investment advice. Say figures are indicative.
- For pricing, diligence, or site tours, direct the visitor to the contact form.
- If asked something unrelated, steer back to mining sites, hosting, or the calculator.`;

const lower = (value: string) => value.toLowerCase();

export function answerFromKnowledge(messages: ChatMessage[]) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = lower(last?.content ?? "");

  if (!q.trim()) {
    return "Ask me about mining sites, hosting, power costs, or the profitability calculator.";
  }

  if (/(^|\b)(hi|hello|hey|good (morning|afternoon|evening))(\b|$)/.test(q)) {
    return "Hi. I can walk you through the demo site inventory, hosting terms, power costs, and miner economics. What are you evaluating?";
  }

  if (/(site|listing|marketplace|inventory|sell|sale|lease)/.test(q)) {
    return "The demo inventory spans 38 sites across 14 countries, including 40 MW of hydro in Paraguay at 2.1¢/kWh, a 25 MW flare-gas lease in Texas, and an 8 MW geothermal annex in Cebu. Open the Marketplace section or send the contact form to request a full package.";
  }

  if (/(host|hosting|colocation|container|immersion)/.test(q)) {
    return "Hosting listings include power, rack or container space, cooling, and on-site operations. The demo ranges from 2.6¢ to 4.8¢/kWh depending on country and generation type. Terms are indicative until diligence.";
  }

  if (/(power|electric|kwh|energy|hydro|solar|gas|geothermal|ppa)/.test(q)) {
    return "Power is the main cost driver. The demo inventory starts at 2.1¢/kWh for contracted hydro, with flare gas around 2.6-2.8¢ and geothermal around 4.8¢. Always confirm PPA terms, interconnect capacity, and curtailment before signing.";
  }

  if (/(profit|roi|calculator|revenue|earn|margin|payback)/.test(q)) {
    return "Use the calculator: net daily profit = hashrate × revenue per TH/day − (watts ÷ 1,000) × 24 × electricity price. With 1,160 TH/s, 11,020 W, 4.5¢/kWh, and $0.0215 per TH/day, the demo shows about $13/day net. Figures are indicative.";
  }

  if (/(cebu|philippines|manila|location|where|based)/.test(q)) {
    return "OneMiners is building its AI-first agency in Cebu, Philippines. The demo inventory includes an 8 MW geothermal lease in Cebu with a local operations team. The contact form is the fastest route to a site tour.";
  }

  if (/(ai|automation|agency|marketing|about|oneminers)/.test(q)) {
    return "OneMiners combines mining-site infrastructure with AI-first marketing and operations. This demo shows the marketplace side: live-style inventory, miner economics, and an assistant that answers from the site's own data.";
  }

  if (/(contact|email|call|talk|meeting|tour|diligence)/.test(q)) {
    return "Use the contact form in the Contact section with your target capacity and power budget. The team can share full packages, utility terms, and tour scheduling. This is a demo site, so listings are illustrative.";
  }

  if (/(price|cost|how much|fee|commission)/.test(q)) {
    return "Demo power rates run from 2.1¢ to 4.8¢/kWh, and capacity from 8 MW to 40 MW. Commercial terms, fees, and commission are shared after a short scoping call. Nothing here is investment advice.";
  }

  return "I can help with site listings, hosting, power costs, and miner profitability. Try one of the suggested prompts, or send the contact form with your target capacity and budget.";
}
