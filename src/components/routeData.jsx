import { getStopName, getStopCode, getRouteTimes } from "../translink/translinkStaticData";
import { getNextStopsForBus } from "../translink/translinkAPI";
import { useState, useEffect } from "react";

export function RouteStopPopup({ routeID, busName }) {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setLastUpdated] = useState(Date.now());

  const refresh = async () => {
    setLoading(true);
    // check API first, if nothing is returned, default on static data
    let result = await getNextStopsForBus(routeID);

    // defaulting to static data
    if (!result || result.length === 0) {
      // get today's date, static data doesn't have todays current date, so we just manually add that
      const today = new Date();

      result = getRouteTimes(routeID).map((item) => ({
        arrival_time: new Date(`${today.toISOString().split('T')[0]}T${item.arrival_time}`),
        stop_id: item.stop_id || '',
      }));
    }

    // convert times to date
    result = result.map((r) => ({
      ...r,
      arrival_time:
        r.arrival_time instanceof Date
          ? r.arrival_time
          : new Date(r.arrival_time),
    }));

    setArrivals(result);
    setLastUpdated(Date.now());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => setLastUpdated(Date.now()), 30 * 1000);
    return () => clearInterval(interval);
  }, [routeID]);

  // tells us when the bus comes
  const getCountdown = (arrivalTime) => {
    const diff = Math.round((arrivalTime - Date.now()) / 60000);
    return diff <= 0 ? 'Now' : `in ${diff} min`;
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 overflow-hidden text-white text-sm p-3 space-y-2 min-w-[220px] max-w-[300px]">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-base text-white">{busName}</div>
        </div>
        <button
          onClick={refresh}
          className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-white"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-400">Loading arrivals...</div>}

      {!loading && arrivals.length === 0 && (
        <div className="text-gray-400">No upcoming buses</div>
      )}

      {!loading && arrivals.length > 0 && (
        <div className="space-y-2">
          {arrivals.slice(0, 15).map((arrival, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-700 last:border-0 pb-1"
            >
              <div className="flex flex-col">
                <span className="bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full text-xs inline-block w-fit">
                  {getStopCode(arrival.stop_id)}
                </span>
                <span className="text-gray-400 text-xs truncate max-w-[210px]">
                  {getStopName(arrival.stop_id)}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-white text-sm font-semibold">
                  {arrival.arrival_time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-gray-400 text-xs">
                  {getCountdown(arrival.arrival_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}