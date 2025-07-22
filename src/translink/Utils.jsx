import { stopCache, routeCache } from './translinkStaticData'
import Fuse from 'fuse.js'

let searchCache = [];
let fuse = null;

// build the search cache combining stops and routes
function buildSearchCache() {
  // incase its already made, return
  if (searchCache.length > 0) return;
  
  // add all stops to search cache
  Object.values(stopCache).forEach(stop => {
    if (stop.stop_code) {
      searchCache.push({
        id: stop.stop_code,
        name: stop.stop_name,
        type: 'stop_code',
      });
    }
  });
  
  // add all routes to search cache
  Object.values(routeCache).forEach(route => {
    if (route.route_short_name) {
      searchCache.push({
        id: route.route_short_name,
        name: route.route_long_name,
        type: 'route_short_name',
      });
    }
  });
}

// cache dataset
export async function preloadCache() {
  await Promise.all([buildSearchCache()]);

  fuse = new Fuse(searchCache, {
    keys: ['id', 'name'],
    threshold: 0.3
  });
}

// basic csv parser
export function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",");

  return lines.map(line => {
    const values = line.split(",");
    const entry = {};
    headers.forEach((h, i) => entry[h] = values[i]);
    return entry;
  });
}

// helper function to get the best matches for a particular route_id or stop_id
export function searchStopsAndRoutes(searchTerm) {
  return fuse.search(searchTerm).slice(0, 5).map(result => result.item)
}