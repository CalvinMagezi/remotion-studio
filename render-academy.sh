#!/usr/bin/env bash
# render-academy.sh — Render all 100 Kolaborate Academy videos and organise into folders
# Usage: bash render-academy.sh [SERIES_START] [SERIES_END]
# Default: renders all series 02–21
set -euo pipefail

START=${1:-2}
END=${2:-21}

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/out"

folder_name() {
  case "$1" in
    2)  echo "02 - Git & Version Control" ;;
    3)  echo "03 - APIs & REST" ;;
    4)  echo "04 - TypeScript" ;;
    5)  echo "05 - React Fundamentals" ;;
    6)  echo "06 - Next.js" ;;
    7)  echo "07 - Node.js & Express" ;;
    8)  echo "08 - Databases" ;;
    9)  echo "09 - Docker" ;;
    10) echo "10 - Auth & Security" ;;
    11) echo "11 - Cloud Computing" ;;
    12) echo "12 - CI CD Pipelines" ;;
    13) echo "13 - Linux for Developers" ;;
    14) echo "14 - Web Performance" ;;
    15) echo "15 - Python for Developers" ;;
    16) echo "16 - Machine Learning" ;;
    17) echo "17 - Prompt Engineering" ;;
    18) echo "18 - Land Your First Dev Job" ;;
    19) echo "19 - Freelancing as a Developer" ;;
    20) echo "20 - Agile & Scrum" ;;
    21) echo "21 - UI UX for Developers" ;;
  esac
}

series_ids() {
  case "$1" in
    2)  echo "git-ep1,git-ep2,git-ep3,git-ep4,git-ep5" ;;
    3)  echo "api-ep1,api-ep2,api-ep3,api-ep4,api-ep5" ;;
    4)  echo "ts-ep1,ts-ep2,ts-ep3,ts-ep4,ts-ep5" ;;
    5)  echo "react-ep1,react-ep2,react-ep3,react-ep4,react-ep5" ;;
    6)  echo "nextjs2-ep1,nextjs2-ep2,nextjs2-ep3,nextjs2-ep4,nextjs2-ep5" ;;
    7)  echo "nodejs-ep1,nodejs-ep2,nodejs-ep3,nodejs-ep4,nodejs-ep5" ;;
    8)  echo "db-ep1,db-ep2,db-ep3,db-ep4,db-ep5" ;;
    9)  echo "docker-ep1,docker-ep2,docker-ep3,docker-ep4,docker-ep5" ;;
    10) echo "auth-ep1,auth-ep2,auth-ep3,auth-ep4,auth-ep5" ;;
    11) echo "cloud-ep1,cloud-ep2,cloud-ep3,cloud-ep4,cloud-ep5" ;;
    12) echo "cicd2-ep1,cicd2-ep2,cicd2-ep3,cicd2-ep4,cicd2-ep5" ;;
    13) echo "linux-ep1,linux-ep2,linux-ep3,linux-ep4,linux-ep5" ;;
    14) echo "webperf-ep1,webperf-ep2,webperf-ep3,webperf-ep4,webperf-ep5" ;;
    15) echo "python-ep1,python-ep2,python-ep3,python-ep4,python-ep5" ;;
    16) echo "ml-ep1,ml-ep2,ml-ep3,ml-ep4,ml-ep5" ;;
    17) echo "prompt-ep1,prompt-ep2,prompt-ep3,prompt-ep4,prompt-ep5" ;;
    18) echo "devjob-ep1,devjob-ep2,devjob-ep3,devjob-ep4,devjob-ep5" ;;
    19) echo "freelance-ep1,freelance-ep2,freelance-ep3,freelance-ep4,freelance-ep5" ;;
    20) echo "agile-ep1,agile-ep2,agile-ep3,agile-ep4,agile-ep5" ;;
    21) echo "uiux-ep1,uiux-ep2,uiux-ep3,uiux-ep4,uiux-ep5" ;;
  esac
}

