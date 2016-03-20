#!/usr/bin/env bash
file_name="$(date -d'yesterday' +\%F).zip"
zip  /var/log/flaper/view/${file_name} /var/log/flaper/view/view.log -j && rm /var/log/flaper/view/view.log
/usr/local/bin/aws s3 cp /var/log/flaper/view/${file_name} s3://flaper.views/logs/${file_name}
