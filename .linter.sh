#!/bin/bash
cd /home/kavia/workspace/code-generation/githubinsight-107160-59b1c99f/github_insight
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

