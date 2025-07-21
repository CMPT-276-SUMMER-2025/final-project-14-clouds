import { useEffect, useState } from "react";
import { parseCSV } from "../translink/Utils"

// internal cache, prob not the best way to do this, but good enough for now
let stopCache = {};
let routeCache = {};

// cache all stop information
async function loadStops() {
  if (Object.keys(stopCache).length > 0) return;

  const res = await fetch("/translink_data/stops.txt");
  const text = await res.text();
  const parsed = parseCSV(text);

  parsed.forEach(stop => {
    stopCache[stop.stop_id] = {
      stop_id: stop.stop_id,
      stop_code: stop.stop_code,
      stop_name: stop.stop_name,
      stop_lat: parseFloat(stop.stop_lat),
      stop_lon: parseFloat(stop.stop_lon)
    };
  });
}

// cache all route information
async function loadRoutes() {
  if (Object.keys(routeCache).length > 0) return;

  const res = await fetch("/translink_data/routes.txt");
  const text = await res.text();
  const parsed = parseCSV(text);

  parsed.forEach(route => {
    routeCache[route.route_id] = {
      route_id: route.route_id,
      route_short_name: route.route_short_name,
      route_long_name: route.route_long_name
    };
  });
}

// cache both datasets in parallel
export async function preloadGTFSData() {
  await Promise.all([loadStops(), loadRoutes()]);
}

// for some reason, the bus stop ID is not what they use internally, so we need a helper function to convert the bus id (StopCode) to the internally used StopID
export function convertStopCodeToStopID(stopCode) {
  for (const stop of Object.values(stopCache)) {
    if (stop.stop_code === stopCode) return stop.stop_id;
  }
  return null;
}

// gets the bus stop name, eg 12000 (real bus stop id is 61857) -> "Southbound 190A St @ 119B Ave"
export function getStopName(stopID) {
  return stopCache[stopID]?.stop_name || null;
}

// returns the { lat, long } of bus stop, used for mapping
export function getStopLocation(stopID) {
  const stop = stopCache[stopID];
  return stop ? { lat: stop.stop_lat, lon: stop.stop_lon } : null;
}

// converts the bus names to the internally used bus names, eg 183 -> 30046
export function convertRouteShortNameToRouteID(shortName) {
  for (const route of Object.values(routeCache)) {
    if (route.route_short_name === shortName) return route.route_id;
  }
  return null;
}

// returns the bus name, eg 30046 (real bus id 183) -> Moody Centre Station/Coquitlam Central Station
export function getRouteLongName(routeID) {
  return routeCache[routeID]?.route_long_name || null;
}