series_names() {
  case "$1" in
    2)  echo "01 - What is Git.mp4,02 - Git Branching.mp4,03 - Pull Requests.mp4,04 - GitHub & Remotes.mp4,05 - Git Best Practices.mp4" ;;
    3)  echo "01 - What is an API.mp4,02 - HTTP Methods.mp4,03 - JSON & Data.mp4,04 - API Authentication.mp4,05 - API Best Practices.mp4" ;;
    4)  echo "01 - JS vs TypeScript.mp4,02 - Types & Interfaces.mp4,03 - Generics.mp4,04 - Type Safety in Practice.mp4,05 - TypeScript in React.mp4" ;;
    5)  echo "01 - What is React.mp4,02 - Props & State.mp4,03 - React Hooks.mp4,04 - useEffect Deep Dive.mp4,05 - Build Your First App.mp4" ;;
    6)  echo "01 - What is Nextjs.mp4,02 - Pages vs App Router.mp4,03 - Server Components.mp4,04 - Data Fetching.mp4,05 - Deploying Nextjs.mp4" ;;
    7)  echo "01 - What is Nodejs.mp4,02 - Build a Server.mp4,03 - Express Routing.mp4,04 - Middleware.mp4,05 - REST API.mp4" ;;
    8)  echo "01 - SQL vs NoSQL.mp4,02 - SQL Queries.mp4,03 - Database Relations.mp4,04 - Indexes & Performance.mp4,05 - Choosing Your Database.mp4" ;;
    9)  echo "01 - What is Docker.mp4,02 - Dockerfiles.mp4,03 - Images & Containers.mp4,04 - Volumes & Networking.mp4,05 - Docker Compose.mp4" ;;
    10) echo "01 - Sessions vs Tokens.mp4,02 - JWT Deep Dive.mp4,03 - OAuth 2.mp4,04 - Password Security.mp4,05 - Preventing Attacks.mp4" ;;
    11) echo "01 - What is the Cloud.mp4,02 - AWS Fundamentals.mp4,03 - Storage & Compute.mp4,04 - Cloud Networking.mp4,05 - Cloud Cost Control.mp4" ;;
    12) echo "01 - What is CICD.mp4,02 - GitHub Actions.mp4,03 - Build & Test.mp4,04 - Deploy Automation.mp4,05 - Rollbacks & Monitoring.mp4" ;;
    13) echo "01 - The Terminal.mp4,02 - Linux File System.mp4,03 - Linux Permissions.mp4,04 - SSH & Remote Access.mp4,05 - Shell Scripting.mp4" ;;
    14) echo "01 - Core Web Vitals.mp4,02 - Caching Strategies.mp4,03 - Lazy Loading.mp4,04 - Code Splitting.mp4,05 - Performance Profiling.mp4" ;;
    15) echo "01 - Python Basics.mp4,02 - Functions & OOP.mp4,03 - Key Libraries.mp4,04 - File & API Handling.mp4,05 - Build a Script.mp4" ;;
    16) echo "01 - What is ML.mp4,02 - Supervised vs Unsupervised.mp4,03 - Training a Model.mp4,04 - Model Evaluation.mp4,05 - ML in Production.mp4" ;;
    17) echo "01 - What is a Prompt.mp4,02 - Roles & Context.mp4,03 - Chain of Thought.mp4,04 - Few-Shot Prompting.mp4,05 - AI in Products.mp4" ;;
    18) echo "01 - Build a Portfolio.mp4,02 - Writing Your CV.mp4,03 - GitHub Profile.mp4,04 - The Tech Interview.mp4,05 - Salary Negotiation.mp4" ;;
    19) echo "01 - Finding Clients.mp4,02 - Pricing Your Work.mp4,03 - Freelance Contracts.mp4,04 - Delivering Projects.mp4,05 - Scaling Up.mp4" ;;
    20) echo "01 - What is Agile.mp4,02 - Sprints & Velocity.mp4,03 - Agile Ceremonies.mp4,04 - User Stories.mp4,05 - Retrospectives.mp4" ;;
    21) echo "01 - Design Principles.mp4,02 - Figma Basics.mp4,03 - Colour & Typography.mp4,04 - Accessibility.mp4,05 - Dev Handoff.mp4" ;;
  esac
}

total=0
success=0
failed=0

for s in $(seq "$START" "$END"); do
  FOLDER_PATH="$OUT/$(folder_name $s)"
  mkdir -p "$FOLDER_PATH"

  IFS=',' read -ra comp_ids  <<< "$(series_ids $s)"
  IFS=',' read -ra out_names <<< "$(series_names $s)"

  for i in 0 1 2 3 4; do
    comp="${comp_ids[$i]}"
    name="${out_names[$i]}"
    dest="$FOLDER_PATH/$name"
    total=$((total+1))

    if [[ -f "$dest" ]]; then
      echo "SKIP  [$s/21 ep$((i+1))] $name (already exists)"
      success=$((success+1))
      continue
    fi

    echo "RENDER [$s/21 ep$((i+1))] $comp -> $name"
    tmp="$OUT/${comp}.mp4"
    if npx remotion render "$comp" "$tmp" --bundle-cache=false 2>&1; then
      mv "$tmp" "$dest"
      echo "DONE   $name"
      success=$((success+1))
    else
      echo "FAILED $comp"
      failed=$((failed+1))
    fi
  done

  echo "-- Series $(folder_name $s) complete --"
done

echo ""
echo "==========================================="
echo " Render complete: $success/$total OK, $failed failed"
echo "==========================================="
