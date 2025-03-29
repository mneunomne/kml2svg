const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');

let width = 1000;
let height = 1000;

let minLat = -22.40520000; //-22.40732500;
let maxLat = -22.32638056; //-22.32425556;
let diffLat = maxLat - minLat;
let minLng = -43.10237778; //-43.10468333;
let maxLng = -43.01715833; //-43.01486111;
let diffLng = maxLng - minLng;

function kmlToSvg(kmlFilePath, svgFilePath) {
    const kmlData = fs.readFileSync(kmlFilePath, 'utf8');
    const doc = new DOMParser().parseFromString(kmlData, 'text/xml');
    const coordinates = doc.getElementsByTagName('coordinates');  
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
    for (let i = 0; i < coordinates.length; i++) {
        let points = coordinates[i].textContent.trim().split(' ').map(coord => {
            let [lng, lat] = coord.split(',').map(Number);
            return `${width -(  (maxLng - lng) / diffLat ) * width},${ ((maxLat - lat) / diffLng) * height}`;
        }).join(' ');
        
        svgContent += `<polyline points="${points}" stroke="black" fill="none" />`;
    }
    svgContent += '</svg>';
    
    fs.writeFileSync(svgFilePath, svgContent, 'utf8');

    // convert back with values to check if it is correct parsing svgContent
    const svgData = fs.readFileSync(svgFilePath, 'utf8');
    const doc2 = new DOMParser().parseFromString(svgContent, 'text/xml');
    const paths = doc2.getElementsByTagName('polyline');
    console.log("paths: ", paths);
    for (let i = 0; i < paths.length; i++) {
        let points = paths[i].getAttribute('points').split(' ').map(coord => {
            let [x, y] = coord.split(',').map(Number);
            console.log("x: ", (width - x) / width, "y: ", y);
            let lat = maxLat - (y / height) * diffLat;
            let lng = maxLng - ((width - x) / width) * diffLng;
            return `${lng},${lat}`;
        }).join(' ');
    }
    

}

function svgToKml(svgFilePath, kmlFilePath) {
    const svgData = fs.readFileSync(svgFilePath, 'utf8');
    const doc = new DOMParser().parseFromString(svgData, 'text/xml');
    const paths = doc.getElementsByTagName('path');
    
    let kmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kmlContent += '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n';
    
    for (let i = 0; i < paths.length; i++) {
        let points = paths[i].getAttribute('d').replace('M', '').trim().split('L').map(coord => {

            let [x, y] = coord.split(' ').map(Number);
            console.log("x: ", (width - x) / width, "y: ", y);
            let lat = maxLat - (y / height) * diffLat;
            let lng = maxLng - ((width - x) / width) * diffLng;
            return `${lng},${lat}`;
        }).join(' ');
        
        kmlContent += '<Placemark>\n<LineString>\n<coordinates>' + points + '</coordinates>\n</LineString>\n</Placemark>\n';
    }
    kmlContent += '</Document>\n</kml>';
    
    fs.writeFileSync(kmlFilePath, kmlContent, 'utf8');
}

// Example usage:
//kmlToSvg('barreiras.kml', 'barreiras.svg');
// kmlToSvg('escritas.kml', 'rios.svg');
// kmlToSvg('rios.kml', 'rios.svg');
svgToKml('output 3.svg', 'converted3.kml');
