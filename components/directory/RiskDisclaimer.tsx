export default function RiskDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-muted/70 ${className}`}>
      Profit figures are estimates based on current network data, assumed pool fees and your electricity price; actual results
      will vary. Third-party and seller links are outside our control. Cryptocurrency mining is high risk and you can lose money.
      We are not responsible for financial loss. Nothing on this site is investment advice.
    </p>
  );
}
