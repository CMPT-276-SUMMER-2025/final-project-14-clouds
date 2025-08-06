import * as gtfsRealtimeBindings from 'gtfs-realtime-bindings';

// THIS IS A TEMP SOLUTION, WE WILL NOT HAVE A HARDCODED API KEY IN FINAL VER
const API_KEY = "DkOQ2I9r9TigGG9qoBLU";
const GTFS_REALTIME_URL = `https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${API_KEY}`;

// helper func that gets the GTFS data
async function fetchRealtimeFeed() {
    try {
        const response = await fetch('/api/translinkapi'); //switch GTFS_REALTIME_URL to translinkapi in api folder
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const feed = gtfsRealtimeBindings.transit_realtime.FeedMessage.decode(uint8Array);
        return feed;
    } catch (error) {
        console.error('Error fetching realtime feed:', error);
        return null; // not the best, but we fail gracefully now
    }
}

// returns list of bus times for selected stop, this stopId is the internal id used by translink, not the one on the actual bus stop
// THIS CAN RETURN NOTHING, TRANSLINK API ONLY RETURNS BUSES ON ROUTE
export async function getNextBusesForStop(stopId) {
    try {
        const feed = await fetchRealtimeFeed();
        if (!feed || !feed.entity) {
            console.warn('No realtime feed data available');
            return [];
        }

        const arrivals = [];

        for (const entity of feed.entity) {
            try {
                if (entity.tripUpdate) {
                    const trip = entity.tripUpdate;
                    if (!trip.stopTimeUpdate) continue;
                    
                    for (const stopTime of trip.stopTimeUpdate) {
                        if (stopTime.stopId === stopId) {
                            const arrival = stopTime.arrival || stopTime.departure;
                            if (arrival && arrival.time) {
                                arrivals.push({
                                    route_id: trip.trip?.routeId || 'Unknown',
                                    trip_id: trip.trip?.tripId || 'Unknown',
                                    arrival_time: new Date(arrival.time * 1000)
                                });
                            }
                        }
                    }
                }
            } catch (entityError) {
                // we had a error, just continue on
                console.warn('Error processing entity:', entityError.message);
            }
        }

        arrivals.sort((a, b) => a.arrival_time - b.arrival_time);
        return arrivals;
    } catch (error) {
        console.error('Error getting next buses for stop:', error.message);
        return []; // fail gracefully
    }
}

// returns next bus stops for selected bus, arrival time and stopId, but routeId is the internally used id, not the short name
// THIS CAN RETURN NOTHING, TRANSLINK API ONLY RETURNS NEXT STOPS FOR BUSES ON ROUTE
export async function getNextStopsForBus(targetRouteId) {
    try {
        const feed = await fetchRealtimeFeed();
        if (!feed || !feed.entity) {
            console.warn('No realtime feed data available');
            return [];
        }

        const stops = [];

        for (const entity of feed.entity) {
            try {
                if (entity.tripUpdate) {
                    const trip = entity.tripUpdate;
                    if (!trip.stopTimeUpdate || trip.trip?.routeId !== targetRouteId) {
                        continue;
                    }
                    
                    for (const stopTime of trip.stopTimeUpdate) {
                        const arrival = stopTime.arrival || stopTime.departure;
                        const stopInfo = {
                            stop_id: stopTime.stopId || 'Unknown',
                            arrival_time: arrival && arrival.time ? 
                                new Date(arrival.time * 1000) : null,
                            trip_id: trip.trip?.tripId || 'Unknown'
                        };
                        stops.push(stopInfo);
                    }
                }
            } catch (entityError) {
                console.warn('Error processing entity:', entityError.message);
            }
        }

        stops.sort((a, b) => {
            if (!a.arrival_time) return 1;
            if (!b.arrival_time) return -1;
            return a.arrival_time - b.arrival_time;
        });
        
        return stops;
    } catch (error) {
        console.error('Error getting next stops for bus:', error.message);
        return [];
    }
}
