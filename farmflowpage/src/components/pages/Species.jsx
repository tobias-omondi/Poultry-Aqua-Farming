import { useState } from "react";
import PageLayout from "./PageLayout";

// ChakFarm species page. Navbar and footer come from PageLayout.
// All numbers below are sample data: replace with your API/state.

const SPECIES = [
  {
    id: "chicken",
    name: "Chickens",
    sub: "Improved kienyeji",
    glyph: "🐔",
    count: 120,
    stats: [
      { label: "Birds", value: "120" },
      { label: "Eggs today", value: "74" },
      { label: "Alerts", value: "1" },
    ],
    facts: ["Eggs hatch in 21 days", "Starts laying around 18–22 weeks"],
    schedule: [
      { when: "Day 1", what: "Marek's vaccine (usually done at the hatchery)" },
      { when: "Day 7–10", what: "Newcastle disease, first dose" },
      { when: "Day 14", what: "Gumboro, first dose" },
      { when: "Day 21", what: "Newcastle booster" },
      { when: "Day 28", what: "Gumboro booster" },
    ],
    problems: [
      { name: "Newcastle disease", sign: "Twisted necks, green droppings, sudden deaths" },
      { name: "Coccidiosis", sign: "Bloody droppings, huddled and dull chicks" },
      { name: "Fowl pox", sign: "Scabs on comb and wattles" },
    ],
    actions: ["Log eggs", "Record deaths", "Add a flock"],
  },
  {
    id: "goat",
    name: "Goats",
    sub: "Meat and dairy",
    glyph: "🐐",
    count: 18,
    stats: [
      { label: "Goats", value: "18" },
      { label: "Pregnant", value: "4" },
      { label: "Alerts", value: "0" },
    ],
    facts: ["Pregnancy lasts about 150 days", "Trim hooves every 6–8 weeks"],
    schedule: [
      { when: "Every 3 months", what: "Deworm, adjusted to FAMACHA or faecal egg count" },
      { when: "Every 6 months", what: "Vaccinate against enterotoxaemia and CCPP" },
      { when: "Monthly", what: "Weigh kids and check body condition" },
      { when: "Before kidding", what: "Move the doe to a clean, dry pen" },
    ],
    problems: [
      { name: "Worms", sign: "Pale eyelids, weight loss, bottle jaw" },
      { name: "Pneumonia", sign: "Coughing, nasal discharge, fever" },
      { name: "Foot rot", sign: "Limping, foul smell between the hooves" },
    ],
    actions: ["Record a birth", "Log weight", "Record treatment"],
  },
  {
    id: "cow",
    name: "Cows",
    sub: "Jersey dairy",
    glyph: "🐄",
    count: 3,
    stats: [
      { label: "Cows", value: "3" },
      { label: "Milk today", value: "46 L" },
      { label: "Alerts", value: "2" },
    ],
    facts: ["Pregnancy lasts about 283 days", "Heat repeats every 21 days"],
    schedule: [
      { when: "Weekly", what: "Tick control by spray or dip" },
      { when: "Every 6 months", what: "FMD vaccination" },
      { when: "Every 3 months", what: "Deworm" },
      { when: "60 days before calving", what: "Dry off and change feed" },
    ],
    problems: [
      { name: "Mastitis", sign: "Hot, swollen udder, clots in the milk" },
      { name: "East Coast fever", sign: "Swollen glands, fever, laboured breathing" },
      { name: "Milk fever", sign: "Weak, unable to stand soon after calving" },
    ],
    actions: ["Log milk", "Record heat or service", "Record treatment"],
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Source+Sans+3:wght@400;600&display=swap');
.sp{--paper:#FFFFFF;--ink:#1D2B22;--mute:#5C6B61;--leaf:#2C6A4C;--leaf-soft:#E2EFE6;--yolk:#E5A21A;--line:#D6DFD3;
 position:relative;z-index:0;--nav-offset:72px;padding-top:var(--nav-offset);background:var(--bg);color:var(--ink);font-family:'Source Sans 3',system-ui,sans-serif;font-size:17px;line-height:1.55}
.sp *{box-sizing:border-box}
.sp h1,.sp h2,.sp h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;line-height:1.15;margin:0}
.sp-wrap{max-width:1100px;margin:0 auto;padding:32px 20px 72px}
.sp-top h1{font-size:clamp(2rem,4vw,2.9rem);font-weight:700;letter-spacing:-.02em}
.sp-top p{margin:8px 0 0;color:var(--mute);max-width:56ch}
.sp-grid{display:grid;grid-template-columns:280px 1fr;gap:28px;margin-top:32px;align-items:start}
.sp-list{display:flex;flex-direction:column;gap:10px}
.sp-pick{all:unset;cursor:pointer;display:flex;align-items:center;gap:14px;padding:16px;border:1.5px solid var(--line);border-radius:14px;background:var(--paper)}
.sp-pick:hover{border-color:var(--leaf)}
.sp-pick:focus-visible{outline:3px solid var(--yolk);outline-offset:2px}
.sp-pick[aria-selected="true"]{border-color:var(--leaf);background:var(--leaf-soft);box-shadow:inset 5px 0 0 var(--leaf)}
.sp-glyph{font-size:2rem;line-height:1}
.sp-pick b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:1.15rem;font-weight:700}
.sp-pick span{color:var(--mute);font-size:.95rem}
.sp-add{margin-top:6px;padding:14px;border:1.5px dashed var(--line);border-radius:14px;color:var(--mute);background:transparent;font:inherit;cursor:pointer;text-align:center}
.sp-add:hover{border-color:var(--leaf);color:var(--leaf)}
.sp-panel{background:var(--paper);border:1.5px solid var(--line);border-radius:18px;padding:32px}
.sp-head{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.sp-head .sp-glyph{font-size:3.2rem}
.sp-head h2{font-size:2rem;font-weight:700}
.sp-head p{margin:2px 0 0;color:var(--mute)}
.sp-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:24px;border:1.5px solid var(--line);border-radius:12px;overflow:hidden}
.sp-stat{padding:16px 18px}
.sp-stat+.sp-stat{border-left:1.5px solid var(--line)}
.sp-stat b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:1.8rem;font-weight:700}
.sp-stat span{color:var(--mute);font-size:.95rem}
.sp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.sp-btn{font:inherit;font-weight:600;padding:11px 18px;border-radius:10px;border:1.5px solid var(--leaf);background:var(--paper);color:var(--leaf);cursor:pointer}
.sp-btn:first-child{background:var(--leaf);color:#fff}
.sp-btn:hover{filter:brightness(.94)}
.sp-btn:focus-visible{outline:3px solid var(--yolk);outline-offset:2px}
.sp-cols{display:grid;grid-template-columns:1.1fr 1fr;gap:36px;margin-top:36px}
.sp-cols h3{font-size:1.2rem;font-weight:700;margin-bottom:6px}
.sp-note{margin:0 0 14px;color:var(--mute);font-size:.92rem}
.sp-tl{list-style:none;margin:0;padding:0 0 0 22px;border-left:2.5px solid var(--leaf-soft)}
.sp-tl li{position:relative;padding:0 0 18px 12px}
.sp-tl li::before{content:"";position:absolute;left:-30px;top:6px;width:13px;height:13px;border-radius:50%;background:var(--paper);border:3px solid var(--leaf)}
.sp-tl b{display:block;font-weight:600}
.sp-tl span{color:var(--mute)}
.sp-prob{list-style:none;margin:0;padding:0}
.sp-prob li{padding:12px 0;border-top:1.5px solid var(--line)}
.sp-prob li:first-child{border-top:0;padding-top:0}
.sp-prob b{display:block;font-weight:600}
.sp-prob span{color:var(--mute);font-size:.97rem}
.sp-facts{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.sp-facts span{background:#FBF1D6;border-radius:999px;padding:6px 14px;font-size:.93rem}
@media(max-width:820px){
 .sp-grid{grid-template-columns:1fr}
 .sp-list{flex-direction:row;overflow-x:auto;padding-bottom:4px}
 .sp-pick{flex:0 0 auto;min-width:210px}
 .sp-add{display:none}
 .sp-cols{grid-template-columns:1fr}
 .sp-panel{padding:22px}
}
@media(max-width:480px){.sp-stat{padding:12px}.sp-stat b{font-size:1.4rem}}
`;

const Species = () => {
  const [activeId, setActiveId] = useState("chicken");
  const s = SPECIES.find((x) => x.id === activeId);

  return (
    <PageLayout>
    <div className="sp">
      <style>{CSS}</style>
      <main className="sp-wrap">
        <header className="sp-top">
          <h1>Your animals</h1>
          <p>Pick a species to see its records, what to do next, and what to watch for.</p>
        </header>

        <div className="sp-grid">
          <div className="sp-list" role="tablist" aria-label="Species">
            {SPECIES.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={x.id === activeId}
                className="sp-pick"
                onClick={() => setActiveId(x.id)}
              >
                <span className="sp-glyph" aria-hidden="true">{x.glyph}</span>
                <div>
                  <b>{x.name}</b>
                  <span>{x.sub} · {x.count}</span>
                </div>
              </button>
            ))}
            <button className="sp-add">Add another species</button>
          </div>

          <section className="sp-panel" role="tabpanel" aria-label={s.name}>
            <div className="sp-head">
              <span className="sp-glyph" aria-hidden="true">{s.glyph}</span>
              <div>
                <h2>{s.name}</h2>
                <p>{s.sub}</p>
              </div>
            </div>

            <div className="sp-stats">
              {s.stats.map((st) => (
                <div className="sp-stat" key={st.label}>
                  <b>{st.value}</b>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>

            <div className="sp-actions">
              {s.actions.map((a) => (
                <button className="sp-btn" key={a}>{a}</button>
              ))}
            </div>

            <div className="sp-facts">
              {s.facts.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>

            <div className="sp-cols">
              <div>
                <h3>Care schedule</h3>
                <p className="sp-note">A typical schedule. Confirm dates with your vet.</p>
                <ol className="sp-tl">
                  {s.schedule.map((step) => (
                    <li key={step.when}>
                      <b>{step.when}</b>
                      <span>{step.what}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3>Common problems</h3>
                <p className="sp-note">Call a vet if you see these signs.</p>
                <ul className="sp-prob">
                  {s.problems.map((p) => (
                    <li key={p.name}>
                      <b>{p.name}</b>
                      <span>{p.sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    </PageLayout>
  );
};

export default Species;