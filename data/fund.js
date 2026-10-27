/* =====================================================================
   FUND DATA — THE ONLY FILE YOU NEED TO EDIT
   ---------------------------------------------------------------------
   1. Monthly returns: add/edit numbers in `returns` (percent, net).
      Use null for months with no data. The chart, yearly totals,
      cumulative return, and most metrics recalculate automatically.
   2. Documents & letters: drop PDFs into the /docs folder, then add a
      line below pointing to them (file: "docs/your-file.pdf").
      Set restricted: true to show "Request access" instead of a link.
   3. Set sampleData: false once the returns below are your real numbers.
   ===================================================================== */

window.FUND = {
  sampleData: false, // set true to show a "Sample data" tag on the chart

  firm: "Eckhardt Capital",
  fundName: "Metis Multi-Strategy Hedge Fund",
  chartSubtitle: "Growth of $100, Net",
  asOf: "September 30, 2026",

  // Top-of-page link (like Militia's "Recruiting..." line)
  headline: { text: "", url: "" }, // optional top link, e.g. { text: "Schedule a Call", url: "https://calendly.com/..." }

  contactEmail: "preston@eckhardtcapital.com",
  meetingUrl: "", // add a Calendly link to show a "Schedule a call" button
  dataRoomUrl: "https://docsend.com/view/s/ik45mpsqd45qzrem", // paste your DocSend link here; restricted documents will open it
  tearSheet: "", // e.g. "docs/metis-tear-sheet.pdf" — powers the PDF button bottom-right

  // Monthly NET returns in percent. [Jan, Feb, ... Dec]
  returns: {
    2023: [null, null, null, null, 5.06, 3.23, 1.66, -2.20, 5.21, 4.89, 7.56, 6.63],
    2024: [3.12, 2.98, 1.23, 3.82, 2.98, 1.09, 1.59, 1.98, 2.89, 4.89, 4.22, 3.01],
    2025: [3.29, 4.01, 4.12, 4.98, 1.98, 1.02, 0.56, 0.88, 2.59, 0.04, 2.21, 2.56],
    2026: [6.25, 1.29, 3.62, 1.89, 0.69, 0.55, 2.23, 2.29, 0.72, null, null, null]
  },

  // Metrics. Leave a value as null to auto-calculate from the returns above.
  // Correlations need benchmark data, so enter those manually.
  riskFreeRate: 0, // annual %, used for Sharpe & Sortino (0% matches the DDQ methodology)
  metrics: {
    annualizedReturn: null,
    sharpe: null,
    stdDev: null,
    maxDrawdown: null,
    sortino: null,
    btcCorrelation: 0.15,
    spxCorrelation: 0.05
  },

  strategy: {
    intro: "A multi-manager, multi-strategy hedge fund. Capital is allocated across independent portfolio-manager sleeves, selected for low or negative correlation to one another, alongside designated market-making mandates, so that returns depend on manager edge rather than market direction.",
    engines: [
      { name: "Discretionary Trading Sleeves", weight: "~70%", text: "Long and short trading across crypto, equity and commodity markets via perpetual futures, options and spot. Current sleeves: Discretionary Perpetual Futures (P. Eckhardt) and Systematic & Quantitative (S. Gomez). Primary venue: Hyperliquid." },
      { name: "Token Market Making", weight: "~30%", text: "Designated market-making engagements with vetted digital asset projects, structured as token loan-plus-call-option arrangements: spread capture, fee revenue, option value and preferential early allocations." }
    ]
  },

  terms: [
    ["Structure", "Delaware LLC"],
    ["Inception", "May 2023"],
    ["Fund AUM", "$23 million"],
    ["Minimum investment", "$100,000"],
    ["Management fee", "1.0% annually"],
    ["Performance fee", "20% (high-water mark)"],
    ["Lock-up", "6 months"],
    ["Redemptions", "Monthly, 30 days notice"],
    ["Administrator", "Self-administered"],
    ["Custodian", "Coinbase Institutional"],
    ["Auditor", "Cohen & Company"],
    ["Legal counsel", "Mallon Walkers Limited (Bermuda)"],
    ["Eligibility", "Accredited investors"]
  ],

  // Investor letters. period = "Q1"–"Q4" or a month like "Jul".
  letters: [
    { year: 2026, period: "Jul", title: "July 2026 Investor Update", file: "" }
  ],

  // Fund documents. category is the small label above each title.
  documents: [
    { category: "Overview", title: "Tear Sheet", date: "Sep 2026", file: "" },
    { category: "Overview", title: "Investor Presentation", date: "Oct 2026", file: "", restricted: true },
    { category: "Offering", title: "Private Placement Memorandum", date: "Oct 2026", file: "", restricted: true },
    { category: "Offering", title: "Subscription Agreement", date: "Oct 2026", file: "", restricted: true },
    { category: "Diligence", title: "Due Diligence Questionnaire", date: "Oct 2026", file: "", restricted: true }
  ],

  disclosures: [
    "Past performance is not indicative of future results. All returns are net of all fees, including a 1% management fee and a 20% performance fee subject to a high-water mark. The May 2023 return reflects a partial month from the May 8, 2023 inception. Correlation figures are as reported in the Fund’s Due Diligence Questionnaire. The performance series was generated under the Fund’s prior strategy configurations and predates the October 2026 adoption of the multi-manager sleeve structure. Returns for the most recent period are unaudited and may be estimates pending month-end reconciliation.",
    "This website is for informational purposes only and is not an offer to sell or a solicitation of an offer to buy any security. Any such offer is made solely through the Fund's Private Placement Memorandum and subscription documents, available to verified accredited investors.",
    "Digital asset and derivatives trading involves substantial risk, including the total loss of capital."
  ]
};
