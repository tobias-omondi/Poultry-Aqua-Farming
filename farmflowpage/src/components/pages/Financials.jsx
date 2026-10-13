import React, { useState } from "react";
import PageLayout from "./PageLayout";

// ChakFarm financials page. Navbar and footer come from PageLayout.
// All figures are sample data in KES: replace with your API/state.

const MONTHS = [
  { m: "May", income: 41000, expense: 29000 },
  { m: "Jun", income: 46500, expense: 31500 },
  { m: "Jul", income: 43000, expense: 36000 },
  { m: "Aug", income: 52000, expense: 33000 },
  { m: "Sep", income: 58500, expense: 37500 },
  { m: "Oct", income: 61000, expense: 38000 },
];

const CATEGORIES = [
  { name: "Feed", amount: 19500 },
  { name: "Vet and medicine", amount: 6200 },
  { name: "Labour", amount: 6000 },
  { name: "Housing and equipment", amount: 3800 },
  { name: "Other", amount: 2500 },
];

const TXNS = [
  { id: 1, date: "10 Oct", note: "Egg sales, Kisumu market", species: "Chickens", type: "in", amount: 18200 },
  { id: 2, date: "9 Oct", note: "Layers mash, 10 bags", species: "Chickens", type: "out", amount: 14500 },
  { id: 3, date: "8 Oct", note: "Milk delivery, weekly", species: "Cows", type: "in", amount: 15400 },
  { id: 4, date: "6 Oct", note: "Deworming drench", species: "Goats", type: "out", amount: 1800 },
  { id: 5, date: "5 Oct", note: "Sold 2 male goats", species: "Goats", type: "in", amount: 24000 },
  { id: 6, date: "3 Oct", note: "Dairy meal, 6 bags", species: "Cows", type: "out", amount: 9600 },
  { id: 7, date: "2 Oct", note: "Vet visit, tick control", species: "Cows", type: "out", amount: 2400 },
];

const FILTERS = ["All", "Chickens", "Goats", "Cows"];
const kes = (n) => "KES " + n.toLocaleString("en-KE");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Source+Sans+3:wght@400;600&display=swap');
.fn{--bg:#F4F7F1;--paper:#FFFFFF;--ink:#1D2B22;--mute:#5C6B61;--leaf:#2C6A4C;--leaf-soft:#E2EFE6;--yolk:#E5A21A;--rust:#B5503A;--line:#D6DFD3;
 position:relative;z-index:0;--nav-offset:72px;padding-top:var(--nav-offset);background:var(--bg);color:var(--ink);font-family:'Source Sans 3',system-ui,sans-serif;font-size:17px;line-height:1.55}
