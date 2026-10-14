import { useState } from "react";
import { FhsaCalculator } from "./FhsaCalculator";
import { RrspCalculator } from "./RrspCalculator";
import { TfsaCalculator } from "./TfsaCalculator";

const TABS = [
  { id: "tfsa", label: "TFSA", Component: TfsaCalculator },
  { id: "rrsp", label: "RRSP", Component: RrspCalculator },
  { id: "fhsa", label: "FHSA", Component: FhsaCalculator },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [tab, setTab] = useState<TabId>("tfsa");
  const { Component } = TABS.find((t) => t.id === tab)!;

  return (
    <main className="page">
      <header>
        <h1>RoomCheck</h1>
        <p className="lede">Work out how much you can still put into your TFSA, RRSP and FHSA this year.</p>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Component />

      <footer>
        Estimates only. Your CRA My Account and Notice of Assessment are the official record of your room.
      </footer>
    </main>
  );
}
