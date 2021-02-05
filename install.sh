#!/usr/bin/env bash

die() {
    echo "$1"
    exit 1
}

# requirements
type node &>/dev/null || die 'Error: Node.js not found'
type npm &>/dev/null || die 'Error: npm not found'

# cd
cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null)" || die "Error: Installation failed (cd)"

# npm
npm i -only=prod &>/dev/null || die 'Error: Installation failed (npm)'

# .env
read -rp 'WaniKani Personal Access Token: ' wanikani_api_token
read -rp 'Gmail: ' mail_user
read -rsp 'Password (or App Password): ' mail_pass
echo

cat >.env <<EOF
WANIKANI_API_TOKEN=$wanikani_api_token
MAIL_USER=$mail_user
MAIL_PASS=$mail_pass
EOF
((!$?)) || die "Error: Installation failed (.env)"

# cron
read -rp 'Do you want to use cron? [Y/n] ' use_cron

if [[ ! $use_cron || ${use_cron,} == y ]]; then
    cron="@hourly cd $(pwd 2>/dev/null) && $(type -p node 2>/dev/null) index.mjs"
    crontab=$(crontab -l 2>/dev/null)
    if [[ $crontab != *$cron* ]]; then
        (
            [[ $crontab ]] && echo "$crontab"
            echo "$cron"
        ) | crontab || die 'Error: Installation failed (cron)'
    fi
fi
