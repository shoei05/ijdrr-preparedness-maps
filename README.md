# 災害への備えの地図（IJDRR 2026 図1・補足表S5）

Koda M, Harada N, Minamitani K, Fujii K, Orui M, Kuriyama S, Hozawa A, Tabuchi T. Monitoring disaster preparedness behaviors in Japan: social, residential, and neighborhood-related gradients. *International Journal of Disaster Risk Reduction* 2026;143:106317. [doi:10.1016/j.ijdrr.2026.106317](https://doi.org/10.1016/j.ijdrr.2026.106317)（CC BY 4.0）

論文の図1（6つの備えの行動の都道府県別の重み付き割合）を、行動を選んで切り替えられる地図にしました。値は補足表S5（都道府県別の重み付き割合と95%信頼区間、回答者数）と同じです。

- 公開ページ: https://shoei05.github.io/ijdrr-preparedness-maps/
- 対象: JACSIS2023 の回答者28,481人

## Disaster preparedness maps (Figure 1 and Supplementary Table S5)

An interactive viewer for Figure 1 of the paper above: choose one of six respondent-reported preparedness behaviors to see prefecture-level weighted prevalence. Hover a prefecture for the estimate, 95% CI and number of respondents; the list shows all 47 prefectures with confidence intervals against the national estimate (Table 2).

## Files

- `data/values.json`: Supplementary Table S5 (unweighted n; weighted prevalence, lower and upper 95% CI per prefecture and behavior) and the national estimates in Table 2
- `data/pref.topojson`: prefectural boundaries, with Hokkaido and Okinawa repositioned
- `scripts/build_data.py`: builds both files from the supplementary DOCX (converted to plain text with pandoc) and the boundary file of [bmjph-mortality-maps](https://github.com/shoei05/bmjph-mortality-maps)

## Notes

- Values are respondent-reported and weighted; prefectures with few respondents have wide confidence intervals.
- Boundaries: 国土数値情報（行政区域データ、2021年1月1日時点、国土交通省）, simplified by [smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography) and further processed.
