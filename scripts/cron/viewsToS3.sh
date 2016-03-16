#!/usr/bin/env bash
zip  /var/log/flaper/view/`date +\%F`.zip /var/log/flaper/view/view.log && rm /var/log/flaper/view/view.log
aws s3 cp /var/log/flaper/view/`date +\%F`.zip s3://flaper.views/logs/
