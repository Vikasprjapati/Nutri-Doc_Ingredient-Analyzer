export default function ConfidenceMeter({ level }) {
  return (
    <div className="confidence">
      <span>Confidence:</span>
      <strong>{level}</strong>
    </div>
  );
}
