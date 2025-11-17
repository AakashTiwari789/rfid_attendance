let lastEvent = null;

export function setLastEvent(event) {
  lastEvent = {
    ...event,
    at: new Date().toISOString(),
  };
}

export function getLastEvent() {
  return lastEvent;
}
