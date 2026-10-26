# Third-party dependency notices

The application source is GPL-3.0-only. Rust dependencies keep their own licenses.
This inventory is generated from the locked dependency graph filtered for
`x86_64-pc-windows-msvc`. It includes build-time dependencies; inclusion does
not mean every listed crate is linked into the executable. SPDX expressions
are retained from the crates' published metadata, without changing their terms.

The adjacent `docs/third-party/` directory preserves license, copyright and
notice files shipped in those crates. Crate links lead to the corresponding
published source. Exact versions and checksums are recorded in
`src-tauri/Cargo.lock`; Cargo downloads those sources during a source build.
Windows, WebView2 and optional PowerPoint are external prerequisites and are
not redistributed in the portable package. Playwright is an optional development
test dependency and is not included in the application.

| Dependency | Declared license | Included notices |
|---|---|---|
| [adler2 2.0.1](https://crates.io/crates/adler2/2.0.1) | 0BSD OR MIT OR Apache-2.0 | [LICENSE-0BSD](docs/third-party/adler2-2.0.1/LICENSE-0BSD) · [LICENSE-APACHE](docs/third-party/adler2-2.0.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/adler2-2.0.1/LICENSE-MIT) |
| [aho-corasick 1.1.5](https://crates.io/crates/aho-corasick/1.1.5) | Unlicense OR MIT | [COPYING](docs/third-party/aho-corasick-1.1.5/COPYING) · [LICENSE-MIT](docs/third-party/aho-corasick-1.1.5/LICENSE-MIT) · [UNLICENSE](docs/third-party/aho-corasick-1.1.5/UNLICENSE) |
| [alloc-no-stdlib 3.0.0](https://crates.io/crates/alloc-no-stdlib/3.0.0) | BSD-3-Clause | [LICENSE](docs/third-party/alloc-no-stdlib-3.0.0/LICENSE) |
| [alloc-stdlib 0.3.0](https://crates.io/crates/alloc-stdlib/0.3.0) | BSD-3-Clause | [LICENSE](docs/third-party/alloc-stdlib-0.3.0/LICENSE) |
| [anyhow 1.0.104](https://crates.io/crates/anyhow/1.0.104) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/anyhow-1.0.104/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/anyhow-1.0.104/LICENSE-MIT) |
| [autocfg 1.5.1](https://crates.io/crates/autocfg/1.5.1) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/autocfg-1.5.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/autocfg-1.5.1/LICENSE-MIT) |
| [base64 0.22.1](https://crates.io/crates/base64/0.22.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/base64-0.22.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/base64-0.22.1/LICENSE-MIT) |
| [base64 0.23.1](https://crates.io/crates/base64/0.23.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/base64-0.23.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/base64-0.23.1/LICENSE-MIT) |
| [bit-set 0.8.0](https://crates.io/crates/bit-set/0.8.0) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/bit-set-0.8.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bit-set-0.8.0/LICENSE-MIT) |
| [bit-vec 0.8.0](https://crates.io/crates/bit-vec/0.8.0) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/bit-vec-0.8.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bit-vec-0.8.0/LICENSE-MIT) |
| [bitflags 1.3.2](https://crates.io/crates/bitflags/1.3.2) | MIT/Apache-2.0 | [LICENSE-APACHE](docs/third-party/bitflags-1.3.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bitflags-1.3.2/LICENSE-MIT) |
| [bitflags 2.13.2](https://crates.io/crates/bitflags/2.13.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/bitflags-2.13.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bitflags-2.13.2/LICENSE-MIT) |
| [block-buffer 0.10.4](https://crates.io/crates/block-buffer/0.10.4) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/block-buffer-0.10.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/block-buffer-0.10.4/LICENSE-MIT) |
| [brotli 9.0.0](https://crates.io/crates/brotli/9.0.0) | BSD-3-Clause AND MIT | [LICENSE.BSD-3-Clause](docs/third-party/brotli-9.0.0/LICENSE.BSD-3-Clause) · [LICENSE.MIT](docs/third-party/brotli-9.0.0/LICENSE.MIT) |
| [brotli-decompressor 6.0.1](https://crates.io/crates/brotli-decompressor/6.0.1) | BSD-3-Clause/MIT | [LICENSE](docs/third-party/brotli-decompressor-6.0.1/LICENSE) |
| [bs58 0.5.1](https://crates.io/crates/bs58/0.5.1) | MIT/Apache-2.0 | [LICENSE-APACHE](docs/third-party/bs58-0.5.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bs58-0.5.1/LICENSE-MIT) |
| [bumpalo 3.20.3](https://crates.io/crates/bumpalo/3.20.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/bumpalo-3.20.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/bumpalo-3.20.3/LICENSE-MIT) |
| [byteorder 1.5.0](https://crates.io/crates/byteorder/1.5.0) | Unlicense OR MIT | [COPYING](docs/third-party/byteorder-1.5.0/COPYING) · [LICENSE-MIT](docs/third-party/byteorder-1.5.0/LICENSE-MIT) · [UNLICENSE](docs/third-party/byteorder-1.5.0/UNLICENSE) |
| [bytes 1.12.1](https://crates.io/crates/bytes/1.12.1) | MIT | [LICENSE](docs/third-party/bytes-1.12.1/LICENSE) |
| [camino 1.2.6](https://crates.io/crates/camino/1.2.6) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/camino-1.2.6/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/camino-1.2.6/LICENSE-MIT) |
| [cargo-platform 0.1.9](https://crates.io/crates/cargo-platform/0.1.9) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/cargo-platform-0.1.9/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/cargo-platform-0.1.9/LICENSE-MIT) |
| [cargo_metadata 0.19.2](https://crates.io/crates/cargo_metadata/0.19.2) | MIT | [LICENSE-MIT](docs/third-party/cargo_metadata-0.19.2/LICENSE-MIT) |
| [cargo_toml 1.0.1](https://crates.io/crates/cargo_toml/1.0.1) | Apache-2.0 OR MIT | [LICENSE](docs/third-party/cargo_toml-1.0.1/LICENSE) |
| [cc 1.10.0](https://crates.io/crates/cc/1.10.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/cc-1.10.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/cc-1.10.0/LICENSE-MIT) |
| [cfb 0.14.0](https://crates.io/crates/cfb/0.14.0) | MIT | [LICENSE](docs/third-party/cfb-0.14.0/LICENSE) |
| [cfg-if 1.0.5](https://crates.io/crates/cfg-if/1.0.5) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/cfg-if-1.0.5/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/cfg-if-1.0.5/LICENSE-MIT) |
| [chrono 0.4.45](https://crates.io/crates/chrono/0.4.45) | MIT OR Apache-2.0 | [LICENSE.txt](docs/third-party/chrono-0.4.45/LICENSE.txt) |
| [cookie 0.18.2](https://crates.io/crates/cookie/0.18.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/cookie-0.18.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/cookie-0.18.2/LICENSE-MIT) |
| [core_detect 1.0.0](https://crates.io/crates/core_detect/1.0.0) | MIT/Apache-2.0 | [LICENSE-APACHE](docs/third-party/core_detect-1.0.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/core_detect-1.0.0/LICENSE-MIT) |
| [cpufeatures 0.2.17](https://crates.io/crates/cpufeatures/0.2.17) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/cpufeatures-0.2.17/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/cpufeatures-0.2.17/LICENSE-MIT) |
| [crc32fast 1.5.3](https://crates.io/crates/crc32fast/1.5.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/crc32fast-1.5.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/crc32fast-1.5.3/LICENSE-MIT) |
| [crossbeam-channel 0.5.17](https://crates.io/crates/crossbeam-channel/0.5.17) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/crossbeam-channel-0.5.17/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/crossbeam-channel-0.5.17/LICENSE-MIT) · [LICENSE-THIRD-PARTY](docs/third-party/crossbeam-channel-0.5.17/LICENSE-THIRD-PARTY) |
| [crossbeam-utils 0.8.23](https://crates.io/crates/crossbeam-utils/0.8.23) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/crossbeam-utils-0.8.23/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/crossbeam-utils-0.8.23/LICENSE-MIT) |
| [crypto-common 0.1.7](https://crates.io/crates/crypto-common/0.1.7) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/crypto-common-0.1.7/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/crypto-common-0.1.7/LICENSE-MIT) |
| [cssparser 0.37.0](https://crates.io/crates/cssparser/0.37.0) | MPL-2.0 | [LICENSE](docs/third-party/cssparser-0.37.0/LICENSE) |
| [cssparser-macros 0.7.1](https://crates.io/crates/cssparser-macros/0.7.1) | MPL-2.0 | [LICENSE](docs/third-party/cssparser-macros-0.7.1/LICENSE) |
| [ctor 1.0.13](https://crates.io/crates/ctor/1.0.13) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/ctor-1.0.13/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/ctor-1.0.13/LICENSE-MIT) |
| [darling 0.24.1](https://crates.io/crates/darling/0.24.1) | MIT | [LICENSE](docs/third-party/darling-0.24.1/LICENSE) |
| [darling_core 0.24.1](https://crates.io/crates/darling_core/0.24.1) | MIT | [LICENSE](docs/third-party/darling_core-0.24.1/LICENSE) |
| [darling_macro 0.24.1](https://crates.io/crates/darling_macro/0.24.1) | MIT | [LICENSE](docs/third-party/darling_macro-0.24.1/LICENSE) |
| [defmt 1.2.0](https://crates.io/crates/defmt/1.2.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/defmt-1.2.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/defmt-1.2.0/LICENSE-MIT) |
| [defmt-macros 1.2.0](https://crates.io/crates/defmt-macros/1.2.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/defmt-macros-1.2.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/defmt-macros-1.2.0/LICENSE-MIT) |
| [defmt-parser 1.1.0](https://crates.io/crates/defmt-parser/1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/defmt-parser-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/defmt-parser-1.1.0/LICENSE-MIT) |
| [deranged 0.5.9](https://crates.io/crates/deranged/0.5.9) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/deranged-0.5.9/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/deranged-0.5.9/LICENSE-MIT) |
| [derive_more 2.1.1](https://crates.io/crates/derive_more/2.1.1) | MIT | [LICENSE](docs/third-party/derive_more-2.1.1/LICENSE) |
| [derive_more-impl 2.1.1](https://crates.io/crates/derive_more-impl/2.1.1) | MIT | [LICENSE](docs/third-party/derive_more-impl-2.1.1/LICENSE) |
| [digest 0.10.7](https://crates.io/crates/digest/0.10.7) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/digest-0.10.7/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/digest-0.10.7/LICENSE-MIT) |
| [dirs 7.0.0](https://crates.io/crates/dirs/7.0.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/dirs-7.0.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/dirs-7.0.0/LICENSE-MIT) |
| [dirs-sys 0.5.0](https://crates.io/crates/dirs-sys/0.5.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/dirs-sys-0.5.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/dirs-sys-0.5.0/LICENSE-MIT) |
| [displaydoc 0.2.7](https://crates.io/crates/displaydoc/0.2.7) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/displaydoc-0.2.7/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/displaydoc-0.2.7/LICENSE-MIT) |
| [dom_query 0.28.0](https://crates.io/crates/dom_query/0.28.0) | MIT | [LICENSE](docs/third-party/dom_query-0.28.0/LICENSE) |
| [dpi 0.1.2](https://crates.io/crates/dpi/0.1.2) | Apache-2.0 AND MIT | [LICENSE](docs/third-party/dpi-0.1.2/LICENSE) · [LICENSE-LIBM-MIT](docs/third-party/dpi-0.1.2/LICENSE-LIBM-MIT) |
| [dtoa 1.0.11](https://crates.io/crates/dtoa/1.0.11) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/dtoa-1.0.11/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/dtoa-1.0.11/LICENSE-MIT) |
| [dtoa-short 0.3.5](https://crates.io/crates/dtoa-short/0.3.5) | MPL-2.0 | [LICENSE](docs/third-party/dtoa-short-0.3.5/LICENSE) |
| [dunce 1.0.5](https://crates.io/crates/dunce/1.0.5) | CC0-1.0 OR MIT-0 OR Apache-2.0 | [LICENSE](docs/third-party/dunce-1.0.5/LICENSE) |
| [dyn-clone 1.0.20](https://crates.io/crates/dyn-clone/1.0.20) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/dyn-clone-1.0.20/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/dyn-clone-1.0.20/LICENSE-MIT) |
| [embed-resource 3.0.12](https://crates.io/crates/embed-resource/3.0.12) | MIT | [LICENSE](docs/third-party/embed-resource-3.0.12/LICENSE) |
| [encoding_rs 0.8.42](https://crates.io/crates/encoding_rs/0.8.42) | (Apache-2.0 OR MIT) AND BSD-3-Clause | [COPYRIGHT](docs/third-party/encoding_rs-0.8.42/COPYRIGHT) · [LICENSE-APACHE](docs/third-party/encoding_rs-0.8.42/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/encoding_rs-0.8.42/LICENSE-MIT) · [LICENSE-WHATWG](docs/third-party/encoding_rs-0.8.42/LICENSE-WHATWG) |
| [equivalent 1.0.3](https://crates.io/crates/equivalent/1.0.3) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/equivalent-1.0.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/equivalent-1.0.3/LICENSE-MIT) |
| [erased-serde 0.4.10](https://crates.io/crates/erased-serde/0.4.10) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/erased-serde-0.4.10/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/erased-serde-0.4.10/LICENSE-MIT) |
| [fastrand 2.5.0](https://crates.io/crates/fastrand/2.5.0) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/fastrand-2.5.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/fastrand-2.5.0/LICENSE-MIT) |
| [fdeflate 0.3.7](https://crates.io/crates/fdeflate/0.3.7) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/fdeflate-0.3.7/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/fdeflate-0.3.7/LICENSE-MIT) |
| [find-msvc-tools 0.1.15](https://crates.io/crates/find-msvc-tools/0.1.15) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/find-msvc-tools-0.1.15/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/find-msvc-tools-0.1.15/LICENSE-MIT) |
| [flate2 1.1.10](https://crates.io/crates/flate2/1.1.10) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/flate2-1.1.10/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/flate2-1.1.10/LICENSE-MIT) |
| [fnv 1.0.7](https://crates.io/crates/fnv/1.0.7) | Apache-2.0 / MIT | [LICENSE-APACHE](docs/third-party/fnv-1.0.7/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/fnv-1.0.7/LICENSE-MIT) |
| [foldhash 0.2.0](https://crates.io/crates/foldhash/0.2.0) | Zlib | [LICENSE](docs/third-party/foldhash-0.2.0/LICENSE) |
| [form_urlencoded 1.2.2](https://crates.io/crates/form_urlencoded/1.2.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/form_urlencoded-1.2.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/form_urlencoded-1.2.2/LICENSE-MIT) |
| [generic-array 0.14.7](https://crates.io/crates/generic-array/0.14.7) | MIT | [LICENSE](docs/third-party/generic-array-0.14.7/LICENSE) |
| [getrandom 0.3.4](https://crates.io/crates/getrandom/0.3.4) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/getrandom-0.3.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/getrandom-0.3.4/LICENSE-MIT) |
| [getrandom 0.4.3](https://crates.io/crates/getrandom/0.4.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/getrandom-0.4.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/getrandom-0.4.3/LICENSE-MIT) |
| [glob 0.3.4](https://crates.io/crates/glob/0.3.4) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/glob-0.3.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/glob-0.3.4/LICENSE-MIT) |
| [hashbrown 0.12.3](https://crates.io/crates/hashbrown/0.12.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/hashbrown-0.12.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/hashbrown-0.12.3/LICENSE-MIT) |
| [hashbrown 0.17.1](https://crates.io/crates/hashbrown/0.17.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/hashbrown-0.17.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/hashbrown-0.17.1/LICENSE-MIT) |
| [heck 0.5.0](https://crates.io/crates/heck/0.5.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/heck-0.5.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/heck-0.5.0/LICENSE-MIT) |
| [hex 0.4.3](https://crates.io/crates/hex/0.4.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/hex-0.4.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/hex-0.4.3/LICENSE-MIT) |
| [html5ever 0.39.0](https://crates.io/crates/html5ever/0.39.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/html5ever-0.39.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/html5ever-0.39.0/LICENSE-MIT) |
| [http 1.5.0](https://crates.io/crates/http/1.5.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/http-1.5.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/http-1.5.0/LICENSE-MIT) |
| [ico 0.6.0](https://crates.io/crates/ico/0.6.0) | MIT | [LICENSE](docs/third-party/ico-0.6.0/LICENSE) |
| [icu_collections 2.4.0](https://crates.io/crates/icu_collections/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_collections-2.4.0/LICENSE) |
| [icu_locale_core 2.4.0](https://crates.io/crates/icu_locale_core/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_locale_core-2.4.0/LICENSE) |
| [icu_normalizer 2.4.0](https://crates.io/crates/icu_normalizer/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_normalizer-2.4.0/LICENSE) |
| [icu_normalizer_data 2.4.0](https://crates.io/crates/icu_normalizer_data/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_normalizer_data-2.4.0/LICENSE) |
| [icu_properties 2.4.0](https://crates.io/crates/icu_properties/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_properties-2.4.0/LICENSE) |
| [icu_properties_data 2.4.0](https://crates.io/crates/icu_properties_data/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_properties_data-2.4.0/LICENSE) |
| [icu_provider 2.4.0](https://crates.io/crates/icu_provider/2.4.0) | Unicode-3.0 | [LICENSE](docs/third-party/icu_provider-2.4.0/LICENSE) |
| [ident_case 1.0.1](https://crates.io/crates/ident_case/1.0.1) | MIT/Apache-2.0 | [LICENSE](docs/third-party/ident_case-1.0.1/LICENSE) |
| [idna 1.1.0](https://crates.io/crates/idna/1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/idna-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/idna-1.1.0/LICENSE-MIT) |
| [idna_adapter 1.2.2](https://crates.io/crates/idna_adapter/1.2.2) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/idna_adapter-1.2.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/idna_adapter-1.2.2/LICENSE-MIT) |
| [indexmap 1.9.3](https://crates.io/crates/indexmap/1.9.3) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/indexmap-1.9.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/indexmap-1.9.3/LICENSE-MIT) |
| [indexmap 2.14.2](https://crates.io/crates/indexmap/2.14.2) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/indexmap-2.14.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/indexmap-2.14.2/LICENSE-MIT) |
| [infer 0.22.0](https://crates.io/crates/infer/0.22.0) | MIT | [LICENSE](docs/third-party/infer-0.22.0/LICENSE) |
| [itoa 1.0.18](https://crates.io/crates/itoa/1.0.18) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/itoa-1.0.18/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/itoa-1.0.18/LICENSE-MIT) |
| [jiff 0.2.38](https://crates.io/crates/jiff/0.2.38) | Unlicense OR MIT | [COPYING](docs/third-party/jiff-0.2.38/COPYING) · [LICENSE-MIT](docs/third-party/jiff-0.2.38/LICENSE-MIT) · [UNLICENSE](docs/third-party/jiff-0.2.38/UNLICENSE) |
| [jiff-core 0.1.1](https://crates.io/crates/jiff-core/0.1.1) | Unlicense OR MIT | [COPYING](docs/third-party/jiff-core-0.1.1/COPYING) · [LICENSE-MIT](docs/third-party/jiff-core-0.1.1/LICENSE-MIT) · [UNLICENSE](docs/third-party/jiff-core-0.1.1/UNLICENSE) |
| [jiff-tzdb 0.1.9](https://crates.io/crates/jiff-tzdb/0.1.9) | Unlicense OR MIT | [COPYING](docs/third-party/jiff-tzdb-0.1.9/COPYING) · [LICENSE-MIT](docs/third-party/jiff-tzdb-0.1.9/LICENSE-MIT) · [UNLICENSE](docs/third-party/jiff-tzdb-0.1.9/UNLICENSE) |
| [jiff-tzdb-platform 0.1.3](https://crates.io/crates/jiff-tzdb-platform/0.1.3) | Unlicense OR MIT | [COPYING](docs/third-party/jiff-tzdb-platform-0.1.3/COPYING) · [LICENSE-MIT](docs/third-party/jiff-tzdb-platform-0.1.3/LICENSE-MIT) · [UNLICENSE](docs/third-party/jiff-tzdb-platform-0.1.3/UNLICENSE) |
| [json-patch 4.2.0](https://crates.io/crates/json-patch/4.2.0) | MIT/Apache-2.0 | [LICENSE-APACHE](docs/third-party/json-patch-4.2.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/json-patch-4.2.0/LICENSE-MIT) |
| [jsonptr 0.7.1](https://crates.io/crates/jsonptr/0.7.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/jsonptr-0.7.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/jsonptr-0.7.1/LICENSE-MIT) |
| [keyboard-types 0.8.3](https://crates.io/crates/keyboard-types/0.8.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/keyboard-types-0.8.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/keyboard-types-0.8.3/LICENSE-MIT) |
| [libc 0.2.191](https://crates.io/crates/libc/0.2.191) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/libc-0.2.191/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/libc-0.2.191/LICENSE-MIT) |
| [litemap 0.8.3](https://crates.io/crates/litemap/0.8.3) | Unicode-3.0 | [LICENSE](docs/third-party/litemap-0.8.3/LICENSE) |
| [lock_api 0.4.14](https://crates.io/crates/lock_api/0.4.14) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/lock_api-0.4.14/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/lock_api-0.4.14/LICENSE-MIT) |
| [log 0.4.34](https://crates.io/crates/log/0.4.34) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/log-0.4.34/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/log-0.4.34/LICENSE-MIT) |
| [markup5ever 0.39.0](https://crates.io/crates/markup5ever/0.39.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/markup5ever-0.39.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/markup5ever-0.39.0/LICENSE-MIT) |
| [memchr 2.8.3](https://crates.io/crates/memchr/2.8.3) | Unlicense OR MIT | [COPYING](docs/third-party/memchr-2.8.3/COPYING) · [LICENSE-MIT](docs/third-party/memchr-2.8.3/LICENSE-MIT) · [UNLICENSE](docs/third-party/memchr-2.8.3/UNLICENSE) |
| [mime 0.3.17](https://crates.io/crates/mime/0.3.17) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/mime-0.3.17/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/mime-0.3.17/LICENSE-MIT) |
| [miniz_oxide 0.8.9](https://crates.io/crates/miniz_oxide/0.8.9) | MIT OR Zlib OR Apache-2.0 | [LICENSE](docs/third-party/miniz_oxide-0.8.9/LICENSE) · [LICENSE-APACHE.md](docs/third-party/miniz_oxide-0.8.9/LICENSE-APACHE.md) · [LICENSE-MIT.md](docs/third-party/miniz_oxide-0.8.9/LICENSE-MIT.md) · [LICENSE-ZLIB.md](docs/third-party/miniz_oxide-0.8.9/LICENSE-ZLIB.md) |
| [miniz_oxide 0.9.1](https://crates.io/crates/miniz_oxide/0.9.1) | MIT OR Zlib OR Apache-2.0 | [LICENSE](docs/third-party/miniz_oxide-0.9.1/LICENSE) · [LICENSE-APACHE.md](docs/third-party/miniz_oxide-0.9.1/LICENSE-APACHE.md) · [LICENSE-MIT.md](docs/third-party/miniz_oxide-0.9.1/LICENSE-MIT.md) · [LICENSE-ZLIB.md](docs/third-party/miniz_oxide-0.9.1/LICENSE-ZLIB.md) |
| [mio 1.2.4](https://crates.io/crates/mio/1.2.4) | MIT | [LICENSE](docs/third-party/mio-1.2.4/LICENSE) |
| [muda 0.20.0](https://crates.io/crates/muda/0.20.0) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/muda-0.20.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/muda-0.20.0/LICENSE-MIT) · [LICENSE.spdx](docs/third-party/muda-0.20.0/LICENSE.spdx) |
| [multiversion_no_op 1.0.0](https://crates.io/crates/multiversion_no_op/1.0.0) | Apache-2.0 OR MIT | [COPYRIGHT](docs/third-party/multiversion_no_op-1.0.0/COPYRIGHT) · [LICENSE-APACHE](docs/third-party/multiversion_no_op-1.0.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/multiversion_no_op-1.0.0/LICENSE-MIT) |
| [new_debug_unreachable 1.0.6](https://crates.io/crates/new_debug_unreachable/1.0.6) | MIT | [LICENSE-MIT](docs/third-party/new_debug_unreachable-1.0.6/LICENSE-MIT) |
| [num-conv 0.2.2](https://crates.io/crates/num-conv/0.2.2) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/num-conv-0.2.2/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/num-conv-0.2.2/LICENSE-MIT) |
| [num-traits 0.2.19](https://crates.io/crates/num-traits/0.2.19) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/num-traits-0.2.19/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/num-traits-0.2.19/LICENSE-MIT) |
| [once_cell 1.21.4](https://crates.io/crates/once_cell/1.21.4) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/once_cell-1.21.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/once_cell-1.21.4/LICENSE-MIT) |
| [option-ext 0.2.0](https://crates.io/crates/option-ext/0.2.0) | MPL-2.0 | [LICENSE.txt](docs/third-party/option-ext-0.2.0/LICENSE.txt) |
| [parking_lot 0.12.5](https://crates.io/crates/parking_lot/0.12.5) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/parking_lot-0.12.5/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/parking_lot-0.12.5/LICENSE-MIT) |
| [parking_lot_core 0.9.12](https://crates.io/crates/parking_lot_core/0.9.12) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/parking_lot_core-0.9.12/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/parking_lot_core-0.9.12/LICENSE-MIT) |
| [percent-encoding 2.3.2](https://crates.io/crates/percent-encoding/2.3.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/percent-encoding-2.3.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/percent-encoding-2.3.2/LICENSE-MIT) |
| [phf 0.13.1](https://crates.io/crates/phf/0.13.1) | MIT | [LICENSE](docs/third-party/phf-0.13.1/LICENSE) |
| [phf_codegen 0.13.1](https://crates.io/crates/phf_codegen/0.13.1) | MIT | [LICENSE](docs/third-party/phf_codegen-0.13.1/LICENSE) |
| [phf_generator 0.13.1](https://crates.io/crates/phf_generator/0.13.1) | MIT | [LICENSE](docs/third-party/phf_generator-0.13.1/LICENSE) |
| [phf_macros 0.13.1](https://crates.io/crates/phf_macros/0.13.1) | MIT | [LICENSE](docs/third-party/phf_macros-0.13.1/LICENSE) |
| [phf_shared 0.13.1](https://crates.io/crates/phf_shared/0.13.1) | MIT | [LICENSE](docs/third-party/phf_shared-0.13.1/LICENSE) |
| [pin-project-lite 0.2.17](https://crates.io/crates/pin-project-lite/0.2.17) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/pin-project-lite-0.2.17/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/pin-project-lite-0.2.17/LICENSE-MIT) |
| [plist 1.10.3](https://crates.io/crates/plist/1.10.3) | MIT | [LICENCE](docs/third-party/plist-1.10.3/LICENCE) |
| [png 0.18.1](https://crates.io/crates/png/0.18.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/png-0.18.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/png-0.18.1/LICENSE-MIT) |
| [potential_utf 0.1.6](https://crates.io/crates/potential_utf/0.1.6) | Unicode-3.0 | [LICENSE](docs/third-party/potential_utf-0.1.6/LICENSE) |
| [powerfmt 0.2.1](https://crates.io/crates/powerfmt/0.2.1) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/powerfmt-0.2.1/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/powerfmt-0.2.1/LICENSE-MIT) |
| [precomputed-hash 0.1.1](https://crates.io/crates/precomputed-hash/0.1.1) | MIT | [LICENSE](docs/third-party/precomputed-hash-0.1.1/LICENSE) |
| [proc-macro2 1.0.107](https://crates.io/crates/proc-macro2/1.0.107) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/proc-macro2-1.0.107/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/proc-macro2-1.0.107/LICENSE-MIT) |
| [quick-xml 0.42.0](https://crates.io/crates/quick-xml/0.42.0) | MIT | [LICENSE-MIT.md](docs/third-party/quick-xml-0.42.0/LICENSE-MIT.md) |
| [quote 1.0.47](https://crates.io/crates/quote/1.0.47) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/quote-1.0.47/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/quote-1.0.47/LICENSE-MIT) |
| [raw-window-handle 0.6.2](https://crates.io/crates/raw-window-handle/0.6.2) | MIT OR Apache-2.0 OR Zlib | [LICENSE-APACHE.md](docs/third-party/raw-window-handle-0.6.2/LICENSE-APACHE.md) · [LICENSE-MIT.md](docs/third-party/raw-window-handle-0.6.2/LICENSE-MIT.md) · [LICENSE-ZLIB.md](docs/third-party/raw-window-handle-0.6.2/LICENSE-ZLIB.md) |
| [ref-cast 1.0.27](https://crates.io/crates/ref-cast/1.0.27) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/ref-cast-1.0.27/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/ref-cast-1.0.27/LICENSE-MIT) |
| [ref-cast-impl 1.0.27](https://crates.io/crates/ref-cast-impl/1.0.27) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/ref-cast-impl-1.0.27/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/ref-cast-impl-1.0.27/LICENSE-MIT) |
| [regex 1.13.1](https://crates.io/crates/regex/1.13.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/regex-1.13.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/regex-1.13.1/LICENSE-MIT) |
| [regex-automata 0.4.18](https://crates.io/crates/regex-automata/0.4.18) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/regex-automata-0.4.18/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/regex-automata-0.4.18/LICENSE-MIT) |
| [regex-syntax 0.8.11](https://crates.io/crates/regex-syntax/0.8.11) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/regex-syntax-0.8.11/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/regex-syntax-0.8.11/LICENSE-MIT) |
| [rfd 0.15.4](https://crates.io/crates/rfd/0.15.4) | MIT | [LICENSE](docs/third-party/rfd-0.15.4/LICENSE) |
| [rustc-hash 2.1.3](https://crates.io/crates/rustc-hash/2.1.3) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/rustc-hash-2.1.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/rustc-hash-2.1.3/LICENSE-MIT) |
| [rustc_version 0.4.1](https://crates.io/crates/rustc_version/0.4.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/rustc_version-0.4.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/rustc_version-0.4.1/LICENSE-MIT) |
| [rustversion 1.0.23](https://crates.io/crates/rustversion/1.0.23) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/rustversion-1.0.23/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/rustversion-1.0.23/LICENSE-MIT) |
| [same-file 1.0.6](https://crates.io/crates/same-file/1.0.6) | Unlicense/MIT | [COPYING](docs/third-party/same-file-1.0.6/COPYING) · [LICENSE-MIT](docs/third-party/same-file-1.0.6/LICENSE-MIT) · [UNLICENSE](docs/third-party/same-file-1.0.6/UNLICENSE) |
| [schemars 0.8.22](https://crates.io/crates/schemars/0.8.22) | MIT | [LICENSE](docs/third-party/schemars-0.8.22/LICENSE) |
| [schemars 0.9.0](https://crates.io/crates/schemars/0.9.0) | MIT | [LICENSE](docs/third-party/schemars-0.9.0/LICENSE) |
| [schemars 1.2.3](https://crates.io/crates/schemars/1.2.3) | MIT | [LICENSE](docs/third-party/schemars-1.2.3/LICENSE) |
| [schemars_derive 0.8.22](https://crates.io/crates/schemars_derive/0.8.22) | MIT | [LICENSE](docs/third-party/schemars_derive-0.8.22/LICENSE) |
| [scopeguard 1.2.0](https://crates.io/crates/scopeguard/1.2.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/scopeguard-1.2.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/scopeguard-1.2.0/LICENSE-MIT) |
| [selectors 0.38.0](https://crates.io/crates/selectors/0.38.0) | MPL-2.0 | [LICENSE-MPL-2.0](docs/third-party/selectors-0.38.0/LICENSE-MPL-2.0) |
| [semver 1.0.28](https://crates.io/crates/semver/1.0.28) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/semver-1.0.28/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/semver-1.0.28/LICENSE-MIT) |
| [serde 1.0.229](https://crates.io/crates/serde/1.0.229) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde-1.0.229/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde-1.0.229/LICENSE-MIT) |
| [serde-untagged 0.1.9](https://crates.io/crates/serde-untagged/0.1.9) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde-untagged-0.1.9/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde-untagged-0.1.9/LICENSE-MIT) |
| [serde_core 1.0.229](https://crates.io/crates/serde_core/1.0.229) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_core-1.0.229/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_core-1.0.229/LICENSE-MIT) |
| [serde_derive 1.0.229](https://crates.io/crates/serde_derive/1.0.229) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_derive-1.0.229/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_derive-1.0.229/LICENSE-MIT) |
| [serde_derive_internals 0.29.1](https://crates.io/crates/serde_derive_internals/0.29.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_derive_internals-0.29.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_derive_internals-0.29.1/LICENSE-MIT) |
| [serde_json 1.0.154](https://crates.io/crates/serde_json/1.0.154) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_json-1.0.154/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_json-1.0.154/LICENSE-MIT) |
| [serde_repr 0.1.21](https://crates.io/crates/serde_repr/0.1.21) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_repr-0.1.21/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_repr-0.1.21/LICENSE-MIT) |
| [serde_spanned 1.1.2](https://crates.io/crates/serde_spanned/1.1.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_spanned-1.1.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_spanned-1.1.2/LICENSE-MIT) |
| [serde_with 3.24.0](https://crates.io/crates/serde_with/3.24.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_with-3.24.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_with-3.24.0/LICENSE-MIT) |
| [serde_with_macros 3.24.0](https://crates.io/crates/serde_with_macros/3.24.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serde_with_macros-3.24.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serde_with_macros-3.24.0/LICENSE-MIT) |
| [serialize-to-javascript 0.1.2](https://crates.io/crates/serialize-to-javascript/0.1.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serialize-to-javascript-0.1.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serialize-to-javascript-0.1.2/LICENSE-MIT) |
| [serialize-to-javascript-impl 0.1.2](https://crates.io/crates/serialize-to-javascript-impl/0.1.2) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/serialize-to-javascript-impl-0.1.2/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/serialize-to-javascript-impl-0.1.2/LICENSE-MIT) |
| [servo_arc 0.4.3](https://crates.io/crates/servo_arc/0.4.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/servo_arc-0.4.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/servo_arc-0.4.3/LICENSE-MIT) |
| [sha2 0.10.9](https://crates.io/crates/sha2/0.10.9) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/sha2-0.10.9/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/sha2-0.10.9/LICENSE-MIT) |
| [shlex 2.0.1](https://crates.io/crates/shlex/2.0.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/shlex-2.0.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/shlex-2.0.1/LICENSE-MIT) |
| [simd-adler32 0.3.10](https://crates.io/crates/simd-adler32/0.3.10) | MIT | [LICENSE.md](docs/third-party/simd-adler32-0.3.10/LICENSE.md) |
| [simdutf8 0.1.5](https://crates.io/crates/simdutf8/0.1.5) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/simdutf8-0.1.5/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/simdutf8-0.1.5/LICENSE-MIT) |
| [siphasher 1.0.4](https://crates.io/crates/siphasher/1.0.4) | MIT OR Apache-2.0 | [COPYING](docs/third-party/siphasher-1.0.4/COPYING) · [LICENSE-APACHE](docs/third-party/siphasher-1.0.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/siphasher-1.0.4/LICENSE-MIT) |
| [smallvec 1.16.3](https://crates.io/crates/smallvec/1.16.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/smallvec-1.16.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/smallvec-1.16.3/LICENSE-MIT) |
| [socket2 0.6.5](https://crates.io/crates/socket2/0.6.5) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/socket2-0.6.5/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/socket2-0.6.5/LICENSE-MIT) |
| [softbuffer 0.4.8](https://crates.io/crates/softbuffer/0.4.8) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/softbuffer-0.4.8/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/softbuffer-0.4.8/LICENSE-MIT) |
| [stable_deref_trait 1.2.1](https://crates.io/crates/stable_deref_trait/1.2.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/stable_deref_trait-1.2.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/stable_deref_trait-1.2.1/LICENSE-MIT) |
| [static_vcruntime 3.0.0](https://crates.io/crates/static_vcruntime/3.0.0) | MIT OR Apache-2.0 OR Zlib | [LICENSE](docs/third-party/static_vcruntime-3.0.0/LICENSE) · [LICENSE-APACHE](docs/third-party/static_vcruntime-3.0.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/static_vcruntime-3.0.0/LICENSE-MIT) · [LICENSE-ZLIB](docs/third-party/static_vcruntime-3.0.0/LICENSE-ZLIB) |
| [string_cache 0.9.0](https://crates.io/crates/string_cache/0.9.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/string_cache-0.9.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/string_cache-0.9.0/LICENSE-MIT) |
| [string_cache_codegen 0.6.1](https://crates.io/crates/string_cache_codegen/0.6.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/string_cache_codegen-0.6.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/string_cache_codegen-0.6.1/LICENSE-MIT) |
| [strsim 0.11.1](https://crates.io/crates/strsim/0.11.1) | MIT | [LICENSE](docs/third-party/strsim-0.11.1/LICENSE) |
| [syn 2.0.119](https://crates.io/crates/syn/2.0.119) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/syn-2.0.119/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/syn-2.0.119/LICENSE-MIT) |
| [syn 3.0.9](https://crates.io/crates/syn/3.0.9) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/syn-3.0.9/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/syn-3.0.9/LICENSE-MIT) |
| [synstructure 0.14.0](https://crates.io/crates/synstructure/0.14.0) | MIT | [LICENSE](docs/third-party/synstructure-0.14.0/LICENSE) |
| [tao 0.37.2](https://crates.io/crates/tao/0.37.2) | Apache-2.0 | [LICENSE](docs/third-party/tao-0.37.2/LICENSE) · [LICENSE.spdx](docs/third-party/tao-0.37.2/LICENSE.spdx) |
| [tauri 2.12.5](https://crates.io/crates/tauri/2.12.5) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-2.12.5/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-2.12.5/LICENSE-MIT) |
| [tauri-build 2.7.4](https://crates.io/crates/tauri-build/2.7.4) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-build-2.7.4/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-build-2.7.4/LICENSE-MIT) |
| [tauri-codegen 2.7.4](https://crates.io/crates/tauri-codegen/2.7.4) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-codegen-2.7.4/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-codegen-2.7.4/LICENSE-MIT) |
| [tauri-macros 2.7.4](https://crates.io/crates/tauri-macros/2.7.4) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-macros-2.7.4/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-macros-2.7.4/LICENSE-MIT) |
| [tauri-runtime 2.12.2](https://crates.io/crates/tauri-runtime/2.12.2) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-runtime-2.12.2/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-runtime-2.12.2/LICENSE-MIT) |
| [tauri-runtime-wry 2.12.3](https://crates.io/crates/tauri-runtime-wry/2.12.3) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-runtime-wry-2.12.3/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-runtime-wry-2.12.3/LICENSE-MIT) |
| [tauri-utils 2.10.2](https://crates.io/crates/tauri-utils/2.10.2) | Apache-2.0 OR MIT | [LICENSE-APACHE-2.0](docs/third-party/tauri-utils-2.10.2/LICENSE-APACHE-2.0) · [LICENSE-MIT](docs/third-party/tauri-utils-2.10.2/LICENSE-MIT) |
| [tauri-winres 0.3.7](https://crates.io/crates/tauri-winres/0.3.7) | MIT | [LICENSE](docs/third-party/tauri-winres-0.3.7/LICENSE) |
| [tendril 0.5.1](https://crates.io/crates/tendril/0.5.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/tendril-0.5.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/tendril-0.5.1/LICENSE-MIT) |
| [thiserror 2.0.21](https://crates.io/crates/thiserror/2.0.21) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/thiserror-2.0.21/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/thiserror-2.0.21/LICENSE-MIT) |
| [thiserror-impl 2.0.21](https://crates.io/crates/thiserror-impl/2.0.21) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/thiserror-impl-2.0.21/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/thiserror-impl-2.0.21/LICENSE-MIT) |
| [time 0.3.55](https://crates.io/crates/time/0.3.55) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/time-0.3.55/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/time-0.3.55/LICENSE-MIT) |
| [time-core 0.1.9](https://crates.io/crates/time-core/0.1.9) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/time-core-0.1.9/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/time-core-0.1.9/LICENSE-MIT) |
| [time-macros 0.2.32](https://crates.io/crates/time-macros/0.2.32) | MIT OR Apache-2.0 | [LICENSE-Apache](docs/third-party/time-macros-0.2.32/LICENSE-Apache) · [LICENSE-MIT](docs/third-party/time-macros-0.2.32/LICENSE-MIT) |
| [tinystr 0.8.5](https://crates.io/crates/tinystr/0.8.5) | Unicode-3.0 | [LICENSE](docs/third-party/tinystr-0.8.5/LICENSE) |
| [tinyvec 1.13.3](https://crates.io/crates/tinyvec/1.13.3) | Zlib OR Apache-2.0 OR MIT | [LICENSE-APACHE.md](docs/third-party/tinyvec-1.13.3/LICENSE-APACHE.md) · [LICENSE-MIT.md](docs/third-party/tinyvec-1.13.3/LICENSE-MIT.md) · [LICENSE-ZLIB.md](docs/third-party/tinyvec-1.13.3/LICENSE-ZLIB.md) |
| [tokio 1.54.1](https://crates.io/crates/tokio/1.54.1) | MIT | [LICENSE](docs/third-party/tokio-1.54.1/LICENSE) |
| [toml 1.1.8+spec-1.1.0](https://crates.io/crates/toml/1.1.8+spec-1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/toml-1.1.8+spec-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/toml-1.1.8+spec-1.1.0/LICENSE-MIT) |
| [toml_datetime 1.1.2+spec-1.1.0](https://crates.io/crates/toml_datetime/1.1.2+spec-1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/toml_datetime-1.1.2+spec-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/toml_datetime-1.1.2+spec-1.1.0/LICENSE-MIT) |
| [toml_parser 1.1.5+spec-1.1.0](https://crates.io/crates/toml_parser/1.1.5+spec-1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/toml_parser-1.1.5+spec-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/toml_parser-1.1.5+spec-1.1.0/LICENSE-MIT) |
| [toml_writer 1.1.3+spec-1.1.0](https://crates.io/crates/toml_writer/1.1.3+spec-1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/toml_writer-1.1.3+spec-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/toml_writer-1.1.3+spec-1.1.0/LICENSE-MIT) |
| [tracing 0.1.44](https://crates.io/crates/tracing/0.1.44) | MIT | [LICENSE](docs/third-party/tracing-0.1.44/LICENSE) |
| [tracing-attributes 0.1.31](https://crates.io/crates/tracing-attributes/0.1.31) | MIT | [LICENSE](docs/third-party/tracing-attributes-0.1.31/LICENSE) |
| [tracing-core 0.1.36](https://crates.io/crates/tracing-core/0.1.36) | MIT | [LICENSE](docs/third-party/tracing-core-0.1.36/LICENSE) |
| [tray-icon 0.25.1](https://crates.io/crates/tray-icon/0.25.1) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/tray-icon-0.25.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/tray-icon-0.25.1/LICENSE-MIT) · [LICENSE.spdx](docs/third-party/tray-icon-0.25.1/LICENSE.spdx) |
| [typeid 1.0.3](https://crates.io/crates/typeid/1.0.3) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/typeid-1.0.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/typeid-1.0.3/LICENSE-MIT) |
| [typenum 1.20.1](https://crates.io/crates/typenum/1.20.1) | MIT OR Apache-2.0 | [LICENSE](docs/third-party/typenum-1.20.1/LICENSE) · [LICENSE-APACHE](docs/third-party/typenum-1.20.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/typenum-1.20.1/LICENSE-MIT) |
| [unicode-ident 1.0.27](https://crates.io/crates/unicode-ident/1.0.27) | (MIT OR Apache-2.0) AND Unicode-3.0 | [LICENSE-APACHE](docs/third-party/unicode-ident-1.0.27/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/unicode-ident-1.0.27/LICENSE-MIT) · [LICENSE-UNICODE](docs/third-party/unicode-ident-1.0.27/LICENSE-UNICODE) |
| [unicode-segmentation 1.13.3](https://crates.io/crates/unicode-segmentation/1.13.3) | MIT OR Apache-2.0 | [COPYRIGHT](docs/third-party/unicode-segmentation-1.13.3/COPYRIGHT) · [LICENSE-APACHE](docs/third-party/unicode-segmentation-1.13.3/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/unicode-segmentation-1.13.3/LICENSE-MIT) |
| [url 2.5.8](https://crates.io/crates/url/2.5.8) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/url-2.5.8/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/url-2.5.8/LICENSE-MIT) |
| [urlpattern 0.6.0](https://crates.io/crates/urlpattern/0.6.0) | MIT | [LICENSE](docs/third-party/urlpattern-0.6.0/LICENSE) |
| [utf8_iter 1.0.4](https://crates.io/crates/utf8_iter/1.0.4) | Apache-2.0 OR MIT | [COPYRIGHT](docs/third-party/utf8_iter-1.0.4/COPYRIGHT) · [LICENSE-APACHE](docs/third-party/utf8_iter-1.0.4/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/utf8_iter-1.0.4/LICENSE-MIT) |
| [uuid 1.29.0](https://crates.io/crates/uuid/1.29.0) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/uuid-1.29.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/uuid-1.29.0/LICENSE-MIT) |
| [version_check 0.9.5](https://crates.io/crates/version_check/0.9.5) | MIT/Apache-2.0 | [LICENSE-APACHE](docs/third-party/version_check-0.9.5/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/version_check-0.9.5/LICENSE-MIT) |
| [vswhom 0.1.0](https://crates.io/crates/vswhom/0.1.0) | MIT | [LICENSE](docs/third-party/vswhom-0.1.0/LICENSE) |
| [vswhom-sys 0.1.3](https://crates.io/crates/vswhom-sys/0.1.3) | MIT | [LICENSE](docs/third-party/vswhom-sys-0.1.3/LICENSE) |
| [walkdir 2.5.0](https://crates.io/crates/walkdir/2.5.0) | Unlicense/MIT | [COPYING](docs/third-party/walkdir-2.5.0/COPYING) · [LICENSE-MIT](docs/third-party/walkdir-2.5.0/LICENSE-MIT) · [UNLICENSE](docs/third-party/walkdir-2.5.0/UNLICENSE) |
| [web-time 1.1.0](https://crates.io/crates/web-time/1.1.0) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/web-time-1.1.0/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/web-time-1.1.0/LICENSE-MIT) |
| [web_atoms 0.2.6](https://crates.io/crates/web_atoms/0.2.6) | MIT OR Apache-2.0 | [LICENSE-APACHE](docs/third-party/web_atoms-0.2.6/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/web_atoms-0.2.6/LICENSE-MIT) |
| [webview2-com 0.39.1](https://crates.io/crates/webview2-com/0.39.1) | MIT | [LICENSE](docs/third-party/webview2-com-0.39.1/LICENSE) |
| [webview2-com-macros 0.8.1](https://crates.io/crates/webview2-com-macros/0.8.1) | MIT | [LICENSE](docs/third-party/webview2-com-macros-0.8.1/LICENSE) |
| [webview2-com-sys 0.39.1](https://crates.io/crates/webview2-com-sys/0.39.1) | MIT | [LICENSE](docs/third-party/webview2-com-sys-0.39.1/LICENSE) |
| [winapi-util 0.1.11](https://crates.io/crates/winapi-util/0.1.11) | Unlicense OR MIT | [COPYING](docs/third-party/winapi-util-0.1.11/COPYING) · [LICENSE-MIT](docs/third-party/winapi-util-0.1.11/LICENSE-MIT) · [UNLICENSE](docs/third-party/winapi-util-0.1.11/UNLICENSE) |
| [window-vibrancy 0.8.1](https://crates.io/crates/window-vibrancy/0.8.1) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/window-vibrancy-0.8.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/window-vibrancy-0.8.1/LICENSE-MIT) · [LICENSE.spdx](docs/third-party/window-vibrancy-0.8.1/LICENSE.spdx) |
| [windows 0.62.2](https://crates.io/crates/windows/0.62.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-0.62.2/license-apache-2.0) · [license-mit](docs/third-party/windows-0.62.2/license-mit) |
| [windows-collections 0.3.2](https://crates.io/crates/windows-collections/0.3.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-collections-0.3.2/license-apache-2.0) · [license-mit](docs/third-party/windows-collections-0.3.2/license-mit) |
| [windows-core 0.62.2](https://crates.io/crates/windows-core/0.62.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-core-0.62.2/license-apache-2.0) · [license-mit](docs/third-party/windows-core-0.62.2/license-mit) |
| [windows-future 0.3.2](https://crates.io/crates/windows-future/0.3.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-future-0.3.2/license-apache-2.0) · [license-mit](docs/third-party/windows-future-0.3.2/license-mit) |
| [windows-implement 0.60.2](https://crates.io/crates/windows-implement/0.60.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-implement-0.60.2/license-apache-2.0) · [license-mit](docs/third-party/windows-implement-0.60.2/license-mit) |
| [windows-interface 0.59.3](https://crates.io/crates/windows-interface/0.59.3) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-interface-0.59.3/license-apache-2.0) · [license-mit](docs/third-party/windows-interface-0.59.3/license-mit) |
| [windows-link 0.2.1](https://crates.io/crates/windows-link/0.2.1) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-link-0.2.1/license-apache-2.0) · [license-mit](docs/third-party/windows-link-0.2.1/license-mit) |
| [windows-numerics 0.3.1](https://crates.io/crates/windows-numerics/0.3.1) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-numerics-0.3.1/license-apache-2.0) · [license-mit](docs/third-party/windows-numerics-0.3.1/license-mit) |
| [windows-result 0.4.1](https://crates.io/crates/windows-result/0.4.1) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-result-0.4.1/license-apache-2.0) · [license-mit](docs/third-party/windows-result-0.4.1/license-mit) |
| [windows-strings 0.5.1](https://crates.io/crates/windows-strings/0.5.1) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-strings-0.5.1/license-apache-2.0) · [license-mit](docs/third-party/windows-strings-0.5.1/license-mit) |
| [windows-sys 0.59.0](https://crates.io/crates/windows-sys/0.59.0) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-sys-0.59.0/license-apache-2.0) · [license-mit](docs/third-party/windows-sys-0.59.0/license-mit) |
| [windows-sys 0.61.2](https://crates.io/crates/windows-sys/0.61.2) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-sys-0.61.2/license-apache-2.0) · [license-mit](docs/third-party/windows-sys-0.61.2/license-mit) |
| [windows-targets 0.52.6](https://crates.io/crates/windows-targets/0.52.6) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-targets-0.52.6/license-apache-2.0) · [license-mit](docs/third-party/windows-targets-0.52.6/license-mit) |
| [windows-threading 0.2.1](https://crates.io/crates/windows-threading/0.2.1) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-threading-0.2.1/license-apache-2.0) · [license-mit](docs/third-party/windows-threading-0.2.1/license-mit) |
| [windows-version 0.1.7](https://crates.io/crates/windows-version/0.1.7) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows-version-0.1.7/license-apache-2.0) · [license-mit](docs/third-party/windows-version-0.1.7/license-mit) |
| [windows_x86_64_msvc 0.52.6](https://crates.io/crates/windows_x86_64_msvc/0.52.6) | MIT OR Apache-2.0 | [license-apache-2.0](docs/third-party/windows_x86_64_msvc-0.52.6/license-apache-2.0) · [license-mit](docs/third-party/windows_x86_64_msvc-0.52.6/license-mit) |
| [winnow 1.0.4](https://crates.io/crates/winnow/1.0.4) | MIT | [LICENSE-MIT](docs/third-party/winnow-1.0.4/LICENSE-MIT) |
| [winreg 0.56.0](https://crates.io/crates/winreg/0.56.0) | MIT | [LICENSE](docs/third-party/winreg-0.56.0/LICENSE) |
| [writeable 0.6.4](https://crates.io/crates/writeable/0.6.4) | Unicode-3.0 | [LICENSE](docs/third-party/writeable-0.6.4/LICENSE) |
| [wry 0.57.1](https://crates.io/crates/wry/0.57.1) | Apache-2.0 OR MIT | [LICENSE-APACHE](docs/third-party/wry-0.57.1/LICENSE-APACHE) · [LICENSE-MIT](docs/third-party/wry-0.57.1/LICENSE-MIT) · [LICENSE.spdx](docs/third-party/wry-0.57.1/LICENSE.spdx) |
| [yoke 0.8.4](https://crates.io/crates/yoke/0.8.4) | Unicode-3.0 | [LICENSE](docs/third-party/yoke-0.8.4/LICENSE) |
| [yoke-derive 0.8.4](https://crates.io/crates/yoke-derive/0.8.4) | Unicode-3.0 | [LICENSE](docs/third-party/yoke-derive-0.8.4/LICENSE) |
| [zerofrom 0.1.8](https://crates.io/crates/zerofrom/0.1.8) | Unicode-3.0 | [LICENSE](docs/third-party/zerofrom-0.1.8/LICENSE) |
| [zerofrom-derive 0.1.8](https://crates.io/crates/zerofrom-derive/0.1.8) | Unicode-3.0 | [LICENSE](docs/third-party/zerofrom-derive-0.1.8/LICENSE) |
| [zerotrie 0.2.5](https://crates.io/crates/zerotrie/0.2.5) | Unicode-3.0 | [LICENSE](docs/third-party/zerotrie-0.2.5/LICENSE) |
| [zerovec 0.11.9](https://crates.io/crates/zerovec/0.11.9) | Unicode-3.0 | [LICENSE](docs/third-party/zerovec-0.11.9/LICENSE) |
| [zerovec-derive 0.11.7](https://crates.io/crates/zerovec-derive/0.11.7) | Unicode-3.0 | [LICENSE](docs/third-party/zerovec-derive-0.11.7/LICENSE) |
| [zip 2.6.1](https://crates.io/crates/zip/2.6.1) | MIT | [LICENSE](docs/third-party/zip-2.6.1/LICENSE) |
| [zlib-rs 0.6.8](https://crates.io/crates/zlib-rs/0.6.8) | Zlib | [LICENSE](docs/third-party/zlib-rs-0.6.8/LICENSE) |
| [zmij 1.0.23](https://crates.io/crates/zmij/1.0.23) | MIT | [LICENSE-MIT](docs/third-party/zmij-1.0.23/LICENSE-MIT) |
| [zopfli 0.8.4](https://crates.io/crates/zopfli/0.8.4) | Apache-2.0 | [COPYING](docs/third-party/zopfli-0.8.4/COPYING) |
