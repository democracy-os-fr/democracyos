#!/bin/bash

export NODE_PATH=.
yes | ./bin/dos-db $* drop
./bin/dos-db $* load rules data/rules-roles.json
./bin/dos-db $* load rules data/rules-activities.json
./bin/dos-db $* load rules data/rules-locations.json
./bin/dos-db $* load user data/users.json
./bin/dos-db $* load tag data/tags.json
./bin/dos-db $* load topic data/topics.json
