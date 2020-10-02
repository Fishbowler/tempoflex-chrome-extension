# TempoFlex

[![Build](https://github.com/Fishbowler/tempoflex-chrome-extension/workflows/CI/badge.svg?branch=master)](https://github.com/Fishbowler/tempoflex-chrome-extension/actions?query=workflow%3A%22CI%22+branch%3Amaster)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Fishbowler/tempoflex-chrome-extension.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Fishbowler/tempoflex-chrome-extension/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Fishbowler/tempoflex-chrome-extension.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Fishbowler/tempoflex-chrome-extension/context:javascript)
[![Coverage Status](https://coveralls.io/repos/github/Fishbowler/tempoflex-chrome-extension/badge.svg?branch=master)](https://coveralls.io/github/Fishbowler/tempoflex-chrome-extension?branch=master)

Chrome extension. Get the time spent over/under what Tempo says you should have worked, for flexible working environments.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ldinkknlmjkoigpniidlffboenkecgbp)](https://chrome.google.com/webstore/detail/tempoflex/ldinkknlmjkoigpniidlffboenkecgbp)

## Why this exists

Short version: I needed this.

Long version: Many software houses use Jira. Many people use Tempo in Jira to track time, especially if it's a consultancy and you need to bill that time to someone! Some workplaces have flexible working arrangements. If you have flexible working hours, TempoFlex can let you know how much time you have worked above/below what you should have worked (according to your Tempo Administrator).

You _should_ be able to get this through the Tempo UI, but there's a few problems. For starters, before you started work today you were already behind by the number of hours you should work by the end of the day. Next, if you book time in the future (e.g. you have holiday tomorrow and want your timesheet up to date for reporting), then Tempo classes this as work done, and so you're reported as ahead, but that doesn't actually mean you can take the afternoon off. Tempo bundles everything into Periods, which means if you have a busy Jan 31st and work a couple of extra hours, Tempo shows you as "balanced" on Feb 1st (unless you dig into older periods which shows you were up on a previous period, but never reconciles).

## Developing

Building the extension

```sh
npm install
npm run build
```

## Installing

### From Chrome Web Store

Visit <https://chrome.google.com/webstore/detail/tempoflex/ldinkknlmjkoigpniidlffboenkecgbp>

### Development

* Build the extension (above)
* Visit chrome://extensions in Chrome
* Enable "Developer Mode" (in the top right)
* Click "Load unpacked" and navigate to the extension folder (that's the "dist" subfolder if you've built from source)

### From a Github release

As above, but download & unzip "TempoFlex-x.x.x.zip" from the [latest release](https://github.com/Fishbowler/tempoflex-chrome-extension/releases/latest)

## Usage

* Right click the extension
* Pick "Options"
* Set your Jira URL and your Jira username
* Click the extension to see your over/under

## Oddities

Tempo starts the day with every user being behind by 7½ hours (or your configured daily work hours). TempoFlex adapts to this by ignoring today's hours if today is a working day, up to the configured work hours. This means that if it's a UK Bank Holiday, or a weekend, it'll count all of today's hours since the "configured" amount should be 0 (so you probably should take a break...)

## Acknowledgements

[Tempo](https://www.tempo.io/jira-project-management-tool) is a Jira plugin for recording time, among many other things. The Tempo name is theirs, and I'm in no way affiliated - I just made a tool that I found useful.

Icon made by Freepik from [www.flaticon.com](https://www.flaticon.com/free-icon/man-flexing-legs_76886)
