# Recommendation engine

The ranker first filters out products with zero stock, then computes normalized content preference fit `C`, item-item cosine similarity `I`, catalog popularity `P`, and price fit `B`:

`score = 0.55 C + 0.25 I + 0.12 P + 0.08 B`

Content fit compares category, style, purchase labels, and product tags. Customer history combines seeded purchase IDs with persisted product-interest events. `I` is average cosine similarity against a small synthetic co-purchase matrix; it is a demo collaborative signal, not a model trained on a representative population. When there is no profile history, `I` is zero and its weight moves to content (`0.80 C + 0.12 P + 0.08 B`). Popularity uses rating × available quantity normalized to the catalog maximum. Price fit is based on an AOV threshold. Ranking cards expose the reason and actual active weights.

Default weights are constants in `app.js`; they can be changed there without a dependency. The matrix is deliberately tiny, so do not claim statistical significance. For a production ranker, build vectors from consented events, evaluate offline with temporal holdouts and ranking metrics (NDCG@K, Recall@K, coverage), and include exposure, margin, inventory, and privacy constraints.
