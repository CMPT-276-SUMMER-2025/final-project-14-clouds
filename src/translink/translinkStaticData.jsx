import { useEffect, useState } from "react";
import { parseCSV } from "../translink/Utils"

// internal cache, prob not the best way to do this, but good enough for now
export let stopCache = {};
export let routeCache = {};
let stopTimesCache = [];
let tripsCache = {};

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

// cache all stop time information
async function loadStopTimes() {
  if (Object.keys(stopCache).length > 0) return;

  const res = await fetch("/translink_data/stop_times.txt");
  const text = await res.text();
  const parsed = parseCSV(text);

  parsed.forEach(stop => {
    stopTimesCache.push ({
      trip_id: stop.trip_id,
      arrival_time: stop.arrival_time,
      stop_id: stop.stop_id
    });
  });
}

// cache all trips information
async function loadTrips() {
  if (Object.keys(stopCache).length > 0) return;

  const res = await fetch("/translink_data/trips.txt");
  const text = await res.text();
  const parsed = parseCSV(text);

  parsed.forEach(trip => {
    tripsCache[trip.route_id] = {
      route_id: trip.route_id,
      trip_id: trip.trip_id
    };
  });
}

// helper function to be added later, if we only want future times to be returned
function isTimeInFuture(timeString) {
  return true;
}

// cache both datasets in parallel
export async function preloadGTFSData() {
  await Promise.all([loadStops(), loadRoutes(), loadStopTimes(), loadTrips()]);
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

// returns a list of all bus stops with their stop_code, stop_id, and stop_name, eg 61857 <- real bus stop code, 12000 <- internal bus stop id, "Southbound 190A St @ 119B Ave"
export function getAllStops() {
  return Object.values(stopCache).map(stop => ({
    stop_code: stop.stop_code,
    stop_id: stop.stop_id,
    stop_name: stop.stop_name
  }));
}

// returns a list of all routes with their route_short_name, route_id, route_long_name, eg 183, 30046 (internal), "Moody Centre Station/Coquitlam Central Station"
export function getAllRoutes() {
  return Object.values(routeCache).map(route => ({
    route_short_name: route.route_short_name,
    route_id: route.route_id,
    route_long_name: route.route_long_name
  }));
}

// returns future bus times & stop_id for a specific route
export function getRouteTimes(routeId) {
  const times = [];

  const searched_trip_id = tripsCache[routeId].trip_id;

  if (!searched_trip_id) 
    return times;

  // for each trip, find all stop times
  const stopTimes = stopTimesCache.filter(st => st.trip_id === searched_trip_id);

  stopTimes.forEach(stopTime => {
    if (isTimeInFuture(stopTime.arrival_time)) {
      times.push({
        arrival_time: stopTime.arrival_time,
        stop_id: stopTime.stop_id
      });
    }
  });

  return times.sort((a, b) => a.arrival_time.localeCompare(b.arrival_time));
}

// returns future bus times for a specific stop with route information
export function getStopTimes(stopId) {
  const times = [];
  
  // find all stop times for this stop
  const stopTimes = stopTimesCache.filter(st => st.stop_id === stopId);
  
  stopTimes.forEach(stopTime => {
    if (isTimeInFuture(stopTime.arrival_time)) {
      const trip = Object.values(tripsCache).find(t => t.trip_id === stopTime.trip_id);
      if (trip) {
        const route = routeCache[trip.route_id];
        times.push({
          arrival_time: stopTime.arrival_time,
          route_id: trip.route_id,
          route_short_name: route?.route_short_name || null,
          route_long_name: route?.route_long_name || null,
        });
      }
    }
  });
  
  // Sort by arrival time
  return times.sort((a, b) => a.arrival_time.localeCompare(b.arrival_time));
}