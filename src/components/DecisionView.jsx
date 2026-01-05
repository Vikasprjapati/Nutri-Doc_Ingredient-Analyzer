export default function DecisionView({ data }) {
  return (
    <div className="card">
      <h3>AI Insight</h3>
      <p>{data.insight}</p>

      <h4>If consumed occasionally</h4>
      <p>{data.occasional}</p>

      <h4>Scientific clarity</h4>
      <p>{data.uncertainty}</p>

      <strong>Confidence: {data.confidence}</strong>
    </div>
  );
}
