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
}

function svgToKml(svgFilePath, kmlFilePath) {
    const svgData = fs.readFileSync(svgFilePath, 'utf8');
    const doc = new DOMParser().parseFromString(svgData, 'text/xml');
    const polylines = doc.getElementsByTagName('polyline');
    
    let kmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kmlContent += '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n';
    
    for (let i = 0; i < polylines.length; i++) {
        let points = polylines[i].getAttribute('points').trim().split(' ').map(coord => {
            let [x, y] = coord.split(',').map(Number);
            return `${x / 10},${y / -10},0`;
        }).join(' ');
        
        kmlContent += '<Placemark>\n<LineString>\n<coordinates>' + points + '</coordinates>\n</LineString>\n</Placemark>\n';
    }
    kmlContent += '</Document>\n</kml>';
    
    fs.writeFileSync(kmlFilePath, kmlContent, 'utf8');
}

// Example usage:
kmlToSvg('barreiras.kml', 'barreiras.svg');
// kmlToSvg('rios.kml', 'rios.svg');
// kmlToSvg('rios.kml', 'rios.svg');
// svgToKml('output.svg', 'converted.kml');
