# Cuisine journey map

`cuisine-world.json` is projected, rounded vector geometry derived from Natural Earth's public-domain 1:110m country boundaries. It is served locally, without map tiles, tracking, API keys or runtime requests to a map provider.

Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson

Terms: https://www.naturalearthdata.com/about/terms-of-use/

To rebuild: download the source GeoJSON, then run `node scripts/build-cuisine-map.mjs path/to/countries.geojson`. The output includes the source SHA-256. Projection is equirectangular, with Antarctica omitted. Region membership follows the source's continent field; Ethiopia is highlighted separately. The illustration represents cuisine destinations, not ingredient sourcing or restaurant locations.
