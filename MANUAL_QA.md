# Manual browser QA checklist

Automated coverage includes API handler, algorithm, storage, rendering, and demo-flow tests. **A human browser session has not been performed in this environment.** Before presenting, open the application in a current desktop browser and check the following:

- [ ] Start with `npm start`; open `http://127.0.0.1:4173`; confirm dashboard renders without visible error or blank content.
- [ ] Click every sidebar item and confirm its expected page renders; use browser Back/Forward if supported by the demo navigation expectations.
- [ ] Switch Amelia ↔ Jordan in Customer 360, Experience studio, and Live storefront. Confirm selected name, score signals, ranked products, and copy correspond to the active profile.
- [ ] Generate an experience; review the action rationale, score factors, uncertainty, benefit proxy, and stated trade-off. Try the “Run 5 simulated rounds” control as well.
- [ ] Submit positive and no-response outcomes. Confirm the selected arm changes, refresh the page, then restart the server and confirm the state remains.
- [ ] Open Live storefront and refresh the experience. Confirm recommendations and text update. Toggle consent off and verify personalized ranking is paused; toggle it back on.
- [ ] Ask “workwear under $100” and “denim under $70”. Confirm returned products are in stock, under budget, and match the catalog. Try “Ask about this item” from a storefront card. Ask “What is your shipping policy?” and confirm the no-match response.
- [ ] Analyze positive, frustrated, neutral, and empty sentiment inputs. Confirm empty input validation and that the displayed action is appropriate to the lexical baseline.
- [ ] Generate email, SMS, and social marketing drafts with a product and goal. Confirm provider label, canonical product facts, approval notice, and validation for missing inputs. Export the synthetic customer CSV and confirm it opens correctly.
- [ ] Open Insights after generating experiences, asking a catalog question, analyzing sentiment, and generating content. Confirm event counts update and message bodies are absent.
- [ ] Resize to a narrow mobile viewport. Check navigation, customer selectors, recommendation cards, assistant input, tables, and forms for clipping or unusable controls.
- [ ] If testing OpenAI, use a temporary server-side key only; confirm provider status and fallback behavior after removing/invalidating it. Never paste secrets into the browser or commit them.

Record browser, viewport, date, and any failure before claiming browser QA complete.
