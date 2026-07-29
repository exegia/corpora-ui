#!/usr/bin/env bash
#
# One-time reconciliation: make `main` an ancestor of `next`.
#
# WHY THIS EXISTS
#
# Under the cherry-pick promotion model, `main` was built from copies of commits that
# live on `dev`/`next` under different SHAs. The two branches drifted until they shared
# nothing:
#
#     $ git merge-base main next
#     d1d86a7          # the repository's Initial commit
#
# Every ancestry question the release tooling asks — "is this tag released?", "is this
# commit already on main?" — returned a useless answer, and the tooling compensated with
# patch-id heuristics that squash merges defeat. The linear model replaces all of that,
# but it only works once `main` is genuinely an ancestor of `next`.
#
# WHAT THIS DOES
#
# Records `main` as a second parent of `next` while keeping `next`'s tree byte-for-byte.
# Nothing is rewritten, no tag moves, nothing is force-pushed, and `main` is not touched.
# The published v0.1.0 tag stays exactly where it is.
#
# `-s ours` is deliberate: it takes `next`'s tree wholesale rather than merging content.
# At the time of writing the two trees are already identical (verify below), so this
# records the ancestry link and changes no file.
#
# AFTER RUNNING
#
#     git merge-base --is-ancestor main next   # → true
#
# and every downstream question resolves correctly:
#   · latest_released_tag()  → v0.1.0   (it is an ancestor of main)
#   · open_release_tag()     → empty    (nothing unpromoted on next)
#   · next → main            → fast-forwardable
#
# RUN IT ONCE, BY HAND, ON A QUIET REPOSITORY. It is not wired into CI on purpose.

set -euo pipefail

REMOTE="${REMOTE:-origin}"

git fetch --force "$REMOTE" \
  '+refs/heads/*:refs/remotes/'"$REMOTE"'/*' \
  '+refs/tags/*:refs/tags/*'

main_sha="$(git rev-parse "$REMOTE/main")"
next_sha="$(git rev-parse "$REMOTE/next")"

echo "main: $main_sha"
echo "next: $next_sha"

if git merge-base --is-ancestor "$main_sha" "$next_sha"; then
  echo "✓ main is already an ancestor of next — nothing to reconcile."
  exit 0
fi

# Guard: the bridge is only safe to record blind when the trees already agree. If they
# have diverged, the -s ours merge would silently discard main-only content, so stop and
# make the operator look at the difference first.
if ! git diff --quiet "$main_sha" "$next_sha"; then
  echo "✗ main and next have different trees:" >&2
  git diff --stat "$main_sha" "$next_sha" >&2
  echo >&2
  echo "Reconcile the content by hand before recording the ancestry bridge." >&2
  exit 1
fi

echo "✓ trees are identical — recording the ancestry bridge"

git checkout -B next "$next_sha"
git merge -s ours --no-ff "$main_sha" \
  -m "chore: reconcile main into next (ancestry bridge)" \
  -m "Records main as a parent of next so the two branches share history again.

next's tree is unchanged — -s ours keeps it wholesale, and the trees were verified
identical before this ran. No history was rewritten and no tag moved.

This restores the invariant the linear release model depends on: main is an
ancestor of next, so promotion is a fast-forward and every --is-ancestor question
about what has shipped returns a real answer."

echo
echo "Bridge commit: $(git rev-parse HEAD)"
git --no-pager log --oneline --graph -3

echo
echo "Review the above, then push:"
echo "    git push $REMOTE next"
