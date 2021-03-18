mapboxgl.accessToken = 'pk.eyJ1IjoicGhpbHNlYXRvbiIsImEiOiJjamt0dndsZXAwOXA2M3BvenVzeDNuMGFtIn0.KVso4snCyjEG-9xmBvKaLA';

const m = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [-121.9120314, 37.3554002], // starting position [lng, lat]
    zoom: 13 // starting zoom
});

const mapPromise = new Promise((resolve, reject) => {
    m.on('load', function () {
        resolve(m);
    });
})

const ddlogo = fetch('https://gistcdn.githack.com/DronePhil/d70544e59f7e1fb2a61d7c5f27cc1b81/raw/88d038924d1a4740d1b11f714c78426ea46bc085/dd-logo.geo.json')
    .then((resp) => resp.json()) // Transform the data into json


const poi = fetch('https://gistcdn.githack.com/DronePhil/d70544e59f7e1fb2a61d7c5f27cc1b81/raw/88d038924d1a4740d1b11f714c78426ea46bc085/poi.geo.json')
    .then((resp) => resp.json())

Promise.all([ddlogo, poi, mapPromise]) //the call of fetch things, the data being put all together
    .then((datas) => {
        const [logo, points, map] = datas;
        console.log(logo);
        console.log(points);

        var pointsArr = Object.values(points).map(function (item) {
            return item;
        })
        //console.log(pointsArr[3]); //all the POIs // each one .geometry.coordinates[0][1]
        let actualPointsArr = pointsArr[3];
        var logoArr = Object.values(logo).map(function (logo) {
            return logo;
        })
        //below is the concat of two arrays for the polygon(not the outter circle)
        //console.log(logoArr[2][0].geometry.coordinates[0].concat(logoArr[2][0].geometry.coordinates[1])) // this array has two elements. both are arrays, first arr has two sub-array//
        let circle = logoArr[2][0].geometry.coordinates[0].concat(logoArr[2][0].geometry.coordinates[1]);
        let polygon = circle.concat(logoArr[2][1].geometry.coordinates[0]);

        let intersectedPOIs = Object.assign({}, points);
        let nonIntersectedPOIs = Object.assign({}, points);
        intersectedPOIs.features = []; //to empty existing array so we can push
        nonIntersectedPOIs.features = [];

        for (let n = 0; n < actualPointsArr.length; n++) {
            let point = actualPointsArr[n].geometry.coordinates; //[x,y] get one point
            let x = point[0]
            let y = point[1]
            let inside = false

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                let xi = polygon[i][0]
                let yi = polygon[i][1]
                let xj = polygon[j][0]
                let yj = polygon[j][1]
                let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
                if (intersect) inside = !inside
            }
            //console.log(inside)
            //console.log(actualPointsArr[n])
            if (inside) {
                intersectedPOIs.features.push(actualPointsArr[n]);
            } else {
                nonIntersectedPOIs.features.push(actualPointsArr[n]);
            }
        }

        // mapbox has trouble with the output of the geojson conversion
        logo.features[0].geometry.coordinates.reverse();

        map.addLayer({
            "id": "dd-logo",
            "type": "fill",
            "source": {
                "type": "geojson",
                "data": logo
            },
            'layout': {},
            'paint': {
                'fill-color': '#088',
                'fill-opacity': 0.8
            }
        });


        map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": intersectedPOIs
            },
            "layout": {
                "text-field": "*",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0],
                "text-anchor": "top"
            },
            "paint": {
                "text-color": "#FF0000"
            }
        })

        map.addLayer({
            "id": "nonIntersectedPoints",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": nonIntersectedPOIs
            },
            "layout": {
                "text-field": "*",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0],
                "text-anchor": "top"
            },
        })
    })
