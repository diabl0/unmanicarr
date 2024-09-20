# **UnmanicArr**

## Table of contents
- [Overview](#overview)
- [Dependencies & Hints & FAQ](#dependencies--hints--faq)
- [Getting started](#getting-started)
- [Explanation of the settings](#explanation-of-the-settings)
- [Disclaimer](#disclaimer)

## Overview

UnmanicArr is a small hook that automatically sends newly downloaded files from Sonarr and/or Radarr to Unmanic.
When using Unmanic over Samba or NFS, monitoring filesystem changes doesn't work. You need to use periodic library scans, which causes heavy load on the NAS server and introduces delays between downloading a file and processing it.
Unfortunately, Sonarr/Radarr doesn't support notifying Unmanic about new files directly, but there is a hook that allows us to automatically notify Unmanic, helping to reduce the need for periodic library scans.

## Dependencies & Hints & FAQ

* Use Sonarr v4 & Radarr v5, else certain features may not work correctly

## Getting started

```yaml
version: "3.3"
services:
  decluttarr:
    image: ghcr.io/diablo/unmanicarr:latest
    container_name: unmanicarr
    restart: always
    environment:
     UNMANIC_URL: "http://unmanic:8888/unmanic"

     SONARR_LIBRARY_ID: 1
     SONARR_MAPPING_FROM: "/data/Media/"
     SONARR_MAPPING_TO: "/media/"

     RADARR_LIBRARY_ID: 1
     RADARR_MAPPING_FROM: "/data/Media/"
     RADARR_MAPPING_TO: "/media/"

```

## Explanation of the Settings

`SONARR_LIBRARY_ID`
This is the Unmanic Library ID for Sonarr media

`SONARR_MAPPING_FROM` / `SONARR_MAPPING_TO`
These settings define the mapping of directories from Sonarr filesystem to Unmanic's filesystem.

`RADARR_LIBRARY_ID`
This is the Unmanic Library ID for Radarr media

`RADARR_MAPPING_FROM` / `RADARR_MAPPING_TO`
These settings define the mapping of directories from Radarr filesystem to Unmanic's filesystem.


## Disclaimer

This script comes free of any warranty, and you are using it at your own risk
