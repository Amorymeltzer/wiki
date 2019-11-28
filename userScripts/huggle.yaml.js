---
# // This is a configuration of huggle, do not change it unless you know what you are doing.
enable: true
# // Last version of huggle that wrote into this configuration file (sanity check)
version: "3.4.4 build: production build "
report-summary: "Added report for [[Special:Contributions/$1|$1]]"
confirm-multiple: false
confirm-talk: true
confirm-self-revert: true
confirm-whitelist: true
# // This option will change the behaviour of automatic resolution, be carefull
revert-on-multiple-edits: false
automatically-resolve-conflicts: true
software-rollback: true
history-load: true
on-next: 1
delete-edits-after-revert: true
skip-to-last-edit: true
preferred-provider: 2
remove-oldest-queue-edits: true
truncate-edits: true
talkpage-freshness: 20
remove-after-trusted-edit: true
# // Get original creator of every page so that you can G7 instead of reverting the page
retrieve-founder: false
display-title: false
# // Periodically check if you received new messages and display a notification box if you get them
check-tp: true
manual-warning: true
summary-mode: false
automatic-reports: false
# // HAN
han-html: false
han-display-user-talk: true
han-display-bots: true
han-display-user: true
watchlist: "unwatch"
# // Whether edits made by same user should be grouped up together in page
automatically-group: true
queue-id: "Custom"
# // Location of page (wiki page name, for example WP:Huggle) that should be displayed when you hit next and queue is empty. Leave empty for default page.
page-empty-queue: ""
enable-max-score: false
max-score: 0
enable-min-score: true
min-score: 20
automatic-refresh: true
automatically-watchlist-warned-users: false
shortcut-hash: "cc07d772525bc3cbaf9b2f36d8d4fc3f"
show-warning-if-not-on-last-revision: true
number-dropdown-menu-items: true
insert-edits-of-rolled-user-to-queue: true
# // If true you will not warn users who received a warning recently
confirm-on-recent-warning: true
# // If warning was sent less than N seconds ago it's considered too recent
recent-warning-time-span: 120
confirm-warning-on-very-old-edits: true
welcome-good: "false"
queues:
    "Custom":
        filter-ignored: "exclude"
        filter-bots: "exclude"
        filter-assisted: "exclude"
        filter-ip: "require"
        filter-minor: "ignore"
        filter-new-pages: "ignore"
        filter-me: "exclude"
        nsfilter-user: "exclude"
        filter-talk: "exclude"
        filter-watched: "ignore"
        filter-reverts: "ignore"
        ignored-tags: ""
        required-tags: ""
        ignored-categories: ""
        required-categories: ""
        filtered-ns: "-2,-1,1,2,3,4,5,6,108,109,118,119,446,447,"