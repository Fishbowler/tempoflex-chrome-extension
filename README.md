# TempoFlex

[![CircleCI](https://circleci.com/gh/Fishbowler/tempoflex-chrome-extension.svg?style=svg)](https://circleci.com/gh/Fishbowler/tempoflex-chrome-extension)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Fishbowler/tempoflex-chrome-extension.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Fishbowler/tempoflex-chrome-extension/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Fishbowler/tempoflex-chrome-extension.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Fishbowler/tempoflex-chrome-extension/context:javascript)
[![Coverage Status](https://coveralls.io/repos/github/Fishbowler/tempoflex-chrome-extension/badge.svg?branch=master)](https://coveralls.io/github/Fishbowler/tempoflex-chrome-extension?branch=master)

Chrome extension. Get the time spent over/under what Tempo says you should have worked, for flexible working environments.

## Developing

Building the extension
```
npm install
gulp
```

## Installing

* Build the extension (above), or download & unzip "TempoFlex-x.x.x.zip" from the [latest release](https://github.com/Fishbowler/tempoflex-chrome-extension/releases/latest)
* Visit chrome://extensions in Chrome
* Enable "Developer Mode" (in the top right)
* Click "Load unpacked" and navigate to the extension folder (that's the "dist" subfolder if you've built from source)

## Usage

* Right click the extension
* Pick "Options"
* Set your Jira URL and your Jira username
* Click the extension to see your over/under

## Oddities

Tempo starts the day with every user being behind by 7½ hours (or your configured daily work hours). TempoFlex adapts to this by ignoring today's hours if today is a working day, up to the configured work hours. This means that if it's a UK Bank Holiday, or a weekend, it'll count all of today's hours since the "configured" amount should be 0 (so you probably should take a break...)
 
## Acknowledgements

[Tempo}(https://www.tempo.io/jira-project-management-tool) is a Jira plugin for recording time, among many other things. The Tempo name is theirs, and I'm in no way affiliated - I just made a tool that I found useful.

Icon made by Freepik from [www.flaticon.com](https://www.flaticon.com/free-icon/man-flexing-legs_76886)
