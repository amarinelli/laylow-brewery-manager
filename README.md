# Laylow Brewery manager for Slack

## Update App Home items list in .env file
curl https://connect.squareup.com/v2/catalog/list?types=ITEM \
  -H 'Square-Version: 2021-05-13' \
  -H 'Authorization: Bearer xxxxxx' \
  -H 'Content-Type: application/json'

## Delpoy

```gcloud app deploy```
