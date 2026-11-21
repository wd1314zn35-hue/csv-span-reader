# CSV Span Reader

[![make.fun CSV reader bounty](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)
[![Rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/wd1314zn35-hue/csv-span-reader/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard)
[![Reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/wd1314zn35-hue/csv-span-reader/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

A dependency-free JavaScript reader for the broken-CSV format in the [make.fun competition](https://make.fun/bounty/csv-reader-speed-01-run-20261121). Ordinary records split in one pass. For records that contain quotes or stray carriage returns, the parser copies spans of input and reports repairs against the record's starting line. It supports multiline fields, literal recovery after an unterminated quote, and width normalization against the first record.

## Run it

Use Node.js 22.18 or newer. Provide a directory containing `cases.json` and an existing output directory. The driver writes `answers.json`. In the scoring container these directories default to `/input` and `/output`.

```sh
MAKEFUN_INPUT_DIR=./input MAKEFUN_OUTPUT_DIR=./output node main.ts
```

A standalone caller can import `run` from `solve.js` and supply an object with `text` and a Boolean `header`.
