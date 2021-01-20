#!/usr/bin/env bash

# requirements
type node &>/dev/null || {
    echo 'Error: Node.js not found'
    exit 1
}
type npm &>/dev/null || {
    echo 'Error: npm not found'
    exit 1
}

# cd
cd "$(dirname "$0" 2>/dev/null)" || {
    echo "Error: Installation failed (cd)"
    exit 1
}

# npm
npm i -only=prod &>/dev/null || {
    echo 'Error: Installation failed (npm)'
    exit 1
}

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
[[ $? ]] || {
    echo "Error: Installation failed (.env)"
    exit 1
}

# cron
read -p 'Do you want to use cron? [Y/n] ' -r use_cron

[[ -z "$use_cron" || "$use_cron" == 'y' || "$use_cron" == 'Y' ]] && {
    cron="@hourly cd $(pwd 2>/dev/null) && $(type -p node) index.mjs"
    crontab=$(crontab -l 2>/dev/null)
    grep "$cron" <<<"$crontab" &>/dev/null || (
        [[ "$crontab" ]] && echo "$crontab"
        echo "$cron"
    ) | crontab || {
        echo 'Error: Installation failed (cron)'
        exit 1
    }

}
