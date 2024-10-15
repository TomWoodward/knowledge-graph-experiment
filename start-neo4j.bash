#!/usr/bin/env bash
# spell-checker: ignore pipefail SIGINT
set -euo pipefail; if [ -n "${DEBUG-}" ]; then set -x; fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

docker run -d \
  --name neo4j \
  --restart always \
  --publish=7474:7474 --publish=7687:7687 \
  --env NEO4J_AUTH=none \
  --volume="$project_dir/db:/data" \
  --volume="$project_dir/data:/import" \
  neo4j