.fn *{box-sizing:border-box}
.fn h1,.fn h2,.fn h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;line-height:1.15;margin:0}
.fn-wrap{max-width:1100px;margin:0 auto;padding:32px 20px 72px}
.fn-top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
.fn-top h1{font-size:clamp(2rem,4vw,2.9rem);font-weight:700;letter-spacing:-.02em}
.fn-top p{margin:8px 0 0;color:var(--mute)}
.fn-btns{display:flex;gap:10px;flex-wrap:wrap}
.fn-btn{font:inherit;font-weight:600;padding:11px 18px;border-radius:10px;border:1.5px solid var(--leaf);background:var(--paper);color:var(--leaf);cursor:pointer}
.fn-btn.main{background:var(--leaf);color:#fff}
.fn-btn:hover{filter:brightness(.94)}
.fn-btn:focus-visible,.fn-chip:focus-visible{outline:3px solid var(--yolk);outline-offset:2px}
.fn-hero{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:16px;margin-top:28px}
.fn-card{background:var(--paper);border:1.5px solid var(--line);border-radius:16px;padding:22px}
.fn-profit{background:var(--leaf);border-color:var(--leaf);color:#fff}
.fn-profit span,.fn-profit small{color:#D3E8DB}
.fn-card span{display:block;color:var(--mute);font-size:.95rem}
.fn-card b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;margin-top:4px}
.fn-card small{color:var(--mute);font-size:.9rem}
.fn-neg{color:var(--rust)}
.fn-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-top:16px}
.fn-card h2{font-size:1.25rem;font-weight:700}
.fn-legend{display:flex;gap:16px;margin:8px 0 18px;color:var(--mute);font-size:.92rem}
.fn-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.fn-chart{display:flex;align-items:flex-end;gap:14px;height:210px;border-bottom:1.5px solid var(--line);padding-bottom:6px}
.fn-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end}
.fn-bars{display:flex;align-items:flex-end;gap:4px;width:100%;height:100%}
.fn-bars div{flex:1;border-radius:5px 5px 0 0;min-height:4px}
.fn-lbl{text-align:center;color:var(--mute);font-size:.9rem;margin-top:8px}
.fn-labels{display:flex;gap:14px}
.fn-labels div{flex:1}
.fn-cat{margin-top:16px}
.fn-cat p{display:flex;justify-content:space-between;margin:0 0 6px;font-weight:600}
.fn-cat p span{font-weight:400;color:var(--mute)}
.fn-track{height:10px;background:var(--leaf-soft);border-radius:999px;overflow:hidden}
.fn-track div{height:100%;background:var(--leaf);border-radius:999px}
.fn-list{margin-top:16px}
.fn-chips{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px}
.fn-chip{font:inherit;padding:7px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--paper);cursor:pointer}
.fn-chip[aria-pressed="true"]{background:var(--leaf-soft);border-color:var(--leaf);font-weight:600}
.fn-row{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;padding:14px 0;border-top:1.5px solid var(--line)}
.fn-row:first-child{border-top:0}
.fn-date{color:var(--mute);font-size:.93rem}
.fn-row b{display:block;font-weight:600}
.fn-row span{color:var(--mute);font-size:.92rem}
.fn-amt{font-weight:600;white-space:nowrap}
.fn-amt.in{color:var(--leaf)}
.fn-amt.out{color:var(--rust)}
.fn-empty{padding:24px 0;color:var(--mute)}
@media(max-width:860px){
 .fn-hero{grid-template-columns:1fr 1fr}
 .fn-profit{grid-column:1 / -1}
 .fn-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
 .fn-hero{grid-template-columns:1fr}
 .fn-row{grid-template-columns:1fr auto}
 .fn-date{grid-column:1 / -1}
}
`;

const Financials = () => {
  const [filter, setFilter] = useState("All");

  const now = MONTHS[MONTHS.length - 1];
  const profit = now.income - now.expense;
  const max = Math.max(...MONTHS.flatMap((x) => [x.income, x.expense]));
  const catMax = Math.max(...CATEGORIES.map((c) => c.amount));
  const rows = TXNS.filter((t) => filter === "All" || t.species === filter);

  return (
    <PageLayout>
      <div className="fn">
        <style>{CSS}</style>
        <main className="fn-wrap">
          <header className="fn-top">
            <div>
              <h1>Farm finances</h1>
              <p>See what came in, what went out, and what you kept this month.</p>
            </div>
            <div className="fn-btns">
              <button className="fn-btn main">Add income</button>
              <button className="fn-btn">Add expense</button>
            </div>
          </header>

          <section className="fn-hero" aria-label="This month">
            <div className="fn-card fn-profit">
              <span>Profit in October</span>
              <b>{kes(profit)}</b>
              <small>Income minus expenses</small>
            </div>
            <div className="fn-card">
              <span>Income</span>
              <b>{kes(now.income)}</b>
              <small>Eggs, milk and animal sales</small>
            </div>
            <div className="fn-card">
              <span>Expenses</span>
              <b className="fn-neg">{kes(now.expense)}</b>
              <small>Feed is the biggest cost</small>
            </div>
          </section>

          <div className="fn-grid">
            <section className="fn-card" aria-label="Last six months">
              <h2>Last six months</h2>
              <div className="fn-legend">
                <span><i style={{ background: "#2C6A4C" }} />Income</span>
                <span><i style={{ background: "#E5A21A" }} />Expenses</span>
              </div>
              <div className="fn-chart">
                {MONTHS.map((x) => (
                  <div className="fn-col" key={x.m} title={`${x.m}: income ${kes(x.income)}, expenses ${kes(x.expense)}`}>
                    <div className="fn-bars">
                      <div style={{ height: `${(x.income / max) * 100}%`, background: "#2C6A4C" }} />
                      <div style={{ height: `${(x.expense / max) * 100}%`, background: "#E5A21A" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="fn-labels">
                {MONTHS.map((x) => (
                  <div className="fn-lbl" key={x.m}>{x.m}</div>
                ))}
              </div>
            </section>

            <section className="fn-card" aria-label="Where the money went">
              <h2>Where the money went</h2>
              {CATEGORIES.map((c) => (
                <div className="fn-cat" key={c.name}>
                  <p>{c.name} <span>{kes(c.amount)}</span></p>
                  <div className="fn-track"><div style={{ width: `${(c.amount / catMax) * 100}%` }} /></div>
                </div>
              ))}
            </section>
          </div>

          <section className="fn-card fn-list" aria-label="Recent records">
            <h2>Recent records</h2>
            <div className="fn-chips">
              {FILTERS.map((f) => (
                <button key={f} className="fn-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            {rows.length === 0 ? (
              <p className="fn-empty">No records for {filter.toLowerCase()} yet. Use Add income or Add expense to start.</p>
            ) : (
              rows.map((t) => (
                <div className="fn-row" key={t.id}>
                  <span className="fn-date">{t.date}</span>
                  <div>
                    <b>{t.note}</b>
                    <span>{t.species}</span>
                  </div>
                  <span className={`fn-amt ${t.type}`}>
                    {t.type === "in" ? "+" : "-"} {kes(t.amount)}
                  </span>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </PageLayout>
  );
};

export default Financials;