# TempoFlex

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
* Click "Load unpacked"
* Pick the "dist" folder

## Usage

* Right click the extension
* Pick "Options"
* Set your Jira URL and your Jira username
* Click the extension to see your over/under

## Oddities

Tempo starts the day with every user being behind by 7½ hours (or your configured daily work hours). TempoFlex adapts to this by ignoring today's hours if today is a working day. If it's a UK Bank Holiday, or a weekend, it'll continue to count today's hours (although you probably should take a break...)
 
## Acknowledgements

[Tempo}(https://www.tempo.io/jira-project-management-tool) is a Jira plugin for recording time, among many other things. The Tempo name is theirs, and I'm in no way affiliated - I just made a tool that I found useful.

Icon made by Freepik from [www.flaticon.com](https://www.flaticon.com/free-icon/man-flexing-legs_76886)
