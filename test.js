//Using turf library or
//Using Ray-casting algorithm or 
//below
function check(pois, polygon) {
    for (let i = 0; i < pois.length; i++) {
        let point = pois[i];
        pointInPolygon(point, polygon)
    }
}
pointInPolygon = function (point, polygon) {
    console.log(point.coordinates)
    let x = point.coordinates[0]

    let y = point.coordinates[1]
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
    return inside
}
let point = { id: 1, coordinates: [1, 2] }
let polygon = [[0, 0], [0, 3], [1, 4], [0, 2]]
console.log(pointInPolygon(point, polygon))

