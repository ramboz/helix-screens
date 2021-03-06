Helix Screens
=============

This project is a proof of concept on running an AEM Screens server on the Helix stack.
It's not meant to offer full feature parity, but should allow simple playback of sequence channels containing images and videos, and be fully compatible with the official AEM Screens players.


Prerequisites
------------

Being familiar with the [Project Helix](https://www.project-helix.io) concepts and at least having the Helix Cli installed:  
`npm install -g @adobe/helix-cli`

Installation
------------

1. Clone repo or download the sources
0. Run `npm install`
0. Run `hlx up`

Download a Screens player from http://download.macromedia.com/screens/

1. Start the player, and go to the configuration tab.
0. Set the server URL to the helix server (and port)
0. Set the device to the device name (i.e. `/content/screens/devices/foo` or just `foo`)


Content Structure
-----------------

### General Structure

- `content/screens`: the Screens devices, displays and channels
- `htdocs`: the static files (CSS/JS/Assets) in the project
- `libs/granite`: some mock files to skip authentication
- `src`: the Helix APIs for Screens


### Devices

Simple YAML file located in `/content/screens/devices/`.
Structure should follow:

```YAML
# The path to the display the device is supposed to show [required]
# display:

# The device ping frequency in seconds [optional=5]
# pingFrequency: 5

# The analytics configuration [optional]
# analytics:
#   analyticsURL:
#   analyticsAPIKey:
#   analyticsProject:
#   analyticsEnvironment:
#   analyticsSendFrequency:
```

### Displays

Simple YAML file located in `/content/screens/locations/`.
Structure should follow:

```YAML
# The display resolution [optional]
# resolution: 1920x1080

# The physical panel layout for that display [optional]
# layout:
#   numCols: 1
#   numRows: 1

# The timeout duration after which the display goes back to idle (in ms) [optional=300]
# idleTimeout: 300

# The list of channels assigned to the display [required]
# channels:
#   <role>: <channel properties>

#     The channel properties in the assignments above:
#   
#     The channel path [required]
#     path:
#
#     The priority [optional=1] (lower number means higher priority)
#     priority: 1
#
#     The events that are supported [optional] (lower number means higher priority)
#     events:
#       - load
#       - idle
#       - timer
#
#     The dayparting schedule [optional] (see https://bunkat.github.io/later/parsers.html)
#     schedule: 
#
#     The dayparting start date timestamp [optional]
#     startDate: 
#
#     The dayparting end date timestamp [optional]
#     endDate: 
```

### Channels

Simple mardown file located in `/content/screens/channels/`.
It needs a title and a list of assets to play.
Structure should follow:

```markdown
# Channel Title

- [](/assets/image1.jpeg)
- [](/assets/image2.jpeg)
- [](/assets/image3.jpeg)
```


Features
--------

:white_check_mark: Implemented:
- local image playback
- remote image playback
- local video playback
- remote video playback on youtube (no offline support)
- embedded channel
- offline caching for images and videos, and embedded channels

:notebook: On the roadmap:
- add support for video sources for local playback
- changing default playback duration for items
- add support for video sources for local playback
- SPA channel
- remote video playback via hulu/vimeo embeds
- asset-level scheduling
