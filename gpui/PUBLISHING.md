# Publishing the Rust library

The **GPUI crate** workflow is independent of the React/npm release lane. Only
`corpora-ui` publishes; the gallery package remains private.

## Gates

Pull requests into `dev`, changes on `dev`, and manual dry runs validate the
library on macOS. The workflow tests the source with the gallery renderer,
packages the library, and builds an independent consumer from the unpacked
archive twice: first with registry-only dependencies, then with the two
documented full-glass renderer overrides. It also rehearses `cargo publish`
without uploading and saves the `.crate` artifact.

The archive includes the crate README, source, runtime assets and license
notices. Gallery media and Agentation examples are not part of the archive.

## First release setup

1. Use a crates.io account authorized to own `corpora-ui`. The name was
   unregistered during preparation; this does not reserve it.
2. Add a crates.io publishing token as `CARGO_REGISTRY_TOKEN` in this GitHub
   repository's `crates-io` environment. The first release must have permission
   to create the crate; subsequent tokens can be restricted to this crate.
   Never put the token in source or workflow inputs.
3. Merge the publishing branch into `dev` and run **GPUI crate** manually with
   **publish disabled**. Inspect the successful consumer checks and artifact.

No release is created merely by merging into `dev`. No publishing credentials
are made available to pull-request checks.

## Publish a version

Update `[workspace.package].version` in `gpui/Cargo.toml` through a pull request
into `dev`. Keep the crate README's installation version current. After the
verification checks pass, create and push `gpui-vVERSION` at the merged commit.
For the initial release that is `gpui-v0.1.0`.

A pushed matching tag starts verification followed by publication. The workflow
rejects mismatched versions and commits outside `dev`. A manual publish also
requires selecting the matching tag and explicitly enabling **publish**.
Version tags are separate from the React `vVERSION` tags.

The publish command intentionally fails if that version already exists; do not
retag or overwrite an existing release. Verify the version on crates.io after
the publish job succeeds.

## Local verification

Requires Python 3.12+ and Rust 1.99.1+. From the repository root:

```sh
python3 gpui/scripts/package_check.py
```

Use `--allow-dirty` while editing. The script uses a temporary consumer workspace
outside this repository so Cargo cannot inherit the developer's patches. Its
full-glass consumer adds only the renderer overrides documented in the crate
README, deliberately omitting the optional caret patch. On non-macOS systems it
checks only the registry fallback.

The source gallery continues to enable full glass. See the [crate README](crates/corpora-ui/README.md)
for the downstream installation and macOS renderer setup.

References: [Cargo dependency overrides](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html),
[publishing a crate](https://doc.rust-lang.org/cargo/reference/publishing.html).
