# Fonts

All three families are loaded from **Google Fonts** via `@import` in
`colors_and_type.css`. No `.ttf`/`.woff2` files are bundled here.

| Family            | Use                              | Google Fonts                                      |
| ----------------- | -------------------------------- | ------------------------------------------------- |
| Instrument Serif  | Display, hero, section openers   | https://fonts.google.com/specimen/Instrument+Serif |
| Instrument Sans   | Body, UI, labels, navigation     | https://fonts.google.com/specimen/Instrument+Sans  |
| IBM Plex Mono     | Data, commands, version strings  | https://fonts.google.com/specimen/IBM+Plex+Mono    |

To self-host, download the `.woff2` files from each family page and replace the
`@import` block at the top of `colors_and_type.css` with `@font-face` rules.
