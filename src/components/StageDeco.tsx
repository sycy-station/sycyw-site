const X_SCALE = Array.from({ length: 12 }, (_, i) => `X:${String(i * 320).padStart(4, '0')}`);
const MARKS = Array.from({ length: 8 }, (_, i) => String((i + 1) * 100).padStart(4, '0'));

/** legacy 的 wide 网格装饰层：splash 与 stage deco 两处共用同一结构 */
export function Wide() {
  return (
    <div className="wide" aria-hidden="true">
      <div className="wide-guides" />
      <div className="wide-hlines" />
      <div className="wide-scale">
        {X_SCALE.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="wide-edge wide-edge-l">
        <span className="we-rail">
          <i />
        </span>
        <span className="we-marks">
          {MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </span>
        <span className="we-vtext">SYCYW&nbsp;·&nbsp;INTERFACE&nbsp;LAB&nbsp;·&nbsp;GRID&nbsp;0417</span>
      </div>

      <div className="wide-edge wide-edge-r">
        <span className="we-rail">
          <i />
        </span>
        <span className="we-marks">
          {[...MARKS].reverse().map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </span>
        <span className="we-vtext">CELL&nbsp;ARRAY&nbsp;·&nbsp;REV&nbsp;2.31&nbsp;·&nbsp;LOCK&nbsp;OK</span>
      </div>
    </div>
  );
}

export default function StageDeco() {
  return (
    <div className="deco" aria-hidden="true">
      <div className="splash-grid" />
      <div className="splash-frame">
        <span className="fr fr-tl" />
        <span className="fr fr-tr" />
        <span className="fr fr-bl" />
        <span className="fr fr-br" />
      </div>

      <Wide />
    </div>
  );
}
